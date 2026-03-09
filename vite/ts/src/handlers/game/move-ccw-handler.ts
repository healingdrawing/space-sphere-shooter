import { mm, type FrontRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const move_ccw_handler = (text:string) => {
  console.log("ccwmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as FrontRotation
    //todo check
    game_box.move_ccw_ship(obj)
  } catch (e) {
    console.error("wrong ccwmove data received:",e)
  }
}
