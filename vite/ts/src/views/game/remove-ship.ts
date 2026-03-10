import { ram } from "../../ram";


export const remove_ship = (idx: number, ship_boxes:(BABYLON.TransformNode | null)[]) => {
  if (idx < 1 || idx > ram.umn){
    console.error("remove_ship: wrong index of the ship. Should not happen ", idx)
    return
  }
  
  const box = ship_boxes[idx];
  if (box) {
    box.dispose();
    ship_boxes[idx] = null;
  }
}