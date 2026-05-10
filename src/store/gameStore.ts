// Phase 4: Global Zustand game store
// Hydrated from Supabase Realtime events — not from direct React state.
// This will replace the local GameState in FamilyFeudGame once Phase 4 is complete.

import { create } from "zustand";
import type { GameQuestion } from "@/types/game";

interface GameStore {
  sessionCode: string | null;
  currentQuestion: GameQuestion | null;
  teamScores: { team1: number; team2: number };
  strikes: number;
  currentRound: number;
  isConnected: boolean;

  setSessionCode: (code: string) => void;
  setCurrentQuestion: (question: GameQuestion) => void;
  setTeamScores: (scores: { team1: number; team2: number }) => void;
  setStrikes: (strikes: number) => void;
  setCurrentRound: (round: number) => void;
  setIsConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionCode: null,
  currentQuestion: null,
  teamScores: { team1: 0, team2: 0 },
  strikes: 0,
  currentRound: 1,
  isConnected: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setSessionCode: (code) => set({ sessionCode: code }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setTeamScores: (scores) => set({ teamScores: scores }),
  setStrikes: (strikes) => set({ strikes }),
  setCurrentRound: (round) => set({ currentRound: round }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  reset: () => set(initialState),
}));
