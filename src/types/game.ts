export interface GameQuestion {
  id: number;
  dbId?: number;
  question: string;
  answers: Array<{
    id?: number;
    text: string;
    points: number;
    revealed: boolean;
    position: number;
  }>;
}

export interface BoardAnswer {
  id: number;
  text: string;
  points: number;
  revealed: boolean;
  position: number;
}

export interface BoardQuestion {
  id: number;
  question: string;
  question_number: number;
}

// --- Multiplayer DB types (Phase 2+) ---

export type GameStatus = "waiting" | "active" | "finished";
export type GameTurn = "team_a" | "team_b";

export interface Game {
  id: number;
  session_code: string;
  current_question_id: number | null;
  team_a_score: number;
  team_b_score: number;
  team_a_name: string;
  team_b_name: string;
  current_turn: GameTurn;
  status: GameStatus;
  strikes: number;
  created_at: string;
}

export interface GameEvent {
  id: number;
  game_id: number;
  type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}
