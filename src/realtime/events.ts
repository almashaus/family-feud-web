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
  TEAM_SELECTED: "TEAM_SELECTED",
  QUESTION_REVEALED: "QUESTION_REVEALED",
} as const;

export type GameEventType = (typeof GameEvents)[keyof typeof GameEvents];

// --- Typed payloads — match what each feature action writes into game_events.payload ---

export interface AnswerRevealedPayload {
  answerId: number;
  points: number;
  questionDbId: number;
}

export interface AllAnswersRevealedPayload {
  answerIds: number[];
  questionDbId: number;
}

export interface ScoreUpdatedPayload {
  team: "team_a" | "team_b";
  score: number;
}

export interface StrikePayload {
  strikes: number;
}

export interface RoundChangedPayload {
  nextQuestionDbId: number;
  round: number;
}

export interface GameStartedPayload {
  questionDbId: number;
}

export interface TeamSelectedPayload {
  team: "team_a" | "team_b" | null;
}

export interface QuestionRevealedPayload {
  questionDbId: number;
}

// --- Handler contract — consumed by useGameEvents ---

export interface GameEventHandlers {
  onAnswerRevealed?: (payload: AnswerRevealedPayload) => void;
  onAllAnswersRevealed?: (payload: AllAnswersRevealedPayload) => void;
  onScoreUpdated?: (payload: ScoreUpdatedPayload) => void;
  onStrikeAdded?: (payload: StrikePayload) => void;
  onStrikeRemoved?: (payload: StrikePayload) => void;
  onStrikesReset?: (payload: StrikePayload) => void;
  onRoundChanged?: (payload: RoundChangedPayload) => void;
  onGameStarted?: (payload: GameStartedPayload) => void;
  onGameEnded?: () => void;
  onTeamSelected?: (payload: TeamSelectedPayload) => void;
  onQuestionRevealed?: (payload: QuestionRevealedPayload) => void;
}
