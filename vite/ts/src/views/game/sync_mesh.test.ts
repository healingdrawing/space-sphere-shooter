import { describe, it, expect, beforeEach } from "bun:test";
import * as BABYLON from "babylonjs";

describe("syncOrientation", () => {
  let scene: BABYLON.Scene;
  let mesh: BABYLON.Mesh;

  beforeEach(() => {
    const engine = new BABYLON.NullEngine();
    scene = new BABYLON.Scene(engine);
    mesh = BABYLON.MeshBuilder.CreateBox("testMesh", { size: 1 }, scene);
    mesh.position = new BABYLON.Vector3(0, 0, 0);
  });

  it("should align mesh top vector to target top vector", () => {
    const targetFront = new BABYLON.Vector3(0, 0, 1); // Z axis
    const targetTop = new BABYLON.Vector3(0, 1, 0);   // Y axis

    syncOrientation(mesh, targetFront.x, targetFront.y, targetFront.z, targetTop.x, targetTop.y, targetTop.z);

    const rotMat = mesh.getWorldMatrix();
    const mesh_top = new BABYLON.Vector3(rotMat.m[4], rotMat.m[5], rotMat.m[6]).normalize();

    const dot = Math.abs(BABYLON.Vector3.Dot(mesh_top, targetTop));
    expect(dot).toBeGreaterThan(0.99);
  });

  it("should align mesh front vector to target front vector", () => {
    const targetFront = new BABYLON.Vector3(1, 0, 0).normalize(); // X axis
    const targetTop = new BABYLON.Vector3(0, 1, 0);

    syncOrientation(mesh, targetFront.x, targetFront.y, targetFront.z, targetTop.x, targetTop.y, targetTop.z);
    
    
    const rotMat = mesh.getWorldMatrix();
    console.log("Matrix m[8-10]:", rotMat.m[8], rotMat.m[9], rotMat.m[10]);
    console.log("Expected front:", targetFront.x, targetFront.y, targetFront.z);
    const mesh_front = new BABYLON.Vector3(rotMat.m[8], rotMat.m[9], rotMat.m[10]).normalize();

    const dot = Math.abs(BABYLON.Vector3.Dot(mesh_front, targetFront));
    expect(dot).toBeGreaterThan(0.99);
  });

  it("should handle arbitrary rotation vectors", () => {
    const targetFront = new BABYLON.Vector3(1, 1, 1).normalize();
  const targetTop = new BABYLON.Vector3(-1, 1, 0).normalize();

  syncOrientation(mesh, targetFront.x, targetFront.y, targetFront.z, targetTop.x, targetTop.y, targetTop.z);

  // Use the mesh's actual transformation
  const worldMat = BABYLON.Matrix.Translation(mesh.position.x, mesh.position.y, mesh.position.z)
    .multiply(BABYLON.Matrix.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z));
  
  const mesh_front = new BABYLON.Vector3(worldMat.m[8], worldMat.m[9], worldMat.m[10]).normalize();
  const mesh_top = new BABYLON.Vector3(worldMat.m[4], worldMat.m[5], worldMat.m[6]).normalize();

  const frontDot = Math.abs(BABYLON.Vector3.Dot(mesh_front, targetFront));
  const topDot = Math.abs(BABYLON.Vector3.Dot(mesh_top, targetTop));

  expect(frontDot).toBeGreaterThan(0.99);
  expect(topDot).toBeGreaterThan(0.99);
  });

  it("should not rotate if already parallel", () => {
    const targetFront = new BABYLON.Vector3(0, 0, 1);
    const targetTop = new BABYLON.Vector3(0, 1, 0);

    const rotBefore = mesh.rotation.clone();
    syncOrientation(mesh, targetFront.x, targetFront.y, targetFront.z, targetTop.x, targetTop.y, targetTop.z);
    const rotAfter = mesh.rotation;

    // Should be same or very close (already aligned)
    expect(Math.abs(rotBefore.x - rotAfter.x)).toBeLessThan(0.01);
    expect(Math.abs(rotBefore.y - rotAfter.y)).toBeLessThan(0.01);
    expect(Math.abs(rotBefore.z - rotAfter.z)).toBeLessThan(0.01);
  });
});

function syncOrientation(mesh: BABYLON.Mesh, fvx: number, fvy: number, fvz: number, tvx: number, tvy: number, tvz: number) {
  
  

}
