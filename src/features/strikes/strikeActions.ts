import { supabase } from "@/services/supabase";
import { GameEvents } from "@/realtime/events";

export async function addStrike(
  gameId: number,
  currentStrikes: number
): Promise<boolean> {
  if (currentStrikes >= 3) return false;

  const newStrikes = currentStrikes + 1;
  const { error } = await supabase
    .from("games")
    .update({ strikes: newStrikes })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.STRIKE_ADDED,
    payload: { strikes: newStrikes },
  });

  return true;
}

export async function removeStrike(
  gameId: number,
  currentStrikes: number
): Promise<boolean> {
  if (currentStrikes <= 0) return false;

  const newStrikes = currentStrikes - 1;
  const { error } = await supabase
    .from("games")
    .update({ strikes: newStrikes })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.STRIKE_REMOVED,
    payload: { strikes: newStrikes },
  });

  return true;
}

export async function resetStrikes(gameId: number): Promise<boolean> {
  const { error } = await supabase
    .from("games")
    .update({ strikes: 0 })
    .eq("id", gameId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.STRIKES_RESET,
    payload: { strikes: 0 },
  });

  return true;
}
