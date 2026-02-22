import process from "node:process";

/** to manage decorative Debug prints using ***devlog()*** function.
 * When false, function will be ignored.
 * Keep it false for deployment case, to avoid spamming of log.
 * */
export const DEVLOG = Bun.env.DEVLOG === 'true'

/** to manage decorative Error prints using ***errlog()*** function.
 * When false, function will be ignored.
 * Keep it false for deployment case, to minimize log size(not recommended).
 * */
export const ERRLOG = Bun.env.ERRLOG === 'true'

/** Returns timestamp in format '18 July 2025 at 21:59:20' */
function timestamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC' // Adjust as needed, e.g., 'Europe/Helsinki' for EEST
  }).format(new Date()).replace(' at ', ' UTC ')
}

/** Pink colored decorated error log, for server needs.
 * Depends on ERRLOG boolean const.
 * Calls the console.error
 * @param values - is sequence of strings sent as spread operator or comma separated strings
 * */
export function errlog(...values:unknown[]){
  if (ERRLOG && values.length > 0) {
    // console.error(dprint(...values.map(v => String(v ?? "null"))))
    console.error(`\x1b[35m${dprint(true, ...values.map(v => String(v ?? "null")))}\x1b[0m`)
  }
}

/** Yellow colored development log, for server needs.
 * NOT DECORATED with frame
 * Depends on DEVLOG boolean const.
 * Calls the console.log
 * @param values - is sequence of strings sent as spread operator or comma separated strings
 * */
export function rawlog(...values:unknown[]){
  if (DEVLOG && values.length > 0) console.log(`\x1b[33m${values.join("")}\x1b[0m`)
}

/** Yellow colored decorated development log, for server needs.
 * Depends on DEVLOG boolean const.
 * Calls the console.log
 * @param values - is sequence of strings sent as spread operator or comma separated strings
 * */
export function devlog(...values:unknown[]){
  if (DEVLOG && values.length > 0) {
    // console.log(dprint(...values.map(v => String(v ?? "null"))))
    console.log(`\x1b[33m${dprint(true, ...values.map(v => String(v ?? "null")))}\x1b[0m`)
  }
}

/** decorative log, for server needs. Calls the console.log.
 * @param time_stamp - add timestamp.
 * @param values - is sequence of strings sent as spread operator or comma separated strings
 */
export function dlog(time_stamp:boolean, ...values:unknown[]){
  console.log(dprint(time_stamp, ...values.map(v => String(v ?? "null"))))
}

/** Format string to debug print in frame.
 * @param values - is sequence of strings sent as spread operator or comma separated strings
 * */
function dprint(time_stamp = true, ...values:string[]):string{
  try {
    if (time_stamp) values.unshift(timestamp())
    const terminal_w = process.stdout.columns || 80
    let s = "\n"
    let w = 0
    const vx:string[][] = [] // collect multiline strings for each value splitted by new line
    
    const valen = values.length
    for (let i=0;i<valen;i++){
      const [wv, sx] = get_wsx(values[i]!) //sx - multiline string
      w = Math.max(w, wv)
      vx.push(sx)
    }
    
    // manage too wide strings without side frames
    let huge = false
    if (w > terminal_w){
      huge = true
      w = terminal_w
    }
  
    const frame = "=".repeat(w)+"\n"
  
    if (vx.length > 0) s += frame
  
    const vxlen = vx.length
    for (let a=0;a<vxlen;a++){ // get multiline string
      const sx = vx[a]!
      const sxlen = sx.length
      for(let b=0;b<sxlen;b++){
        const one = sx[b]!
        s += ((!huge) ? center_inside(one, w) : one) + "\n"
      }
      s += frame
    }
    
    return s.trimEnd() // cut the tail  empty"new" line to avoid empty space at the end.
  } catch (error) {
    console.error("dprint failed - Decorated print error: ", error)
    return ""
  }
}

/**
 * Return tuple of
 *  - width (number)
 *  - multiline string (string[])
 * 
 * If multiline string is empty, return [0, []]
 * 
 * width - is maximum width of multiline string + 4
 * (for decoration), excluding ANSI color codes
 * 
 * multiline string is incoming string split by new line
 */
function get_wsx(s:string):[number, string[]]{
  const ansi_regex = /\x1b\[[0-9;]*m/g // Match ANSI color codes
  const clean_s = s.replace(ansi_regex, '') // Remove ANSI for width calc
  const sx = clean_s.split("\n")
  const max_width = Math.max(...sx.map(l => l.length))
  return (max_width > 0) ? [max_width + 4, s.split("\n")] : [0, []]
}

/**
 * Returns a string centered inside of a field of width `max_width`.
 * The returned string is surrounded by "=" and has a space on either side of the
 * string `s`. The string `s` is centered by adding spaces to the left and right
 * of it until it fills the full width of `max_width`.
 * @param s the string to center
 * @param max_width the maximum width of the field
 */
function center_inside(s:string, max_width:number):string{
  const ansi_regex = /\x1b\[[0-9;]*m/g // Match ANSI color codes
  const clean_s = s.replace(ansi_regex, '') // Remove ANSI for length calc
  const left = Math.floor((max_width - 4 - clean_s.length) / 2)
  const right = Math.ceil((max_width - 4 - clean_s.length) / 2)
  return "= " + " ".repeat(left) + s + " ".repeat(right) + " ="
}
