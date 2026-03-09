import { mm, type TopRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const move_left_handler = (text:string) => {
  console.log("leftmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as TopRotation
    //todo check
    game_box.move_left_ship(obj)
  } catch (e) {
    console.error("wrong leftmove data received:",e)
  }
}