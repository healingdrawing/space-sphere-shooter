import { sfx } from "../../../sfx/sfx";
import type { FrontRotation } from "../../tunnel";
import { game_box } from "./game-box";
import { front_rotation } from "./rotate-ship";

export const move_cw_ship = (data: FrontRotation) => {
  front_rotation(data)
  if(data.uuid === game_box.get_player_idx()) sfx.rotate()
}
