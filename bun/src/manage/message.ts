import { MT_VALUES } from '../enums/mt'

/** message manager. To encode, decode, strigify, parse, check type */
export const mm = (() => {
  // hide
  const enc: TextEncoder = new TextEncoder()
  const dec: TextDecoder = new TextDecoder("utf-8", { fatal: true })
  
  return {
    /** encode: string -> Uint8Array */
    encode: (x: string): Uint8Array => {
      try {
        return enc.encode(x)
      } catch (e) {
        throw new Error(`Encoding failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** decode: Uint8Array -> string */
    decode: (x: Uint8Array): string => {
      try {
        return dec.decode(x)
      } catch (e) {
        throw new Error(`Decoding failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** stringify: object -> string */
    stringify: (x: object): string => {
      try {
        return JSON.stringify(x)
      } catch (e) {
        throw new Error(`JSON serialization failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** parse: string -> object */
    parse: (x: string): object => {
      try {
        return JSON.parse(x)
      } catch (e) {
        throw new Error(`JSON parsing failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** obju8a: object -> Uint8Array */
    obju8a: (x: object): Uint8Array => {
      try {
        return enc.encode(JSON.stringify(x))
      } catch (e) {
        throw new Error(`Object to Uint8Array conversion failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** strobju8a: string -> object -> Uint8Array. It is weird, but to check the object string is correct object. Otherwise just "mm.enc.encode(x)" can be used */
    strobju8a:(x: string): Uint8Array => {
      try {
        return enc.encode(JSON.stringify(JSON.parse(x)))
      } catch (e) {
        throw new Error(`String to Object to Uint8Array conversion failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** u8aobj: Uint8Array -> object */
    u8aobj: (x: Uint8Array): object => {
      try {
        return JSON.parse(dec.decode(x))
      } catch (e) {
        throw new Error(`Uint8Array to object conversion failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    },

    /** add one byte key to Uint8Array as first byte
     * @param key 0-255 number inclusive
    */
    keyu8a: (key: number, x: Uint8Array): Uint8Array => {
      const out = new Uint8Array(x.length + 1);
      out[0] = key // & 0xff;  // safe 0–255
      out.set(x, 1);
      return out;
    },

    /** when fails return -1. Also returns (x[0] || -2). The type must be first byte. F.e. '1{"data":"something"}' - example of string before encode to Uint8Array with prefix of MT */
    extract_buffer_message_type(x: Buffer) {
      console.log("buffer mt:",x)
      if (!(x instanceof Uint8Array) || x.length < 2){
        console.error("if (!(x instanceof Uint8Array) || x.length < 2). x.length:", x.length)
        return -1
      }
      const mt = (x[0] || -2)
      if (!MT_VALUES.includes(mt)){
        console.error("if (!MT_VALUES.includes(mt)):",!MT_VALUES.includes(mt), " mt:",mt)
        return -1
      }; // Check encoded message type sent from client. //todo simplify this ugly creature.
      return mt //warning unsafe speed
    },

    /** short hand for JSON.stringify(obj) */
    logobj(x:object){
      return JSON.stringify(x)
    },
    
  }
})()
