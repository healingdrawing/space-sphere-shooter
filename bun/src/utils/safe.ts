/** safe string to positive integer parser, safe_value(default 0) used in case of fail */
export function spip(raw:string | undefined, safe_value = 0){
  const x = (raw)? parseInt(raw):0
  return (x > 0)?x:safe_value
}
