import type { Ship } from "../../tunnel";

export const add_ship = (shipData: Ship, scene: BABYLON.Scene) => {
  console.log("add_ship data:", shipData)
  const shipMesh = BABYLON.MeshBuilder.CreateBox(`ship-${shipData.idx}`, {
    width:  shipData.sr * 2,   // side radius * 2
    height: shipData.vr * 2,   // vertical radius * 2
    depth:  (shipData.fr + shipData.br)   // front + back radius
  }, scene);

  // Position at center
  shipMesh.position.set(shipData.cx, shipData.cy, shipData.cz);

  // Material
  const mat = new BABYLON.StandardMaterial(`ship-mat-${shipData.idx}`, scene);
  mat.diffuseColor = new BABYLON.Color3(shipData.r/255, shipData.g/255, shipData.b/255);
  mat.emissiveColor = new BABYLON.Color3(shipData.r * 0.3/255, shipData.g * 0.3/255, shipData.b * 0.3/255);
  shipMesh.material = mat;

  // Orientation using front + top vectors
  const front = new BABYLON.Vector3(shipData.fvx, shipData.fvy, shipData.fvz);
  const top = new BABYLON.Vector3(shipData.tvx, shipData.tvy, shipData.tvz);
  shipMesh.lookAt(shipMesh.position.add(front));
  
  // Store reference for later updates
  shipMesh.metadata = { shipIndex: shipData.idx };

  return shipMesh;
}