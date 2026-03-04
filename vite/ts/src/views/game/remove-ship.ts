import { ram } from "../../ram";


export const remove_ship = (idx: number, ships:(BABYLON.Mesh | null)[]) => {
  if (idx < 1 || idx > ram.umn){
    console.error("remove_ship: wrong index of the ship. Should not happen ", idx)
    return
  }
  
  const mesh = ships[idx];
  if (mesh) {
    mesh.dispose();
    ships[idx] = null;
  }
}