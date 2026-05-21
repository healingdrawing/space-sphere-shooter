import type { WebSocketData } from "../../..";
import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { Rotation } from "../types";
import { CCR } from "../../../manage/close";
import { gemm } from "../gameboard/non-autistic-math/gemm";
import { SOFF as S } from "../gameboard/enums";
import { target_data } from "./rotation/target-data";
import { top_data } from "./rotation/top-data";
import { down_data } from "./rotation/down-data";
import { left_data } from "./rotation/left-data";
import { right_data } from "./rotation/right-data";
import { ccw_data } from "./rotation/ccw-data";
import { cw_data } from "./rotation/cw-data";

export function handle_rotation(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array, mt:MT):GameRoomResponseMessage[] {
  devlog("handle_rotation() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect rotation message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("rotation power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect rotation message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  const ships = gb.ships
  const b = gb.base(uuid)

  const top = new Float32Array(3)
  top[0] = ships[b + S.TVX]!
  top[1] = ships[b + S.TVX + 1]!
  top[2] = ships[b + S.TVX + 2]!

  const front = new Float32Array(3)
  front[0] = ships[b + S.FVX]!
  front[1] = ships[b + S.FVX + 1]!
  front[2] = ships[b + S.FVX + 2]!
  
  if (gemm.v3mag2(front) === 0){
    errlog("zero front vector", front)
    return result;
  }
  if (gemm.v3mag2(top) === 0){
    errlog("zero top vector", top)
    return result;
  }

  /** axis of rotation [x,y,z] is 0 1 2 indices. The (angular velocity) av has index 3. The (rotation angle) ran has index 4 */
  const axis = new Float32Array(5)
  /* reanimate top based on front(decrease data loosing), since front is major. Temporary use axis as container */
  gemm.v3normal(front, top, axis)
  gemm.v3normal(axis, front, top)
  axis.fill(0) //todo remove line. Should be redundant, but for now let it be

  /* calc custom rotation axis depends on mt, to later use one syntax for all */
  switch(mt){
    case MT.TOPMOVE: top_data( b, ships, front, top, power, axis ); break
    case MT.DOWNMOVE: down_data( b, ships, front, top, power, axis ); break
    case MT.LEFTMOVE: left_data( b, ships, top, power, axis ); break
    case MT.RIGHTMOVE: right_data( b, ships, top, power, axis ); break
    case MT.CCWMOVE: ccw_data( b, ships, front, power, axis ); break
    case MT.CWMOVE: cw_data( b, ships, front, power, axis ); break
    case MT.TARGETMOVE: target_data( uuid, b, ships, gb, front, top, power, axis ); break
  }

  const av = axis[3]!
  const ran = axis[4]!
  // const power = obj.power // 0-100% -> 90 deg

  const now = rts()
  
  /* raw stop previous rotations */
  gb.update_one_ship_rotations(uuid, now)
  gb.ships[b + S.AVF] = 0
  gb.ships[b + S.AVT] = 0
  gb.ships[b + S.AVS] = 0

  /* set new rotation */
  gb.ships[b + S.AVX] = axis[0]!
  gb.ships[b + S.AVY] = axis[1]!
  gb.ships[b + S.AVZ] = axis[2]!

  gb.ships[b + S.AV] = av
  gb.ships[b + S.AV_TS] = now
  gb.ships[b + S.RAN] = ran // removed math.abs, since only av has +-
  gb.ships[b + S.PAN] = 0

  result.push({
    mt: MT.TARGETMOVE,
    msg: {
      uuid, av, ran,
      fvx:front[0], fvy:front[1], fvz:front[2],
      tvx:top[0],tvy:top[1],tvz:top[2],
      avx:axis[0],avy:axis[1],avz:axis[2], // todo rotation axis must be calculated every start
    } as Rotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
