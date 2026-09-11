import * as THREE from "three";
import { buildIngredientProp } from "./IngredientProps";
import { ingredients } from "../content/data";

const CYCLE = 3.4; // segundos: sube, se mantiene, baja/reforma.

function smoothstep(t: number): number {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Mini escena para la ficha de la Pizza Boca a Boca: los ingredientes reales
 * (pimiento, bacon, queso, carne, guindilla, cebolla) se separan verticalmente
 * sobre la fotografía real de la pizza y vuelven a formarla — sesión
 * publicitaria gastronómica, no una demo técnica de 3D. La pizza en sí nunca
 * es CGI: solo estos pequeños props flotan por encima de la fotografía.
 */
export class IngredientBurstScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private groups: THREE.Group[] = [];
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    this.camera.position.set(0, 1.1, 4.2);
    this.camera.lookAt(0, 0.2, 0);

    const key = new THREE.DirectionalLight(0xfff0d6, 2.6);
    key.position.set(2, 4, 2.5);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xb8cdff, 0.6);
    fill.position.set(-2.5, 1.5, -1);
    this.scene.add(fill);
    this.scene.add(new THREE.HemisphereLight(0x2a2a3a, 0x08060a, 0.6));

    ingredients.forEach((ing) => {
      const g = buildIngredientProp(ing.id);
      g.scale.setScalar(0.001);
      this.scene.add(g);
      this.groups.push(g);
    });

    this.onResize();
  }

  onResize(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 400;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 400;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private update(t: number): void {
    const count = this.groups.length;
    const phase = (t % CYCLE) / CYCLE;
    // 0-0.4 sube y separa, 0.4-0.65 se mantiene arriba, 0.65-1 vuelve a formar la pizza.
    let local: number;
    if (phase < 0.4) local = smoothstep(phase / 0.4);
    else if (phase < 0.65) local = 1;
    else local = 1 - smoothstep((phase - 0.65) / 0.35);

    this.groups.forEach((g, i) => {
      const angle = (i / count) * Math.PI * 2 + t * 0.15;
      const radius = THREE.MathUtils.lerp(0.05, 1.15, local);
      const height = THREE.MathUtils.lerp(0.05, 1.4 + (i % 3) * 0.18, local) + Math.sin(t * 1.4 + i) * 0.04 * local;
      g.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.6 - 0.4);
      g.rotation.y = angle;
      g.scale.setScalar(THREE.MathUtils.lerp(0.001, 0.5, local));
    });
  }

  private loop = (): void => {
    this.raf = requestAnimationFrame(this.loop);
    this.update(this.clock.getElapsedTime());
    this.renderer.render(this.scene, this.camera);
  };

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
