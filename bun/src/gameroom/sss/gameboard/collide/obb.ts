// todo consider to refactor without v3, only if it is faster/performant
type Vec3 = [number, number, number];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const scale = (v: Vec3, s: number): Vec3 => [v[0]*s, v[1]*s, v[2]*s];
const dot = (a: Vec3, b: Vec3): number => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm = (v: Vec3): number => Math.hypot(v[0], v[1], v[2]);
const normalize = (v: Vec3): Vec3 => {
  const l = norm(v);
  return l < 1e-8 ? [0,0,1] : scale(v, 1/l);
};

export function two_ships_collision(
  cx1: number, cy1: number, cz1: number,
  fvx1: number, fvy1: number, fvz1: number,
  tvx1: number, tvy1: number, tvz1: number,
  fr1: number, br1: number, sr1: number, vr1: number,
  cx2: number, cy2: number, cz2: number,
  fvx2: number, fvy2: number, fvz2: number,
  tvx2: number, tvy2: number, tvz2: number,
  fr2: number, br2: number, sr2: number, vr2: number
): boolean {
  // OBB1 (shifted center for fr/br asymmetry)
  const front1 = normalize([fvx1, fvy1, fvz1]);
  const tempTop1 = normalize([tvx1, tvy1, tvz1]);
  const side1 = normalize(cross(front1, tempTop1));
  const up1 = cross(side1, front1);
  const shift1 = (fr1 - br1) / 2;
  const c1: Vec3 = [cx1 + shift1 * front1[0], cy1 + shift1 * front1[1], cz1 + shift1 * front1[2]];
  const axes1: Vec3[] = [side1, up1, front1];
  const half1: Vec3 = [sr1, vr1, (fr1 + br1) / 2];

  // OBB2
  const front2 = normalize([fvx2, fvy2, fvz2]);
  const tempTop2 = normalize([tvx2, tvy2, tvz2]);
  const side2 = normalize(cross(front2, tempTop2));
  const up2 = cross(side2, front2);
  const shift2 = (fr2 - br2) / 2;
  const c2: Vec3 = [cx2 + shift2 * front2[0], cy2 + shift2 * front2[1], cz2 + shift2 * front2[2]];
  const axes2: Vec3[] = [side2, up2, front2];
  const half2: Vec3 = [sr2, vr2, (fr2 + br2) / 2];

  // 15 axes
  let allAxes: Vec3[] = [...axes1, ...axes2];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const ax = cross(axes1[i]!, axes2[j]!);
      const n = norm(ax);
      if (n > 1e-8) allAxes.push(scale(ax, 1/n));
    }
  }

  const diff = sub(c2, c1);

  for (const axis of allAxes) {
    const r1 = Math.abs(dot(axis, axes1[0]!)) * half1[0] +
               Math.abs(dot(axis, axes1[1]!)) * half1[1] +
               Math.abs(dot(axis, axes1[2]!)) * half1[2];
    const r2 = Math.abs(dot(axis, axes2[0]!)) * half2[0] +
               Math.abs(dot(axis, axes2[1]!)) * half2[1] +
               Math.abs(dot(axis, axes2[2]!)) * half2[2];
    const dist = Math.abs(dot(diff, axis));
    if (dist > r1 + r2) return false;
  }
  return true;
}

