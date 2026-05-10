import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useGameStore } from "@/store/gameStore";
import type { Game, BoardAnswer, BoardQuestion } from "@/types/game";

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
  const store = useGameStore();
  const gameId = store.game?.id;

  // Initial fetch — runs when sessionCode is known
  useEffect(() => {
    if (!sessionCode) {
      store.setError("No session code provided. Use /board?session=CODE");
      return;
    }

    store.setIsLoading(true);
    fetchBoardState(sessionCode).then((data) => {
      if (!data) {
        store.setError("Game not found.");
        store.setIsLoading(false);
        return;
      }
      store.setGame(data.game);
      store.setQuestion(data.question);
      store.setAnswers(data.answers);
      store.setIsLoading(false);
    });

    return () => {
      store.reset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  // Realtime subscriptions — runs once gameId is known
  useEffect(() => {
    if (!sessionCode || !gameId) return;

    const channel = supabase
      .channel(`board:${sessionCode}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        async (payload) => {
          const updated = payload.new as Game;
          const prev = useGameStore.getState().game;
          useGameStore.getState().patchGame(updated);

          // Round changed — fetch new question and reset answers
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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "answers" },
        (payload) => {
          const updated = payload.new as BoardAnswer;
          if (updated.revealed) {
            useGameStore.getState().revealAnswer(updated.id);
          }
        }
      )
      .subscribe((status) => {
        useGameStore.getState().setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, gameId]);
}
