import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeft,
  XIcon,
  Undo2,
  Copy,
  Check,
  Undo,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchQuestionsData } from "@/services/supabaseFunctions";
import type { GameQuestion, Game } from "@/types/game";
import {
  createGame,
  startGame,
  nextRound,
  endGame,
  generateSessionCode,
  selectTeam,
} from "@/features/game";
import {
  revealAnswer,
  revealAllAnswers,
  resetAnswersForQuestion,
  fetchAnswersForQuestion,
} from "@/features/answers";
import { updateScore, awardPoints } from "@/features/scores";
import { addStrike, removeStrike, resetStrikes } from "@/features/strikes";
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
  const { signOut } = useAuth();

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
    setPhase("active");
    setIsCreating(false);
  };

  const handleRevealAnswer = async (answer: LocalAnswer) => {
    if (!game || answer.revealed) return;
    setIsLoading(true);

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
      if (selectedTeam) {
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

  const handleRevealAll = async () => {
    if (!game || !currentQuestion) return;
    const hiddenAnswers = answers.filter((a) => !a.revealed);
    if (hiddenAnswers.length === 0) return;

    setIsLoading(true);
    const ok = await revealAllAnswers(
      game.id,
      hiddenAnswers.map((a) => a.id),
      currentQuestion.dbId!,
    );
    if (ok) {
      setAnswers((prev) => prev.map((a) => ({ ...a, revealed: true })));
      if (selectedTeam) {
        const totalPoints = hiddenAnswers.reduce((sum, a) => sum + a.points, 0);
        const currentScore = selectedTeam === "team_a" ? scoreA : scoreB;
        const newScore = currentScore + totalPoints;
        if (selectedTeam === "team_a") {
          setScoreA(newScore);
          setGame((g) => g && { ...g, team_a_score: newScore });
        } else {
          setScoreB(newScore);
          setGame((g) => g && { ...g, team_b_score: newScore });
        }
        await awardPoints(game.id, selectedTeam, currentScore, totalPoints);
      }
    }
    setIsLoading(false);
  };

  const handleAddStrike = async () => {
    if (!game) return;
    const ok = await addStrike(game.id, game.strikes);
    if (ok) setGame((g) => g && { ...g, strikes: g.strikes + 1 });
  };

  const handleUndoStrike = async () => {
    if (!game) return;
    const ok = await removeStrike(game.id, game.strikes);
    if (ok) setGame((g) => g && { ...g, strikes: Math.max(0, g.strikes - 1) });
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
    await nextRound(game.id, nextQ.dbId!, nextIndex + 1);
    await resetStrikes(game.id);
    setGame((g) => g && { ...g, current_question_id: nextQ.dbId!, strikes: 0 });
    setCurrentIndex(nextIndex);
    setSelectedTeam(null);
    await selectTeam(game.id, null);
    setIsLoading(false);
  };

  const handlePrev = async () => {
    if (!game || currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    const prevQ = filteredQuestions[prevIndex];

    setIsLoading(true);
    await nextRound(game.id, prevQ.dbId!, prevIndex + 1);
    await resetStrikes(game.id);
    setGame((g) => g && { ...g, current_question_id: prevQ.dbId!, strikes: 0 });
    setCurrentIndex(prevIndex);
    setSelectedTeam(null);
    await selectTeam(game.id, null);
    setIsLoading(false);
  };

  const handleEndGame = async () => {
    if (!game) return;
    await endGame(game.id);
    setPhase("finished");
  };

  const handleSelectTeam = async (team: "team_a" | "team_b") => {
    if (!game) return;
    const next = selectedTeam === team ? null : team;
    setSelectedTeam(next);
    await selectTeam(game.id, next);
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
  };

  const boardUrl = game
    ? `${window.location.origin}/board?session=${game.session_code}`
    : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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
              variant="game"
              className="w-full bg-gradient-primary game-board-font md:text-lg font-bold py-6 tracking-wide pulse-glow"
              onClick={handleCreate}
              disabled={isCreating || allQuestions.length === 0}
            >
              {isCreating ? "Creating..." : "CREATE GAME"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="green"
                className="w-full border-gold-border game-board-font text-sm py-6 tracking-wide"
                onClick={() => navigate("/host/view-questions")}
              >
                VIEW ALL QUESTIONS
              </Button>

              <Button
                variant="yellow"
                className="w-full border-gold-border game-board-font text-sm py-6 tracking-wide"
                onClick={() => navigate("/host/add-question")}
              >
                ADD NEW QUESTION
              </Button>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleSignOut}
                variant="link"
                className="text-lg text-primary"
              >
                Sign Out
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

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-3">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Header: session + board URL */}
        <Card className="bg-gradient-board border-gold-border border-4 p-3 shadow-gold">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="game-board-font text-primary-foreground text-lg">
              SESSION:{" "}
              <span className="text-yellow-300">{game?.session_code}</span>
            </span>
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
              "flex flex-col items-center border-gold-border border-4 p-3 shadow-gold cursor-pointer transition-all duration-200 select-none",
              selectedTeam === "team_a"
                ? "bg-gradient-gold"
                : "bg-gradient-board",
            )}
            onClick={() => handleSelectTeam("team_a")}
          >
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
              className="game-board-font text-3xl text-center w-1/3 min-w-24 bg-transparent text-primary-foreground border-2 border-white rounded-lg"
            />
          </Card>
          <Card
            className={cn(
              "flex flex-col items-center border-gold-border border-4 p-3 shadow-gold cursor-pointer transition-all duration-200 select-none",
              selectedTeam === "team_b"
                ? "bg-gradient-gold"
                : "bg-gradient-board",
            )}
            onClick={() => handleSelectTeam("team_b")}
          >
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
              className="game-board-font text-3xl text-center w-1/3 min-w-24 bg-transparent text-primary-foreground border-2 border-white rounded-lg"
            />
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
            <span className="game-board-font text-primary-foreground">
              ROUND {currentIndex + 1} / {filteredQuestions.length}
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
              onClick={handleRevealAll}
              disabled={isLoading}
            >
              REVEAL ALL
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
                      disabled={isLoading}
                    >
                      REVEAL
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strikes */}
        <Card className="bg-gradient-board border-gold-border border-4 p-3 shadow-gold">
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
        </Card>
      </div>
    </div>
  );
}
