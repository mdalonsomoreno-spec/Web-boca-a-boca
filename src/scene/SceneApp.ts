import * as THREE from "three";
import { loadPhotoPizza, type PhotoPizza } from "./PhotoPizza";
import { buildIngredientProp } from "./IngredientProps";
import { setupLighting, setupEnvironment } from "./Lighting";
import { setupComposer } from "./PostFX";
import { SteamParticles } from "./SteamParticles";
import { evaluateCamera } from "./CameraPath";
import { getQualityTier } from "./capabilities";
import { ingredients } from "../content/data";

const SPECIALTY_START = 0.5;
const SPECIALTY_END = 0.82;

function smoothstep(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

export class SceneApp {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private pizza: PhotoPizza | null = null;
  private pizzaRevealStart: number | null = null;
  private ingredientGroups: THREE.Group[] = [];
  private steam: SteamParticles;
  private composer;
  private clock = new THREE.Clock();
  private progress = 0;
  private targetProgress = 0;
  private mouse = new THREE.Vector2();
  private raf = 0;

  constructor(canvas: HTMLCanvasElement) {
    const quality = getQualityTier();
    const reduced = quality === "reduced";

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !reduced,
      alpha: true,
      powerPreference: reduced ? "default" : "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, reduced ? 1.5 : 2));
    this.renderer.shadowMap.enabled = !reduced;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.background = null;
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

    setupEnvironment(this.renderer, this.scene);
    setupLighting(this.scene);

    loadPhotoPizza("/images/hero-pizza.webp").then((pizza) => {
      pizza.group.scale.setScalar(0.001);
      this.scene.add(pizza.group);
      this.pizza = pizza;
      this.pizzaRevealStart = this.clock.elapsedTime;
    });

    this.steam = new SteamParticles(reduced ? 14 : 34);
    this.steam.points.position.y = 0.5;
    this.scene.add(this.steam.points);
    this.steam.points.visible = !reduced;

    ingredients.forEach((ing, i) => {
      const g = buildIngredientProp(ing.id);
      g.scale.setScalar(0.001);
      g.userData.index = i;
      this.scene.add(g);
      this.ingredientGroups.push(g);
    });

    this.composer = setupComposer(this.renderer, this.scene, this.camera, reduced);

    this.onResize();
    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("pointermove", (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    this.loop();
  }

  private onResize(): void {
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement ?? document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** progress: 0..1, avance global a lo largo de todo el scroll de la página. */
  setProgress(p: number): void {
    this.targetProgress = THREE.MathUtils.clamp(p, 0, 1);
  }

  private updatePizza(t: number): void {
    if (!this.pizza || this.pizzaRevealStart === null) return;
    const reveal = smoothstep((t - this.pizzaRevealStart) / 0.9);
    this.pizza.group.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, reveal));
    this.pizza.group.position.y = Math.sin(t * 0.35) * 0.03;
    // Ligero balanceo en el propio plano del sprite: da vida sin romper
    // el efecto billboard (siempre mirando a cámara).
    this.pizza.sprite.material.rotation = Math.sin(t * 0.22) * 0.025;
  }

  private updateIngredients(p: number, t: number): void {
    const sp = smoothstep((p - SPECIALTY_START) / (SPECIALTY_END - SPECIALTY_START));
    const count = this.ingredientGroups.length;
    this.ingredientGroups.forEach((g, i) => {
      const start = (i / count) * 0.55;
      const end = start + 0.45;
      const local = smoothstep((sp - start) / (end - start));
      const angle = (i / count) * Math.PI * 2 + t * 0.08;
      const radius = THREE.MathUtils.lerp(0.15, 2.35, local);
      const depthPhase = i % 2 === 0 ? 1 : -1;
      const height = THREE.MathUtils.lerp(0.3, 0.55 + depthPhase * 0.55, local) + Math.sin(t * 0.6 + i) * 0.06 * local;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * (0.9 + depthPhase * 0.15);
      g.position.set(x, height, z);
      g.rotation.y = angle + Math.PI / 2;
      g.rotation.x = Math.sin(t * 0.4 + i) * 0.05 * local;
      const scale = THREE.MathUtils.lerp(0.001, 0.62, local);
      g.scale.setScalar(scale);
    });
  }

  private loop = (): void => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    this.progress += (this.targetProgress - this.progress) * Math.min(1, dt * 4);

    this.updatePizza(t);

    const cam = evaluateCamera(this.progress);
    const parallaxX = this.mouse.x * 0.18;
    const parallaxY = -this.mouse.y * 0.1;
    this.camera.position.copy(cam.position);
    this.camera.position.x += parallaxX;
    this.camera.position.y += parallaxY;
    this.camera.fov = cam.fov;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(cam.target);

    const inSpecialty = this.progress > SPECIALTY_START - 0.05 && this.progress < SPECIALTY_END + 0.1;
    this.updateIngredients(this.progress, t);

    this.steam.update(dt, inSpecialty ? 0.3 : 1);

    this.composer.composer.render();
  };

  /** Detiene el bucle de render (al salir de la vista Inicio) sin destruir la escena. */
  pause(): void {
    cancelAnimationFrame(this.raf);
  }

  /** Reanuda el bucle de render (al volver a la vista Inicio). */
  resume(): void {
    this.clock.getDelta();
    this.loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
  }
}
