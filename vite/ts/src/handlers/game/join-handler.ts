import { game_box } from "../../views/game/game-box"

export function join_handler(text:string){
  console.log("join_handler() text:", text) //todo remove
  game_box.initGameView()

}