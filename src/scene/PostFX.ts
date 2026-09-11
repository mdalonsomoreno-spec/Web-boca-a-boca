import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export function setupComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): { composer: EffectComposer; bloom: UnrealBloomPass; setSize: (w: number, h: number) => void } {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.6, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const setSize = (w: number, h: number) => {
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
  };

  return { composer, bloom, setSize };
}
