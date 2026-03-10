import type { WebSocketData } from ".."
import { SSSGameRoom } from "../gameroom/sss/room"

/** At the moment used for chat invitation process,
 * and autoset limits depends on number of connections.
 * The gameroom managed using subscriptions ws.subscribe()
 * using higher level "ws.data.room" to avoid redundant iteration.
 * */
interface USER{
  ws:Bun.ServerWebSocket<WebSocketData>
}
/** map of the users. The unique key is uuid generated in time of websocket connection initiation/upgrade */
export const users = new Map<number, USER>()

export const gameroom = new SSSGameRoom()

/** to store variables, for update */
export const vars = {SERVER_START_TIME_MS:Date.now()}
