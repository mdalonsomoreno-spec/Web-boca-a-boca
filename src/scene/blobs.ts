import * as THREE from "three";
import { fbm3 } from "./noise";

/** Desplaza los vértices de una geometría a lo largo de su normal usando ruido fbm. */
export function displaceOrganic(
  geometry: THREE.BufferGeometry,
  amp: number,
  freq: number,
  seed = 0,
): THREE.BufferGeometry {
  geometry.computeVertexNormals();
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const n = fbm3(px * freq + seed, py * freq + seed * 2, pz * freq + seed * 3, 4);
    pos.setXYZ(i, px + nx * n * amp, py + ny * n * amp, pz + nz * n * amp);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function makePepperGeometry(seed = 1): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.5, 4);
  geo.scale(0.85, 1.15, 0.85);
  return displaceOrganic(geo, 0.09, 3.2, seed);
}

export function makeMeatChunkGeometry(seed = 2): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.24, 2);
  return displaceOrganic(geo, 0.08, 5, seed);
}

export function makeOnionRingGeometry(seed = 3): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(0.4, 0.09, 12, 48);
  return displaceOrganic(geo, 0.02, 6, seed);
}

export function makeChiliGeometry(seed = 4): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segs = 20;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const r = 0.14 * (1 - t) ** 0.6 + 0.015;
    points.push(new THREE.Vector2(r, t * 1.4));
  }
  const geo = new THREE.LatheGeometry(points, 16);
  geo.center();
  return displaceOrganic(geo, 0.012, 8, seed);
}

export function makeCheeseDripGeometry(seed = 5): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const segs = 16;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const r = 0.3 * Math.sin(Math.PI * (1 - t) * 0.5) ** 0.6 + 0.02;
    points.push(new THREE.Vector2(Math.max(r, 0.015), t * 0.9));
  }
  const geo = new THREE.LatheGeometry(points, 20);
  geo.center();
  return displaceOrganic(geo, 0.02, 6, seed);
}

export function makeBaconGeometry(seed = 6): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(0.9, 0.3, 24, 8);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave = Math.sin(x * 6 + seed) * 0.05 + Math.sin(x * 13 + seed * 2) * 0.02;
    pos.setZ(i, wave + Math.sin(y * 10) * 0.015);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
