import * as THREE from "three";
import { fbm2 } from "./noise";

function ctx2d(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Convierte un canvas en escala de grises (altura) en un normal map. */
function heightToNormal(heightCanvas: HTMLCanvasElement, strength = 2.2): THREE.CanvasTexture {
  const { canvas, ctx } = ctx2d(heightCanvas.width);
  const src = heightCanvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
  const out = ctx.createImageData(canvas.width, canvas.height);
  const w = canvas.width;
  const h = canvas.height;
  const at = (x: number, y: number) => {
    const xi = (x + w) % w;
    const yi = (y + h) % h;
    return src.data[(yi * w + xi) * 4] / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = at(x - 1, y);
      const r = at(x + 1, y);
      const u = at(x, y - 1);
      const d = at(x, y + 1);
      const dx = (l - r) * strength;
      const dy = (u - d) * strength;
      const nz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + nz * nz);
      const i = (y * w + x) * 4;
      out.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Masa/crust: fondo tostado con manchas de leopardo y polvo de harina. */
export function makeCrustTextures(size = 1024) {
  const { canvas, ctx } = ctx2d(size);
  const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.1, size * 0.5, size * 0.5, size * 0.55);
  grad.addColorStop(0, "#e7bd76");
  grad.addColorStop(0.55, "#d9a75e");
  grad.addColorStop(1, "#c4874a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Charring por niveles de ruido fbm (level-set): las siluetas orgánicas
  // salen del propio campo de ruido, no de círculos estampados, así que no
  // hay dos manchas iguales ni bordes geométricos.
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.5;
  const charImg = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) / maxR;
      const dy = (y - cy) / maxR;
      const rn = Math.sqrt(dx * dx + dy * dy);
      const edgeBias = THREE.MathUtils.clamp(0.15 + rn * 0.95, 0, 1);

      const charField = fbm2(x * 0.018, y * 0.018, 4) * 0.6 + fbm2(x * 0.05 + 30, y * 0.05 + 30, 3) * 0.4;
      const charMask = Math.max(0, charField * edgeBias - 0.12) * 1.6;

      const speckle = Math.max(0, fbm2(x * 0.12 + 80, y * 0.12 + 80, 2)) * edgeBias * 0.5;
      const dark = Math.min(1, charMask + speckle * 0.6);

      if (dark > 0.01) {
        const i = (y * size + x) * 4;
        const toBrown = [66, 38, 18];
        charImg.data[i] = charImg.data[i] * (1 - dark) + toBrown[0] * dark;
        charImg.data[i + 1] = charImg.data[i + 1] * (1 - dark) + toBrown[1] * dark;
        charImg.data[i + 2] = charImg.data[i + 2] * (1 - dark) + toBrown[2] * dark;
      }
    }
  }
  ctx.putImageData(charImg, 0, 0);

  // Polvo de harina.
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(255,248,230,${Math.random() * 0.25})`;
    ctx.fillRect(x, y, 1 + Math.random(), 1 + Math.random());
  }

  const color = toTexture(canvas);

  // Height map para normal map (poros de la masa).
  const { canvas: hc, ctx: hctx } = ctx2d(size);
  const img = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.04, y * 0.04, 5) * 0.6 + fbm2(x * 0.01, y * 0.01, 2) * 0.4;
      const v = Math.floor((n * 0.5 + 0.5) * 255);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  hctx.putImageData(img, 0, 0);
  const normal = heightToNormal(hc, 1.6);

  return { color, normal };
}

/** Queso fundido + toques de tomate asomando + oregano. */
export function makeCheeseTextures(size = 1024) {
  const { canvas, ctx } = ctx2d(size);
  ctx.fillStyle = "#e0b24a";
  ctx.fillRect(0, 0, size, size);

  // Todo el relieve del queso (tono base, zonas tostadas y toques de
  // tomate asomando) sale de campos de ruido evaluados por píxel: las
  // siluetas son las curvas de nivel del propio ruido, nunca círculos
  // estampados, así que no hay dos zonas iguales ni bordes geométricos.
  const img = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.006, y * 0.006, 5);
      const n2 = fbm2(x * 0.02 + 50, y * 0.02 + 50, 3);
      const i = (y * size + x) * 4;
      const base = 0.55 + n * 0.35 + n2 * 0.08;
      let r = 214 + base * 40 - 10;
      let g = 168 + base * 45 - 20;
      let b = 92 + base * 30 - 20;

      const toastField = fbm2(x * 0.014 + 200, y * 0.014 + 200, 4) * 0.65 + fbm2(x * 0.04 + 5, y * 0.04 + 5, 3) * 0.35;
      const toastMask = Math.max(0, toastField - 0.18) * 1.5;
      if (toastMask > 0.01) {
        // La elección tostado-claro / tostado-oscuro también sigue un campo de
        // ruido coherente (no Math.random() por píxel, que daría grano de estática).
        const dark = fbm2(x * 0.02 + 900, y * 0.02 + 900, 2) > -0.05;
        const toastColor: [number, number, number] = dark ? [110, 60, 18] : [255, 226, 165];
        const w = Math.min(1, toastMask) * (dark ? 0.85 : 0.55);
        r = r * (1 - w) + toastColor[0] * w;
        g = g * (1 - w) + toastColor[1] * w;
        b = b * (1 - w) + toastColor[2] * w;
      }

      const sauceField = fbm2(x * 0.03 + 500, y * 0.03 + 500, 4);
      const sauceMask = Math.max(0, sauceField - 0.5) * 2.2;
      if (sauceMask > 0.01) {
        const w = Math.min(1, sauceMask) * 0.75;
        r = r * (1 - w) + 178 * w;
        g = g * (1 - w) + 42 * w;
        b = b * (1 - w) + 30 * w;
      }

      img.data[i] = Math.max(0, Math.min(255, r));
      img.data[i + 1] = Math.max(0, Math.min(255, g));
      img.data[i + 2] = Math.max(0, Math.min(255, b));
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Oregano / especias.
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(50,60,25,${0.3 + Math.random() * 0.4})`;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillRect(0, 0, 1 + Math.random() * 2.5, 0.6 + Math.random());
    ctx.restore();
  }

  const color = toTexture(canvas);

  // Roughness map: el queso brillante (grasa) es más liso en manchas.
  const { canvas: rc, ctx: rctx } = ctx2d(size);
  const rimg = rctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.015 + 200, y * 0.015 + 200, 4);
      const v = Math.floor(120 + n * 90);
      const i = (y * size + x) * 4;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(30, Math.min(220, v));
      rimg.data[i + 3] = 255;
    }
  }
  rctx.putImageData(rimg, 0, 0);
  const roughness = toTexture(rc);
  roughness.colorSpace = THREE.NoColorSpace;

  // Height map -> normal (burbujas de queso).
  const { canvas: hc, ctx: hctx } = ctx2d(size);
  const himg = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.012, y * 0.012, 5) * 0.7 + fbm2(x * 0.05 + 9, y * 0.05 + 9, 3) * 0.3;
      const v = Math.floor((n * 0.5 + 0.5) * 255);
      const i = (y * size + x) * 4;
      himg.data[i] = himg.data[i + 1] = himg.data[i + 2] = v;
      himg.data[i + 3] = 255;
    }
  }
  hctx.putImageData(himg, 0, 0);
  const normal = heightToNormal(hc, 2.4);

  return { color, roughness, normal };
}

/** Pepperoni: rojo especiado, borde tostado, moteado graso. */
export function makePepperoniTexture(size = 256): THREE.CanvasTexture {
  const { canvas, ctx } = ctx2d(size);
  const grad = ctx.createRadialGradient(size * 0.4, size * 0.4, size * 0.05, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, "#c9432f");
  grad.addColorStop(0.6, "#a92c22");
  grad.addColorStop(1, "#7a1f18");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * size * 0.42;
    const x = size / 2 + Math.cos(a) * r;
    const y = size / 2 + Math.sin(a) * r;
    ctx.fillStyle = `rgba(255,225,200,${0.15 + Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Highlight de grasa brillante.
  const hi = ctx.createRadialGradient(size * 0.35, size * 0.32, 0, size * 0.35, size * 0.32, size * 0.28);
  hi.addColorStop(0, "rgba(255,255,255,0.35)");
  hi.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hi;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Borde ligeramente carbonizado.
  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = "rgba(50,20,15,0.55)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  return toTexture(canvas);
}

/** Textura orgánica genérica (piel de ingrediente) a partir de dos colores. */
export function makeOrganicSkinTexture(base: string, shade: string, size = 512): THREE.CanvasTexture {
  const { canvas, ctx } = ctx2d(size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  const baseColor = new THREE.Color(base);
  const shadeColor = new THREE.Color(shade);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm2(x * 0.01, y * 0.01, 5) * 0.5 + 0.5;
      const c = baseColor.clone().lerp(shadeColor, n * 0.8);
      const i = (y * size + x) * 4;
      img.data[i] = c.r * 255;
      img.data[i + 1] = c.g * 255;
      img.data[i + 2] = c.b * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(canvas);
}
