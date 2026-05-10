// Phase 7: GSAP score update animation
// Triggered by SCORE_UPDATED realtime event.

import { gsap } from "gsap";

export const animateScoreUpdate = (element: HTMLElement) => {
  gsap.fromTo(
    element,
    { scale: 1.3, color: "#ffd700" },
    { scale: 1, color: "inherit", duration: 0.5, ease: "elastic.out(1, 0.5)" }
  );
};
