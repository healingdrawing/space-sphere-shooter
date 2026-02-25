import type { WebSocketData } from "../../..";
import { rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { mm } from "../../../manage/message";
import { gameroom } from "../../../ram/consts";
import type { GameRoomResponseMessage } from "../../base";

export function handle_exit(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array)
:GameRoomResponseMessage[]
{
  const result:GameRoomResponseMessage[] = []

  const {rgb,nick} = mm.u8aobj(msg) as { rgb?: {r:number,g:number,b:number}; nick?: string };
  rawlog(rgb,nick)

  if(rgb && nick){ //join request
    ws.data.nick = nick.substring(0,15) //warning //todo not sanitized
    const uuid = ws.data.uuid
    const ship = gameroom.join_game(uuid, nick, rgb)
    //todo convert to float32array, encode as {s:arr},add type EXIT, return as message object
    
    result.push({
      mt: MT.EXIT,
      msg: ship,
      ms: 0,
      uuids: [0]
    })
    //todo collect all other ships and send to new client
    const b = gameroom.board
    const p = gameroom.players
    const size = p.length
    for(let i = 1;i < size;i++){
      if (i !== uuid && p[i]){
        result.push({
          mt: MT.EXIT,
          msg: b.read_ship(i),
          ms:0,
          uuids: [uuid]
        })
      }
    }

  } else { //exit request
    throw new Error("exit request not implemented.")
  }

  return result
}
