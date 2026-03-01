export function syncOrientation(mesh: BABYLON.Mesh, fvx: number, fvy: number, fvz: number, tvx: number, tvy: number, tvz: number) {
  const front = new BABYLON.Vector3(fvx, fvy, fvz).normalize();
  const top = new BABYLON.Vector3(tvx, tvy, tvz).normalize();

  let m = mesh.getWorldMatrix()
  let xz = m.decomposeToTransformNode(mesh)
  mesh.rotation.asArray()
  let mesh_top = 
  
  const PARALLEL_THRESHOLD = 0.999;

  const topDot = BABYLON.Vector3.Dot(mesh_top, top);
  if (Math.abs(topDot) < PARALLEL_THRESHOLD) {
    const rotAxis = BABYLON.Vector3.Cross(mesh_top, top).normalize();
    const angle = 1// Math.acos(Math.max(-1, Math.min(1, topDot)));
    if (angle > 0.001) {
      mesh.rotate(rotAxis, angle, BABYLON.Space.WORLD);
    }
  }

  rotMat = mesh.getWorldMatrix();
  let mesh_front = new BABYLON.Vector3(rotMat.m[8], rotMat.m[9], rotMat.m[10]).normalize();

  const frontDot = BABYLON.Vector3.Dot(mesh_front, front);
  if (Math.abs(frontDot) < PARALLEL_THRESHOLD) {
    const rotAxis = BABYLON.Vector3.Cross(mesh_front, front).normalize();
    const angle =2// Math.acos(Math.max(-1, Math.min(1, frontDot)));
    if (angle > 0.001) {
      // mesh.rotate(rotAxis, angle, BABYLON.Space.WORLD);
      mesh.rotate(new BABYLON.Vector3(1,2,3), angle, BABYLON.Space.WORLD);
    }
  }

  // const rotationQuat = BABYLON.Quaternion.Identity();
  // mesh.getWorldMatrix().decompose(new BABYLON.Vector3(1, 1, 1), rotationQuat, BABYLON.Vector3.Zero());
  // mesh.rotation = rotationQuat.toEulerAngles();

  // mesh.markAsDirty("matrix");
  // mesh.computeWorldMatrix(true);
  
}
