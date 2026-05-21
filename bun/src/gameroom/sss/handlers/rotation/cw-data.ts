import { DEVLOG, devlog, rawlog } from "../../../../debug/debug"
import { calc_av } from "../../ship/limits"
import { SOFF as S } from "../../gameboard/enums"

/**
 * mutates incomings, for drill CCW rotation case
 * @param axis [x,y,z, av, ran] of the rotation to fill
 */
export function cw_data(
  b:number,
  ships:Float32Array,
  front:Float32Array,
  power: number,
  axis:Float32Array,
){
  
  /** rotation angle */
  const ran = 90 * power
  if(DEVLOG) devlog("CW angle [deg]", ran) // todo remove
  
  axis[0] = front[0]!
  axis[1] = front[1]!
  axis[2] = front[2]!
  
  // const av +-[deg/s]. avoid accel at the moment
  axis[3] = (calc_av(ships[b + S.MAX_AVELO]!, power))
  axis[4] = ran
}
