import { useState, useCallback, useEffect } from "react";
import { GameBoard } from "./GameBoard";
import { HostControls } from "./HostControls";
import { TeamSetup } from "./TeamSetup";
import { type GameQuestion } from "@/data/questions";

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
}: {
  gameQuestions: GameQuestion[];
}) => {
  if (!gameQuestions || gameQuestions.length === 0) {
    return <div>Loading game...</div>;
  }
  const [timerKey, setTimerKey] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => ({
    currentQuestionIndex: 0,
    currentQuestion: { ...gameQuestions[0] },
    teamScores: { team1: 0, team2: 0 },
    strikes: 0,
    gameEntered: false,
    isHost: true,
    isGameBegin: false,
    teams: { team1: "Team 1", team2: "Team 2" },
    currentRound: 1,
  }));

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
    setGameState((prev) => ({
      ...prev,
      isGameBegin: true,
    }));
  }, [gameState.isGameBegin]);

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
    if (gameState.currentQuestionIndex !== gameQuestions.length - 1) {
      const nextIndex =
        (gameState.currentQuestionIndex + 1) % gameQuestions.length;

      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        currentQuestion: { ...gameQuestions[nextIndex] },
        strikes: 0,
        currentRound: prev.currentRound + 1,
      }));

      setTimerKey((prev) => prev + 1);
    }
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
      gameEntered: false,
      isHost: false,
      isGameBegin: false,
      teams: { team1: "Team 1", team2: "Team 2" },
      currentRound: 1,
    }));
  }, []);

  if (!gameState.gameEntered) {
    return (
      <TeamSetup
        onEnterGame={handleEnterGame}
        onHostControls={handleHostPage}
      />
    );
  }

  return (
    <div className="bg-gradient-bg sparkle-bg p-2">
      <div className="space-y-2">
        <GameBoard
          key={timerKey}
          question={gameState.currentQuestion.question}
          answers={gameState.currentQuestion.answers}
          onEndGame={handleEndGame}
          onRevealAnswer={handleRevealAnswer}
          currentRound={gameState.currentRound}
          totalRounds={gameQuestions.length}
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
          onEndGame={handleEndGame}
          answers={gameState.currentQuestion.answers}
          currentRound={gameState.currentRound}
          totalRounds={gameQuestions.length}
          isGameBegin={gameState.isGameBegin}
        />
      </div>
    </div>
  );
};
