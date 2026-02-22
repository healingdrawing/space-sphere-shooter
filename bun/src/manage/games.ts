import type { ServerWebSocket } from "bun"
// import { users } from "../ram/consts"
import { type WebSocketData } from ".."
import { DEVLOG, errlog, rawlog } from "../debug/debug"
import { CCR } from "./close"
import { mm } from "./message"
import { gamerooms, send_delayed_messages } from "../gameroom/base"

// todo implement for all types of the games
/** handle game message */
export function games_handler(
  ws:ServerWebSocket<WebSocketData>,
  m: Buffer
) {
  rawlog("game message arrived") //todo remove
  let obj:object
  try {
    obj = mm.u8aobj(m)
  } catch (e) {
    if(DEVLOG) errlog("games_handler", e)
    ws.close(CCR.BROKENDATA.code, CCR.BROKENDATA.reason)
    return
  }
  
  // const msgs = gameroom.handle_game_message(result.output, ws.data.role)
  // send_delayed_messages(gameroom.id, msgs)

}
