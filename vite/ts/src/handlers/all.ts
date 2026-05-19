import { MT } from "../tunnel";
import { exit_handler } from "./game/exit-handler";
import { move_handler } from "./game/move-handler";
import { join_handler } from "./game/join-handler";
import { ship_handler } from "./game/ship-handler";
import { system_handler } from "./system_handler";
import { shot_handler } from "./game/shot-handler";
import { move_target_handler } from "./game/move-target-handler";

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
    case MT.FRONTMOVE:
    case MT.STOPMOVE: move_handler(text); break
    case MT.TARGETMOVE: move_target_handler(text); break
    case MT.S: system_handler(text); break

    default: console.error("all_handler() switch default: wrong message type received", mt)
  }
}
