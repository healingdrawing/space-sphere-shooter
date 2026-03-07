import { MT } from "../../tunnel"
import { send_client_action } from "./client-actions"

export const add_exit_button_to_game_view = (ws:WebSocket, view: HTMLDivElement) => {
  const b = document.createElement('button')
  b.id = "exit-button"
  b.textContent = "exit"
  b.addEventListener('pointerup', () => {
    b.disabled = true
    b.style.pointerEvents = 'none'
    send_client_action(ws, MT.EXIT)
  })
  view.insertBefore(b, view.firstChild);
}