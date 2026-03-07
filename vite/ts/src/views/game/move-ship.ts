import type { Frontmove } from "../../tunnel";
import { game_box } from "./game-box";

export const move_ship = (data: Frontmove) => {
  const ship_box = game_box.ship_boxes[data.uuid]!
  console.log("ship_box.position:", ship_box.position, "server position:", data.cx, data.cy, data.cz)
  ship_box.position.set(data.cx, data.cy, data.cz);
  ship_box.metadata.velocity = {x:data.vvx, y:data.vvy, z:data.vvz, vts:data.vts}
  console.log('move_ship called, velocity set to:', ship_box.metadata.velocity,'data:',data); // DEBUG
  console.log("ship_box.position",ship_box.position)
}

/** clean if move complete */
export function check_move_metadata(box:BABYLON.TransformNode){
  if(!box.metadata){
    console.error("!box.metadata fired")
    return
  }
  if (box.metadata.velocity
    && !box.metadata.velocity.x
    && !box.metadata.velocity.y
    && !box.metadata.velocity.z
  ) {
    delete box.metadata.velocity;
    console.warn("MOVE FORWARD STOPPED")
    log_position(box)
  }
}

function log_position(mesh:BABYLON.TransformNode){
  // const mesh_top_end = mesh.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
  // const mesh_front_end = mesh.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
  const c = mesh.absolutePosition.asArray()
  
  /* create vector to rotate mesh to server sent orientation */
  
  /** correct mesh orientation top axis */
  // const top_dot = mesh_top_end.absolutePosition.asArray()
  // const t = gemm.vecXDone(gemm.vecXD(center_dot,top_dot))
    
  /** correct front axis */
  // const front_dot = mesh_front_end.absolutePosition.asArray()
  // const f = gemm.vecXDone(gemm.vecXD(center_dot,front_dot))

  console.log(
    "\ncx:", c[0]
    ,"\ncy:", c[1]
    ,"\ncz:", c[2]
  )
}
