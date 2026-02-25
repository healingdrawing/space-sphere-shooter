import { MT } from "../enums/mt"
import { mm } from "./message"

/** create system message to alert client `{"t":${MT.S}, "alert_text":"${text}"}` as Uint8Array */
export const alert_text_system_message = (text: string) => mm.keyu8a(MT.S, mm.encode(`{"alert_text":"${text}"}`))
