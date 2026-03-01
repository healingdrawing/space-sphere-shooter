import type { FrontRotation, SideRotation, TopRotation } from "../../tunnel";
import { game_box } from "./game-box";

export const front_rotation = (data: FrontRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  // syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.frontRotation = {av: data.avf, ts: data.avf_ts, tsend: data.avf_tsend};
};

export const top_rotation = (data: TopRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  //warning //bug syncO...
  console.log("TOP_ROTATION called:", {
    avt: data.avt,  // angular velocity
    avt_ts: data.avt_ts,  // start time
    avt_tsend: data.avt_tsend,  // end time
    duration: data.avt_tsend - data.avt_ts,
    vectors: { fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz },
    meshQuatBefore: mesh.rotationQuaternion,
    meshRotBefore: mesh.rotation
  });
  
  // warning. very raw(possibly comment). must sync with server data before each rotation starts
  // syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  
  console.log("After sync:", {
    meshQuatAfter: mesh.rotationQuaternion,
    meshRotAfter: mesh.rotation
  });

  mesh.metadata.topRotation = {av: data.avt, ts: data.avt_ts, tsend: data.avt_tsend};
};

export const side_rotation = (data: SideRotation) => {
  const mesh = game_box.ships[data.uuid]!;

  console.log("SIDE_ROTATION called:", {
    avs: data.avs,  // angular velocity
    avs_ts: data.avs_ts,  // start time
    avs_tsend: data.avs_tsend,  // end time
    duration: data.avs_tsend - data.avs_ts,
    vectors: { fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz },
    meshQuatBefore: mesh.rotationQuaternion,
    meshRotBefore: mesh.rotation
  });

  // syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.sideRotation = {av: data.avs, ts: data.avs_ts, tsend: data.avs_tsend};
};



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
