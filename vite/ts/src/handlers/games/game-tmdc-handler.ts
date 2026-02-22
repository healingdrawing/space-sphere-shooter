import { tmdc_game_box } from "../../views/games/tmdc/tmdc-game-box";

export function game_tmdc_handler(c:number, o:number, ms:number){
  if(c>0) {
    if(!ms) tmdc_game_box.select_cell(c)
    else tmdc_game_box.move_item_to(c, o, ms)
  }else if(c<0) tmdc_game_box.unselect_cell(-c)
  // c===0
  else if(!ms) tmdc_game_box.rip_cell(o)
  // ms !== 0
  //warning // todo gameover not implemened. see types.ts TMDC_DELAYED_MESSAGE
  else tmdc_game_box.game_over(o,ms) // o is index of the visual (good, nice, best) or so
}
