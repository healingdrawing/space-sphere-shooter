import type { Frontmove } from "../../tunnel";
import { game_box } from "./game-box";

export const move_ship = (data: Frontmove, front:boolean) => {
  const mesh = game_box.ships[data.uuid]!
  console.log("mesh.position:", mesh.position, "server position:", data.cx, data.cy, data.cz)
  mesh.position.set(data.cx, data.cy, data.cz);
  mesh.metadata.velocity = {x:data.vvx, y:data.vvy, z:data.vvz, vts:data.vts}
  console.log('move_ship called, velocity set to:', mesh.metadata.velocity,'data:',data); // DEBUG
  console.log("mesh.position",mesh.position)
}

/** clean if move complete */
export function check_move_metadata(ship:BABYLON.Mesh){
  if (ship.metadata.velocity
    && !ship.metadata.velocity.x
    && !ship.metadata.velocity.y
    && !ship.metadata.velocity.z
  ) {
    delete ship.metadata.velocity;
    console.warn("MOVE FORWARD STOPPED")
    log_position(ship)
  }
}

function log_position(mesh:BABYLON.Mesh){
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
