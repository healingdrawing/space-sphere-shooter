import { store, ws_atom } from "../../atoms"
import { use_key } from "../../handlers/utils";
import { KEYMAP, mm, MT, type Ship } from "../../tunnel"
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
  let ship_mesh: BABYLON.Mesh | null = null;
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
      send_client_action(ws, MT.EXIT)
    })
    view.insertBefore(b, view.firstChild);
  }
 
  function initGameView(ship:Ship) {
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
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Set background to black

    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100000 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false; // Ensure the back faces are rendered
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/1", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true; // Prevent the skybox from scaling with the camera

    ship_mesh = add_ship(ship, scene)
    ship_mesh.showBoundingBox = true; //todo test
    
    const camera = new BABYLON.FollowCamera("followCamera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.radius = ship.br * 14;      // start with 4× back radius
    camera.heightOffset = ship.br * 1.5;  // lift above
    camera.rotationOffset = 180;  // look from behind
    camera.cameraAcceleration = 20;
    camera.maxCameraSpeed = 100;
    camera.lockedTarget = ship_mesh;   // follow this mesh. it will be tricky
    camera.minZ = 0.1; // Minimum distance
    camera.maxZ = 100000; // Maximum distance (increase as needed)

    

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
    light.intensity = 0.5;//todo test

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
      const dummy = { code: action }
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
       // send_client_action(ws, action)
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
