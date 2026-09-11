import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initRouter, onRoute } from "./router";
import { shouldUseWebGL } from "./scene/capabilities";
import type { SceneApp as SceneAppType } from "./scene/SceneApp";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
const heroSection = document.querySelector<HTMLElement>(".hero")!;

let app: SceneAppType | null = null;

async function initHeroScene(): Promise<void> {
  if (!shouldUseWebGL()) {
    heroSection.classList.add("hero-fallback");
    return;
  }
  const { SceneApp } = await import("./scene/SceneApp");
  app = new SceneApp(canvas);

  ScrollTrigger.create({
    trigger: "main",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.4,
    onUpdate: (self) => app?.setProgress(self.progress),
  });
}

// --- Revelado progresivo de secciones (excepto el hero, que tiene su propia intro) ---
document.querySelectorAll<HTMLElement>("#view-inicio .scene-section:not(.hero)").forEach((section) => {
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

// --- Menú móvil a pantalla completa ---
const navToggle = document.querySelector<HTMLButtonElement>("#nav-toggle")!;
const mobileNav = document.querySelector<HTMLElement>("#mobile-nav")!;

function closeMobileNav(): void {
  mobileNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.classList.remove("open");
  document.body.classList.remove("nav-open");
  window.setTimeout(() => {
    if (!mobileNav.classList.contains("open")) mobileNav.hidden = true;
  }, 350);
}

function openMobileNav(): void {
  mobileNav.hidden = false;
  requestAnimationFrame(() => mobileNav.classList.add("open"));
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.classList.add("open");
  document.body.classList.add("nav-open");
}

navToggle.addEventListener("click", () => {
  if (mobileNav.classList.contains("open")) closeMobileNav();
  else openMobileNav();
});
mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileNav));

// --- Router: monta cada vista de forma perezosa y pausa la escena 3D fuera de Inicio ---
onRoute("inicio", {
  onEnter: () => {
    if (app) {
      app.resume();
    } else {
      initHeroScene();
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  },
  onLeave: () => {
    app?.pause();
  },
});

onRoute("carta", {
  onEnter: () => {
    import("./pages/carta").then((m) => m.initCarta());
  },
  onLeave: () => {
    import("./pages/carta").then((m) => m.closeCartaModal());
  },
});

onRoute("galeria", {
  onEnter: () => {
    import("./pages/galeria").then((m) => m.initGaleria());
  },
  onLeave: () => {
    import("./pages/galeria").then((m) => m.stopGaleria());
  },
});

onRoute("contacto", {
  onEnter: () => {
    import("./pages/contacto").then((m) => m.initContacto());
  },
});

initRouter();

window.addEventListener("load", () => ScrollTrigger.refresh());
