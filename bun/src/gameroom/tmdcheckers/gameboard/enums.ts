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
