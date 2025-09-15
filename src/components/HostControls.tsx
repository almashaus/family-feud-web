import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HostControlsProps {
  onNewGame: () => void;
  onAddStrike: () => void;
  onResetStrikes: () => void;
  onNextQuestion: () => void;
  onAwardPoints: (team: 1 | 2, points: number) => void;
  currentRound: number;
  totalRounds: number;
}

export const HostControls = ({
  onNewGame,
  onAddStrike,
  onResetStrikes,
  onNextQuestion,
  onAwardPoints,
  currentRound,
  totalRounds,
}: HostControlsProps) => {
  return (
    <Card className="bg-card border-gold-border border-2 p-6 shadow-answer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="game-board-font text-2xl text-foreground">HOST CONTROLS</h3>
          <Badge variant="secondary" className="game-board-font text-lg px-4 py-2">
            ROUND {currentRound} / {totalRounds}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="game" 
            onClick={onNewGame}
            className="h-12"
          >
            NEW GAME
          </Button>
          
          <Button 
            variant="strike" 
            onClick={onAddStrike}
            className="h-12"
          >
            ADD STRIKE
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onResetStrikes}
            className="h-12"
          >
            RESET STRIKES
          </Button>
          
          <Button 
            variant="game" 
            onClick={onNextQuestion}
            className="h-12"
          >
            NEXT QUESTION
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Award Points:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Team 1</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(1, 10)}
                >
                  +10
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(1, 25)}
                >
                  +25
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(1, 50)}
                >
                  +50
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Team 2</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(2, 10)}
                >
                  +10
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(2, 25)}
                >
                  +25
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAwardPoints(2, 50)}
                >
                  +50
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};