import type { FrontRotation, SideRotation, TopRotation } from "../../tunnel";
import { game_box } from "./game-box";

export const front_rotation = (data: FrontRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.frontRotation = {av: data.avf, ts: data.avf_ts, tsend: data.avf_tsend};
};

export const top_rotation = (data: TopRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  //warning //bug syncO...
  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.topRotation = {av: data.avt, ts: data.avt_ts, tsend: data.avt_tsend};
};

export const side_rotation = (data: SideRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.sideRotation = {av: data.avs, ts: data.avs_ts, tsend: data.avs_tsend};
};

function syncOrientation(mesh: BABYLON.Mesh, fvx: number, fvy: number, fvz: number, tvx: number, tvy: number, tvz: number) {
  const front = new BABYLON.Vector3(fvx, fvy, fvz);
  const top = new BABYLON.Vector3(tvx, tvy, tvz);
  const side = BABYLON.Vector3.Cross(top, front);
  // icorrect row-major-order , since babylonjs expects another order. 
  // const mat = BABYLON.Matrix.FromArray([
  //   side.x, top.x, front.x, 0,
  //   side.y, top.y, front.y, 0,
  //   side.z, top.z, front.z, 0,
  //   0,      0,      0,      1
  // ]);

  // correct column-major-order
  const mat = BABYLON.Matrix.FromArray([
    side.x, side.y, side.z, 0,
    top.x,  top.y,  top.z,  0,
    front.x, front.y, front.z, 0,
    0,      0,      0,      1
  ]);
  mesh.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(mat);
}

export function rotateAxis(ship: BABYLON.Mesh, axis: BABYLON.Vector3, rot: {av: number, ts: number, tsend: number}, dt: number) {
  const angleRad = rot.av * dt * Math.PI / 180;
  ship.rotate(axis, angleRad, BABYLON.Space.LOCAL);
}

/** clean if rotation complete */
export function check_rotations_metadata(ship:BABYLON.Mesh, now: number){
  if (ship.metadata.frontRotation && now >= ship.metadata.frontRotation.tsend) {
    delete ship.metadata.frontRotation;
  }
  if (ship.metadata.topRotation && now >= ship.metadata.topRotation.tsend) {
    delete ship.metadata.topRotation;
  }
  if (ship.metadata.sideRotation && now >= ship.metadata.sideRotation.tsend) {
    delete ship.metadata.sideRotation;
  }
}
