import { spip } from "../utils/safe"

/** process.env.XXXX should work also, since bun says process available by default. But project focused on Bun. */
/** server host name to listen to. The "localhost" test docker with 0.0.0.0 */
export const HOST = Bun.env.HOST

export const PORT = Bun.env.PORT

/** [NOT USED] deployment RAM size in megabytes, to some way adapt server to limits of the deployment environment, since plans to avoid db as/if possible */
export const RAM_SIZE_MB = spip(Bun.env.RAM_SIZE_MB)

/** websocket message size limit in kilobytes. When achieved, close the connection. Also to send to client and adapt client for sever current configuration */
export const LIMIT_KB = spip(Bun.env.LIMIT_KB)

/** maximum of the connected users. After half of this value the autolimit starts. The 0 means unlimited */
export const USERS_MAX_NUMBER = spip(Bun.env.USERS_MAX_NUMBER)
