import { DEVLOG, rawlog } from "../debug/debug"
import { mm } from "./message"
import { CCR } from './close'
import { MT } from '../enums/mt'
import type { WebSocketData } from ".."
import { games_handler } from "./games"
import { hex_handler } from "./hex"

/**
 * handle all incoming websocket messages
 * @param m - incoming message from client
 * */
export function handle_ws_message(
  ws:Bun.ServerWebSocket<WebSocketData>,
  m: string | Buffer
) {
  rawlog("handle_ws_message():",m) //todo remove. Message size limit implemented in index.ts
  
  if (typeof m === 'string') { ws.close(CCR.STRING.code, CCR.STRING.reason); return}

  /* check the key is valid, so client allowed to send messages, or ban */
  const d = ws.data
  if (m[0] !== d.key )  { ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason); return}
  const key = Math.floor(Math.random() * 255) + 1
  if(DEVLOG) rawlog("key:", key)
  d.key = key
  ws.send(new Uint8Array([key]))

  /** cut key, keep raw message data */
  const msg = m.subarray(1)
  let mt:number
  try {
    mt = mm.extract_buffer_message_type(msg)
  } catch (e) {
    ws.close(CCR.BROKENTYPE.code, CCR.BROKENTYPE.reason); return
  }

  ws.send(m) //todo remove . test keymap gap

  // switch (mt) {
  //   case MT.G: games_handler(ws, msg); break //todo implement for all MT enum values
    
  //   default:{
  //     ws.close(CCR.BROKENTYPE.code, CCR.BROKENTYPE.reason)
  //     if(DEVLOG) rawlog("wrong message type received", mt)
  //   }
  // }

}
