import { ram } from "../ram"

/** return ram.key, and set ram.key value to zero. Only one action allowed for one key */
export function use_key(){
  const key = ram.key
  ram.key = 0
  console.warn("KEY USED:",key)
  return key
}
