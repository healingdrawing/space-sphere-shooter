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
  // todo consider to refactor as common case for any rotation
  /**  angular velocity vector coo */
  avx:          number;
  /**  angular velocity vector coo */
  avy:          number;
  /**  angular velocity vector coo */
  avz:          number;

  /** linear velocity vector coo */
  vvx:          number;
  /** linear velocity vector coo */
  vvy:          number;
  /** linear velocity vector coo */
  vvz:          number;
  /** velocity timestamp */
  v_ts:         number;
  
  /** angular velocity [deg/s] */
  av: number;
  /** angular velocity timestamp [ms] */
  av_ts: number;
  /** rotation angle [deg] */
  ran: number,
  /** progress positive angle [deg]. Use Math.abs */
  pan: number,
}

export type Frontmove = {
  uuid:number, cx:number, cy:number, cz:number, vvx:number, vvy:number, vvz:number, vts:number 
}

/** rotation around front vector */
export type FrontRotation = {
  uuid:number, avf:number, avf_ts:number, avf_tsend: number,
  fvx:number, fvy:number, fvz:number, // data for synchronisation client to server orientation
  tvx:number,tvy:number,tvz:number, // data for synchronisation client to server orientation
  avx:number,avy:number,avz:number, // axis vector x y z
}

/** rotation around top vector */
export type TopRotation = {
  uuid:number, avt:number, avt_ts:number, avt_tsend: number,
  fvx:number, fvy:number, fvz:number, // data for synchronisation client to server orientation
  tvx:number,tvy:number,tvz:number, // data for synchronisation client to server orientation
  avx:number,avy:number,avz:number, // axis vector x y z
}

/** rotation around side vector */
export type SideRotation = {
  uuid:number, avs:number, avs_ts:number, avs_tsend: number,
  fvx:number, fvy:number, fvz:number, // data for synchronisation client to server orientation
  tvx:number,tvy:number,tvz:number, // data for synchronisation client to server orientation
  avx:number,avy:number,avz:number, // axis vector x y z
}

/** rotation around av(x/y/z) vector
 * @property uuid user identificator, integer index in array
 * @property av [deg/s] angular velocity of the rotation
 * @property ran [deg] rotation angle
 * @property fvx ship front vector x
 * @property fvy ship front vector y
 * @property fvz ship front vector z
 * @property tvx ship top vector x
 * @property tvy ship top vector y
 * @property tvz ship top vector z
 * @property avx ship rotation axis x
 * @property avy ship rotation axis y
 * @property avz ship rotation axis z
 */
export type Rotation = {
  uuid:number, av:number, ran: number,
  fvx:number, fvy:number, fvz:number, // data for synchronisation client to server orientation
  tvx:number,tvy:number,tvz:number, // data for synchronisation client to server orientation
  avx:number,avy:number,avz:number, // axis vector x y z, case of free axis
}

/** lazer gun shot beam. Separatedly sent with full coordinates, to manage the delay effect */
export type LazerBeam = {
  /** ship/user index */
  uuid:number,
  /** angle degrees of the laser beam precision. The 1+. More angle less damage(but client only draw) */
  a: number,
  /** displacement radius from center of ship, to visualize shot not from inside the ship model, but from distance */
  d: number,

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
