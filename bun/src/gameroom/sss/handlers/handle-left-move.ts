import type { WebSocketData } from "../../..";
import { devlog, errlog, rawlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";
import { SOFF } from "../gameboard/enums";
import { rts } from "../../../utils/basetime";

export function handle_left_move(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_left_move() execution.")

  const result:GameRoomResponseMessage[] = []

  const uuid = ws.data.uuid
  //todo refactor without getters/setters and Ship object. to speedup
  const b = gameroom.board
  const ship = b.read_ship(uuid)
  let top = vec3.fromValues(ship.fvx, ship.fvy, ship.fvz);
  const lenSq = vec3.squaredLength(top);

  if (lenSq === 0){
    errlog("zero front vector", top)
    return result;
  }
  // if (lenSq !== 1) front = vec3.normalize(front, front);// warning check

  const accel = ship.daccel

  // ship.vvx += front[0] * accel;
  // ship.vvy += front[1] * accel;
  // ship.vvz += front[2] * accel;

  // optional speed clamp
  // const speedSq = ship.vvx*ship.vvx + ship.vvy*ship.vvy + ship.vvz*ship.vvz;
  // const max_lvelo2 = 4 // ship.max_lvelo * ship.max_lvelo
  // if (speedSq > max_lvelo2 ) {
  //   const scale = max_lvelo2**0.5  / speedSq **0.5;
  //   rawlog("speed downscale: maxv2:", max_lvelo2," sp2:",speedSq, " scale:",scale)
  //   ship.vvx *= scale;
  //   ship.vvy *= scale;
  //   ship.vvz *= scale;
  // }
  
  const now = rts()
  rawlog("fmove now:",now,
    "cx:", ship.cx, " ships[i].cx", b.ships[b.base(uuid)+SOFF.CX],
    " ship.vvx:", ship.vvx, " ship.fvx:", ship.fvx)

  b.set_vvx(uuid, ship.vvx)
  b.set_vvy(uuid, ship.vvy)
  b.set_vvz(uuid, ship.vvz)
  // b.set_vts(uuid, now)
  b.ships[b.base(uuid) + SOFF.V_TS] = now
  rawlog("front ship.vvx:",ship.vvx,"vs record ships[i].vvx:",b.ships[b.base(uuid)+SOFF.VVX]!)

  result.push({
    mt: MT.FRONTMOVE,
    msg: {uuid:uuid,
      cx:ship.cx, cy:ship.cy, cz:ship.cz,
      vvx:ship.vvx, vvy:ship.vvy, vvz:ship.vvz, vts:now
    },
    ms: 0,
    uuids: [0]
  })
  
  return result
}
