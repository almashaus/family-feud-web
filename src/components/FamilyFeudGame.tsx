import { useState, useCallback, useEffect } from "react";
import { GameBoard } from "./GameBoard";
import { HostControls } from "./HostControls";
import { TeamSetup } from "./TeamSetup";
import { type GameQuestion } from "@/data/questions";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  if (!user) {
    return;
  }

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
  const [filteredQuestions, setFilteredQuestions] =
    useState<GameQuestion[]>(gameQuestions);

  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      currentQuestion: { ...filteredQuestions[prev.currentQuestionIndex] },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredQuestions]);

  const handleRevealAnswer = useCallback(
    async (
      answerIndex: number,
      teamNumber: number,
      isRevealAnswer: boolean
    ) => {
      if (!gameState.isHost) return;

      setGameState((prev) => {
        const newQuestion = { ...prev.currentQuestion };
        const answer = newQuestion.answers[answerIndex];

        if (answer && !answer.revealed) {
          answer.revealed = true;
          const newTeamScores = { ...prev.teamScores };

          if (!isRevealAnswer) {
            if (teamNumber === 1) {
              newTeamScores.team1 += answer.points;
            } else {
              newTeamScores.team2 += answer.points;
            }
          }

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

  const handleLeadPoints = useCallback(
    async (team1Points: number, team2Points: number, teamNumber: number) => {
      if (!gameState.isHost) return;

      setGameState((prev) => {
        if (team1Points && team2Points) {
          const newTeamScores = { ...prev.teamScores };

          if (teamNumber === 1) {
            newTeamScores.team1 += team2Points;
            newTeamScores.team2 -= team2Points;
          } else {
            newTeamScores.team2 += team1Points;
            newTeamScores.team1 -= team1Points;
          }

          return {
            ...prev,
            teamScores: newTeamScores,
          };
        }
        return prev;
      });
    },
    [gameState.isHost, gameState.currentQuestion]
  );

  const handleStealPoints = useCallback(
    async (
      team1Points: number,
      team2Points: number,
      teamNumber: number,
      answerIndex: number
    ) => {
      if (!gameState.isHost) return;

      setGameState((prev) => {
        const newQuestion = { ...prev.currentQuestion };
        const answer = newQuestion.answers[answerIndex];
        answer.revealed = true;

        const newTeamScores = { ...prev.teamScores };

        if (teamNumber === 1) {
          newTeamScores.team1 += team1Points;
          newTeamScores.team2 -= team2Points;
        } else {
          newTeamScores.team2 += team2Points;
          newTeamScores.team1 -= team1Points;
        }

        return {
          ...prev,
          currentQuestion: newQuestion,
          teamScores: newTeamScores,
        };
      });
    },
    [gameState.isHost, gameState.currentQuestion]
  );

  const handleRevealAllAnswers = useCallback(async () => {
    if (!gameState.isHost) return;

    setGameState((prev) => {
      const newQuestion = { ...prev.currentQuestion };

      for (let i = 0; i < newQuestion.answers.length; i++) {
        const answer = newQuestion.answers[i];

        if (answer && !answer.revealed) {
          answer.revealed = true;
        }
      }
      return {
        ...prev,
        currentQuestion: newQuestion,
      };
    });
  }, [gameState.isHost, gameState.currentQuestion]);

  const handleRevealAnswerEndRound = useCallback(
    async (answerIndex: number) => {
      if (!gameState.isHost) return;

      setGameState((prev) => {
        const newQuestion = { ...prev.currentQuestion };
        const answer = newQuestion.answers[answerIndex];

        if (answer && !answer.revealed) {
          answer.revealed = true;
          const newTeamScores = { ...prev.teamScores };

          return {
            ...prev,
            currentQuestion: newQuestion,
          };
        }
        return prev;
      });
    },
    [gameState.isHost, gameState.currentQuestion]
  );

  const handleGameBegin = useCallback(
    async (_isGameBegin: boolean, startId?: number, endId?: number) => {
      if (startId && endId && startId <= endId) {
        const filtered = gameQuestions.filter(
          (q) => q.id >= startId && q.id <= endId
        );
        setFilteredQuestions(filtered);
        setGameState((prev) => ({
          ...prev,
          isGameBegin: true,
          currentQuestionIndex: 0,
          currentQuestion: { ...filtered[0] },
          currentRound: 1,
        }));
      } else {
        setFilteredQuestions(gameQuestions);
        setGameState((prev) => ({
          ...prev,
          isGameBegin: true,
        }));
      }
    },
    [gameQuestions]
  );

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
    if (gameState.currentQuestionIndex !== filteredQuestions.length - 1) {
      const nextIndex =
        (gameState.currentQuestionIndex + 1) % filteredQuestions.length;

      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        currentQuestion: { ...filteredQuestions[nextIndex] },
        strikes: 0,
        currentRound: prev.currentRound + 1,
      }));

      setTimerKey((prev) => prev + 1);
    }
  }, [
    gameState.currentQuestionIndex,
    gameState.currentRound,
    filteredQuestions,
  ]);

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

  const handleEndGame = useCallback(
    async (isHost: boolean) => {
      // Reset all answers in gameQuestions
      gameQuestions.forEach((question) => {
        question.answers.forEach((answer) => {
          answer.revealed = false;
        });
      });

      setFilteredQuestions(gameQuestions);
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
    },
    [gameQuestions]
  );

  if (!gameState.gameEntered) {
    return (
      <TeamSetup
        onEnterGame={handleEnterGame}
        onHostControls={handleHostPage}
        onSignOut={handleEndGame}
      />
    );
  } else {
    return (
      <div className="min-h-screen bg-gradient-bg sparkle-bg p-2">
        <div className="space-y-2">
          <GameBoard
            key={timerKey}
            question={gameState.currentQuestion}
            answers={gameState.currentQuestion.answers}
            onEndGame={handleEndGame}
            onRevealAnswer={handleRevealAnswer}
            onRevealAllAnswer={handleRevealAllAnswers}
            onRevealAnswerEndRound={handleRevealAnswerEndRound}
            onLeadPoints={handleLeadPoints}
            onStealPoints={handleStealPoints}
            onNextQuestion={handleNextQuestion}
            onAddStrike={handleAddStrike}
            currentRound={gameState.currentRound}
            totalRounds={filteredQuestions.length}
            teams={gameState.teams}
            teamScores={gameState.teamScores}
            strikes={gameState.strikes}
            isHost={gameState.isHost}
            isGameBegin={gameState.isGameBegin}
          />

          <HostControls
            questions={filteredQuestions}
            onGameBegin={handleGameBegin}
            gameEntered={gameState.gameEntered}
          />
        </div>
      </div>
    );
  }
};
