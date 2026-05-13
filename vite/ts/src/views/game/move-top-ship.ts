import { sfx } from "../../../sfx/sfx";
import type { SideRotation } from "../../tunnel";
import { game_box } from "./game-box";
import { side_rotation } from "./rotate-ship";

export const move_top_ship = (data: SideRotation) => {
  side_rotation(data)
  if(data.uuid === game_box.get_player_idx()) sfx.rotate()
}
