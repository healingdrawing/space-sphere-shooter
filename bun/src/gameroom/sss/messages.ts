import { DEVLOG, devlog, errlog, rawlog } from "../../debug/debug";
import { MT } from "../../enums/mt";
import { mm } from "../../manage/message";
import type { GameRoomResponseMessage, AnyGameRoom } from "../base";
import type { TMDC_BOARD_MESSAGE } from "./gameboard/types";

/** create message to select the cell on client side. */
export function select_cell_message(c: number, role: number): GameRoomResponseMessage {
  const msg = { t: 888, c }; //todo fix later
  const ms = 0;
  const roles = [role]; // [0] to both/all players //todo to click initiator only 
  if (DEVLOG) devlog("select_cell_message executed", "msg: " + mm.logobj(msg) + " ms: " + ms + " roles: " + roles); //todo remove
  return { msg, ms, roles };
}
//warning remove. first polish indices above, 0-63 to 1-64. then touch this
/**
 * @param c destination cell number
 * @param duration of the animation/step in milliseconds
 * @param o original cell number where item placed at the beginning of the step
 */
function step_to_cell_message(c: number, o: number, duration: number): GameRoomResponseMessage {
  const msg = { t: 888, c, ms: duration, o }; // todo fix later
  const ms = 0;
  const roles = [0]; // [0] to both/all players

  if (DEVLOG) devlog("step_to_cell_messages executed", "msg: " + mm.logobj(msg) + " ms: " + ms + " roles: " + roles); //todo remove
  return { msg, ms, roles };
}
/** command to rip item/cell on client side. Tricky
 * {t:MT.G,c:0, o}
 * @param o cell number to rip
 */
export function rip_cell_message(o: number): GameRoomResponseMessage {
  const msg = { t: 888, c: 0, o }; //todo fix later
  const ms = 0;
  const roles = [0]; // [0] to both/all players

  if (DEVLOG) devlog("room.ts rip_cell_messages executed", mm.logobj(msg), ms, roles); //todo remove
  return { msg, ms, roles };
}
/**
 * @returns  messages for role specified client.
*/
export function click_cell_client_messages(msgs: TMDC_BOARD_MESSAGE[]): GameRoomResponseMessage[] {
  if (!msgs.length) {
    errlog("click_cell_client_messages() empty msgs");
    return [];
  }
  if (DEVLOG) rawlog("cmds.lenght ", msgs.length, "cmds ", mm.logobj(msgs)); //todo remove

  const result = [];
  const mlen = msgs.length;
  for (let i = 0; i < mlen; i++) {
    const cmd = msgs[i]!;
    if (cmd.c > 0) {
      if (!cmd.ms) result.push(select_cell_message(cmd.c, cmd.to_role));
      else result.push(step_to_cell_message(cmd.c, cmd.o!, cmd.ms!));
    } else if (cmd.c < 0) result.push(select_cell_message(cmd.c, cmd.to_role)); //will unselect since c<0
    else if (!cmd.ms) result.push(rip_cell_message(cmd.o!));
    // warning gameover implemened separately. see types.ts TMDC_DELAYED_MESSAGE
  }

  return result;
}
/** gameover implementation */
export function exit_game_messages(msgs: TMDC_BOARD_MESSAGE[]): GameRoomResponseMessage[] {
  const result: GameRoomResponseMessage[] = [];

  const mlen = msgs.length;
  for (let i = 0; i < mlen; i++) {
    const m = msgs[i]!;
    const msg = { t: 888, c: m.c, o: m.o, ms: m.ms }; //todo fix later
    const ms = 0;
    const roles = [m.to_role];
    if (DEVLOG) devlog("room.ts exit_game_messages executed", mm.logobj(msg), ms, roles); //todo remove
    result.push({ msg, ms, roles });
  }

  return result;
}

export function ws_close_exit_game_messages(room: AnyGameRoom): GameRoomResponseMessage[] {
  const result: GameRoomResponseMessage[] = [];

  result.push(...exit_game_messages(room.board.ws_close_exit_game()));

  return result;
}
