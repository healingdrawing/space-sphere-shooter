import type { Ship } from "../../tunnel";

export function createRawShipHull(ship: Ship, scene: BABYLON.Scene, scale: number = 1) {
  const sr = ship.sr * scale, vr = ship.vr * scale, fr = ship.fr * scale, br = ship.br * scale;
  const w = sr*2, h = vr*2, d = fr+br;
  const d_core = ship.mass/1000
  
  // 1. back half
  const backFull = BABYLON.MeshBuilder.CreateSphere("backFull", {diameterX: sr*2, diameterY: vr*2, diameterZ: br*2}, scene);
  const backCut = BABYLON.MeshBuilder.CreateBox("backCut", {width: sr*4, height: vr*4, depth: br}, scene);
  backCut.position.z = br/2 + 0.001;
  let hull = BABYLON.CSG.FromMesh(backFull).subtract(BABYLON.CSG.FromMesh(backCut)).toMesh("backPart");
  backFull.dispose(); backCut.dispose();

  // 2. front half
  const frontFull = BABYLON.MeshBuilder.CreateSphere("frontFull", {diameterX: sr*2, diameterY: vr*2, diameterZ: fr*2}, scene);
  const frontCut = BABYLON.MeshBuilder.CreateBox("frontCut", {width: sr*4, height: vr*4, depth: fr}, scene);
  frontCut.position.z = -fr/2 - 0.001;
  hull = BABYLON.CSG.FromMesh(hull).union(BABYLON.CSG.FromMesh(frontFull).subtract(BABYLON.CSG.FromMesh(frontCut))).toMesh("rawHull");
  frontFull.dispose(); frontCut.dispose();

  // 3. 4 side cuts
  
  const dmin = Math.min(w, h, d);
  const fat = 0.05 * dmin;

  const cuts = [
    // front (+Z)
    [ w*0.5 + fat,  h*0.5 + fat,  d*0.5 + fat],
    [-w*0.5 - fat,  h*0.5 + fat,  d*0.5 + fat],
    [ w*0.5 + fat, -h*0.5 - fat,  d*0.5 + fat],
    [-w*0.5 - fat, -h*0.5 - fat,  d*0.5 + fat],
    // back (-Z)
    [ w*0.5 + fat,  h*0.5 + fat, -d*0.5 - fat],
    [-w*0.5 - fat,  h*0.5 + fat, -d*0.5 - fat],
    [ w*0.5 + fat, -h*0.5 - fat, -d*0.5 - fat],
    [-w*0.5 - fat, -h*0.5 - fat, -d*0.5 - fat],
  ];

  let csg = BABYLON.CSG.FromMesh(hull);

  for (const [dx, dy, dz] of cuts) {
    const box = BABYLON.MeshBuilder.CreateBox("cut", { width: w, height: h, depth: d }, scene);
    box.position.set(dx, dy, dz);
    csg = csg.subtract(BABYLON.CSG.FromMesh(box));
    box.dispose();
  }

  hull = csg.toMesh("hullCut");

  // 4. central hole
  const hole = BABYLON.MeshBuilder.CreateSphere("hole", {diameter: d_core * 1.9}, scene);
  hull = BABYLON.CSG.FromMesh(hull).subtract(BABYLON.CSG.FromMesh(hole)).toMesh("hullWithHole");
  hole.dispose();

  // 5. core (separate)
  const core = BABYLON.MeshBuilder.CreateSphere("core", {diameter: d_core * 1.8}, scene);

  return { hull, core };
}