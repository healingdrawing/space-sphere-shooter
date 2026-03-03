import type { WebSocketData } from "../../..";
import { devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { FrontRotation } from "../types";

export function handle_ccw_move(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_ccw_move() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    if(!obj.power){
      errlog("incorrect ccw move message from client(no obj.power)")
      return result
  }
  } catch (e) {
    errlog("incorrect ccw move message from client","mm.u8aobj(msg) parsing fail")
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
  const power = obj.power // 0-100% -> 90 deg
  
  // const avf = Math.sign(power) * ship.max_avelo // +-[deg/s]. avoid accel at the moment
  const avf = -45
  const duration_s = Math.abs(power/avf)
  const now = rts()
  const avf_tsend =  now + duration_s*1000
  b.set_avf(uuid, avf)
  b.set_avf_ts(uuid, now) // start timestamp
  b.set_avf_tsend(uuid, avf_tsend) //final timestamp

  result.push({
    mt: MT.CWMOVE,
    msg: {
      uuid, avf:-avf, avf_ts:now, avf_tsend,
      fvx:ship.fvx, fvy:ship.fvy, fvz:ship.fvz,
      tvx:ship.tvx,tvy:ship.tvy,tvz:ship.tvz,      
    } as FrontRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
