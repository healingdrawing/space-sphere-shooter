import { mm } from "../../tunnel"
import { game_box } from "../../views/game/game-box"
import { type LazerBeam } from "../../tunnel"


export const frontshot_handler = (text:string, front = true) => {
  console.log("frontshot_handler() text:", text) //todo remove
  let obj:LazerBeam
  try {
    const obj = mm.parse(text) as LazerBeam
    //todo check
    game_box.lazer_shot(obj)
  } catch (e) {
    console.error("wrong frontshot data received")
  }
}
