import type { WebSocketData } from "../../..";
import { DEVLOG, devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { CCR } from "../../../manage/close";
import { mm } from "../../../manage/message";
import { gameroom } from "../../../ram/storage";
import { rts } from "../../../utils/basetime";
import type { GameRoomResponseMessage } from "../../base";
import { SOFF as S } from "../gameboard/enums";

export function handle_move_stop(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array): GameRoomResponseMessage[] {
  if(DEVLOG) devlog("handle_move_stop() execution.")

  const result: GameRoomResponseMessage[] = [];

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect stop move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("stop move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect stop move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  const ships = gb.ships
  const b = gb.base(uuid)

  const bvv = b+S.VVX
  const scale = 1 - power

  ships[bvv]! *= scale
  ships[bvv + 1]! *= scale
  ships[bvv + 2]! *= scale

  const now = rts()
  const bcx = b+S.CX

  ships[b + S.V_TS] = now

  result.push({
    mt: MT.STOPMOVE,
    msg: {
      uuid,
      cx: ships[bcx], cy: ships[bcx+1], cz: ships[bcx+2],
      vvx: ships[bvv], vvy: ships[bvv + 1], vvz: ships[bvv + 2],
      vts: now
    },
    ms: 0,
    uuids: [0]
  });

  return result;
}
