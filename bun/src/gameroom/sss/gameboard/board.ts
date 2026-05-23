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
    console.log(`ran:          ${this.ships[b + S.RAN]}`);
    console.log(`pan:          ${this.ships[b + S.PAN]}`);
    
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
      
      av: this.ships[b + S.AV]!,
      av_ts: this.ships[b + S.AV_TS]!,
      ran: this.ships[b + S.RAN]!,
      pan: this.ships[b + S.PAN]!,
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
    
    this.ships[b + S.AV]! = data.av;
    this.ships[b + S.AV_TS]! = data.av_ts;
    this.ships[b + S.RAN]! = data.ran;
    this.ships[b + S.PAN]! = data.pan;
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
   * @param bfv 3d vector. The lazer beam front vector
   * @param bnv 3d vector. The lazer beam normal vector(axis) to rotate beam
   * @param bsd 3d dot. The lazer beam start dot
  */
  lazer_shot(
    uuid:number,
    guns:number, power:number, en:number, max_en:number,
    bfv:Float32Array,
    bnv:Float32Array,
    bsd:Float32Array,
  ):GameRoomResponseMessage[]
  {
    const result:GameRoomResponseMessage[] = []

    if(DEVLOG) devlog("power en guns",power+" "+en+" "+guns) // todo remove
    /* damage value */
    const damage = power * en / guns * 0.5 // * 0.5 to satisfy density 0-2

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
      const t = this.read_ship(i) //todo refactor to exclude read_ship
      const b = this.base(i)

      //todo implement the comparison first, otherwise the damage happens in two opposite directions. Some way filter the beam direction(let it be angle between shoter center to beam start and shoter center to target center must be less than 45 degrees. But it is rough of course, since distance). Now it lags, and shoot happens two directions, but lazer beam animated only one. direction.
      
      /** raw distance from ship center to count damage. //todo implement Ellipsoid. Not implemented */

      const r = ( Math.min(
        this.ships[b + S.BR]!,
        this.ships[b + S.SR]!,
        this.ships[b + S.VR]!,
        this.ships[b + S.FR]!
      ) )
      /** max distance from target ship center when target ship affected by beam */
      const dmax = r*Math.SQRT2 // (2*r*r)**0.5 . Was tired probably :) why not r*2**0.5 (pifagor for two/doubled radii)
      
      /* todo refactor properly, first consider refactor t */
      const tc = new Float32Array( [t.cx, t.cy, t.cz])
      // const tcx = tc[0]!
      // const tcy = tc[1]!
      // const tcz = tc[2]!

      /** vertical plane of the cross styled beam */
      const vp = new Float32Array(4)
      gemm.p3_d3v3_mut(bsd,bnv, vp)
      /** horizontal plane of the cross styled beam */
      const hp = new Float32Array(4)
      gemm.p3_d3v3_mut(bsd,bsv, hp)

      /** projection of the target ship to the vertical plane of the beam */
      const vp_dot = new Float32Array(3)
      gemm.d3_projection_on_p3_mut(tc, vp, vp_dot)
      // const vp_dotx = vp_dot[0]!
      // const vp_doty = vp_dot[1]!
      // const vp_dotz = vp_dot[2]!
      /** projection of the target ship to the horizontal plane of the beam */
      const hp_dot = new Float32Array(3)
      gemm.d3_projection_on_p3_mut(tc, hp, hp_dot)
      // const hp_dotx = hp_dot[0]!
      // const hp_doty = hp_dot[1]!
      // const hp_dotz = hp_dot[2]!
      /** distance from target ship center to vertical plane of the beam */
      let v = new Float32Array(3)
      v[0] = vp_dot[0]! - tc[0]!
      v[1] = vp_dot[1]! - tc[1]!
      v[2] = vp_dot[2]! - tc[2]!
      const vd = gemm.v3mag(v)
      if (DEVLOG) devlog("vd:" + vd + " v:"+ v + " tc:"+tc +" vp_dot:"+vp_dot) //todo remove
      /** distance from target ship center to horizontal plane of the beam */
      v[0] = hp_dot[0]! - tc[0]!
      v[1] = hp_dot[1]! - tc[1]!
      v[2] = hp_dot[2]! - tc[2]!
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
        // const
        // x = vp_dot_to_hp[0]!,
        // y = vp_dot_to_hp[1]!,
        // z = vp_dot_to_hp[2]!
        v[0] = vp_dot[0]! - vp_dot_to_hp[0]!
        v[1] = vp_dot[1]! - vp_dot_to_hp[1]!
        v[2] = vp_dot[2]! - vp_dot_to_hp[2]!
        const d_to_hp = gemm.v3mag(v)
        /** distance from beam start to vp_dot_to_hp */
        v[0] = vp_dot_to_hp[0]! - bsd[0]!
        v[1] = vp_dot_to_hp[1]! - bsd[1]!
        v[2] = vp_dot_to_hp[2]! - bsd[2]!
        const d_far_v = gemm.v3mag(v)
        /** limit distance from beam vector to vertical direction, depends on angle and how far target is */
        const limit = d_far_v * Math.tan(gemm.radians(guns/2)) //half of 90 max, so not more than 45
        if (DEVLOG) devlog("d_to_hp < limit:"+ (d_to_hp < limit))
        if (d_to_hp < limit) density++
      }
      /* now the similarly appropriate for horizontal plane of the beam */
      if (hd<dmax){
        const hp_dot_to_vp = new Float32Array(3)
        gemm.d3_projection_on_p3_mut(hp_dot, vp, hp_dot_to_vp)
        // const
        // x = hp_dot_to_vp[0]!,
        // y = hp_dot_to_vp[1]!,
        // z = hp_dot_to_vp[2]!
        v[0] = hp_dot[0]! - hp_dot_to_vp[0]!
        v[1] = hp_dot[1]! - hp_dot_to_vp[1]!
        v[2] = hp_dot[2]! - hp_dot_to_vp[2]!
        const d_to_vp = gemm.v3mag(v)
        v[0] = hp_dot_to_vp[0]! - bsd[0]!
        v[1] = hp_dot_to_vp[1]! - bsd[1]!
        v[2] = hp_dot_to_vp[2]! - bsd[2]!
        const d_far_h = gemm.v3mag(v)
        const limit = d_far_h * Math.tan(gemm.radians(guns/2))
        if(d_to_vp < limit) density++
      }

      if (!density) continue
      const thp = this.ships[b + S.HP]! - damage*density
      if (DEVLOG) devlog("thp damage*density density", thp, damage*density, density)

      if(thp > 0){
        this.ships[b + S.HP] = thp
        result.push({
          mt:MT.S,
          msg: {hit:this.ships[b + S.SHIP_IDX], hp:thp},
          ms:0,
          uuids:[0]
        })
      }else{
        //todo consider beautify destroy-exit on client side, maybe with some delay. At the moment it is just kickout to home page.
        gameroom.remove_client(this.ships[b + S.SHIP_IDX]!, true)
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
        this.apply_angular_velocity(b, now);
      }
    } catch {
      errlog("update_ship_rotations error");
    }
  }

  update_one_ship_rotations(uuid:number, now: number): void {
    try {
      const b = this.base(uuid);
      if (!this.ships[b + S.HP]) return;
      this.apply_angular_velocity(b, now);
    } catch {
      errlog("update_one_ship_rotations error");
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
      
      if (!s[i * SOFFSIZE]) continue;
      const b1 = this.base(i)

      for (let j = i + 1; j < lens; j++) {
        if (!s[j * SOFFSIZE]) continue;
        const b2 = this.base(j)

        if (two_ships_collision(
          s[b1 + S.CX]!,
          s[b1 + S.CY]!,
          s[b1 + S.CZ]!,
          s[b1 + S.FVX]!,
          s[b1 + S.FVY]!,
          s[b1 + S.FVZ]!,
          s[b1 + S.TVX]!,
          s[b1 + S.TVY]!,
          s[b1 + S.TVZ]!,
          s[b1 + S.FR]!,
          s[b1 + S.BR]!,
          s[b1 + S.SR]!,
          s[b1 + S.VR]!,
          
          s[b2 + S.CX]!,
          s[b2 + S.CY]!,
          s[b2 + S.CZ]!,
          s[b2 + S.FVX]!,
          s[b2 + S.FVY]!,
          s[b2 + S.FVZ]!,
          s[b2 + S.TVX]!,
          s[b2 + S.TVY]!,
          s[b2 + S.TVZ]!,
          s[b2 + S.FR]!,
          s[b2 + S.BR]!,
          s[b2 + S.SR]!,
          s[b2 + S.VR]!,
        )) {
          const s1hp = s[b1 + S.HP]!
          const s2hp = s[b2 + S.HP]!
          // rawlog("collision: ",s1.idx, " ", s2.idx)
          if (s1hp > s2hp){
            s[b1 + S.HP] = s1hp-s2hp
            gameroom.remove_client(s[b2 + S.SHIP_IDX]!, true)
          } else if (s2hp > s1hp){
            s[b2 + S.HP] = s2hp-s1hp
            gameroom.remove_client(s[b1 + S.SHIP_IDX]!, true)
          } else {
            gameroom.remove_client(s[b1 + S.SHIP_IDX]!, true)
            gameroom.remove_client(s[b2 + S.SHIP_IDX]!, true)
          }

        }
      }
    }
  }

  /** random coordinate for ship spawn between 100 and 200  // todo consider implement check to avoid initial collision */
  ship_initial_random_coordinate(){
    const c = 100*(1 + Math.random()) * (Math.random()<0.5?-1:1)
    if(DEVLOG) devlog("new ship random coordinate", c)
    return c
  }

  private apply_angular_velocity(b: number, now: number): void {
    const av_offset = S.AV
    const av = this.ships[b + S.AV]!;
    if (av === 0) return;

    const ts_offset  = S.AV_TS;   // *_TS   (last update time)
    const ran_offset = S.RAN;   // *RAN (full rotation, abs)
    const pan_offset = S.PAN;   // *PAN (current progress, abs)
  
    const last_ts = this.ships[b + ts_offset]!;
      
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

    const ran  = this.ships[b + ran_offset]!;
    const pan  = this.ships[b + pan_offset]!;
    const dt = (now - last_ts) / 1000;
    /** potential progress */
    const pp = pan + av * dt

    if (pp >= ran){
      /* case of small rotation still need to be to satisfy the ... "plan" */
      if (pp > ran){
        // rotation to difference
        const mini_dt = ran/pp * dt;
        const angle_rad = av * mini_dt * Math.PI / 180;
        if(DEVLOG) devlog("rotation last step: mini_dt",mini_dt ," angle_rad", angle_rad) //todo remove
        this.rotate_ship_around(b, angle_rad)
      }
      this.ships[b + av_offset] = 0;
      return;
    }

    const angle_rad = av * dt * Math.PI / 180;
    // rawlog("rotation step: dt=",dt ," angle_rad=", angle_rad)
    this.rotate_ship_around(b, angle_rad)
  
    this.ships[b + ts_offset] = now;
    this.ships[b + pan_offset] = pp;
  }

  rotate_ship_around(
    b:number,
    angle_rad:number,
  ){
    //todo refactor to v3
    /** top vector */
    const t = new Float32Array(3)
    t[0] = this.ships[b + S.TVX]!
    t[1] = this.ships[b + S.TVY]!
    t[2] = this.ships[b + S.TVZ]!
    
    /** front vector */
    const f = new Float32Array(3)
    f[0] = this.ships[b + S.FVX]!
    f[1] = this.ships[b + S.FVY]!
    f[2] = this.ships[b + S.FVZ]!
    
    /** rotation axis */
    const axis = new Float32Array(3)
    axis[0] = this.ships[b + S.AVX]!
    axis[1] = this.ships[b + S.AVY]!
    axis[2] = this.ships[b + S.AVZ]!

    gemm.v3rotmut(f, axis, angle_rad)
    gemm.v3one(f)
    gemm.v3rotmut(t, axis, angle_rad)
    gemm.v3one(t)

    this.ships[b + S.TVX] = t[0]!;
    this.ships[b + S.TVY] = t[1]!;
    this.ships[b + S.TVZ] = t[2]!;
    this.ships[b + S.FVX] = f[0]!;
    this.ships[b + S.FVY] = f[1]!;
    this.ships[b + S.FVZ] = f[2]!;
    
  }

}
