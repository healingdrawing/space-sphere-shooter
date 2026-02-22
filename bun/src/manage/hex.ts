import type { ServerWebSocket } from "bun"
import { type WebSocketData } from ".."
import { DEVLOG, errlog, rawlog } from "../debug/debug"
import { mm } from "./message"
import { CCR } from './close'

/** set the ws.data.hex color of the client, to identify visually in games.
 * @param m - data, expected as proper chat message. Validated inside.
*/
export function hex_handler(
  ws:ServerWebSocket<WebSocketData>,
  m: Buffer
) {
  rawlog("hex message arrived") //todo remove

  if(ws.data.hex){
    ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason) //set only once or hijacking
    return
  }
  
  let obj:object
  try {
    obj = mm.u8aobj(m)
  } catch (e) {
    if(DEVLOG) errlog("hex_handler", e)
    ws.close(CCR.BROKENDATA.code, CCR.BROKENDATA.reason)
    return
  }
  

  
  // ws.data.hex = result.output.h
}
