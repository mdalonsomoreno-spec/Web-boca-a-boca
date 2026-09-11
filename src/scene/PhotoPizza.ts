import * as THREE from "three";

export type PhotoPizza = {
  group: THREE.Group;
  sprite: THREE.Sprite;
};

function makeShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.7, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function makeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,196,120,0.55)");
  g.addColorStop(0.5, "rgba(226,150,60,0.18)");
  g.addColorStop(1, "rgba(226,150,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Carga la fotografía real de la pizza como un sprite: siempre mira a la
 * cámara, así que el recorrido orbital de la cámara nunca la ve "de canto"
 * y no hace falta fingir geometría 3D sobre una imagen plana. La sensación
 * de profundidad viene del halo trasero (a otra distancia de cámara, con
 * su propio paralaje) y de la sombra de contacto bajo la bandeja.
 */
export function loadPhotoPizza(url: string): Promise<PhotoPizza> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;

        const aspect = tex.image.width / tex.image.height;
        const group = new THREE.Group();
        group.name = "photo-pizza";

        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: makeGlowTexture(),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        );
        glow.scale.set(4.2, 4.2, 1);
        glow.position.set(0, 0.45, -1.3);
        group.add(glow);

        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(spriteMat);
        const worldHeight = 2.15;
        sprite.scale.set(worldHeight * aspect, worldHeight, 1);
        sprite.position.set(0, 0.28, 0);
        group.add(sprite);

        const shadow = new THREE.Mesh(
          new THREE.CircleGeometry(1.85, 48),
          new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.62;
        group.add(shadow);

        resolve({ group, sprite });
      },
      undefined,
      reject,
    );
  });
}
