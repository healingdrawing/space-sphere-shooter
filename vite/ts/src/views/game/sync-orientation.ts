import { gemm } from "../../tunnel";

export function syncOrientation(mesh: BABYLON.Mesh, fvx: number, fvy: number, fvz: number, tvx: number, tvy: number, tvz: number) {
  
  /** read the mesh orientation */
  const mesh_top_end = mesh.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
  const mesh_front_end = mesh.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
  const center_dot = mesh.absolutePosition.asArray()
  
  /* create vector to rotate mesh to server sent orientation */
  
  /** correct mesh orientation top axis */
  const top_dot = mesh_top_end.absolutePosition.asArray()
  const mesh_top_v = gemm.vecXD(center_dot,top_dot)
  const server_top_v = [tvx,tvy,tvz]
  const raw_t_axis = gemm.vec3Dnormal(mesh_top_v, server_top_v)
  const fix_t_axis = BABYLON.Vector3.FromArray(raw_t_axis)
  const fix_t_angle = Math.acos(gemm.vecXDcos(mesh_top_v, server_top_v))
  console.warn("BEFORE SYNC: server_top_v", server_top_v, "mesh_top_v", mesh_top_v, "fix_t_axis", fix_t_axis, "fix_t_angle", fix_t_angle)
  if(fix_t_angle && gemm.vecXDnorm(raw_t_axis)) mesh.rotate(fix_t_axis, fix_t_angle, BABYLON.Space.LOCAL )
  
  const mesh_top_v2 = gemm.vecXD(mesh.absolutePosition.asArray(),mesh_top_end.absolutePosition.asArray())
  console.warn("AFTER SYNC: server_top_v", server_top_v, "mesh_top_v", mesh_top_v2)
  
  /** correct front axis */
  const front_dot = mesh_front_end.absolutePosition.asArray()
  const mesh_front_v = gemm.vecXD(center_dot,front_dot)
  const server_front_v = [fvx,fvy,fvz]
  const raw_f_axis = gemm.vec3Dnormal(mesh_front_v, server_front_v)
  const fix_f_axis = BABYLON.Vector3.FromArray(raw_f_axis)
  const fix_f_angle = Math.acos(gemm.vecXDcos(mesh_front_v, server_front_v))
  console.log("fix_f_axis", fix_f_axis, "fix_f_angle", fix_f_angle)
  if(fix_f_angle && gemm.vecXDnorm(raw_f_axis)) mesh.rotate(fix_f_axis, fix_f_angle, BABYLON.Space.LOCAL)
  
}
