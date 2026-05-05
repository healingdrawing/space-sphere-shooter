import type { WebSocketData } from ".."
import { errlog, rawlog } from "../debug/debug"
import { ips } from "../manage/ips"
import { USERS_MAX_NUMBER } from "../ram/consts"
import { gameroom, users } from "../ram/storage"

export function http_response(body:string | null, _req:Request, status:number){
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, access-control-allow-origin, Access-Control-Allow-Origin",
    }
  return new Response(body, {headers, status})
}

/** Checks if request is OPTIONS, returns response to exit fetch or undefined */
export function handle_options_request(req: Request): Response | undefined {
  return (req.method === "OPTIONS")?http_response(null, req, 204) : undefined
}

/** Checks if IP is banned, returns response to exit fetch or undefined */
export function check_ip_banned(address: string | undefined, req: Request): Response | undefined {
  if (ips.ip_banned(address)) {
    rawlog("ip banned: ", address)
    return http_response("See you later,\ntemporary banned.", req, 403)
  } else {
    rawlog("correct address ", address) // todo remove after confirm
  }
  return undefined
}

/** request to upgrade to websocket */
export function handle_ws_request(req: Request, server: Bun.Server<WebSocketData>, address: string | undefined): boolean {

  try {
    server.upgrade(req, {
      data: {
        uuid: gameroom.add_client(),
        address,
        nick:"",
        rgb: {r:0, g:0, b:0},
        key: 0,
      } as WebSocketData
    })
    rawlog("upgrade to ws: success")
    return true
  } catch (e) {
    errlog("upgrade to ws error", e)
  }
  
  return false
}

export const no_free_spots = () => users.size >= USERS_MAX_NUMBER

/** request to /check url. Check the connection status for the client */
export function handle_check_request(req: Request){
  return http_response("Try to connect.", req, 200)
}

/** Not Found 404 short hand */
export function handle_not_found(req: Request) {return http_response("Not Found", req, 404)}
