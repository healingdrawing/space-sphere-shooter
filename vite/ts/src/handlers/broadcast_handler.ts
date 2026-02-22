import { mm } from "../tunnel"

export function broadcast_handler(text: string){
  let obj:object
  try {
    obj = mm.parse(text)
  } catch (e) {
    console.error("broadcast_handler", e)
    return
  }

  // if (obj.alert_text) alert(obj.alert_text) // warning: raw alert. F.e. to inform all the clients about autoswitching to home view etc. Not used at the moment.

}
