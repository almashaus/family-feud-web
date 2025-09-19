import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { supabase } from "@/services/supabase";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameBoardProps {
  question: string;
  answers: Answer[];
  onRevealAnswer: (
    index: number,
    teamNumber: number,
    isRevealAnswer: boolean
  ) => void;
  onRevealAllAnswer: () => void;
  onEndGame: (gameStarted: boolean, answer: Answer[]) => void;
  currentRound: number;
  totalRounds: number;
  teams: { team1: string; team2: string };
  teamScores: { team1: number; team2: number };
  strikes: number;
  isHost?: boolean;
  isGameBegin: boolean;
}

export const GameBoard = ({
  question,
  answers,
  onRevealAnswer,
  onRevealAllAnswer,
  onEndGame,
  currentRound,
  totalRounds,
  teams,
  teamScores,
  strikes,
  isHost,
  isGameBegin,
}: GameBoardProps) => {
  const [isRevealAnswer, setIsRevealAnswer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);

  const handleEndGame = (e: React.FormEvent) => {
    e.preventDefault();
    const resetAnswers = answers.map((answer) => ({
      ...answer,
      revealed: false,
    }));

    onEndGame(false, resetAnswers);
  };

  const handleRevealAllAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    setIsRevealAnswer(true);
    onRevealAllAnswer();
  };
  return (
    <div className="flex flex-col gap-4 p-2 md:p-4">
      {/* Question Display */}
      <div className="flex flex-col md:flex-row justify-between items-center align-middle space-y-2">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:hidden">
            {/* end game */}
            <Button variant="strike" onClick={handleEndGame}>
              END GAME
            </Button>
            {/* Rounds */}
            <Badge
              variant="secondary"
              className="game-board-font text-lg px-4 py-1"
            >
              ROUND {currentRound} / {totalRounds}
            </Badge>
          </div>
          {/* Timer */}

          <Button
            variant="gold"
            onClick={handleRevealAllAnswer}
            disabled={isRevealAnswer || !isGameBegin}
            style={{ whiteSpace: "pre-line" }}
            className="py-9"
          >
            REVEAL{"\n"}ANSWERS
          </Button>
        </div>
        {/* question */}
        <Card className="bg-gradient-primary border-gold-border border-4 px-2 md:px-16 py-4 shadow-board">
          <h2
            className={` ${
              !isGameBegin && "invisible"
            } game-board-font text-3xl lg:text-4xl text-center text-primary-foreground`}
          >
            {question}
          </h2>
        </Card>
        <div className="hidden md:flex md:flex-col gap-2 mx-3">
          {/* end game */}
          <Button variant="strike" onClick={handleEndGame}>
            END GAME
          </Button>
          {/* Rounds */}
          <Badge
            variant="secondary"
            className="game-board-font text-lg px-4 py-1"
          >
            ROUND {currentRound} / {totalRounds}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Answer Board */}
        <div className="flex justify-between items-center gap-3">
          <div className=" hidden lg:flex">
            <Team1
              teams={teams}
              teamScores={teamScores}
              selected={isRevealAnswer ? null : selectedTeam === 1}
              onSelect={() => setSelectedTeam(1)}
            />
          </div>

          <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-3 md:p-4 shadow-board ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {(Array.isArray(answers) ? answers : []).map((answer, index) => (
                <AnswerSlot
                  key={index}
                  number={index + 1}
                  answer={answer}
                  onReveal={() =>
                    onRevealAnswer(index, selectedTeam, isRevealAnswer)
                  }
                  isHost={isHost}
                  isGameBegin={isGameBegin}
                  selectedTeam={selectedTeam}
                />
              ))}
            </div>
          </div>

          <div className=" hidden lg:flex">
            <Team2
              teams={teams}
              teamScores={teamScores}
              selected={isRevealAnswer ? null : selectedTeam === 2}
              onSelect={() => setSelectedTeam(2)}
            />
          </div>
        </div>

        {/* Score and Strikes Display */}
        <div className="flex justify-between lg:justify-center items-center w-full max-w-4xl">
          <div className="flex lg:hidden">
            <Team1
              teams={teams}
              teamScores={teamScores}
              selected={isRevealAnswer ? null : selectedTeam === 1}
              onSelect={() => setSelectedTeam(1)}
            />
          </div>
          <Card className="bg-gradient-primary border-gold-border border-4 px-2 md:px-6 py-2 ">
            <div className="text-center">
              <h3 className="game-board-font text-xl text-primary-foreground">
                STRIKES
              </h3>
              <div className="flex gap-2 justify-center mt-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-4 border-gold-border"
                  >
                    {i < strikes && (
                      <XIcon
                        className="text-red-600 w-8 h-8 reveal-animation"
                        strokeWidth={5}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex lg:hidden">
            <Team2
              teams={teams}
              teamScores={teamScores}
              selected={isRevealAnswer ? null : selectedTeam === 2}
              onSelect={() => setSelectedTeam(2)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnswerSlotProps {
  number: number;
  answer: Answer;
  onReveal: () => void;
  isHost: boolean;
  isGameBegin: boolean;
  selectedTeam: 1 | 2 | null;
}

const AnswerSlot = ({
  number,
  answer,
  onReveal,
  isHost,
  isGameBegin,
  selectedTeam,
}: AnswerSlotProps) => {
  const { toast } = useToast();
  const handleNotReveal = () => {
    if (!selectedTeam && isGameBegin) {
      toast({
        title: "Warning",
        description: "Please select a team",
        variant: "warning",
        duration: 2000,
      });
    }
  };
  return (
    <div
      className={`
        relative h-20 min-w-80 border-4 border-primary-foreground rounded-xl overflow-hidden
        ${
          answer.revealed
            ? "bg-gradient-primary shadow-glow-answer"
            : "bg-gradient-answer"
        }
        ${
          isHost && !answer.revealed && isGameBegin
            ? "cursor-pointer hover:bg-answer-revealed transition-colors"
            : ""
        }
      `}
      onClick={
        isHost && !answer.revealed && isGameBegin && selectedTeam
          ? onReveal
          : handleNotReveal
      }
    >
      {answer.revealed ? (
        <div className="flex items-center justify-between h-full px-6 reveal-animation">
          <span className="game-board-font text-lg lg:text-2xl text-primary-foreground uppercase">
            {answer.text}
          </span>
          <div className="bg-gold-border text-secondary-foreground rounded-full w-12 h-12 flex items-center justify-center ms-2">
            <span className="game-board-font text-md lg:text-xl">
              {answer.points}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center border-4 border-gold-border shadow-gold">
            <span className="game-board-font text-3xl">{number}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface TeamProps {
  teams: { team1: string; team2: string };
  teamScores: { team1: number; team2: number };
  selected: boolean;
  onSelect: () => void;
}

const Team1 = ({ teams, teamScores, selected, onSelect }: TeamProps) => {
  return (
    <Card
      className={`${
        selected ? "bg-gradient-gold" : "bg-gradient-board"
      } border-gold-border text-primary-foreground border-4 p-2 md:p-6 shadow-gold cursor-pointer`}
      onClick={onSelect}
    >
      <div className="text-center">
        <h3 className="game-board-font md:text-2xl">{teams.team1}</h3>
        <p className="game-board-font md:text-4xl">{teamScores.team1}</p>
      </div>
    </Card>
  );
};

const Team2 = ({ teams, teamScores, selected, onSelect }: TeamProps) => {
  return (
    <Card
      className={`${
        selected ? "bg-gradient-gold" : "bg-gradient-board"
      } border-gold-border text-primary-foreground border-4 p-2 md:p-6 shadow-gold cursor-pointer`}
      onClick={onSelect}
    >
      <div className="text-center">
        <h3 className="game-board-font md:text-2xl">{teams.team2}</h3>
        <p className="game-board-font md:text-4xl">{teamScores.team2}</p>
      </div>
    </Card>
  );
};
