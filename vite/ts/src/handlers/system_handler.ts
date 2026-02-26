import { ram } from "../ram"
import { mm } from "../tunnel"

export function system_handler( text:string ){
  console.log("system_handler()") //todo remove
  /** umn- USERS_MAX_NUMBER from bun .env server side */
  let obj:{umn:number}
  try {
    obj = mm.parse(text) as {umn:number} //todo implement. raw
  } catch (e) {
    console.error("system_handler", e)
    return
  }

  if (obj.umn){
    console.log("USERS_MAX_NUMBER:",obj.umn)
    ram.umn = obj.umn
  }

  // if (obj.alert_text) alert(obj.alert_text) // warning: raw alert. At the moment used when connections limit reached
  
}
