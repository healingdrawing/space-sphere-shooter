import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export interface Leftmove{
   uuid:number, vts:number 
}

export const leftmove_handler = (text:string) => {
  console.log("frontmove_handler or stopmove_handler() text:", text) //todo remove
  let obj:Leftmove
  try {
    const obj = mm.parse(text) as Leftmove
    //todo check
    game_box.leftmove_ship(obj)
  } catch (e) {
    console.error("wrong leftmove data received")
  }
}