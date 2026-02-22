//import type { GameRoomDelayedAction } from "./enums";

import type { GameRoomDelayedAction } from "./enums";

export type TMDC_CellBackup = {
  idx: number
  state: number
  owner: number
  item: number
  type: number
  hp: number
  mp: number
  jump: number
};

/** the data board returns to inform clients about changes. Used to create ws messages
 * 
 * The "to_role" is destination 0-both/all 1-player1 2-player2 3-bot(not implemented)
 * 
 * [c>0]: select cell: [5]
 * 
 * [c<0]: unselect cell: [-8]
 * 
 * [c>0, o>0, ms>0]: move item: [17,33,4000] - move item from cell 33 to cell 17 during 4sec
 * 
 * [c===0, o>0, ms===0]: rip cell : [0,55,0] - rip cell 55
 * 
 * //todo implement below cases
 * [c===0, o===0 ,ms>0]: gameover : [0,0,5000] - show no winner gameover for 5sec, then chat
 * 
 * [c===0, o>0, ms>0]: victory : [0,1,3000] - show victory gameover(version 1) for 3 sec, then chat
 * 
 * [c===0, o<0, ms>0]: defeat : [0,-1,3000] - show defeat gameover(version 1) for 3 sec, then chat (also defeat/exit from client).
 */
export type TMDC_BOARD_MESSAGE =
{
  c:number
  o?:number
  ms?:number
  to_role:number
}

/** action scheduled with delay, for the interaction with the board
 * @param data  the data to execute board action
 * @param ms delay in milliseconds, before execute action
 */
export type TMDC_BOARD_ACTION =
| {
  atype:GameRoomDelayedAction.MOVE_ITEM_TO_CELL
  /** data to execute board action
   * @param recovering is recovering time in ms, used after step complete
   * @param cell the origin cell(start point of the move) parameters
   */
  data:{c:number, cell:TMDC_CellBackup, recovering:number, role:number}
  ms:number
}
| {
  atype:GameRoomDelayedAction.ATTACK_CELL
  data:{idx:number, dmg:number}
  ms:number
}
| {
  atype:GameRoomDelayedAction.SELECT_CELL_AFTER_RECOVERING
  data:{c:number, role:number}
  ms:number
}
| {
  atype:GameRoomDelayedAction.EXIT_GAME
  /** data to execute board action
   * @param role the role of user who clicked exit or defeated. For future stats
   */
  data:{}
  ms:number
}
