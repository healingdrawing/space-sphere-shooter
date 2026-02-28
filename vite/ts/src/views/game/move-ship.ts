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
