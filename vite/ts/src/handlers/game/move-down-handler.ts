import { mm, type SideRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const move_down_handler = (text:string) => {
  console.log("downmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as SideRotation
    //todo check
    game_box.move_down_ship(obj)
  } catch (e) {
    console.error("wrong downmove data received:",e)
  }
}