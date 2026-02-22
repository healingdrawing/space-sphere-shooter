import type { WebSocketData } from ".."
import { ERRLOG, errlog } from "../debug/debug"
import { check_room_on_ws_close } from "../gameroom/base"
import { users } from "../ram/consts"
import { ips } from "./ips"

/** custom close reasons. ws.close() */
export const CCR = {
  /** according to bun docs 4000 - 4999 codes are free to use for apps */
  is_custom: (code: number) => code > 3999 && code < 5000,
  /** the type of the received websocket message is string. Buffer is expected */
  STRING: { code: 4000, reason: 'Websocket message type is not Buffer' },
  /** websocket message thrown the error in time of check the t(type) parameter */
  BROKENTYPE: { code: 4001, reason: 'Websocket message t parameter check error' },
  /** Buffer message data can not be parsed into object. Required for the situation data structure (optional parameters) in string form are broken. Different cases requires different data */
  BROKENDATA: { code: 4002, reason: 'Websocket message data:Buffer can not be converted to object' },
  /** valibot failed to validate the websocket message */
  VALIBOT: { code: 4003, reason: 'Websocket message validation fail' },
  /** websocket connection already exists for the ip address */
  DUPLICATION: { code: 4004, reason: 'Websocket connection already exists for the ip address' },
  /** pause between two messages sent by the same client still active */
  CHATPAUSE: { code: 4005, reason: 'Pause between two messages sent by the same client still active' },
  /** invitation process has signs of hijacking */
  BADINVITE: { code: 4006, reason: 'Invitation process has signs of hijacking' },
  /** message has prohibited type for client */
  SERVERTYPE: { code: 4007, reason: 'Message has prohibited type for client' },
  /** signs of activity that prohibited on server side, by client filtering */
  HIJACKING: { code: 4008, reason: 'Hijacking activity signs' },
  /** server not able to manage data properly, but data looks correct */
  SEVERISSUE: { code: 4009, reason: 'Server side issue' },
}

export function handle_ws_close(
  ws: Bun.ServerWebSocket<WebSocketData>,
  code: number,
  reason: string,
){
  
  const d = ws.data
  const user_uuid = d.uuid
  check_room_on_ws_close( user_uuid )
  const address = d.address

  users.delete(user_uuid)
  if (address){
    /* Bun's built-in: //bug: patch here uses two codes 1006 1009. Offdocs/MSDN standard said that 1009 used for too big message, but Bun returns 1006(so it is just raise the ws close, but with not 1009 code , but with 1006 what is incorrect). Issue on Bun discord server, and github did do nothing. No response. https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1:~:text=was%20actually%20present.-,1006,-1006%20is%20a
    Even more problems detected. Since free deployment account has limits, and absense of activity triggers the ws close event, this event looks like the too big message.
    So no proper way at the moment to properly manage ban when message is too big, since it returns the same code as case of ws close initiated by deployment.
    */
    if ( code === 1006) {
      ips.remove(address)
      if (ERRLOG) errlog("monitored bugged ws.close()", "ws.data.address: ", address, " code: ", code," reason: ",reason)
    }
    else if (
      // code === 1006 || // commented because of above bug
      code === 1009 || reason === "Received too big message")
    {
      ips.ban(address)
      ips.remove(address)
      if (ERRLOG) errlog("monitored built-in ws.close()", "ws.data.address: ", address, " code: ", code," reason: ",reason)
    }
    else if (CCR.is_custom(code)) /* customized close codes */
    {
      //warning: (DUPLICATION case) in case of attempt to establish second connection from the same ip, we do not need remove ip, otherwise the next attempt to establish the second connection will have success. At the moment there is no ban either. The "open.ts" file also includes the section that responsible to manage duplication. In battle mode, duplication will be prohibited(open.ts section will be uncommented). In development mode, duplication is easiest way to test basics.
      if (code !== CCR.DUPLICATION.code){
        ips.ban(address)
        ips.remove(address)
      }
      if (ERRLOG) errlog("monitored custom ws.close()", "ws.data.address: ", address, " code: ", code," reason: ",reason)
    }
  }
}
