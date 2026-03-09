import type { SideRotation } from "../../tunnel";
import { side_rotation } from "./rotate-ship";

export const move_top_ship = (data: SideRotation) => {
  side_rotation(data)
}
