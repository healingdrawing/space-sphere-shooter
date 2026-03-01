import { store, ws_atom } from "../../atoms"
import { ram } from "../../ram";
import { type Ship } from "../../tunnel"
import { add_ship } from "./add-ship";
import { manage_client_actions } from "./client-actions";
import { add_exit_button_to_game_view } from "./exit-button";
import { view_html_div } from "./html-view";
import { remove_ship } from "./remove-ship";
import { move_ship } from "./move-ship";
import { leftmove_ship } from "./leftmove-ship";
import { crts } from "../../handlers/utils";
import { check_rotations_metadata, rotateAxis } from "./rotate-ship";
import { topmove_ship } from "./topmove-ship";


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
  
  async function initGameView(ship:Ship) {
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
    
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false; // Ensure the back faces are rendered
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/1", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true; // Prevent the skybox from scaling with the camera

    const ship_mesh = add_ship(ship, scene, ships)
    
    if(!ship_mesh) return
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,//Math.PI,           // Alpha (angle around target)
      Math.PI / 2,//.5,     // Beta (elevation)
      ship.br / 40, // Radius
      ship_mesh.position,
      scene
    );
    // camera.lockedTarget = ship_mesh

    const cameraParent = new BABYLON.TransformNode("camParent", scene);
    cameraParent.parent = ship_mesh;

    camera.parent = cameraParent;
    camera.position = new BABYLON.Vector3(0, ship.br/50, -ship.br /80);
    camera.setTarget(BABYLON.Vector3.Zero());  // local origin
    
    
    // scene.registerBeforeRender(() => {
    //   if (ship_mesh && ship) {
    //     camera.target = ship_mesh.position;
        
    //     // Rotate camera to match ship's heading
    //     const shipForward = new BABYLON.Vector3(ship.fvx, ship.fvy, ship.fvz)
    //     const angle = Math.atan2(shipForward.x, shipForward.z);
    //     camera.alpha = angle + Math.PI;
    //   }
    // });
    

    // warning can not fix this creature properly. Skybox glitching and all vibrating
    // const camera = new BABYLON.FollowCamera("followCamera", new BABYLON.Vector3(0, 0, 0), scene);
    // camera.radius = ship.br/50;      // start with 4× back radius
    // camera.heightOffset = ship.br/20;  // lift above
    // camera.rotationOffset = 180;  // look from behind
    // camera.cameraAcceleration = 2;
    // camera.maxCameraSpeed = 10;
    // camera.lockedTarget = ship_mesh;   // follow this mesh. it will be tricky
    // camera.minZ = 0.01; // Minimum distance
    // camera.maxZ = 100000; // Maximum distance (increase as needed)

    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
    light.intensity = 0.5;//todo test


    // engine.runRenderLoop(() => {
    //   for (const ship of game_box.ships) {
    //     if (!ship) continue
    //     if (ship.metadata?.velocity) {
    //       const v = ship.metadata.velocity as {x:number,y:number,z:number}
    //       const vec = new BABYLON.Vector3(v.x, v.y, v.z)
    //       const scaled = vec.scale(engine!.getDeltaTime() / 1000);
    //       ship.position.add(scaled);
    //     }
    //   }
    //   scene.render();
    // });

    function animate() {
      if (!engine || !scene) return;
      const now = crts();
      
      // console.log("Divided deltaTime:", deltaTime);
      
      for (const ship of game_box.ships) {
        if (!ship) continue
        // console.log('Moving ship:', ship.name, ship.metadata.velocity); // DEBUG
        if (ship.metadata?.velocity) {
          const v = ship.metadata.velocity as {x:number,y:number,z:number,vts:number}
          const dt = (now - v.vts)/1000; // Delta in seconds
          const vec = new BABYLON.Vector3(v.x, v.y, v.z)
          const scaled = vec.scaleInPlace(dt);
          ship.position.addInPlace(scaled); // Use add() instead of addInPlace()
          
          ship.metadata.velocity = {x:v.x,y:v.y,z:v.z,vts:now}
          
          // console.log("After position:", ship.position);
        }

        check_rotations_metadata(ship, now)
        if (ship.metadata.frontRotation){
          const dt = (now - ship.metadata.frontRotation.ts ) / 1000
          ship.metadata.frontRotation.ts = now
          rotateAxis(ship, BABYLON.Axis.Z, ship.metadata.frontRotation, dt);
        }
        if (ship.metadata.topRotation){
          const dt = (now - ship.metadata.topRotation.ts ) / 1000
          // alert(`First dt: ${dt.toFixed(4)}s, angle: ${(ship.metadata.topRotation.av * dt).toFixed(2)}°`);
          ship.metadata.topRotation.ts = now
          rotateAxis(ship, BABYLON.Axis.Y, ship.metadata.topRotation, dt);
        }
        if (ship.metadata.sideRotation){
          const dt = (now - ship.metadata.sideRotation.ts ) / 1000
          ship.metadata.sideRotation.ts = now
          rotateAxis(ship, BABYLON.Axis.X, ship.metadata.sideRotation, dt);
        }
      }

      // console.log("Total meshes in scene:", scene.meshes.length);
      // scene.meshes.forEach(m => console.log("  -", m.name));

      scene.render();
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function game_over(){
    console.warn("gameover visuals not implemented") //todo implement
    if (engine) {
      engine.stopRenderLoop();
      engine.dispose();
    }
    setTimeout(() => {
      window.location.reload();
    }, 3000)
  }
  
  
  return { view, initGameView, add_ship, remove_ship, game_over, get_scene, ships, move_ship, leftmove_ship, topmove_ship };
}

export const game_box = create_game_box();
