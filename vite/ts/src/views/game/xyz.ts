export function xyz_dev(scene: BABYLON.Scene){
  new BABYLON.Debug.AxesViewer(scene, 15)

  const sun = BABYLON.MeshBuilder.CreateSphere("sun", {diameter: 100}, scene);
  const mat = new BABYLON.StandardMaterial("sunPbr", scene);
  mat.emissiveColor = new BABYLON.Color3(1, 0.95, 0.8);
  mat.disableLighting = true;
  sun.material = mat;

  // Point light
  const sun_light = new BABYLON.PointLight("sunLight", sun.position, scene);
  sun_light.intensity = 1;
  sun_light.range = 10000;
  
}