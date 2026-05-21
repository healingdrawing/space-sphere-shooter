import { sfx } from "../../../sfx/sfx";
import type { Rotation } from "../../tunnel";
import { game_box } from "./game-box";
import { rotate_ship } from "./rotate-ship";

export const manage_rotation = (data: Rotation) => {
  rotate_ship(data)
  if(data.uuid === game_box.get_player_idx()) sfx.rotate()
}
