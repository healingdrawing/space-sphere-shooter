import { DEVLOG, devlog, errlog, rawlog } from "../../debug/debug";
import { type GameRoomResponseMessage, type GameRoom, broadcast_exit_message } from "../base";
import { SSSBoard } from "./gameboard/board";

import { USERS_MAX_NUMBER } from "../../ram/consts";
import { MT } from "../../enums/mt";
import { handle_back_shot, handle_ccw_move, handle_cw_move, handle_down_move, handle_down_shot, handle_join, handle_exit, handle_front_move, handle_front_shot, handle_left_move, handle_left_shot, handle_right_move, handle_right_shot, handle_stop_move, handle_target_move, handle_top_move, handle_top_shot } from "./handlers/game";
import { CCR } from "../../manage/close";
import type { WebSocketData } from "../..";
import { parse_guns, parse_limits } from "./ship/limits";
import type { Ship } from "./types";
import { rts } from "../../utils/basetime";

export class SSSGameRoom implements GameRoom {
  /** incrementable index as uuid of players. Just ++ every time. Ok for now */
  private room_size = USERS_MAX_NUMBER + 1;
  /** generate new uuid:number in game room and return */
  new_uuid = () =>{
    const p = this.players //uint8array
    const size = this.room_size
    for(let i = 1;i < size;i++){
      if (!p[i]){
        p[i]=1 // make slot busy
        return i
      }
    }
    errlog("room.new_uuid() returned 0. Was executed with no free slots.")
    return 0
  }
  
  players: Uint8Array = new Uint8Array(this.room_size)
  /** gameboard, where gameplay calculated using handle message */
  board:SSSBoard

  /** return uuid */
  add_client(){
    const uuid = this.new_uuid()
    if (!this.ships_auto_update_timer) this.ships_auto_update() //should fire only, when first active connection
    return uuid
  }
  /** clean room, gameboard, broadcast client exit */
  remove_client(uuid:number){
    this.players[uuid] = 0 //clean the slot, and free the "uuid"(that is index in array)
    //warning non mandatory reset_ship call. Can set ship_idx=0 to speedup, with artefacts
    this.board.reset_ship(uuid)
    this.check_room_is_empty()
    //inform other clients to remove ship
    broadcast_exit_message(uuid)
  }

  join_game( uuid:number, nick:string, rgb:{r:number,g:number,b:number}, ){
    const i = uuid
    const c = rgb
    const b = this.board
    const {front_guns, side_guns, vert_guns, engines} = parse_guns(nick)
    const {mass, max_lvelo, max_avelo, maccel, daccel, fr, br, sr, vr, max_en, max_hp} = parse_limits(nick)
    if(DEVLOG) devlog("front_guns, side_guns, vert_guns, engines",`${front_guns}, ${side_guns}, ${vert_guns}, ${engines}`) //todo remove

    const ship: Ship = {
      idx: i,
      r: c.r, g: c.g, b: c.b,
      mass: mass,
      max_lvelo: max_lvelo, max_avelo: max_avelo, maccel: maccel, daccel: daccel,
      front_guns: front_guns, side_guns: side_guns, vert_guns: vert_guns,
      engines: engines,
      fr: fr, br: br, sr: sr, vr: vr,
      max_en: max_en, en: 0, en_ts: 0,
      max_hp: max_hp, hp: max_hp, hp_ts: 0, //warning at the moment do not plan recover

      //todo randomise without collision damage some way
      cx: 0, cy: 0, cz: 0,
      fvx: 0, fvy: 0, fvz: 1, //z is front axis default
      tvx: 0, tvy: 1, tvz: 0, // y is top/vertical axis default
      vvx: 0, vvy: 0, vvz: 0, v_ts: 0,
      
      avf: 0, avf_ts:0, avf_tsend:0,
      avt: 0, avt_ts:0, avt_tsend:0,
      avs: 0, avs_ts:0, avs_tsend:0,
    };
    b.write_ship(i, ship)

    
    if(DEVLOG) b.log_ship(i) //todo remove
    
    // return new ship to send to all clients //todo remove
    return ship


  }

  private ships_auto_update_timer: NodeJS.Timeout | null = null;
  /** check there are no connected players, than stop ships autoupdate */
  private check_room_is_empty(){
    const size = this.room_size
    const p = this.players
    
    for (let i=1;i<size;i++) if(p[i]) return //check someone still connected
    
    if (this.ships_auto_update_timer){
      clearTimeout(this.ships_auto_update_timer)
      this.ships_auto_update_timer = null
    }
  }

  /** update:
   * ship positions, with pause 200ms(not super precised, but should be enough)
   */
  ships_auto_update(){
    const now = rts()
    this.board.update_ship_rotations(now)
    this.board.update_ship_positions(now)
    
    let timer = this.ships_auto_update_timer
    if(!timer ) timer = setTimeout(() => {
      this.ships_auto_update()
    }, 10);//todo consider to move 200[ms] to .env 
  }

  // recursive_actions_executor( actions:TMDC_BOARD_ACTION[] ){
  //   const alen = actions.length
  //   for (let i=0;i<alen;i++){
  //     const {atype, data, ms} = actions[i]!//warning unsafe speed
  //     switch(atype){
  //       case GameRoomDelayedAction.MOVE_ITEM_TO_CELL:{
  //         setTimeout(() => {
  //           const {c, cell, recovering, role} = data
  //           const act = this.board.move_dragon_to_cell(c, {...cell}, recovering, role)
  //           this.recursive_actions_executor([act])
  //         }, ms)
  //         break
  //       }
  //       case GameRoomDelayedAction.ATTACK_CELL:{
  //         setTimeout(() => {
  //           const {idx, dmg} = data
  //           const rip = this.board.attack_cell(idx, dmg)
  //           if (rip) send_delayed_messages([rip_cell_message(rip)])
  //         }, ms)
  //         break
  //       }
  //       case GameRoomDelayedAction.SELECT_CELL_AFTER_RECOVERING:{
  //         setTimeout(() => {
  //           const { c, role } = data
  //           const still = this.board.select_cell_after_recovering(c, role)
  //           if(still) send_delayed_messages([select_cell_message(c, role)])
  //         }, ms)
  //         break
  //       }
  //       case GameRoomDelayedAction.EXIT_GAME:{
  //         setTimeout(() => {
            
  //         }, ms)
  //         break
  //       }
  //     }
  //   }
  // }
 
  /** here @param msg already after cut first two bytes (key and mt) */
  handle_game_message(mt:MT, msg: Uint8Array , uuid: number,
    ws:Bun.ServerWebSocket<WebSocketData>,
  ): GameRoomResponseMessage[] {
    const result:GameRoomResponseMessage[] = []
    
    switch (mt) {
      case MT.JOIN: return handle_join(ws, msg);

      case MT.EXIT: handle_exit(ws, msg); break
    
      case MT.FRONTSHOT:
        handle_front_shot(ws, msg);
        break;
    
      case MT.LEFTSHOT:
        handle_left_shot(ws, msg);
        break;
    
      case MT.RIGHTSHOT:
        handle_right_shot(ws, msg);
        break;
    
      case MT.BACKSHOT:
        handle_back_shot(ws, msg);
        break;
    
      case MT.TOPSHOT:
        handle_top_shot(ws, msg);
        break;
    
      case MT.DOWNSHOT:
        handle_down_shot(ws, msg);
        break;
    
      case MT.FRONTMOVE: return handle_front_move(ws, msg);
      case MT.STOPMOVE: return handle_stop_move(ws, msg);
    
      case MT.LEFTMOVE: return handle_left_move(ws, msg);
    
      case MT.RIGHTMOVE: return handle_right_move(ws, msg);
    
      case MT.TOPMOVE: return handle_top_move(ws, msg);
    
      case MT.DOWNMOVE: return handle_down_move(ws, msg);
    
      case MT.CWMOVE: return handle_cw_move(ws, msg);
    
      case MT.CCWMOVE: return handle_ccw_move(ws, msg);
    
      case MT.TARGETMOVE:
        handle_target_move(ws, msg);
        break;
    
      default:
        ws.close(CCR.BROKENTYPE.code, CCR.BROKENTYPE.reason);
        if (DEVLOG) rawlog("handle_game_message() wrong message type received", mt);
    }

    return result
  }

  constructor(){
    this.board = new SSSBoard()
  }
}
