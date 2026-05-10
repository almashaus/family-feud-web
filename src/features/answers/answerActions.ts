import { supabase } from "@/services/supabase";
import { GameEvents } from "@/realtime/events";

export async function revealAnswer(
  gameId: number,
  answerId: number,
  points: number,
  questionDbId: number
): Promise<boolean> {
  const { error } = await supabase
    .from("answers")
    .update({ revealed: true })
    .eq("id", answerId);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.ANSWER_REVEALED,
    payload: { answerId, points, questionDbId },
  });

  return true;
}

export async function revealAllAnswers(
  gameId: number,
  answerIds: number[],
  questionDbId: number
): Promise<boolean> {
  if (answerIds.length === 0) return true;

  const { error } = await supabase
    .from("answers")
    .update({ revealed: true })
    .in("id", answerIds);

  if (error) return false;

  await supabase.from("game_events").insert({
    game_id: gameId,
    type: GameEvents.ALL_ANSWERS_REVEALED,
    payload: { answerIds, questionDbId },
  });

  return true;
}

export async function resetAnswersForQuestion(
  questionDbId: number
): Promise<boolean> {
  const { error } = await supabase
    .from("answers")
    .update({ revealed: false })
    .eq("question_id", questionDbId);

  return !error;
}

export async function fetchAnswersForQuestion(questionDbId: number) {
  const { data, error } = await supabase
    .from("answers")
    .select("id, text, points, revealed, position")
    .eq("question_id", questionDbId)
    .order("points", { ascending: false });

  if (error) return [];
  return data ?? [];
}
