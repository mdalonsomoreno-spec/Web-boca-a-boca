import { gsap } from "gsap";

let animated = false;

export function initContacto(): void {
  const items = document.querySelectorAll<HTMLElement>("#view-contacto [data-reveal-static]");
  if (!items.length) return;
  if (animated) return;
  animated = true;
  gsap.fromTo(
    items,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
  );
}
