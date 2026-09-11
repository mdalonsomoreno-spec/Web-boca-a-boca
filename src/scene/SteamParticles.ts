import * as THREE from "three";

function makeSteamTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.45)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export class SteamParticles {
  points: THREE.Points;
  private velocities: Float32Array;
  private origins: Float32Array;

  constructor(count = 34, radius = 1.1) {
    const positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count);
    this.origins = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.random() * 1.2;
      positions[i * 3 + 2] = z;
      this.origins[i * 2] = x;
      this.origins[i * 2 + 1] = z;
      this.velocities[i] = 0.06 + Math.random() * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      map: makeSteamTexture(),
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
  }

  update(dt: number, intensity: number): void {
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute;
    (this.points.material as THREE.PointsMaterial).opacity = 0.16 * intensity;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + this.velocities[i] * dt;
      if (y > 1.6) y = 0;
      const sway = Math.sin(y * 3 + i) * 0.05;
      pos.setXYZ(i, this.origins[i * 2] + sway, y, this.origins[i * 2 + 1] + sway * 0.6);
    }
    pos.needsUpdate = true;
  }
}
