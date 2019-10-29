const e30 = 1 << 30;

export class Rand {
  constructor(seed) {
    this.state = seed;
  }
  next(min = 0, max = 1) {
    return (this.nextI() / (4 * e30) * (max - min)) + min;
  }
  nextI() {
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;
    return this.state + 2 * e30;
  }
}

export function distance(xi, yi, xf, yf) {
  return Math.sqrt(Math.pow(xf - xi, 2) + Math.pow(yf - yi, 2));
}

export function transformToPixels({ x, y, zoom, CANVAS }, point, view = true) {
  if (!view) {
    x = y = 0;
    zoom = 1;
  }
  const s = {
    x:  (point.x - x) * zoom + CANVAS.width  / 2,
    y: -(point.y - y) * zoom + CANVAS.height / 2,
  };
  s.px = s.x;
  s.py = s.y;
  return s;
}

export function transformToWorld({ x, y, zoom, CANVAS }, point) {
  const s = {
    x:  (point.x - CANVAS.width  / 2) / zoom + x,
    y: -(point.y - CANVAS.height / 2) / zoom + y,
  };
  s.wx = s.x;
  s.wy = s.y;
  return s;
}

export function calculateXY(r1, r2, d1, d2) {
  /*
  create a new coordinate system (p, q) with r1 at origin and r2 at (d, 0)
  let x be the result
  let p be the projection of (x - r1) onto (r2 - r1)
  let p_hat be a unit vector directed from r1 to r2
  let q be the distance from r1 + p*p_hat to x
  then
  1) p^2 + q^2 = d1^2
  2) (p-d)^2 + q^2 = d2^2
  (1) - (2): p^2 - (p-d)^2 = d1^2 - d2^2
  => p^2 - (p^2 - 2*p*d + d^2) = d1^2 - d2^2
  => 2*p*d - d^2 = d1^2 - d2^2
  => p = (d1^2 - d2^2 + d^2) / (2*d)
  */
  const d = distance(r1.x, r1.y, r2.x, r2.y);
  const i = {};
  i.p = (Math.pow(d1, 2) - Math.pow(d2, 2) + Math.pow(d, 2)) / (2 * d);
  if (Math.abs(d1) >= Math.abs(i.p))
    i.q = Math.sqrt(Math.pow(d1, 2) - Math.pow(i.p, 2));
  else
    i.q = 0;
  // transform back to (x, y)
  const p_hat = {
    x: (r2.x - r1.x) / d,
    y: (r2.y - r1.y) / d,
  };
  const q_hat = {
    x: -p_hat.y,
    y: +p_hat.x,
  };
  const a = {
    x: r1.x + p_hat.x * i.p + q_hat.x * i.q,
    y: r1.y + p_hat.y * i.p + q_hat.y * i.q,
  };
  const b = {
    x: r1.x + p_hat.x * i.p - q_hat.x * i.q,
    y: r1.y + p_hat.y * i.p - q_hat.y * i.q,
  };
  return { a, b };
}
