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

/** animation time in milliseconds of the chat messages */
export const VITE_CHAT_ANIMATION_MS = spip(Bun.env.VITE_CHAT_ANIMATION_MS)


/* AUTO UPDATE SPECIFIC */ //todo manage values below for ws.open condition and system updates depends on load

/** message nick size limit in bytes. Valibot raise error when achieved */
export const NICK_MAX_BYTES = spip(Bun.env.NICK_MAX_BYTES)

/** message text size limit in bytes. Valibot raise error when achieved */
export const TEXT_MAX_BYTES = spip(Bun.env.TEXT_MAX_BYTES)

/** pause in milliseconds between two messages sent by one client */
export const CHAT_PAUSE_MS = spip(Bun.env.CHAT_PAUSE_MS)

/** system update check pause in milliseconds */
export const SYSTEM_CHECK_MS = spip(Bun.env.SYSTEM_CHECK_MS)

/** invite's life time expiration in millisecond */
export const INVITE_EXPIRES_MS = spip(Bun.env.INVITE_EXPIRES_MS)
