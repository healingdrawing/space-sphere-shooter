import { ram } from "../../ram";
import { type Ship } from "../../tunnel";
import { createRawShipHull } from "./ship-mesh";

export const add_ship = async (ship: Ship, scene: BABYLON.Scene, ship_boxes:(BABYLON.TransformNode | null)[]) => {
  console.log("add_ship data:", ship)

  const idx = ship.idx;
  if (idx < 1 || idx > ram.umn){
    console.error("add_ship: wrong index of the ship. Should not happen ", idx)
    return null
  }

  if (ship_boxes[idx]){
    console.warn("attempt to rewrite already present ship. idx: "+idx+" ships[idx]: ",ship_boxes[idx]) //todo remove
    return null //todo implement. Raw skip the already present ship
  }

  const scale = 1;  // common factor //warning change it to potentially ruin collisions etc

  const box = new BABYLON.TransformNode(`ship-box-${idx}`, scene);
  box.position.set(ship.cx, ship.cy, ship.cz);
  box.metadata = {} // warning this needed, or metadata is null and check of subprops is not straight

  const {hull, core} = await createRawShipHull(ship, scene, scale)
  hull.parent = box
  hull.position = BABYLON.Vector3.Zero();   // reset local pos after baking, attempt to fix displacement after async CSG2 implemented
  core.parent = box
  
  // Material
  const mat = new BABYLON.StandardMaterial(`ship-mat-${idx}`, scene);
  mat.diffuseColor = new BABYLON.Color3(ship.r/255, ship.g/255, ship.b/255);
  mat.emissiveColor = new BABYLON.Color3(ship.r * 0.3/255, ship.g * 0.3/255, ship.b * 0.3/255);
  mat.alpha = 1.0; // Make sure it's fully opaque
  mat.backFaceCulling = true; // Cull back faces
  hull.material = mat;

  // Orientation using front + top vectors
  const front = new BABYLON.Vector3(ship.fvx, ship.fvy, ship.fvz);
  // const top = new BABYLON.Vector3(ship.tvx, ship.tvy, ship.tvz);
  hull.lookAt(hull.position.add(front));
  
  ship_boxes[idx] = box

  const dot_size = ship.br / 2 * scale;

  /* todo these dots are not needed, just visual markers */
  const f_dot = BABYLON.MeshBuilder.CreateSphere("frontDot", { diameter: dot_size }, scene);
  f_dot.position = new BABYLON.Vector3(0, 0, ship.fr * 2 * scale);
  f_dot.parent = box;
  const f_mat = new BABYLON.StandardMaterial("blue", scene);
  f_mat.diffuseColor = BABYLON.Color3.Blue();
  f_mat.alpha = 1.0; // Make sure it's fully opaque
  f_mat.backFaceCulling = true; // Cull back faces
  f_dot.material = f_mat;



  const t_dot = BABYLON.MeshBuilder.CreateSphere("topDot", { diameter: dot_size }, scene);
  t_dot.position = new BABYLON.Vector3(0, ship.vr * 2 * scale, 0);
  t_dot.parent = box;
  const t_mat = new BABYLON.StandardMaterial("green", scene);
  t_mat.diffuseColor = BABYLON.Color3.Green();
  t_mat.alpha = 1.0; // Make sure it's fully opaque
  t_mat.backFaceCulling = true; // Cull back faces
  t_dot.material = t_mat;


  const s_dot = BABYLON.MeshBuilder.CreateSphere("sideDot", { diameter: dot_size }, scene);
  s_dot.position = new BABYLON.Vector3(ship.sr * 2 * scale, 0,0);
  s_dot.parent = box;
  const s_mat = new BABYLON.StandardMaterial("blue", scene);
  s_mat.diffuseColor = BABYLON.Color3.Red();
  s_mat.alpha = 1.0; // Make sure it's fully opaque
  s_mat.backFaceCulling = true; // Cull back faces
  s_dot.material = s_mat;

  hull.showBoundingBox = true; //todo remove. test
  const axes = new BABYLON.Debug.AxesViewer(scene, 10)
  axes.xAxis.parent = box;
  axes.yAxis.parent = box;
  axes.zAxis.parent = box;

  return box;
}
