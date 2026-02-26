import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"

export const exit_handler = (text:string) => {
  console.log("exit_handler() text:", text) //todo remove
  const exit = mm.parse(text) as {uuid:number}
  if (exit.uuid) game_box.remove_ship(exit.uuid, game_box.ships)
  else  console.error("exit_handler: incorrect exit.uuid")
}