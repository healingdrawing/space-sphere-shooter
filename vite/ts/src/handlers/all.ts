import { mm, MT } from "../tunnel";
import { big_box } from "../views/bigbox";
import { broadcast_handler } from "./broadcast_handler";
import { system_handler } from "./system_handler";

/** handle all messages(by type t:MT). Upper level manager/router */
export function all_handler(text: string, mt:number){
  
  
    switch (mt) {
      // case MT.G: games_handler(text); break //todo implement for all MT enum values
      // case MT.S: system_handler(text); break
      // case MT.B: broadcast_handler(text); break
      default: console.error("wrong message type received", mt)
    }
}
