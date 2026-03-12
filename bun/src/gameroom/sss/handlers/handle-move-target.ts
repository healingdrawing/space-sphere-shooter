import type { WebSocketData } from "../../..";
import { devlog, dlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { Rotation, SideRotation } from "../types";
import { CCR } from "../../../manage/close";
import { calc_av, calc_duration } from "../ship/limits";
import { gemm } from "../gameboard/non-autistic-math/gemm";
import type { SSSBoard } from "../gameboard/board";

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
  // const power = obj.power // 0-100% -> 90 deg

  //first without iteration as demo case use sun coordinates. so 0,0,0 as closest ship
  const cx = ship.cx
  const cy = ship.cy
  const cz = ship.cz
  
  const target:[number, number, number] = get_closest_ship_or_sun_coordinates(b, uuid, cx,cy,cz)
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
  b.update_ship_rotations(now)
  b.set_avf(uuid, 0)
  b.set_avt(uuid, 0)
  b.set_avs(uuid, 0)

  /* set new rotation */
  
  b.set_avx(uuid, avx)
  b.set_avy(uuid, avy)
  b.set_avz(uuid, avz)

  b.set_av(uuid, av)
  b.set_av_ts(uuid, now) // start timestamp
  b.set_av_tsend(uuid, av_tsend) //final timestamp

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

/** raw search of closest ship or sun. The 26 boxes around not implemented */
const get_closest_ship_or_sun_coordinates = (b:SSSBoard, uuid:number, cx:number,cy:number,cz:number):[number, number, number] => {
  const cxyz:[number, number, number] = [cx, cy, cz]
  let result:[number, number, number] = [Infinity, Infinity, Infinity] 

  
  const players = b.players
  for (let i=1;i<players.length;i++){
    if (players[i] && i !== uuid){
      const s = b.read_ship(i)
      const c:[number, number, number] = [s.cx,s.cy,s.cz]
      if (gemm.vecXDnorm(gemm.vecXD(cxyz, result)) > gemm.vecXDnorm(gemm.vecXD(cxyz, c))) result = c
    }
  }

  if (result[0] === Infinity
    && result [1] === Infinity
    && result[2] === Infinity
  ) result = [0,0,0]// zero zero zero is sun coordinates(hardcoded at the moment)

  devlog("closest target", result)
  return result
}