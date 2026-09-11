import * as THREE from "three";
import { fbm2, noise2 } from "./noise";
import { makeCrustTextures, makeCheeseTextures, makePepperoniTexture } from "./textures";

const CRUST_RADIUS = 2.0;
const CHEESE_RADIUS = 1.72;

function crustEdgeOffset(theta: number, seed: number): number {
  return (
    fbm2(Math.cos(theta) * 1.5 + seed, Math.sin(theta) * 1.5 + seed, 3) * 0.09 +
    Math.sin(theta * 5 + seed) * 0.012
  );
}

function makeCrustShape(seed: number): THREE.Shape {
  const shape = new THREE.Shape();
  const segments = 160;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const r = CRUST_RADIUS + crustEdgeOffset(theta, seed);
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function cheeseHeight(x: number, z: number, seed: number): number {
  const r = Math.sqrt(x * x + z * z);
  const rn = r / CHEESE_RADIUS;
  const undulation = fbm2(x * 1.1 + seed, z * 1.1 + seed, 5) * 0.045;
  const puff = fbm2(x * 3.2 + seed * 2, z * 3.2 + seed * 2, 3) * 0.014;
  const rimPool = Math.max(0, rn - 0.72) * 0.22 * (0.4 + noise2(x * 2 + seed, z * 2 + seed) * 0.6);
  return 0.05 + undulation + puff + rimPool;
}

function makeCheeseGeometry(seed: number): THREE.BufferGeometry {
  const rings = 44;
  const segs = 96;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let ring = 0; ring <= rings; ring++) {
    const rn = ring / rings;
    const r = rn * CHEESE_RADIUS;
    for (let s = 0; s <= segs; s++) {
      const theta = (s / segs) * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = r < 0.001 ? cheeseHeight(0.001, 0.001, seed) : cheeseHeight(x, z, seed);
      positions.push(x, y, z);
      normals.push(0, 1, 0);
      uvs.push(0.5 + (x / CHEESE_RADIUS) * 0.5, 0.5 + (z / CHEESE_RADIUS) * 0.5);
    }
  }

  const rowLen = segs + 1;
  for (let ring = 0; ring < rings; ring++) {
    for (let s = 0; s < segs; s++) {
      const a = ring * rowLen + s;
      const b = (ring + 1) * rowLen + s;
      const c = (ring + 1) * rowLen + s + 1;
      const d = ring * rowLen + s + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function makePepperoniGeometry(radius: number, thickness: number, curl: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radius, radius * 0.97, thickness, 28, 1, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const rr = Math.sqrt(x * x + z * z) / radius;
    if (y > 0) {
      const bump = Math.pow(rr, 3) * curl * (0.7 + noise2(x * 8, z * 8) * 0.3);
      pos.setY(i, y + bump);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function makeLeafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.09, 0.05, 0.11, 0.18);
  shape.quadraticCurveTo(0.1, 0.32, 0, 0.4);
  shape.quadraticCurveTo(-0.1, 0.32, -0.11, 0.18);
  shape.quadraticCurveTo(-0.09, 0.05, 0, 0);
  return shape;
}

export function buildPizza(seed = 7): THREE.Group {
  const group = new THREE.Group();
  group.name = "pizza";

  const crustShape = makeCrustShape(seed);
  const crustGeo = new THREE.ExtrudeGeometry(crustShape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.07,
    bevelSegments: 6,
    curveSegments: 128,
    steps: 1,
  });
  crustGeo.rotateX(-Math.PI / 2);
  crustGeo.translate(0, -0.02, 0);
  const { color: crustColor, normal: crustNormal } = makeCrustTextures(640);
  const crustMat = new THREE.MeshPhysicalMaterial({
    map: crustColor,
    normalMap: crustNormal,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 0.92,
    metalness: 0,
    clearcoat: 0.05,
  });
  const crust = new THREE.Mesh(crustGeo, crustMat);
  crust.castShadow = true;
  crust.receiveShadow = true;
  group.add(crust);

  const cheeseGeo = makeCheeseGeometry(seed);
  const { color: cheeseColor, roughness: cheeseRough, normal: cheeseNormal } = makeCheeseTextures(640);
  const cheeseMat = new THREE.MeshPhysicalMaterial({
    map: cheeseColor,
    roughnessMap: cheeseRough,
    normalMap: cheeseNormal,
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughness: 0.75,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
  });
  const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
  cheese.position.y = 0.3;
  cheese.castShadow = true;
  cheese.receiveShadow = true;
  group.add(cheese);

  const pepperoniTex = makePepperoniTexture(256);
  const pepMat = new THREE.MeshPhysicalMaterial({
    map: pepperoniTex,
    roughness: 0.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const pepGeoBase = makePepperoniGeometry(0.185, 0.045, 0.05);
  const pepCount = 13;
  for (let i = 0; i < pepCount; i++) {
    const a = (i / pepCount) * Math.PI * 2 + noise2(i, 3.1) * 0.6;
    const r = 0.35 + Math.abs(noise2(i * 3.7, 1.2)) * 1.05;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = 0.3 + cheeseHeight(x, z, seed);
    const mesh = new THREE.Mesh(i % 3 === 0 ? makePepperoniGeometry(0.15, 0.04, 0.045) : pepGeoBase, pepMat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = noise2(i * 5.5, 8.2) * Math.PI;
    mesh.rotation.x = noise2(i * 1.9, 4.4) * 0.12;
    mesh.rotation.z = noise2(i * 2.9, 6.4) * 0.12;
    mesh.castShadow = true;
    group.add(mesh);
  }

  const leafShape = makeLeafShape();
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.006, bevelEnabled: false, curveSegments: 12 });
  leafGeo.rotateX(-Math.PI / 2);
  leafGeo.translate(-0.02, 0, -0.1);
  const leafMat = new THREE.MeshPhysicalMaterial({ color: "#2f5c2a", roughness: 0.45, clearcoat: 0.3, side: THREE.DoubleSide });
  const leafPositions = [
    { a: 0.4, r: 1.1 },
    { a: 2.6, r: 0.75 },
    { a: 4.3, r: 1.25 },
  ];
  leafPositions.forEach((p, i) => {
    const x = Math.cos(p.a) * p.r;
    const z = Math.sin(p.a) * p.r;
    const y = 0.3 + cheeseHeight(x, z, seed) + 0.01;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(x, y, z);
    leaf.rotation.y = p.a + i;
    leaf.scale.setScalar(1.15 + noise2(i, 9) * 0.2);
    leaf.castShadow = true;
    group.add(leaf);
  });

  // Sombra de contacto suave (blob) bajo la pizza.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext("2d")!;
  const sg = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  sg.addColorStop(0, "rgba(0,0,0,0.55)");
  sg.addColorStop(0.7, "rgba(0,0,0,0.25)");
  sg.addColorStop(1, "rgba(0,0,0,0)");
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(2.9, 48), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.19;
  group.add(shadowMesh);

  return group;
}
