import type { WebSocketData } from "../../..";
import { DEVLOG, devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { mm } from "../../../manage/message";
import type { LazerBeam } from "../types";
import { gemm } from "../gameboard/non-autistic-math/gemm";
import { CCR } from "../../../manage/close";

export function handle_shot_left(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_shot_left() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0
  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect left shot message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("left shot power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect left shot message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const b = gameroom.board
  //todo refactor without getters/setters and read_ship object. to speedup
  const s = b.read_ship(uuid)

  const a = s.side_guns

  // check impossibility to shot
  if (!a) return [{ mt: MT.S, msg: { alert_text:"your ship does not have left gun, ... buddy", }, ms: 0, uuids: [uuid] }]

  /** distance from ship hull */
  const d = s.sr
  
  /* beam start position */
  let cx = s.cx
  let cy = s.cy
  let cz = s.cz
  /* beam direction vector */
  const sv = gemm.vec3Dnormal([s.tvx,s.tvy,s.tvz],[s.fvx,s.fvy,s.fvz]) // left/right different
  let vx = sv[0]!
  let vy = sv[1]!
  let vz = sv[2]!

  /* distanted dot on lazer beam */
  const b1000 = gemm.dotXDoffset([cx,cy,cz],sv,1000)
  const x = b1000[0]! //warning unsafe speed
  const y = b1000[1]!
  const z = b1000[2]!

  /* normal vector to beam, to calc sides */
  let nx = s.tvx
  let ny = s.tvy
  let nz = s.tvz

  let max_en = s.max_en
  let en = s.en
  
  const damage_messages = b.lazer_shot( uuid, a, power, en, max_en, vx, vy, vz, nx, ny, nz, cx,cy,cz )
  
  result.push({
    mt: MT.LEFTSHOT,
    msg: {
      uuid, a, d, x, y, z, nx, ny, nz     
    } as LazerBeam,
    ms: 0,
    uuids: [0]
  })
  
  if(DEVLOG) devlog("damage_messages",damage_messages) //todo remove
  result.push(...damage_messages)
  
  return result
}
