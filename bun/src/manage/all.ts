import { DEVLOG, rawlog } from "../debug/debug"
import { mm } from "./message"
import { CCR } from './close'
import { MT } from '../enums/mt'
import type { WebSocketData } from ".."
import { hex_handler } from "./hex"
import {
  handle_back_shot, handle_ccw_move, handle_cw_move, handle_down_move,
  handle_down_shot, handle_exit, handle_front_move, handle_front_shot,
  handle_left_move, handle_left_shot, handle_right_move, handle_right_shot,
  handle_stop_move, handle_target_move, handle_top_move, handle_top_shot
} from './game'

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
  
  switch (mt) {
    case MT.EXIT:
      handle_exit(ws, msg);
      break;
  
    case MT.FRONTSHOT:
      handle_front_shot(ws, msg);
      break;
  
    case MT.LEFTSHOT:
      handle_left_shot(ws, msg);
      break;
  
    case MT.RIGHTSHOT:
      handle_right_shot(ws, msg);
      break;
  
    case MT.BACKSHOT:
      handle_back_shot(ws, msg);
      break;
  
    case MT.TOPSHOT:
      handle_top_shot(ws, msg);
      break;
  
    case MT.DOWNSHOT:
      handle_down_shot(ws, msg);
      break;
  
    case MT.FRONTMOVE:
      handle_front_move(ws, msg);
      break;
  
    case MT.STOPMOVE:
      handle_stop_move(ws, msg);
      break;
  
    case MT.LEFTMOVE:
      handle_left_move(ws, msg);
      break;
  
    case MT.RIGHTMOVE:
      handle_right_move(ws, msg);
      break;
  
    case MT.TOPMOVE:
      handle_top_move(ws, msg);
      break;
  
    case MT.DOWNMOVE:
      handle_down_move(ws, msg);
      break;
  
    case MT.CWMOVE:
      handle_cw_move(ws, msg);
      break;
  
    case MT.CCWMOVE:
      handle_ccw_move(ws, msg);
      break;
  
    case MT.TARGETMOVE:
      handle_target_move(ws, msg);
      break;
  
    default:
      ws.close(CCR.BROKENTYPE.code, CCR.BROKENTYPE.reason);
      if (DEVLOG) rawlog("wrong message type received", mt);
  }

}
