import type { WebSocketData } from "../../..";
import { rawlog } from "../../../debug/debug";
import { mm } from "../../../manage/message";
import { gameroom } from "../../../ram/consts";

export function handle_exit(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array) {
  //todo parse . at the moment h and nick props as json

  const {rgb,nick} = mm.u8aobj(msg) as { rgb?: {r:number,g:number,b:number}; nick?: string };
  rawlog(rgb,nick)

  if(rgb && nick){ //join request
    ws.data.nick = nick //warning //todo not sanitized
    gameroom.join_game(ws.data.uuid, nick, rgb)
  }

  throw new Error("Function not implemented.")
}