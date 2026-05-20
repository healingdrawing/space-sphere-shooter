import { crts } from "../../handlers/utils";
import { type NewRotation } from "../../tunnel";
import { game_box } from "./game-box";

export const target_rotation = (data: NewRotation) => {
  const ship_box = game_box.ship_boxes[data.uuid]!;
  const now = crts()
  /* raw stop previous rotations */
  
  delete ship_box.metadata.targetRotation; //todo test

  // Get current live orientation
  const currentQuat = ship_box.rotationQuaternion?.clone() || BABYLON.Quaternion.Identity();

  // Create target quaternion from desired front + top vectors
  const targetFront = new BABYLON.Vector3(data.fvx1, data.fvy1, data.fvz1).normalize();
  const targetTop = new BABYLON.Vector3(data.tvx1, data.tvy1, data.tvz1).normalize();

  let targetQuat = createQuaternionFromVectors(targetFront, targetTop);

  // Fix opposite direction (common Babylon issue)
  if (BABYLON.Quaternion.Dot(currentQuat, targetQuat) < 0) {
    targetQuat = targetQuat.scale(-1);
}

  // Calculate total angle (radians)
  let dot = BABYLON.Quaternion.Dot(currentQuat, targetQuat);
  dot = Math.max(-1, Math.min(1, dot));
  const totalAngle = 2 * Math.acos(Math.abs(dot));

  ship_box.metadata.targetRotation = {
      ts: now,
      av_rads: data.av,                    // angular velocity rad/s
      targetQuat: targetQuat,
      totalAngle: totalAngle,         // radians
      startQuat: currentQuat.clone(), // important for smooth interrupt
      progress: 0
  };
};

/** clean if rotation complete */
export function check_rotations_metadata(ship_box:BABYLON.TransformNode){
  const meta = ship_box.metadata
  //todo full refactor without time, consider angle etc comparison
  if (meta.targetRotation) {
    if (meta.targetRotation.progress >= meta.targetRotation.totalAngle) {
      ship_box.rotationQuaternion = meta.targetRotation.targetQuat.clone();
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
