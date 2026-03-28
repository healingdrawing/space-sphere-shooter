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
  const b = gb.base(uuid)

  const bfv = b+S.FVX
  const mag = Math.sqrt(
    gb.ships[bfv]!*gb.ships[bfv]!
    + gb.ships[bfv+1]!*gb.ships[bfv+1]!
    + gb.ships[bfv+2]!*gb.ships[bfv+2]!
  )
  
  if (mag === 0){
    errlog("zero front vector")
    return result;
  }
  if (mag !== 1){
    gb.ships[bfv]! /= mag
    gb.ships[bfv+1]! /= mag
    gb.ships[bfv+2]! /= mag
  }
  
  const accel = gb.ships[b+S.MACCEL]! * power * 30 //warning *30 is dev gap

  const bvv = b+S.VVX
  gb.ships[bvv]! += gb.ships[bfv]! * accel;
  gb.ships[bvv + 1]! += gb.ships[bfv+1]! * accel;
  gb.ships[bvv + 2]! += gb.ships[bfv+2]! * accel;
  
  // speed clamp
  const speed = Math.sqrt(
    gb.ships[bvv]! * gb.ships[bvv]!
    + gb.ships[bvv + 1]! * gb.ships[bvv + 1]!
    + gb.ships[bvv + 2]! * gb.ships[bvv + 2]!
  )
  
  const max_lvelo = gb.ships[b+S.MAX_LVELO]!
  
  if (speed > max_lvelo ) {
    const scale = max_lvelo / speed;
    if(DEVLOG) rawlog("speed downscale: max_lvelo:", max_lvelo," speed:",speed, " scale:",scale)
    gb.ships[bvv]! *= scale
    gb.ships[bvv + 1]! *= scale
    gb.ships[bvv + 2]! *= scale
  }
  
  const now = rts()
  const bcx = b+S.CX
  
  gb.ships[b + S.V_TS] = now
  
  result.push({
    mt: MT.FRONTMOVE,
    msg: {uuid,
      cx:gb.ships[bcx]!,
      cy:gb.ships[bcx+1]!,
      cz:gb.ships[bcx+2]!,
      vvx:gb.ships[bvv]!,
      vvy:gb.ships[bvv + 1]!,
      vvz:gb.ships[bvv + 2]!,
      vts:now
    } as Frontmove, // todo assertion can be commented too, it only highlight fields
    ms: 0,
    uuids: [0]
  })
  
  return result
}
