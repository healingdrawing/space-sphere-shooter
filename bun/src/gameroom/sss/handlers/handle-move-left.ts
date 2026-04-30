import type { WebSocketData } from "../../..";
import { devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { TopRotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_av, calc_duration } from "../ship/limits";
import { SOFF as S } from "../gameboard/enums";

export function handle_move_left(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_move_left() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect left move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("left move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect left move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  const ships = gb.ships
  const b = gb.base(uuid)
  
  const btv = b + S.TVX
  const tvx = ships[btv]!
  const tvy = ships[btv + 1]!
  const tvz = ships[btv + 2]!
  
  const bfv = b + S.FVX
  const fvx = ships[bfv]!
  const fvy = ships[bfv + 1]!
  const fvz = ships[bfv + 2]!
  
  if (fvx * fvx + fvy * fvy + fvz * fvz === 0){
    errlog("zero front vector")
    return result;
  }
  if (tvx * tvx + tvy * tvy + tvz * tvz === 0){
    errlog("zero top vector")
    return result;
  }
  // const power = obj.power // 0-100% -> 90 deg
  
  // const avt +-[deg/s]. avoid accel at the moment
  const avt = (calc_av(ships[b + S.MAX_AVELO]!, power))
  const duration_s = calc_duration(avt, power)
  const now = rts()
  const avt_tsend =  now + duration_s*1000

  /* raw stop previous rotations */
  gb.update_one_ship_rotations(uuid, now)
  ships[b + S.AVF] = 0
  ships[b + S.AVS] = 0
  ships[b + S.AV] = 0

  /* set new rotation */
  ships[b + S.AVT] = avt
  ships[b + S.AVT_TS] = now
  ships[b + S.AVT_TSEND] = avt_tsend

  result.push({
    mt: MT.LEFTMOVE,
    msg: {
      uuid, avt, avt_ts:now, avt_tsend,
      fvx, fvy, fvz,
      tvx,tvy,tvz,      
    } as TopRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
