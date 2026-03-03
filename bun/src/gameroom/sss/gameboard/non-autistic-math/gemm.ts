// @ts-nocheck
// gemm.ts
class GEMM {

  /**
      return true if Float Arrays have same size
      @param a - incoming arrays
     */
      same_size_F(a:Array<Array<number>>):boolean{
        const al = a.length;
        if (al > 1){
            const size = a[0].length;
            for (let i = 1; i<al;i++){
                if (size !== a[i].length) return false
            }
        } else if (!al) return false;
        return true;
    }

  /**
     return true if vectors have same size. Bonus function. Just call same_size_F([vecXDa, vecXDb])
     @param vecXDa - vector
     @param vecXDb - vector
    */
    vecXDsamesize( vecXDa:Array<number>, vecXDb:Array<number> ){ return this.same_size_F([vecXDa, vecXDb]); }

  /**
     return vector builded uses two dots
     @param dotXDa - start dot
     @param dotXDb - end dot
    */
     vecXD(
      dotXDa:Array<number>,
      dotXDb:Array<number>
      ):Array<number>{
      let rez:Array<number> = [];
      const len = dotXDa.length
      if ( len !== dotXDb.length ) return rez;
      for (let i = 0; i<len;i++){ rez.push(dotXDb[i] - dotXDa[i]); }
      return rez;
  }

  /**
     return vector length (other names "norm" or "magnitude").
     For [2,3] return Math.sqrt((2 * 2) + (3 * 3))
     @param vecXD - incoming vector
    **/
     vecXDnorm(vecXD:Array<number>){
      let sum = 0;
      let len = vecXD.length
      for (let i=0;i<len;i++) sum += vecXD[i]**2
      return Math.sqrt(sum);
  }

  /**
     sin cos bonus function. Normalise sin cos, counted use vectors to -1...1 include boders.
     Need because sometimes (detected on python3 in the past) result of calculating sin cos
     uses vectors can be more then 1, or less then -1.
     For example 1.00000000001 etc. Just tiny correction, just for case.
     @param x - incoming sin cos value for check
    */
  sin_cos_cut(x:number) { return (x>1)?1:(x<-1)?-1:x; }

  /**
     return scalar product of vectors
     @param vecXDa - vector
     @param vecXDb - vector
    **/
  vecXDscalar(
    vecXDa:Array<number>,
    vecXDb:Array<number>
  ){
    let rez=0
    let len = vecXDa.length
    if (len === vecXDb.length){
        for (let i=0;i<len;i++) rez += vecXDa[i] * vecXDb[i];
    }return rez;
  }

  /**
     return cos between vectors
     @param vecXDa - vector
     @param vecXDb - vector
    */
     vecXDcos(
      vecXDa:Array<number>,
      vecXDb:Array<number>
      ){
      var rez = 0
      var la = this.vecXDnorm(vecXDa);
      var lb = this.vecXDnorm(vecXDb);
      if (la > 0 && lb > 0){
          rez = this.sin_cos_cut( this.vecXDscalar(vecXDa,vecXDb) / (la * lb) );
      }return rez;
  }

  /**
     convert radians angle to degrees angle value
     @param angle - radians angle for recounting
    */
  degrees(angle:number) { return angle * 180 / Math.PI; }

  /**
     convert degrees angle to radians angle value
     @param angle - degrees angle for recounting
    */
  radians(angle:number) { return angle / 180 * Math.PI; }

  /**
     return angle between vectors
     @param vecXDa - vector
     @param vecXDb - vector
     @param rad - if true then return radians angle, default false(degrees angle)
    **/
     vecXDangle(
      vecXDa:Array<number>,
      vecXDb:Array<number>,
      rad = false
      ){
      let rez = 0
      let la = this.vecXDnorm(vecXDa);
      let lb = this.vecXDnorm(vecXDb);
      if (la > 0 && lb > 0){
          rez = (rad) ? Math.acos(this.vecXDcos(vecXDa,vecXDb)):this.degrees(Math.acos(this.vecXDcos(vecXDa,vecXDb)));
      }return rez;
  }

  /**
     compare Float Arrays. Returns true if all arrays have equal data
     @param a - incoming array field
    **/
  same_xF(a:Array<Array<number>>){
      let al = a.length;
      if ( al > 0 && this.same_size_F(a) ){
          const base = a[0]
          let lv = base.length;
          for (let i=1;i<al;i++){
            const step = a[i]
              for (let j=0;j<lv;j++){
                  if (step[j] !== base[j]) return false
              }
          }
          return true;
      }
      return false;
  }

  /**
     compare vectors. Returns true if vectors have equal data
     @param vecXDa - incoming vector
     @param vecXDb - incoming vector
    **/
  vecXDsame(
      vecXDa:Array<number>,
      vecXDb:Array<number>
      ){
      if (vecXDa.length === vecXDb.length){
          return this.same_xF([vecXDa, vecXDb]);
      }return false
  }

  /**
     recount vector to length equal 1
     @param vecXD - incoming vector
    */
  vecXDone(vecXD:Array<number>):Array<number>{
    const rez:Array<number> = [];
    const lv = this.vecXDnorm(vecXD);
    if (!lv) return vecXD
    const len = vecXD.length
    for (let i=0;i<len;i++) rez.push(vecXD[i]/lv)
    return rez
  }

  /**
     return true if vectors paralleled and have same direction
     @param vecXDa - vector
     @param vecXDb - vector
    */
     vecXDparalleled_sameside(
      vecXDa:Array<number>,
      vecXDb:Array<number>
      ):boolean{
      let rez = false;
      if (vecXDa.length !== vecXDb.length){ return false }
      else if (this.vecXDangle(vecXDa,vecXDb) === 0){ rez = true; }
      else{ rez = this.vecXDsame(this.vecXDone(vecXDa), this.vecXDone(vecXDb)); }
      return rez;
  }

  /**
      multiplies each element of the Float Array by -1
      @param a - incoming array
     */
  minus_F(a:number[]){
    const len = a.length
    let rez:number[] = []
    for (let i=0;i<len;i++) rez.push(-a[i])
    return rez
  }

  /**
     return opposite vector. [1, 2, -4] return [-1, -2, 4]
     @param vecXD - vector
    */
  vecXDback(vecXD:Array<number>):Array<number>{
      return this.minus_F(vecXD);
  }

  /**
     return true if vectors paralleled and have opposite direction
     @param vecXDa - vector
     @param vecXDb - vector
    */
  vecXDparalleled_opposite(
      vecXDa:Array<number>,
      vecXDb:Array<number>
      ){
      if (vecXDa.length !== vecXDb.length){ return false }
      return this.vecXDparalleled_sameside(vecXDa,this.vecXDback(vecXDb));
  }

  /**
     return true if vectors paralleled
     @param vecXDa - vector
     @param vecXDb - vector
    */
     vecXDparalleled(
      vecXDa:Array<number>,
      vecXDb:Array<number>
      ):boolean{
      return this.vecXDparalleled_sameside(vecXDa, vecXDb) || this.vecXDparalleled_opposite(vecXDa, vecXDb);
  }

  /**
     return vector 3D, which is result of cross product of vectors (normal vector of plane based on two vectors). 
     Result vector placed so if you will see from end of result vector, then the rotating direction will be 
     CCW from vec3Da to vec3Db
     @param vec3Da - vector
     @param vec3Db - vector
  */
  vec3Dnormal(
      vec3Da:Array<number>,
      vec3Db:Array<number>
      ):Array<number>{
      
      if (vec3Da.length !== 3 || vec3Db.length !== 3) return []
  
      const a = vec3Da[1] * vec3Db[2] - vec3Da[2] * vec3Db[1];
      const b = -vec3Da[0] * vec3Db[2] + vec3Da[2] * vec3Db[0];
      const c = vec3Da[0] * vec3Db[1] - vec3Da[1] * vec3Db[0];
      return this.vecXDone([a,b,c]);
      
  }

  /**
     return dot, which result of offset dotXD along vecXD to t
     @param dotXD - dot
     @param vecXD - vector
     @param t - distance
    **/
  dotXDoffset(
    dotXD:Array<number>,
    vecXD:Array<number>,
    t:number
  ){
    const vnorm = this.vecXDnorm(vecXD);
    if (!t || !vnorm) return dotXD
    const lv = vecXD.length;
    if (dotXD.length !== lv) return dotXD
    let rez:number[] = [];
    t /= vnorm;
    for (let i=0;i<lv;i++) rez.push(dotXD[i] + vecXD[i] * t)
    return rez
  }

  /**
     returns vector 3D, rotated around axis vector to angle
     @param vec3D - vector 3D
     @param vec3Daxis - axis of rotation . vector 3D
     @param angle - angle of rotation
     @param rad - it true then radians angle, default false (degrees angle)
    */
  vec3Drotate(
    vec3D:Array<number>,
    vec3Daxis:Array<number>,
    angle:number,
    rad:boolean = false
  ):Array<number>{
    if (//warning some edge cases not managed
      angle === 0 || this.vecXDparalleled(vec3D, vec3Daxis)
    ){ return vec3D;}
    var rez:Array<number> = [];
    angle = (rad) ? angle : this.radians(angle);
    const t = [0,0,0];
    const vb = this.vec3Dnormal(vec3Daxis, vec3D);
    const vc = this.vec3Dnormal(vb, vec3Daxis);
    const t0 = this.dotXDoffset(t, vec3Daxis, this.vecXDnorm(vec3D) * this.vecXDcos(vec3Daxis, vec3D));
    var t1 = vec3D;
    var v = this.vecXD(t0, t1);
    t1 = this.dotXDoffset(t0, vb, this.vecXDnorm(v) * Math.sin(angle));
    t1 = this.dotXDoffset(t1, vc, this.vecXDnorm(v) * Math.cos(angle));
    rez = this.vecXD(t, t1);
    if (this.vecXDnorm(rez) === 0){ rez = vec3D; }
    return rez;
  }

  /**
     return dot 3D, which is intersection dot for line3D(dot3D0, vec3D0) and plane3D(vec3Dplane, dplane)
     @param dot3D0 - dot 3D start for line
     @param vec3D0 - vector 3D of line direction
     @param vec3Dplane - vector 3D, which is plane 3D normal vector
     @param dplane - displacement of plane 3D from [0,0,0]. default 0 ([0,0,0] dot belongs to the plane)
    */
dot3Dline3D_x_plane3D(
  dot3D0:Array<number>,
  vec3D0:Array<number>,
  vec3Dplane:Array<number>,
  dplane:number = 0
){
  let rez:Array<number> = [];
  const ldot = dot3D0.length;
  const lvec = vec3D0.length;
  const lplane = vec3Dplane.length;

  if (ldot !== 3 || lvec !== 3 || lplane !== 3 ) return rez
  
  const checkup = - (
    vec3Dplane[0] * dot3D0[0]
    + vec3Dplane[1] * dot3D0[1]
    + vec3Dplane[2] * dot3D0[2]
    + dplane
  );
  const checkdn = (
    vec3Dplane[0] * vec3D0[0]
    + vec3Dplane[1] * vec3D0[1]
    + vec3Dplane[2] * vec3D0[2]
  );

  if (checkdn === 0) return rez
  else if (checkup === 0) return dot3D0
  else {
      var t = checkup / checkdn;
      rez = [
        dot3D0[0] + vec3D0[0] * t,
        dot3D0[1] + vec3D0[1] * t,
        dot3D0[2] + vec3D0[2] * t,
      ]
      
  }
  
    return rez;
  }

  /**
    returns sum of Float Array elements. [1.1,2,3] -> 6.1. tested
    @param a - incoming array
  */
  sum_F(a:Array<number>){
    const al = a.length;
    if(!al) return 0
    let rez=0
    for (let i=0;i<al;i++) rez+= a[i]
    return rez
  }

  /**
    multiplies all elements of an Float Array. [1.1, 2.0, 3.0] return 1.1 * 2.0 * 3.0
    @param a - incoming array
  */
  multiply_F(a:Array<number>){
    let rez = 1
    const al = a.length;
    if (!al) return 0
    for(let i=0;i<al;i++) rez *= a[i]
    return rez
  }

  /**
    return Float Array which is result of multiplying arrays. [[3.1, 2], [3, 4]] return [3.1 * 3, 2 * 4]
    @param a - incoming arrays
  */
  multiply_xF(a:Array<Array<number>>){
    var rez:Array<number> = [];
    var alen = a.length;
    if ( !alen || !this.same_size_F(a)) return rez
    else if (alen > 1){
      const lena = a[0].length
      for(let i=0;i<lena;i++){
        const mf:number[] = []
        for(let ai=0; ai < alen ;ai++) mf.push(a[ai][i])
        rez.push(this.multiply_F(mf))
      }
    }
    return rez
  }

  /**
      Float Arrays bonus function. Short form of sum_F(multiply_xF(a)). [[a, b], [c, d]] return a * c + b * d
      @param a - incoming arrays
     **/
    multisum_xF(a:Array<Array<number>>){
        var rez = 0;
        if (
            a.length > 1 &&
            a[0].length > 0 &&
            this.same_size_F(a)
        ){
            rez = this.sum_F(this.multiply_xF(a));
        }
        return rez;
    }

  /**
     return dot 3D, which is projection of dot3D to plane3D
     @param dot3D - dot 3D, which is [x, y, z]
     @param plane3D - plane 3D, which is [a, b, c, d]. 
     Where (a, b, c) - normal vector of plane 3D. (d) - distance from (0, 0, 0). 
     if d = 0, then the plane passes through the center of coordinates
    */
    projection_dot3D_on_plane3D(
      dot3D:Array<number>,
      plane3D:Array<number>
      ){
      let rez:Array<number> = [];
      const ldot = dot3D.length;
      const lplane = plane3D.length;
      
      if (
          this.vecXDnorm([plane3D[0],plane3D[1],plane3D[2]]) === 0 ||
          ldot !== 3 ||
          lplane !== 4
          ){ return rez; }

      const pabc = [plane3D[0],plane3D[1],plane3D[2]]

      const checkup = - (this.multisum_xF([pabc, dot3D]) + plane3D[3]);
      const checkdn = this.multisum_xF([pabc, pabc]);
      if (checkdn === 0){return rez;}
      else if (checkup === 0){return dot3D;}
      else {
          const t = checkup / checkdn;
          rez = [
            dot3D[0] + plane3D[0] * t,
            dot3D[1] + plane3D[1] * t,
            dot3D[2] + plane3D[2] * t
          ]
          
      }
      return rez;
  }

  /**
     returns plane 3D (a, b, c, d) determined by dot 3D and vector 3D.
     Where (a, b, c) is plane 3D normal vector, and (d) is displacement plane from (0, 0, 0)
     @param dot3D - dot 3D
     @param vec3D - plane 3D normal vector 3D
    */
  plane3D_dot3Dnormal(
    dot3D:Array<number>,
    vec3D:Array<number>
    ):number[]
  {
    const nvec3D = this.vecXDone(vec3D)
      return (dot3D.length !== 3
          || nvec3D.length !== 3
          || this.vecXDnorm(nvec3D) === 0) ? []:
      [nvec3D[0], nvec3D[1], nvec3D[2], - this.multisum_xF([nvec3D, dot3D])];
  }

  /**
     returns plane 3D (a, b, c, d), determined by dot and two not paralleled vectors. 
     Where (a, b, c) is plane 3D normal vector, and (d) is displacement plane from (0, 0, 0)
     @param dot3D - dot 3D
     @param vec3Da - vector 3D
     @param vec3Db - vector 3D
    */
  plane3D_dot_vec_vec(
      dot3D:Array<number>,
      vec3Da:Array<number>,
      vec3Db:Array<number>
      ):Array<number>{
      return (
          dot3D.length !== 3 
          || vec3Da.length !== 3 
          || vec3Db.length !== 3 
          || this.vecXDparalleled(vec3Da, vec3Db) 
          || this.vecXDnorm(vec3Da) === 0 
          || this.vecXDnorm(vec3Db) === 0
      )?[]:
      this.plane3D_dot3Dnormal(dot3D, this.vec3Dnormal(vec3Da, vec3Db));
  }

  /**
     returns plane 3D (a, b, c, d), determined by three not equal dots. 
     Where (a, b, c) is plane 3D normal vector, and (d) is displacement plane from (0, 0, 0)
     @param dot3D - dot 3D
     @param dot3Da - dot 3D
     @param dot3Db - dot 3D
    **/
  plane3D_3dots(
      dot3D:Array<number>,
      dot3Da:Array<number>,
      dot3Db:Array<number>
      ):Array<number>{
      return (
          dot3D.length !== 3 
          || !this.same_size_F([dot3D, dot3Da, dot3Db]) 
          || this.vecXDsame(dot3D, dot3Da) 
          || this.vecXDsame(dot3D, dot3Db) 
          || this.vecXDsame(dot3Da, dot3Db)
          )?[]:
      this.plane3D_dot_vec_vec( dot3D, this.vecXD(dot3D, dot3Da), this.vecXD(dot3D, dot3Db) );
  }

  /**
     returns plane 3D (a, b, c, d), determined by two not equal dots. 
     Where (a, b, c) is plane 3D normal vector, and (d) is displacement plane from (0, 0, 0)
     @param dot3D - dot 3D (on plane)
     @param dot3Da - dot 3D (normal axis end)
    **/
  plane3D_2dots(
      dot3D:Array<number>,
      dot3Da:Array<number>
      ):Array<number>{
      return (
          !this.vecXDsamesize(dot3D, dot3Da)
          || this.vecXDsame(dot3D, dot3Da)
      )?[]:
      this.plane3D_dot3Dnormal(dot3D, this.vecXD(dot3D, dot3Da));
  }

  /**
     returns distance from dot 3D to plane 3D
     @param dot3D - dot 3D (x, y, z)
     @param plane3D - plane 3D (a, b, c, d). 
     Where (a, b, c) is plane 3D normal vector, and (d) is displacement plane from (0, 0, 0)
  */
  distance_dot3D_plane3D(
    dot3D:Array<number>,
    plane3D:Array<number>
    ){
    const pabc = [plane3D[0], plane3D[1], plane3D[2]]
    const vl = this.vecXDnorm(pabc)
    return ( dot3D.length !== 3 || plane3D.length !== 4 || !vl )?0:
    Math.abs( this.multisum_xF([pabc, dot3D]) + plane3D[3] ) / vl;
  }

  /* todo consider 3D specific below, without arrays, but only with numbers */

}

export const gemm = new GEMM()
