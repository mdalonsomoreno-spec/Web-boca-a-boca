import * as THREE from "three";
import {
  makePepperGeometry,
  makeMeatChunkGeometry,
  makeOnionRingGeometry,
  makeChiliGeometry,
  makeCheeseDripGeometry,
  makeBaconGeometry,
} from "./blobs";
import { makeOrganicSkinTexture } from "./textures";

function physical(map: THREE.Texture, roughness: number, clearcoat = 0.3, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({ map, roughness, clearcoat, clearcoatRoughness: 0.25, side: THREE.DoubleSide, ...opts });
}

export function buildIngredientProp(id: string): THREE.Group {
  const group = new THREE.Group();
  group.name = id;

  switch (id) {
    case "pimiento": {
      const tex = makeOrganicSkinTexture("#d3311f", "#8f1c10", 512);
      const mesh = new THREE.Mesh(makePepperGeometry(11), physical(tex, 0.22, 0.9));
      mesh.scale.setScalar(1.1);
      group.add(mesh);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 0.22, 8),
        new THREE.MeshPhysicalMaterial({ color: "#3c5a2c", roughness: 0.7 }),
      );
      stem.position.y = 0.65;
      group.add(stem);
      break;
    }
    case "bacon": {
      const tex = makeOrganicSkinTexture("#b5544a", "#f0c8a0", 512);
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(makeBaconGeometry(i * 3 + 1), physical(tex, 0.55, 0.15));
        mesh.rotation.x = -Math.PI / 2.4;
        mesh.position.y = i * 0.05;
        mesh.position.x = i * 0.06 - 0.06;
        mesh.rotation.z = i * 0.25 - 0.25;
        group.add(mesh);
      }
      break;
    }
    case "queso": {
      const tex = makeOrganicSkinTexture("#f6d97a", "#fff2c2", 512);
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(makeCheeseDripGeometry(i * 2 + 5), physical(tex, 0.4, 0.7));
        mesh.rotation.z = (i - 1) * 0.5;
        mesh.position.x = (i - 1) * 0.28;
        mesh.position.y = -i * 0.05;
        group.add(mesh);
      }
      break;
    }
    case "carne": {
      const tex = makeOrganicSkinTexture("#7a3a24", "#4a2115", 512);
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(makeMeatChunkGeometry(i + 20), physical(tex, 0.55, 0.15));
        const a = (i / 6) * Math.PI * 2;
        mesh.position.set(Math.cos(a) * 0.32, Math.sin(i * 1.7) * 0.15, Math.sin(a) * 0.32);
        mesh.scale.setScalar(0.8 + Math.random() * 0.4);
        group.add(mesh);
      }
      break;
    }
    case "guindilla": {
      const tex = makeOrganicSkinTexture("#7fb238", "#3f6b1e", 512);
      for (let i = 0; i < 2; i++) {
        const mesh = new THREE.Mesh(makeChiliGeometry(i * 4 + 2), physical(tex, 0.28, 0.7));
        mesh.rotation.z = i === 0 ? 0.35 : -0.5;
        mesh.position.x = i === 0 ? -0.12 : 0.14;
        mesh.position.y = i === 0 ? 0.05 : -0.1;
        group.add(mesh);
      }
      break;
    }
    case "cebolla": {
      const tex = makeOrganicSkinTexture("#f3e9dc", "#c34f8a", 512);
      for (let i = 0; i < 3; i++) {
        const mesh = new THREE.Mesh(makeOnionRingGeometry(i + 8), physical(tex, 0.3, 0.5, { transmission: 0.06 }));
        mesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        mesh.position.y = i * 0.1 - 0.1;
        mesh.rotation.z = i * 0.4;
        mesh.scale.setScalar(1 - i * 0.12);
        group.add(mesh);
      }
      break;
    }
  }

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
    }
  });

  return group;
}
