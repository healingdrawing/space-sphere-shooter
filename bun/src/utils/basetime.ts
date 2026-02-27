import { dlog } from "../debug/debug";
import { MT } from "../enums/mt";
import { send_delayed_messages } from "../gameroom/base";
import { vars } from "../ram/storage";

/** //warning //todo test it. update vars.SERVER_START_TIME_MS to prevent overflow for timestamps */
export const periodically_update_server_start_time = () => {
  dlog(false, "vars.SERVER_START_TIME_MS will be updated every four hours")
  setInterval(() => {
    const now = Date.now()
    vars.SERVER_START_TIME_MS = now
    send_delayed_messages([{
      mt:MT.S,
      msg:{ sst_ms:now },
      ms:0,
      uuids:[0]
    }])
    dlog(true, "server start time updated",`Date.now(): ${now}`)
  }, 14_400_000);//warning four hours in ms
}

/** get relative timestamp => Date.now() - vars.SERVER_START_TIME_MS */
export const rts = () => Date.now() - vars.SERVER_START_TIME_MS
