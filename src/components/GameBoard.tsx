import { useEffect, useState, useCallback, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, XIcon, SquareX, PauseCircle } from "lucide-react";
import FamilyFeudLogo from "/images/FF-logo.png";
import BonaLogo from "/images/BB-logo.png";
import MiraiLogo from "/images/Mirai-logo.png";
import { useToast } from "@/hooks/use-toast";
import { GameQuestion } from "@/data/questions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameBoardProps {
  question: GameQuestion;
  answers: Answer[];
  onRevealAnswer: (
    index: number,
    teamNumber: number,
    isRevealAnswer: boolean
  ) => void;
  onRevealAnswerEndRound: (index: number) => void;
  onRevealAllAnswer: () => void;
  onLeadPoints: (
    team1Point: number,
    team2Point: number,
    teamNumber: number
  ) => void;
  onStealPoints: (
    team1Point: number,
    team2Point: number,
    teamNumber: number,
    answerIndex: number
  ) => void;
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
  onRevealAnswerEndRound,
  onLeadPoints,
  onStealPoints,
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
  const [determineCounter, setDetermineCounter] = useState<number>(0);
  const [team1Point, setTeam1Point] = useState<number>(null);
  const [team2Point, setTeam2Point] = useState<number>(null);
  const [showStrikeIcon, setShowStrikeIcon] = useState(false);
  const [isStealMode, setIsStealMode] = useState(false);
  const [isStealStrike, setIsStealStrike] = useState(false);
  const [isRevealAllAnswer, setIsRevealAllAnswer] = useState(false);
  const [isRevealAllAnswerEndRound, setIsRevealAllAnswerEndRound] =
    useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (determineCounter >= 2) {
      if (team1Point > team2Point) {
        setSelectedTeam(1);
        onLeadPoints(team1Point, team2Point, 1);
        setTeam1Point(team1Point + team2Point);
        setTeam2Point(0);
      } else {
        setSelectedTeam(2);
        onLeadPoints(team1Point, team2Point, 2);
        setTeam2Point(team1Point + team2Point);
        setTeam1Point(0);
      }
    }
  }, [determineCounter]);

  useEffect(() => {
    if (strikes === 3) {
      setIsStealMode(true);
      if (selectedTeam === 1) {
        setSelectedTeam(2);
      } else {
        setSelectedTeam(1);
      }
    }
  }, [strikes]);

  useEffect(() => {
    if (isStealStrike) {
      setShowStrikeIcon(true);
      setTimeout(() => {
        setShowStrikeIcon(false);
        setDialogOpen(true);
      }, 2000);
      setIsRevealAllAnswerEndRound(true);
    } else if (isRevealAllAnswer) {
      setIsRevealAllAnswerEndRound(true);
      setTimeout(() => {
        setDialogOpen(true);
      }, 2000);
    }
  }, [isStealStrike, isRevealAllAnswer]);

  useEffect(() => {
    if (dialogOpen) {
      setTimeout(() => {
        setDialogOpen(false);
      }, 2000);
    }
  }, [dialogOpen]);

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

  const handleRevealAllAnswer = (e: React.FormEvent) => {
    e.preventDefault();

    setIsRevealAnswer(true);
    onRevealAllAnswer();
  };

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

  const NextButton = memo(() => (
    <Card
      className={`bg-gradient-primary text-primary-foreground hover:bg-primary-glow p-3 rounded-md border-4 border-gold-border ${
        currentRound !== totalRounds && "cursor-pointer"
      } `}
      onClick={() => {
        onNextQuestion();
        setDialogOpen(false);
      }}
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
      <div className="flex flex-col md:flex-row justify-between items-center">
        <img
          src={MiraiLogo}
          alt="Mirai Logo"
          className="hidden md:inline w-32 h-18"
        />

        <div className="flex flex-row justify-center items-center align-middle gap-4">
          <Card
            className="bg-gradient-board border-gold-border text-primary-foreground border-4 p-2 md:px-8 py-6 
          shadow-gold flex items-center justify-center"
          >
            <div className="text-center px-6 md:px-0">
              <h2 className={`game-board-font text-2xl md:text-4xl `}>
                {question.id}
              </h2>
            </div>
          </Card>
          <NextButton />
        </div>

        <img
          src={BonaLogo}
          alt="Bona Banana Logo"
          className="hidden md:inline w-24 h-16"
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
          className={`bg-gradient-primary border-gold-border border-4 px-2 md:px-4 py-4 md:mx-8 xl:px-24 shadow-board ${
            !isRevealQuestion ? "cursor-pointer" : ""
          }`}
          onClick={() => setIsRevealQuestion(true)}
        >
          <h2
            className={`${
              !isRevealQuestion ? "invisible" : ""
            } game-board-font text-3xl lg:text-4xl text-center text-primary-foreground`}
            style={{ whiteSpace: "pre-line" }}
          >
            {question.question.replace(" - ", "\n")}
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
              selected={
                isRevealAllAnswerEndRound
                  ? null
                  : isRevealAnswer
                  ? null
                  : selectedTeam === 1
              }
              onSelect={() => setSelectedTeam(1)}
              isStealMode={isStealMode}
              isStealStrike={isStealStrike}
              setIsStealStrike={setIsStealStrike}
              isWinner={
                isRevealAllAnswerEndRound ? team1Point > team2Point : false
              }
            />
          </div>

          <div
            className={`${
              isRevealAllAnswer || isStealStrike
                ? "bg-gray-200"
                : isStealMode
                ? "bg-red-500"
                : "bg-gradient-board "
            } border-gold-border border-8 rounded-3xl p-3 md:p-4 shadow-board`}
          >
            <div
              className={`grid grid-cols-1 md:grid-cols-2 md:grid-flow-col gap-4`}
              style={{
                gridTemplateRows: `repeat(${Math.ceil(
                  answers.length / 2
                )}, minmax(0, 1fr))`,
              }}
            >
              {(Array.isArray(answers) ? answers : []).map((answer, index) => (
                <AnswerSlot
                  key={index}
                  number={index + 1}
                  answer={answer}
                  onReveal={() => {
                    if (
                      answers.filter((a) => a.revealed).length + 1 ===
                      answers.length
                    ) {
                      setIsRevealAllAnswerEndRound(true);
                    }
                    if (isRevealAllAnswerEndRound) {
                      onRevealAnswerEndRound(index);
                    } else {
                      if (!isStealMode && selectedTeam === 1) {
                        setTeam1Point((prev) => prev + answer.points);
                        if (determineCounter < 2) {
                          setSelectedTeam(2);
                          setDetermineCounter((prev) => prev + 1);
                        }
                      }
                      if (!isStealMode && selectedTeam === 2) {
                        setTeam2Point((prev) => prev + answer.points);
                        if (determineCounter < 2) {
                          setSelectedTeam(1);
                          setDetermineCounter((prev) => prev + 1);
                        }
                      }

                      if (
                        isStealMode &&
                        !isRevealAllAnswer &&
                        selectedTeam === 1
                      ) {
                        onStealPoints(
                          team2Point + answer.points,
                          team2Point,
                          1,
                          index
                        );
                        setTeam1Point(team2Point + answer.points);
                        setTeam2Point(0);
                        setIsRevealAllAnswer(true);
                      } else if (
                        isStealMode &&
                        !isRevealAllAnswer &&
                        selectedTeam === 2
                      ) {
                        onStealPoints(
                          team1Point,
                          team1Point + answer.points,
                          2,
                          index
                        );
                        setTeam1Point(0);
                        setTeam2Point(team1Point + answer.points);
                        setIsRevealAllAnswer(true);
                      }
                      if (!isStealMode && !isRevealAllAnswer) {
                        onRevealAnswer(index, selectedTeam, isRevealAnswer);
                      }
                    }
                  }}
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
              selected={
                isRevealAllAnswerEndRound
                  ? null
                  : isRevealAnswer
                  ? null
                  : selectedTeam === 2
              }
              onSelect={() => setSelectedTeam(2)}
              isStealMode={isStealMode}
              isStealStrike={isStealStrike}
              setIsStealStrike={setIsStealStrike}
              isWinner={
                isRevealAllAnswerEndRound ? team2Point > team1Point : false
              }
            />
          </div>
        </div>

        {/* Score and Strikes Display */}
        <div className="flex justify-between lg:justify-center items-center w-full max-w-4xl">
          <div className="flex lg:hidden">
            <MemoTeam1
              teams={teams}
              teamScores={teamScores}
              selected={
                isRevealAllAnswerEndRound
                  ? null
                  : isRevealAnswer
                  ? null
                  : selectedTeam === 1
              }
              onSelect={() => setSelectedTeam(1)}
              isStealMode={isStealMode}
              isStealStrike={isStealStrike}
              setIsStealStrike={setIsStealStrike}
              isWinner={
                isRevealAllAnswerEndRound ? team1Point > team2Point : false
              }
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
              selected={
                isRevealAllAnswerEndRound
                  ? null
                  : isRevealAnswer
                  ? null
                  : selectedTeam === 2
              }
              onSelect={() => setSelectedTeam(2)}
              isStealMode={isStealMode}
              isStealStrike={isStealStrike}
              setIsStealStrike={setIsStealStrike}
              isWinner={
                isRevealAllAnswerEndRound ? team2Point > team1Point : false
              }
            />
          </div>
        </div>
      </div>
      {/* Strike Overlay */}
      {showStrikeIcon &&
        (isStealStrike ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <SquareX
              className="text-red-600"
              style={{ width: "20vw", height: "20vw" }}
            />
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            {[...Array(strikes)].map((_, i) => (
              <SquareX
                key={i}
                className="text-red-600"
                style={{ width: "20vw", height: "20vw" }}
              />
            ))}
          </div>
        ))}
      {/* show reveal answers */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <span className="text-9xl font-extrabold text-gold-glow">
            REVEAL ANSWER
          </span>
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
          <span
            className="game-board-font text-lg lg:text-2xl text-primary-foreground uppercase"
            style={{ whiteSpace: "pre-line" }}
          >
            {answer.text.replace(" - ", "\n")}
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
  isStealMode: boolean;
  isStealStrike: boolean;
  setIsStealStrike: (boo: boolean) => void;
  isWinner: boolean;
}

const Team1 = ({
  teams,
  teamScores,
  selected,
  onSelect,
  isStealMode,
  isStealStrike,
  setIsStealStrike,
  isWinner,
}: TeamProps) => (
  <Card
    className={`${
      isWinner
        ? "bg-gradient-green"
        : selected
        ? "bg-gradient-gold"
        : "bg-gradient-board"
    } 
    ${
      isStealMode && selected
        ? "shadow-[0_0_80px_rgba(220,38,38,1)] transition-shadow duration-300"
        : "shadow-gold"
    }
    border-gold-border text-primary-foreground border-4 p-2 md:p-6 cursor-pointer`}
    onClick={onSelect}
  >
    <div className="flex flex-col items-center text-center">
      <h3
        className={`game-board-font md:text-2xl ${
          isStealMode && selected ? "text-red-500" : ""
        }`}
      >
        {teams.team1}
      </h3>
      <p className="game-board-font md:text-4xl">{teamScores.team1}</p>

      {isStealMode && selected && (
        <div
          className={`w-10 h-10 rounded-full border-4 border-red-500 cursor-pointer "hover:border-red-600" `}
          onClick={() => setIsStealStrike(true)}
        >
          {isStealStrike && (
            <XIcon
              className="text-red-600 w-8 h-8 reveal-animation"
              strokeWidth={5}
            />
          )}
        </div>
      )}
    </div>
  </Card>
);

const Team2 = ({
  teams,
  teamScores,
  selected,
  onSelect,
  isStealMode,
  isStealStrike,
  setIsStealStrike,
  isWinner,
}: TeamProps) => (
  <Card
    className={`${
      isWinner
        ? "bg-gradient-green"
        : selected
        ? "bg-gradient-gold"
        : "bg-gradient-board"
    }     
    ${
      isStealMode && selected
        ? "shadow-[0_0_80px_rgba(220,38,38,1)] transition-shadow duration-300"
        : "shadow-gold"
    } border-gold-border text-primary-foreground border-4 p-2 md:p-6 cursor-pointer`}
    onClick={onSelect}
  >
    <div className="flex flex-col items-center text-center">
      <h3
        className={`game-board-font md:text-2xl ${
          isStealMode && selected ? "text-red-500" : ""
        }`}
      >
        {teams.team2}
      </h3>
      <p className="game-board-font md:text-4xl">{teamScores.team2}</p>
      {isStealMode && selected && (
        <div
          className={`w-10 h-10 rounded-full border-4 border-red-500 cursor-pointer "hover:border-red-600" `}
          onClick={() => setIsStealStrike(true)}
        >
          {isStealStrike && (
            <XIcon
              className="text-red-600 w-8 h-8 reveal-animation"
              strokeWidth={5}
            />
          )}
        </div>
      )}
    </div>
  </Card>
);

const MemoTeam1 = memo(Team1);
const MemoTeam2 = memo(Team2);
