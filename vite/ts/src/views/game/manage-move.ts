import { sfx } from "../../../sfx/sfx";
import type { Frontmove } from "../../tunnel";
import { game_box } from "./game-box";
import { move_ship } from "./move-ship";

export const manage_move = (data: Frontmove) => {
  move_ship(data)
  if(data.uuid === game_box.get_player_idx()) sfx.move()
}
