import type { WebSocketData } from "../../..";
import type { GameRoomResponseMessage } from "../../base";

export const handle_exit = (ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array) =>
{
  ws.close()
}
