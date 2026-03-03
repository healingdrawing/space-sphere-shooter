import type { SideRotation } from "../../tunnel";
import { side_rotation } from "./rotate-ship";

export const downmove_ship = (data: SideRotation) => {
  side_rotation(data)
}
