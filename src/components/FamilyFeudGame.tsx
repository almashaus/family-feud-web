import { useState, useCallback } from "react";
import { GameBoard } from "./GameBoard";
import { HostControls } from "./HostControls";
import { TeamSetup } from "./TeamSetup";
import { gameQuestions, type GameQuestion } from "@/data/questions";

interface GameState {
  currentQuestionIndex: number;
  currentQuestion: GameQuestion;
  teamScores: { team1: number; team2: number };
  strikes: number;
  gameStarted: boolean;
  isHost: boolean;
  isGameBegin: boolean;
  teams: { team1: string; team2: string };
  currentRound: number;
}

export const FamilyFeudGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    currentQuestion: { ...gameQuestions[0] },
    teamScores: { team1: 0, team2: 0 },
    strikes: 0,
    gameStarted: false,
    isHost: false,
    isGameBegin: false,
    teams: { team1: "Team 1", team2: "Team 2" },
    currentRound: 1,
  });

  const handleRevealAnswer = useCallback(
    (answerIndex: number) => {
      if (!gameState.isHost) return;

      setGameState((prev) => {
        const newQuestion = { ...prev.currentQuestion };
        const answer = newQuestion.answers[answerIndex];

        if (answer && !answer.revealed) {
          answer.revealed = true;

          // Add points to team1 for demo (in real game, this would be determined by gameplay)
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
    [gameState.isHost]
  );

  const handleGameBegin = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameBegin: true,
    }));
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
        gameStarted: true,
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

  const handleEndGame = useCallback((isHost: boolean) => {
    // Reset all answers in gameQuestions
    gameQuestions.forEach((question) => {
      question.answers.forEach((answer) => {
        answer.revealed = false;
      });
    });

    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: 0,
      currentQuestion: { ...gameQuestions[0] },
      teamScores: { team1: 0, team2: 0 },
      strikes: 0,
      gameStarted: false,
      isHost: false,
      isGameBegin: false,
      teams: { team1: "Team 1", team2: "Team 2" },
      currentRound: 1,
    }));
  }, []);

  if (gameState.isHost && gameState.gameStarted) {
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

  if (!gameState.gameStarted) {
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
