export enum GameRoomDelayedAction {
  /** not used */
  NONE,
  /** move dragon to cell properly after step complete. Update board */
  MOVE_ITEM_TO_CELL,
  /** check cells attacked by step to calculate damage or not */
  ATTACK_CELL,
  /** check cell still selected so switch RECOVERING to SELECTED or OCCUPATED.
   * In case of item was destroyed on cell in time of recovering RIP happens
   * and cell becomes not active (disappears for client render, and selection)
   * //todo implement
   *  */
  SELECT_CELL_AFTER_RECOVERING,
  /** to properly destroy the gameroom and resubscribe back to chat */
  EXIT_GAME
}

/** SOFF . The ship parameter offsets in uint8array range */
export enum SOFF {
  /**  user index (1..sizeplus) it is uuid, but integer number from 1 up to max users number inclusive. After remove(exit), the slot will be reused internally again.*/
  SHIP_IDX,

  /** rgb component */
  R,
  /** rgb component */
  G,
  /** rgb component */
  B,

  MASS,

  /** max linear velocity [m/s] */
  MAX_LVELO,

  /** max angular velocity [deg/s] */
  MAX_AVELO,
  
  /** linear acceleration [m/(s*s)] */
  MACCEL,
  /** angular acceleration[deg/(s*s)] */
  DACCEL,

  FRONT_GUNS,
  SIDE_GUNS,
  VERT_GUNS,

  ENGINES,
  /** front radius */
  FR,
  /** back radius */
  BR,
  /** side radius */
  SR,
  /** vertical radius */
  VR,


  /** max energy */
  MAX_EN,
  /** energy */
  EN,
  /** energy last use timestamp [ms]*/
  EN_TS,

  MAX_HP,
  HP,
  /** hp last damage timestamp [ms] (just for case, not plan now) */
  HP_TS,

  CX, CY, CZ,           // center coo

  FVX, FVY, FVZ,        // current position of the front vector
  TVX, TVY, TVZ,        // current position of the top vector
  FVX1, FVY1, FVZ1, // destination of the front vector after rotation
  TVX1, TVY1, TVZ1, // destination of the top vector after rotation
  /** [rad] delta angle (between rotated position and destination) from previous step, to compare with current, and check end */
  DA,
  AVX, AVY, AVZ,        // angular velocity/rotation axis vector // todo consider refactor all to this
  /** angular velocity [deg/s] */
  AV,
  /** angular velocity timestamp [ms] from last(previous moment) time */
  AV_TS,
  /** angular velocity END timestamp [ms] */
  AV_TSEND,

  VVX, VVY, VVZ,        // linear velocity [m/s]
  /** velocity timestamp [ms] */
  V_TS,

  /** angular velocity [deg/s] FRONT */
  AVF,
  /** angular velocity FRONT timestamp [ms] */
  AVF_TS,
  /** angular velocity FRONT END timestamp [ms] */
  AVF_TSEND,

  /** angular velocity [deg/s] TOP */
  AVT,
  /** angular velocity TOP timestamp [ms] */
  AVT_TS,
  /** angular velocity TOP END timestamp [ms] */
  AVT_TSEND,
  
  /** angular velocity [deg/s] SIDE */
  AVS,
  /** angular velocity SIDE timestamp [ms] */
  AVS_TS,
  /** angular velocity SIDE END timestamp [ms] */
  AVS_TSEND,
  
};

/** the number of elements in enum SOFF */
export const SOFFSIZE = Object.values(SOFF).length