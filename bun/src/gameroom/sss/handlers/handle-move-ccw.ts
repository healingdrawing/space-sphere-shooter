import type { WebSocketData } from "../../..";
import { devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { FrontRotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_duration, calc_av } from "../ship/limits";
import { SOFF as S } from "../gameboard/enums";

export function handle_move_ccw(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_ccw_move() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect ccw move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("ccw move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect ccw move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  //todo refactor without getters/setters and Ship object. to speedup
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
  
  // const avf +-[deg/s]. avoid accel at the moment
  const avf = -(calc_av(ships[b + S.MAX_AVELO]!, power))
  const duration_s = calc_duration(-avf, power)
  const now = rts()
  const avf_tsend =  now + duration_s*1000

  /* raw stop previous rotations */
  gb.update_one_ship_rotations(uuid, now)
  // gb.set_avt(uuid, 0)
  // gb.set_avs(uuid, 0)
  ships[b + S.AVT] = 0
  ships[b + S.AVS] = 0


  /* set new rotation */
  // gb.set_avf(uuid, avf)
  // gb.set_avf_ts(uuid, now) // start timestamp
  // gb.set_avf_tsend(uuid, avf_tsend) //final timestamp
  ships[b + S.AVF] = avf
  ships[b + S.AVF_TS] = now
  ships[b + S.AVF_TSEND] = avf_tsend

  result.push({
    mt: MT.CCWMOVE,
    msg: {
      uuid, avf, avf_ts:now, avf_tsend,
      fvx, fvy, fvz,
      tvx,tvy,tvz,      
    } as FrontRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
