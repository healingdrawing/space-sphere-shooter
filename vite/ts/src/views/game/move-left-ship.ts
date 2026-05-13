import { sfx } from "../../../sfx/sfx";
import type { TopRotation } from "../../tunnel";
import { game_box } from "./game-box";
import { top_rotation } from "./rotate-ship";

export const move_left_ship = (data: TopRotation) => {
  top_rotation(data)
  if(data.uuid === game_box.get_player_idx()) sfx.rotate()
}
