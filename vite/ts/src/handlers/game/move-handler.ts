import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"
import { type Frontmove } from "../../tunnel"


export const move_handler = (text:string) => {
  console.log("frontmove_handler or stopmove_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as Frontmove
    //todo check
    game_box.move_ship(obj)
  } catch (e) {
    console.error("wrong frontmove or stopmove data received")
  }
}
