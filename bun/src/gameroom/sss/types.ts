/** to manage ship props */
export interface Ship {
  /** user index. It is client uuid, and in same time the limited array index */
  ship_idx:     number;
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
  /** front radius */
  fr:           number;
  /** back radius */
  br:           number;
  /** side radius */
  sr:           number;
  /** vertical radius */
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
  /** angular velocity vector coo */
  avx:          number;
  /** angular velocity vector coo */
  avy:          number;
  /** angular velocity vector coo */
  avz:          number;
  /** angular timestamp */
  a_ts:         number;
}
