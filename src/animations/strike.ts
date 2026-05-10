// Phase 7: GSAP strike animation
// Triggered by STRIKE_ADDED realtime event.

import { gsap } from "gsap";

export const animateStrike = (element: HTMLElement) => {
  gsap.fromTo(
    element,
    { opacity: 0, scale: 1.5 },
    { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
  );
};
