import { gemm } from "../../tunnel";

export function sync_orientation(ship_box: BABYLON.TransformNode, fvx: number, fvy: number, fvz: number, tvx: number, tvy: number, tvz: number) {
  
  /** read the mesh orientation */
  const mcv  = ship_box.absolutePosition
  
  /* create vector to rotate mesh to server sent orientation */
  
  /** correct mesh orientation top axis */
  const mesh_top_v = ship_box.getDirection(BABYLON.Vector3.Up()).asArray()
  const server_top_v = [tvx,tvy,tvz]
  const raw_t_axis = gemm.vec3Dnormal(mesh_top_v, server_top_v)
  const fix_t_axis = BABYLON.Vector3.FromArray(raw_t_axis)
  const fix_t_angle = Math.acos(gemm.vecXDcos(mesh_top_v, server_top_v))
  console.warn("BEFORE SYNC: server_top_v", server_top_v, "mesh_top_v", mesh_top_v, "fix_t_axis", fix_t_axis, "fix_t_angle", fix_t_angle)// todo remove
  if(fix_t_angle && gemm.vecXDnorm(raw_t_axis)){
    ship_box.rotateAround(mcv, fix_t_axis, fix_t_angle)
    ship_box.computeWorldMatrix(true)
  }
  

  const mesh_top_v2 = ship_box.getDirection(BABYLON.Vector3.Up()).asArray()
  console.warn("AFTER SYNC: server_top_v", server_top_v, "mesh_top_v", mesh_top_v2)// todo remove
  
  /** correct front axis */
  const mesh_front_v = ship_box.getDirection(BABYLON.Vector3.Forward()).asArray()
  const server_front_v = [fvx,fvy,fvz]
  const raw_f_axis = gemm.vec3Dnormal(mesh_front_v, server_front_v)
  const fix_f_axis = BABYLON.Vector3.FromArray(raw_f_axis)
  const fix_f_angle = Math.acos(gemm.vecXDcos(mesh_front_v, server_front_v))
  console.log("fix_f_axis", fix_f_axis, "fix_f_angle", fix_f_angle)
  if(fix_f_angle && gemm.vecXDnorm(raw_f_axis)){
    ship_box.rotateAround(mcv, fix_f_axis, fix_f_angle)
    ship_box.computeWorldMatrix(true)
  }
  
  // todo // warning at the moment ship_box.computeWorldMatrix(true) visually fix the lags with rotations of the enemy ships. Tested shallow/visually. Possibly need one more call after second rotation (code line above).
}
