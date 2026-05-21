import { DEVLOG, devlog, rawlog } from "../../../../debug/debug"
import { gemm } from "../../gameboard/non-autistic-math/gemm"
import { calc_av } from "../../ship/limits"
import { SOFF as S } from "../../gameboard/enums"
import type { SSSBoard } from "../../gameboard/board"

/**
 * mutates incomings, for right rotation case
 * @param axis [x,y,z, av, ran] of the rotation to fill
 */
export function right_data(
  b:number,
  ships:Float32Array,
  top:Float32Array,
  power: number,
  axis:Float32Array,
){
  
  /** rotation angle */
  const ran = 90 * power
  if(DEVLOG) devlog("right angle [deg]", ran) // todo remove
  
  axis[0] = -top[0]!
  axis[1] = -top[1]!
  axis[2] = -top[2]!
  
  // const av +-[deg/s]. avoid accel at the moment
  axis[3] = (calc_av(ships[b + S.MAX_AVELO]!, power))
  axis[4] = ran
}
