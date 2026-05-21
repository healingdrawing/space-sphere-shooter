import { DEVLOG, devlog, rawlog } from "../../../../debug/debug"
import { gemm } from "../../gameboard/non-autistic-math/gemm"
import { calc_av } from "../../ship/limits"
import { SOFF as S } from "../../gameboard/enums"
import type { SSSBoard } from "../../gameboard/board"

/**
 * mutates incomings, for top rotation case
 * @param axis [x,y,z, av, ran] of the rotation to fill
 */
export function top_data(
  b:number,
  ships:Float32Array,
  front:Float32Array,
  top:Float32Array,
  power: number,
  axis:Float32Array,
){
  
  /** rotation angle */
  const ran = 90 * power
  if(DEVLOG) devlog("top angle [deg]", ran) // todo remove
  
  gemm.v3normal(front, top, axis)
  
  // const av +-[deg/s]. avoid accel at the moment
  axis[3] = (calc_av(ships[b + S.MAX_AVELO]!, power))
  axis[4] = ran
}
