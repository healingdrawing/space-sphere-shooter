import { MT } from "../tunnel";
import { exit_handler } from "./game/exit-handler";
import { move_handler } from "./game/move-handler";
import { join_handler } from "./game/join-handler";
import { ship_handler } from "./game/ship-handler";
import { system_handler } from "./system_handler";

/** handle all messages(by type t:MT). Upper level manager/router */
export function all_handler(text: string, mt:number){
  switch (mt) {
    case MT.JOIN: join_handler(text); break
    case MT.EXIT: exit_handler(text); break
    case MT.SHIP: ship_handler(text); break
    // case MT.FRONTSHOT: frontshot_handler(text); break
    // case MT.LEFTSHOT: leftshot_handler(text); break
    // case MT.RIGHTSHOT: rightshot_handler(text); break
    // case MT.BACKSHOT: backshot_handler(text); break
    // case MT.TOPSHOT: topshot_handler(text); break
    // case MT.DOWNSHOT: downshot_handler(text); break
    case MT.FRONTMOVE: move_handler(text); break
    case MT.STOPMOVE: move_handler(text, false); break
    // case MT.LEFTMOVE: leftmove_handler(text); break
    // case MT.RIGHTMOVE: rightmove_handler(text); break
    // case MT.TOPMOVE: topmove_handler(text); break
    // case MT.DOWNMOVE: downmove_handler(text); break
    // case MT.CWMOVE: cwmove_handler(text); break
    // case MT.CCWMOVE: ccwmove_handler(text); break
    // case MT.TARGETMOVE: targetmove_handler(text); break
    case MT.S: system_handler(text); break

    default: console.error("all_handler() switch default: wrong message type received", mt)
  }
}
