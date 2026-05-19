import type { WebSocketData } from "../../..";
import { devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { NewRotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_av_rads } from "../ship/limits";
import { SOFF as S } from "../gameboard/enums";
import { gemm } from "../gameboard/non-autistic-math/gemm";

export function handle_move_top(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_move_top() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect top move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("top move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect top move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const now = rts()
  const uuid = ws.data.uuid
  const gb = gameroom.board
  const ships = gb.ships
  const b = gb.base(uuid)

  /** stop previous rotation */
  ships[b + S.AV] = 0

  /** current ship front vector */
  const front = new Float32Array(3)
  front[0] = ships[b + S.FVX]!
  front[1] = ships[b + S.FVX + 1]!
  front[2] = ships[b + S.FVX + 2]!
  
  /** current ship top vector */
  const top = new Float32Array(3)
  top[0] = ships[b + S.TVX]!
  top[1] = ships[b + S.TVX + 1]!
  top[2] = ships[b + S.TVX + 2]!
  
  if (front[0]*front[0]+front[1]*front[1]+front[2]*front[2] === 0){
    errlog("zero front vector", front)
    return result;
  }
  if (top[0]*top[0]+top[1]*top[1]+top[2]*top[2] === 0){
    errlog("zero top vector", top)
    return result;
  }

  /** current ship side vector */
  const side = new Float32Array(3)
  gemm.v3normal(front, top, side)
  if (!gemm.v3_ok(side)){
    errlog("incorrect or zero calculated side vector", side)
    return result;
  }
  
  /** [rad] rotation angle between current and target orientation */
  const ran = gemm.radians(90 * power)

  /* rotate front vector around side */
  gemm.v3rotmut(front, side, ran)
  
  /** build top vector, based on rotated front and side */
  gemm.v3normal(side, front, top)


  // const power = obj.power // 0-100% -> 90 deg
  
  // const av +-[deg/s]. avoid accel at the moment
  const av = (calc_av_rads(gb.ships[b + S.MAX_AVELO]!, power))
  
  /* set new rotation */
  ships[b + S.AV] = av
  ships[b + S.AV_TS] = now
  ships[b + S.DA] = Math.abs(ran)

  ships[b + S.AVX] = side[0]!
  ships[b + S.AVY] = side[1]!
  ships[b + S.AVZ] = side[2]!

  ships[b + S.FVX1] = front[0]
  ships[b + S.FVY1] = front[1]
  ships[b + S.FVZ1] = front[2]
  ships[b + S.TVX1] = top[0]
  ships[b + S.TVY1] = top[1]
  ships[b + S.TVZ1] = top[2]

  result.push({
    mt: MT.TARGETMOVE,
    msg: {
      uuid, av,
      fvx1:front[0],
      fvy1:front[1],
      fvz1:front[2],
      tvx1:top[0],
      tvy1:top[1],
      tvz1:top[2],
    } as NewRotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
