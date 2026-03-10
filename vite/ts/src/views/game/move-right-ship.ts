import type { TopRotation } from "../../tunnel";
import { top_rotation } from "./rotate-ship";

export const move_right_ship = (data: TopRotation) => {
  top_rotation(data)
}
