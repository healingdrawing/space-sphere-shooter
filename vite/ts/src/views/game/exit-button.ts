import { use_key } from "../../handlers/utils"
import { MT } from "../../tunnel"
import { send_client_action } from "./client-actions"

export const add_exit_button_to_game_view = (ws:WebSocket, view: HTMLDivElement) => {
  const b = document.createElement('button')
  b.id = "exit-button"
  b.textContent = "exit"
  b.addEventListener('pointerup', () => {
    b.disabled = true
    b.style.pointerEvents = 'none'

    const key = use_key()
    if(!key){
      console.error("in some reasons there was no key at the exit request moment, so message was not sent. Reload browser window, to try connect again.")
      return
    }
    console.log("clicked exit button");//todo remove
    send_client_action(ws, MT.EXIT)
  })
  view.insertBefore(b, view.firstChild);
}