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

  const ship_mesh = BABYLON.MeshBuilder.CreateBox(`ship-${idx}`, {
    width:  (ship.sr * 2)/1000,   // side radius * 2
    height: (ship.vr * 2)/1000,   // vertical radius * 2
    depth:  (ship.fr + ship.br)/1000   // front + back radius
  }, scene);

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
