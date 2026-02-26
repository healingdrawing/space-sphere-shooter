/** to check any number of #RRGGBB#RRGGBB#rrggbb colors sequence /^#([0-9A-Fa-f]{6})+$/ */
export const HEXCOLORS_REGEX = /^(#([0-9A-Fa-f]{6}))+$/;

/** Interface representing the RAM state management */
interface RAM {
  /** one shot key provided by server to allow interact with server once */
  key: number;
  
  /** USERS_MAX_NUMBER . Server side .env limit */
  umn: number;
}

/** Factory function to create a RAM instance */
function create_ram(): RAM {
  /** one shot key provided by server to allow interact with server once */
  let key = 0

  let umn = 0

  
  return {
    get key() { return key },
    set key(value) { key = value },

    get umn() { return umn },
    set umn(value) { umn = value },
  };
}

/** storage for values used in app */
export const ram = create_ram();
