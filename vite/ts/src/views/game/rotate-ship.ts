import { gemm, type FrontRotation, type SideRotation, type TopRotation } from "../../tunnel";
import { game_box } from "./game-box";
import { syncOrientation } from "./sync-orientation";

export const front_rotation = (data: FrontRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.frontRotation = {av: data.avf, ts: data.avf_ts, tsend: data.avf_tsend};
};

export const top_rotation = (data: TopRotation) => {
  const mesh = game_box.ships[data.uuid]!;
  //warning //bug syncO...
  console.log("TOP_ROTATION call:", {
    avt: data.avt,  // angular velocity
    avt_ts: data.avt_ts,  // start time
    avt_tsend: data.avt_tsend,  // end time
    duration: data.avt_tsend - data.avt_ts,
    fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz,    
  });
  
  // warning. glitching. very raw(possibly comment). must sync with server data before each rotation starts
  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  
  

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
  });

  syncOrientation(mesh, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  mesh.metadata.sideRotation = {av: data.avs, ts: data.avs_ts, tsend: data.avs_tsend};
};



export function rotateAxis(ship: BABYLON.Mesh, axis: BABYLON.Vector3, rot: {av: number, ts: number, tsend: number}, dt: number) {
  const angleRad = rot.av * dt * Math.PI / 180;
  ship.rotateAround(ship.absolutePosition ,axis, angleRad);
}

/** clean if rotation complete */
export function check_rotations_metadata(ship:BABYLON.Mesh, now: number){
  if (ship.metadata.sideRotation && now >= ship.metadata.sideRotation.tsend) {
    delete ship.metadata.sideRotation;
    console.warn("SIDE ROTATION END")
    log_orientation(ship)
  }
  if (ship.metadata.frontRotation && now >= ship.metadata.frontRotation.tsend) {
    delete ship.metadata.frontRotation;
    console.warn("FRONT ROTATION END")
    log_orientation(ship)
  }
  if (ship.metadata.topRotation && now >= ship.metadata.topRotation.tsend) {
    delete ship.metadata.topRotation;
    console.warn("TOP ROTATION END")
    log_orientation(ship)
  }
}

function log_orientation(mesh:BABYLON.Mesh){
  const mesh_top_end = mesh.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
  const mesh_front_end = mesh.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
  const center_dot = mesh.absolutePosition.asArray()
  
  /* create vector to rotate mesh to server sent orientation */
  
  /** correct mesh orientation top axis */
  const top_dot = mesh_top_end.absolutePosition.asArray()
  const t = gemm.vecXDone(gemm.vecXD(center_dot,top_dot))
    
  /** correct front axis */
  const front_dot = mesh_front_end.absolutePosition.asArray()
  const f = gemm.vecXDone(gemm.vecXD(center_dot,front_dot))

  console.log(
    "\nfvx:", f[0]
    ,"\nfvy:", f[1]
    ,"\nfvz:", f[2]
    ,"\ntvx:", t[0]
    ,"\ntvy:", t[1]
    ,"\ntvz:", t[2]
  )
}
