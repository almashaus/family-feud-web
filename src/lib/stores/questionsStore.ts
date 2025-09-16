import { GameQuestion } from "@/data/questions";
import { create } from "zustand";

type State = {
  gameQuestions: GameQuestion[];
  setGameQuestions: (questions: GameQuestion[]) => void;
};
export const useQuestionsStore = create<State>((set) => ({
  gameQuestions: [],
  setGameQuestions: (questions: GameQuestion[]) =>
    set({ gameQuestions: questions }),
}));
