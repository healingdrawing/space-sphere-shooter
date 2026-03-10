import { DEVLOG, dlog, rawlog } from "../debug/debug";
import { MT_VALUES, MT_STRINGS } from "../enums/mt";
import { HOST, PORT, RAM_SIZE_MB, LIMIT_KB, USERS_MAX_NUMBER } from "./consts";

// isolated log of some constants when server starts, because Import DEVLOG requires bun runtime, crush the execution if some constants imported using tunnel.ts file of client side from consts.ts of server side.

/** log constants using rawlog() function. Depends on variable ***DEVLOG*** (debug.ts) */
export function rawlog_consts() {
  if (DEVLOG) {
    dlog(false, "Environment variables section")
    rawlog("Bun.env.HOST = ", HOST)
    rawlog("Bun.env.PORT = ", PORT)
    rawlog("Bun.env.RAM_SIZE_MB = ", RAM_SIZE_MB)
    rawlog("Bun.env.LIMIT_KB = ", LIMIT_KB)
    rawlog("Bun.env.USERS_MAX_NUMBER = ", USERS_MAX_NUMBER)

    dlog(false, "enums section. Zeros filtered to prevent if (x) fail")
    rawlog("MT_VALUES = ", MT_VALUES)
    rawlog("MT_STRINGS = ", MT_STRINGS)
  }
}
