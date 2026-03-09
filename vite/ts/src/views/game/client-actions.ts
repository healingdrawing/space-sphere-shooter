import { use_key } from "../../handlers/utils";
import { KEYMAP, mm, MT } from "../../tunnel";
import { home_box } from "../home/home-box";

export const send_client_action = (ws:WebSocket, action:MT) => {
  const key = use_key()
  if(!key){
    console.error("in some reasons there was no key at the request moment, so message was not sent. Reload browser window, to try connect again.")
    return
  }
  console.log("released button. KeyCode:", action);//todo remove

  let power = 0 //warning. polish check since server raise error if power 0
  if (action === MT.LEFTMOVE) power = 30 //degrees dev gap //todo implement with press - hold - release - value
  else if (action === MT.RIGHTMOVE) power = 30
  else if (action === MT.TOPMOVE) power = 30
  else if (action === MT.DOWNMOVE) power = 30
  else if (action === MT.CWMOVE) power = 30
  else if (action === MT.CCWMOVE) power = 30
  // frotmove and stopmove work different at the moment. Just +delta move and fullstop.

  /* shot section */
  else if (action){}

  switch(action){
    case MT.LEFTMOVE: power = 100; break
    case MT.RIGHTMOVE: power = 100; break
    case MT.TOPMOVE: power = 100; break
    case MT.DOWNMOVE: power = 100; break
    case MT.CWMOVE: power = 100; break
    case MT.CCWMOVE: power = 100; break
    
    /* shot section */
    
    case MT.FRONTSHOT: power = 50; break //warning at the moment the power is not used on server side, for shot
    case MT.LEFTSHOT: power = 50; break
    case MT.RIGHTSHOT: power = 50; break
    case MT.BACKSHOT: power = 50; break
    case MT.TOPSHOT: power = 50; break
    case MT.DOWNSHOT: power = 50; break
    
    default: break
  }

  const dummy = { code: action, power }
  
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
 
   const pressed = new Set<string>();
 
   const onKeyDown = (e: KeyboardEvent) => {
     if (pressed.has(e.code)) return;
     pressed.add(e.code);
     const action = KEYMAP[e.code]
     console.log('DOWN', e.code, 'KEYMAP[e.code]:', action);  // todo remove
     // send_client_action(ws, action)
   };
 
   const onKeyUp = (e: KeyboardEvent) => {
     pressed.delete(e.code);
     const action = KEYMAP[e.code]
     console.log('UP', e.code, 'KEYMAP[e.code]:', action); // todo remove
     if(action) send_client_action(ws, action)
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