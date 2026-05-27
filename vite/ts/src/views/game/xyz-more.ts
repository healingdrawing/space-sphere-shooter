/** raw gap from grok to create some static visuals for now. */
export function more_visuals(scene: BABYLON.Scene) {
  const d_radius = 4000;
  const phi = (1 + Math.sqrt(5)) / 2;
  const invPhi = 1 / phi;

  const baseVerts = [];
  for (let x = -1; x <= 1; x += 2)
    for (let y = -1; y <= 1; y += 2)
      for (let z = -1; z <= 1; z += 2)
        baseVerts.push([x, y, z]);

  const cycles = [
    [0, phi, invPhi], [0, phi, -invPhi], [0, -phi, invPhi], [0, -phi, -invPhi],
    [invPhi, 0, phi], [invPhi, 0, -phi], [-invPhi, 0, phi], [-invPhi, 0, -phi],
    [phi, invPhi, 0], [phi, -invPhi, 0], [-phi, invPhi, 0], [-phi, -invPhi, 0]
  ];
  baseVerts.push(...cycles);

  const vertices = baseVerts.map(v => new BABYLON.Vector3(v[0] * d_radius, v[1] * d_radius, v[2] * d_radius));

  const colors = vertices.map((_, i) => {
    const hue = (i * 360 / 20) % 360;
    const c = 1, x = c * (1 - Math.abs(((hue / 60) % 2) - 1)), m = 0.5 - c/2;
    let r=0,g=0,b=0; const h = hue / 60;
    if (h < 1) { r=c; g=x; } else if (h < 2) { r=x; g=c; }
    else if (h < 3) { g=c; b=x; } else if (h < 4) { g=x; b=c; }
    else if (h < 5) { r=x; b=c; } else { r=c; b=x; }
    return new BABYLON.Color3(r+m, g+m, b+m);
  });

  vertices.forEach((pos, i) => {
    const sphere = BABYLON.MeshBuilder.CreateSphere(`v${i}`, {diameter: 100}, scene);
    sphere.position.copyFrom(pos);
    const mat = new BABYLON.StandardMaterial(`vm${i}`, scene);
    mat.emissiveColor = colors[i];
    mat.disableLighting = true;
    sphere.material = mat;

    // Point light for each sun
    const light = new BABYLON.PointLight(`light${i}`, pos, scene);
    light.diffuse = colors[i];
    light.specular = colors[i];
    light.intensity = 1;
    light.range = 5000;
  });

  let edgeLen = Infinity;
  for (let i = 0; i < 20; i++) {
    for (let j = i + 1; j < 20; j++) {
      const d = BABYLON.Vector3.Distance(vertices[i], vertices[j]);
      if (d > 100 && d < edgeLen) edgeLen = d;
    }
  }

  for (let i = 0; i < 20; i++) {
    for (let j = i + 1; j < 20; j++) {
      const dist = BABYLON.Vector3.Distance(vertices[i], vertices[j]);
      if (Math.abs(dist - edgeLen) < 15) {
        const tube = BABYLON.MeshBuilder.CreateTube(`t${i}_${j}`, {
          path: [vertices[i], vertices[j]],
          radius: 3,
          tessellation: 8
        }, scene);
        const tmat = new BABYLON.StandardMaterial(`tm${i}_${j}`, scene);
        tmat.emissiveColor = BABYLON.Color3.Lerp(colors[i], colors[j], 0.5);
        tmat.disableLighting = true;
        tube.material = tmat;
      }
    }
  }
}
