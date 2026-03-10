import { MT } from "../tunnel";
import { exit_handler } from "./game/exit-handler";
import { move_handler } from "./game/move-handler";
import { join_handler } from "./game/join-handler";
import { ship_handler } from "./game/ship-handler";
import { system_handler } from "./system_handler";
import { move_left_handler } from "./game/move-left-handler";
import { move_top_handler } from "./game/move-top-handler";
import { move_right_handler } from "./game/move-right-handler";
import { move_down_handler } from "./game/move-down-handler";
import { move_cw_handler } from "./game/move-cw-handler";
import { move_ccw_handler } from "./game/move-ccw-handler";
import { shot_handler } from "./game/shot-handler";

/** handle all messages(by type t:MT). Upper level manager/router */
export function all_handler(text: string, mt:number){
  switch (mt) {
    case MT.JOIN: join_handler(text); break
    case MT.EXIT: exit_handler(text); break
    case MT.SHIP: ship_handler(text); break
    case MT.FRONTSHOT:
    case MT.LEFTSHOT:
    case MT.RIGHTSHOT:
    case MT.BACKSHOT:
    case MT.TOPSHOT:
    case MT.DOWNSHOT: shot_handler(text); break
    case MT.FRONTMOVE: move_handler(text); break
    case MT.STOPMOVE: move_handler(text); break
    case MT.LEFTMOVE: move_left_handler(text); break
    case MT.RIGHTMOVE: move_right_handler(text); break
    case MT.TOPMOVE: move_top_handler(text); break
    case MT.DOWNMOVE: move_down_handler(text); break
    case MT.CWMOVE: move_cw_handler(text); break
    case MT.CCWMOVE: move_ccw_handler(text); break
    // case MT.TARGETMOVE: targetmove_handler(text); break
    case MT.S: system_handler(text); break

    default: console.error("all_handler() switch default: wrong message type received", mt)
  }
}
