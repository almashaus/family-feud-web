import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  GameEvents,
  type GameEventHandlers,
  type AnswerRevealedPayload,
  type AllAnswersRevealedPayload,
  type ScoreUpdatedPayload,
  type StrikePayload,
  type RoundChangedPayload,
  type GameStartedPayload,
  type TeamSelectedPayload,
} from "@/realtime/events";

// Subscribes to lastEvent in the game store and dispatches to typed handlers.
//
// Handlers are kept in a ref so the effect only re-fires when the event itself
// changes — not on every re-render that recreates the handler object.

export function useGameEvents(handlers: GameEventHandlers) {
  const lastEvent = useGameStore((state) => state.lastEvent);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!lastEvent) return;

    const h = handlersRef.current;
    const p = lastEvent.payload ?? {};

    switch (lastEvent.type) {
      case GameEvents.ANSWER_REVEALED:
        h.onAnswerRevealed?.(p as unknown as AnswerRevealedPayload);
        break;
      case GameEvents.ALL_ANSWERS_REVEALED:
        h.onAllAnswersRevealed?.(p as unknown as AllAnswersRevealedPayload);
        break;
      case GameEvents.SCORE_UPDATED:
        h.onScoreUpdated?.(p as unknown as ScoreUpdatedPayload);
        break;
      case GameEvents.STRIKE_ADDED:
        h.onStrikeAdded?.(p as unknown as StrikePayload);
        break;
      case GameEvents.STRIKE_REMOVED:
        h.onStrikeRemoved?.(p as unknown as StrikePayload);
        break;
      case GameEvents.STRIKES_RESET:
        h.onStrikesReset?.(p as unknown as StrikePayload);
        break;
      case GameEvents.ROUND_CHANGED:
        h.onRoundChanged?.(p as unknown as RoundChangedPayload);
        break;
      case GameEvents.GAME_STARTED:
        h.onGameStarted?.(p as unknown as GameStartedPayload);
        break;
      case GameEvents.GAME_ENDED:
        h.onGameEnded?.();
        break;
      case GameEvents.TEAM_SELECTED:
        h.onTeamSelected?.(p as unknown as TeamSelectedPayload);
        break;
    }
  }, [lastEvent]);
}
