import { useState, useCallback } from "react";
import { GameBoard } from "./GameBoard";
import { HostControls } from "./HostControls";
import { TeamSetup } from "./TeamSetup";
import { gameQuestions, type GameQuestion } from "@/data/questions";
import { useToast } from "@/hooks/use-toast";

interface GameState {
  currentQuestionIndex: number;
  currentQuestion: GameQuestion;
  teamScores: { team1: number; team2: number };
  strikes: number;
  gameStarted: boolean;
  isHost: boolean;
  teams: { team1: string; team2: string };
  currentRound: number;
}

export const FamilyFeudGame = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    currentQuestion: { ...gameQuestions[0] },
    teamScores: { team1: 0, team2: 0 },
    strikes: 0,
    gameStarted: false,
    isHost: true, // For demo purposes
    teams: { team1: "Team 1", team2: "Team 2" },
    currentRound: 1,
  });

  const handleRevealAnswer = useCallback((answerIndex: number) => {
    if (!gameState.isHost) return;

    setGameState(prev => {
      const newQuestion = { ...prev.currentQuestion };
      const answer = newQuestion.answers[answerIndex];
      
      if (answer && !answer.revealed) {
        answer.revealed = true;
        
        // Add points to team1 for demo (in real game, this would be determined by gameplay)
        const newTeamScores = { ...prev.teamScores };
        newTeamScores.team1 += answer.points;

        toast({
          title: "Answer Revealed!",
          description: `"${answer.text}" - ${answer.points} points awarded!`,
        });

        return {
          ...prev,
          currentQuestion: newQuestion,
          teamScores: newTeamScores,
        };
      }
      
      return prev;
    });
  }, [gameState.isHost, toast]);

  const handleNewGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      currentQuestion: { ...gameQuestions[0] },
      teamScores: { team1: 0, team2: 0 },
      strikes: 0,
      currentRound: 1,
    }));

    toast({
      title: "New Game Started!",
      description: "Good luck to both teams!",
    });
  }, [toast]);

  const handleAddStrike = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      strikes: Math.min(prev.strikes + 1, 3),
    }));

    if (gameState.strikes === 2) {
      toast({
        title: "Three Strikes!",
        description: "Turn passes to the other team.",
        variant: "destructive",
      });
    }
  }, [gameState.strikes, toast]);

  const handleResetStrikes = useCallback(() => {
    setGameState(prev => ({ ...prev, strikes: 0 }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    const nextIndex = (gameState.currentQuestionIndex + 1) % gameQuestions.length;
    
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      currentQuestion: { ...gameQuestions[nextIndex] },
      strikes: 0,
      currentRound: prev.currentRound + 1,
    }));

    toast({
      title: "Next Question!",
      description: `Round ${gameState.currentRound + 1} begins!`,
    });
  }, [gameState.currentQuestionIndex, gameState.currentRound, toast]);

  const handleAwardPoints = useCallback((team: 1 | 2, points: number) => {
    setGameState(prev => ({
      ...prev,
      teamScores: {
        ...prev.teamScores,
        [`team${team}`]: prev.teamScores[`team${team}` as keyof typeof prev.teamScores] + points,
      },
    }));

    toast({
      title: "Points Awarded!",
      description: `${points} points awarded to Team ${team}!`,
    });
  }, [toast]);

  const handleStartGame = useCallback((team1Name: string, team2Name: string) => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      teams: { team1: team1Name, team2: team2Name },
    }));

    toast({
      title: "Game Started!",
      description: `${team1Name} vs ${team2Name} - Let's play Family Feud!`,
    });
  }, [toast]);

  if (!gameState.gameStarted) {
    return <TeamSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg sparkle-bg p-4">
      <div className="container mx-auto space-y-8">
        <GameBoard
          question={gameState.currentQuestion.question}
          answers={gameState.currentQuestion.answers}
          onRevealAnswer={handleRevealAnswer}
          teamScores={gameState.teamScores}
          strikes={gameState.strikes}
          isHost={gameState.isHost}
        />
        
        {gameState.isHost && (
          <HostControls
            onNewGame={handleNewGame}
            onAddStrike={handleAddStrike}
            onResetStrikes={handleResetStrikes}
            onNextQuestion={handleNextQuestion}
            onAwardPoints={handleAwardPoints}
            currentRound={gameState.currentRound}
            totalRounds={gameQuestions.length}
          />
        )}
      </div>
    </div>
  );
};