import { use_key } from "../../../handlers/utils";
import { mm, MT } from "../../../tunnel";

/** add on scene the 8x8 squared plates with gaps, clickable */
export function add_ground(
  scene: BABYLON.Scene,
  cells: BABYLON.Mesh[],
  glows: BABYLON.Mesh[],
  colors: {idle:BABYLON.Color3, hovered:BABYLON.Color3, selected:BABYLON.Color3},
  cell_size:number,
  ws: WebSocket,
) {
  const plateSize = cell_size * 0.9;
  const plateHeight = cell_size * 0.1;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col - 3.5;
      const z = row - 3.5;

      // selected - unselected - rip
      const plate = BABYLON.MeshBuilder.CreateBox(`plate-${row}-${col}`, {
        width: plateSize,
        depth: plateSize,
        height: plateHeight
      }, scene);

      plate.position = new BABYLON.Vector3(x, plateHeight / 2, z);

      const mat = new BABYLON.StandardMaterial(`plate-mat-${row}-${col}`, scene);
      mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      mat.emissiveColor = colors.idle.clone()
      plate.material = mat;

      cells.push(plate);

      // hovered - unhovered
      const glow = BABYLON.MeshBuilder.CreateBox(`glow-${row}-${col}`, {
        width: plateSize * 1.05,
        depth: plateSize * 1.05,
        height: plateHeight
      }, scene);
      glow.position = new BABYLON.Vector3(x, plateHeight / 2 + 0.01, z);
      glow.isPickable = false; // ignore clicks
      
      const glowMat = new BABYLON.StandardMaterial(`glow-mat`, scene);
      glowMat.diffuseColor = colors.idle.clone()
      glowMat.emissiveColor = colors.idle.clone()
      glowMat.alpha = 0; // transparent by default
      glow.material = glowMat
      glows.push(glow)

      // Hover glow (cyan)
      plate.actionManager = new BABYLON.ActionManager(scene);
      plate.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
          glowMat.diffuseColor = colors.hovered.clone()
          glowMat.emissiveColor = colors.hovered.clone()
          glowMat.alpha = 0.6;
        })
      );
      plate.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
          glowMat.diffuseColor = colors.idle.clone()
          glowMat.emissiveColor = colors.idle.clone()
          glowMat.alpha = 0;
        })
      );

      // send click message to server. Client only do this.
      plate.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
          const key = use_key()
          if(!key) return
          const idx = cells.indexOf(plate);
          console.log("clicked cell idx", idx);//todo remove
          ws.send(mm.keyu8a(key, mm.obju8a({ t: 888, c:idx+1 }))); //todo fix
        })
      );
    }
  }
}
