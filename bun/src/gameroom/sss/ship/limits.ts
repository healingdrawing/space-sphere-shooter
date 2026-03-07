import { DEVLOG, devlog } from "../../../debug/debug";

/** returns x3 guns number(finally angle of shot to direction), limited by 90(degrees), and engines number(maybe use for visuals only) */
export const parse_guns = (nick: string) => {
  let digits = 0, vowels = 0, cons = 0, other = 0;
  const lower = nick.toLowerCase();
  const len = lower.length;

  for (let i = 0; i < len; i++) {
    const c = lower.charCodeAt(i);

    if (c >= 48 && c <= 57) digits++;
    else if (c === 97 || c === 101 || c === 105 || c === 111 || c === 117) vowels++;
    else if (c >= 98 && c <= 122) cons++;
    else other++;
  }

  return {
    front_guns: Math.min(digits, 90),
    side_guns: Math.min(vowels, 90),
    vert_guns: Math.min(cons, 90),
    engines: Math.min(other, 90)
  };
};

const sum_limits = (nick: string) => {
  let sd = 0, sv = 0, sc = 0, so = 0;
  const lower = nick.toLowerCase();
  const len = lower.length;

  for (let i = 0; i < len; i++) {
    const c = lower.charCodeAt(i);

    if (c >= 48 && c <= 57) sd += c;
    else if (c === 97 || c === 101 || c === 105 || c === 111 || c === 117) sv += c;
    else if (c >= 98 && c <= 122) sc += c;
    else so += c;
  }

  return { sum_digits: sd, sum_vowels: sv, sum_consonants: sc, sum_others: so };
};

export const parse_limits = (nick:string):{
  mass: number, max_lvelo:number, max_avelo:number, maccel: number, daccel: number,
  fr: number, br: number, sr: number, vr: number,
  max_en: number, max_hp: number,
} => {
  const {sum_digits, sum_vowels, sum_consonants, sum_others} = sum_limits(nick)

  if(DEVLOG) devlog("sum_digits, sum_vowels, sum_consonants, sum_others",`${sum_digits}, ${sum_vowels}, ${sum_consonants}, ${sum_others}`) //todo remove
  
  const sum_nick = sum_digits + sum_vowels + sum_consonants + sum_others //sum of nick char values

  const dscale = 1 // warning bugged to increase the difference in ship sizes, wrong proportions

  // todo implement on client side
  const mass = 1000 + sum_nick // [kg] also will be radius of core sphere [mm]
  const max_lvelo = 1 + (sum_nick + sum_others) / 1000 // [m/s]
  const max_avelo = 20 + (sum_nick - sum_others) / 1000 // [deg/s]
  const maccel = 1 * 1000 / mass * (1+sum_others)/(1+sum_nick) // [m/(s*s)]
  const daccel = 10 * 1000 / mass * (1+sum_nick)/(1+sum_others) // [deg/(s*s)]
  const fr = (mass + sum_consonants * dscale) /1000 // [m]
  const br = (mass + sum_consonants * dscale * 0.5) /1000 // [m]
  const sr = (mass + sum_vowels * dscale) /1000 // [m]
  const vr = (mass + sum_digits * dscale) /1000 // [m]
  const max_en = mass + sum_others // energy power [units]. Probably, when shot 1 unit of an energy is equals of 0.5 units of hp (when shot is maximum precised)
  const max_hp = mass + sum_others // health power [units]

 return {mass, max_lvelo, max_avelo, maccel, daccel, fr, br, sr, vr, max_en, max_hp}
}
