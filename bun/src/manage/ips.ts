import { DEVLOG, rawlog } from "../debug/debug"

/** the ip manager, to control banned and connected ip addresses */
export const ips = {
  /** the map of banned ips and the timestamp of the unban in ms */
  _banned: new Map<string, number>(),
  /** the set of connected ips */
  _connected: new Set<string>(),

  /** return Date.now() + 1 hour [milliseconds] */
  _plus_one_hour_ms(){ return Date.now() + 3600000 },

  /** check if ip address temporary banned.
   * 
   * Return ***undefined*** if address is incorrect.
   * 
   * Return ***false*** if address is not banned, or banned time is incorrect, or banned time has over.
   * 
   * Return ***true*** if address is banned.
  */
  ip_banned(address:string | undefined){
    if (!address) return undefined

    if (!ips._banned.has(address) ) return false
    
    const banned_until = ips._banned.get(address)
    if (!banned_until || banned_until < Date.now()) {
      ips._banned.delete(address)
      return false
    }

    return true
  },

  /** check if the ip address already in the Set of the connected to server.
   * 
   * Return ***undefined*** if address is incorrect.
   * 
   * Return ***false*** if address is not in the Set of the connected.
   * 
   * Return ***true*** if address is connected.
  */
  ip_connected(address:string | undefined){
    return (address)? this._connected.has(address) : undefined
  },

  /** add the ip address to the Set of connected ips, to monitor duplications.
   * 
   * Return ***undefined*** if address is incorrect.
   * 
   * Return ***false*** if ip already present in the Set.
   * 
   * Return ***true* if ip is original(no duplications found) and ip was added.
  */
  connect(address:string | undefined){
    if (!address) return undefined

    const c_ = this._connected
    if (c_.has(address)) return false

    c_.add(address)
    return true
  },

  /** delete the ip address from the Set of connected ips.
   * 
   * Return ***undefined*** if address is incorrect.
   * 
   * Return ***true*** if address is correct, found in the Set, then removed.
   * 
   * Return ***false*** if address was not found in the Set.
  */
  remove(address:string | undefined){
    if (!address) return undefined

    const c_=this._connected
    if (c_.has(address)){
      if(DEVLOG) rawlog("ips . removing of the ip ", address) //todo remove
      c_.delete(address)
      return true
    }

    return false
  },

  /** add ip address to map of temporary banned.
   * 
   * Return ***undefined*** if address is incorrect.
   * 
   * Return ***true*** if address is uinque, then was banned.
   * 
   * Return ***false*** if address is already banned.
  */
  ban(address:string | undefined){
    if (!address) return undefined

    const b_=this._banned
    if (!b_.has(address) ){
      b_.set(address, this._plus_one_hour_ms())
      return true
    }

    return false
  },
}
