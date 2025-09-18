import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Answer } from "./GameBoard";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GameQuestion } from "@/data/questions";

interface HostControlsProps {
  onGameBegin: (isGameBegin: boolean, startId?: number, endId?: number) => void;
  onAddStrike: () => void;
  onResetStrikes: () => void;
  onNextQuestion: () => void;
  onAwardPoints: (team: 1 | 2, points: number) => void;
  onEndGame: (gameStarted: boolean, answer: Answer[]) => void;
  answers: Answer[];
  currentRound: number;
  totalRounds: number;
  isGameBegin: boolean;
  questions: GameQuestion[]; // Add this prop for available questions
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
  questions,
}: HostControlsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startId, setStartId] = useState<number | undefined>(undefined);
  const [endId, setEndId] = useState<number | undefined>(undefined);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (startId && endId && startId <= endId) {
      onGameBegin(true, startId, endId);
      setDialogOpen(false);
    }
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
      {/* --------- Alert Dialog -------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-2">
              Select Question Range
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1">Start Question number</label>
              <Select
                value={startId !== undefined ? startId.toString() : ""}
                onValueChange={(v) => setStartId(Number(v))}
              >
                <SelectTrigger className="bg-gradient-primary font-semibold">
                  <SelectValue placeholder="Select start ID" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id.toString()}
                      className="font-semibold"
                    >
                      {q.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">End Question number</label>
              <Select
                value={endId !== undefined ? endId.toString() : ""}
                onValueChange={(v) => setEndId(Number(v))}
              >
                <SelectTrigger className="bg-gradient-primary font-semibold">
                  <SelectValue placeholder="Select end ID" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id.toString()}
                      className={`${startId > q.id && "hidden"} font-semibold`}
                    >
                      {q.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="game"
              disabled={!startId || !endId || startId > endId}
              onClick={handleDialogConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ---------------------------- */}
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
