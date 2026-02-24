const vowel_regex = /[aeiou]/i
const consonant_regex =  /[b-df-hj-np-tv-z]/i
const digit_regex = /\d/
const other_regex = /[^aeiou0-9b-df-hj-np-tv-z]/i

/** returns x3 guns number(finally angle of shot to direction), limited by 90(degrees), and engines number(maybe use for visuals only) */
export const parse_guns = (nick:string) => {
  // sss-ship-properties.minder file 0-front 1-side 2-vert 3-engines(affects only visuals)
  return{
    front_guns:Math.min((nick.match(digit_regex)?.length || 0), 90),
    side_guns:Math.min((nick.match(vowel_regex)?.length || 0), 90),
    vert_guns:Math.min((nick.match(consonant_regex)?.length || 0), 90),
    engines:Math.min((nick.match(other_regex)?.length || 0), 90)
  }
}

const sum_limits = (nick:string):{
  sum_digits:number,
  sum_vowels:number,
  sum_consonants:number,
  sum_others:number
} => {
  let sum_digits = 0
  let sum_vowels = 0
  let sum_consonants = 0
  let sum_others = 0
  let digits = nick.match(digit_regex)
  let vowels = nick.match(vowel_regex)
  let consonants = nick.match(consonant_regex)
  let others = nick.match(other_regex)
  if (digits) sum_digits = sum_char_codes(digits)
  if (vowels) sum_vowels = sum_char_codes(vowels)
  if (consonants) sum_consonants = sum_char_codes(consonants)
  if (others) sum_others = sum_char_codes(others)
    
  return {sum_digits, sum_vowels, sum_consonants, sum_others}
}

function sum_char_codes(arr:RegExpMatchArray){
  let sum = 0
  let larr = arr.length
  for (let i=0;i < larr;i++){
    const c = arr[i]
    if(c) sum += c.charCodeAt(0)
  }
  return sum
}

export const parse_limits = (nick:string):{
  mass: number, max_lvelo:number, max_avelo:number, maccel: number, daccel: number,
  fr: number, br: number, sr: number, vr: number,
  max_en: number, max_hp: number,
} => {
  const {sum_digits, sum_vowels, sum_consonants, sum_others} = sum_limits(nick)
  const sum_nick = sum_digits + sum_vowels + sum_consonants + sum_others //sum of nick char values

  const mass = 1000 + sum_nick // [kg] also will be radius of core sphere [mm]
  const max_lvelo = 1 + (sum_nick + sum_others) / 1000 // [m/s]
  const max_avelo = 20 + (sum_nick - sum_others) / 1000 // [deg/s]
  const maccel = 1 * 1000 / mass * (1+sum_others)/(1+sum_nick) // [m/(s*s)]
  const daccel = 10 * 1000 / mass * (1+sum_nick)/(1+sum_others) // [deg/(s*s)]
  const fr = mass + sum_consonants // [mm]
  const br = mass + sum_consonants * 0.5 // [mm]
  const sr = mass + sum_vowels // [mm]
  const vr = mass + sum_digits // [mm]
  const max_en = mass + sum_others // energy power [units]. Probably, when shot 1 unit of an energy is equals of 0.5 units of hp (when shot is maximum precised)
  const max_hp = mass + sum_others // health power [units]

 return {mass, max_lvelo, max_avelo, maccel, daccel, fr, br, sr, vr, max_en, max_hp}
}