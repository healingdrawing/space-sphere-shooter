import { mm, type TopRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const move_right_handler = (text:string) => {
  console.log("move_right_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as TopRotation
    //todo check
    game_box.move_right_ship(obj)
  } catch (e) {
    console.error("wrong right move data received:",e)
  }
}
