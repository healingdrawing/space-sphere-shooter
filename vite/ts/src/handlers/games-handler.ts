import { ram } from "../ram";
import { mm } from "../tunnel";
import { game_tmdc_handler } from "./games/game-tmdc-handler";

/** manages games messages of type t === MT.G */
export function games_handler(text: string){
  console.log("games_handler incoming:", text)//todo remove
  const obj = mm.parse(text)
  
  try {
    // switch (ram.view){
    //   case CVT.GAME_TMDC: game_tmdc_handler(msg.c, msg.o || 0, msg.ms || 0); break
    //   default: console.log("games-handler.ts switch view error. Should never happen")
    // }
    
  } catch (e) {
    console.error("games_handler error:", e);
  }
}
