import { DEVLOG, devlog, rawlog } from "../../../../debug/debug"
import { gemm } from "../../gameboard/non-autistic-math/gemm"
import { calc_av } from "../../ship/limits"
import { SOFF as S } from "../../gameboard/enums"
import type { SSSBoard } from "../../gameboard/board"

/**
 * mutates incomings, for target rotation case
 * @param axis [x,y,z, av, ran] of the rotation to fill
 */
export function target_data(
  uuid:number,
  b:number,
  ships:Float32Array,
  gb: SSSBoard,
  front:Float32Array,
  top:Float32Array,
  power: number,
  axis:Float32Array,
){
  const center = new Float32Array(3)
  center[0] = ships[b + S.CX]!
  center[1] = ships[b + S.CX + 1]!
  center[2] = ships[b + S.CX + 2]!
  
  const target = new Float32Array(3)
  closest_ship_or_sun_coordinates(gb, uuid, center, target )
  /** vector from center to target */
  const vct = new Float32Array(3)
  vct[0] = target[0]! - center[0]
  vct[1] = target[1]! - center[1]
  vct[2] = target[2]! - center[2]
  /* first check the front vector is suitable to create rotation axis with target vector */
  /** rotation angle */
  const ran = gemm.degrees(Math.acos(gemm.v3v3cos( front, vct )))
  if(DEVLOG) devlog("target angle [deg]", ran) // todo remove
  
  if (!ran || ran === 180){
    axis[0] = top[0]!
    axis[1] = top[1]!
    axis[2] = top[2]!
    rawlog("top axis used", axis) //todo remove
  } else {
    gemm.v3normal( front, vct, axis )
    rawlog("front axis used",axis) //todo remove
  }
  // const av +-[deg/s]. avoid accel at the moment
  axis[3] = (calc_av(ships[b + S.MAX_AVELO]!, power))
  axis[4] = ran
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
