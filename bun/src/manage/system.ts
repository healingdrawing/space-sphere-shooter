import { s, type WebSocketData } from ".."
import { DEVLOG, rawlog } from "../debug/debug"
import { MT } from "../enums/mt"
import { mm } from "./message"

/** Send system message for specified clients */
function system_message(
  m: string | Buffer,
  clients:Bun.ServerWebSocket<WebSocketData>[]
) {
  
  let obj:object
  try {
    obj = (typeof m === 'string')? mm.parse(m) : mm.u8aobj(m)
  } catch (e) {
    rawlog("system_message: ", e)
    return
  }

  

  const clen = clients.length
  for (let i=0;i<clen;i++){
    clients[i]!.send(mm.obju8a(obj))
    if(DEVLOG) rawlog("system_message result.output", mm.logobj(obj))
  }
}

/** broadcast system message for all connected clients. F.e. update chat limits on client side */
function broadcast(
  m: string | Buffer
){

  let obj:object
  try {
    obj = (typeof m === 'string')? mm.parse(m) : mm.u8aobj(m)
  } catch (e) {
    rawlog("broadcast", e)
    return
  }

  s.publish('game', mm.obju8a(obj))
}

/** create system message to alert client `{"t":${MT.S}, "alert_text":"${text}"}` as Uint8Array */
export const alert_text_system_message = (text: string) => mm.keyu8a(MT.S, mm.encode(`{"alert_text":"${text}"}`))
