import type { Frontmove } from "../../handlers/game/move-handler";
import { game_box } from "./game-box";

export const move_ship = (data: Frontmove) => {
  const mesh = game_box.ships[data.uuid]!
  mesh.position.set(data.cx, data.cy, data.cz);
  mesh.metadata.velocity = {x:data.vvx, y:data.vvy, z:data.vvz}
  console.log('move_ship called, velocity set to:', mesh.metadata.velocity); // DEBUG
}
