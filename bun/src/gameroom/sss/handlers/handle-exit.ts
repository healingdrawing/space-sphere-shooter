import type { WebSocketData } from "../../..";
import { MT } from "../../../enums/mt";
import { gameroom } from "../../../ram/consts";
import type { GameRoomResponseMessage } from "../../base";

export function handle_exit(ws: Bun.ServerWebSocket<WebSocketData>, msg: Uint8Array)
:GameRoomResponseMessage[]
{
  const result:GameRoomResponseMessage[] = []
  ws.close()
  
  return result
}
