export interface GameQuestion {
  id: number;
  question: string;
  answers: Array<{
    text: string;
    points: number;
    revealed: boolean;
    position: number;
  }>;
}

// --- Multiplayer DB types (Phase 2) ---

export type GameStatus = "waiting" | "active" | "finished";
export type GameTurn = "team_a" | "team_b";

export interface Game {
  id: number;
  session_code: string;
  current_question_id: number | null;
  team_a_score: number;
  team_b_score: number;
  current_turn: GameTurn;
  status: GameStatus;
  created_at: string;
}

export interface GameEvent {
  id: number;
  game_id: number;
  type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}
