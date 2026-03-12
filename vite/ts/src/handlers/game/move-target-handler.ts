import { mm, type Rotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const move_target_handler = (text:string) => {
  console.log("move_target_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as Rotation
    //todo check
    game_box.move_target_ship(obj)
  } catch (e) {
    console.error("wrong target move data received:",e)
  }
}