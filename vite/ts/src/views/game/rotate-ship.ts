import { crts } from "../../handlers/utils";
import { gemm, type FrontRotation, type SideRotation, type TopRotation } from "../../tunnel";
import { game_box } from "./game-box";
import { syncOrientation } from "./sync-orientation";

export const front_rotation = (data: FrontRotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  /* raw stop previous rotations */
  const now = crts()
  /* patch to force function rotate to present timestamp */
  if(ship_box.metadata.sideRotation) ship_box.metadata.sideRotation.tsend = now;
  if(ship_box.metadata.topRotation) ship_box.metadata.topRotation.tsend = now;
  check_rotations_metadata(ship_box, now+1)
  delete ship_box.metadata.sideRotation;
  delete ship_box.metadata.topRotation;
  syncOrientation(ship_box, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  ship_box.metadata.frontRotation = {av: data.avf, ts: data.avf_ts, tsend: data.avf_tsend};
};

export const top_rotation = (data: TopRotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  /* raw stop previous rotations */
  const now = crts()
  /* patch to force function rotate to present timestamp */
  if(ship_box.metadata.frontRotation) ship_box.metadata.frontRotation.tsend = now;
  if(ship_box.metadata.sideRotation) ship_box.metadata.sideRotation.tsend = now;
  check_rotations_metadata(ship_box, now+1)
  delete ship_box.metadata.frontRotation;
  delete ship_box.metadata.sideRotation;

  //warning //bug syncO...
  // console.log("TOP_ROTATION call:", {
  //   avt: data.avt,  // angular velocity
  //   avt_ts: data.avt_ts,  // start time
  //   avt_tsend: data.avt_tsend,  // end time
  //   duration: data.avt_tsend - data.avt_ts,
  //   fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz,    
  // });
  syncOrientation(ship_box, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  ship_box.metadata.topRotation = {av: data.avt, ts: data.avt_ts, tsend: data.avt_tsend};
};

export const side_rotation = (data: SideRotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  /* raw stop previous rotations */
  const now = crts()
  /* patch to force function rotate to present timestamp */
  if(ship_box.metadata.topRotation) ship_box.metadata.topRotation.tsend = now;
  if(ship_box.metadata.frontRotation) ship_box.metadata.frontRotation.tsend = now;
  check_rotations_metadata(ship_box, now+1)
  delete ship_box.metadata.topRotation;
  delete ship_box.metadata.frontRotation;

  // console.log("SIDE_ROTATION called:", {
  //   avs: data.avs,  // angular velocity
  //   avs_ts: data.avs_ts,  // start time
  //   avs_tsend: data.avs_tsend,  // end time
  //   duration: data.avs_tsend - data.avs_ts,
  //   vectors: { fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz },
  // });

  syncOrientation(ship_box, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  ship_box.metadata.sideRotation = {av: data.avs, ts: data.avs_ts, tsend: data.avs_tsend};
};



export function rotate_around_axis(ship: BABYLON.TransformNode, axis: BABYLON.Vector3, rot: {av: number, ts: number, tsend: number}, dt: number) {
  const angleRad = rot.av * dt * Math.PI / 180;
  ship.rotateAround(ship.absolutePosition ,axis, angleRad);
}

/** clean if rotation complete */
export function check_rotations_metadata(ship_box:BABYLON.TransformNode, now: number){
  const meta = ship_box.metadata
  if (meta.sideRotation) {
    const meta_side = meta.sideRotation
    const side_tsend = meta_side.tsend
    if (now >= side_tsend) {
      /* additional check to rotate, closer to final expected rotation */
      if (now > side_tsend){ /* need rotate up to equal condition */
        const fake_dt = (side_tsend - meta_side.ts) / 1000
        // meta_side.ts = now // commented since metadata will be removed anyways
        // const axisend = ship_box.getChildren().find(c => c.name === "sideDot") as BABYLON.Mesh;
        // const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship_box.absolutePosition.asArray(), axisend.absolutePosition.asArray())).negate()
        const axis = ship_box.getDirection(BABYLON.Vector3.Left())
        rotate_around_axis(ship_box, axis, meta_side, fake_dt);
      }
      delete ship_box.metadata.sideRotation;
      console.warn("SIDE ROTATION END")
      log_orientation(ship_box)
    }
  }
  if (meta.frontRotation) {
    const meta_front = meta.frontRotation
    const front_tsend = meta_front.tsend
    if (now >= front_tsend) {
      /* additional check to rotate, closer to final expected rotation */
      if (now > front_tsend){ /* need rotate up to equal condition */
        const fake_dt = (front_tsend - meta_front.ts) / 1000
        // meta_front.ts = now // commented since metadata will be removed anyways
        // const axisend = ship_box.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
        // const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship_box.absolutePosition.asArray(), axisend.absolutePosition.asArray()))
        const axis = ship_box.getDirection(BABYLON.Vector3.Forward())
        rotate_around_axis(ship_box, axis, meta_front, fake_dt);
      }
      delete ship_box.metadata.frontRotation;
      console.warn("FRONT ROTATION END")
      log_orientation(ship_box)
    }
  }
  if (meta.topRotation) {
    const meta_top = meta.topRotation
    const top_tsend = meta_top.tsend
    if (now >= top_tsend) {
      /* additional check to rotate, closer to final expected rotation */
      if (now > top_tsend){ /* need rotate up to equal condition */
        const fake_dt = (top_tsend - meta_top.ts) / 1000
        // console.log(
        //   "\nts:", meta_top.ts,
        //   "\ntsend:", meta_top.tsend,
        //   "\nnow:", now,
        //   "\nfake_dt:", fake_dt
        // )
        ship_box.metadata.topRotation.ts = now // commented since metadata will be removed anyways
        // const axisend = ship_box.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
        // const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship_box.absolutePosition.asArray(), axisend.absolutePosition.asArray()))
        const axis = ship_box.getDirection(BABYLON.Vector3.Up())
        rotate_around_axis(ship_box, axis, meta_top, fake_dt);
      }
      delete ship_box.metadata.topRotation;
      console.warn("TOP ROTATION END")
      log_orientation(ship_box)
    }
  }
}

function log_orientation(ship_box:BABYLON.TransformNode){
  const box_top_end = ship_box.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
  const box_front_end = ship_box.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
  const center_dot = ship_box.absolutePosition.asArray()
  
  /* create vector to rotate mesh to server sent orientation */
  
  /** correct mesh orientation top axis */
  const top_dot = box_top_end.absolutePosition.asArray()
  const t = gemm.vecXDone(gemm.vecXD(center_dot,top_dot))
    
  /** correct front axis */
  const front_dot = box_front_end.absolutePosition.asArray()
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
