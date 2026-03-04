import { store, ws_atom } from "../../atoms"
import { ram } from "../../ram";
import { gemm, type Ship } from "../../tunnel"
import { add_ship } from "./add-ship";
import { manage_client_actions } from "./client-actions";
import { add_exit_button_to_game_view } from "./exit-button";
import { view_html_div } from "./html-view";
import { remove_ship } from "./remove-ship";
import { check_move_metadata, move_ship } from "./move-ship";
import { leftmove_ship } from "./leftmove-ship";
import { rightmove_ship } from "./rightmove-ship";
import { crts } from "../../handlers/utils";
import { check_rotations_metadata, rotateAxis as rotate_around_Axis } from "./rotate-ship";
import { topmove_ship } from "./topmove-ship";
import { xyz_dev } from "./xyz";
import { downmove_ship } from "./downmove-ship";
import { cwmove_ship } from "./cwmove-ship";
import { ccwmove_ship } from "./ccwmove-ship";


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
    scene.useRightHandedSystem = true //warning crucial line, and also on forum some crap in quaternions announced and confirmed in case of this. Creatures made left hand system default when the most planet (math and opengl) manage right hand system. It is ... mental. Now they drown in bugs and patches with advanced custom cameras. Felitaziones!
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Set background to black
    
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);//warning bind lazer to this
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false; // Ensure the back faces are rendered
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/1", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true; // Prevent the skybox from scaling with the camera

    const ship_mesh = add_ship(ship, scene, ships)
    
    xyz_dev(ship, scene)

    if(!ship_mesh) return
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,//Math.PI,           // Alpha (angle around target)
      Math.PI / 2,//.5,     // Beta (elevation)
      ship.br / 40, // Radius
      ship_mesh.position,
      scene
    );
    
    const cameraParent = new BABYLON.TransformNode("camParent", scene);
    
    camera.position = new BABYLON.Vector3(0, ship.br/50, -ship.br /80);
    camera.setTarget(BABYLON.Vector3.Zero());  // local origin

    // cameraParent.rotate(BABYLON.Vector3.Up(), Math.PI)
    // cameraParent.rotate(BABYLON.Vector3.Forward(), Math.PI)
    
    
    camera.parent = cameraParent;
    cameraParent.parent = ship_mesh;
    
    // scene.registerBeforeRender(() => {
    //   if (ship_mesh && ship) {
    //     camera.target = ship_mesh.position;
        
    //     // Rotate camera to match ship's heading
    //     const shipForward = new BABYLON.Vector3(ship.fvx, ship.fvy, ship.fvz)
    //     const angle = Math.atan2(shipForward.x, shipForward.z);
    //     camera.alpha = angle + Math.PI;
    //   }
    // });
    

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
        check_move_metadata(ship)
        if (ship.metadata?.velocity) {
          const v = ship.metadata.velocity as {x:number,y:number,z:number,vts:number}
          const dt = (now - v.vts)/1000; // Delta in seconds
          const vec = new BABYLON.Vector3(v.x, v.y, v.z)
          const scaled = vec.scaleInPlace(dt);
          ship.position.addInPlace(scaled); // Use add() VS of addInPlace()
          
          ship.metadata.velocity = {x:v.x,y:v.y,z:v.z,vts:now}
          
          // console.log("After position:", ship.position);
        }

        check_rotations_metadata(ship, now)
        if (ship.metadata.sideRotation){
          const dt = (now - ship.metadata.sideRotation.ts ) / 1000
          ship.metadata.sideRotation.ts = now
          const axisend = ship.getChildren().find(c => c.name === "sideDot") as BABYLON.Mesh;
          const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship.absolutePosition.asArray(), axisend.absolutePosition.asArray())).negate()
          rotate_around_Axis(ship, axis, ship.metadata.sideRotation, dt);
        }
        if (ship.metadata.frontRotation){
          const dt = (now - ship.metadata.frontRotation.ts ) / 1000
          ship.metadata.frontRotation.ts = now
          const axisend = ship.getChildren().find(c => c.name === "frontDot") as BABYLON.Mesh;
          const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship.absolutePosition.asArray(), axisend.absolutePosition.asArray()))
          rotate_around_Axis(ship, axis, ship.metadata.frontRotation, dt);
        }
        if (ship.metadata.topRotation){
          const dt = (now - ship.metadata.topRotation.ts ) / 1000
          // alert(`First dt: ${dt.toFixed(4)}s, angle: ${(ship.metadata.topRotation.av * dt).toFixed(2)}°`);
          ship.metadata.topRotation.ts = now
          // const top = ship.metadata.top.mesh as BABYLON.Mesh //bullshit from ai
          const axisend = ship.getChildren().find(c => c.name === "topDot") as BABYLON.Mesh;
          const axis = BABYLON.Vector3.FromArray(gemm.vecXD(ship.absolutePosition.asArray(), axisend.absolutePosition.asArray()))
          rotate_around_Axis(ship, axis, ship.metadata.topRotation, dt);
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
  
  
  return { view, initGameView, add_ship, remove_ship, game_over, get_scene, ships, move_ship, leftmove_ship, rightmove_ship, topmove_ship, downmove_ship, cwmove_ship, ccwmove_ship };
}

export const game_box = create_game_box();
