import { MT } from "../../tunnel"
import { send_client_action } from "./client-actions"

export const add_exit_button_to_game_view = (ws:WebSocket, view: HTMLDivElement) => {
  const b = document.createElement('button')
  b.id = "exit-button"
  b.textContent = "exit"
  b.addEventListener('pointerup', () => {
    b.disabled = true
    b.style.pointerEvents = 'none'
    send_client_action(ws, MT.EXIT, 0)
  })
  view.insertBefore(b, view.firstChild);
}

export const add_show_ui_down_button_to_game_view = (view: HTMLDivElement) => {
  const btn = document.createElement('button');
  btn.textContent = 'show UI ↓';
  
  let visible = false;
  const ui = view.querySelector('.ui-down') as HTMLDivElement | null;

  btn.onclick = () => {
    if (!ui) return;
    visible = !visible;
    ui.style.display = visible ? 'block' : 'none';
  };

  view.insertBefore(btn, view.firstChild);
}

export const add_show_ui_side_button_to_game_view = (view: HTMLDivElement) => {
  const btn = document.createElement('button');
  btn.textContent = '← UI →';
  
  let visible = false;
  const left = view.querySelector('.ui-left') as HTMLDivElement | null;
  const right = view.querySelector('.ui-right') as HTMLDivElement | null;

  btn.onclick = () => {
    if (!left || !right) return;
    visible = !visible;
    const display = visible ? 'block' : 'none';
    left.style.display = display;
    right.style.display = display;
  };

  view.insertBefore(btn, view.firstChild);
}
