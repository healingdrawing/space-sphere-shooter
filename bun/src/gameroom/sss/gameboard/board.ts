import { DEVLOG, devlog, errlog, rawlog } from "../../../debug/debug";
import { USERS_MAX_NUMBER } from "../../../ram/consts";
import type { Ship } from "../types";
import { SOFF as S, SOFFSIZE } from "./enums";
import { gemm } from "./non-autistic-math/gemm";
import { gameroom } from "../../../ram/storage";
import type { GameRoomResponseMessage } from "../../base";
import { MT } from "../../../enums/mt";
import { two_ships_collision } from "./collide/obb";

export class SSSBoard {
  

  /** the world sphere diameter //todo not implemented */
  readonly size = USERS_MAX_NUMBER
  private readonly sizeplus = this.size + 1

  /** for iteration // warning up to 254 players at the moment, since Uint8Array used, and zero index not used
   * 
   * The index is uuid of player slot. The value 0 - empty, can be used again, or 1 - used by player(ws client).
   */
  players = new Uint8Array(this.sizeplus);
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
  
  get_avf = (i: number) => this.get(i, S.AVF);
  get_avf_ts = (i: number) => this.get(i, S.AVF_TS);
  get_avf_tsend = (i: number) => this.get(i, S.AVF_TSEND);
  get_avt = (i: number) => this.get(i, S.AVT);
  get_avt_ts = (i: number) => this.get(i, S.AVT_TS);
  get_avt_tsend = (i: number) => this.get(i, S.AVT_TSEND);
  get_avs = (i: number) => this.get(i, S.AVS);
  get_avs_ts = (i: number) => this.get(i, S.AVS_TS);
  get_avs_tsend = (i: number) => this.get(i, S.AVS_TSEND);

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
  
  set_avx = (i: number, v: number) => this.set(i, S.AVX, v);
  set_avy = (i: number, v: number) => this.set(i, S.AVY, v);
  set_avz = (i: number, v: number) => this.set(i, S.AVZ, v);

  set_vvx = (i: number, v: number) => this.set(i, S.VVX, v);
  set_vvy = (i: number, v: number) => this.set(i, S.VVY, v);
  set_vvz = (i: number, v: number) => this.set(i, S.VVZ, v);
  set_vts = (i: number, v: number) => this.set(i, S.V_TS, v);
  
  set_avf = (i: number, v:number) => this.set(i, S.AVF, v);
  set_avf_ts = (i: number, v:number) => this.set(i, S.AVF_TS, v);
  set_avf_tsend = (i: number, v:number) => this.set(i, S.AVF_TSEND, v);
  set_avt = (i: number, v:number) => this.set(i, S.AVT, v);
  set_avt_ts = (i: number, v:number) => this.set(i, S.AVT_TS, v);
  set_avt_tsend = (i: number, v:number) => this.set(i, S.AVT_TSEND, v);
  set_avs = (i: number, v:number) => this.set(i, S.AVS, v);
  set_avs_ts = (i: number, v:number) => this.set(i, S.AVS_TS, v);
  set_avs_tsend = (i: number, v:number) => this.set(i, S.AVS_TSEND, v);

  set_av = (i: number, v:number) => this.set(i, S.AV, v);
  set_av_ts = (i: number, v:number) => this.set(i, S.AV_TS, v);
  set_av_tsend = (i: number, v:number) => this.set(i, S.AV_TSEND, v);

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
    
    console.log(`avf:          ${this.ships[b + S.AVF]}`);
    console.log(`avf_ts:          ${this.ships[b + S.AVF_TS]}`);
    console.log(`avf_tsend:          ${this.ships[b + S.AVF_TSEND]}`);
    console.log(`avt:          ${this.ships[b + S.AVT]}`);
    console.log(`avt_ts:          ${this.ships[b + S.AVT_TS]}`);
    console.log(`avt_tsend:          ${this.ships[b + S.AVT_TSEND]}`);
    console.log(`avs:          ${this.ships[b + S.AVS]}`);
    console.log(`avs_ts:          ${this.ships[b + S.AVS_TS]}`);
    console.log(`avs_tsend:          ${this.ships[b + S.AVS_TSEND]}`);
    
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
      
      avx:           this.ships[b + S.AVX]!,
      avy:           this.ships[b + S.AVY]!,
      avz:           this.ships[b + S.AVZ]!,

      vvx:           this.ships[b + S.VVX]!,
      vvy:           this.ships[b + S.VVY]!,
      vvz:           this.ships[b + S.VVZ]!,
      v_ts:           this.ships[b + S.V_TS]!,
      
      avf: this.ships[b + S.AVF]!,
      avf_ts: this.ships[b + S.AVF_TS]!,
      avf_tsend: this.ships[b + S.AVF_TSEND]!,
      avt: this.ships[b + S.AVT]!,
      avt_ts: this.ships[b + S.AVT_TS]!,
      avt_tsend: this.ships[b + S.AVT_TSEND]!,
      avs: this.ships[b + S.AVS]!,
      avs_ts: this.ships[b + S.AVS_TS]!,
      avs_tsend: this.ships[b + S.AVS_TSEND]!,

      av: this.ships[b + S.AV]!,
      av_ts: this.ships[b + S.AV_TS]!,
      av_tsend: this.ships[b + S.AV_TSEND]!,

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
    
    this.ships[b + S.AVX] = data.avx;
    this.ships[b + S.AVY] = data.avy;
    this.ships[b + S.AVZ] = data.avz;

    this.ships[b + S.VVX] = data.vvx;
    this.ships[b + S.VVY] = data.vvy;
    this.ships[b + S.VVZ] = data.vvz;
    this.ships[b + S.V_TS] = data.v_ts;
    
    this.ships[b + S.AVF]! = data.avf;
    this.ships[b + S.AVF_TS]! = data.avf_ts;
    this.ships[b + S.AVF_TSEND]! = data.avf_tsend;
    this.ships[b + S.AVT]! = data.avt;
    this.ships[b + S.AVT_TS]! = data.avt_ts;
    this.ships[b + S.AVT_TSEND]! = data.avt_tsend;
    this.ships[b + S.AVS]! = data.avs;
    this.ships[b + S.AVS_TS]! = data.avs_ts;
    this.ships[b + S.AVS_TSEND]! = data.avs_tsend;

    this.ships[b + S.AV]! = data.av;
    this.ships[b + S.AV_TS]! = data.av_ts;
    this.ships[b + S.AV_TSEND]! = data.av_tsend;
  }

  /** Reset one ship slot when player exit or destroyed */
  reset_ship(uuid: number) {
    this.players[uuid] = 0
    const b = this.base(uuid);
    this.ships.fill(0, b, b + SOFFSIZE);
  }

  reset(){
    this.players.fill(0);
    this.ships.fill(0);
  }

  /** implements lazer shot.
   * Subtracts energy from shooter, damage hp of targets. 26 boxes around, not implemented at the moment.
   * @param uuid the shooter uuid, to subtract energy from ship.en
   * @param guns guns number(angle of beam rotation at the moment)
   * @param power requested power of for shot 0-100% of current en
   * @param en current energy units available to use
   * @param max_en maximum energy units capacity
   * @param v3 3d vector of the lazer beam front direction
   * @param v3n 3d vector of the lazer beam normal axis to rotate beam
   * @param d3 3d dot of the start of the lazer beam
  */
  lazer_shot(
    uuid:number,
    guns:number, power:number, en:number, max_en:number,
    v3:Float32Array,
    v3n:Float32Array,
    d3:Float32Array,
  ):GameRoomResponseMessage[]
  {
    const result:GameRoomResponseMessage[] = []

    if(DEVLOG) devlog("power en guns",power+" "+en+" "+guns) // todo remove
    /* damage value */
    const damage = power * en / guns * 0.5 // * 0.5 to satisfy density 0-2

    // todo refactor to not use getters/read_ship to speedup
    const s = this.read_ship(uuid)

    /** beam start dot */
    const bs = d3
    const bsx = bs[0]!
    const bsy = bs[1]!
    const bsz = bs[2]!

    /** beam front vector */
    const bfv = v3
    /** beam normal vector */
    const bnv = v3n

    /** beam side vector to rotate in vertical plane */
    const bsv = new Float32Array(3)
    gemm.v3normal(bfv,bnv, bsv)
    
    
    /* raw collision just calc distance from beam vector to center of ship. Then compare with dmax */
    
    /* ships except uuid, no 26 boxes approach at the moment */
    const p = this.players //zero index is empty always
    const lena = p.length
    for (let i=1;i<lena;i++){
      if (!p[i] || i === uuid) continue
      /** target ship to check hit */
      const t = this.read_ship(i)
      
      /** raw distance from ship center to count damage. //todo implement Ellipsoid. Not implemented */
      const r = ( Math.min( t.br, t.sr, t.vr, t.fr ) )
      /** max distance from target ship center when target ship affected by beam */
      const dmax = (2*r*r)**0.5
      
      /* todo refactor properly, first consider refactor t */
      const tc = new Float32Array( [t.cx, t.cy, t.cz])
      const tcx = tc[0]!
      const tcy = tc[1]!
      const tcz = tc[2]!

      /** vertical plane of the cross styled beam */
      const vp = new Float32Array(4)
      gemm.p3_d3v3_mut(bs,bnv, vp)
      /** horizontal plane of the cross styled beam */
      const hp = new Float32Array(4)
      gemm.p3_d3v3_mut(bs,bsv, hp)

      /** projection of the target ship to the vertical plane of the beam */
      const vp_dot = new Float32Array(3)
      gemm.d3_projection_on_p3_mut(tc, vp, vp_dot)
      const vp_dotx = vp_dot[0]!
      const vp_doty = vp_dot[1]!
      const vp_dotz = vp_dot[2]!
      /** projection of the target ship to the horizontal plane of the beam */
      const hp_dot = new Float32Array(3)
      gemm.d3_projection_on_p3_mut(tc, hp, hp_dot)
      const hp_dotx = hp_dot[0]!
      const hp_doty = hp_dot[1]!
      const hp_dotz = hp_dot[2]!
      /** distance from target ship center to vertical plane of the beam */
      let v = new Float32Array(3)
      v[0] = vp_dotx - tcx
      v[1] = vp_doty - tcy
      v[2] = vp_dotz - tcz
      const vd = gemm.v3mag(v)
      if (DEVLOG) devlog("vd:" + vd + " v:"+ v + " tc:"+tc +" vp_dot:"+vp_dot) //todo remove
      /** distance from target ship center to horizontal plane of the beam */
      v[0] = hp_dotx - tcx
      v[1] = hp_doty - tcy
      v[2] = hp_dotz - tcz
      const hd = gemm.v3mag(v)
      
      if (DEVLOG) rawlog("vd:"+vd+" dmax:"+ dmax)
      /* at the moment just in plane and close to front directions */
      /* how much hit the target ship by cross lazerbeam */
      let density = 0
      /* check affecting the target ship by two planes sequently */
      if(vd<dmax){ /* target ship damagable sphere intersects the vertical plane */
        devlog("vd<dmax")
        /* check the beam angle affects target ship sphere */
        const vp_dot_to_hp = new Float32Array(3)
        gemm.d3_projection_on_p3_mut(vp_dot, hp, vp_dot_to_hp)
        /** distance from vp_dot to hp  */
        const x = vp_dot_to_hp[0]!, y = vp_dot_to_hp[1]!, z = vp_dot_to_hp[2]!
        v[0] = vp_dotx - x
        v[1] = vp_doty - y
        v[2] = vp_dotz - z
        const d_to_hp = gemm.v3mag(v)
        /** distance from beam start to vp_dot_to_hp */
        v[0] = x - bsx
        v[1] = y - bsy
        v[2] = z - bsz
        const d_far_v = gemm.v3mag(v)
        /** limit distance from beam vector to vertical direction, depends on angle and how far target is */
        const limit = d_far_v * Math.tan(gemm.radians(guns/2)) //half of 90 max, so not more than 45
        if (DEVLOG) devlog("d_to_hp < limit:"+ (d_to_hp < limit))
        if(d_to_hp < limit) density++
      }
      /* now the similarly appropriate for horizontal plane of the beam */
      if (hd<dmax){
        const hp_dot_to_vp = new Float32Array(3)
        gemm.d3_projection_on_p3_mut(hp_dot, vp, hp_dot_to_vp)
        const x = hp_dot_to_vp[0]!, y = hp_dot_to_vp[1]!, z = hp_dot_to_vp[2]!
        v[0] = hp_dotx - x
        v[1] = hp_doty - y
        v[2] = hp_dotz - z
        const d_to_vp = gemm.v3mag(v)
        v[0] = x - bsx
        v[1] = y - bsy
        v[2] = z - bsz
        const d_far_h = gemm.v3mag(v)
        const limit = d_far_h * Math.tan(gemm.radians(guns/2))
        if(d_to_vp < limit) density++
      }

      if (!density) continue
      const thp = t.hp - damage*density
      if (DEVLOG) devlog("thp t.hp damage*density density", thp, t.hp, damage*density, density)

      if(thp >0){
        this.set_hp(i, thp)
        result.push({
          mt:MT.S,
          msg: {hit:t.idx, hp:thp},
          ms:0,
          uuids:[0]
        })
      }else{
        //todo consider implement destroy-exit as delayed action, if it will be more cases to use in parallel with gameroomresponsemessages . and delayed actions executor the similar way as tmdc
        gameroom.remove_client(t.idx, true)
      }
    }

    return result
  }

  constructor() {
    this.reset();
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
        ships[b + S.V_TS]! = now;

        //this.log_ship(i)//todo remove
      }

    } catch (e) {
      errlog("board.ts unsafe update_ship_positons() error")
    }
  }

  update_ship_rotations(now: number): void {
    try {
      for (let i = 1; i < this.sizeplus; i++) {
        const b = this.base(i);
        if (!this.ships[b + S.HP]) continue;
        // rawlog("log_ship:", this.log_ship(i)) //todo delete
          /** consider order around side, front, top . to provide persuit first numpad 7/8/9, then 4/6 horisontal . No quaternions. only vector rotate */
        this.applyAngularVelocity(b, S.AVS, now);
        this.applyAngularVelocity(b, S.AVF, now);
        this.applyAngularVelocity(b, S.AVT, now);
        this.apply_angular_velocity(b, S.AV, now);
      }
    } catch {
      errlog("update_ship_rotations error");
    }
  }
  
  private applyAngularVelocity(b: number, avOffset: number, now: number): void {
    const av = this.ships[b + avOffset]!;
    if (av === 0) return;

    const ts_offset    = avOffset + 1;   // *_TS   (last update time)
    const tsend_offset = avOffset + 2;   // *_TSEND (end time)
  
    const last_ts = this.ships[b + ts_offset]!;
    const tsend  = this.ships[b + tsend_offset]!;
  
    if (last_ts > now){
      errlog("applyAngularVelocity() last_ts > now. should not happen", last_ts, now)
      return
    }// hypotetical case of some wrong data
    if (last_ts === now){
      // if(DEVLOG) errlog("applyAngularVelocity() last_ts === now", last_ts, now) // commented because of lags. Read below apply_angular_velocity() comments
      return
    }// case of the first moment. 

    
    /** top vector */
    let t = [this.ships[b + S.TVX]!, this.ships[b + S.TVY]!, this.ships[b + S.TVZ]!]
    /** front vector */
    let f = [this.ships[b + S.FVX]!, this.ships[b + S.FVY]!, this.ships[b + S.FVZ]!]
    
    
    if (now >= tsend){
      /* case of small rotation still need to be to satisfy the ... "plan" */
      if (now > tsend){
        // rotation to difference of time
        const dt = (tsend - last_ts) / 1000;
        const angle_rad = av * dt * Math.PI / 180;
        rawlog("rotation last step: dt=",dt ," angle_rad=", angle_rad)
        this.rotate_ship(b,f,t,avOffset,angle_rad)
      }
      this.ships[b + avOffset] = 0;
      // this.ships[b + tsend_offset] = 0;
      return;
    }

    const dt = (now - last_ts) / 1000;
    
    const angle_rad = av * dt * Math.PI / 180;
    // rawlog("rotation step: dt=",dt ," angle_rad=", angle_rad)
    this.rotate_ship(b,f,t,avOffset,angle_rad)
  
    this.ships[b + ts_offset] = now;
  }

  rotate_ship(
    b:number,
    f:number[],
    t:number[],
    avOffset:number,
    angle_rad:number,    
  ){
    switch (avOffset) {
      case S.AVS:
        /** side vector */
        const s = gemm.vec3Dnormal(f,t)
        f = gemm.vecXDone(gemm.vec3Drotate(f, s, angle_rad, true)) // rotated + scaled to one
        t = gemm.vec3Dnormal(s,f) // scaled to one under the hood

        this.ships[b + S.TVX] = t[0]!;
        this.ships[b + S.TVY] = t[1]!;
        this.ships[b + S.TVZ] = t[2]!;
        this.ships[b + S.FVX] = f[0]!;
        this.ships[b + S.FVY] = f[1]!;
        this.ships[b + S.FVZ] = f[2]!;

        break;
      case S.AVF:
        t = gemm.vecXDone(gemm.vec3Drotate(t, f, angle_rad, true));
        this.ships[b + S.TVX] = t[0]!;
        this.ships[b + S.TVY] = t[1]!;
        this.ships[b + S.TVZ] = t[2]!;

        break;
      case S.AVT:
        f = gemm.vecXDone(gemm.vec3Drotate(f, t, angle_rad, true));
        this.ships[b + S.FVX] = f[0]!;
        this.ships[b + S.FVY] = f[1]!;
        this.ships[b + S.FVZ] = f[2]!;

        break;
      default:
        return;
    }
  
    
  }

  /** all ships collision detection, without 26 zones around etc.
   * Simplified to box, not a asymmetrical ellipsoid etc
   * */
  raw_ships_collider() {
    // console.log("raw_ships_collider() executed")
    const s = this.ships
    const lens = this.players.length
    
    for (let i = 1; i < lens; i++) {
      // const b = this.base(i) // calculated inside readship

      if (!s[i * SOFFSIZE]) continue;
      const s1 = this.read_ship(i) // todo refactor without read_ship and getters/setters to speedup

      for (let j = i + 1; j < lens; j++) {
        if (!s[j * SOFFSIZE]) continue;
        const s2 = this.read_ship(j)

        if (two_ships_collision(
          s1.cx, s1.cy, s1.cz,
          s1.fvx, s1.fvy, s1.fvz,
          s1.tvx, s1.tvy, s1.tvz,
          s1.fr, s1.br, s1.sr, s1.vr,
          
          s2.cx, s2.cy, s2.cz,
          s2.fvx, s2.fvy, s2.fvz,
          s2.tvx, s2.tvy, s2.tvz,
          s2.fr, s2.br, s2.sr, s2.vr,
        )) {
          const s1hp = s1.hp
          const s2hp = s2.hp
          // rawlog("collision: ",s1.idx, " ", s2.idx)
          if (s1hp > s2hp){
            this.set_hp(s1.idx, s1hp-s2hp)
            gameroom.remove_client(s2.idx, true)
          } else if (s2hp > s1hp){
            this.set_hp(s2.idx, s2hp-s1hp)
            gameroom.remove_client(s1.idx, true)
          } else {
            gameroom.remove_client(s1.idx, true)
            gameroom.remove_client(s2.idx, true)
          }

        }
      }
    }
  }

  /** random coordinate for ship spawn between 100 and 200  // todo consider implement check to avoid initial collision */
  ship_initial_random_coordinate(){
    const c = 100*(1 + Math.random()) * (Math.random()<0.5?-1:1)
    devlog("new ship random coordinate", c)
    return c
  }

  private apply_angular_velocity(b: number, avOffset: number, now: number): void {
    const av = this.ships[b + avOffset]!;
    if (av === 0) return;

    const ts_offset    = avOffset + 1;   // *_TS   (last update time)
    const tsend_offset = avOffset + 2;   // *_TSEND (end time)
  
    const last_ts = this.ships[b + ts_offset]!;
    const tsend  = this.ships[b + tsend_offset]!;
  
    if (last_ts > now){
      errlog("apply_angular_velocity() last_ts > now. should not happen", last_ts, now)
      return
    }// hypotetical case of some wrong data

    // rawlog("raw_now:", rts(), "last_ts:", last_ts);
    // warning detected repeatedly returned the same timestamp based on Date.now() . Desided just ignore it. The performance.now() is laggs and ruining everything, with huge negative numbers. It works like prealpha, so no. Integer part of performance.now() often the same, that means settimeouts ignores pauses. and setinterval can ruin the server flow under heavy loading. settimeouts will just delay, without queue. So delay + ignore is better than overload. Especially for free tier account.
    if (last_ts === now){
      // if(DEVLOG) errlog("apply_angular_velocity() last_ts === now", last_ts, now) //todo remove
      return
    }// case of the first moment. ... and more as described above

    if (now >= tsend){
      /* case of small rotation still need to be to satisfy the ... "plan" */
      if (now > tsend){
        // rotation to difference of time
        const dt = (tsend - last_ts) / 1000;
        const angle_rad = av * dt * Math.PI / 180;
        rawlog("rotation last step: dt=",dt ," angle_rad=", angle_rad)
        this.rotate_ship_around(b,avOffset,angle_rad)
      }
      this.ships[b + avOffset] = 0;
      // this.ships[b + tsend_offset] = 0;
      return;
    }

    const dt = (now - last_ts) / 1000;
    
    const angle_rad = av * dt * Math.PI / 180;
    // rawlog("rotation step: dt=",dt ," angle_rad=", angle_rad)
    this.rotate_ship_around(b,avOffset,angle_rad)
  
    this.ships[b + ts_offset] = now;
  }

  rotate_ship_around(
    b:number,
    avOffset:number,
    angle_rad:number,
  ){
    /** top vector */
    let t = [this.ships[b + S.TVX]!, this.ships[b + S.TVY]!, this.ships[b + S.TVZ]!]
    /** front vector */
    let f = [this.ships[b + S.FVX]!, this.ships[b + S.FVY]!, this.ships[b + S.FVZ]!]
    /** rotation axis */
    const axis = [this.ships[b + S.AVX]!, this.ships[b + S.AVY]!, this.ships[b + S.AVZ]!]

    switch (avOffset) {
      // case S.AVS:
      //   /** side vector */
      //   const s = gemm.vec3Dnormal(f,t)
      //   f = gemm.vecXDone(gemm.vec3Drotate(f, s, angle_rad, true)) // rotated + scaled to one
      //   t = gemm.vec3Dnormal(s,f) // scaled to one under the hood

      //   this.ships[b + S.TVX] = t[0]!;
      //   this.ships[b + S.TVY] = t[1]!;
      //   this.ships[b + S.TVZ] = t[2]!;
      //   this.ships[b + S.FVX] = f[0]!;
      //   this.ships[b + S.FVY] = f[1]!;
      //   this.ships[b + S.FVZ] = f[2]!;

      //   break;
      // case S.AVF:
      //   t = gemm.vecXDone(gemm.vec3Drotate(t, f, angle_rad, true));
      //   this.ships[b + S.TVX] = t[0]!;
      //   this.ships[b + S.TVY] = t[1]!;
      //   this.ships[b + S.TVZ] = t[2]!;

      //   break;
      // case S.AVT:
      //   f = gemm.vecXDone(gemm.vec3Drotate(f, t, angle_rad, true));
      //   this.ships[b + S.FVX] = f[0]!;
      //   this.ships[b + S.FVY] = f[1]!;
      //   this.ships[b + S.FVZ] = f[2]!;

      //   break;
      case S.AV:
        
        f = gemm.vecXDone(gemm.vec3Drotate(f, axis, angle_rad, true)) // rotated + scaled to one
        t = gemm.vecXDone(gemm.vec3Drotate(t, axis, angle_rad, true))

        this.ships[b + S.TVX] = t[0]!;
        this.ships[b + S.TVY] = t[1]!;
        this.ships[b + S.TVZ] = t[2]!;
        this.ships[b + S.FVX] = f[0]!;
        this.ships[b + S.FVY] = f[1]!;
        this.ships[b + S.FVZ] = f[2]!;
        break;
      default:
        return;
    }
  
    
  }

}
