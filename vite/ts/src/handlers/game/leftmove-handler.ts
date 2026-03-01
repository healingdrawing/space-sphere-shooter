import { mm, type TopRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const leftmove_handler = (text:string) => {
  console.log("leftmove_handler() text:", text) //todo remove
  let obj:TopRotation
  try {
    const obj = mm.parse(text) as TopRotation
    //todo check
    game_box.leftmove_ship(obj)
  } catch (e) {
    console.error("wrong leftmove data received")
  }
}