import type { WebSocketData } from "../../..";
import { devlog } from "../../../debug/debug";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";

export function handle_stop_move(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array): GameRoomResponseMessage[] {
  devlog("handle_stop_move() execution.")

  const result: GameRoomResponseMessage[] = [];
  const uuid = ws.data.uuid;
  const b = gameroom.board;
  const ship = b.read_ship(uuid);

  const vx = ship.vvx;
  const vy = ship.vvy;
  const vz = ship.vvz;
  const speedSq = vx*vx + vy*vy + vz*vz;

  if (speedSq === 0) return result;

  const speed = Math.sqrt(speedSq);
  const friction = ship.maccel;  // same accel value, against motion

  let newSpeed = speed - friction;
  if (newSpeed < 0) newSpeed = 0;

  const scale = newSpeed / speed;

  ship.vvx *= scale;
  ship.vvy *= scale;
  ship.vvz *= scale;

  const now = Date.now();

  b.set_vvx(uuid, ship.vvx);
  b.set_vvy(uuid, ship.vvy);
  b.set_vvz(uuid, ship.vvz);
  b.set_vts(uuid, now);

  result.push({
    mt: MT.STOPMOVE,
    msg: {
      uuid,
      cx: ship.cx, cy: ship.cy, cz: ship.cz,
      vvx: ship.vvx, vvy: ship.vvy, vvz: ship.vvz,
      vts: now
    },
    ms: 0,
    uuids: [0]
  });

  return result;
}
