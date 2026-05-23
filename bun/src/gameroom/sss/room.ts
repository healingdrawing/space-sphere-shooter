import { DEVLOG, devlog, errlog, rawlog } from "../../debug/debug";
import { type GameRoomResponseMessage, type GameRoom, broadcast_exit_message } from "../base";
import { SSSBoard } from "./gameboard/board";

import { USERS_MAX_NUMBER } from "../../ram/consts";
import { MT } from "../../enums/mt";
import {
  handle_join,
  handle_exit,
  handle_shot_front,
  handle_shot_back,
  handle_shot_top,
  handle_shot_down,
  handle_shot_left,
  handle_shot_right,
  handle_move_front,
  handle_move_stop,
  handle_rotation,
} from "./handlers/game";
import { CCR } from "../../manage/close";
import type { WebSocketData } from "../..";
import { parse_guns, parse_limits } from "./ship/limits";
import type { Ship } from "./types";
import { rts } from "../../utils/basetime";
import { users } from "../../ram/storage";

export class SSSGameRoom implements GameRoom {
  /** incrementable index as uuid of players. Just ++ every time. Ok for now */
  private room_size = USERS_MAX_NUMBER + 1;
  /** generate new uuid:number in game room and return */
  new_uuid = () =>{
    const size = this.room_size
    const p = this.board.players //uint8array
    for(let i = 1;i < size;i++){
      if (!p[i]){
        p[i]=1 // make slot busy
        return i
      }
    }
    errlog("room.new_uuid() returned 0. Was executed with no free slots.")
    return 0
  }
  
  /** gameboard, where gameplay calculated using handle message */
  board:SSSBoard

  /** return uuid */
  add_client(){
    const uuid = this.new_uuid()
    if (!this.ships_auto_update_timer) this.ships_auto_update() //should fire only, when first active connection
    if (!this.collisions_auto_update_timer) this.collisions_auto_update() //should fire only, when first active connection
    return uuid
  }
  /** clean room, gameboard, broadcast client exit */
  remove_client(uuid:number, force_close_ws = false){
    //warning non mandatory reset_ship call. Can set ship_idx=0 to speedup, with artefacts
    this.board.reset_ship(uuid)
    this.check_room_is_empty()
    //inform other clients to remove ship
    broadcast_exit_message(uuid)
    if (force_close_ws) this.force_close_ws(uuid)
  }

  /* // todo consider implement delayed actions executor as tmdc. this is raw gap */
  force_close_ws(uuid:number){
    const user = users.get(uuid)
    if (user) user.ws.close()
    else errlog("force_close_ws failed to get user. It is raw implementation.")
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
      max_en: max_en, en: max_en, en_ts: 0,
      max_hp: max_hp, hp: max_hp, hp_ts: 0, //warning at the moment do not plan recover

      //todo randomise with check to avoid collision damage some way. Now it is just random position
      cx: b.ship_initial_random_coordinate(),
      cy: b.ship_initial_random_coordinate(),
      cz: b.ship_initial_random_coordinate(),
      
      fvx: 0, fvy: 0, fvz: 1, //z is front axis default (babylonjs default way)
      tvx: 0, tvy: 1, tvz: 0, // y is top/vertical axis default (babylonjs default way)
      avx: 0, avy: 0, avz: 0, // target rotation vector. Specifically for target move

      vvx: 0, vvy: 0, vvz: 0, v_ts: 0,
      av: 0, av_ts:0, ran:0, pan:0,
    };
    b.write_ship(i, ship)

    
    if(DEVLOG) b.log_ship(i) //todo remove
    
    // return new ship to send to all clients //todo remove
    return ship


  }

  private ships_auto_update_timer: NodeJS.Timeout | null = null;
  private collisions_auto_update_timer: NodeJS.Timeout | null = null;
  /** check there are no connected players, than stop ships autoupdate */
  private check_room_is_empty(){
    const size = this.room_size
    const p = this.board.players
    
    for (let i=1;i<size;i++) if(p[i]) return //check someone still connected
    
    if (this.ships_auto_update_timer){
      clearTimeout(this.ships_auto_update_timer)
      this.ships_auto_update_timer = null
    }
    if (this.collisions_auto_update_timer){
      clearTimeout(this.collisions_auto_update_timer)
      this.collisions_auto_update_timer = null
    }
  }

  /** update:
   * 
   * ship rotations
   * 
   * ship positions
   * 
   * with pause 100ms(not super precised, but should be enough)
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

  /** update:
   * 
   * ship collisions
   * 
   * with pause 100ms(not super precised, but should be enough)
   */
  collisions_auto_update(){
    this.board.raw_ships_collider()
    
    let timer = this.collisions_auto_update_timer
    if(!timer ) timer = setTimeout(() => {
      this.collisions_auto_update()
    }, 100);//todo consider to move 200[ms] to .env 
  }

  // warning artefact, from tmdc styled approach, used to execute delayed actions of gameboard. NOT USED
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

      case MT.EXIT: handle_exit(ws, msg); break // returns nothing, just initiates ws.close() at the moment
    
      case MT.FRONTSHOT: return handle_shot_front(ws, msg);
    
      case MT.LEFTSHOT: return handle_shot_left(ws, msg);
    
      case MT.RIGHTSHOT: return handle_shot_right(ws, msg);
    
      case MT.BACKSHOT: return handle_shot_back(ws, msg);
    
      case MT.TOPSHOT: return handle_shot_top(ws, msg);
    
      case MT.DOWNSHOT: return handle_shot_down(ws, msg);
    
      case MT.FRONTMOVE: return handle_move_front(ws, msg);
      case MT.STOPMOVE: return handle_move_stop(ws, msg);
    
      case MT.LEFTMOVE:
      case MT.RIGHTMOVE:
      case MT.TOPMOVE:
      case MT.DOWNMOVE:
      case MT.CWMOVE:
      case MT.CCWMOVE:
      case MT.TARGETMOVE: return handle_rotation(ws, msg, mt);
    
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
