/** to check any number of #RRGGBB#RRGGBB#rrggbb colors sequence /^#([0-9A-Fa-f]{6})+$/ */
export const HEXCOLORS_REGEX = /^(#([0-9A-Fa-f]{6}))+$/;

/** Interface representing the RAM state management */
interface RAM {
  /** one shot key provided by server to allow interact with server once */
  key: number;
  
  /** USERS_MAX_NUMBER . Server side .env limit */
  umn: number;

  /** SERVER_START_TIME_MS . Server side consts.ts */
  sst_ms: number;
}

/** Factory function to create a RAM instance */
function create_ram(): RAM {
  /** one shot key provided by server to allow interact with server once */
  let key = 0

  let umn = 0

  let sst_ms = 0

  
  return {
    get key() { return key },
    set key(value) { key = value },

    get umn() { return umn },
    set umn(value) { umn = value },

    get sst_ms() { return sst_ms },
    set sst_ms(value) { sst_ms = value },
  };
}

/** storage for values used in app */
export const ram = create_ram();
