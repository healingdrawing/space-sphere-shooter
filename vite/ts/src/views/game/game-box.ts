import { store, ws_atom } from "../../atoms"
import { use_key } from "../../handlers/utils";
import { KEYMAP, mm, MT } from "../../tunnel"
import { add_ship } from "./add-ship";
import { home_box } from "../home/home-box";



function create_game_box() {
  
  const container = document.createElement('div');
  container.id = 'game-container';
  container.className = 'w-[400px] h-[400px] mx-auto';

  const view = document.createElement('div');
  view.id = 'game-view';
  view.className = 'view';
  view.style.display = 'none';

  const game_title = `<h2 class="text-center">Space Sphere Shooter</h2>`;
  view.innerHTML = game_title
  view.append(container);

  let engine: BABYLON.Engine | null = null;
  let scene: BABYLON.Scene | null = null;
  let animationId: number | null = null;
  
  const colors = {
    idle:new BABYLON.Color3(0.2, 0, 0.2),
    hovered:new BABYLON.Color3(0, 1, 1),
    selected:new BABYLON.Color3(1, 1, 0),
    rip:new BABYLON.Color3(0.3, 0.3, 0.3),
    black:new BABYLON.Color3(0, 0, 0)
  }
  
  function add_exit_button_to_game_view(ws:WebSocket){
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
      ws.send(mm.keyu8a(key, mm.obju8a({ t: 888, c:0 }))); //todo fix later
    })
    view.insertBefore(b, view.firstChild);
  }
 
  function initGameView() {
    console.log("dummy init game view executed")
    const ws = store.get(ws_atom)
    if (!ws){
      alert("client websocket is null. should never happen. switch to home view")
      return
    }
    console.log("Initial WebSocket:", ws);

    add_exit_button_to_game_view(ws)
    dev_gap(ws) //

    if (engine) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '400px';
    canvas.style.height = '400px';
    container.appendChild(canvas);

    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    // Camera: perspective, 45 deg tilt
    const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 4, 12, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

    function animate() {
      if (!engine || !scene) return;
      scene.render();
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  /** show gameover visuals o during ms, then switch to chat.
   * @param o variant of visuals
   * @param ms [milliseconds]
   * */
  function game_over(){
    console.warn("gameover visuals not implemented") //todo implement
    setTimeout(() => {
      // page reload to home page with closing websocket etc
    }, 3000)
  }

  
  return { view, initGameView, game_over, dev_gap };

  function send_client_action(ws:WebSocket, action:number){
    const key = use_key()
      if(!key){
        console.error("in some reasons there was no key at the request moment, so message was not sent. Reload browser window, to try connect again.")
        return
      }
      console.log("clicked button. KeyCode:", action);//todo remove
      const dummy = { t: 555, c:0 }
      // add message type
      const with_mt = mm.keyu8a(action, mm.obju8a(dummy))
      // add key. Now mt is second byte
      ws.send(mm.keyu8a(key, with_mt)); //todo fix later
  }

  /** test keymap. Raw key listeners //todo implement */
  function dev_gap(ws:WebSocket) {
    home_box.view.style.display = 'none';
     const gameView = view;
     gameView.style.display = 'block';
     gameView.focus();
   
     const pressed = new Set<string>();
   
     const onKeyDown = (e: KeyboardEvent) => {
       if (pressed.has(e.code)) return;
       pressed.add(e.code);
       const action = KEYMAP[e.code]
       console.log('DOWN', e.code, 'KEYMAP[e.code]:', action);
       send_client_action(ws, action)
     };
   
     const onKeyUp = (e: KeyboardEvent) => {
       pressed.delete(e.code);
       const action = KEYMAP[e.code]
       console.log('UP', e.code, 'KEYMAP[e.code]:', action);
       send_client_action(ws, action)
     };
   
     const onPointerDown = (e: PointerEvent) => {
       console.log('POINTER DOWN', e.pointerType);
     };
   
     const onPointerUp = (e: PointerEvent) => {
       console.log('POINTER UP', e.pointerType);
     };
   
     document.addEventListener('keydown', onKeyDown);
     document.addEventListener('keyup', onKeyUp);
     document.addEventListener('pointerdown', onPointerDown);
     document.addEventListener('pointerup', onPointerUp);
   }//todo fix later
}

export const game_box = create_game_box();
