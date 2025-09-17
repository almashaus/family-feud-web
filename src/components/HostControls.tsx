import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Answer } from "./GameBoard";

interface HostControlsProps {
  onGameBegin: (isGameBegin: boolean) => void;
  onAddStrike: () => void;
  onResetStrikes: () => void;
  onNextQuestion: () => void;
  onAwardPoints: (team: 1 | 2, points: number) => void;
  onEndGame: (gameStarted: boolean, answer: Answer[]) => void;
  answers: Answer[];
  currentRound: number;
  totalRounds: number;
  isGameBegin: boolean;
}

export const HostControls = ({
  onGameBegin,
  onAddStrike,
  onResetStrikes,
  onNextQuestion,
  onAwardPoints,
  onEndGame,
  answers,
  currentRound,
  totalRounds,
  isGameBegin,
}: HostControlsProps) => {
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    onGameBegin(true);
  };

  const handleEndGame = (e: React.FormEvent) => {
    e.preventDefault();
    const resetAnswers = answers.map((answer) => ({
      ...answer,
      revealed: false,
    }));

    onEndGame(false, resetAnswers);
  };
  return (
    <div className="md:mx-4">
      <Card className="bg-card border-gold-border border-2 p-6 shadow-answer">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="green"
              onClick={handleStartGame}
              className="h-12"
              disabled={isGameBegin}
            >
              START GAME
            </Button>

            <Button
              variant="strike"
              onClick={onAddStrike}
              className="h-12"
              disabled={!isGameBegin}
            >
              ADD STRIKE
            </Button>

            <Button
              variant="yellow"
              onClick={onResetStrikes}
              className="h-12"
              disabled={!isGameBegin}
            >
              RESET STRIKES
            </Button>

            <Button
              variant="game"
              onClick={onNextQuestion}
              className="h-12"
              disabled={!isGameBegin || currentRound === totalRounds}
            >
              NEXT QUESTION
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
