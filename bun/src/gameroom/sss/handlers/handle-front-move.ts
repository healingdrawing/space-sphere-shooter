import type { WebSocketData } from "../../..";
import { devlog, errlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { vec3 } from "gl-matrix";

export function handle_front_move(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array):GameRoomResponseMessage[] {
  devlog("handle_front_move() execution.")

  const result:GameRoomResponseMessage[] = []

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
  if (lenSq !== 1) vec3.normalize(front, front);

  const accel = ship.maccel

  ship.vvx += front[0] * accel;
  ship.vvy += front[1] * accel;
  ship.vvz += front[2] * accel;

  // optional speed clamp
  const speedSq = ship.vvx*ship.vvx + ship.vvy*ship.vvy + ship.vvz*ship.vvz;
  const max_lvelo2 = ship.max_lvelo ** 2
  if (speedSq > max_lvelo2 ) {
    const scale = max_lvelo2  / speedSq;
    ship.vvx *= scale;
    ship.vvy *= scale;
    ship.vvz *= scale;
  }
  
  const now = performance.now()

  b.set_vvx(uuid, ship.vvx)
  b.set_vvy(uuid, ship.vvy)
  b.set_vvz(uuid, ship.vvz)
  b.set_vts(uuid, now)


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
