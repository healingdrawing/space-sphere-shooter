import type { WebSocketData } from "../../..";
import { DEVLOG, devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { mm } from "../../../manage/message";
import type { LazerBeam } from "../types";
import { gemm } from "../gameboard/non-autistic-math/gemm";
import { CCR } from "../../../manage/close";
import { SOFF as S } from "../gameboard/enums";

export function handle_shot_top(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  if(DEVLOG) devlog("handle_shot_top() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0
  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect top shot message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("top shot power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect top shot message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  const gb = gameroom.board
  
  const b = gb.base(uuid)
  const a = gb.ships[b + S.VERT_GUNS]!
  
  // check impossibility to shot
  if (!a) return [{ mt: MT.S, msg: { alert_text:"your ship does not have top gun, ... buddy", }, ms: 0, uuids: [uuid] }]

  /** distance from ship hull */
  const d = gb.ships[b+S.VR]!
  
  /* beam start position */
  const d3 = gb.ships.subarray(b + S.CX, b + S.CX + 3)
  
  /* beam direction vector */
  const v3 = gb.ships.slice(b + S.TVX, b + S.TVX + 3)

  /* distanted dot on lazer beam */
  const b1000 = d3.slice()

  gemm.d3offset_mut(b1000,v3,1000)
  
  /* normal vector to beam, to calc sides */
  const v3n = gb.ships.subarray(b + S.FVX, b + S.FVX + 3)
  
  let max_en = gb.ships[b + S.MAX_EN]!
  
  let en = gb.ships[b + S.EN]!
  
  const damage_messages = gb.lazer_shot(
    uuid, a, power, en, max_en,
    v3,
    v3n,
    d3
  )
  
  result.push({
    mt: MT.TOPSHOT,
    msg: {
      uuid, a, d,
      x:b1000[0], y:b1000[1], z:b1000[2],
      nx:v3n[0], ny:v3n[1], nz:v3n[2]     
    } as LazerBeam,
    ms: 0,
    uuids: [0]
  })
  
  if(DEVLOG) devlog("damage_messages", mm.logobj(damage_messages)) //todo remove
  result.push(...damage_messages)
  
  return result
}
