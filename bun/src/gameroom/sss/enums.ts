
// Cell states to manage gameplay. Selectable/non-selectable etc
export const enum TMDC_CellState {
  /** selectable as destination */
  EMPTY,
  /** has piece, selectable to move by owner */
  OCCUPIED,
  /** has piece, selected by owner */
  SELECTED,
  /** locked */
  RECOVERING,
  /** booked */
  DESTINATION,
  /** after dragon dead, volcano/flame/lightning */
  RIP
}

/** Allowed values for current owner(player) of the cell */ 
export const enum TMDC_Owner {
  /** //todo consider to use this as empty cell case/check */
  NONE,
  /** player 1 is owner of the item */
  P1,
  /** player 2 is owner of the item */
  P2,
  //warning for later implementation. in case of demo two bots needed. So someway gamemode GAMEMODE.DEMO should activate second bot as replacement for Player1. Or extention needed later.
  /** template for bot */
  BOT
}

// Dragon types (from tmdc.txt)
export const enum TMDC_DragonType {
  NONE = 0,// for empty board cell
  EARTH = 1,
  FIRE = 2,
  THUNDER = 3,
  /**
   * //warning not used. not implemented. Just planned extra gameplay perks.
   * IF consider as invisible for opponent after achievs the opponent side edge,
   * THEN will requires extra check of the dragon type before send step message.
   * Attack cell messages logic can be the same, but anyways detectable on client side,
   * using scripts, and direction of the attack.
   *  */
  ADVANCED = 4
}

// todo next below properties must be better balanced for jump -> attack -> damage or so.
/** dragon ranges to step. Maximum number of cells able to be attacked.
 * F.e. EARTH = 2 means can max jump from 1 (2 3) to 4, through two cells.
 * */
export const enum TMDC_DragonRange {
  NONE = 0,
  EARTH = 4,
  FIRE = 5,
  THUNDER = 6,
  ADVANCED = 7
}

/** health power of dragons. to be subrtacted before dead */
export const enum TMDC_DragonHP {
  NONE = 0,
  EARTH = 7,
  FIRE = 6,
  THUNDER = 5,
  ADVANCED = 4
}

/** magic power of dragons for attack cells */
export const enum TMDC_DragonMP {
  NONE = 0,
  EARTH = 7,
  FIRE = 6,
  THUNDER = 5,
  ADVANCED = 4
}
