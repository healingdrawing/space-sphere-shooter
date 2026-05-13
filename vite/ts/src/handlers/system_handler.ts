import { ram } from "../ram"
import { mm } from "../tunnel"
import { game_box } from "../views/game/game-box"
import { set_hp_on_screen } from "../views/game/html-view"

/**
 * @prop umn USERS_MAX_NUMBER,
 * @prop sst_ms SERVER_START_TIME_MS from bun .env server side
 * @prop alert_text text to show as browser screen alert
 * @prop hit the id(uuid) of ship is hit by lazershot
 * @prop hp the value still left after subtraction on server side
 */
interface SystemMessage {
  umn:number,
  sst_ms:number,
  alert_text:string,
  hit:number,
  hp:number
}

export function system_handler( text:string ){
  console.log("system_handler()") //todo remove
  let obj:SystemMessage
  try {
    obj = mm.parse(text) as SystemMessage
    if (obj.hit && obj.hp && game_box.get_player_idx() === obj.hit){
      //player hit so change the hp indicator value shown
      set_hp_on_screen(obj.hp)
    }

    if (obj.umn){
      console.log("USERS_MAX_NUMBER:",obj.umn)
      ram.umn = obj.umn
    }
    if (obj.sst_ms){
      console.log(" SERVER_START_TIME:",obj.sst_ms)
      ram.sst_ms = obj.sst_ms
    }
    if (obj.alert_text) alert(obj.alert_text)
  } catch (e) {
    console.error("system_handler", e)
    return
  }
}
