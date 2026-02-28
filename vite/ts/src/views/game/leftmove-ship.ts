import type { Leftmove } from "../../tunnel";
import { game_box } from "./game-box";

export const leftmove_ship = (data: Leftmove) => {
  const mesh = game_box.ships[data.uuid]!
  // rotate the mesh along top vector data.fvx/y/z, CCW direction
}
