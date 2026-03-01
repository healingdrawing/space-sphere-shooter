import { ram } from "../../ram";
import { type Ship } from "../../tunnel";

export const add_ship = (ship: Ship, scene: BABYLON.Scene, ships:(BABYLON.Mesh | null)[]) => {
  console.log("add_ship data:", ship)

  const idx = ship.idx;
  if (idx < 1 || idx >= ram.umn){
    console.error("add_ship: wrong index of the ship. Should not happen ", idx)
    return null
  }

  if (ships[idx]){
    console.warn("attempt to rewrite already present ship. Expectable for join moment") //todo remove
    return null //todo implement. Raw skip the already present ship
  }

  const scale = 1 / 1000;  // common factor

  const ship_mesh = BABYLON.MeshBuilder.CreateBox(`ship-${idx}`, {
    width:  (ship.sr * 2) * scale,
    height: (ship.vr * 2) * scale,
    depth:  (ship.fr + ship.br) * 3 * scale // front + back radius  //warning to visual test 1000->300
  }, scene);

  const dot_size = ship.br / 1000;  // adjust divisor for visibility

  const f_dot = BABYLON.MeshBuilder.CreateSphere("frontDot", { diameter: dot_size }, scene);
  f_dot.position = new BABYLON.Vector3(0, 0, ship.fr * 4 * scale);
  f_dot.parent = ship_mesh;
  const f_mat = new BABYLON.StandardMaterial("blue", scene);
  f_mat.diffuseColor = BABYLON.Color3.Blue();
  f_mat.alpha = 1.0; // Make sure it's fully opaque
  f_mat.backFaceCulling = true; // Cull back faces
  f_dot.material = f_mat;



  const t_dot = BABYLON.MeshBuilder.CreateSphere("topDot", { diameter: dot_size }, scene);
  t_dot.position = new BABYLON.Vector3(0, ship.vr * 2 * scale, 0);
  t_dot.parent = ship_mesh;
  const t_mat = new BABYLON.StandardMaterial("green", scene);
  t_mat.diffuseColor = BABYLON.Color3.Green();
  t_mat.alpha = 1.0; // Make sure it's fully opaque
  t_mat.backFaceCulling = true; // Cull back faces
  t_dot.material = t_mat;


  const s_dot = BABYLON.MeshBuilder.CreateSphere("sideDot", { diameter: dot_size }, scene);
  s_dot.position = new BABYLON.Vector3(ship.sr * 2 * scale, 0,0);
  s_dot.parent = ship_mesh;
  const s_mat = new BABYLON.StandardMaterial("blue", scene);
  s_mat.diffuseColor = BABYLON.Color3.Red();
  s_mat.alpha = 1.0; // Make sure it's fully opaque
  s_mat.backFaceCulling = true; // Cull back faces
  s_dot.material = s_mat;


  // ship_mesh.showBoundingBox = true; //todo remove. test

  // Position at center
  ship_mesh.position.set(ship.cx, ship.cy, ship.cz);

  // Material
  const mat = new BABYLON.StandardMaterial(`ship-mat-${idx}`, scene);
  mat.diffuseColor = new BABYLON.Color3(ship.r/255, ship.g/255, ship.b/255);
  mat.emissiveColor = new BABYLON.Color3(ship.r * 0.3/255, ship.g * 0.3/255, ship.b * 0.3/255);
  mat.alpha = 1.0; // Make sure it's fully opaque
  mat.backFaceCulling = true; // Cull back faces
  ship_mesh.material = mat;

  // Orientation using front + top vectors
  const front = new BABYLON.Vector3(ship.fvx, ship.fvy, ship.fvz);
  // const top = new BABYLON.Vector3(ship.tvx, ship.tvy, ship.tvz);
  ship_mesh.lookAt(ship_mesh.position.add(front));
  
  // Store reference for later updates
  ship_mesh.metadata = { shipIndex: idx };

  ships[idx] = ship_mesh

  return ship_mesh;
}
