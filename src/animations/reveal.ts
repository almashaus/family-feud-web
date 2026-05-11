import { gsap } from "gsap";

// Flip a single answer slot open from the top (card-flip style).
export function animateAnswerReveal(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { rotationX: -90, opacity: 0, transformOrigin: "top center", transformPerspective: 500 },
    { rotationX: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
  );
}

// Same flip but staggered — used when all remaining answers are revealed at once.
export function animateAllAnswersReveal(elements: HTMLElement[]): void {
  gsap.fromTo(
    elements,
    { rotationX: -90, opacity: 0, transformOrigin: "top center", transformPerspective: 500 },
    { rotationX: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.06 }
  );
}

// Slide the board up and fade out before a round change.
// Returns the tween so callers can sequence after it if needed.
export function animateRoundOut(element: HTMLElement): gsap.core.Tween {
  return gsap.to(element, { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" });
}

// Slide the new board content in from below after a round change.
export function animateRoundIn(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
  );
}

// Board entrance when the game transitions from waiting → active.
export function animateGameStart(element: HTMLElement): void {
  gsap.fromTo(
    element,
    { opacity: 0, y: 40, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
  );
}
