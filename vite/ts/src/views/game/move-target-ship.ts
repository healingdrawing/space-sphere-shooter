import { sfx } from "../../../sfx/sfx";
import type { Rotation } from "../../tunnel";
import { game_box } from "./game-box";
import { target_rotation } from "./rotate-ship";

export const move_target_ship = (data: Rotation) => {
  target_rotation(data)
  if(data.uuid === game_box.get_player_idx()) sfx.rotate()
}
