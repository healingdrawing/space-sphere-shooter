import type { Ship } from "../../tunnel";

export async function createRawShipHull(ship: Ship, scene: BABYLON.Scene, scale: number = 1) {
  
  const sr = ship.sr * scale, vr = ship.vr * scale, fr = ship.fr * scale, br = ship.br * scale;
  const w = sr*2, h = vr*2, d = fr+br;
  const d_core = ship.mass/1000;

  // 1. back half
  const backFull = BABYLON.MeshBuilder.CreateSphere("backFull", {diameterX: sr*2, diameterY: vr*2, diameterZ: br*2}, scene);
  const backCut = BABYLON.MeshBuilder.CreateBox("backCut", {width: sr*4, height: vr*4, depth: br}, scene);
  backCut.position.z = br/2 + 0.001;
  let hullCSG = BABYLON.CSG2.FromMesh(backFull).subtract(BABYLON.CSG2.FromMesh(backCut));
  backFull.dispose(); backCut.dispose();

  // 2. front half
  const frontFull = BABYLON.MeshBuilder.CreateSphere("frontFull", {diameterX: sr*2, diameterY: vr*2, diameterZ: fr*2}, scene);
  const frontCut = BABYLON.MeshBuilder.CreateBox("frontCut", {width: sr*4, height: vr*4, depth: fr}, scene);
  frontCut.position.z = -fr/2 - 0.001;
  const frontCSG = BABYLON.CSG2.FromMesh(frontFull).subtract(BABYLON.CSG2.FromMesh(frontCut));
  hullCSG = hullCSG.add(frontCSG); // or .union(frontCSG)
  frontFull.dispose(); frontCut.dispose();

  // 3. 8 corner cuts
  const dmin = Math.min(w, h, d);
  const fat = 0.05 * dmin;
  const cuts = [
    [ w*0.5 + fat,  h*0.5 + fat,  d*0.5 + fat],
    [-w*0.5 - fat,  h*0.5 + fat,  d*0.5 + fat],
    [ w*0.5 + fat, -h*0.5 - fat,  d*0.5 + fat],
    [-w*0.5 - fat, -h*0.5 - fat,  d*0.5 + fat],
    [ w*0.5 + fat,  h*0.5 + fat, -d*0.5 - fat],
    [-w*0.5 - fat,  h*0.5 + fat, -d*0.5 - fat],
    [ w*0.5 + fat, -h*0.5 - fat, -d*0.5 - fat],
    [-w*0.5 - fat, -h*0.5 - fat, -d*0.5 - fat],
  ];

  for (const [dx, dy, dz] of cuts) {
    const box = BABYLON.MeshBuilder.CreateBox("cut", { width: w, height: h, depth: d }, scene);
    box.position.set(dx, dy, dz);
    hullCSG = hullCSG.subtract(BABYLON.CSG2.FromMesh(box));
    box.dispose();
  }

  // 4. central hole
  const hole = BABYLON.MeshBuilder.CreateSphere("hole", {diameter: d_core * 1.9}, scene);
  hullCSG = hullCSG.subtract(BABYLON.CSG2.FromMesh(hole));
  hole.dispose();

  const hull = hullCSG.toMesh("hullWithHole", scene);

  /* attempt to fix displacement after async CSG2 implemented */
  hull.rotation = new BABYLON.Vector3(0, 0, 0);
  hull.rotationQuaternion = null;     // force euler if you use euler
  hull.bakeCurrentTransformIntoVertices();   // bake rotation into vertices (most reliable)

  // 5. core (separate)
  const core = BABYLON.MeshBuilder.CreateSphere("core", {diameter: d_core * 1.8}, scene);

  return { hull, core };
}
