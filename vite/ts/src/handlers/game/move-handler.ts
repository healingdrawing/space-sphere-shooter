import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"
import { type Frontmove } from "../../tunnel"


export const move_handler = (text:string) => {
  console.log("move_handler() (front or stop) text:", text) //todo remove
  try {
    const obj = mm.parse(text) as Frontmove
    //todo check
    game_box.manage_move(obj)
  } catch (e) {
    console.error("wrong front move or stop move data received")
  }
}
