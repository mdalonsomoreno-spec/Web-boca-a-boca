import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function setupEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();
}

export function setupLighting(scene: THREE.Scene): void {
  const key = new THREE.DirectionalLight(0xfff0d6, 3.4);
  key.position.set(2.6, 4.6, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 12;
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.radius = 4;
  key.shadow.bias = -0.0015;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xb8cdff, 0.55);
  fill.position.set(-3.4, 2.2, -1.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd9a0, 1.6);
  rim.position.set(-0.6, 3.2, -4.2);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0x2a2a3a, 0x08060a, 0.55);
  scene.add(hemi);
}
