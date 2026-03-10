import { crts, use_key } from "../../handlers/utils";
import { KEYMAP, mm, MT } from "../../tunnel";
import { home_box } from "../home/home-box";

const FULL_POWER_MS = 2000;           // 2 seconds → 100%
const POWER_MIN_SEND = 1;
const POWER_MAX = 100;
const keyPressTimes = new Map<string, number>();

export const send_client_action = (ws:WebSocket, action:MT, power:number) => {
  const key = use_key()
  if(!key){
    console.error("in some reasons there was no key at the request moment, so message was not sent. Reload browser window, to try connect again.")
    return
  }
  console.log("released button. KeyCode:", action);//todo remove

  //warning. power should be implemented from >0 to 100 (%) uses press(keydown) -> accumulate (keyhold) -> release (power set to value , then will be sent from here to server) 
  
  // switch(action){
  //   case MT.FRONTMOVE: power = 100; break
  //   case MT.STOPMOVE: power = 100; break

  //   case MT.LEFTMOVE: power = 40; break
  //   case MT.RIGHTMOVE: power = 40; break
  //   case MT.TOPMOVE: power = 40; break
  //   case MT.DOWNMOVE: power = 40; break
  //   case MT.CWMOVE: power = 40; break
  //   case MT.CCWMOVE: power = 40; break
    
  //   /* shot section */
    
  //   case MT.FRONTSHOT: power = 50; break //warning at the moment the power is not used on server side, for shot
  //   case MT.LEFTSHOT: power = 50; break
  //   case MT.RIGHTSHOT: power = 50; break
  //   case MT.BACKSHOT: power = 50; break
  //   case MT.TOPSHOT: power = 50; break
  //   case MT.DOWNSHOT: power = 50; break
    
  //   default: break
  // }

  const dummy = { code: action, power } //todo properly remove code parameter, since not used
  
  // add message type
  const with_mt = mm.keyu8a(action, mm.obju8a(dummy))
  // add key. Now mt is second byte
  ws.send(mm.keyu8a(key, with_mt)); //todo fix later
}


/** test keymap. Raw key listeners //todo implement */
export const manage_client_actions = (ws:WebSocket, view:HTMLDivElement) => {
  home_box.view.style.display = 'none';
   const gameView = view;
   gameView.style.display = 'block';
   gameView.focus();
 
  //  const pressed = new Set<string>();
 
   const onKeyDown = (e: KeyboardEvent) => {
     if (e.repeat) return;
     const action = KEYMAP[e.code];
     console.log('DOWN', e.code, 'KEYMAP[e.code]:', action);  // todo remove
    if (!action) return;
    if (!keyPressTimes.has(e.code)) {
      keyPressTimes.set(e.code, crts());
    }
  };
 
  const onKeyUp = (e: KeyboardEvent) => {
    const start = keyPressTimes.get(e.code);
    if (!start) return;
    
    keyPressTimes.delete(e.code);
    
    const heldMs = crts() - start;
    let power = Math.round((heldMs / FULL_POWER_MS) * POWER_MAX);
    
    // Clamp
    power = Math.max(POWER_MIN_SEND, Math.min(POWER_MAX, power));
    
    const action = KEYMAP[e.code];
    console.warn('UP', e.code, 'KEYMAP[e.code]:', action, 'power:', power); // todo remove
    if (action) {
      send_client_action(ws, action, power);
    }
  };
 
   const onPointerDown = (e: PointerEvent) => {
     console.log('POINTER DOWN', e.pointerType);
   };
 
   const onPointerUp = (e: PointerEvent) => {
     console.log('POINTER UP', e.pointerType);
   };
 
   document.addEventListener('keydown', onKeyDown);
   document.addEventListener('keyup', onKeyUp);
   document.addEventListener('pointerdown', onPointerDown);
   document.addEventListener('pointerup', onPointerUp);
 }//todo fix later