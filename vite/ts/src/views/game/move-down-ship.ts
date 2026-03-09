import type { SideRotation } from "../../tunnel";
import { side_rotation } from "./rotate-ship";

export const move_down_ship = (data: SideRotation) => {
  side_rotation(data)
}
