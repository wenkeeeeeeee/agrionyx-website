// Every Acre: the point field. One small 2D-canvas engine shared by the hero, the numbers, the maps, the tool and
// the footer. Each point eases toward a target (lerp), shimmers at rest and parts around the cursor like wind.
export const GOLD = '#D99A12', GOLD2 = '#E8A92A', GREEN = '#3F7A3A', LEAF = '#5E9E4A', GRID = '#E6DDC8', WARM = '#1E1A14', SOIL = '#17140F';
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const phone = matchMedia('(max-width: 760px)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a, b, t) => a + (b - a) * t;
export { clamp };

// ---------- geography ----------
export const PEN = [[100.13,6.45],[100.36,6.05],[100.37,5.55],[100.42,5.2],[100.6,4.75],[100.65,4.3],[100.85,3.95],[101.05,3.6],[101.3,3.05],[101.45,2.75],[101.75,2.45],[102.1,2.2],[102.5,1.98],[102.95,1.75],[103.35,1.45],[103.5,1.27],[103.85,1.4],[104.1,1.38],[104.28,1.5],[104.15,1.95],[103.9,2.45],[103.5,2.85],[103.42,3.3],[103.42,3.8],[103.45,4.25],[103.4,4.75],[103.15,5.3],[102.75,5.75],[102.3,6.1],[102.1,6.23],[101.85,5.85],[101.55,5.85],[101.25,5.75],[101.0,5.8],[100.85,6.2],[100.6,6.45],[100.3,6.7],[100.15,6.65]];
const LAND = [
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[10,57],[5,62],[15,69],[28,71],[40,67],[60,69],[80,73],[100,77],[130,72],[160,70],[180,66],[170,60],[160,58],[155,50],[142,46],[135,43],[130,42],[127,38],[126,35],[122,31],[121,28],[119,25],[114,22],[108,21],[106,17],[109,12],[105,9],[103,10],[100,13],[100,9],[102.5,6],[103.5,4],[104.2,1.5],[103.5,1.3],[101,3],[100.3,5.5],[98.3,8],[98,16],[94,17],[92,22],[88,22],[80,15],[77,8],[73,17],[72,21],[67,25],[58,25],[56,27],[52,28],[49,30],[48,29],[50,26],[56,26],[59,23],[56,18],[52,16],[43,13],[42,16],[39,21],[35,28],[33,31],[35,36],[27,37],[26,40],[23,36],[20,40],[15,38],[16,41],[12,44],[8,44],[3,43],[-1,37],[-5,36],[-10,36]],
  [[-17,15],[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[39,18],[43,12],[51,12],[48,5],[40,-3],[40,-15],[35,-24],[32,-29],[20,-35],[18,-29],[12,-17],[13,-6],[9,4],[-8,4],[-14,9],[-17,15]],
  [[114,-22],[114,-34],[118,-35],[123,-34],[135,-35],[140,-38],[148,-38],[153,-28],[146,-19],[142,-11],[136,-12],[130,-12],[122,-17],[114,-22]],
  [[109,1],[110,-3],[116,-4],[119,1],[118,5],[116,7],[113,3],[109,1]],
  [[95,5.5],[98,4],[104,-2],[106,-6],[102,-4],[96,2],[95,5.5]],
  [[105,-6],[114,-8],[114,-7],[106,-6]],
  [[130,31],[135,34],[140,35],[142,40],[141,45],[140,41],[136,37],[132,35],[130,31]],
  [[-5,50],[1,51],[0,53],[-2,56],[-5,58],[-6,55],[-3,54],[-5,50]],
  [[120,18],[122,18],[124,13],[126,7],[122,7],[120,14]],
  [[80,6],[82,7],[81,9],[80,9]],
];
export function inPoly(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// Map projection for the peninsula, fitted into a box {x,y,w,h}.
export function mapProj(box) {
  const L0 = 99.9, L1 = 104.5, A0 = 1.1, A1 = 6.9;
  const k = Math.min(box.w / (L1 - L0), box.h / (A1 - A0));
  const ox = box.x + (box.w - (L1 - L0) * k) / 2, oy = box.y + (box.h - (A1 - A0) * k) / 2;
  return (lng, lat) => [ox + (lng - L0) * k, oy + (A1 - lat) * k];
}
// Dots that fill the peninsula (lng/lat pairs), on an even grid.
export function peninsulaDots(step = 0.11) {
  const out = [];
  for (let lat = 1.2; lat < 6.9; lat += step) for (let lng = 100; lng < 104.4; lng += step) if (inPoly(lng, lat, PEN)) out.push([lng, lat]);
  return out;
}
// Globe dots: fibonacci sphere, flagged land or sea.
export function globeDots(n) {
  const out = [], g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
    const lat = (Math.asin(y) * 180) / Math.PI, lng = ((Math.atan2(Math.sin(th) * r, Math.cos(th) * r) * 180) / Math.PI);
    out.push([lng, lat, LAND.some((p) => inPoly(lng, lat, p)) ? 1 : 0]);
  }
  return out;
}
export function ortho(lng, lat, lon0, lat0) {
  const d = Math.PI / 180, la = lat * d, lo = (lng - lon0) * d, l0 = lat0 * d;
  return [Math.cos(la) * Math.sin(lo), Math.cos(l0) * Math.sin(la) - Math.sin(l0) * Math.cos(la) * Math.cos(lo), Math.sin(l0) * Math.sin(la) + Math.cos(l0) * Math.cos(la) * Math.cos(lo)];
}
// Great-circle point between two lng/lat at u, lifted by h (fraction of radius).
export function arcPoint(a, b, u, lift = 0.22) {
  const d = Math.PI / 180;
  const v = (p) => [Math.cos(p[1] * d) * Math.cos(p[0] * d), Math.cos(p[1] * d) * Math.sin(p[0] * d), Math.sin(p[1] * d)];
  const A = v(a), B = v(b);
  const dot = clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1), om = Math.acos(dot), s = Math.sin(om) || 1;
  const k1 = Math.sin((1 - u) * om) / s, k2 = Math.sin(u * om) / s;
  const P = [A[0] * k1 + B[0] * k2, A[1] * k1 + B[1] * k2, A[2] * k1 + B[2] * k2];
  const lat = Math.asin(clamp(P[2], -1, 1)) / d, lng = Math.atan2(P[1], P[0]) / d;
  return [lng, lat, 1 + Math.sin(Math.PI * u) * lift * om];
}

// ---------- shapes ----------
let pineCache = null;
// The pineapple, sampled from the client's product photo: [{x,y (0..1, aspect kept), c, s}] with fruit gold, crown green.
export async function pineapple(n) {
  if (!pineCache) {
    const img = new Image(); img.src = 'assets/img/pine-sample.png';
    await img.decode();
    const W = img.width, H = img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, W, H).data, cand = [];
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (r + g + b < 690 && mx - mn > 28) { cand.push([x, y, r, g, b]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    pineCache = { cand, x0, x1, y0, y1 };
  }
  const { cand, x0, x1, y0, y1 } = pineCache, h = y1 - y0;
  const isCrown = ([, , r, g, b]) => g > r * 0.93 && g > b;
  const crown = cand.filter(isCrown), fruit = cand.filter((c) => !isCrown(c));
  // crown gets its share; fruit points favour the darker eye edges so the diamond pattern reads
  const nc = Math.round(n * 0.3), list = [];
  const pickFrom = (arr, k, weight) => { let guard = 0; while (k > 0 && guard++ < k * 60) { const c = arr[(Math.random() * arr.length) | 0]; if (Math.random() < weight(c)) { list.push(c); k--; } } };
  pickFrom(crown, nc, () => 1);
  pickFrom(fruit, n - nc, ([, , r, g, b]) => { const br = (r + g + b) / 765; return br < 0.42 ? 1 : br < 0.55 ? 0.55 : 0.3; });
  while (list.length < n) list.push(cand[(Math.random() * cand.length) | 0]);
  return list.map(([x, y, r, g, b]) => {
    const crown = g > r * 0.93 && g > b;
    const br = (r + g + b) / 765;
    return { x: (x - x0 - (x1 - x0) / 2) / h + (Math.random() - 0.5) * 0.006, y: (y - y0) / h - 0.5 + (Math.random() - 0.5) * 0.006,
      c: crown ? (br > 0.42 ? LEAF : GREEN) : br > 0.55 ? GOLD2 : br > 0.38 ? GOLD : '#A8700A', s: 0.75 + br * 0.9, crown };
  });
}
// The Agrionyx logo in points, coloured from the logo itself (navy AG, teal X): [{x,y (centred, / height), c}].
export async function logoPoints(n) {
  const img = new Image(); img.src = 'assets/img/logo-agx.png'; await img.decode();
  const W = img.width, H = img.height, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, W, H).data, cand = [];
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
    // the mark only (rows above the small 'Agrionyx Group' line), saturated pixels only
    if (d[i + 3] > 200 && mx - mn > 50 && y < H * 0.625) { cand.push([x, y, d[i], d[i + 1], d[i + 2]]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  const h = y1 - y0, hex = (v) => v.toString(16).padStart(2, '0');
  // even coverage: shuffle, then keep a spread-out subset
  const list = shuffle(cand.slice()).slice(0, n);
  while (list.length < n) list.push(cand[(Math.random() * cand.length) | 0]);
  return { w: (x1 - x0) / h, pts: list.map(([x, y, r, g, b]) => ({ x: (x - x0 - (x1 - x0) / 2) / h, y: (y - y0) / h - 0.5, c: `#${hex(r)}${hex(g)}${hex(b)}` })) };
}
// Fine dust from the same photo: dim texture behind the 640 points so the fruit reads at a glance.
export function pineDust(n) {
  const { cand, x0, x1, y0, y1 } = pineCache, h = y1 - y0;
  return Array.from({ length: n }, () => { const [x, y, r, g, b] = cand[(Math.random() * cand.length) | 0]; const crown = g > r * 0.93 && g > b; const br = (r + g + b) / 765;
    return { x: (x - x0 - (x1 - x0) / 2) / h, y: (y - y0) / h - 0.5, c: crown ? GREEN : br > 0.45 ? GOLD : '#A8700A', a: crown ? 0.5 : 0.22 + br * 0.36 }; });
}
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
// Text drawn in points: returns [{x,y}] in px inside a w*h box.
export function textPoints(str, w, h, n, font = '600 {s}px Unbounded') {
  const cv = document.createElement('canvas'), W = Math.ceil(w / 2), H = Math.ceil(h / 2);
  cv.width = W; cv.height = H;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  let s = H * 0.92; cx.font = font.replace('{s}', s);
  const tw = cx.measureText(str).width; if (tw > W * 0.98) { s *= (W * 0.98) / tw; cx.font = font.replace('{s}', s); }
  cx.fillStyle = '#fff'; cx.textBaseline = 'middle'; cx.fillText(str, 0, H / 2);
  const d = cx.getImageData(0, 0, W, H).data, cand = [];
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (d[(y * W + x) * 4 + 3] > 140) cand.push([x * 2, y * 2]);
  const stride = Math.max(1, Math.sqrt(cand.length / n));
  let list = cand.filter(([x, y]) => (x / 2) % Math.round(stride) === 0 && (y / 2) % Math.round(stride) === 0);
  if (list.length < n * 0.7) list = cand;
  list = shuffle(list).slice(0, n);
  return list.map(([x, y]) => ({ x, y }));
}

// ---------- the engine ----------
// new Field(canvas, { draw(ctx, t, f), wind: true }) ; f.points = [{x,y,tx,ty,c,s,a}]
export class Field {
  constructor(canvas, opts = {}) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.o = opts; this.points = []; this.t = 0; this.mouse = { x: -1e4, y: -1e4 };
    this.dpr = Math.min(devicePixelRatio || 1, phone ? 1.5 : 1.75); this.visible = true; this.lerpK = opts.lerp ?? 0.12;
    this.resize(); this.ro = new ResizeObserver(() => { this.resize(); opts.onResize?.(this); }); this.ro.observe(canvas);
    if (opts.wind !== false && matchMedia('(hover: hover)').matches) {
      const host = opts.windHost || canvas;
      host.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; });
      host.addEventListener('pointerleave', () => { this.mouse.x = this.mouse.y = -1e4; });
    }
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.loop(); }, { rootMargin: '80px' }).observe(canvas);
    this.loop = this.loop.bind(this); this.raf = 0; this.last = performance.now();
  }
  resize() {
    const r = this.cv.getBoundingClientRect(); this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(r.width * this.dpr); this.cv.height = Math.round(r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  set(points, snap = false) {
    points.forEach((p, i) => { const q = this.points[i] || (this.points[i] = { x: p.x, y: p.y, ox: 0, oy: 0, ph: Math.random() * 6.28, d: Math.random() }); Object.assign(q, { tx: p.x, ty: p.y, c: p.c || q.c || GOLD, s: p.s ?? q.s ?? 1, a: p.a ?? 1 }); if (snap) { q.x = p.x; q.y = p.y; } });
    this.points.length = points.length;
  }
  scatter() { this.points.forEach((p) => { const a = Math.random() * 6.28, r = Math.max(this.w, this.h) * (0.4 + Math.random() * 0.5); p.x = this.w / 2 + Math.cos(a) * r; p.y = this.h / 2 + Math.sin(a) * r; }); }
  loop() {
    cancelAnimationFrame(this.raf);
    if (!this.visible) return;
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.t += dt;
    const { ctx } = this, t = this.t, m = this.mouse;
    ctx.clearRect(0, 0, this.w, this.h);
    this.o.before?.(ctx, t, this);
    const k = reduce ? 1 : this.lerpK, R = this.o.windR || 110;
    for (const p of this.points) {
      if (this.o.target) this.o.target(p, t, this);
      p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k;
      // cursor wind: push away, spring back
      const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
      if (d2 < R * R) { const dd = Math.sqrt(d2) || 1, f = (1 - dd / R) * 26; p.ox += (dx / dd) * f * 0.25 + (dy / dd) * f * 0.12; p.oy += (dy / dd) * f * 0.25 - (dx / dd) * f * 0.06; }
      p.ox *= 0.9; p.oy *= 0.9;
      const sh = reduce ? 0 : Math.sin(t * 1.6 + p.ph * 3);
      const x = p.x + p.ox + (reduce ? 0 : Math.sin(t * 0.9 + p.ph) * 0.7), y = p.y + p.oy + (reduce ? 0 : Math.cos(t * 0.8 + p.ph) * 0.7);
      const a = p.a * (0.78 + sh * 0.22); if (a <= 0.01) continue;
      ctx.globalAlpha = a; ctx.fillStyle = p.c;
      const r = (this.o.size || 1.6) * p.s;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.o.after?.(ctx, t, this);
    if (!reduce || this.o.always) this.raf = requestAnimationFrame(this.loop);
  }
}
