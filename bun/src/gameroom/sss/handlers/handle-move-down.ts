import type { WebSocketData } from "../../..";
import { devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { SideRotation, TopRotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_av, calc_duration } from "../ship/limits";

export function handle_move_down(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_down_move() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect down move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("down move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect down move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  //todo refactor without getters/setters and Ship object. to speedup
  const b = gameroom.board
  const ship = b.read_ship(uuid)
  let top = vec3.fromValues(ship.tvx, ship.tvy, ship.tvz);
  const len_sq_top = vec3.squaredLength(top);
  let front = vec3.fromValues(ship.fvx, ship.fvy, ship.fvz);
  const len_sq_front = vec3.squaredLength(front);

  if (len_sq_front === 0){
    errlog("zero front vector", top)
    return result;
  }
  if (len_sq_top === 0){
    errlog("zero top vector", top)
    return result;
  }
  // const power = obj.power // 0-100% -> 90 deg
  
  // const avs = Math.sign(power) * ship.max_avelo // +-[deg/s]. avoid accel at the moment
  const avs = -(calc_av(ship.max_avelo, power))
  const duration_s = calc_duration(-avs, power)
  const now = rts()
  const avs_tsend =  now + duration_s*1000

  /* raw stop previous rotations */
  b.set_avf(uuid, 0)
  b.set_avt(uuid, 0)

  /* set new rotation */
  b.set_avs(uuid, avs)
  b.set_avs_ts(uuid, now) // start timestamp
  b.set_avs_tsend(uuid, avs_tsend) //final timestamp

  result.push({
    mt: MT.TOPMOVE,
    msg: {
      uuid, avs:avs, avs_ts:now, avs_tsend,
      fvx:ship.fvx, fvy:ship.fvy, fvz:ship.fvz,
      tvx:ship.tvx,tvy:ship.tvy,tvz:ship.tvz,      
    } as SideRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
