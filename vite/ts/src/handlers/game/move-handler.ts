import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"
import { type Frontmove } from "../../tunnel"


export const move_handler = (text:string, front = true) => {
  console.log("frontmove_handler or stopmove_handler() text:", text) //todo remove
  let obj:Frontmove
  try {
    const obj = mm.parse(text) as Frontmove
    //todo check
    game_box.move_ship(obj, front)
  } catch (e) {
    console.error("wrong frontmove or stopmove data received")
  }
}
