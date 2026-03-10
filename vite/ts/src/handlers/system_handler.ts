import { ram } from "../ram"
import { mm } from "../tunnel"

export function system_handler( text:string ){
  console.log("system_handler()") //todo remove
  /** umn- USERS_MAX_NUMBER, sst_ms- SERVER_START_TIME_MS from bun .env server side */
  let obj:{umn:number, sst_ms:number, alert_text:string}
  try {
    obj = mm.parse(text) as {umn:number, sst_ms:number, alert_text:string} //todo implement. raw
    if (obj.umn){
      console.log("USERS_MAX_NUMBER:",obj.umn)
      ram.umn = obj.umn
    }
    if (obj.sst_ms){
      console.log(" SERVER_START_TIME:",obj.sst_ms)
      ram.sst_ms = obj.sst_ms
    }
    if (obj.alert_text) alert(obj.alert_text)
  } catch (e) {
    console.error("system_handler", e)
    return
  }
}
