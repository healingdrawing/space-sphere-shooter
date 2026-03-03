import type { FrontRotation } from "../../tunnel";
import { front_rotation } from "./rotate-ship";

export const cwmove_ship = (data: FrontRotation) => {
  front_rotation(data)
}
