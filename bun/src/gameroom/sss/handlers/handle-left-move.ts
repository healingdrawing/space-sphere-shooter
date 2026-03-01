import type { WebSocketData } from "../../..";
import { devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { TopRotation } from "../types";

export function handle_left_move(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_left_move() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    if(!obj.power){
      errlog("incorrect left move message from client(no obj.power)")
      return result
  }
  } catch (e) {
    errlog("incorrect left move message from client","mm.u8aobj(msg) parsing fail")
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
  /* *-1 before send to client. to rotate CCW. need check babylonjs(client) VS gl-matrix(server)  */
  // const avt = Math.sign(power) * ship.max_avelo // +-[deg/s]. avoid accel at the moment
  const avt = 45
  const duration_s = Math.abs(power/avt)
  const now = rts()
  const avt_tsend =  now + duration_s*1000
  b.set_avt(uuid, avt)
  b.set_avt_ts(uuid, now) // start timestamp
  b.set_avt_tsend(uuid, avt_tsend) //final timestamp

  result.push({
    mt: MT.LEFTMOVE,
    msg: {
      uuid, avt:-avt, avt_ts:now, avt_tsend,
      fvx:ship.fvx, fvy:ship.fvy, fvz:ship.fvz,
      tvx:ship.tvx,tvy:ship.tvy,tvz:ship.tvz,      
    } as TopRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
