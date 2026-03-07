export function xyz_dev(scene: BABYLON.Scene){
  new BABYLON.Debug.AxesViewer(scene, 15)

  // add some market to now lost for dev at least
  BABYLON.MeshBuilder.CreateSphere("big", {diameter:100},scene)
}