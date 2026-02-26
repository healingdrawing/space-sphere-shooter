import type { WebSocketData } from "../../..";
import type { GameRoomResponseMessage } from "../../base";

export function handle_exit(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array)
:GameRoomResponseMessage[]
{
  const result:GameRoomResponseMessage[] = []
  ws.close()
  
  return result
}
