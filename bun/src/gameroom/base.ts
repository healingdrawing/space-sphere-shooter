import { s, type WebSocketData } from "..";
import { DEVLOG, rawlog } from "../debug/debug";
import type { MT } from "../enums/mt";
import { mm } from "../manage/message";

/**
 * to store messages before, send to client side.
 * No valibot validation planned since server should send correct
 * */
export type GameRoomResponseMessage = {
  /** free form object, since can be unique for each game */
  msg: object;
  /** delay milliseconds to send message to client. F.e. to initiate animation */
  ms: number;
  /** target clients(ws.data.role) to send message to.
   * In case of game room the zero 0 used as indicator to send to all players.
   * //todo implement the zero role when batch of messages generated in gameplay.
   * */
  roles: number[];
};

/** to use with messages returned by handle_game_message gameroom method  */
export function send_delayed_messages(
  messages: GameRoomResponseMessage[]
) {
  const len = messages.length;
  for (let i = 0; i < len; i++) {
    const { msg, ms, roles } = messages[i]!;
    const encoded = mm.obju8a(msg);
    const rlen = roles.length;
    setTimeout(() => {
      for (let j = 0; j < rlen; j++) {
        if(DEVLOG) rawlog(mm.logobj(msg) +` published to: ${'game'}:${roles[j]} delay:${ms}`) //todo remove
        s.publish(`${'game'}:${roles[j]}`, encoded);//todo fix later
      }
    }, ms);
  }
}

// Base interface - every game room must have
export interface GameRoom {
  players: Uint8Array;

  /** todo manage logic for game message then return where each object of array has
   *  {
   * 
   * msg:message_object_free_form,
   * 
   * ms:delay_in_milliseconds_to_send_to_client,
   * 
   * roles: array of roles to send message to
   * 
   * } structure.
   * @param mt - message type(cut second byte from Uint8Array)
   * @param msg - incoming data after cut first byte(key), and second byte(mt)
   * @param uuid - the player identifier. Incrementable number
   * */
  handle_game_message(mt:MT, msg: Uint8Array, uuid: number, ws:Bun.ServerWebSocket<WebSocketData>): GameRoomResponseMessage[];
}

/** check the room to exit_game if not enough players */
export function check_room_on_ws_close(
  user_uuid:number,
){
  
console.log("remove this artefact, if not used")  

}
