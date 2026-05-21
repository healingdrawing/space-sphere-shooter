import { crts } from "../../handlers/utils";
import { type Rotation } from "../../tunnel";
import { game_box } from "./game-box";
import { sync_orientation } from "./sync-orientation";

export const rotate_ship = (data: Rotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  /* raw stop previous rotations */
  const now = crts()
  /* patch to force function rotate to present timestamp */
  check_rotations_metadata(ship_box, now+1)
  
  // console.warn("target_rotation() call:", {
  //   avs: data.avs,  // angular velocity
  //   avs_ts: data.avs_ts,  // start time
  //   avs_tsend: data.avs_tsend,  // end time
  //   duration: data.avs_tsend - data.avs_ts,
  //   vectors: { fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz },
  // });

  sync_orientation(ship_box, data.fvx, data.fvy, data.fvz, data.tvx, data.tvy, data.tvz);
  ship_box.metadata.rotation = {
    av: data.av, ran: data.ran, pan: 0,
    avx: data.avx, avy: data.avy, avz: data.avz,
    ts: now,
  };
};

export function rotate_around_axis(ship: BABYLON.TransformNode, axis: BABYLON.Vector3, rot: {av: number}, dt: number) {
  const angleRad = rot.av * dt * Math.PI / 180;
  ship.rotateAround(ship.absolutePosition ,axis, angleRad);
  ship.computeWorldMatrix(true) //todo nope, some jerking happens every rotation in initial moment in this case
}

/** clean if rotation complete */
export function check_rotations_metadata(ship_box:BABYLON.TransformNode, now: number){
  const meta = ship_box.metadata
  if (meta.rotation) {
    const mtr = meta.rotation
    const dt = (now - mtr.ts)/1000
    const pp = mtr.pan + mtr.av * dt
    if (pp >= mtr.ran) {
      /* additional check to rotate, closer to final expected rotation */
      if (pp > mtr.ran){ /* need rotate up to equal condition */
        const mini_dt = mtr.ran/pp*dt
        // meta_target.ts = now // commented since metadata will be removed anyways
        const axis = new BABYLON.Vector3(
          mtr.avx,
          mtr.avy,
          mtr.avz
        )
        rotate_around_axis(ship_box, axis, mtr, mini_dt);
      }
      delete ship_box.metadata.rotation;
      console.warn("ROTATION END")
      log_orientation(ship_box)
    }
  }

}

function log_orientation(ship_box:BABYLON.TransformNode){
  const t = ship_box.getDirection(BABYLON.Vector3.Up()).asArray()
  const f = ship_box.getDirection(BABYLON.Vector3.Forward()).asArray()
  
  console.log(
    "\nfvx:", f[0]
    ,"\nfvy:", f[1]
    ,"\nfvz:", f[2]
    ,"\ntvx:", t[0]
    ,"\ntvy:", t[1]
    ,"\ntvz:", t[2]
  )
}
