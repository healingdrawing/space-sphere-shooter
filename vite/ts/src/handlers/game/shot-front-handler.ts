import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"
import { type LazerBeam } from "../../tunnel"


export const shot_front_handler = (text:string) => {
  console.log("frontshot_handler() text:", text) //todo remove
  try {
    const obj = mm.parse(text) as LazerBeam
    //todo check
    game_box.lazer_shot(obj)
  } catch (e) {
    console.error("wrong frontshot data received")
  }
}
