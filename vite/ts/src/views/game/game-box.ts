import { store, ws_atom } from "../../atoms"
import { ram } from "../../ram";
import { type Ship } from "../../tunnel"
import { add_ship } from "./add-ship";
import { manage_client_actions } from "./client-actions";
import { add_exit_button_to_game_view } from "./exit-button";
import { view_html_div } from "./html-view";
import { remove_ship } from "./remove-ship";



function create_game_box() {
  
  const {view, canvas} = view_html_div()

  let engine: BABYLON.Engine | null = null;

  let scene: BABYLON.Scene;
  const get_scene = () => scene

  const ships: (BABYLON.Mesh | null)[] = new Array(ram.umn).fill(null);
  let animationId: number | null = null;
  
  const colors = {
    idle:new BABYLON.Color3(0.2, 0, 0.2),
    hovered:new BABYLON.Color3(0, 1, 1),
    selected:new BABYLON.Color3(1, 1, 0),
    rip:new BABYLON.Color3(0.3, 0.3, 0.3),
    black:new BABYLON.Color3(0, 0, 0)
  }
  
  function initGameView(ship:Ship) {
    console.log("dummy init game view executed")
    const ws = store.get(ws_atom)
    if (!ws){
      alert("client websocket is null. should never happen. switch to home view")
      return
    }
    console.log("Initial WebSocket:", ws);
    

    add_exit_button_to_game_view(ws, view)
    manage_client_actions(ws, view)

    if (engine) return;
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

    const ship_mesh = add_ship(ship, scene, ships)
    
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
  
  
  return { view, initGameView, add_ship, remove_ship, game_over, get_scene, ships };
}

export const game_box = create_game_box();
