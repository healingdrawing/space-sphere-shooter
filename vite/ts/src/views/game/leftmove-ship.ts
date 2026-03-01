import type { TopRotation } from "../../tunnel";
import { top_rotation } from "./rotate-ship";

export const leftmove_ship = (data: TopRotation) => {
  top_rotation(data)
}
