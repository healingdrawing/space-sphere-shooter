import { mm, type Ship } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export function ship_handler(text:string){
  console.log("ship_handler() text:", text) //todo remove
  const ship = mm.parse(text) as Ship
  game_box.add_ship(ship, game_box.get_scene(), game_box.ships)
}
