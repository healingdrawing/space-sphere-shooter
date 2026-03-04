import type { WebSocketData } from "../../..";
import { devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import type { LazerBeam } from "../types";
import { gemm } from "../gameboard/non-autistic-math/gemm";

export function handle_front_shot(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_front_shot() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    if(!obj.power){
      errlog("incorrect front shot message from client(no obj.power)")
      return result
  }
  } catch (e) {
    errlog("incorrect front shot message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const b = gameroom.board
  //todo refactor without getters/setters and read_ship object. to speedup
  const s = b.read_ship(uuid)

  const a = s.front_guns
  
  /* beam start position */
  let cx = s.cx
  let cy = s.cy
  let cz = s.cz
  /* beam direction vector */
  let vx = s.fvx
  let vy = s.fvy
  let vz = s.fvz

  /* distanted dot on lazer beam */
  const b1000 = gemm.dotXDoffset([cx,cy,cz],[vx,vy,vz],1000)
  const x = b1000[0]! //warning unsafe speed
  const y = b1000[1]!
  const z = b1000[2]!

  /* normal vector to beam, to calc sides */
  let nx = s.tvx
  let ny = s.tvy
  let nz = s.tvz

  let guns = s.front_guns
  let max_en = s.max_en
  let en = s.en
  
  // todo consider ban if power is outside 0-100. hijacking
  const power = obj.power // 0-100% -> manage later some way. In case of shot as % of max_en but <= en
  
  // check impossibility to shot
  let text:string | null = null
  if (!guns) text = "your ship does not have front gun, ... buddy"
  if (text) return [{ mt: MT.S, msg: { alert_text:text, }, ms: 0, uuids: [uuid] }]

  const damage_messages = b.lazer_shot( uuid, guns, power, en, max_en, vx, vy, vz, nx, ny, nz, cx,cy,cz )
  
  result.push({
    mt: MT.FRONTSHOT,
    msg: {
      uuid, a, x, y, z, nx, ny, nz     
    } as LazerBeam,
    ms: 0,
    uuids: [0]
  })
  
  result.push(...damage_messages)
  
  return result
}
