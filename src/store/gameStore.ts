import { create } from "zustand";
import type { Game, BoardAnswer, BoardQuestion, GameEvent } from "@/types/game";

interface GameStore {
  game: Game | null;
  question: BoardQuestion | null;
  answers: BoardAnswer[];
  lastEvent: GameEvent | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  setGame: (game: Game) => void;
  patchGame: (changes: Partial<Game>) => void;
  setQuestion: (question: BoardQuestion | null) => void;
  setAnswers: (answers: BoardAnswer[]) => void;
  revealAnswer: (id: number) => void;
  setLastEvent: (event: GameEvent) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  game: null,
  question: null,
  answers: [],
  lastEvent: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setGame: (game) => set({ game }),
  patchGame: (changes) =>
    set((state) => ({ game: state.game ? { ...state.game, ...changes } : null })),
  setQuestion: (question) => set({ question }),
  setAnswers: (answers) => set({ answers }),
  revealAnswer: (id) =>
    set((state) => ({
      answers: state.answers.map((a) => (a.id === id ? { ...a, revealed: true } : a)),
    })),
  setLastEvent: (lastEvent) => set({ lastEvent }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
