import { supabase } from "@/services/supabase";
import { GameEvents } from "@/realtime/events";

export async function updateScore(
  gameId: number,
  team: "team_a" | "team_b",
  score: number
): Promise<boolean> {
  const field = team === "team_a" ? "team_a_score" : "team_b_score";

  const { error } = await supabase
    .from("games")
    .update({ [field]: score })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.SCORE_UPDATED,
    payload: { team, score },
  });

  return true;
}

export async function awardPoints(
  gameId: number,
  team: "team_a" | "team_b",
  currentScore: number,
  points: number
): Promise<boolean> {
  return updateScore(gameId, team, currentScore + points);
}
