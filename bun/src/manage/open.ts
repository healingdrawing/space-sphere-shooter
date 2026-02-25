import type { WebSocketData } from ".."
import { DEVLOG } from "../debug/debug"
import { MT } from "../enums/mt"
import { users, USERS_MAX_NUMBER } from "../ram/consts"
import { CCR } from "./close"
import { ips } from "./ips"
import { mm } from "./message"
import { alert_text_system_message } from "./system"

/** return ***true*** in case of any error, otherwise return ***false*** */
export function handle_ws_open(ws: Bun.ServerWebSocket<WebSocketData>): boolean {
  if (users.size >= USERS_MAX_NUMBER) {
    ws.send(alert_text_system_message(`First check the connection. No free spots.\nMaximum ${USERS_MAX_NUMBER} connected users are allowed.`))
    ws.close(1013)
    return true
  }

  //warning turned off check when DEVLOG true. Check prohibits more than one client on ip. F.e. one browser and two tabs/game views opened.
  if(!DEVLOG){
    if (ips.ip_connected(ws.data.address)) {
      ws.send(alert_text_system_message(`Address ${ws.data.address} already connected to server.\nNo duplication allowed at the moment.`))
      ws.close(CCR.DUPLICATION.code, CCR.DUPLICATION.reason)
      return true
    }
  }

  users.set(ws.data.uuid, { ws })
  ips.connect(ws.data.address)
  ws.subscribe(`${ws.data.uuid}`) // personal messages
  ws.subscribe("game") // for broadcast, common gameplay messages
  
  const msg = { text: "join the game" }
  ws.send(mm.keyu8a(MT.S, mm.obju8a(msg)))
  return false
}
