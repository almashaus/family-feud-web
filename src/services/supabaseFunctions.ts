import { GameQuestion } from "@/data/questions";
import { supabase } from "./supabase";

export const fetchQuestionsData = async (): Promise<GameQuestion[]> => {
  const { data, error } = await supabase.from("questions").select(`
      id,
      question,
      answers (
        text,
        points,
        revealed
      )
    `);

  const questions: GameQuestion[] = (data ?? []).map((q: any) => ({
    ...q,
    answers: Array.isArray(q.answers)
      ? q.answers.map((a: any) => ({
          text: a.text ?? "",
          points: a.points ?? 0,
          revealed: a.revealed ?? false,
        }))
      : [],
  }));

  return questions;
};

export const fetchData = async (tableName: string): Promise<any> => {
  try {
    const { data, error } = await supabase.from(tableName).select();

    if (data) {
      return data;
    }
  } catch (error) {
    return null;
  }
};

export const updateData = async (
  tableName: string,
  dataObject: object,
  columnName: string | string[],
  condition: any | any[]
): Promise<boolean> => {
  try {
    let query = supabase.from(tableName).update(dataObject);
    if (Array.isArray(columnName) && Array.isArray(condition)) {
      columnName.forEach((col, idx) => {
        query = query.eq(col, condition[idx]);
      });
    } else {
      query = query.eq(columnName as string, condition);
    }
    const { data, error } = await query.select();

    if (error) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

export const deleteData = async (
  tableName: string,
  columnName: string,
  condition: any
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq(columnName, condition)
      .select();

    if (data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
