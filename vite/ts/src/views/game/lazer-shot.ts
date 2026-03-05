import { gemm, type LazerBeam } from "../../tunnel";
import { game_box } from "./game-box";

export const lazer_shot = (data: LazerBeam) => {
  console.warn("lazer shot")
  const s = game_box.ships[data.uuid]
  if(!s) {
    console.error("\nship not found")
    return
  }
  const a_rad = gemm.radians(data.a/2) // half because x4 beams planned from center to sides
  
  const start = s.absolutePosition
  console.log("s.absxyz", start)
  const end = new BABYLON.Vector3(data.x, data.y, data.z)
  /* start dot */
  const sdot = [start.x, start.y, start.z]
  /* end dot */
  const edot = [data.x, data.y, data.z]
  /* side vector, to rotate in vertical plane */
  const sv = gemm.vec3Dnormal(gemm.vecXD(sdot,edot), [data.nx, data.ny, data.nz])
  const side_axis = new BABYLON.Vector3(sv[0], sv[1], sv[2]).normalize()
  const vert_axis = new BABYLON.Vector3(data.nx, data.ny, data.nz).normalize()
  const scene = game_box.get_scene()
  lazer_beam(start, end, side_axis.clone(), a_rad, scene)
  lazer_beam(start, end, side_axis.clone().negate(), a_rad, scene)
  lazer_beam(start, end, vert_axis.clone(), a_rad, scene)
  lazer_beam(start, end, vert_axis.clone().negate(), a_rad, scene)
}

function lazer_beam(start: BABYLON.Vector3, end: BABYLON.Vector3, axis: BABYLON.Vector3, angleRad: number, scene: BABYLON.Scene) {
  const tube = BABYLON.MeshBuilder.CreateTube("laser", {
    path: [start.clone(), end.clone()],
    radius: 0.15,
    updatable: false
  }, scene);

  const laserMat = new BABYLON.StandardMaterial("laserMat", scene);
  laserMat.emissiveColor = new BABYLON.Color3(1, 0.2, 0.1);
  tube.material = laserMat;

  const glow = new BABYLON.GlowLayer("boo", scene)
  glow.addIncludedOnlyMesh(tube);

  const steps = 12;
  const stepAngle = angleRad / steps;
  let i = 0;

  const animate = () => {
    if (i >= steps) {
      tube.dispose();
      return;
    }
    tube.rotateAround(start, axis.normalize(), stepAngle);
    i++;
    requestAnimationFrame(animate);
  };

  animate();
}