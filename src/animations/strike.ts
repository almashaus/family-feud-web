import { gsap } from "gsap";

// Slam the X icon in from a large scale with a brief horizontal shake at the end.
export function animateStrike(element: HTMLElement): void {
  const tl = gsap.timeline();
  tl.fromTo(
    element,
    { scale: 3, opacity: 0, rotation: -20 },
    { scale: 1, opacity: 1, rotation: 0, duration: 0.3, ease: "power4.out" }
  )
    .to(element, { x: -5, duration: 0.05, ease: "none" })
    .to(element, { x: 5, duration: 0.05, ease: "none" })
    .to(element, { x: -3, duration: 0.05, ease: "none" })
    .to(element, { x: 0, duration: 0.05, ease: "none" });
}
