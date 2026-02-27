import { errlog } from "../../../debug/debug";
import { USERS_MAX_NUMBER } from "../../../ram/consts";
import type { Ship } from "../types";
import { SOFF as S, SOFFSIZE } from "./enums";

export class SSSBoard {
  

  /** the world sphere diameter */
  readonly size = USERS_MAX_NUMBER
  private readonly sizeplus = this.size + 1

  ships = new Float32Array(this.sizeplus * SOFFSIZE);

  base = (i: number) => i * SOFFSIZE;
  get = (i: number, off: number) => this.ships[this.base(i) + off];
  set = (i: number, off: number, v: number) => this.ships[this.base(i) + off] = v;

  // warning //todo refactor later to straight way, without getters/setters, to speedup
  get_ship_idx = (i: number) => this.get(i, S.SHIP_IDX);
  get_R = (i: number) => this.get(i, S.R);
  get_G = (i: number) => this.get(i, S.G);
  get_B = (i: number) => this.get(i, S.B);
  get_mass = (i: number) => this.get(i, S.MASS);
  get_max_lvelo = (i: number) => this.get(i, S.MAX_LVELO);
  get_max_avelo = (i: number) => this.get(i, S.MAX_AVELO);
  get_maccel = (i: number) => this.get(i, S.MACCEL);
  get_daccel = (i: number) => this.get(i, S.DACCEL);
  get_front_guns = (i: number) => this.get(i, S.FRONT_GUNS);
  get_side_guns = (i: number) => this.get(i, S.SIDE_GUNS);
  get_vert_guns = (i: number) => this.get(i, S.VERT_GUNS);
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
  get_vts = (i: number) => this.get(i, S.V_TS);
  get_avx = (i: number) => this.get(i, S.AVX);
  get_avy = (i: number) => this.get(i, S.AVY);
  get_avz = (i: number) => this.get(i, S.AVZ);
  get_ats = (i: number) => this.get(i, S.A_TS);

  set_ship_idx = (i: number, v: number) => this.set(i, S.SHIP_IDX, v);
  set_R = (i: number, v: number) => this.set(i, S.R, v);
  set_G = (i: number, v: number) => this.set(i, S.G, v);
  set_B = (i: number, v: number) => this.set(i, S.B, v);
  set_mass = (i: number, v: number) => this.set(i, S.MASS, v);
  set_max_lvelo = (i: number, v: number) => this.set(i, S.MAX_LVELO, v);
  set_max_avelo = (i: number, v: number) => this.set(i, S.MAX_AVELO, v);
  set_maccel = (i: number, v: number) => this.set(i, S.MACCEL, v);
  set_daccel = (i: number, v: number) => this.set(i, S.DACCEL, v);
  set_front_guns = (i: number, v: number) => this.set(i, S.FRONT_GUNS, v);
  set_side_guns = (i: number, v: number) => this.set(i, S.SIDE_GUNS, v);
  set_vert_guns = (i: number, v: number) => this.set(i, S.VERT_GUNS, v);
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
  set_vts = (i: number, v: number) => this.set(i, S.V_TS, v);
  set_avx = (i: number, v: number) => this.set(i, S.AVX, v);
  set_avy = (i: number, v: number) => this.set(i, S.AVY, v);
  set_avz = (i: number, v: number) => this.set(i, S.AVZ, v);
  set_ats = (i: number, v: number) => this.set(i, S.A_TS, v);

  log_ship(i: number) {
    const b = this.base(i);
    console.log(`\n=== Ship ${i} ===`);
    console.log(`ship_idx:     ${this.ships[b + S.SHIP_IDX]}`);
    console.log(`r:            ${this.ships[b + S.R]}`);
    console.log(`g:            ${this.ships[b + S.G]}`);
    console.log(`b:            ${this.ships[b + S.B]}`);
    console.log(`mass:         ${this.ships[b + S.MASS]}`);
    console.log(`max_lvelo:         ${this.ships[b + S.MAX_LVELO]}`);
    console.log(`max_avelo:         ${this.ships[b + S.MAX_AVELO]}`);
    console.log(`maccel:         ${this.ships[b + S.MACCEL]}`);
    console.log(`daccel:         ${this.ships[b + S.DACCEL]}`);
    console.log(`front_guns:   ${this.ships[b + S.FRONT_GUNS]}`);
    console.log(`side_guns:    ${this.ships[b + S.SIDE_GUNS]}`);
    console.log(`vert_guns:    ${this.ships[b + S.VERT_GUNS]}`);
    console.log(`engines:    ${this.ships[b + S.ENGINES]}`);
    console.log(`fr:           ${this.ships[b + S.FR]}`);
    console.log(`br:           ${this.ships[b + S.BR]}`);
    console.log(`sr:           ${this.ships[b + S.SR]}`);
    console.log(`vr:           ${this.ships[b + S.VR]}`);
    console.log(`max_en:       ${this.ships[b + S.MAX_EN]}`);
    console.log(`en:           ${this.ships[b + S.EN]}`);
    console.log(`en_ts:        ${this.ships[b + S.EN_TS]}`);
    console.log(`max_hp:       ${this.ships[b + S.MAX_HP]}`);
    console.log(`hp:           ${this.ships[b + S.HP]}`);
    console.log(`hp_ts:        ${this.ships[b + S.HP_TS]}`);
    console.log(`cx:           ${this.ships[b + S.CX]}`);
    console.log(`cy:           ${this.ships[b + S.CY]}`);
    console.log(`cz:           ${this.ships[b + S.CZ]}`);
    console.log(`fvx:          ${this.ships[b + S.FVX]}`);
    console.log(`fvy:          ${this.ships[b + S.FVY]}`);
    console.log(`fvz:          ${this.ships[b + S.FVZ]}`);
    console.log(`tvx:          ${this.ships[b + S.TVX]}`);
    console.log(`tvy:          ${this.ships[b + S.TVY]}`);
    console.log(`tvz:          ${this.ships[b + S.TVZ]}`);
    console.log(`vvx:          ${this.ships[b + S.VVX]}`);
    console.log(`vvy:          ${this.ships[b + S.VVY]}`);
    console.log(`vvz:          ${this.ships[b + S.VVZ]}`);
    console.log(`v_ts:         ${this.ships[b + S.V_TS]}`);
    console.log(`avx:          ${this.ships[b + S.AVX]}`);
    console.log(`avy:          ${this.ships[b + S.AVY]}`);
    console.log(`avz:          ${this.ships[b + S.AVZ]}`);
    console.log(`a_ts:         ${this.ships[b + S.A_TS]}`);
    console.log("===================\n");
  }

  read_ship(i: number):Ship{
    const b = this.base(i);
    return {
      idx:     this.ships[b + S.SHIP_IDX]!,
      r:             this.ships[b + S.R]!,
      g:             this.ships[b + S.G]!,
      b:             this.ships[b + S.B]!,
      mass:          this.ships[b + S.MASS]!,
      max_lvelo:          this.ships[b + S.MAX_LVELO]!,
      max_avelo:          this.ships[b + S.MAX_AVELO]!,
      maccel:          this.ships[b + S.MACCEL]!,
      daccel:          this.ships[b + S.DACCEL]!,
      front_guns: this.ships[b + S.FRONT_GUNS]!,
      side_guns:      this.ships[b + S.SIDE_GUNS]!,
      vert_guns:  this.ships[b + S.VERT_GUNS]!,
      engines:  this.ships[b + S.ENGINES]!,
      fr:            this.ships[b + S.FR]!,
      br:            this.ships[b + S.BR]!,
      sr:            this.ships[b + S.SR]!,
      vr:            this.ships[b + S.VR]!,
      max_en:     this.ships[b + S.MAX_EN]!,
      en:        this.ships[b + S.EN]!,
      en_ts:          this.ships[b + S.EN_TS]!,
      max_hp:         this.ships[b + S.MAX_HP]!,
      hp:            this.ships[b + S.HP]!,
      hp_ts:          this.ships[b + S.HP_TS]!,
      cx:            this.ships[b + S.CX]!,
      cy:            this.ships[b + S.CY]!,
      cz:            this.ships[b + S.CZ]!,
      fvx:           this.ships[b + S.FVX]!,
      fvy:           this.ships[b + S.FVY]!,
      fvz:           this.ships[b + S.FVZ]!,
      tvx:           this.ships[b + S.TVX]!,
      tvy:           this.ships[b + S.TVY]!,
      tvz:           this.ships[b + S.TVZ]!,
      vvx:           this.ships[b + S.VVX]!,
      vvy:           this.ships[b + S.VVY]!,
      vvz:           this.ships[b + S.VVZ]!,
      v_ts:           this.ships[b + S.V_TS]!,
      avx:           this.ships[b + S.AVX]!,
      avy:           this.ships[b + S.AVY]!,
      avz:           this.ships[b + S.AVZ]!,
      a_ts:           this.ships[b + S.A_TS]!,
    };
  }

  /** Write new ship */
  write_ship(i: number, data:Ship ) {
    const b = this.base(i);
    this.ships[b + S.SHIP_IDX] = data.idx;
    this.ships[b + S.R] = data.r;
    this.ships[b + S.G] = data.g;
    this.ships[b + S.B] = data.b;
    this.ships[b + S.MASS] = data.mass;
    this.ships[b + S.MAX_LVELO] = data.max_lvelo;
    this.ships[b + S.MAX_AVELO] = data.max_avelo;
    this.ships[b + S.MACCEL] = data.maccel;
    this.ships[b + S.DACCEL] = data.daccel;
    this.ships[b + S.FRONT_GUNS] = data.front_guns;
    this.ships[b + S.SIDE_GUNS] = data.side_guns;
    this.ships[b + S.VERT_GUNS] = data.vert_guns;
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
    this.ships[b + S.V_TS] = data.v_ts;
    this.ships[b + S.AVX] = data.avx;
    this.ships[b + S.AVY] = data.avy;
    this.ships[b + S.AVZ] = data.avz;
    this.ships[b + S.A_TS] = data.a_ts;
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
    
        const vts = ships[b + S.V_TS]!;
        const dt = (now - vts)/1000;
    
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
