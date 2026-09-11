import * as THREE from "three";

export type CamKey = {
  p: number;
  angle: number;
  elevation: number;
  distance: number;
  fov: number;
  targetY: number;
};

// Recorrido continuo de cámara a lo largo de todo el scroll de la página.
// Nada de "sección 1 -> sección 2": un único paseo orbital con dolly.
export const CAMERA_KEYS: CamKey[] = [
  { p: 0.0, angle: -0.55, elevation: 0.5, distance: 4.6, fov: 32, targetY: 0.28 },
  { p: 0.12, angle: -0.1, elevation: 0.56, distance: 3.9, fov: 30, targetY: 0.3 },
  { p: 0.28, angle: 0.55, elevation: 0.68, distance: 4.3, fov: 30, targetY: 0.34 },
  { p: 0.46, angle: 1.35, elevation: 0.78, distance: 4.7, fov: 31, targetY: 0.38 },
  { p: 0.62, angle: 2.05, elevation: 0.5, distance: 5.6, fov: 34, targetY: 0.42 },
  { p: 0.8, angle: 2.7, elevation: 0.58, distance: 4.6, fov: 31, targetY: 0.35 },
  { p: 1.0, angle: 3.35, elevation: 0.62, distance: 3.7, fov: 29, targetY: 0.3 },
];

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function findSegment(p: number): [CamKey, CamKey, number] {
  const keys = CAMERA_KEYS;
  for (let i = 0; i < keys.length - 1; i++) {
    if (p >= keys[i].p && p <= keys[i + 1].p) {
      const span = keys[i + 1].p - keys[i].p || 1;
      const t = smoothstep((p - keys[i].p) / span);
      return [keys[i], keys[i + 1], t];
    }
  }
  return [keys[keys.length - 1], keys[keys.length - 1], 0];
}

export function evaluateCamera(p: number): { position: THREE.Vector3; target: THREE.Vector3; fov: number } {
  const [a, b, t] = findSegment(THREE.MathUtils.clamp(p, 0, 1));
  const angle = THREE.MathUtils.lerp(a.angle, b.angle, t);
  const elevation = THREE.MathUtils.lerp(a.elevation, b.elevation, t);
  const distance = THREE.MathUtils.lerp(a.distance, b.distance, t);
  const fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
  const targetY = THREE.MathUtils.lerp(a.targetY, b.targetY, t);

  const y = Math.sin(elevation) * distance;
  const horiz = Math.cos(elevation) * distance;
  const x = Math.cos(angle) * horiz;
  const z = Math.sin(angle) * horiz;

  return {
    position: new THREE.Vector3(x, y + 0.15, z),
    target: new THREE.Vector3(0, targetY, 0),
    fov,
  };
}
