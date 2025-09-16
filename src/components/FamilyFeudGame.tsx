import { useState, useCallback, useEffect } from "react";
import { GameBoard } from "./GameBoard";
import { HostControls } from "./HostControls";
import { TeamSetup } from "./TeamSetup";
import { type GameQuestion } from "@/data/questions";
import { useQuestionsStore } from "@/lib/stores/questionsStore";
import { updateData } from "@/services/supabaseFunctions";

interface GameState {
  currentQuestionIndex: number;
  currentQuestion: GameQuestion;
  teamScores: { team1: number; team2: number };
  strikes: number;
  gameEntered: boolean;
  isHost: boolean;
  isGameBegin: boolean;
  teams: { team1: string; team2: string };
  currentRound: number;
}

export const FamilyFeudGame = ({
  gameQuestions,
  gameStarted,
}: {
  gameQuestions: GameQuestion[];
  gameStarted: boolean;
}) => {
  // Only show loading if questions are not loaded yet
  if (!gameQuestions || gameQuestions.length === 0) {
    return <div>Loading game...</div>;
  }

  // Initialize gameState with default values based on loaded questions
  const [gameState, setGameState] = useState<GameState>(() => ({
    currentQuestionIndex: 0,
    currentQuestion: { ...gameQuestions[0] },
    teamScores: { team1: 0, team2: 0 },
    strikes: 0,
    gameEntered: false,
    isHost: false,
    isGameBegin: gameStarted,
    teams: { team1: "Team 1", team2: "Team 2" },
    currentRound: 1,
  }));

  // Sync gameState.currentQuestion if gameQuestions change (e.g., after SWR fetch)
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      currentQuestion: { ...gameQuestions[prev.currentQuestionIndex] },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameQuestions]);

  const handleRevealAnswer = useCallback(
    async (answerIndex: number) => {
      if (!gameState.isHost) return;

      const answer = gameState.currentQuestion.answers[answerIndex];
      const questionId = gameState.currentQuestion.id;

      // Update by question_id and text for uniqueness
      const isUpdated = await updateData(
        "answers",
        { revealed: true },
        ["question_id", "text"],
        [questionId, answer.text]
      );

      setGameState((prev) => {
        const newQuestion = { ...prev.currentQuestion };
        const answer = newQuestion.answers[answerIndex];

        if (answer && !answer.revealed) {
          answer.revealed = true;
          const newTeamScores = { ...prev.teamScores };
          newTeamScores.team1 += answer.points;
          return {
            ...prev,
            currentQuestion: newQuestion,
            teamScores: newTeamScores,
          };
        }
        return prev;
      });
    },
    [gameState.isHost, gameState.currentQuestion]
  );

  const handleGameBegin = useCallback(async () => {
    const isUpdated = await updateData(
      "settings",
      { is_game_begin: true },
      "id",
      1
    );
    if (isUpdated) {
      setGameState((prev) => ({
        ...prev,
        isGameBegin: true,
      }));
    }
  }, []);

  const handleAddStrike = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      strikes: Math.min(prev.strikes + 1, 3),
    }));

    if (gameState.strikes === 2) {
    }
  }, [gameState.strikes]);

  const handleResetStrikes = useCallback(() => {
    setGameState((prev) => ({ ...prev, strikes: 0 }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    const nextIndex =
      (gameState.currentQuestionIndex + 1) % gameQuestions.length;

    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      currentQuestion: { ...gameQuestions[nextIndex] },
      strikes: 0,
      currentRound: prev.currentRound + 1,
    }));
  }, [gameState.currentQuestionIndex, gameState.currentRound]);

  const handleAwardPoints = useCallback((team: 1 | 2, points: number) => {
    setGameState((prev) => ({
      ...prev,
      teamScores: {
        ...prev.teamScores,
        [`team${team}`]:
          prev.teamScores[`team${team}` as keyof typeof prev.teamScores] +
          points,
      },
    }));
  }, []);

  const handleEnterGame = useCallback(
    (team1Name: string, team2Name: string) => {
      setGameState((prev) => ({
        ...prev,
        gameEntered: true,
        teams: { team1: team1Name, team2: team2Name },
      }));
    },
    []
  );

  const handleHostPage = useCallback((isHost: boolean) => {
    setGameState((prev) => ({
      ...prev,
      isHost: true,
    }));
  }, []);

  const handleEndGame = useCallback(async (isHost: boolean) => {
    // Reset all answers in gameQuestions
    // gameQuestions.forEach((question) => {
    //   question.answers.forEach((answer) => {
    //     answer.revealed = false;
    //   });
    // });

    const isUpdated = await updateData(
      "settings",
      { is_game_begin: false },
      "id",
      1
    );

    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: 0,
      currentQuestion: { ...gameQuestions[0] },
      teamScores: { team1: 0, team2: 0 },
      strikes: 0,
      gameEntered: false,
      isHost: false,
      isGameBegin: false,
      teams: { team1: "Team 1", team2: "Team 2" },
      currentRound: 1,
    }));
  }, []);

  if (gameState.isHost && gameState.gameEntered) {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg p-4">
        <div className="p-2 space-y-4 rounded-lg border-4 border-red-500 pb-6">
          <GameBoard
            question={gameState.currentQuestion.question}
            answers={gameState.currentQuestion.answers}
            onRevealAnswer={handleRevealAnswer}
            onEndGame={handleEndGame}
            teamScores={gameState.teamScores}
            strikes={gameState.strikes}
            isHost={gameState.isHost}
            isGameBegin={gameState.isGameBegin}
          />

          <HostControls
            onGameBegin={handleGameBegin}
            onAddStrike={handleAddStrike}
            onResetStrikes={handleResetStrikes}
            onNextQuestion={handleNextQuestion}
            onAwardPoints={handleAwardPoints}
            currentRound={gameState.currentRound}
            totalRounds={gameQuestions.length}
            isGameBegin={gameState.isGameBegin}
          />
        </div>
      </div>
    );
  }

  if (!gameState.gameEntered) {
    return (
      <TeamSetup
        onEnterGame={handleEnterGame}
        onHostControls={handleHostPage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-4">
      <div className="container mx-auto space-y-8">
        <GameBoard
          question={gameState.currentQuestion.question}
          answers={gameState.currentQuestion.answers}
          onRevealAnswer={handleRevealAnswer}
          onEndGame={handleEndGame}
          teamScores={gameState.teamScores}
          strikes={gameState.strikes}
          isHost={gameState.isHost}
          isGameBegin={gameState.isGameBegin}
        />
      </div>
    </div>
  );
};
