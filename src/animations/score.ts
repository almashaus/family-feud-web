import { gsap } from "gsap";

// Quick punch up then elastic spring back — drives the score number element.
export function animateScoreUpdate(element: HTMLElement): void {
  const tl = gsap.timeline();
  tl.to(element, { scale: 1.55, duration: 0.14, ease: "power2.out" }).to(element, {
    scale: 1,
    duration: 0.58,
    ease: "elastic.out(1, 0.4)",
  });
}
