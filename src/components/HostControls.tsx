import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HostControlsProps {
  onGameBegin: (isGameBegin: boolean) => void;
  onAddStrike: () => void;
  onResetStrikes: () => void;
  onNextQuestion: () => void;
  onAwardPoints: (team: 1 | 2, points: number) => void;
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
  currentRound,
  totalRounds,
  isGameBegin,
}: HostControlsProps) => {
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    onGameBegin(true);
  };

  return (
    <div className="md:mx-4">
      <Card className="bg-card border-gold-border border-2 p-6 shadow-answer">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="game-board-font text-2xl text-foreground">
              HOST CONTROLS
            </h3>
            <Badge
              variant="secondary"
              className="game-board-font text-lg px-4 py-2"
            >
              ROUND {currentRound} / {totalRounds}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            <Button
              variant="game"
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
              disabled={!isGameBegin}
            >
              NEXT QUESTION
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
