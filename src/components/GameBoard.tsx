import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Answer {
  text: string;
  points: number;
  revealed: boolean;
}

interface GameBoardProps {
  question: string;
  answers: Answer[];
  onRevealAnswer: (index: number) => void;
  teamScores: { team1: number; team2: number };
  strikes: number;
  isHost?: boolean;
}

export const GameBoard = ({
  question,
  answers,
  onRevealAnswer,
  teamScores,
  strikes,
  isHost = false,
}: GameBoardProps) => {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      {/* Question Display */}
      <Card className="bg-gradient-primary border-gold-border border-4 p-8 shadow-board">
        <h2 className="game-board-font text-4xl md:text-6xl text-center text-primary-foreground">
          {question}
        </h2>
      </Card>

      {/* Answer Board */}
      <div className="">
        <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-8 shadow-board sparkle-bg w-[700px]">
          <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {answers.map((answer, index) => (
              <AnswerSlot
                key={index}
                number={index + 1}
                answer={answer}
                onReveal={() => onRevealAnswer(index)}
                isHost={isHost}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Score and Strikes Display */}
      <div className="flex justify-between items-center w-full max-w-4xl">
        <Card className="bg-gradient-gold border-primary border-4 p-6 shadow-gold">
          <div className="text-center">
            <h3 className="game-board-font text-2xl text-secondary-foreground">
              TEAM 1
            </h3>
            <p className="game-board-font text-4xl text-secondary-foreground">
              {teamScores.team1}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-primary border-gold-border border-4 p-6">
          <div className="text-center">
            <h3 className="game-board-font text-xl text-primary-foreground">
              STRIKES
            </h3>
            <div className="flex gap-2 justify-center mt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-4 ${
                    i < strikes
                      ? "bg-strike-red border-strike-red shadow-glow-answer"
                      : "border-gold-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-gold border-primary border-4 p-6 shadow-gold">
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
        relative h-20 border-4 border-primary-foreground rounded-xl overflow-hidden
        ${
          answer.revealed
            ? "bg-gradient-answer shadow-glow-answer"
            : "bg-answer-slot"
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
          <span className="game-board-font text-2xl text-primary-foreground uppercase">
            {answer.text}
          </span>
          <div className="bg-gold-border text-secondary-foreground rounded-full w-12 h-12 flex items-center justify-center">
            <span className="game-board-font text-xl">{answer.points}</span>
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
