import { s, type WebSocketData } from "..";
import { DEVLOG, devlog, errlog, rawlog } from "../debug/debug";
import { mm } from "../manage/message";
import { users } from "../ram/consts";
import { TMDCheckersRoom } from "./tmdcheckers/room";
import { ws_close_exit_game_messages } from "./tmdcheckers/messages";

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
  id: string;
  /** minimum players to keep room alive */
  min_players:number;
  players: Set<string>;

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
   * @param role - the player(message sender) role in game room. The key in "players" map
   * */
  handle_game_message(msg: Uint8Array, role: number): GameRoomResponseMessage[];
  destroy(): void;
}


// class FutureRoom implements GameRoom {  }. Then extend below

// todo extend using | FutureRoom etc
/** Union type — all possible(planned for GT1VS1) game room types */
export type AnyGameRoom =
  | TMDCheckersRoom;

export const gamerooms = new Map<string, AnyGameRoom>()

/** create and prepare new game room of supported type */
export function init_room(){
  let room: AnyGameRoom
  room = new TMDCheckersRoom()
  
  gamerooms.set(room.id, room)
  devlog("init_room() executed")
  return room
}

/**
 * Send system message to switch game room clients to chat view.
 * Resubscribe conneced clients to chat room on server side.
 * Remove game room from gamerooms map.
 * */
export function destroy_game_room(
  room:AnyGameRoom,
){
  rawlog("destroy_room executed()")//todo remove
  let clients:Bun.ServerWebSocket<WebSocketData>[] = []

  const players = room.players
  for (const uuid of players){
    const u = users.get(uuid)
    if (u){
      clients.push(u.ws)
      if(DEVLOG) rawlog("room.player uuid ",uuid) //todo remove
    }
  }
  
  room.destroy()
}

/** check the room to exit_game if not enough players */
export function check_room_on_ws_close(
  user_uuid:string,
){
  
  const room = gamerooms.get('game') //todo fix later
  if(!room) {
    errlog("artefact. must be fixed")
    return
  } //warning consider errlog. Closed ws subscribed to fake room_id

  const b = room.board
  if (b.has_scheduled_exit) return
  b.has_scheduled_exit = true //one exit is enough

  if(room.remove_client(user_uuid) < room.min_players){
    const exit_msgs = ws_close_exit_game_messages(room)
    send_delayed_messages(exit_msgs)
    /** no actions, straight destroy call.
     * Otherwise hard to separate action types between games,
     * since check ws_close must be common for all games, to shorten checks.
     */
    setTimeout(() => { // otherwise unsubscribe fires before messages sent
      destroy_game_room(room)
    }, Math.log(exit_msgs.length + 1) * 1000 + 2000);
  }
}
