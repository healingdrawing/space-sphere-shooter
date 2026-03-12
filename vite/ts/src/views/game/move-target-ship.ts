import type { Rotation } from "../../tunnel";
import { target_rotation } from "./rotate-ship";

export const move_target_ship = (data: Rotation) => {
  target_rotation(data)
}
