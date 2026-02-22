/** data for one cell, collected from multiple SoA.
 * Also includes idx(index of the cell).
 *  */
export type TMDC_CellBackup = {
  idx: number
  state: number
  owner: number
  item: number
  type: number
  hp: number
  mp: number
  jump: number
};
