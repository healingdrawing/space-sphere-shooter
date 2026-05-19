import { crts } from "../../handlers/utils";
import { type NewRotation } from "../../tunnel";
import { game_box } from "./game-box";

export const target_rotation = (data: NewRotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  const now = crts()
  /* raw stop previous rotations */
  
  // check_rotations_metadata(ship_box, now+1)
  delete ship_box.metadata.targetRotation; //todo test

  // console.warn("target_rotation() call:", {
  //   avs: data.avs,  // angular velocity
  //   avs_ts: data.avs_ts,  // start time
  //   avs_tsend: data.avs_tsend,  // end time
  //   duration: data.avs_tsend - data.avs_ts,
  //   vectors: { fvx: data.fvx, fvy: data.fvy, fvz: data.fvz, tvx: data.tvx, tvy: data.tvy, tvz: data.tvz },
  // });

  //todo wip full refactor to quaternions
  
  // Get current live orientation
  const currentQuat = ship_box.rotationQuaternion || BABYLON.Quaternion.Identity();

  // Create target quaternion from desired front + top vectors
  const targetFront = new BABYLON.Vector3(data.fvx1, data.fvy1, data.fvz1);
  const targetTop = new BABYLON.Vector3(data.tvx1, data.tvy1, data.tvz1);

  const targetQuat = createQuaternionFromVectors(targetFront, targetTop);

  // Calculate total angle (radians)
  const dot = BABYLON.Quaternion.Dot(currentQuat, targetQuat);
  const clampedDot = Math.max(-1, Math.min(1, dot));
  const totalAngle = Math.acos(clampedDot);

  ship_box.metadata.targetRotation = {
      ts: now,
      av_rads: data.av,                    // angular velocity rad/s
      targetQuat: targetQuat,
      totalAngle: totalAngle,         // radians
      startQuat: currentQuat.clone(), // important for smooth interrupt
      progress: 0
  };
};

export function rotate_around_axis(ship: BABYLON.TransformNode, axis: BABYLON.Vector3, rot: {av: number}, dt: number) {
  const angleRad = rot.av * dt * Math.PI / 180;
  ship.rotateAround(ship.absolutePosition ,axis, angleRad);
}

/** clean if rotation complete */
export function check_rotations_metadata(ship_box:BABYLON.TransformNode){
  const meta = ship_box.metadata
  //todo full refactor without time, consider angle etc comparison
  if (meta.targetRotation) {
    if (meta.targetRotation.progress >= meta.targetRotation.totalAngle) {
      delete ship_box.metadata.targetRotation;
      console.warn("TARGET ROTATION END")
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

function createQuaternionFromVectors(front: BABYLON.Vector3, top: BABYLON.Vector3): BABYLON.Quaternion {
  const right = BABYLON.Vector3.Cross(top, front).normalize();
  const topRecalc = BABYLON.Vector3.Cross(front, right).normalize();

  const matrix = BABYLON.Matrix.Identity(); // better than Zero()

  // Use setRow or direct but safe assignment
  matrix.setRowFromFloats(0, right.x,   right.y,   right.z,   0);
  matrix.setRowFromFloats(1, topRecalc.x, topRecalc.y, topRecalc.z, 0);
  matrix.setRowFromFloats(2, front.x,   front.y,   front.z,   0);
  matrix.setRowFromFloats(3, 0,         0,         0,         1);

  return BABYLON.Quaternion.FromRotationMatrix(matrix);
}
