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

  //first without iteration as demo case use sun coordinates. so 0,0,0 as closest ship
  const sxyz = new Float32Array(3)
  const bcx = b + S.CX
  sxyz[0] = ships[bcx]!
  sxyz[1] = ships[bcx + 1]!
  sxyz[2] = ships[bcx + 2]!
  // const cx = ships[bcx]!
  // const cy = ships[bcx + 1]!
  // const cz = ships[bcx + 2]!
  
  const target = new Float32Array(3)
  closest_ship_or_sun_coordinates(
    gb, uuid,
    sxyz, target
  )

  // todo continue refactor below
  /** vector to target ship */
  const vtt = gemm.vecXD([cx,cy,cz],target)
  /* first check the front vector is suitable to create rotation axis with target vector */
  const angle_deg = gemm.degrees(Math.acos(gemm.vecXDcos([ship.fvx,ship.fvy,ship.fvz],vtt)))
  devlog("target angle [deg]", angle_deg) // todo remove
  
  let axis:number[]
  if (!angle_deg || angle_deg === 180){
    axis = [ship.tvx,ship.tvy,ship.tvz]
    rawlog("top axis used", axis) //todo remove
  } else {
    axis = gemm.vec3Dnormal([ship.fvx,ship.fvy,ship.fvz],vtt)
    rawlog("front axis used",axis) //todo remove
  }
  

  const avx = axis[0]! //warning unsafe speed
  const avy = axis[1]!
  const avz = axis[2]!
  
  // const avs +-[deg/s]. avoid accel at the moment
  const av = (calc_av(ship.max_avelo, power))
  const duration_s = calc_duration(av, power, angle_deg)
  const now = rts()
  const av_tsend =  now + duration_s*1000

  /* raw stop previous rotations */
  gb.update_one_ship_rotations(uuid, now)
  gb.set_avf(uuid, 0)
  gb.set_avt(uuid, 0)
  gb.set_avs(uuid, 0)

  /* set new rotation */
  
  gb.set_avx(uuid, avx)
  gb.set_avy(uuid, avy)
  gb.set_avz(uuid, avz)

  gb.set_av(uuid, av)
  gb.set_av_ts(uuid, now) // start timestamp
  gb.set_av_tsend(uuid, av_tsend) //final timestamp

  result.push({
    mt: MT.TARGETMOVE,
    msg: {
      uuid, av:av, av_ts:now, av_tsend: av_tsend,
      fvx:ship.fvx, fvy:ship.fvy, fvz:ship.fvz,
      tvx:ship.tvx,tvy:ship.tvy,tvz:ship.tvz,
      avx:avx,avy:avy,avz:avz, // todo rotation axis must be calculated every start
    } as Rotation,
    ms: 0,
    uuids: [0]
  })
  
  return result
}

/** raw search of closest ship or sun. The 26 boxes around not implemented
 * @param gb gameroom.board
 * @param sxyz ship center coordinates
 * @param target the array to fill uses closest ship or the sun coordinates
*/
const closest_ship_or_sun_coordinates = (
  gb:SSSBoard, uuid:number,
  sxyz:Float32Array, target:Float32Array) => {
  target.fill(Infinity)
  let result:[number, number, number] = [Infinity, Infinity, Infinity] 

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
    && target [1] === Infinity
    && target[2] === Infinity
  ) target.fill(0) // zero zero zero is sun coordinates(hardcoded at the moment)

  if (DEVLOG) devlog("closest target", result) //todo remove
}
