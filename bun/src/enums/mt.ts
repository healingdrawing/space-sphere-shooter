/** message types of websocket. */
export enum MT {
  /** ***DO NOT USE IT!*** zero killer, to prevent boolean false when short syntax used. if(MT.FAKE) instead of if(MT.FAKE !== undefined). In zero case results are different */
  FAKE,

  /** Used when player enters or exits the game (enter game / exit game / disconnect) - Key: NumpadSubtract/KeyO */
  EXIT,

  /** Front shot (main weapon) - Key: NUM0/KeyF */
  FRONTSHOT,

  /** Left side shot - Key: Arrow Left/KeyN */
  LEFTSHOT,

  /** Right side shot - Key: Arrow Right/KeyL */
  RIGHTSHOT,

  /** Back shot - Key: NUM Enter/KeyK */
  BACKSHOT,

  /** Top shot - Key: Arrow Up/KeyJ */
  TOPSHOT,

  /** Down shot - Key: Arrow Down/KeyM */
  DOWNSHOT,

  /** Forward impulse move - Key: NUM1/KeyZ */
  FRONTMOVE,

  /** Stop movement - Key: NUM2/KeyA */
  STOPMOVE,

  /** Left rotation / slide - Key: NUM4/KeyQ */
  LEFTMOVE,

  /** Right rotation / slide - Key: NUM6/KeyC */
  RIGHTMOVE,

  /** Top rotation / pitch up - Key: NUM8/KeyE */
  TOPMOVE,

  /** Down rotation / pitch down - Key: NUM5/KeyS */
  DOWNMOVE,

  /** Clockwise rotation - Key: NUM9/KeyD */
  CWMOVE,

  /** Counter-clockwise rotation - Key: NUM7/KeyW */
  CCWMOVE,

  /** Target move (move toward target/selection) - Key: NUM3/KeyX */
  TARGETMOVE,

  S, /** System message. Use for new incoming player case. F.e. new player joined , send to him ships of another enemies. Like scheduled small messages to setup the environment */

  // B, /** Broadcast message. Use to inform all connected clients. F.e. new player joined. To setup one new player for all connected clients. */
}

/** MT values as strings to compare faster later. Exclude MT.FAKE */
export const MT_STRINGS = Object.values(MT)
  .filter(v => v && typeof v === 'number')
  .map(String)
/** MT values as numbers to compare faster later. Exclude MT.FAKE */
export const MT_VALUES = Object.values(MT)
  .filter(v => v && typeof v === 'number')

export const MT_NAME: Record<MT, string> = {
  [MT.FAKE]: "FAKE",
  [MT.EXIT]: "EXIT",
  [MT.FRONTSHOT]: "FRONTSHOT",
  [MT.LEFTSHOT]: "LEFTSHOT",
  [MT.RIGHTSHOT]: "RIGHTSHOT",
  [MT.BACKSHOT]: "BACKSHOT",
  [MT.TOPSHOT]: "TOPSHOT",
  [MT.DOWNSHOT]: "DOWNSHOT",
  [MT.FRONTMOVE]: "FRONTMOVE",
  [MT.STOPMOVE]: "STOPMOVE",
  [MT.LEFTMOVE]: "LEFTMOVE",
  [MT.RIGHTMOVE]: "RIGHTMOVE",
  [MT.TOPMOVE]: "TOPMOVE",
  [MT.DOWNMOVE]: "DOWNMOVE",
  [MT.CWMOVE]: "CWMOVE",
  [MT.CCWMOVE]: "CCWMOVE",
  [MT.TARGETMOVE]: "TARGETMOVE",
  [MT.S]: "S",
}

export const KEYMAP: Record<string, MT> = {
  // Numpad controls
  NumpadSubtract: MT.EXIT,          // exit/also consider to use to start/join
  Numpad0:        MT.FRONTSHOT,     
  ArrowLeft:      MT.LEFTSHOT,      
  ArrowRight:     MT.RIGHTSHOT,     
  NumpadEnter:    MT.BACKSHOT,      
  ArrowUp:        MT.TOPSHOT,       
  ArrowDown:      MT.DOWNSHOT,      
  Numpad1:        MT.FRONTMOVE,     
  Numpad2:        MT.STOPMOVE,      
  Numpad4:        MT.LEFTMOVE,      // horisontal slide
  Numpad6:        MT.RIGHTMOVE,     // horisontal slide
  Numpad8:        MT.TOPMOVE,       // top rotate/pitch up
  Numpad5:        MT.DOWNMOVE,      // down rotate/pitch down
  Numpad9:        MT.CWMOVE,        // drill clockwise
  Numpad7:        MT.CCWMOVE,       // drill counter-clockwise
  Numpad3:        MT.TARGETMOVE,    // target move (as possible rotate to)

  // Letter keys alternative
  KeyO: MT.EXIT,
  KeyF: MT.FRONTSHOT,
  KeyN: MT.LEFTSHOT,
  KeyL: MT.RIGHTSHOT,
  KeyK: MT.BACKSHOT,
  KeyJ: MT.TOPSHOT,
  KeyM: MT.DOWNSHOT,
  KeyZ: MT.FRONTMOVE,
  KeyA: MT.STOPMOVE,
  KeyQ: MT.LEFTMOVE,
  KeyC: MT.RIGHTMOVE,
  KeyE: MT.TOPMOVE,
  KeyS: MT.DOWNMOVE,
  KeyD: MT.CWMOVE,
  KeyW: MT.CCWMOVE,
  KeyX: MT.TARGETMOVE
};

// plan to use next way
// addEventListener('pointerdown', e => {
//   implement some way repeated accumulation of the press->hold 0%-100%-0% etc
//   when key released the keycode and accumulated value send to server
// });
// addEventListener('pointerup', e => {
//   const action = KEYMAP[e.code];
//   if (action) sendToServer(action);
// });