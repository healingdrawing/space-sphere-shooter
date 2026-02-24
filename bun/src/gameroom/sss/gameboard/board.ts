import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { type TMDC_CellBackup } from "../types";
import { TMDC_CellState, TMDC_Owner, TMDC_DragonType, TMDC_DragonHP, TMDC_DragonMP, TMDC_DragonRange } from "../enums";
import type { TMDC_BOARD_ACTION, TMDC_BOARD_MESSAGE } from "./types";
import { GameRoomDelayedAction } from "./enums";
import { mm } from "../../../manage/message";
import { USERS_MAX_NUMBER } from "../../../ram/consts";

export class SSSBoard {
  

  /** the world sphere diameter */
  readonly size = USERS_MAX_NUMBER
  private readonly sizeplus = this.size + 1

  oneship = 34; // range of 34 floats per ship(properties)
  ships = new Float32Array(this.sizeplus * this.oneship);

  S = {
    /**  user index (1..sizeplus) it will be uuid, but integer number from 1 up to max users number inclusive. After remove slot will be reused internally again.*/
    SHIP_IDX: 0,

    /** rgb component */
    R: 1,
    /** rgb component */
    G: 2,
    /** rgb component */
    B: 3,

    MASS: 4,

    FRONT_GUNS: 5,
    SIDE_GUNS: 6,
    VERT_GUNS: 7,

    FR: 8,   // front radius
    BR: 9,   // back radius
    SR: 10,  // side radius
    VR: 11,  // vertical radius

    /** max energy */
    MAX_EN: 12,
    /** energy */
    EN: 13,
    /** energy last use timestamp */
    EN_TS: 14,

    MAX_HP: 15,
    HP: 16,
    /** hp last damage timestamp(just for case, not plan now) */
    HP_TS: 17,

    CX: 18, CY: 19, CZ: 20,           // center coo

    FVX: 21, FVY: 22, FVZ: 23,        // front vector
    TVX: 24, TVY: 25, TVZ: 26,        // top vector

    VVX: 27, VVY: 28, VVZ: 29,        // linear velocity [m/s]
    VTS: 30,                          // velocity timestamp [ms]

    AVX: 31, AVY: 32, AVZ: 33,        // angular velocity (deg/s)
  };

  base = (i: number) => i * this.oneship;
  get = (i: number, off: number) => this.ships[this.base(i) + off];
  set = (i: number, off: number, v: number) => this.ships[this.base(i) + off] = v;

  get_ship_idx = (i: number) => this.get(i, this.S.SHIP_IDX);
  get_R = (i: number) => this.get(i, this.S.R);
  get_G = (i: number) => this.get(i, this.S.G);
  get_B = (i: number) => this.get(i, this.S.B);
  get_mass = (i: number) => this.get(i, this.S.MASS);
  get_side_guns = (i: number) => this.get(i, this.S.SIDE_GUNS);
  get_vert_guns = (i: number) => this.get(i, this.S.VERT_GUNS);
  get_front_guns = (i: number) => this.get(i, this.S.FRONT_GUNS);
  get_fr = (i: number) => this.get(i, this.S.FR);
  get_br = (i: number) => this.get(i, this.S.BR);
  get_sr = (i: number) => this.get(i, this.S.SR);
  get_vr = (i: number) => this.get(i, this.S.VR);
  get_max_en = (i: number) => this.get(i, this.S.MAX_EN);
  get_en = (i: number) => this.get(i, this.S.EN);
  get_en_ts = (i: number) => this.get(i, this.S.EN_TS);
  get_max_hp = (i: number) => this.get(i, this.S.MAX_HP);
  get_hp = (i: number) => this.get(i, this.S.HP);
  get_hp_ts = (i: number) => this.get(i, this.S.HP_TS);
  get_cx = (i: number) => this.get(i, this.S.CX);
  get_cy = (i: number) => this.get(i, this.S.CY);
  get_cz = (i: number) => this.get(i, this.S.CZ);
  get_fvx = (i: number) => this.get(i, this.S.FVX);
  get_fvy = (i: number) => this.get(i, this.S.FVY);
  get_fvz = (i: number) => this.get(i, this.S.FVZ);
  get_tvx = (i: number) => this.get(i, this.S.TVX);
  get_tvy = (i: number) => this.get(i, this.S.TVY);
  get_tvz = (i: number) => this.get(i, this.S.TVZ);
  get_vvx = (i: number) => this.get(i, this.S.VVX);
  get_vvy = (i: number) => this.get(i, this.S.VVY);
  get_vvz = (i: number) => this.get(i, this.S.VVZ);
  get_vts = (i: number) => this.get(i, this.S.VTS);
  get_avx = (i: number) => this.get(i, this.S.AVX);
  get_avy = (i: number) => this.get(i, this.S.AVY);
  get_avz = (i: number) => this.get(i, this.S.AVZ);

  set_ship_idx = (i: number, v: number) => this.set(i, this.S.SHIP_IDX, v);
  set_R = (i: number, v: number) => this.set(i, this.S.R, v);
  set_G = (i: number, v: number) => this.set(i, this.S.G, v);
  set_B = (i: number, v: number) => this.set(i, this.S.B, v);
  set_mass = (i: number, v: number) => this.set(i, this.S.MASS, v);
  set_side_guns = (i: number, v: number) => this.set(i, this.S.SIDE_GUNS, v);
  set_vert_guns = (i: number, v: number) => this.set(i, this.S.VERT_GUNS, v);
  set_front_guns = (i: number, v: number) => this.set(i, this.S.FRONT_GUNS, v);
  set_fr = (i: number, v: number) => this.set(i, this.S.FR, v);
  set_br = (i: number, v: number) => this.set(i, this.S.BR, v);
  set_sr = (i: number, v: number) => this.set(i, this.S.SR, v);
  set_vr = (i: number, v: number) => this.set(i, this.S.VR, v);
  set_max_en = (i: number, v: number) => this.set(i, this.S.MAX_EN, v);
  set_en = (i: number, v: number) => this.set(i, this.S.EN, v);
  set_en_ts = (i: number, v: number) => this.set(i, this.S.EN_TS, v);
  set_max_hp = (i: number, v: number) => this.set(i, this.S.MAX_HP, v);
  set_hp = (i: number, v: number) => this.set(i, this.S.HP, v);
  set_hp_ts = (i: number, v: number) => this.set(i, this.S.HP_TS, v);
  set_cx = (i: number, v: number) => this.set(i, this.S.CX, v);
  set_cy = (i: number, v: number) => this.set(i, this.S.CY, v);
  set_cz = (i: number, v: number) => this.set(i, this.S.CZ, v);
  set_fvx = (i: number, v: number) => this.set(i, this.S.FVX, v);
  set_fvy = (i: number, v: number) => this.set(i, this.S.FVY, v);
  set_fvz = (i: number, v: number) => this.set(i, this.S.FVZ, v);
  set_tvx = (i: number, v: number) => this.set(i, this.S.TVX, v);
  set_tvy = (i: number, v: number) => this.set(i, this.S.TVY, v);
  set_tvz = (i: number, v: number) => this.set(i, this.S.TVZ, v);
  set_vvx = (i: number, v: number) => this.set(i, this.S.VVX, v);
  set_vvy = (i: number, v: number) => this.set(i, this.S.VVY, v);
  set_vvz = (i: number, v: number) => this.set(i, this.S.VVZ, v);
  set_vts = (i: number, v: number) => this.set(i, this.S.VTS, v);
  set_avx = (i: number, v: number) => this.set(i, this.S.AVX, v);
  set_avy = (i: number, v: number) => this.set(i, this.S.AVY, v);
  set_avz = (i: number, v: number) => this.set(i, this.S.AVZ, v);

  /** Write new ship */
  write_ship(i: number, data: {
    ship_idx: number;
    r: number; g: number; b: number;
    mass: number;
    side_guns: number; vert_guns: number; front_guns: number;
    fr: number; br: number; sr: number; vr: number;
    max_en: number; en: number; en_ts: number;
    max_hp: number; hp: number; hp_ts: number;
    cx: number; cy: number; cz: number;
    fvx: number; fvy: number; fvz: number;
    tvx: number; tvy: number; tvz: number;
    vvx: number; vvy: number; vvz: number; vts: number;
    avx: number; avy: number; avz: number;
  }) {
    const b = this.base(i);
    this.ships[b + this.S.SHIP_IDX] = data.ship_idx;
    this.ships[b + this.S.R] = data.r;
    this.ships[b + this.S.G] = data.g;
    this.ships[b + this.S.B] = data.b;
    this.ships[b + this.S.MASS] = data.mass;
    this.ships[b + this.S.SIDE_GUNS] = data.side_guns;
    this.ships[b + this.S.VERT_GUNS] = data.vert_guns;
    this.ships[b + this.S.FRONT_GUNS] = data.front_guns;
    this.ships[b + this.S.FR] = data.fr;
    this.ships[b + this.S.BR] = data.br;
    this.ships[b + this.S.SR] = data.sr;
    this.ships[b + this.S.VR] = data.vr;
    this.ships[b + this.S.MAX_EN] = data.max_en;
    this.ships[b + this.S.EN] = data.en;
    this.ships[b + this.S.EN_TS] = data.en_ts;
    this.ships[b + this.S.MAX_HP] = data.max_hp;
    this.ships[b + this.S.HP] = data.hp;
    this.ships[b + this.S.HP_TS] = data.hp_ts;
    this.ships[b + this.S.CX] = data.cx;
    this.ships[b + this.S.CY] = data.cy;
    this.ships[b + this.S.CZ] = data.cz;
    this.ships[b + this.S.FVX] = data.fvx;
    this.ships[b + this.S.FVY] = data.fvy;
    this.ships[b + this.S.FVZ] = data.fvz;
    this.ships[b + this.S.TVX] = data.tvx;
    this.ships[b + this.S.TVY] = data.tvy;
    this.ships[b + this.S.TVZ] = data.tvz;
    this.ships[b + this.S.VVX] = data.vvx;
    this.ships[b + this.S.VVY] = data.vvy;
    this.ships[b + this.S.VVZ] = data.vvz;
    this.ships[b + this.S.VTS] = data.vts;
    this.ships[b + this.S.AVX] = data.avx;
    this.ships[b + this.S.AVY] = data.avy;
    this.ships[b + this.S.AVZ] = data.avz;
  }

  /** Reset one ship slot when player exit or destroyed */
  reset_ship(i: number) {
    const b = this.base(i);
    this.ships.fill(0, b, b + this.oneship);
  }

  reset(){
    this.ships.fill(0)
  }

  update_ship_positions(now: number) {
    const base = this.base
    const ships = this.ships
    const S = this.S
    try {
  
      for (let i = 1; i < this.sizeplus; i++) {
        const b = base(i);
        if (!ships[b + S.HP]) continue; // skip dead
    
        const vts = ships[b + S.VTS]!;
        const dt = now - vts;
    
        ships[b + S.CX]! += ships[b + S.VVX]! * dt;
        ships[b + S.CY]! += ships[b + S.VVY]! * dt;
        ships[b + S.CZ]! += ships[b + S.VVZ]! * dt;
      }

    } catch (e) {
      errlog("Board unsafe update_ship_positons() error")
    }
  }

  constructor() {
    this.reset();
  }


}
