import type { WebSocketData } from "../../..";
import type { GameRoomResponseMessage } from "../../base";
import type { Frontmove } from "../types";
import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";
import { mm } from "../../../manage/message";
import { CCR } from "../../../manage/close";

export function handle_move_front(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_move_front() execution.")

  const result:GameRoomResponseMessage[] = []

  let obj:{code:number, power:number}
  let power = 0

  try {
    obj = mm.u8aobj(msg) as {code:number, power:number}
    power = obj.power/100
    if(!power){
      errlog("incorrect front move message from client(no obj.power)")
      return result
    } else if (power < 0 || power > 1){
      errlog("front move power outside of allowed range. Hijacking")
      ws.close(CCR.HIJACKING.code, CCR.HIJACKING.reason)
    }
  } catch (e) {
    errlog("incorrect front move message from client","mm.u8aobj(msg) parsing fail")
    return result
  }

  const uuid = ws.data.uuid
  //todo refactor without getters/setters and Ship object. to speedup
  const b = gameroom.board
  const ship = b.read_ship(uuid)
  let front = vec3.fromValues(ship.fvx, ship.fvy, ship.fvz);
  const lenSq = vec3.squaredLength(front);

  if (lenSq === 0){
    errlog("zero front vector", front)
    return result;
  }
  if (lenSq !== 1) front = vec3.normalize(front, front);// warning check

  const accel =  ship.maccel * power *30 //warning *30 is dev gap

  ship.vvx += front[0] * accel;
  ship.vvy += front[1] * accel;
  ship.vvz += front[2] * accel;

  // speed clamp
  const speed = (ship.vvx**2 + ship.vvy**2 + ship.vvz**2)**0.5;
  const max_lvelo = ship.max_lvelo
  if (speed > max_lvelo ) {
    const scale = max_lvelo  / speed;
    if(DEVLOG) rawlog("speed downscale: max_lvelo:", max_lvelo," speed:",speed, " scale:",scale)
    ship.vvx *= scale;
    ship.vvy *= scale;
    ship.vvz *= scale;
  }
  
  const now = rts()
  if(DEVLOG) rawlog("fmove now:",now,
    "cx:", ship.cx, " ships[i].cx", b.ships[b.base(uuid)+SOFF.CX],
    " ship.vvx:", ship.vvx, " ship.fvx:", ship.fvx)

  b.set_vvx(uuid, ship.vvx)
  b.set_vvy(uuid, ship.vvy)
  b.set_vvz(uuid, ship.vvz)
  // b.set_vts(uuid, now)
  b.ships[b.base(uuid) + SOFF.V_TS] = now
  if(DEVLOG) rawlog("front ship.vvx:",ship.vvx,"vs record ships[i].vvx:",b.ships[b.base(uuid)+SOFF.VVX]!)

  result.push({
    mt: MT.FRONTMOVE,
    msg:  {uuid:uuid,
      cx:ship.cx, cy:ship.cy, cz:ship.cz,
      vvx:ship.vvx, vvy:ship.vvy, vvz:ship.vvz, vts:now
    } as Frontmove,
    ms: 0,
    uuids: [0]
  })
  
  return result
}
