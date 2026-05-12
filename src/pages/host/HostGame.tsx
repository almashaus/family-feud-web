import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, XIcon, Copy, Check, Undo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchQuestionsData } from "@/services/supabaseFunctions";
import type { GameQuestion, Game } from "@/types/game";
import {
  createGame,
  startGame,
  nextRound,
  endGame,
  generateSessionCode,
  selectTeam,
  revealQuestion,
  activateStealMode,
  endStealMode,
} from "@/features/game";
import {
  revealAnswer,
  resetAnswersForQuestion,
  fetchAnswersForQuestion,
} from "@/features/answers";
import { updateScore, awardPoints } from "@/features/scores";
import { addStrike, removeStrike, resetStrikes } from "@/features/strikes";
import { usePresence } from "@/realtime/usePresence";
import { cn } from "@/lib/utils";

type Phase = "setup" | "active" | "finished";

interface LocalAnswer {
  id: number;
  text: string;
  points: number;
  revealed: boolean;
  position: number;
}

export default function HostGame() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [allQuestions, setAllQuestions] = useState<GameQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<GameQuestion[]>(
    [],
  );
  const [game, setGame] = useState<Game | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);

  // Setup form state
  const [teamAName, setTeamAName] = useState("Heroes");
  const [teamBName, setTeamBName] = useState("Champions");
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Score inputs
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [selectedTeam, setSelectedTeam] = useState<"team_a" | "team_b" | null>(
    null,
  );

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roundInput, setRoundInput] = useState("1");

  // Steal mode state
  const [stealMode, setStealMode] = useState(false);
  const [stealingTeam, setStealingTeam] = useState<"team_a" | "team_b" | null>(
    null,
  );
  const [originalTeam, setOriginalTeam] = useState<"team_a" | "team_b" | null>(
    null,
  );
  const [roundPoints, setRoundPoints] = useState(0);

  // Face-off state
  const [faceOffMode, setFaceOffMode] = useState(false);
  const [faceOffFirstTeam, setFaceOffFirstTeam] = useState<
    "team_a" | "team_b" | null
  >(null);
  const [faceOffRevealedAnswers, setFaceOffRevealedAnswers] = useState<
    { team: "team_a" | "team_b"; answer: LocalAnswer }[]
  >([]);

  useEffect(() => {
    fetchQuestionsData().then((qs) => {
      const sorted = [...qs].sort((a, b) => a.id - b.id);
      setAllQuestions(sorted);
    });
  }, []);

  const currentQuestion = filteredQuestions[currentIndex] ?? null;

  const loadAnswers = useCallback(async (question: GameQuestion) => {
    if (!question.dbId) return;
    const data = await fetchAnswersForQuestion(question.dbId);
    setAnswers(data as LocalAnswer[]);
  }, []);

  useEffect(() => {
    if (currentQuestion) loadAnswers(currentQuestion);
  }, [currentQuestion, loadAnswers]);

  useEffect(() => {
    if (currentQuestion) setRoundInput(String(currentQuestion.id));
  }, [currentIndex, currentQuestion]);

  const handleCreate = async () => {
    const sId = startId ? parseInt(startId) : null;
    const eId = endId ? parseInt(endId) : null;

    let filtered = allQuestions;
    if (sId && eId && sId <= eId) {
      filtered = allQuestions.filter((q) => q.id >= sId && q.id <= eId);
    }

    if (filtered.length === 0) {
      toast({
        title: "No questions found in that range",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const code = generateSessionCode();
    const newGame = await createGame(
      code,
      teamAName.trim() || "Team A",
      teamBName.trim() || "Team B",
    );

    if (!newGame) {
      toast({ title: "Failed to create game", variant: "destructive" });
      setIsCreating(false);
      return;
    }

    await Promise.all(
      filtered
        .filter((q) => q.dbId)
        .map((q) => resetAnswersForQuestion(q.dbId!)),
    );

    const firstQuestion = filtered[0];
    await startGame(newGame.id, firstQuestion.dbId!);

    setFilteredQuestions(filtered);
    setGame({ ...newGame, team_a_score: 0, team_b_score: 0, strikes: 0 });
    setCurrentIndex(0);
    setScoreA(0);
    setScoreB(0);
    setFaceOffMode(true);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
    setPhase("active");
    setIsCreating(false);
  };

  const handleRevealAnswer = async (answer: LocalAnswer) => {
    if (!game || answer.revealed) return;
    setIsLoading(true);

    if (faceOffMode && faceOffFirstTeam && faceOffRevealedAnswers.length < 2) {
      const secondTeam: "team_a" | "team_b" =
        faceOffFirstTeam === "team_a" ? "team_b" : "team_a";
      const currentFaceOffTeam =
        faceOffRevealedAnswers.length === 0 ? faceOffFirstTeam : secondTeam;

      const ok = await revealAnswer(
        game.id,
        answer.id,
        answer.points,
        currentQuestion!.dbId!,
      );
      if (ok) {
        setAnswers((prev) =>
          prev.map((a) => (a.id === answer.id ? { ...a, revealed: true } : a)),
        );
        const newRevealed = [
          ...faceOffRevealedAnswers,
          { team: currentFaceOffTeam, answer },
        ];
        setFaceOffRevealedAnswers(newRevealed);

        if (newRevealed.length === 2) {
          const aEntry = newRevealed.find((r) => r.team === "team_a")!;
          const bEntry = newRevealed.find((r) => r.team === "team_b")!;
          const winner: "team_a" | "team_b" =
            aEntry.answer.points >= bEntry.answer.points ? "team_a" : "team_b";
          const totalPoints = aEntry.answer.points + bEntry.answer.points;
          const currentScore = winner === "team_a" ? scoreA : scoreB;
          const newScore = currentScore + totalPoints;
          if (winner === "team_a") {
            setScoreA(newScore);
            setGame((g) => g && { ...g, team_a_score: newScore });
          } else {
            setScoreB(newScore);
            setGame((g) => g && { ...g, team_b_score: newScore });
          }
          await awardPoints(game.id, winner, currentScore, totalPoints);
          await selectTeam(game.id, winner);
          setSelectedTeam(winner);
          setFaceOffMode(false);
          setFaceOffFirstTeam(null);
          setFaceOffRevealedAnswers([]);
        }
      }
      setIsLoading(false);
      return;
    }

    const ok = await revealAnswer(
      game.id,
      answer.id,
      answer.points,
      currentQuestion!.dbId!,
    );
    if (ok) {
      setAnswers((prev) =>
        prev.map((a) => (a.id === answer.id ? { ...a, revealed: true } : a)),
      );

      if (stealMode && stealingTeam && originalTeam) {
        // Steal successful — transfer accumulated round points + this answer's points
        const currentStealScore = stealingTeam === "team_a" ? scoreA : scoreB;
        const currentOriginalScore =
          originalTeam === "team_a" ? scoreA : scoreB;
        const totalSteal = roundPoints + answer.points;
        const newStealScore = currentStealScore + totalSteal;
        const newOriginalScore = Math.max(
          0,
          currentOriginalScore - roundPoints,
        );

        if (stealingTeam === "team_a") {
          setScoreA(newStealScore);
          setGame((g) => g && { ...g, team_a_score: newStealScore });
        } else {
          setScoreB(newStealScore);
          setGame((g) => g && { ...g, team_b_score: newStealScore });
        }
        if (originalTeam === "team_a") {
          setScoreA(newOriginalScore);
          setGame((g) => g && { ...g, team_a_score: newOriginalScore });
        } else {
          setScoreB(newOriginalScore);
          setGame((g) => g && { ...g, team_b_score: newOriginalScore });
        }

        await awardPoints(game.id, stealingTeam, currentStealScore, totalSteal);
        await updateScore(game.id, originalTeam, newOriginalScore);
        await endStealMode(game.id, true, stealingTeam);
        await selectTeam(game.id, null);

        setSelectedTeam(null);
        setStealMode(false);
        setStealingTeam(null);
        setOriginalTeam(null);
        setRoundPoints(0);
      } else if (selectedTeam) {
        const currentScore = selectedTeam === "team_a" ? scoreA : scoreB;
        const newScore = currentScore + answer.points;
        if (selectedTeam === "team_a") {
          setScoreA(newScore);
          setGame((g) => g && { ...g, team_a_score: newScore });
        } else {
          setScoreB(newScore);
          setGame((g) => g && { ...g, team_b_score: newScore });
        }
        await awardPoints(game.id, selectedTeam, currentScore, answer.points);
      }
    }
    setIsLoading(false);
  };

  const handleRevealQuestion = async () => {
    if (!game || !currentQuestion?.dbId) return;
    setIsLoading(true);
    await revealQuestion(game.id, currentQuestion.dbId);
    setIsLoading(false);
  };

  const handleAddStrike = async () => {
    if (!game) return;

    if (stealMode) {
      // Failed steal — add 1 strike to the stealing team's count and exit steal mode
      const ok = await addStrike(game.id, game.strikes);
      if (ok) setGame((g) => g && { ...g, strikes: g.strikes + 1 });
      await endStealMode(game.id, false, stealingTeam!);
      await selectTeam(game.id, null);
      setSelectedTeam(null);
      setStealMode(false);
      setStealingTeam(null);
      setOriginalTeam(null);
      setRoundPoints(0);
      return;
    }

    const ok = await addStrike(game.id, game.strikes);
    if (ok) {
      const newStrikes = game.strikes + 1;
      setGame((g) => g && { ...g, strikes: newStrikes });

      // Auto-trigger steal mode when 3rd strike is reached and a team has possession
      if (newStrikes >= 3 && selectedTeam) {
        const other: "team_a" | "team_b" =
          selectedTeam === "team_a" ? "team_b" : "team_a";
        const pts = answers
          .filter((a) => a.revealed)
          .reduce((sum, a) => sum + a.points, 0);

        await resetStrikes(game.id);
        setGame((g) => g && { ...g, strikes: 0 });

        await selectTeam(game.id, other);
        setSelectedTeam(other);

        await activateStealMode(game.id, other, selectedTeam, pts);

        setStealMode(true);
        setStealingTeam(other);
        setOriginalTeam(selectedTeam);
        setRoundPoints(pts);
      }
    }
  };

  const handleUndoStrike = async () => {
    if (!game) return;
    const ok = await removeStrike(game.id, game.strikes);
    if (ok) setGame((g) => g && { ...g, strikes: Math.max(0, g.strikes - 1) });
  };

  const handleCancelSteal = async () => {
    if (!game || !stealingTeam) return;
    await endStealMode(game.id, false, stealingTeam);
    await selectTeam(game.id, null);
    setSelectedTeam(null);
    setStealMode(false);
    setStealingTeam(null);
    setOriginalTeam(null);
    setRoundPoints(0);
  };

  const handleScoreAChange = async (val: number) => {
    if (!game) return;
    setScoreA(val);
    await updateScore(game.id, "team_a", val);
    setGame((g) => g && { ...g, team_a_score: val });
  };

  const handleScoreBChange = async (val: number) => {
    if (!game) return;
    setScoreB(val);
    await updateScore(game.id, "team_b", val);
    setGame((g) => g && { ...g, team_b_score: val });
  };

  const handleNext = async () => {
    if (!game || currentIndex >= filteredQuestions.length - 1) return;
    const nextIndex = currentIndex + 1;
    const nextQ = filteredQuestions[nextIndex];

    setIsLoading(true);
    const ok = await nextRound(game.id, nextQ.dbId!, nextIndex + 1);
    if (!ok) {
      toast({ title: "Failed to advance round", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    await resetStrikes(game.id);
    setGame((g) => g && { ...g, current_question_id: nextQ.dbId!, strikes: 0 });
    setCurrentIndex(nextIndex);
    setSelectedTeam(null);
    await selectTeam(game.id, null);
    setStealMode(false);
    setStealingTeam(null);
    setOriginalTeam(null);
    setRoundPoints(0);
    setFaceOffMode(true);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (!game || currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    const prevQ = filteredQuestions[prevIndex];

    setIsLoading(true);
    const ok = await nextRound(game.id, prevQ.dbId!, prevIndex + 1);
    if (!ok) {
      toast({
        title: "Failed to go to previous round",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    await resetStrikes(game.id);
    setGame((g) => g && { ...g, current_question_id: prevQ.dbId!, strikes: 0 });
    setCurrentIndex(prevIndex);
    setSelectedTeam(null);
    await selectTeam(game.id, null);
    setStealMode(false);
    setStealingTeam(null);
    setOriginalTeam(null);
    setRoundPoints(0);
    setFaceOffMode(true);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
    setIsLoading(false);
  };

  const handleGoToRound = async (targetIndex: number) => {
    if (!game) return;
    if (targetIndex === currentIndex) return;
    if (targetIndex < 0 || targetIndex >= filteredQuestions.length) {
      setRoundInput(String(currentIndex + 1));
      return;
    }
    const targetQ = filteredQuestions[targetIndex];
    setIsLoading(true);
    const ok = await nextRound(game.id, targetQ.dbId!, targetIndex + 1);
    if (!ok) {
      toast({ title: "Failed to go to that round", variant: "destructive" });
      setRoundInput(String(currentIndex + 1));
      setIsLoading(false);
      return;
    }
    await resetStrikes(game.id);
    setGame(
      (g) => g && { ...g, current_question_id: targetQ.dbId!, strikes: 0 },
    );
    setCurrentIndex(targetIndex);
    setSelectedTeam(null);
    await selectTeam(game.id, null);
    setStealMode(false);
    setStealingTeam(null);
    setOriginalTeam(null);
    setRoundPoints(0);
    setFaceOffMode(true);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
    setIsLoading(false);
  };

  const handleEndGame = async () => {
    if (!game) return;
    const ok = await endGame(game.id);
    if (!ok) {
      toast({ title: "Failed to end game", variant: "destructive" });
      return;
    }
    setPhase("finished");
  };

  const handleSelectTeam = async (team: "team_a" | "team_b") => {
    if (!game) return;
    const next = selectedTeam === team ? null : team;
    setSelectedTeam(next);
    const ok = await selectTeam(game.id, next);
    if (!ok) {
      setSelectedTeam(selectedTeam);
    }
  };

  const handleNewGame = () => {
    setPhase("setup");
    setGame(null);
    setAnswers([]);
    setCurrentIndex(0);
    setScoreA(0);
    setScoreB(0);
    setSelectedTeam(null);
    setTeamAName("Heroes");
    setTeamBName("Champions");
    setStartId("");
    setEndId("");
    setStealMode(false);
    setStealingTeam(null);
    setOriginalTeam(null);
    setRoundPoints(0);
    setFaceOffMode(false);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
  };

  const handleFaceOffBuzz = (team: "team_a" | "team_b") => {
    if (!faceOffMode || faceOffFirstTeam) return;
    setFaceOffFirstTeam(team);
  };

  const handleSkipFaceOff = () => {
    setFaceOffMode(false);
    setFaceOffFirstTeam(null);
    setFaceOffRevealedAnswers([]);
  };

  const { boardCount } = usePresence(game?.session_code ?? null, "host");

  const boardUrl = game
    ? `${window.location.origin}/board?session=${game.session_code}`
    : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center p-4">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 w-full max-w-md shadow-board">
          <h1 className="game-board-font text-3xl text-primary-foreground text-center mb-6">
            HOST SETUP
          </h1>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-primary-foreground game-board-font md:text-lg">
                  Team A
                </Label>
                <Input
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="bg-muted border-gold-border border-2 h-12 text-lg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-primary-foreground game-board-font md:text-lg">
                  Team B
                </Label>
                <Input
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="bg-muted border-gold-border border-2 h-12 text-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-primary-foreground game-board-font md:text-lg">
                Question Range (optional)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder={`From (1–${allQuestions.length})`}
                  value={startId}
                  onChange={(e) => setStartId(e.target.value)}
                  type="number"
                  className="bg-muted text-primary-foreground border-gold-border border-2 h-12 text-lg"
                />
                <Input
                  placeholder={`To (1–${allQuestions.length})`}
                  value={endId}
                  onChange={(e) => setEndId(e.target.value)}
                  type="number"
                  className="bg-muted text-primary-foreground border-gold-border border-2 h-12 text-lg"
                />
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full game-board-font md:text-lg text-primary-foreground font-bold py-6 tracking-wider pulse-glow"
              onClick={handleCreate}
              disabled={isCreating || allQuestions.length === 0}
            >
              {isCreating ? "Creating..." : "CREATE GAME"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="game"
                className="w-full border-gold-border border-2 game-board-font text-sm py-6 tracking-wide"
                onClick={() => navigate("/host/view-questions")}
              >
                VIEW ALL QUESTIONS
              </Button>

              <Button
                variant="green"
                className="w-full border-gold-border game-board-font text-sm py-6 tracking-wide"
                onClick={() => navigate("/host/add-question")}
              >
                ADD NEW QUESTION
              </Button>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/")}
                variant="link"
                className="text-lg text-muted-foreground gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg flex items-center justify-center p-4">
        <Card className="bg-gradient-board border-gold-border border-4 p-8 w-full max-w-md shadow-board text-center">
          <h1 className="game-board-font text-3xl text-primary-foreground mb-4">
            GAME OVER
          </h1>
          <p className="text-primary-foreground game-board-font text-xl mb-2">
            {game?.team_a_name}: {scoreA}
          </p>
          <p className="text-primary-foreground game-board-font text-xl mb-6">
            {game?.team_b_name}: {scoreB}
          </p>
          <Button
            className="bg-gradient-primary border-gold-border border-2 game-board-font"
            onClick={handleNewGame}
          >
            NEW GAME
          </Button>
        </Card>
      </div>
    );
  }

  const faceOffActiveTeam: "team_a" | "team_b" | null =
    faceOffMode && faceOffFirstTeam && faceOffRevealedAnswers.length < 2
      ? faceOffRevealedAnswers.length === 0
        ? faceOffFirstTeam
        : faceOffFirstTeam === "team_a"
          ? "team_b"
          : "team_a"
      : null;

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-3">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Header: session + board URL */}
        <Card className="bg-gradient-board border-gold-border border-4 p-3 shadow-gold">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-col items-start gap-0.5">
              <span className="game-board-font text-primary-foreground text-lg">
                SESSION:{" "}
                <span className="text-yellow-300">{game?.session_code}</span>
              </span>
              <span className="game-board-font text-xs text-green-400">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1 ${boardCount > 0 ? "bg-green-400" : "bg-gray-500"}`}
                />
                {boardCount} {boardCount === 1 ? "board" : "boards"} connected
              </span>
            </div>
            <div className="flex items-center gap-2 w-2/3">
              <Input
                readOnly
                value={boardUrl}
                className="bg-primary text-primary-foreground border-gold-border border-2 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="border-gold-border shrink-0"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              variant="strike"
              size="sm"
              onClick={handleEndGame}
              className="shrink-0 border-2"
            >
              END GAME
            </Button>
          </div>
        </Card>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            className={cn(
              "flex flex-col items-center border-4 p-3 shadow-gold cursor-pointer transition-all duration-200 select-none",
              faceOffMode && faceOffFirstTeam === "team_a"
                ? "bg-blue-950 border-blue-200"
                : faceOffMode
                  ? "bg-gradient-board border-blue-600"
                  : stealMode && originalTeam === "team_a"
                    ? "bg-red-950 border-red-500"
                    : stealMode && stealingTeam === "team_a"
                      ? "bg-gradient-gold border-yellow-300"
                      : selectedTeam === "team_a"
                        ? "bg-gradient-gold border-gold-border"
                        : "bg-gradient-board border-gold-border",
            )}
            onClick={() =>
              faceOffMode && !faceOffFirstTeam
                ? handleFaceOffBuzz("team_a")
                : !faceOffMode
                  ? handleSelectTeam("team_a")
                  : undefined
            }
          >
            {faceOffMode && !faceOffFirstTeam && (
              <p className="game-board-font text-blue-400 text-xs tracking-widest mb-1 animate-pulse">
                TAP TO BUZZ
              </p>
            )}
            {faceOffMode &&
              faceOffFirstTeam === "team_a" &&
              !faceOffRevealedAnswers.some((r) => r.team === "team_a") && (
                <p className="game-board-font text-blue-300 text-xs tracking-widest mb-1">
                  BUZZED IN ✓
                </p>
              )}
            {stealMode && originalTeam === "team_a" && (
              <p className="game-board-font text-red-400 text-xs tracking-widest mb-1">
                STEALING FROM
              </p>
            )}
            <p className="game-board-font text-primary-foreground text-center mb-1">
              {game?.team_a_name}
            </p>
            <input
              type="number"
              value={scoreA}
              onChange={(e) =>
                handleScoreAChange(parseInt(e.target.value) || 0)
              }
              onClick={(e) => e.stopPropagation()}
              className="game-board-font text-3xl text-center w-1/3 min-w-24 bg-transparent text-primary-foreground border-2 border-gold-border rounded-lg"
            />
            {faceOffMode &&
              faceOffRevealedAnswers.some((r) => r.team === "team_a") && (
                <p className="game-board-font text-yellow-300 text-xs text-center mt-1 leading-tight">
                  {
                    faceOffRevealedAnswers.find((r) => r.team === "team_a")
                      ?.answer.text
                  }{" "}
                  <span className="text-green-400">
                    {
                      faceOffRevealedAnswers.find((r) => r.team === "team_a")
                        ?.answer.points
                    }
                    pts
                  </span>
                </p>
              )}
          </Card>
          <Card
            className={cn(
              "flex flex-col items-center border-4 p-3 shadow-gold cursor-pointer transition-all duration-200 select-none",
              faceOffMode && faceOffFirstTeam === "team_b"
                ? "bg-blue-950 border-blue-200"
                : faceOffMode
                  ? "bg-gradient-board border-blue-600"
                  : stealMode && originalTeam === "team_b"
                    ? "bg-red-950 border-red-500"
                    : stealMode && stealingTeam === "team_b"
                      ? "bg-gradient-gold border-yellow-300"
                      : selectedTeam === "team_b"
                        ? "bg-gradient-gold border-gold-border"
                        : "bg-gradient-board border-gold-border",
            )}
            onClick={() =>
              faceOffMode && !faceOffFirstTeam
                ? handleFaceOffBuzz("team_b")
                : !faceOffMode
                  ? handleSelectTeam("team_b")
                  : undefined
            }
          >
            {faceOffMode && !faceOffFirstTeam && (
              <p className="game-board-font text-blue-400 text-xs tracking-widest mb-1 animate-pulse">
                TAP TO BUZZ
              </p>
            )}
            {faceOffMode &&
              faceOffFirstTeam === "team_b" &&
              !faceOffRevealedAnswers.some((r) => r.team === "team_b") && (
                <p className="game-board-font text-blue-300 text-xs tracking-widest mb-1">
                  BUZZED IN ✓
                </p>
              )}
            {stealMode && originalTeam === "team_b" && (
              <p className="game-board-font text-red-400 text-xs tracking-widest mb-1">
                STEALING FROM
              </p>
            )}
            <p className="game-board-font text-primary-foreground text-center mb-1">
              {game?.team_b_name}
            </p>
            <input
              type="number"
              value={scoreB}
              onChange={(e) =>
                handleScoreBChange(parseInt(e.target.value) || 0)
              }
              onClick={(e) => e.stopPropagation()}
              className="game-board-font text-3xl text-center w-1/3 min-w-24 bg-transparent text-primary-foreground border-2 border-gold-border rounded-lg"
            />
            {faceOffMode &&
              faceOffRevealedAnswers.some((r) => r.team === "team_b") && (
                <p className="game-board-font text-yellow-300 text-xs text-center mt-1 leading-tight">
                  {
                    faceOffRevealedAnswers.find((r) => r.team === "team_b")
                      ?.answer.text
                  }{" "}
                  <span className="text-green-400">
                    {
                      faceOffRevealedAnswers.find((r) => r.team === "team_b")
                        ?.answer.points
                    }
                    pts
                  </span>
                </p>
              )}
          </Card>
        </div>

        {/* Round navigation + question */}
        <Card className="bg-gradient-board border-gold-border border-4 p-3 shadow-gold">
          <div className="flex items-center justify-between mb-2">
            <Button
              size="sm"
              variant="outline"
              className="border-gold-border"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="game-board-font text-primary-foreground flex items-center gap-2">
              ROUND
              <input
                type="number"
                value={roundInput}
                onChange={(e) => setRoundInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(roundInput);
                  const idx = filteredQuestions.findIndex((q) => q.id === n);
                  if (idx !== -1) handleGoToRound(idx);
                  else setRoundInput(String(currentQuestion?.id ?? ""));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n = parseInt(roundInput);
                    const idx = filteredQuestions.findIndex((q) => q.id === n);
                    if (idx !== -1) handleGoToRound(idx);
                    else setRoundInput(String(currentQuestion?.id ?? ""));
                    e.currentTarget.blur();
                  }
                }}
                disabled={isLoading}
                className="game-board-font text-primary-foreground text-center bg-transparent border-2 border-gold-border rounded-lg w-14 h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-gold-border"
              onClick={handleNext}
              disabled={
                currentIndex === filteredQuestions.length - 1 || isLoading
              }
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="game-board-font text-primary-foreground text-center text-lg">
            {currentQuestion?.question}
          </p>
        </Card>

        {/* Answers */}
        <Card className="bg-gradient-board border-gold-border border-4 p-3 shadow-gold">
          <div className="flex items-center justify-between mb-2">
            <h3 className="game-board-font text-primary-foreground">ANSWERS</h3>
            <Button
              size="sm"
              variant="outline"
              className="border-gold-border text-xs"
              onClick={handleRevealQuestion}
              disabled={isLoading}
            >
              REVEAL QUESTION
            </Button>
          </div>
          <div className="space-y-2">
            {answers.map((answer, i) => (
              <div
                key={answer.id}
                className={`flex items-center justify-between rounded-lg px-2 border-2 ${
                  answer.revealed
                    ? "bg-gradient-primary border-gold-border py-4"
                    : "bg-primary/10 border-primary-foreground/30 py-2.5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="game-board-font text-primary-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "game-board-font text-primary-foreground",
                      !answer.revealed && "text-muted-foreground",
                    )}
                  >
                    {answer.text}{" "}
                    <span className="game-board-font text-sm text-yellow-300">
                      {answer.points} pts
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {!answer.revealed && (
                    <Button
                      size="sm"
                      variant="green"
                      className="text-xs h-7 px-3 py-4"
                      onClick={() => handleRevealAnswer(answer)}
                      disabled={
                        isLoading ||
                        (faceOffMode &&
                          (!faceOffFirstTeam ||
                            faceOffRevealedAnswers.length >= 2))
                      }
                    >
                      {faceOffActiveTeam
                        ? `${faceOffActiveTeam === "team_a" ? game?.team_a_name : game?.team_b_name}'S ANS`
                        : "REVEAL"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Face-Off / Strikes / Steal Mode */}
        <Card
          className={cn(
            "border-4 p-3",
            faceOffMode
              ? "bg-blue-950 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              : stealMode
                ? "bg-red-950 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                : "bg-gradient-board border-gold-border shadow-gold",
          )}
        >
          {faceOffMode ? (
            <div className="flex flex-col items-center gap-3">
              <p className="game-board-font text-blue-400 text-xl tracking-[0.3em] uppercase">
                Face-Off
              </p>
              {!faceOffFirstTeam ? (
                <p className="game-board-font text-primary-foreground text-sm text-center">
                  Tap a team card to buzz in first
                </p>
              ) : (
                <p className="game-board-font text-primary-foreground text-sm text-center">
                  Reveal{" "}
                  {faceOffRevealedAnswers.length === 0
                    ? faceOffFirstTeam === "team_a"
                      ? game.team_a_name
                      : game.team_b_name
                    : faceOffFirstTeam === "team_a"
                      ? game.team_b_name
                      : game.team_a_name}
                  's answer from the board above
                </p>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSkipFaceOff}
                disabled={isLoading}
                className="game-board-font text-xs"
              >
                {faceOffFirstTeam ? "CANCEL FACE-OFF" : "SKIP FACE-OFF"}
              </Button>
            </div>
          ) : stealMode ? (
            <div className="flex flex-col items-center gap-3">
              <p className="game-board-font text-red-400 text-xl tracking-[0.3em] uppercase">
                Steal Mode
              </p>
              <p className="game-board-font text-primary-foreground text-sm text-center">
                {stealingTeam === "team_a"
                  ? game.team_a_name
                  : game.team_b_name}{" "}
                — one chance to answer
                {roundPoints > 0 && (
                  <span className="text-yellow-300">
                    {" "}
                    · {roundPoints} pts at stake
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-strike-red hover:bg-strike-red/80 border-0 game-board-font"
                  onClick={handleAddStrike}
                  disabled={isLoading}
                >
                  <XIcon className="w-4 h-4 mr-1" /> FAILED STEAL
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelSteal}
                  disabled={isLoading}
                  className="game-board-font"
                >
                  CANCEL
                </Button>
              </div>
              {/* Strike dots — shows the stealing team's current count (starts at 0) */}
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-4 border-red-500 flex items-center justify-center"
                  >
                    {game && i < game.strikes && (
                      <XIcon className="text-red-500 w-6 h-6" strokeWidth={5} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <span className="game-board-font text-primary-foreground mr-2">
                  STRIKES
                </span>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-4 border-gold-border flex items-center justify-center cursor-pointer"
                    onClick={handleAddStrike}
                  >
                    {game && i < game.strikes && (
                      <XIcon className="text-red-600 w-8 h-8" strokeWidth={5} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 order-2 sm:contents">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleUndoStrike}
                  disabled={!game || game.strikes === 0}
                  className="sm:order-1"
                >
                  <Undo className="w-4 h-4" /> UNDO
                </Button>
                <Button
                  size="sm"
                  className="bg-strike-red hover:bg-strike-red/80 border-0 sm:order-3"
                  onClick={handleAddStrike}
                  disabled={!game || game.strikes >= 3}
                >
                  + STRIKE
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
