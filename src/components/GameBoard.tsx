import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { supabase } from "@/services/supabase";

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameBoardProps {
  question: string;
  answers: Answer[];
  onRevealAnswer: (index: number) => void;
  onEndGame: (gameStarted: boolean, answer: Answer[]) => void;
  teamScores: { team1: number; team2: number };
  strikes: number;
  isHost?: boolean;
  isGameBegin: boolean;
}

export const GameBoard = ({
  question,
  answers,
  onRevealAnswer,
  onEndGame,
  teamScores,
  strikes,
  isHost = false,
}: GameBoardProps) => {
  const [isGameBegin, setIsGameBegin] = useState(false);

  useEffect(() => {
    // 1️⃣ Fetch the initial value of is_game_begin
    const fetchInitialValue = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("is_game_begin")
        .eq("id", 1)
        .single();

      if (!error && data) {
        setIsGameBegin(data.is_game_begin);
      }
    };

    fetchInitialValue();

    // 2️⃣ Subscribe to changes in the settings table
    const channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
        },
        (payload) => {
          console.log("payload", payload.new);
          if (payload.new) {
            setIsGameBegin(payload.new.is_game_begin);
          }
        }
      )
      .subscribe((status) => {
        console.log("Channel status:", status);
      });

    // 3️⃣ Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEndGame = (e: React.FormEvent) => {
    e.preventDefault();
    const resetAnswers = answers.map((answer) => ({
      ...answer,
      revealed: false,
    }));
    // If you need to use resetAnswers, pass it to a handler or set state here.
    onEndGame(false, resetAnswers);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-2 md:p-6">
      {isHost && (
        <div className="bg-red-500 px-8 py-4 rounded-lg">
          <h3 className="text-white game-board-font text-lg">Host</h3>
        </div>
      )}

      {/* Question Display */}
      {isGameBegin && (
        <Card className="bg-gradient-primary border-gold-border border-4 p-8 shadow-board">
          <h2 className="game-board-font text-3xl lg:text-5xl text-center text-primary-foreground">
            {question}
          </h2>
        </Card>
      )}

      {/* Answer Board */}
      <div className="flex justify-between items-center gap-5">
        <Card className="bg-gradient-gold border-primary border-4 p-6 shadow-gold hidden lg:flex">
          <div className="text-center">
            <h3 className="game-board-font text-2xl text-secondary-foreground">
              TEAM 1
            </h3>
            <p className="game-board-font text-4xl text-secondary-foreground">
              {teamScores.team1}
            </p>
          </div>
        </Card>

        <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-3 md:p-8 shadow-board ">
          {!isGameBegin ? (
            <div className="flex justify-center text-center">
              <span className="text-3xl">
                Waiting For Host To Start The Game...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              {(Array.isArray(answers) ? answers : []).map((answer, index) => (
                <AnswerSlot
                  key={index}
                  number={index + 1}
                  answer={answer}
                  onReveal={() => onRevealAnswer(index)}
                  isHost={isHost}
                />
              ))}
            </div>
          )}
        </div>

        <Card className="bg-gradient-gold border-primary border-4 p-6 shadow-gold hidden lg:flex">
          <div className="text-center">
            <h3 className="game-board-font text-2xl text-secondary-foreground">
              TEAM 2
            </h3>
            <p className="game-board-font text-4xl text-secondary-foreground">
              {teamScores.team2}
            </p>
          </div>
        </Card>
      </div>

      {/* Score and Strikes Display */}
      <div className="flex justify-between lg:justify-center items-center w-full max-w-4xl">
        <Card className="bg-gradient-gold border-primary border-4 p-2 md:p-6 shadow-gold lg:hidden flex">
          <div className="text-center">
            <h3 className="game-board-font text-2xl text-secondary-foreground">
              TEAM 1
            </h3>
            <p className="game-board-font text-4xl text-secondary-foreground">
              {teamScores.team1}
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-primary border-gold-border border-4 p-2 md:p-6">
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

        <Card className="bg-gradient-gold border-primary border-4 p-2 md:p-6 shadow-gold lg:hidden flex">
          <div className="text-center">
            <h3 className="game-board-font text-2xl text-secondary-foreground">
              TEAM 2
            </h3>
            <p className="game-board-font text-4xl text-secondary-foreground">
              {teamScores.team2}
            </p>
          </div>
        </Card>
      </div>
      <div className="">
        <Button variant="strike" onClick={handleEndGame}>
          End Game
        </Button>
      </div>
    </div>
  );
};

interface AnswerSlotProps {
  number: number;
  answer: Answer;
  onReveal: () => void;
  isHost: boolean;
}

const AnswerSlot = ({ number, answer, onReveal, isHost }: AnswerSlotProps) => {
  return (
    <div
      className={`
        relative h-20 w-72 md:w-80 border-4 border-primary-foreground rounded-xl overflow-hidden
        ${
          answer.revealed
            ? "bg-gradient-primary shadow-glow-answer"
            : "bg-gradient-answer"
        }
        ${
          isHost && !answer.revealed
            ? "cursor-pointer hover:bg-answer-revealed transition-colors"
            : ""
        }
      `}
      onClick={isHost && !answer.revealed ? onReveal : undefined}
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
      ) : isHost ? (
        <div className="flex items-center justify-center h-full">
          <span className="game-board-font text-lg lg:text-2xl">
            {answer.text}
          </span>
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
