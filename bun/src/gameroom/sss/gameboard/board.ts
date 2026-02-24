import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { type TMDC_CellBackup } from "../types";
import { TMDC_CellState, TMDC_Owner, TMDC_DragonType, TMDC_DragonHP, TMDC_DragonMP, TMDC_DragonRange } from "../enums";
import type { TMDC_BOARD_ACTION, TMDC_BOARD_MESSAGE } from "./types";
import { GameRoomDelayedAction } from "./enums";
import { mm } from "../../../manage/message";
import { USERS_MAX_NUMBER } from "../../../ram/consts";
import { SOFF as S, SOFFSIZE } from "./enums";

export class SSSBoard {
  

  /** the world sphere diameter */
  readonly size = USERS_MAX_NUMBER
  private readonly sizeplus = this.size + 1

  ships = new Float32Array(this.sizeplus * SOFFSIZE);

  base = (i: number) => i * SOFFSIZE;
  get = (i: number, off: number) => this.ships[this.base(i) + off];
  set = (i: number, off: number, v: number) => this.ships[this.base(i) + off] = v;

  get_ship_idx = (i: number) => this.get(i, S.SHIP_IDX);
  get_R = (i: number) => this.get(i, S.R);
  get_G = (i: number) => this.get(i, S.G);
  get_B = (i: number) => this.get(i, S.B);
  get_mass = (i: number) => this.get(i, S.MASS);
  get_max_lvelo = (i: number) => this.get(i, S.MAX_LVELO);
  get_max_avelo = (i: number) => this.get(i, S.MAX_AVELO);
  get_maccel = (i: number) => this.get(i, S.MACCEL);
  get_daccel = (i: number) => this.get(i, S.DACCEL);
  get_side_guns = (i: number) => this.get(i, S.SIDE_GUNS);
  get_vert_guns = (i: number) => this.get(i, S.VERT_GUNS);
  get_front_guns = (i: number) => this.get(i, S.FRONT_GUNS);
  get_engines = (i: number) => this.get(i, S.ENGINES);
  get_fr = (i: number) => this.get(i, S.FR);
  get_br = (i: number) => this.get(i, S.BR);
  get_sr = (i: number) => this.get(i, S.SR);
  get_vr = (i: number) => this.get(i, S.VR);
  get_max_en = (i: number) => this.get(i, S.MAX_EN);
  get_en = (i: number) => this.get(i, S.EN);
  get_en_ts = (i: number) => this.get(i, S.EN_TS);
  get_max_hp = (i: number) => this.get(i, S.MAX_HP);
  get_hp = (i: number) => this.get(i, S.HP);
  get_hp_ts = (i: number) => this.get(i, S.HP_TS);
  get_cx = (i: number) => this.get(i, S.CX);
  get_cy = (i: number) => this.get(i, S.CY);
  get_cz = (i: number) => this.get(i, S.CZ);
  get_fvx = (i: number) => this.get(i, S.FVX);
  get_fvy = (i: number) => this.get(i, S.FVY);
  get_fvz = (i: number) => this.get(i, S.FVZ);
  get_tvx = (i: number) => this.get(i, S.TVX);
  get_tvy = (i: number) => this.get(i, S.TVY);
  get_tvz = (i: number) => this.get(i, S.TVZ);
  get_vvx = (i: number) => this.get(i, S.VVX);
  get_vvy = (i: number) => this.get(i, S.VVY);
  get_vvz = (i: number) => this.get(i, S.VVZ);
  get_vts = (i: number) => this.get(i, S.VTS);
  get_avx = (i: number) => this.get(i, S.AVX);
  get_avy = (i: number) => this.get(i, S.AVY);
  get_avz = (i: number) => this.get(i, S.AVZ);
  get_ats = (i: number) => this.get(i, S.ATS);

  set_ship_idx = (i: number, v: number) => this.set(i, S.SHIP_IDX, v);
  set_R = (i: number, v: number) => this.set(i, S.R, v);
  set_G = (i: number, v: number) => this.set(i, S.G, v);
  set_B = (i: number, v: number) => this.set(i, S.B, v);
  set_mass = (i: number, v: number) => this.set(i, S.MASS, v);
  set_max_lvelo = (i: number, v: number) => this.set(i, S.MAX_LVELO, v);
  set_max_avelo = (i: number, v: number) => this.set(i, S.MAX_AVELO, v);
  set_maccel = (i: number, v: number) => this.set(i, S.MACCEL, v);
  set_daccel = (i: number, v: number) => this.set(i, S.DACCEL, v);
  set_side_guns = (i: number, v: number) => this.set(i, S.SIDE_GUNS, v);
  set_vert_guns = (i: number, v: number) => this.set(i, S.VERT_GUNS, v);
  set_front_guns = (i: number, v: number) => this.set(i, S.FRONT_GUNS, v);
  set_engines = (i: number, v: number) => this.set(i, S.ENGINES, v);
  set_fr = (i: number, v: number) => this.set(i, S.FR, v);
  set_br = (i: number, v: number) => this.set(i, S.BR, v);
  set_sr = (i: number, v: number) => this.set(i, S.SR, v);
  set_vr = (i: number, v: number) => this.set(i, S.VR, v);
  set_max_en = (i: number, v: number) => this.set(i, S.MAX_EN, v);
  set_en = (i: number, v: number) => this.set(i, S.EN, v);
  set_en_ts = (i: number, v: number) => this.set(i, S.EN_TS, v);
  set_max_hp = (i: number, v: number) => this.set(i, S.MAX_HP, v);
  set_hp = (i: number, v: number) => this.set(i, S.HP, v);
  set_hp_ts = (i: number, v: number) => this.set(i, S.HP_TS, v);
  set_cx = (i: number, v: number) => this.set(i, S.CX, v);
  set_cy = (i: number, v: number) => this.set(i, S.CY, v);
  set_cz = (i: number, v: number) => this.set(i, S.CZ, v);
  set_fvx = (i: number, v: number) => this.set(i, S.FVX, v);
  set_fvy = (i: number, v: number) => this.set(i, S.FVY, v);
  set_fvz = (i: number, v: number) => this.set(i, S.FVZ, v);
  set_tvx = (i: number, v: number) => this.set(i, S.TVX, v);
  set_tvy = (i: number, v: number) => this.set(i, S.TVY, v);
  set_tvz = (i: number, v: number) => this.set(i, S.TVZ, v);
  set_vvx = (i: number, v: number) => this.set(i, S.VVX, v);
  set_vvy = (i: number, v: number) => this.set(i, S.VVY, v);
  set_vvz = (i: number, v: number) => this.set(i, S.VVZ, v);
  set_vts = (i: number, v: number) => this.set(i, S.VTS, v);
  set_avx = (i: number, v: number) => this.set(i, S.AVX, v);
  set_avy = (i: number, v: number) => this.set(i, S.AVY, v);
  set_avz = (i: number, v: number) => this.set(i, S.AVZ, v);
  set_ats = (i: number, v: number) => this.set(i, S.ATS, v);

  /** Write new ship */
  write_ship(i: number, data: {
    ship_idx: number;
    r: number; g: number; b: number;
    mass: number; max_lvelo:number; max_avelo:number; maccel:number; daccel:number;
    side_guns: number; vert_guns: number; front_guns: number; engines:number;
    fr: number; br: number; sr: number; vr: number;
    max_en: number; en: number; en_ts: number;
    max_hp: number; hp: number; hp_ts: number;
    cx: number; cy: number; cz: number;
    fvx: number; fvy: number; fvz: number;
    tvx: number; tvy: number; tvz: number;
    vvx: number; vvy: number; vvz: number; vts: number;
    avx: number; avy: number; avz: number; ats: number;
  }) {
    const b = this.base(i);
    this.ships[b + S.SHIP_IDX] = data.ship_idx;
    this.ships[b + S.R] = data.r;
    this.ships[b + S.G] = data.g;
    this.ships[b + S.B] = data.b;
    this.ships[b + S.MASS] = data.mass;
    this.ships[b + S.MAX_LVELO] = data.max_lvelo;
    this.ships[b + S.MAX_AVELO] = data.max_avelo;
    this.ships[b + S.MACCEL] = data.maccel;
    this.ships[b + S.DACCEL] = data.daccel;
    this.ships[b + S.SIDE_GUNS] = data.side_guns;
    this.ships[b + S.VERT_GUNS] = data.vert_guns;
    this.ships[b + S.FRONT_GUNS] = data.front_guns;
    this.ships[b + S.ENGINES] = data.engines;
    this.ships[b + S.FR] = data.fr;
    this.ships[b + S.BR] = data.br;
    this.ships[b + S.SR] = data.sr;
    this.ships[b + S.VR] = data.vr;
    this.ships[b + S.MAX_EN] = data.max_en;
    this.ships[b + S.EN] = data.en;
    this.ships[b + S.EN_TS] = data.en_ts;
    this.ships[b + S.MAX_HP] = data.max_hp;
    this.ships[b + S.HP] = data.hp;
    this.ships[b + S.HP_TS] = data.hp_ts;
    this.ships[b + S.CX] = data.cx;
    this.ships[b + S.CY] = data.cy;
    this.ships[b + S.CZ] = data.cz;
    this.ships[b + S.FVX] = data.fvx;
    this.ships[b + S.FVY] = data.fvy;
    this.ships[b + S.FVZ] = data.fvz;
    this.ships[b + S.TVX] = data.tvx;
    this.ships[b + S.TVY] = data.tvy;
    this.ships[b + S.TVZ] = data.tvz;
    this.ships[b + S.VVX] = data.vvx;
    this.ships[b + S.VVY] = data.vvy;
    this.ships[b + S.VVZ] = data.vvz;
    this.ships[b + S.VTS] = data.vts;
    this.ships[b + S.AVX] = data.avx;
    this.ships[b + S.AVY] = data.avy;
    this.ships[b + S.AVZ] = data.avz;
    this.ships[b + S.ATS] = data.ats;
  }

  /** Reset one ship slot when player exit or destroyed */
  reset_ship(i: number) {
    const b = this.base(i);
    this.ships.fill(0, b, b + SOFFSIZE);
  }

  reset(){
    this.ships.fill(0)
  }

  update_ship_positions(now: number) {
    const base = this.base
    const ships = this.ships
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
      errlog("board.ts unsafe update_ship_positons() error")
    }
  }

  constructor() {
    this.reset();
  }


}
