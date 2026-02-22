/** to check any number of #RRGGBB#RRGGBB#rrggbb colors sequence /^#([0-9A-Fa-f]{6})+$/ */
export const HEXCOLORS_REGEX = /^(#([0-9A-Fa-f]{6}))+$/;

/** Interface representing the RAM state management */
interface RAM {
  /** one shot key provided by server to allow interact with server once */
  key: number;

  /** Check if the view has changed. After read once, set to false */
  view_changed: boolean; // Using a getter

  /** hex colors pair #RRGGBB#RRGGBB, as game items base colors */
  hex: string;
}

/** Factory function to create a RAM instance */
function create_ram(): RAM {
  /** one shot key provided by server to allow interact with server once */
  let key: number = 0

  let _view_changed: boolean = true; // true for first render. Change detection flag
  
  let hex: string = '#000000'

  return {
    get key() { return key },
    set key(value) {
      key = value
    },

    get view_changed() {
      const changed = _view_changed;
      _view_changed = false;
      return changed;
    },

    get hex() {return hex},
    set hex(v) {
      if (v.length === 14 && HEXCOLORS_REGEX.test(v)) {
        hex = v;
      } else {
        console.error("ram.hex setter. Attempt to use wrong hex color value", v);
      }
    },
  };
}

/** storage for values used in app */
export const ram = create_ram();
