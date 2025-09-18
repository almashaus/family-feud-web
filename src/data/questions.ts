export interface GameQuestion {
  id: number;
  question: string;
  answers: Array<{
    text: string;
    points: number;
    revealed: boolean;
  }>;
}
