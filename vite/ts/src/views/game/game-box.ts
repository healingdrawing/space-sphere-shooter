import { store, ws_atom } from "../../atoms"
import { ram } from "../../ram";
import { type Ship } from "../../tunnel"
import { add_ship } from "./add-ship";
import { manage_client_actions } from "./client-actions";
import { add_exit_button_to_game_view, add_show_ui_down_button_to_game_view, add_show_ui_side_button_to_game_view } from "./menu-buttons";
import { set_hp_on_screen, view_html_div } from "./html-view";
import { remove_ship } from "./remove-ship";
import { check_move_metadata, move_ship } from "./move-ship";
import { crts } from "../../handlers/utils";
import { check_rotations_metadata } from "./rotate-ship";
import { xyz_dev } from "./xyz";
import { lazer_shot } from "./lazer-shot";
import { move_target_ship } from "./move-target-ship";
import { sfx } from "../../../sfx/sfx";


function create_game_box() {
  
  const {view, canvas} = view_html_div()

  let engine: BABYLON.Engine | null = null;

  let scene: BABYLON.Scene;
  const get_scene = () => scene

  let glow_box: BABYLON.GlowLayer;
  const get_glow_box = () => glow_box

  /** the player id/uuid/index in array on server side */
  let player_idx = 0;
  const get_player_idx = () => player_idx

  /* to avoid quaternion injection, since it is bugged in edge case(reported, confirmed on forum) */
  const animated_lazer_beams: BABYLON.Mesh[] = [];
  const ship_boxes: (BABYLON.TransformNode | null)[] = new Array(ram.umn).fill(null);
  
  // let animationId: number | null = null;
  
  async function initGameView(ship:Ship) {
    console.log("dummy init game view executed")
    const ws = store.get(ws_atom)
    if (!ws){
      alert("client websocket is null. should never happen. switch to home view")
      return
    }
    console.log("Initial WebSocket:", ws);
    
    add_show_ui_side_button_to_game_view(view)
    add_exit_button_to_game_view(ws, view)
    add_show_ui_down_button_to_game_view(view)

    manage_client_actions(ws, view)

    if (engine) return;
    engine = new BABYLON.Engine(canvas, true);
    
    scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true //warning crucial line, and also on forum some crap in quaternions announced and confirmed in case of this. Creatures made left hand system default when the most planet (math and opengl) manage right hand system. It is ... mental. Now they drown in bugs and patches with advanced custom cameras. Felitaziones!
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Set background to black

    glow_box = new BABYLON.GlowLayer("beams_glow_box", scene)
    /* //warning: patch for default glow for all meshes, before first call .addIncludedOnlyMesh. Set methods were removed in some reasons. Maybe remastering of the lib architecture in progress. Or i miss somehting. */
    const trash = BABYLON.MeshBuilder.CreateLines("trash", {points:[BABYLON.Vector3.Zero()]})
    glow_box.addIncludedOnlyMesh(trash)
    trash.dispose()

    
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 10000 }, scene);//warning //todo consider to bind lazer length to this
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false; // Ensure the back faces are rendered
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/1", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true; // Prevent the skybox from scaling with the camera

    

    /* to manage hit later */
    player_idx = ship.idx;
    /* initial value. At the moment included also ship.max_hp value. Can be used for horizonal bar indicator. */
    set_hp_on_screen(ship.hp)

    const ship_box = await add_ship(ship, scene, ship_boxes)
    
    
    xyz_dev(scene)

    if(!ship_box) return
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,//Math.PI,           // Alpha (angle around target)
      Math.PI / 2,//.5,     // Beta (elevation)
      ship.br / 40, // Radius
      ship_box.position,
      scene
    );
    
    camera.position = new BABYLON.Vector3(0, ship.vr * 4, -ship.br * 10);
    camera.setTarget(new BABYLON.Vector3(0,0,1000));  // local origin

    camera.parent = ship_box;
    
    // const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
    // light.intensity = 0.5;//todo test


    function animate() {
      if (!engine || !scene) return;
      const now = crts(); //todo not sure it should be inside for loop
      
      for (const ship of game_box.ship_boxes) {
        if (!ship) continue
        
        check_move_metadata(ship)
        if (ship.metadata.velocity) {
          const v = ship.metadata.velocity as {x:number,y:number,z:number,vts:number}
          const dt = (now - v.vts)/1000; // Delta in seconds
          const vec = new BABYLON.Vector3(v.x, v.y, v.z)
          const scaled = vec.scaleInPlace(dt);
          ship.position.addInPlace(scaled);
          ship.metadata.velocity = {x:v.x,y:v.y,z:v.z,vts:now}
        }

        
        
        //todo consider full refactoring, to avoid bindings to time
        if (ship.metadata.targetRotation) {
          const tr = ship.metadata.targetRotation;
          const dt = (now - tr.ts) / 1000;
          ship.metadata.targetRotation.ts = now;
      
          if (dt > 0){
            ship.metadata.targetRotation.progress += tr.av_rads * dt;
            
            // SLERP
            if(tr.progress < tr.totalAngle){ //todo check looks not clear
              const t = tr.progress / tr.totalAngle;
              ship.rotationQuaternion = BABYLON.Quaternion.Slerp(
                ship.rotationQuaternion?.clone() || BABYLON.Quaternion.Identity(),
                tr.targetQuat,
                t
              );
              ship.rotationQuaternion.normalize();           // clean
              ship.computeWorldMatrix(true);
            }
          }
        }
        check_rotations_metadata(ship)
      }

      for (let i = game_box.animated_lazer_beams.length - 1; i >= 0; i--) {
        const mesh = game_box.animated_lazer_beams[i];
        const m_a = mesh.metadata.animation;
      
        if (!m_a) continue;

        const elapsed_ms = m_a.elapsed_ms
        const duration_ms = m_a.duration_ms
      
        if (elapsed_ms > duration_ms) {
          mesh.dispose();
          game_box.animated_lazer_beams.splice(i, 1);
          continue;
        }

        const dt = now - m_a.last_ms
        const progress = dt/ m_a.duration_ms;
        m_a.last_ms = now
        m_a.elapsed_ms += dt
        if (!progress) continue
        mesh.rotateAround(m_a.pivot, m_a.axis, m_a.angle_rad * progress);
      }

      // console.log("Total meshes in scene:", scene.meshes.length);
      // scene.meshes.forEach(m => console.log("  -", m.name));

      scene.render();
      // animationId = requestAnimationFrame(animate);
      requestAnimationFrame(animate);
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
  
  
  return {
    view, initGameView, add_ship, remove_ship, game_over, get_scene, ship_boxes,
    move_ship, move_target_ship,
    get_glow_box, lazer_shot, animated_lazer_beams,
    get_player_idx, sfx };
}

export const game_box = create_game_box();
