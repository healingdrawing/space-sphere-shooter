import type { WebSocketData } from "../../..";
import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { Rotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_av, calc_duration } from "../ship/limits";
import { gemm } from "../gameboard/non-autistic-math/gemm";
import type { SSSBoard } from "../gameboard/board";
import { SOFF as S } from "../gameboard/enums";

export function handle_move_target(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_target_move() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect target move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("target move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect target move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  const b = gb.base(uuid)


  const top = new Float32Array(3)
  top[0] = gb.ships[b + S.TVX]!
  top[1] = gb.ships[b + S.TVX + 1]!
  top[2] = gb.ships[b + S.TVX + 2]!

  const front = new Float32Array(3)
  front[0] = gb.ships[b + S.FVX]!
  front[1] = gb.ships[b + S.FVX + 1]!
  front[2] = gb.ships[b + S.FVX + 2]!
  
  if (gemm.v3mag2(front) === 0){
    errlog("zero front vector", front)
    return result;
  }
  if (gemm.v3mag2(top) === 0){
    errlog("zero top vector", top)
    return result;
  }
  // const power = obj.power // 0-100% -> 90 deg

  const center = new Float32Array(3)
  center[0] = gb.ships[b + S.CX]!
  center[1] = gb.ships[b + S.CX + 1]!
  center[2] = gb.ships[b + S.CX + 2]!
  
  const target = new Float32Array(3)
  closest_ship_or_sun_coordinates(gb, uuid, center, target )
  /** vector from center to target */
  const vct = new Float32Array(3)
  vct[0] = target[0]! - center[0]
  vct[1] = target[1]! - center[1]
  vct[2] = target[2]! - center[2]
  /* first check the front vector is suitable to create rotation axis with target vector */
  const angle_deg = gemm.degrees(Math.acos(gemm.v3v3cos( front, vct )))
  if(DEVLOG) devlog("target angle [deg]", angle_deg) // todo remove
  
  const axis = new Float32Array(3)
  if (!angle_deg || angle_deg === 180){
    axis[0] = top[0]
    axis[1] = top[1]
    axis[2] = top[2]
    rawlog("top axis used", axis) //todo remove
  } else {
    gemm.v3normal( front, vct, axis )
    rawlog("front axis used",axis) //todo remove
  }
  
  // const av +-[deg/s]. avoid accel at the moment
  const av = (calc_av(gb.ships[b + S.MAX_AVELO]!, power))
  const duration_s = calc_duration(av, power, angle_deg)
  const now = rts()
  const av_tsend =  now + duration_s*1000

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
  gb.ships[b + S.AV_TSEND] = av_tsend

  result.push({
    mt: MT.TARGETMOVE,
    msg: {
      uuid, av:av, av_ts:now, av_tsend: av_tsend,
      fvx:front[0], fvy:front[1], fvz:front[2],
      tvx:top[0],tvy:top[1],tvz:top[2],
      avx:axis[0],avy:axis[1],avz:axis[2], // todo rotation axis must be calculated every start
    } as Rotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}

/** raw search of closest ship or sun. The 26 boxes around not implemented */
function closest_ship_or_sun_coordinates(
  gb:SSSBoard, uuid:number,
  sxyz:Float32Array, target:Float32Array){
  target.fill(Infinity)
  
  /** container to each player center xyz. //todo Consider to refactor without Float32Array creation */
  const pxyz = new Float32Array(3)

  const ships = gb.ships
  const players = gb.players
  for (let i=1;i<players.length;i++){
    if (players[i] && i !== uuid){
      const b = gb.base(i)
      pxyz[0] = ships[b + S.CX]!
      pxyz[1] = ships[b + S.CX + 1]!
      pxyz[2] = ships[b + S.CX + 2]!

      if (
        (target[0]! - sxyz[0]!) * (target[0]! - sxyz[0]!)
        + (target[1]! - sxyz[1]!) * (target[1]! - sxyz[1]!)
        + (target[2]! - sxyz[2]!) * (target[2]! - sxyz[2]!)
        >
        (ships[b + S.CX]! - sxyz[0]!) * (ships[b + S.CX]! - sxyz[0]!)
        + (ships[b + S.CX + 1]! - sxyz[1]!) * (ships[b + S.CX + 1]! - sxyz[1]!)
        + (ships[b + S.CX + 2]! - sxyz[2]!) * (ships[b + S.CX + 2]! - sxyz[2]!)
      ) {
        target[0] = ships[b + S.CX]!
        target[1] = ships[b + S.CX + 1]!
        target[2] = ships[b + S.CX + 2]!
      }

      // const s = gb.read_ship(i)
      // const c:[number, number, number] = [s.cx,s.cy,s.cz]
      // if (gemm.vecXDnorm(gemm.vecXD(sxyz, result)) > gemm.vecXDnorm(gemm.vecXD(sxyz, c))) result = c
    }
  }

  if (target[0] === Infinity
    || target [1] === Infinity
    || target[2] === Infinity
  ) target.fill(0) // zero zero zero is sun coordinates(hardcoded at the moment)

  if (DEVLOG) devlog("closest target", target) //todo remove
}
