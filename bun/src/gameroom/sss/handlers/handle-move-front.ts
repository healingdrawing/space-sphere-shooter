import type { WebSocketData } from "../../..";
import type { GameRoomResponseMessage } from "../../base";
import type { Frontmove } from "../types";
import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import { SOFF as S } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import { CCR } from "../../../manage/close";

export function handle_move_front(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_move_front() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect front move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("front move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect front move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  const ships = gb.ships
  const b = gb.base(uuid)

  const bfv = b+S.FVX
  const mag = Math.sqrt(
    ships[bfv]!*ships[bfv]!
    + ships[bfv+1]!*ships[bfv+1]!
    + ships[bfv+2]!*ships[bfv+2]!
  )
  
  if (mag === 0){
    errlog("zero front vector")
    return result;
  }
  if (mag !== 1){
    ships[bfv]! /= mag
    ships[bfv+1]! /= mag
    ships[bfv+2]! /= mag
  }
  
  const accel = ships[b+S.MACCEL]! * power * 30 //warning *30 is dev gap

  const bvv = b+S.VVX
  ships[bvv]! += ships[bfv]! * accel;
  ships[bvv + 1]! += ships[bfv+1]! * accel;
  ships[bvv + 2]! += ships[bfv+2]! * accel;
  
  // speed clamp
  const speed = Math.sqrt(
    ships[bvv]! * ships[bvv]!
    + ships[bvv + 1]! * ships[bvv + 1]!
    + ships[bvv + 2]! * ships[bvv + 2]!
  )
  
  const max_lvelo = ships[b+S.MAX_LVELO]!
  
  if (speed > max_lvelo ) {
    const scale = max_lvelo / speed;
    if(DEVLOG) rawlog("speed downscale: max_lvelo:", max_lvelo," speed:",speed, " scale:",scale)
    ships[bvv]! *= scale
    ships[bvv + 1]! *= scale
    ships[bvv + 2]! *= scale
  }
  
  const now = rts()
  const bcx = b+S.CX
  
  ships[b + S.V_TS] = now
  
  result.push({
    mt: MT.FRONTMOVE,
    msg: {uuid,
      cx:ships[bcx]!,
      cy:ships[bcx+1]!,
      cz:ships[bcx+2]!,
      vvx:ships[bvv]!,
      vvy:ships[bvv + 1]!,
      vvz:ships[bvv + 2]!,
      vts:now
    } as Frontmove, // todo assertion can be commented too, it only highlight fields
    ms: 0,
    uuids: [0]
  })
  
  return result
}
