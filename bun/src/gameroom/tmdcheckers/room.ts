import { DEVLOG, devlog, errlog, rawlog } from "../../debug/debug";
import { mm } from "../../manage/message";
import { destroy_game_room, gamerooms, send_delayed_messages, type GameRoom, type GameRoomResponseMessage } from "../base";
import { TMDCheckersBoard } from "./gameboard/board";
import type { TMDC_BOARD_ACTION } from "./gameboard/types";
import { GameRoomDelayedAction } from "./gameboard/enums";
import { rip_cell_message, select_cell_message, click_cell_client_messages, exit_game_messages } from "./messages";

export class TMDCheckersRoom implements GameRoom {
  /** gameroom uuid generated in init process */
  id: string;
  /** versus mode of the game */
  
  /** todo player uuids of the game room. Used in room.destroy() iterator*/
  players: Set<string> = new Set()

  min_players = 2 // for this game, to exit game when ws.close() fires
  
  /** gameboard, where gameplay calculated using handle message */
  board:TMDCheckersBoard

  private no_damage_exit_timer: NodeJS.Timeout | null = null;
  private no_step_exit_timer: NodeJS.Timeout | null = null;

  private start_check_no_damage_exit_timer(){
    this.no_damage_exit_timer = setTimeout(() => {
      if (this.board.get_damage_happen_and_reset()) this.start_check_no_damage_exit_timer()
        else {
          if(this.board.has_scheduled_exit) return
          this.board.has_scheduled_exit = true
          this.schedule_no_activity_exit_game()
        }
    }, 60000);
  }
  private start_check_no_step_exit_timer(){
    this.no_step_exit_timer = setTimeout(() => {
      if (this.board.get_step_happen_and_reset()) this.start_check_no_step_exit_timer()
      else {
        if(this.board.has_scheduled_exit) return
        this.board.has_scheduled_exit = true
        this.schedule_no_activity_exit_game()
      }
    }, 10000);
  }
  private schedule_no_activity_exit_game(){
    const b = this.board
    const cmd = b.no_activity_exit_game(this.players.size, b.get_current_victory_role())
    send_delayed_messages(exit_game_messages(cmd[0]))
    this.recursive_actions_executor(cmd[1])
  }
  
  recursive_actions_executor( actions:TMDC_BOARD_ACTION[] ){
    const alen = actions.length
    for (let i=0;i<alen;i++){
      const {atype, data, ms} = actions[i]!//warning unsafe speed
      switch(atype){
        case GameRoomDelayedAction.MOVE_ITEM_TO_CELL:{
          setTimeout(() => {
            const {c, cell, recovering, role} = data
            const act = this.board.move_dragon_to_cell(c, {...cell}, recovering, role)
            this.recursive_actions_executor([act])
          }, ms)
          break
        }
        case GameRoomDelayedAction.ATTACK_CELL:{
          setTimeout(() => {
            const {idx, dmg} = data
            const rip = this.board.attack_cell(idx, dmg)
            if (rip) send_delayed_messages([rip_cell_message(rip)])
          }, ms)
          break
        }
        case GameRoomDelayedAction.SELECT_CELL_AFTER_RECOVERING:{
          setTimeout(() => {
            const { c, role } = data
            const still = this.board.select_cell_after_recovering(c, role)
            if(still) send_delayed_messages([select_cell_message(c, role)])
          }, ms)
          break
        }
        case GameRoomDelayedAction.EXIT_GAME:{
          setTimeout(() => {
            // const { role } = data //todo remove
            destroy_game_room( this)
          }, ms)
          break
        }
      }
    }
  }

  handle_game_message(msg: Uint8Array , role: number): GameRoomResponseMessage[] {
    const result:GameRoomResponseMessage[] = []
    /** command:
     * > 0 - cell physical index(array index + 1) ,
     * 0 - exit game,
     * < 0 - idk ...
     * */
    const c = -1 // msg.c //todo fix later
    /** game board */
    const b = this.board
    
    /** potential attempt to click */
    if (c > 0){
      /** check the data */
      if(c > b.size){
        errlog("consider hijacking attempt b.size", b.size) //todo implement
        return []
      }
      /** click on cell of the board, then inform client */
      const cmd = b.click_cell(c,role)
      result.push(...click_cell_client_messages(cmd[0]))
      this.recursive_actions_executor(cmd[1])
      
    }else if(c < 0){
      devlog("Method handle_game_message (tmdc) c<0 not implemented.");
      errlog("consider hijacking attempt c<0", c) //todo implement
    }else{
      if(b.has_scheduled_exit) return result
      b.has_scheduled_exit = true

      const cmd = b.player_exit_game(role, this.players.size)
      rawlog("cmd: "+mm.logobj(cmd))
      result.push(...exit_game_messages(cmd[0]))
      this.recursive_actions_executor(cmd[1])
    }

    return result
  }

  /** add player role,uuid pair, to resubscribe back to chat when game room destroyed */
  add_client(uuid:string ){
    const p = this.players
    p.add(uuid)
    return p.size
  }
  remove_client(uuid:string){
    const p = this.players
    p.delete(uuid)
    return p.size
  }

  destroy(): void {
    //todo consider return false when delete fails, to emergency case later.
    clearTimeout(this.no_damage_exit_timer!) //warning unsafe speed
    clearTimeout(this.no_step_exit_timer!)
    if (!gamerooms.delete(this.id)) errlog("room.destroy issue", "gamerooms.delete(this.id) return false")
  }

  /** execute periodical checks to no activity in gameboard to exit */
  start_checks(){
    this.start_check_no_damage_exit_timer()
    this.start_check_no_step_exit_timer()
  }

  /** warning at the moment vsmode must be VSMODE.VS (player vs player), bot and demo for later */
  constructor(){
    this.id = Bun.randomUUIDv7()
    this.board = new TMDCheckersBoard()
    if(!DEVLOG) this.start_checks() // to mute checks in debug mode. Depends on .env
  }
}
