import { dlog, rawlog } from "./debug/debug"
import { LIMIT_KB } from "./ram/consts"
import { rawlog_consts } from "./ram/logger"
import { HOST, PORT } from "./ram/consts"
import { handle_ws_message } from "./manage/all"
import { handle_ws_close } from './manage/close'
import { check_ip_banned, handle_check_request, handle_not_found, handle_options_request, handle_ws_request, http_response, no_free_spots } from "./http/handlers"
import { handle_ws_open } from "./manage/open"

/** to manage properties using ws.data. */
export interface WebSocketData {
  /** unique identifier for ws connection, created once. Do not modify it */
  uuid: number
  address: string | undefined
  /** nickname, maybe for visuals on ship etc */ //todo check it used, or remove
  nick:string,
  /** game identity color. RGB 0-255 user once set before connect to server. */
  rgb: {r:number, g:number, b:number}
  /** one shot key(one digit), used once to allow client send one incoming game message.
   * The new one generated after previous one approved on server side,
   * then sent to client.
   */
  key: number
}

/** server access, to broadcast easily */
export const s = Bun.serve<WebSocketData, undefined>({
  hostname: HOST,
  port: PORT,
  async fetch(req, server) {
    rawlog("request to server arrived")
    const hor = handle_options_request(req)
    if (hor) return hor
    
    const address = server.requestIP(req)?.address.trim()
    
    const cban = check_ip_banned(address, req)
    if (cban) return cban
    
    const url = new URL(req.url)
    rawlog('url.pathname:', url.pathname) //todo remove

    if(no_free_spots()) return http_response("No free spots. Try to connect later.", req, 200)

    if (url.pathname == "/ws"){ if (handle_ws_request(req, s, address)) return}
    else if (url.pathname == "/check") return handle_check_request(req)
    return handle_not_found(req)
  },
  websocket:{
    maxPayloadLength: 1024 * LIMIT_KB, // usefull, works, tested
    backpressureLimit: 1024 * LIMIT_KB, // todo not too clearly documented
    closeOnBackpressureLimit: true, // todo default false, just drops the message
    message(ws, message) { handle_ws_message(ws, message) },
    open(ws) {
      handle_ws_open(ws)
    },
    close(ws, code, reason) {
      handle_ws_close(ws, code, reason)
      rawlog("ws close")
    },
    // drain(ws) { rawlog("ws drain") }, // the socket is ready to receive more data. It is from bun offdocs. Never fired.
  },
})

rawlog_consts()

dlog(true, "server listening on",`port: ${s.port}`, `host: ${s.hostname}`)
