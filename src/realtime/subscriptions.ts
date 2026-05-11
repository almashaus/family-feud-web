import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { getGameChannel } from "@/realtime/channels";
import { useGameStore } from "@/store/gameStore";
import type { Game, BoardAnswer, BoardQuestion, GameEvent } from "@/types/game";

async function fetchBoardState(sessionCode: string) {
  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("session_code", sessionCode)
    .single();

  if (error || !game) return null;

  if (!game.current_question_id) {
    return { game: game as Game, question: null, answers: [] as BoardAnswer[] };
  }

  const [{ data: question }, { data: answers }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, question, question_number")
      .eq("id", game.current_question_id)
      .single(),
    supabase
      .from("answers")
      .select("id, text, points, revealed, position")
      .eq("question_id", game.current_question_id)
      .order("points", { ascending: false }),
  ]);

  return {
    game: game as Game,
    question: (question ?? null) as BoardQuestion | null,
    answers: (answers ?? []) as BoardAnswer[],
  };
}

async function fetchQuestionWithAnswers(questionId: number) {
  const [{ data: question }, { data: answers }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, question, question_number")
      .eq("id", questionId)
      .single(),
    supabase
      .from("answers")
      .select("id, text, points, revealed, position")
      .eq("question_id", questionId)
      .order("points", { ascending: false }),
  ]);

  return {
    question: (question ?? null) as BoardQuestion | null,
    answers: (answers ?? []) as BoardAnswer[],
  };
}

export function useGameSubscription(sessionCode: string | null) {
  // Targeted selector — only re-renders when game id changes, not on every store mutation
  const gameId = useGameStore((s) => s.game?.id);

  // Initial board state fetch — runs when sessionCode is first known
  useEffect(() => {
    const { setError, setIsLoading, setGame, setQuestion, setAnswers, reset } =
      useGameStore.getState();

    if (!sessionCode) {
      setError("No session code provided. Use /board?session=CODE");
      return;
    }

    setIsLoading(true);
    fetchBoardState(sessionCode).then((data) => {
      if (!data) {
        useGameStore.getState().setError("Game not found.");
        useGameStore.getState().setIsLoading(false);
        return;
      }
      setGame(data.game);
      setQuestion(data.question);
      setAnswers(data.answers);
      useGameStore.getState().setIsLoading(false);
    });

    return () => {
      reset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  // Realtime subscriptions — set up once gameId is known from the initial fetch
  useEffect(() => {
    if (!sessionCode || !gameId) return;

    const channel = getGameChannel(sessionCode)
      // Game row changes: scores, strikes, status, round
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          const updated = payload.new as Game;
          const prev = useGameStore.getState().game;
          useGameStore.getState().patchGame(updated);

          // Round changed — fetch the new question + its answers
          if (
            prev &&
            updated.current_question_id !== prev.current_question_id &&
            updated.current_question_id
          ) {
            const { question, answers } = await fetchQuestionWithAnswers(
              updated.current_question_id
            );
            useGameStore.getState().setQuestion(question);
            useGameStore.getState().setAnswers(answers);
          }
        }
      )
      // Answer row changes: granular reveal updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "answers",
        },
        (payload) => {
          const updated = payload.new as BoardAnswer;
          if (updated.revealed) {
            useGameStore.getState().revealAnswer(updated.id);
          }
        }
      )
      // Game events: semantic event stream — drives animations and sounds (Phases 6–8)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_events",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const event = payload.new as GameEvent;
          useGameStore.getState().setLastEvent(event);
        }
      )
      .subscribe((status) => {
        const connected = status === "SUBSCRIBED";
        useGameStore.getState().setIsConnected(connected);

        if (status === "CHANNEL_ERROR") {
          useGameStore
            .getState()
            .setError("Realtime connection error. Please refresh the page.");
        } else if (status === "TIMED_OUT") {
          useGameStore
            .getState()
            .setError("Connection timed out. Please refresh the page.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, gameId]);
}
