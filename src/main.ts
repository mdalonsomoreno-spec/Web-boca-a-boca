import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneApp } from "./scene/SceneApp";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
const app = new SceneApp(canvas);

// --- Scroll maestro: controla la cámara cinematográfica de forma continua ---
ScrollTrigger.create({
  trigger: "main",
  start: "top top",
  end: "bottom bottom",
  scrub: 0.4,
  onUpdate: (self) => app.setProgress(self.progress),
});

// --- Revelado progresivo de secciones (excepto el hero, que tiene su propia intro) ---
document.querySelectorAll<HTMLElement>(".scene-section:not(.hero)").forEach((section) => {
  const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!items.length) return;
  ScrollTrigger.create({
    trigger: section,
    start: "top 70%",
    toggleActions: "play none none reverse",
    onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" }),
    onLeaveBack: () => gsap.to(items, { opacity: 0, y: 28, duration: 0.6, ease: "power2.in" }),
  });
});

// --- Secuencia cinematográfica de entrada ---
const preloader = document.querySelector<HTMLElement>("#preloader")!;
const preloaderLogo = preloader.querySelector<HTMLElement>(".preloader-logo")!;
const topbar = document.querySelector<HTMLElement>(".topbar")!;
const heroItems = document.querySelectorAll<HTMLElement>(".hero [data-reveal]");

const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
intro
  .to(preloaderLogo, { opacity: 1, duration: 0.9 })
  .to(preloaderLogo, { opacity: 1, duration: 0.5 })
  .to(preloader, {
    opacity: 0,
    duration: 1,
    onComplete: () => preloader.remove(),
  })
  .to(topbar, { opacity: 1, y: 0, duration: 1 }, "-=0.4")
  .to(heroItems, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }, "-=0.7");

document.querySelector("#year")!.textContent = String(new Date().getFullYear());

window.addEventListener("load", () => ScrollTrigger.refresh());
