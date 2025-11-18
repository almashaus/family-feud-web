import { useEffect, useState, useCallback, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, XIcon, SquareX, PauseCircle } from "lucide-react";
import FamilyFeudLogo from "/images/FF-logo.png";
import BonaLogo from "/images/BB-logo.png";
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
  onNextQuestion: () => void;
  onEndGame: (gameStarted: boolean, answer: Answer[]) => void;
  onAddStrike: () => void;
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
  onNextQuestion,
  onAddStrike,
  currentRound,
  totalRounds,
  teams,
  teamScores,
  strikes,
  isHost,
  isGameBegin,
}: GameBoardProps) => {
  const [isRevealQuestion, setIsRevealQuestion] = useState(false);
  const [isRevealAnswer, setIsRevealAnswer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [showStrikeIcon, setShowStrikeIcon] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);

  const handleEndGame = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const resetAnswers = answers.map((answer) => ({
        ...answer,
        revealed: false,
      }));
      onEndGame(false, resetAnswers);
    },
    [answers, onEndGame]
  );

  const handleRevealAllAnswer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsRevealAnswer(true);
      onRevealAllAnswer();
    },
    [onRevealAllAnswer]
  );

  const handleOnStrikeClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (strikes < 3) {
      setShowStrikeIcon(true);
      const audio = new window.Audio("/sounds/time-out.mp3");
      audio.play();
      onAddStrike();
      setTimeout(() => setShowStrikeIcon(false), 2000);
    }
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop countdown
  useEffect(() => {
    const shouldRun = isRevealQuestion && !isPaused;

    if (shouldRun) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRevealQuestion, isPaused]);

  // Play sound at 0
  useEffect(() => {
    if (timer === 0) {
      new Audio("/sounds/time-out.mp3").play();
    }
  }, [timer]);

  const Timer = memo(() => {
    const isLastThree = timer <= 5 && timer > 0;
    return (
      <Card
        className={`bg-gradient-board border-gold-border text-primary-foreground border-4 p-2 md:px-8 py-6 shadow-gold flex items-center justify-center ${
          isLastThree ? "animate-pulse bg-red-700 border-red-600" : ""
        } ${timer === 0 ? "bg-strike-red" : ""}`}
      >
        <div className="text-center">
          <h2
            className={`game-board-font md:text-4xl ${
              !isRevealQuestion ? "text-gray-600" : ""
            } ${isLastThree ? "text-red-300 drop-shadow-lg" : ""}`}
          >
            {timer}
          </h2>
        </div>
      </Card>
    );
  });

  const PauseButton = memo(() => (
    <Card
      className={`bg-gradient-primary text-primary-foreground hover:bg-primary-glow p-3 rounded-md border-4 border-gold-border ${
        isRevealQuestion ? "cursor-pointer" : ""
      }
      `}
      onClick={() => {
        if (isRevealQuestion) setIsPaused((prev) => !prev);
      }}
    >
      <PauseCircle
        className={`w-8 h-8 ${
          !isRevealQuestion
            ? "text-gray-600"
            : isPaused
            ? "text-yellow-400"
            : ""
        }`}
      />
    </Card>
  ));

  const NextButton = memo(() => (
    <Card
      className={`bg-gradient-primary text-primary-foreground hover:bg-primary-glow p-3 rounded-md border-4 border-gold-border ${
        currentRound !== totalRounds && "cursor-pointer"
      } `}
      onClick={onNextQuestion}
    >
      <ArrowRight
        className={`w-8 h-8 ${
          currentRound === totalRounds && "text-gray-600"
        } `}
      />
    </Card>
  ));

  return (
    <div className="flex flex-col gap-4 p-2 md:p-4">
      <div className="flex flex-col md:flex-row justify-between">
        <img
          src={FamilyFeudLogo}
          alt="Family Feud Logo"
          className="hidden md:inline w-32 h-14"
        />

        <div className="flex flex-row justify-center items-center align-middle gap-4">
          <PauseButton />
          <Timer />
          <NextButton />
        </div>

        <img
          src={BonaLogo}
          alt="Bona Banana Logo"
          className="hidden md:inline w-28 h-16"
        />
      </div>
      {/* Question Display */}
      <div className="flex flex-col md:flex-row justify-between items-center align-middle space-y-2">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:hidden">
            <Button variant="strike" onClick={handleEndGame}>
              END GAME
            </Button>
          </div>
          <Card className="bg-secondary text-secondary-foreground  game-board-font text-lg px-4 py-1">
            ROUND {currentRound} / {totalRounds}
          </Card>
        </div>
        <Card
          className={`bg-gradient-primary border-gold-border border-4 px-2 md:px-1 py-4 md:mx-8 shadow-board ${
            !isRevealQuestion ? "cursor-pointer" : ""
          }`}
          onClick={() => setIsRevealQuestion(true)}
        >
          <h2
            className={`${
              !isRevealQuestion ? "invisible" : ""
            } game-board-font text-3xl lg:text-4xl text-center text-primary-foreground`}
          >
            {question}
          </h2>
        </Card>
        <div className="hidden md:flex md:flex-col gap-2 ">
          <Button variant="strike" onClick={handleEndGame} className="px-6">
            END GAME
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between items-center gap-3">
          <div className="hidden lg:flex">
            <MemoTeam1
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

          <div className="hidden lg:flex">
            <MemoTeam2
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
            <MemoTeam1
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
                    className={`w-10 h-10 rounded-full border-4 border-gold-border cursor-pointer ${
                      i === strikes ? "hover:border-red-600" : ""
                    }`}
                    onClick={handleOnStrikeClick}
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
            <MemoTeam2
              teams={teams}
              teamScores={teamScores}
              selected={isRevealAnswer ? null : selectedTeam === 2}
              onSelect={() => setSelectedTeam(2)}
            />
          </div>
        </div>
      </div>
      {/* Strike Overlay */}
      {showStrikeIcon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          {[...Array(strikes)].map((_, i) => (
            <SquareX
              key={i}
              className="text-red-600"
              style={{ width: "20vw", height: "20vw" }}
            />
          ))}
        </div>
      )}
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

const Team1 = ({ teams, teamScores, selected, onSelect }: TeamProps) => (
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

const Team2 = ({ teams, teamScores, selected, onSelect }: TeamProps) => (
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

const MemoTeam1 = memo(Team1);
const MemoTeam2 = memo(Team2);
