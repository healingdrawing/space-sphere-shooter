import type { WebSocketData } from "../../..";
import { errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { CCR } from "../../../manage/close";
import { mm } from "../../../manage/message";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";

export function handle_join(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array)
:GameRoomResponseMessage[]
{
  const result:GameRoomResponseMessage[] = []
  
  const {rgb,nick} = mm.u8aobj(msg) as { rgb?: {r:number,g:number,b:number}; nick?: string };
  rawlog(rgb,nick)

  if(rgb && nick){ //proper join request
    ws.data.nick = nick.substring(0,15) //warning //todo not sanitized, consider implement client filtering, and ban if hijacking attempt
    const uuid = ws.data.uuid
    const ship = gameroom.join_game(uuid, nick, rgb)
    //todo consider to refactor ship object to float32array or 64, encode as {s:arr},add type JOIN, return as message object. Then on client side parse respectively, to decrease net data transfer. It huge stuff, do not touch without needs.
    
    // send order to join game. init add new(controllable) ship etc
    result.push({
      mt: MT.JOIN,
      msg: ship,
      ms: 0,
      uuids: [uuid]
    })
    // collect all other ships and send to new client
    const b = gameroom.board
    const p = b.players
    const size = p.length
    for(let i = 1;i < size;i++){
      if (i !== uuid && p[i]){
        result.push({
          mt: MT.SHIP,
          msg: b.read_ship(i),
          ms:20,
          uuids: [uuid]
        })
      }
    }
    // send new ship to old clients(//WARNING manage(managed uses console.warn), on client side the uuid client, because this case ship is already arrived)
    result.push({
      mt: MT.SHIP,
      msg: ship,
      ms: 40,
      uuids: [0]
    })
  } else {
    errlog("incorrect join request. Hijacking")
    ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
  }

  return result
}
