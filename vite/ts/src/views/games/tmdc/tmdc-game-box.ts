import { store, ws_atom } from "../../../atoms"
import { use_key } from "../../../handlers/utils";
import { KEYMAP, mm, MT } from "../../../tunnel"
import { add_ground } from "./add-ground";
import { add_playable_items } from "./add-playable-items";
import { home_box } from "../../home/home-box";



function create_tmdc_game_box() {
  
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
  /** selectable plates of game board */
  let cells: BABYLON.Mesh[] = [];
  /** to separately manage hover effect, with more simple approach */
  let glows: BABYLON.Mesh[] = [];
  let dragons: BABYLON.Mesh[] = [];
  let dragonCellIndex: number[] = [];
  let selectedCell: BABYLON.Mesh | null = null;
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
  function remove_exit_button(){
    document.getElementById("exit-button")?.remove()
  }

  function initGameView(hex:string) {
    console.log("dummy init game view executed")
    const ws = store.get(ws_atom)
    if (!ws){
      alert("client websocket is null. should never happen. switch to home view")
      return
    }
    console.log("Initial WebSocket:", ws);

    add_exit_button_to_game_view(ws)

    if (engine) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '400px';
    canvas.style.height = '400px';
    container.appendChild(canvas);

    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);

    // Camera: perspective, 45 deg tilt
    /** original rotation coefficient, to see items closer */
    const player_side = hex.indexOf(home_box.color_box.color) > 0?1:-1
    const camera = new BABYLON.ArcRotateCamera('camera', player_side*Math.PI / 2, Math.PI / 4, 12, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

    // Playground: 8x8 squared sections (short boxes)
    /** to some way keep proportions. Consider as the abstract unit. Or meters(must be in offdocs) */
    const cell_size = 1;

    /* the place for code to add objects on scene */

    add_ground(scene, cells, glows, colors, cell_size, ws)
    add_playable_items(scene, dragons, dragonCellIndex, cell_size, hex)

    /* end of the place for code to add objects on scene */

    

    function animate() {
      if (!engine || !scene) return;
      scene.render();
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function stopGameView() {
    remove_exit_button() //raw gap to prevent button exit duplication
    if (animationId) cancelAnimationFrame(animationId);
    if (engine) {
      engine.dispose();
      engine = null;
      scene = null;
      cells = [];
      dragons = [];
      selectedCell = null;
    }
    container.innerHTML = '';
  }
  /** call when c>0 from server. To select cell/plate.
   * */
  function select_cell(c: number) {
    console.log("select_item() executed c:", c) //todo remove
    selectedCell = cells[c-1];
    if (selectedCell) {
      const mat = selectedCell.material as BABYLON.StandardMaterial;
      mat.emissiveColor.copyFrom(colors.selected);
    }
  }
  
  /** executed from select_item */
  function unselect_cell(o:number) {
    console.log("unselect_item() executed o:", o)
    const selectedCell = cells[o-1]
    if (selectedCell) {
      console.log("selectedCell true")
      const mat = selectedCell.material as BABYLON.StandardMaterial;
      mat.emissiveColor.copyFrom(colors.idle);
    }
  }

  /** consider to call it when c=0 received from server */
  function rip_cell(c:number){
    const idx = c-1
    const dragonIdx = dragonCellIndex.indexOf(idx); // find dragon on cell
    if (dragonIdx === -1) return;

    const dragon = dragons[dragonIdx];
    const mat = dragon.material as BABYLON.StandardMaterial;
    mat.diffuseColor.copyFrom(colors.rip);

    const selectedCell = cells[idx]
    if (selectedCell) {
      console.log("selectedCell true")
      const mat = selectedCell.material as BABYLON.StandardMaterial;
      mat.diffuseColor.copyFrom(colors.black);
      mat.emissiveColor.copyFrom(colors.rip);
    }
    console.error("method to RIP item not implemented")
  }

  /** show gameover visuals o during ms, then switch to chat.
   * @param o variant of visuals
   * @param ms [milliseconds]
   * */
  function game_over(o:number, ms:number){
    // consider rotate camera around scene, and show "GAME OVER" text, if possible 3d static on screen(camera rotation not affects text), or html above the scene, centered
    if (!o) {}// todo gameover_visuals()
    else if(o>0) {}//todo victory_visuals(o)
    else if(o<0) {}//todo defeat_visuals(o)

    console.warn("gameover visuals not implemented") //todo implement
    setTimeout(() => {
      stopGameView()
    }, ms)
  }

  //todo after server side click step, implement this
  /** 
   * @param c cell number on the board. Linear array used.
   * @param ms duration of the full animation step in milliseconds
   */
  function move_item_to(c: number, o:number, ms:number) {
    if (
      !scene || dragons.length === 0 || cells.length === 0
      || c < 1 || c > cells.length || o < 1 || o > cells.length || ms < 1
    ) {
      console.warn(
        "move_item_to skipped: missing scene, selectedCell, or data"
      );
      return;
    }
    const idx = c-1 // -1 to make first item of board array to index 0 on client side
    const sidx = o-1 // original position of item (selected item index)

    const dragonIdx = dragonCellIndex.indexOf(sidx); // find dragon on cell
    if (dragonIdx === -1) return;

    const dragon = dragons[dragonIdx];
    const targetCell = cells[idx];
    const targetPos = targetCell.position.clone();
    targetPos.y += 0.25 + 0.25;

    /** how many frames animation will be managed by from start to end */
    const sum_frames = 60 //warning raw
    const anim = new BABYLON.Animation("moveDragon", "position", sum_frames, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const upHeight = 1.0;
    const midHeight = upHeight + 0.25; // peak

    const startPos = dragon.position.clone();
    const midPos = new BABYLON.Vector3(startPos.x, midHeight, startPos.z);
    const targetMid = new BABYLON.Vector3(targetPos.x, midHeight, targetPos.z);

    const dx = Math.abs(targetPos.x - startPos.x )
    const dz = Math.abs(targetPos.z - startPos.z )
    /** summary stages number since only vertical or horizontal planned to send from server, just sum without square root. The + 2 is fly up, fly down */
    const sumstages = 2 + (dx + dz)
    const frame_up = sum_frames * (1/sumstages)
    const frame_horizontal = sum_frames * (sumstages-1)/sumstages
    

    anim.setKeys([
      { frame: 0, value: startPos },
      { frame: frame_up, value: midPos },           // up
      { frame: frame_horizontal, value: targetMid },        // horizontal
      { frame: sum_frames, value: targetPos }         // down
    ]);

    dragon.animations.push(anim);
    scene.beginAnimation(dragon, 0, 60, false, 1 / (ms / 1000));

    dragonCellIndex[dragonIdx] = idx; // update item's new position
  }



  return { view, initGameView, stopGameView, select_cell, unselect_cell, move_item_to, rip_cell, game_over, dev_gap };

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

  /** test keymap */
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

export const tmdc_game_box = create_tmdc_game_box();
