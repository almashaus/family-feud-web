export const GameEvents = {
  ANSWER_REVEALED: "ANSWER_REVEALED",
  SCORE_UPDATED: "SCORE_UPDATED",
  STRIKE_ADDED: "STRIKE_ADDED",
  STRIKE_REMOVED: "STRIKE_REMOVED",
  STRIKES_RESET: "STRIKES_RESET",
  ROUND_CHANGED: "ROUND_CHANGED",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  ALL_ANSWERS_REVEALED: "ALL_ANSWERS_REVEALED",
} as const;

export type GameEventType = (typeof GameEvents)[keyof typeof GameEvents];

export interface GameEvent {
  type: GameEventType;
  payload: Record<string, unknown>;
  gameId?: string;
  timestamp: number;
}
