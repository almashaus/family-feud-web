import { GameQuestion } from "@/types/game";
import { supabase } from "./supabase";

type RawAnswerRow = {
  id: number;
  text: string | null;
  points: number | null;
  revealed: boolean | null;
  position: number | null;
};

type RawQuestionRow = {
  id: number;
  question: string;
  question_number: number;
  answers: RawAnswerRow[];
};

export const fetchQuestionsData = async (): Promise<GameQuestion[]> => {
  const { data } = await supabase.from("questions").select(`
      id,
      question,
      question_number,
      answers (
        id,
        text,
        points,
        revealed,
        position
      )
    `);

  return (data ?? []).map((q: RawQuestionRow) => ({
    id: q.question_number,
    dbId: q.id,
    question: q.question,
    answers: Array.isArray(q.answers)
      ? q.answers.map((a) => ({
          id: a.id,
          text: a.text ?? "",
          points: a.points ?? 0,
          revealed: a.revealed ?? false,
          position: a.position ?? 0,
        }))
      : [],
  }));
};

export const fetchData = async (
  tableName: string
): Promise<Record<string, unknown>[] | null> => {
  try {
    const { data } = await supabase.from(tableName).select();
    return data ?? null;
  } catch {
    return null;
  }
};

type ConditionValue = string | number | boolean;

export const updateData = async (
  tableName: string,
  dataObject: object,
  columnName: string | string[],
  condition: ConditionValue | ConditionValue[]
): Promise<boolean> => {
  try {
    let query = supabase.from(tableName).update(dataObject);
    if (Array.isArray(columnName) && Array.isArray(condition)) {
      columnName.forEach((col, idx) => {
        query = query.eq(col, condition[idx]);
      });
    } else {
      query = query.eq(columnName as string, condition as ConditionValue);
    }
    const { error } = await query.select();
    return !error;
  } catch {
    return false;
  }
};

export const deleteData = async (
  tableName: string,
  columnName: string,
  condition: ConditionValue
): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from(tableName)
      .delete()
      .eq(columnName, condition)
      .select();
    return data !== null;
  } catch {
    return false;
  }
};
