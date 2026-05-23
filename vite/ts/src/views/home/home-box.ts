import { store, ws_atom } from "../../atoms";
import { use_key } from "../../handlers/utils";
import { mm, MT } from "../../tunnel";
import { init_ws } from "../../ws";
import { color_picker } from "./color-picker";

const host = import.meta.env.VITE_SERVER_HOST;
const port = import.meta.env.VITE_SERVER_PORT;

const is_local = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
const protocol = is_local ? 'http' : 'https';

const check_connection_url = is_local ? `${protocol}://${host}:${port}/check`:`${protocol}://${host}/check`

const connect_to_ws_url = is_local?`ws://${host}:${port}/ws`:`wss://${host}/ws`

console.log("server host:",host)// todo remove
console.log("server port:",port)
console.log("server protocol:",protocol)
console.log("location.hostname:",location.hostname)

function create_home_box(){
  const color_box = color_picker()
  const view = document.createElement('div');
  view.id = 'home-view';
  view.className = 'view';
  view.innerHTML = `
    <h1>Welcome</h1>
    <div>
      <input id="nick" placeholder="nickname" value="ixoxi33!3!3!##">
    </div>
    <span>Set identity game color</span>
    <div id="color-picker"></div>

    <button id="download-assets">Download assets</button>
    <button id="check-connection">Check Connection</button>
    <button id="connect-websocket">Connect to WebSocket</button>

    <div><br><img src="/qr-play-online-for-free.png"></div>

    <div style="margin-top: 2rem; line-height: 1.5;">
      <strong>Controls (Keyboard)</strong><br>
      Hold longer = stronger action (max 100% ~2 sec)<br>
      Release = execute action<br><br>

      <strong>Move</strong><br>
      [A / Numpad1]: Forward<br>
      [Z / Numpad2]: Stop<br><br>
      
      <strong>Rotate(around center)</strong><br>
      [W / Numpad7]: CCW (drill)<br>
      [E / Numpad8]: Pitch up<br>
      [D / Numpad9]: CW (drill)<br>
      [Q / Numpad4]: Left (spin)<br>
      [S / Numpad5]: Pitch down<br>
      [C / Numpad6]: Right (spin)<br>
      [X / Numpad3]: Toward target<br><br>

      <strong>Shoot</strong><br>
      [F / Numpad0]: Front<br>
      [N / ←]: Left<br>
      [L / →]: Right<br>
      [K / Numpad Enter]: Back<br>
      [J / ↑]: Top<br>
      [M / ↓]: Bottom<br><br>

      <strong>Other</strong><br>
      [O / Numpad -]: Exit
    </div>
    
  `;

  /** raw return nick name of user from html input //todo sanitaze */
  const nick = () => (view.querySelector('#nick') as HTMLInputElement).value || "incorrect nick"

  let assets_not_ready = false //warning default false for dev needs. must be true
  async function download_assets(){
    if(assets_not_ready){
      assets_not_ready = false
      alert("assets download simulation complete. Now can try to connect.")
    }else{
      alert("assets ready. try to connect.")
    }
  }

  async function check_the_connection(e:Event) {
    const btn = e.target as HTMLButtonElement
    btn.disabled = true
    btn.style.pointerEvents = 'none' //bug just epic shit. Without this line, the Browser allows to disabled and shadowed on screen button to send clicks. Full success.

    try {
      const response = await fetch(check_connection_url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      const text = await response.text();
      switch (response.status) {
        case 200:
        case 403:
          alert(text);
          break;
        default:
          alert(`${text}.\nUnexpected response.\nTry later`);
          throw new Error('Server not responding properly');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  }
  
  async function connect_to_server(e: Event) {
    if (assets_not_ready){
      alert("First download the assets. Mandatory to gameplay.")
    }else {
      
      const btn = e.target as HTMLButtonElement
      btn.disabled = true
      btn.style.pointerEvents = 'none'

      const ws = init_ws(connect_to_ws_url);
      ws.onopen = () => {
        store.set(ws_atom, ws);
        console.log('ws.onopen fires');

        const key = use_key()
        const dummy = {rgb:color_box.color, nick:home_box.nick()}
        // add message type
        const with_mt = mm.keyu8a(MT.JOIN, mm.obju8a(dummy))
        // add key. Now mt is second byte
        ws.send(mm.keyu8a(key, with_mt)); //todo fix later
        //warning this is initial message so ram.key is zero, so no need check ram.key
      };
    }
  }

  view.querySelector('#color-picker')!.appendChild(color_box.widget)
  view.querySelector('#download-assets')!.addEventListener('pointerup', download_assets);
  view.querySelector('#check-connection')!.addEventListener('pointerup', check_the_connection);
  view.querySelector('#connect-websocket')!.addEventListener('pointerup', connect_to_server);

  return {view, color_box, nick}
}

export const home_box = create_home_box()
