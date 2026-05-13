import { sfx } from "../../../sfx/sfx";
import { crts } from "../../handlers/utils";
import { gemm, type LazerBeam } from "../../tunnel";
import { game_box } from "./game-box";

export const lazer_shot = (data: LazerBeam) => {
  console.warn("lazer shot")
  const s = game_box.ship_boxes[data.uuid]
  if(!s) {
    console.error("\nship not found")
    return
  }
  const a_rad = gemm.radians(data.a/2) // half because x4 beams planned from center to sides
  
  const start = s.absolutePosition
  console.log("s.absxyz", start)
  const end = new BABYLON.Vector3(data.x, data.y, data.z) //warning //todo here server sent d1000 as end of lazer beam, so it is limited in screen less than skybox that is 10000. Maybe consider sent from server increased length, or recalculate here(bad patch + extra calcs) uses gemm.dotXDoffset(...9000...)
  /* start dot */
  const sdot = [start.x, start.y, start.z]
  /* end dot */
  const edot = [data.x, data.y, data.z]
  /** beam vector */
  const bv = gemm.vecXDone(gemm.vecXD(sdot,edot))
  /** beam front vector BABYLON */
  const front_axis = new BABYLON.Vector3(bv[0],bv[1],bv[2])
  
  /* side vector, to rotate in vertical plane */
  const sv = gemm.vec3Dnormal(bv, [data.nx, data.ny, data.nz])
  const side_axis = new BABYLON.Vector3(sv[0], sv[1], sv[2]).normalize()
  const vert_axis = new BABYLON.Vector3(data.nx, data.ny, data.nz).normalize()
  const scene = game_box.get_scene()
  lazer_beam(start, end, front_axis, data.d, side_axis.clone(), a_rad, scene)
  lazer_beam(start, end, front_axis, data.d, side_axis.clone().negate(), a_rad, scene)
  lazer_beam(start, end, front_axis, data.d, vert_axis.clone(), a_rad, scene)
  lazer_beam(start, end, front_axis, data.d, vert_axis.clone().negate(), a_rad, scene)
  if(data.uuid === game_box.get_player_idx()) sfx.shot()
}

/**
 * // todo refactor to separated coordinates when suitable. F.e. bv can be BABYLON.Vector3 also, or bvx,bvy,bvz
 * @param start dot of beam trajectory, and also center of rotation of the beam mesh
 * @param end end of trajectory in far
 * @param front_axis to move visible beam start point outside ship mesh along beam direction
 * @param d displacement along fron_axis of the beam
 * @param axis rotation axis of the beam in time of animation
 * @param angle_rad rotation angle of the beam during animation
 * @param scene 
 */
function lazer_beam(start: BABYLON.Vector3, end: BABYLON.Vector3, front_axis: BABYLON.Vector3,
  d:number, axis: BABYLON.Vector3, angle_rad: number, scene: BABYLON.Scene) {
  try {
    const tube = BABYLON.MeshBuilder.CreateTube("laser", {
      path: [start.clone(), end.clone()],
      radius: 0.15,
      updatable: false
    }, scene);

    /* offset along beam vector, to move beam visible start outside the ship mesh */
    tube.position = front_axis.scale(d);
  
    tube.metadata = {animation:{
      pivot: start.clone(),
      axis: axis.normalize(),
      angle_rad,
      last_ms:crts(), // last time animation rendered
      elapsed_ms: 0,
      duration_ms: 50 // 200 ms = 0.2 sec = duration of the animation
    }};
  
    const laserMat = new BABYLON.StandardMaterial("laserMat", scene);
    laserMat.emissiveColor = new BABYLON.Color3(1, 0.2, 0.1);
    tube.material = laserMat;
  
    const glow = game_box.get_glow_box()
    glow.addIncludedOnlyMesh(tube);
  
    game_box.animated_lazer_beams.push(tube);
    
  } catch (e) {
    console.error("lazer_beam() crush: "+e)
  }
  
}
