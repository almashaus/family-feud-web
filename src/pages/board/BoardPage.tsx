import { useState, useEffect, useRef, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { XIcon, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useGameSubscription } from "@/realtime/subscriptions";
import { useGameEvents } from "@/realtime/useGameEvents";
import { animateAnswerReveal } from "@/animations/reveal";
import {
  animateRoundOut,
  animateRoundIn,
  animateGameStart,
} from "@/animations/reveal";
import { animateStrike } from "@/animations/strike";
import { animateScoreUpdate } from "@/animations/score";
import { soundManager } from "@/audio";
import { usePresence } from "@/realtime/usePresence";
import type { BoardAnswer, GameStatus } from "@/types/game";
import FamilyFeudLogo from "/images/FF-logo.png";
import BonaLogo from "/images/BB-logo.png";

export default function BoardPage() {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get("session");

  // Selective subscriptions — each re-renders this component only when its own slice changes
  const game = useGameStore((s) => s.game);
  const question = useGameStore((s) => s.question);
  const answers = useGameStore((s) => s.answers);
  const isLoading = useGameStore((s) => s.isLoading);
  const error = useGameStore((s) => s.error);
  const isConnected = useGameStore((s) => s.isConnected);

  const [isRevealQuestion, setIsRevealQuestion] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [flashTeam, setFlashTeam] = useState<"team_a" | "team_b" | null>(null);
  const [flashStrikeIndex, setFlashStrikeIndex] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<"team_a" | "team_b" | null>(
    null,
  );
  const [connectionLost, setConnectionLost] = useState(false);
  const [showStrikeOverlay, setShowStrikeOverlay] = useState(false);
  const [stealMode, setStealMode] = useState(false);
  const [stealingTeam, setStealingTeam] = useState<"team_a" | "team_b" | null>(
    null,
  );
  const connectionLostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const strikeOverlayRef = useRef<HTMLDivElement>(null);
  const prevStrikes = useRef<number | undefined>();

  // Board-level ref for round transitions and game-start entrance
  const boardRef = useRef<HTMLDivElement>(null);
  // Track previous status to detect waiting → active transition
  const prevStatus = useRef<GameStatus | undefined>();
  // Track previous question id to fire round-in animation after new data loads
  const prevQuestionId = useRef<number | undefined>();
  // Coordinate round-out / round-in across two independent subscriptions.
  // Either the game_events INSERT or the games UPDATE can arrive first; these
  // refs ensure animateRoundIn only runs after animateRoundOut has fired.
  const roundOutCalled = useRef(false);
  const roundInPending = useRef(false);

  const handleSoundToggle = () => {
    soundManager.toggleSound();
    setSoundOn(soundManager.isSoundOn());
  };

  useGameSubscription(sessionCode);
  const { hostOnline } = usePresence(sessionCode, "board");

  // Preload all sounds after mount so they're ready when events fire.
  useEffect(() => {
    soundManager.preloadAll();
  }, []);

  useGameEvents({
    onAnswerRevealed: () => {
      soundManager.playReveal();
      // Animation handled inside AnswerSlot via useEffect on answer.revealed
    },
    onAllAnswersRevealed: () => {
      soundManager.playReveal();
      // Individual AnswerSlot animations cover each reveal; no extra action needed
    },
    onScoreUpdated: ({ team }) => {
      setFlashTeam(team);
      // Score number animation handled inside TeamCard via useEffect on score prop
    },
    onStrikeAdded: ({ strikes }) => {
      setFlashStrikeIndex(strikes - 1);
      soundManager.playStrike();
    },
    onStrikeRemoved: () => setFlashStrikeIndex(null),
    onStrikesReset: () => setFlashStrikeIndex(null),
    onStealModeActivated: ({ stealingTeam: team }) => {
      setStealMode(true);
      setStealingTeam(team);
      soundManager.playStrike();
    },
    onStealModeEnded: () => {
      setStealMode(false);
      setStealingTeam(null);
    },
    onRoundChanged: () => {
      setIsRevealQuestion(false);
      setFlashStrikeIndex(null);
      setStealMode(false);
      setStealingTeam(null);
      roundOutCalled.current = true;
      if (boardRef.current) {
        const tween = animateRoundOut(boardRef.current);
        if (roundInPending.current) {
          // Question data already arrived before this event; chain the in-animation.
          tween.then(() => {
            if (boardRef.current) animateRoundIn(boardRef.current);
          });
          roundInPending.current = false;
          roundOutCalled.current = false;
        }
      }
    },
    onGameStarted: () => {
      // GSAP entrance handled by useEffect on game.status to ensure board DOM is mounted
    },
    onGameEnded: () => {
      soundManager.playWin();
      // The finished screen is a separate render path; no board animation needed
    },
    onTeamSelected: ({ team }) => {
      setSelectedTeam(team);
    },
    onQuestionRevealed: () => {
      setIsRevealQuestion(true);
    },
  });

  // Show "connection lost" banner after 15 s of being disconnected (only if game is loaded)
  useEffect(() => {
    if (connectionLostTimerRef.current) {
      clearTimeout(connectionLostTimerRef.current);
      connectionLostTimerRef.current = null;
    }
    if (!isConnected && game) {
      connectionLostTimerRef.current = setTimeout(
        () => setConnectionLost(true),
        15000,
      );
    } else {
      setConnectionLost(false);
    }
    return () => {
      if (connectionLostTimerRef.current)
        clearTimeout(connectionLostTimerRef.current);
    };
  }, [isConnected, game]);

  // Auto-clear flash states once their CSS transition completes
  useEffect(() => {
    if (!flashTeam) return;
    const t = setTimeout(() => setFlashTeam(null), 700);
    return () => clearTimeout(t);
  }, [flashTeam]);

  useEffect(() => {
    if (flashStrikeIndex === null) return;
    const t = setTimeout(() => setFlashStrikeIndex(null), 600);
    return () => clearTimeout(t);
  }, [flashStrikeIndex]);

  // Show overlay whenever strikes increases — fires at the same time as the small X icon
  useEffect(() => {
    const current = game?.strikes ?? 0;
    if (prevStrikes.current !== undefined && current > prevStrikes.current) {
      setShowStrikeOverlay(true);
    }
    prevStrikes.current = current;
  }, [game?.strikes]);

  useEffect(() => {
    if (!showStrikeOverlay || !strikeOverlayRef.current) return;
    animateStrike(strikeOverlayRef.current);
    const t = setTimeout(() => setShowStrikeOverlay(false), 1500);
    return () => clearTimeout(t);
  }, [showStrikeOverlay]);

  // Game-start board entrance — fires once when status transitions waiting → active
  useEffect(() => {
    if (!game) return;
    if (
      game.status === "active" &&
      prevStatus.current !== undefined &&
      prevStatus.current !== "active" &&
      boardRef.current
    ) {
      animateGameStart(boardRef.current);
    }
    prevStatus.current = game.status;
  }, [game?.status]);

  // Round-in animation — fires after new question data loads following a round change.
  // Defers to onRoundChanged if the games UPDATE arrived first (before game_events INSERT).
  useEffect(() => {
    if (!question) return;
    if (
      prevQuestionId.current !== undefined &&
      prevQuestionId.current !== question.id
    ) {
      if (roundOutCalled.current && boardRef.current) {
        animateRoundIn(boardRef.current);
        roundOutCalled.current = false;
      } else {
        // Round-out hasn't fired yet; let onRoundChanged trigger the in-animation.
        roundInPending.current = true;
      }
    }
    prevQuestionId.current = question.id;
  }, [question?.id]);

  // Reset question reveal on round change (covers initial load + direct navigation)
  useEffect(() => {
    setIsRevealQuestion(false);
  }, [game?.current_question_id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <p className="game-board-font text-primary-foreground text-xl">
            {error}
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <p className="game-board-font text-primary-foreground text-2xl">
          Loading...
        </p>
      </div>
    );
  }

  if (game.status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <img
            src={FamilyFeudLogo}
            alt="Family Feud"
            className="w-40 mx-auto mb-4"
          />
          <p className="game-board-font text-primary-foreground text-2xl">
            Waiting for host to start...
          </p>
          <p className="game-board-font text-yellow-300 text-lg mt-2">
            Session: {game.session_code}
          </p>
          <p className="game-board-font text-sm mt-3">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? "bg-green-400" : "bg-gray-500"}`}
            />
            <span className={isConnected ? "text-green-400" : "text-gray-400"}>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </p>
        </Card>
      </div>
    );
  }

  if (game.status === "finished") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex flex-col m-8 items-center">
        {/* Foreground images */}
        <div className="flex flex-col justify-center items-center space-y-4 mt-20 mb-8 z-10 relative">
          <img
            src={FamilyFeudLogo}
            alt="Family Feud Logo"
            className="max-w-64 md:max-w-xs h-auto object-cover"
          />

          <img
            src={BonaLogo}
            alt="Bona Banana Logo"
            className="w-24 object-cover "
          />
        </div>
        <Card className="bg-gradient-board border-gold-border border-4 p-8 text-center shadow-board">
          <h1 className="game-board-font text-4xl text-primary-foreground mb-4">
            GAME OVER
          </h1>
          <div className="flex gap-8 justify-center">
            <div>
              <p className="game-board-font text-primary-foreground text-xl">
                {game.team_a_name}
              </p>
              <p className="game-board-font text-4xl text-yellow-300">
                {game.team_a_score}
              </p>
            </div>
            <div>
              <p className="game-board-font text-primary-foreground text-xl">
                {game.team_b_name}
              </p>
              <p className="game-board-font text-4xl text-yellow-300">
                {game.team_b_score}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-2 md:p-4">
      {/* Floating sound toggle — must be clicked once to unlock browser audio autoplay */}
      <button
        onClick={handleSoundToggle}
        className="fixed bottom-4 right-4 z-40 bg-gradient-board border-gold-border border-2 rounded-full w-12 h-12 flex items-center justify-center shadow-board hover:scale-110 transition-transform"
        title={soundOn ? "Mute sound" : "Enable sound"}
      >
        {soundOn ? (
          <Volume2 className="text-yellow-300 w-6 h-6" />
        ) : (
          <VolumeX className="text-gray-400 w-6 h-6" />
        )}
      </button>

      {showStrikeOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40">
          <div ref={strikeOverlayRef}>
            <XIcon
              className="text-red-600 w-64 h-64 md:w-96 md:h-96"
              strokeWidth={6}
              style={{ filter: "drop-shadow(0 0 40px rgba(220,38,38,0.9))" }}
            />
          </div>
        </div>
      )}
      {connectionLost && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-700 text-white text-center py-2 game-board-font text-sm">
          Connection lost — please refresh the page
        </div>
      )}
      <div ref={boardRef} className="flex flex-col gap-4">
        {/* Top bar: logos + question number */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <img
            src={FamilyFeudLogo}
            alt="Family Feud"
            className="hidden md:inline w-32 h-18"
          />
          <Card className="bg-gradient-board border-gold-border text-primary-foreground border-4 px-8 py-5 shadow-gold flex items-center justify-center">
            <h2 className="game-board-font text-3xl md:text-4xl">
              {question?.question_number ?? "—"}
            </h2>
          </Card>
          <div className="hidden md:flex flex-col items-center gap-1">
            <img src={BonaLogo} alt="Bona Banana Logo" className="w-24 h-16" />
            <span className="game-board-font text-xs">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-1 ${hostOnline ? "bg-green-400" : "bg-gray-500"}`}
              />
              <span className={hostOnline ? "text-green-400" : "text-gray-400"}>
                {hostOnline ? "HOST ONLINE" : "HOST OFFLINE"}
              </span>
            </span>
            <span className="game-board-font text-xs">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? "bg-green-400" : "bg-yellow-400"}`}
              />
              <span
                className={isConnected ? "text-green-400" : "text-yellow-400"}
              >
                {isConnected ? "Connected" : "Reconnecting..."}
              </span>
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="flex justify-center">
          <Card
            className={`bg-gradient-primary border-gold-border border-4 px-4 py-4 md:px-24 shadow-board ${
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

        {/* Steal mode banner */}
        {stealMode && stealingTeam && game && (
          <div className="flex justify-center">
            <div className="bg-red-800/90 border-4 border-red-500 rounded-2xl px-8 py-3 shadow-board animate-pulse">
              <p className="game-board-font text-white text-2xl md:text-3xl text-center tracking-[0.25em] uppercase">
                STEAL MODE
              </p>
            </div>
          </div>
        )}

        {/* Answer grid + team scores */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-between items-center gap-3">
            {/* Team A — desktop */}
            <div className="hidden lg:flex">
              <TeamCard
                name={game.team_a_name}
                score={game.team_a_score}
                isFlashing={flashTeam === "team_a"}
                isSelected={selectedTeam === "team_a"}
                isStealing={stealMode && stealingTeam === "team_a"}
              />
            </div>

            {/* Answers */}
            <div className="bg-gradient-board border-gold-border border-8 rounded-3xl p-3 md:p-4 shadow-board flex-1">
              <div
                className="grid grid-cols-1 md:grid-cols-2 md:grid-flow-col gap-4"
                style={{
                  gridTemplateRows: `repeat(${Math.ceil(answers.length / 2)}, minmax(0, 1fr))`,
                }}
              >
                {answers.map((answer, index) => (
                  <AnswerSlot
                    key={answer.id}
                    number={index + 1}
                    answer={answer}
                  />
                ))}
              </div>
            </div>

            {/* Team B — desktop */}
            <div className="hidden lg:flex">
              <TeamCard
                name={game.team_b_name}
                score={game.team_b_score}
                isFlashing={flashTeam === "team_b"}
                isSelected={selectedTeam === "team_b"}
                isStealing={stealMode && stealingTeam === "team_b"}
              />
            </div>
          </div>

          {/* Strikes + mobile team scores */}
          <div className="flex justify-between lg:justify-center items-center w-full max-w-4xl">
            <div className="flex lg:hidden">
              <TeamCard
                name={game.team_a_name}
                score={game.team_a_score}
                isFlashing={flashTeam === "team_a"}
                isSelected={selectedTeam === "team_a"}
                isStealing={stealMode && stealingTeam === "team_a"}
              />
            </div>

            <Card className="bg-gradient-primary border-gold-border border-4 px-6 py-2">
              <div className="text-center">
                <h3 className="game-board-font text-xl text-primary-foreground">
                  STRIKES
                </h3>
                <div className="flex gap-2 justify-center mt-2">
                  {[...Array(3)].map((_, i) => (
                    <StrikeIndicator
                      key={i}
                      active={i < game.strikes}
                      isFlashing={flashStrikeIndex === i}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex lg:hidden">
              <TeamCard
                name={game.team_b_name}
                score={game.team_b_score}
                isFlashing={flashTeam === "team_b"}
                isSelected={selectedTeam === "team_b"}
                isStealing={stealMode && stealingTeam === "team_b"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AnswerSlot = memo(function AnswerSlot({
  number,
  answer,
}: {
  number: number;
  answer: BoardAnswer;
}) {
  const revealedRef = useRef<HTMLDivElement>(null);
  // Track previous revealed state to only animate the false → true transition
  const wasRevealed = useRef(answer.revealed);

  useEffect(() => {
    if (answer.revealed && !wasRevealed.current && revealedRef.current) {
      animateAnswerReveal(revealedRef.current);
    }
    wasRevealed.current = answer.revealed;
  }, [answer.revealed]);

  return (
    <div
      className={`
        relative h-20 min-w-80 border-4 border-primary-foreground rounded-xl overflow-hidden
        ${answer.revealed ? "bg-gradient-primary shadow-glow-answer" : "bg-gradient-answer"}
      `}
    >
      {answer.revealed ? (
        <div
          ref={revealedRef}
          className="flex items-center justify-between h-full px-6"
        >
          <span
            className="game-board-font text-lg lg:text-xl text-primary-foreground uppercase"
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
});

const StrikeIndicator = memo(function StrikeIndicator({
  active,
  isFlashing,
}: {
  active: boolean;
  isFlashing: boolean;
}) {
  return (
    <div
      className={`w-10 h-10 rounded-full border-4 border-gold-border flex items-center justify-center transition-transform duration-300 ${
        isFlashing ? "scale-125" : ""
      }`}
    >
      {active && <XIcon className="text-red-600 w-8 h-8" strokeWidth={5} />}
    </div>
  );
});

const TeamCard = memo(function TeamCard({
  name,
  score,
  isFlashing = false,
  isSelected = false,
  isStealing = false,
}: {
  name: string;
  score: number;
  isFlashing?: boolean;
  isSelected?: boolean;
  isStealing?: boolean;
}) {
  const scoreRef = useRef<HTMLParagraphElement>(null);
  // null sentinel means "first render" — skip animation on initial mount
  const prevScore = useRef<number | null>(null);

  useEffect(() => {
    if (
      prevScore.current !== null &&
      score !== prevScore.current &&
      scoreRef.current
    ) {
      animateScoreUpdate(scoreRef.current);
    }
    prevScore.current = score;
  }, [score]);

  return (
    <Card
      className={`text-primary-foreground border-4 p-2 md:p-6 shadow-gold transition-all  ${
        isStealing
          ? "bg-red-900/80 border-red-500 ring-4 ring-red-500 animate-pulse"
          : isSelected
            ? "bg-gradient-gold border-gold-border"
            : "bg-gradient-board border-gold-border"
      } ${isFlashing ? "ring-4 ring-yellow-300 scale-105" : ""}`}
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="game-board-font md:text-2xl">{name}</h3>
        <p ref={scoreRef} className="game-board-font md:text-4xl">
          {score}
        </p>
      </div>
    </Card>
  );
});
