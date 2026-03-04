import { s, type WebSocketData } from "..";
import { DEVLOG, rawlog } from "../debug/debug";
import { MT } from "../enums/mt";
import { mm } from "../manage/message";

/**
 * to store messages before, send to client side.
 * No valibot validation planned since server should send correct
 * */
export type GameRoomResponseMessage = {
  /** type of message, to add before object styled message body */
  mt: MT;
  /** free form object, since can be unique for each game */
  msg: object;
  /** delay milliseconds to send message to client. F.e. to initiate animation */
  ms: number;
  /** target clients(ws.data.uuid) to send message to or [0] to all.
   * In case of game room the zero 0 used as indicator to send to all players.
   * */
  uuids: number[];
};

/** to use with messages returned by handle_game_message gameroom method  */
export function send_delayed_messages(
  messages: GameRoomResponseMessage[]
) {
  const len = messages.length;
  for (let i = 0; i < len; i++) {
    const { mt, msg, ms, uuids } = messages[i]!;
    const encoded = mm.keyu8a(mt, mm.obju8a(msg));
    const jlen = uuids.length;
    setTimeout(() => {
      for (let j = 0; j < jlen; j++) {
        const c = uuids[j]?uuids[j]:'game'
        if(DEVLOG) rawlog(mm.logobj(msg) +` published to: ${c} delay:${ms}`) //todo remove
        s.publish(`${c}`, encoded)
      }
    }, ms);
  }
}

/** inform clients about exit/disconnection. To remove ship from playground */
export function broadcast_exit_message(uuid:number){
  s.publish('game',mm.keyu8a(MT.EXIT, mm.obju8a({uuid:uuid})))
}

// Base interface - every game room must have
export interface GameRoom {
  /** todo manage logic for game message then return where each object of array has
   *  {
   * 
   * msg:message_object_free_form,
   * 
   * ms:delay_in_milliseconds_to_send_to_client,
   * 
   * uuids: array of message receivers
   * 
   * } structure.
   * @param mt - message type(cut second byte from Uint8Array)
   * @param msg - incoming data after cut first byte(key), and second byte(mt)
   * @param uuid - the player identifier. Incrementable number
   * */
  handle_game_message(mt:MT, msg: Uint8Array, uuid: number, ws:Bun.ServerWebSocket<WebSocketData>): GameRoomResponseMessage[];
}
