import { mm, type FrontRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const cwmove_handler = (text:string) => {
  console.log("cwmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as FrontRotation
    //todo check
    game_box.cwmove_ship(obj)
  } catch (e) {
    console.error("wrong cwmove data received")
  }
}