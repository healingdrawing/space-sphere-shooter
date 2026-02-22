import { ram } from "../ram"
import { mm } from "../tunnel"

export function system_handler( text:string ){
  let obj:object
  try {
    obj = mm.parse(text)
  } catch (e) {
    console.error("server_handler", e)
    return
  }

  // console.warn("======== ram.hex will be:", obj.hex) //todo remove
  // if (obj.hex) ram.hex = obj.hex
  // console.warn("======== ram.hex became:", obj.hex) //todo remove


  // if (obj.alert_text) alert(obj.alert_text) // warning: raw alert. At the moment used when connections limit reached
  
}
