import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useGameSubscription } from "@/realtime/subscriptions";
import type { BoardAnswer } from "@/types/game";
import FamilyFeudLogo from "/images/FF-logo.png";
import BonaLogo from "/images/BB-logo.png";

export default function BoardPage() {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("session");

  const { game, question, answers, isLoading, error } = useGameStore();
  const [isRevealQuestion, setIsRevealQuestion] = useState(false);

  useGameSubscription(sessionCode);

  // Reset question reveal when the round changes
  useEffect(() => {
    setIsRevealQuestion(false);
  }, [game?.current_question_id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <p className="game-board-font text-primary-foreground text-xl">{error}</p>
        </Card>
      </div>
    );
  }

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <p className="game-board-font text-primary-foreground text-2xl">Loading...</p>
      </div>
    );
  }

  if (game.status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <img src={FamilyFeudLogo} alt="Family Feud" className="w-40 mx-auto mb-4" />
          <p className="game-board-font text-primary-foreground text-2xl">
            Waiting for host to start...
          </p>
          <p className="game-board-font text-yellow-300 text-lg mt-2">
            Session: {game.session_code}
          </p>
        </Card>
      </div>
    );
  }

  if (game.status === "finished") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <h1 className="game-board-font text-4xl text-primary-foreground mb-4">GAME OVER</h1>
          <div className="flex gap-8 justify-center">
            <div>
              <p className="game-board-font text-primary-foreground text-xl">{game.team_a_name}</p>
              <p className="game-board-font text-4xl text-yellow-300">{game.team_a_score}</p>
            </div>
            <div>
              <p className="game-board-font text-primary-foreground text-xl">{game.team_b_name}</p>
              <p className="game-board-font text-4xl text-yellow-300">{game.team_b_score}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-2 md:p-4">
      <div className="flex flex-col gap-4">

        {/* Top bar: logos + question number */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <img src={FamilyFeudLogo} alt="Family Feud" className="hidden md:inline w-32 h-18" />
          <Card className="bg-gradient-board border-gold-border text-primary-foreground border-4 p-2 md:px-8 py-6 shadow-gold flex items-center justify-center">
            <h2 className="game-board-font text-2xl md:text-4xl">
              {question?.question_number ?? "—"}
            </h2>
          </Card>
          <img src={BonaLogo} alt="Bona Banana Logo" className="hidden md:inline w-24 h-16" />
        </div>

        {/* Question */}
        <div className="flex justify-center">
          <Card
            className={`bg-gradient-primary border-gold-border border-4 px-4 py-4 md:px-24 shadow-board w-full max-w-3xl ${
              !isRevealQuestion ? "cursor-pointer" : ""
            }`}
            onClick={() => setIsRevealQuestion(true)}
          >
            <h2
              className={`${!isRevealQuestion ? "invisible" : ""} game-board-font text-3xl lg:text-4xl text-center text-primary-foreground`}
              style={{ whiteSpace: "pre-line" }}
            >
              {question?.question.replace(" - ", "\n") ?? ""}
            </h2>
          </Card>
        </div>

        {/* Answer grid + team scores */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-between items-center gap-3 w-full max-w-5xl">

            {/* Team A */}
            <div className="hidden lg:flex">
              <TeamCard name={game.team_a_name} score={game.team_a_score} />
            </div>

            {/* Answers */}
            <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-3 md:p-4 shadow-board flex-1">
              <div
                className="grid grid-cols-1 md:grid-cols-2 md:grid-flow-col gap-4"
                style={{ gridTemplateRows: `repeat(${Math.ceil(answers.length / 2)}, minmax(0, 1fr))` }}
              >
                {answers.map((answer, index) => (
                  <AnswerSlot key={answer.id} number={index + 1} answer={answer} />
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="hidden lg:flex">
              <TeamCard name={game.team_b_name} score={game.team_b_score} />
            </div>
          </div>

          {/* Strikes */}
          <div className="flex justify-between lg:justify-center items-center w-full max-w-4xl">
            <div className="flex lg:hidden">
              <TeamCard name={game.team_a_name} score={game.team_a_score} />
            </div>

            <Card className="bg-gradient-primary border-gold-border border-4 px-6 py-2">
              <div className="text-center">
                <h3 className="game-board-font text-xl text-primary-foreground">STRIKES</h3>
                <div className="flex gap-2 justify-center mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-gold-border flex items-center justify-center"
                    >
                      {i < game.strikes && (
                        <XIcon className="text-red-600 w-8 h-8 reveal-animation" strokeWidth={5} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex lg:hidden">
              <TeamCard name={game.team_b_name} score={game.team_b_score} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerSlot({ number, answer }: { number: number; answer: BoardAnswer }) {
  return (
    <div
      className={`
        relative h-20 min-w-80 border-4 border-primary-foreground rounded-xl overflow-hidden
        ${answer.revealed ? "bg-gradient-primary shadow-glow-answer" : "bg-gradient-answer"}
      `}
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
            <span className="game-board-font text-md lg:text-xl">{answer.points}</span>
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
}

function TeamCard({ name, score }: { name: string; score: number }) {
  return (
    <Card className="bg-gradient-board border-gold-border text-primary-foreground border-4 p-2 md:p-6 shadow-gold">
      <div className="flex flex-col items-center text-center">
        <h3 className="game-board-font md:text-2xl">{name}</h3>
        <p className="game-board-font md:text-4xl">{score}</p>
      </div>
    </Card>
  );
}
