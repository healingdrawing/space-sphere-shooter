import { mm, type Ship } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export function join_handler(text:string){
  console.log("join_handler() text:", text) //todo remove
  const ship = mm.parse(text) as Ship
  game_box.initGameView(ship)

}