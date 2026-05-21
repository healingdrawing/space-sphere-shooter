import { mm, type Rotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const rotate_handler = (text:string) => {
  console.log("rotate_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as Rotation
    game_box.manage_rotation(obj)
  } catch (e) {
    console.error("wrong rotate data received:",e)
  }
}
