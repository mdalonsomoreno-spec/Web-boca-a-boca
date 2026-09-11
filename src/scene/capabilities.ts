/** Detecta si el dispositivo puede ejecutar la escena WebGL con garantías. */
export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Decide si se debe montar la escena 3D completa o el fallback fotográfico 2.5D. */
export function shouldUseWebGL(): boolean {
  return supportsWebGL2() && !prefersReducedMotion();
}

export type QualityTier = "full" | "reduced";

/** Calidad de efectos dentro de la escena 3D: menos partículas/bloom en gama baja. */
export function getQualityTier(): QualityTier {
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const narrow = window.innerWidth < 780;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return coarsePointer && (narrow || fewCores) ? "reduced" : "full";
}
