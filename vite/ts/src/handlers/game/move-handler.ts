import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export interface Frontmove{
   uuid:number, cx:number, cy:number, cz:number, vvx:number, vvy:number, vvz:number, vts:number 
}

export const move_handler = (text:string, front = true) => {
  console.log("frontmove_handler or stopmove_handler() text:", text) //todo remove
  let obj:Frontmove
  try {
    const obj = mm.parse(text) as Frontmove
    //todo check
    game_box.move_ship(obj, front)
  } catch (e) {
    console.error("wrong frontmove data received")
  }
}