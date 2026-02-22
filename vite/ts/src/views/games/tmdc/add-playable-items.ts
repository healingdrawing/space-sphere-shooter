/** @param hex colors for items #RRGGBB#RRGGBB */
export function add_playable_items(
  scene: BABYLON.Scene,
  dragons: BABYLON.Mesh[],
  dragonCellIndex: number[],
  cell_size:number,
  hex: string
) {

  let c1 = BABYLON.Color3.White()
  let c2 = BABYLON.Color3.White()
  let hex1:string
  let hex2:string
  if(hex.length === 14){
    try{
      hex1 = hex.slice(0,7).toUpperCase()
      hex2 = hex.slice(7).toUpperCase()
      console.log("=========hexes=========", hex1, hex2)
      c1.fromHexString(hex1)
      c2.fromHexString(hex2)
      }catch (e) {
        console.error("wrong hex colors data:", hex, ". Use default colors.")
    }
  } else{ console.error("=========== hex length is:", hex.length) }


  const types = ['torus', 'sphere', 'cone']; // thunder, fire, earth
  const dragonSize = cell_size * 0.5;
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col - 3.5;
      const z = row - 3.5;

      let dragon: BABYLON.Mesh;
      if (types[row] === 'torus') {
        dragon = BABYLON.MeshBuilder.CreateTorus(`dragon-${row}-${col}`, {
          diameter: dragonSize*0.8,   // outer diameter
          thickness: dragonSize*0.6,  // ring thickness
          tessellation: 16              // smoothness
        }, scene);
      } else if (types[row] === 'sphere') {
        dragon = BABYLON.MeshBuilder.CreateSphere(`dragon-${row}-${col}`, { diameter: dragonSize }, scene);
      } else {
        dragon = BABYLON.MeshBuilder.CreateCylinder(`dragon-${row}-${col}`, { height: dragonSize, diameterBottom: dragonSize, diameterTop: dragonSize/2 }, scene);
      }

      dragon.position = new BABYLON.Vector3(x, 0.25 + dragonSize / 2, z);
      const mat = new BABYLON.StandardMaterial(`dragon-mat-${row}-${col}`, scene);
      mat.diffuseColor = c1.clone()
      dragon.material = mat;
      dragons.push(dragon);
      dragonCellIndex.push(row * 8 + col);

      // Disable selection on dragon (pass through to plate)
      dragon.isPickable = false;
    }
  }

  // Enemy/opponent side - same but shifted z
  types.reverse() // to mirror items
  for (let row = 5; row < 8; row++) { // top 3 rows
    for (let col = 0; col < 8; col++) {
      const x = col - 3.5;
      const z = row - 3.5;

      let dragon: BABYLON.Mesh;
      if (types[row - 5] === 'torus') {
        dragon = BABYLON.MeshBuilder.CreateTorus(`enemy-dragon-${row}-${col}`, {
          diameter: dragonSize*0.8,
          thickness: dragonSize*0.6,
          tessellation: 32
        }, scene);
      } else if (types[row - 5] === 'sphere') {
        dragon = BABYLON.MeshBuilder.CreateSphere(`enemy-dragon-${row}-${col}`, { diameter: dragonSize }, scene);
      } else {
        dragon = BABYLON.MeshBuilder.CreateCylinder(`enemy-dragon-${row}-${col}`, { height: dragonSize, diameterBottom: dragonSize, diameterTop: dragonSize/2 }, scene);
      }

      dragon.position = new BABYLON.Vector3(x, 0.25 + dragonSize / 2, z);
      const mat = new BABYLON.StandardMaterial(`enemy-dragon-mat-${row}-${col}`, scene);
      mat.diffuseColor = c2.clone()
      dragon.material = mat;
      dragons.push(dragon);
      dragonCellIndex.push(row * 8 + col);

      dragon.isPickable = false;
    }
  }
}
