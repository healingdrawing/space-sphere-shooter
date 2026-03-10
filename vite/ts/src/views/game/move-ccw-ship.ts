import type { FrontRotation } from "../../tunnel";
import { front_rotation } from "./rotate-ship";

export const move_ccw_ship = (data: FrontRotation) => {
  front_rotation(data)
}
