import { supabase } from "@/services/supabase";
import { GameEvents } from "@/realtime/events";
import type { Game, GameTurn } from "@/types/game";

export function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createGame(
  sessionCode: string,
  teamAName: string,
  teamBName: string
): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games")
    .insert({
      session_code: sessionCode,
      status: "waiting",
      team_a_name: teamAName,
      team_b_name: teamBName,
      team_a_score: 0,
      team_b_score: 0,
      strikes: 0,
    })
    .select()
    .single();

  if (error) return null;
  return data as Game;
}

export async function startGame(
  gameId: number,
  questionDbId: number
): Promise<boolean> {
  const { error } = await supabase
    .from("games")
    .update({ status: "active", current_question_id: questionDbId, strikes: 0 })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.GAME_STARTED,
    payload: { questionDbId },
  });

  return true;
}

export async function nextRound(
  gameId: number,
  nextQuestionDbId: number,
  round: number
): Promise<boolean> {
  const { error } = await supabase
    .from("games")
    .update({ current_question_id: nextQuestionDbId, strikes: 0 })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.ROUND_CHANGED,
    payload: { nextQuestionDbId, round },
  });

  return true;
}

export async function endGame(gameId: number): Promise<boolean> {
  const { error } = await supabase
    .from("games")
    .update({ status: "finished" })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.GAME_ENDED,
    payload: {},
  });

  return true;
}

export async function revealQuestion(
  gameId: number,
  questionDbId: number
): Promise<boolean> {
  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.QUESTION_REVEALED,
    payload: { questionDbId },
  });
  return !error;
}

export async function selectTeam(
  gameId: number,
  team: GameTurn | null
): Promise<boolean> {
  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.TEAM_SELECTED,
    payload: { team },
  });
  return !error;
}

export async function activateStealMode(
  gameId: number,
  stealingTeam: "team_a" | "team_b",
  originalTeam: "team_a" | "team_b",
  roundPoints: number
): Promise<boolean> {
  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.STEAL_MODE_ACTIVATED,
    payload: { stealingTeam, originalTeam, roundPoints },
  });
  return !error;
}

export async function endStealMode(
  gameId: number,
  success: boolean,
  stealingTeam: "team_a" | "team_b"
): Promise<boolean> {
  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.STEAL_MODE_ENDED,
    payload: { success, stealingTeam },
  });
  return !error;
}

export async function fetchGameBySessionCode(
  sessionCode: string
): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("session_code", sessionCode)
    .single();

  if (error) return null;
  return data as Game;
}
