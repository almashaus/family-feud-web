// Phase 7: GSAP answer reveal animation
// Triggered by ANSWER_REVEALED realtime event — not by button clicks.

import { gsap } from "gsap";

export const animateAnswerReveal = (element: HTMLElement) => {
  gsap.fromTo(
    element,
    { opacity: 0, scaleY: 0, transformOrigin: "top center" },
    { opacity: 1, scaleY: 1, duration: 0.4, ease: "back.out(1.7)" }
  );
};
