import { mm, type SideRotation } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const topmove_handler = (text:string) => {
  console.log("topmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as SideRotation
    //todo check
    game_box.topmove_ship(obj)
  } catch (e) {
    console.error("wrong topmove data received:",e)
  }
}