import { mm } from "../tunnel"

export function system_handler( text:string ){
  console.log("system_handler()") //todo remove
  let obj:object
  try {
    obj = mm.parse(text)
  } catch (e) {
    console.error("system_handler", e)
    return
  }

  

  // if (obj.alert_text) alert(obj.alert_text) // warning: raw alert. At the moment used when connections limit reached
  
}
