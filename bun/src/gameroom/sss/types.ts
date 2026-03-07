/** to manage ship props.
 * The interface used instead of type, because vscode does not highlight all methods of the type,
 * and interface some bit more flexible in use.
 * */
export interface Ship {
  /** user index. It is client uuid, and in same time the limited array index */
  idx:     number;
  /** color r */
  r:            number;
  /** color g */
  g:            number;
  /** color b */
  b:            number;
  /** let it be [kg], but it is not really */
  mass:         number;
  /** max linear velocity [m/s] */
  max_lvelo: number;
  /** max angular velocity [deg/s] */
  max_avelo: number;
  /** linear acceleration [m/(s*s)] */
  maccel: number;
  /** angular acceleration [deg/(s*s)] */
  daccel: number;
  front_guns:   number;
  side_guns:    number;
  vert_guns:    number;
  engines: number;
  /** front radius [m], finally desided to /1000 in init process to shorten client/server calcs */
  fr:           number;
  /** back radius [m], finally desided to /1000 in init process to shorten client/server calcs */
  br:           number;
  /** side radius [m], finally desided to /1000 in init process to shorten client/server calcs */
  sr:           number;
  /** vertical radius [m], finally desided to / 1000 in init process to shorten client/server calcs */
  vr:           number;
  /** max energy */
  max_en:       number;
  /** current energy [unit] same as hp */
  en:           number;
  /** energy timestamp */
  en_ts:        number;
  max_hp:       number;
  /** current hp [unit] same as energy */
  hp:           number;
  /** hp timestamp */
  hp_ts:        number;
  /**  center coo */
  cx:           number;
  /**  center coo */
  cy:           number;
  /**  center coo */
  cz:           number;
  /**  front vector coo */
  fvx:          number;
  /**  front vector coo */
  fvy:          number;
  /**  front vector coo */
  fvz:          number;
  /**  top vector coo */
  tvx:          number;
  /**  top vector coo */
  tvy:          number;
  /**  top vector coo */
  tvz:          number;
  /** linear velocity vector coo */
  vvx:          number;
  /** linear velocity vector coo */
  vvy:          number;
  /** linear velocity vector coo */
  vvz:          number;
  /** velocity timestamp */
  v_ts:         number;
  
  /** angular velocity [deg/s] FRONT */
  avf: number;
  /** angular velocity FRONT timestamp [ms] */
  avf_ts: number;
  /** angular velocity FRONT END timestamp [ms] */
  avf_tsend:number;

  /** angular velocity [deg/s] TOP */
  avt: number;
  /** angular velocity TOP timestamp [ms] */
  avt_ts: number;
  /** angular velocity TOP END timestamp [ms] */
  avt_tsend:number;
  
  /** angular velocity [deg/s] SIDE */
  avs: number;
  /** angular velocity SIDE timestamp [ms] */
  avs_ts: number;
  /** angular velocity SIDE END timestamp [ms] */
  avs_tsend:number;
}

export type Frontmove = {
  uuid:number, cx:number, cy:number, cz:number, vvx:number, vvy:number, vvz:number, vts:number 
}

/** rotation around front vector */
export type FrontRotation = {
  uuid:number, avf:number, avf_ts:number, avf_tsend: number,
  fvx:number, fvy:number, fvz:number,
  tvx:number,tvy:number,tvz:number,      
}

/** rotation around top vector */
export type TopRotation = {
  uuid:number, avt:number, avt_ts:number, avt_tsend: number,
  fvx:number, fvy:number, fvz:number,
  tvx:number,tvy:number,tvz:number,      
}

/** rotation around side vector */
export type SideRotation = {
  uuid:number, avs:number, avs_ts:number, avs_tsend: number,
  fvx:number, fvy:number, fvz:number,
  tvx:number,tvy:number,tvz:number,      
}

/** lazer gun shot beam. Separatedly sent with full coordinates, to manage the delay effect */
export type LazerBeam = {
  /** ship/user index */
  uuid:number,
  /** angle degrees of the laser beam precision. The 1+. More angle less damage(but client only draw) */
  a: number,

  /** x coordinate of the distanted by 1000 lazer beam, used to manage delay visually */
  x:number,
  /** y coordinate of the distanted by 1000 lazer beam, used to manage delay visually */
  y:number,
  /** z coordinate of the distanted by 1000 lazer beam, used to manage delay visually */
  z:number,
  
  /** vector x coordinate of the normal to lazer beam direction, (to calc cross beams independently of ship mesh position) */
  nx:number,
  /** vector y coordinate of the normal to lazer beam direction, (to calc cross beams independently of ship mesh position) */
  ny:number,
  /** vector z coordinate of the normal to lazer beam direction, (to calc cross beams independently of ship mesh position) */
  nz:number,
  
}
