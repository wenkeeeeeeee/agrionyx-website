// Every Acre: site motion. Numbers drawn in points, the flow, the 2,000-acre growth set-piece, the grower's dot on the
// map, the footer pineapple, styled form controls, the menu field and the point-veil page change.
import './pages.js';
import { company } from './app.js';
import { Field, pineapple, textPoints, peninsulaDots, mapProj, globeDots, ortho, arcPoint, PEN, GOLD, GREEN, WARM, clamp, ease, lerp, phone, reduce, shuffle } from './points.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const onView = (el, fn, opts = { threshold: 0.25 }) => { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), opts); io.observe(el); };

// ---------- page change: the point veil ----------
const veil = document.createElement('div'); veil.className = 'veil'; document.body.append(veil);
requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('clear')));
addEventListener('pageshow', (e) => { if (e.persisted) veil.classList.add('clear'); });
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === '_blank') return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || a.hasAttribute('data-scroll')) return;
  if (!/\.html$|\/$/.test(u.pathname)) return;
  e.preventDefault(); veil.classList.remove('clear'); veil.classList.add('cover'); veil.style.setProperty('--vo', '1');
  setTimeout(() => { location.href = u.href; }, reduce ? 0 : 460);
});

// ---------- smooth scroll ----------
let lenis = null;
if (!reduce && window.Lenis && !phone) {
  lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  $$('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); e.stopImmediatePropagation(); lenis.scrollTo(t, { offset: 0, duration: 1.4 }); } }, true));
}
if (location.hash && $(location.hash)) setTimeout(() => $(location.hash).scrollIntoView(), 60);
// header hides on the way down, returns on the way up
let lastY = scrollY; const head = $('.head');
addEventListener('scroll', () => { const y = scrollY; head?.classList.toggle('hide', y > lastY && y > 400 && !document.documentElement.classList.contains('menu-open')); lastY = y; }, { passive: true });
// menu: lock scroll, close on Esc
new MutationObserver(() => { const open = document.documentElement.classList.contains('menu-open'); open ? lenis?.stop() : lenis?.start(); if (open) menuField(); $('.mb-t') && ($('.mb-t').textContent = open ? 'Close' : 'Menu'); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.documentElement.classList.contains('menu-open')) $('[data-menu-btn]')?.click(); });
let menuF = null;
async function menuField() {
  if (menuF) return; const cv = $('[data-menu-field]'); if (!cv) return;
  const pts = await pineapple(phone ? 260 : 520);
  menuF = new Field(cv, { size: 1.5, lerp: 0.08 });
  const place = () => { const H = menuF.h * 0.85, cx = phone ? menuF.w * 0.78 : menuF.w * 0.8; menuF.set(pts.map((q) => ({ x: cx + q.x * H, y: menuF.h * 0.52 + q.y * H, c: q.c, s: q.s, a: 0.45 }))); };
  menuF.o.onResize = place; place(); menuF.scatter(); menuF.loop();
}

// ---------- reveals ----------
$$('[data-reveal-dots]').forEach((el) => onView(el, (t) => { t.classList.add('in'); setTimeout(() => t.classList.add('done'), 1500); }, { threshold: 0.15 }));
$$('.sec-head, .flow-nodes li, .roles li, .numgrid p, .prod-more > *, .reveal-up').forEach((el, i) => { el.classList.add('reveal'); onView(el, (t) => setTimeout(() => t.classList.add('in'), (i % 4) * 90), { threshold: 0.2 }); });

// ---------- numbers drawn in points ----------
$$('[data-ptext]').forEach((cv) => {
  const big = cv.closest('.n-big');
  const f = new Field(cv, { size: big ? 1.9 : 1.35, lerp: 0.09, windR: 70 });
  let built = false;
  const build = () => {
    const n = big ? (phone ? 520 : 900) : (phone ? 200 : 340);
    const pts = textPoints(cv.dataset.ptext, f.w, f.h, n);
    f.set(pts.map((p, i) => ({ x: p.x, y: p.y, c: i % 9 === 0 ? '#8FCB72' : i % 3 ? '#F2B53A' : '#FFD27A', s: 0.8 + Math.random() * 0.5 })), reduce || built);
  };
  f.o.onResize = () => build();
  document.fonts.ready.then(() => onView(cv, () => { build(); if (!reduce) f.points.forEach((p) => { p.x = Math.random() * f.w; p.y = f.h + 20 + Math.random() * 60; }); built = true; f.loop(); }));
});

// ---------- how it flows: farm -> CPPC -> market ----------
$$('[data-flow]').forEach((cv) => {
  const N = phone ? 160 : 360; const seeds = Array.from({ length: N }, (_, i) => ({ u: Math.random(), lane: (Math.random() - 0.5), sp: 0.04 + Math.random() * 0.03, out: i % 3 === 0 ? 1 : 0 }));
  const f = new Field(cv, {
    size: 1.6, lerp: 0.25, windR: 60,
    before(ctx) {
      const w = f.w, h = f.h, y = h / 2;
      ctx.setLineDash([2, 6]); ctx.strokeStyle = 'rgba(30,26,20,.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(w * 0.04, y); ctx.lineTo(w * 0.96, y); ctx.stroke(); ctx.setLineDash([]);
      [0.165, 0.5, 0.835].forEach((x, i) => { ctx.strokeStyle = i === 1 ? GOLD : 'rgba(30,26,20,.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(w * x, y, i === 1 ? 34 : 22, 0, 6.283); ctx.stroke(); });
      ctx.font = '500 10px "Martian Mono", monospace'; ctx.fillStyle = 'rgba(30,26,20,.72)'; ctx.textAlign = 'center';
      ctx.fillText('KLIA · AIR', w * 0.835, y - 58); ctx.fillText('PORT KLANG · SEA', w * 0.835, y + 64);
      ctx.fillText('6 STATES', w * 0.165, y + 50); ctx.fillStyle = '#8A5A00'; ctx.fillText('50 T/DAY', w * 0.5, y + 62);
    },
    target(p, t) {
      const s = seeds[p.i], w = f.w, h = f.h, y0 = h / 2; const u = (s.u + t * s.sp) % 1; const x = w * (0.04 + u * 0.92);
      // spread at the farms, squeeze through the CPPC, split to air and sea
      let spread;
      if (u < 0.5) spread = lerp(h * 0.42, 6, ease(clamp(u / 0.46)));
      else spread = 6;
      let y = y0 + s.lane * spread;
      if (u > 0.55) { const k = ease(clamp((u - 0.55) / 0.25)); y = lerp(y, y0 + (s.out ? 46 : -46) + s.lane * 10, k); }
      p.tx = x; p.ty = y; p.c = u > 0.52 && s.out ? '#E8A92A' : u < 0.2 && s.lane > 0.25 ? GREEN : GOLD;
      p.a = clamp(u * 12) * clamp((1 - u) * 12);
      if (Math.abs(p.x - x) > w * 0.5) { p.x = x; p.y = y; }
    },
  });
  f.set(seeds.map(() => ({ x: 0, y: 0 })), true); f.points.forEach((p, i) => { p.i = i; }); f.loop();
});

// ---------- growth set-piece: 2,000 acres by 2028 ----------
const growth = $('[data-growth]');
if (growth) {
  const cv = $('[data-growth-canvas]', growth), gnum = $('[data-gnum]', growth), gyear = $('[data-gyear]', growth);
  const land = peninsulaDots(phone ? 0.13 : 0.085);
  const farms = company.farms;
  const MAX = phone ? 900 : 2000;
  // acre points: cluster near the six farms, spreading wider as the network grows
  const acres = shuffle(Array.from({ length: MAX }, (_, i) => {
    const fm = farms[i % 6]; const r = 0.05 + Math.pow(i / MAX, 0.6) * 0.75, a = Math.random() * 6.283;
    let lng = fm.lng + Math.cos(a) * r * Math.random(), lat = fm.lat + Math.sin(a) * r * Math.random();
    return { lng, lat, k: i / MAX };
  })).sort((a, b) => a.k - b.k);
  const years = [[2023, 180], [2024, 320], [2025, 450], [2026, 600], [2028, 2000]];
  const label = { 2023: 'pivot into pineapple', 2024: 'network expands, South Korea', 2025: 'CPPC opens, own SG1 farm', 2026: 'Agrionyx Group, 600+ acres', 2028: 'the target' };
  const gph = $('[data-gphoto]', growth), gcap = $('[data-gcap]', growth);
  const gcapT = { 2023: 'Harvest · Illustrative', 2024: '<b class="real">Real photo</b> Overseas visit', 2025: '<b class="real">Real photo</b> Our CPPC opens', 2026: '<b class="real">Real photo</b> The Agrionyx team', 2028: 'Toward 2,000 acres · Illustrative' };
  let p = 0, pS = 0;
  const f = new Field(cv, {
    size: 1.4, wind: true, windR: 90, lerp: 0.2,
    before(ctx, t) {
      pS += (p - pS) * (reduce ? 1 : 0.1);
      const w = f.w, h = f.h;
      const box = phone ? { x: w * 0.1, y: h * 0.06, w: w * 0.8, h: h * 0.5 } : { x: w * 0.5, y: h * 0.08, w: w * 0.32, h: h * 0.84 };
      const proj = mapProj(box); f.proj = proj;
      ctx.fillStyle = '#D6C9A9';
      for (const [lng, lat] of land) { const [x, y] = proj(lng, lat); ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2); }
      // growth curve of points along the right edge
      const cx0 = phone ? w * 0.08 : w * 0.84, cx1 = phone ? w * 0.92 : w * 0.97, cy0 = phone ? h * 0.6 : h * 0.86, cy1 = phone ? h * 0.42 : h * 0.18;
      const yr = (x) => (x - 2023) / 5;
      ctx.font = '500 10px "Martian Mono", monospace'; ctx.textAlign = 'center';
      years.forEach(([y, a], i) => {
        const X = lerp(cx0, cx1, yr(y)), Y = lerp(cy0, cy1, a / 2000);
        const on = pS >= i / (years.length - 1) - 0.02;
        ctx.fillStyle = on ? (y === 2028 ? GREEN : GOLD) : 'rgba(30,26,20,.25)'; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(X, Y, on ? 4 : 2.5, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(30,26,20,.72)'; ctx.fillText(String(y), X, cy0 + 22);
        if (i) { const [py, pa] = years[i - 1]; const X0 = lerp(cx0, cx1, yr(py)), Y0 = lerp(cy0, cy1, pa / 2000); const k = clamp((pS - (i - 1) / 4) * 4); for (let s = 0; s <= k; s += 0.08) { ctx.fillStyle = y === 2028 ? GREEN : GOLD; ctx.globalAlpha = y === 2028 ? 0.6 : 0.9; ctx.fillRect(lerp(X0, X, s) - 1, lerp(Y0, Y, s) - 1, 2, 2); } }
      });
      ctx.globalAlpha = 1;
    },
    target(q) {
      const a = acres[q.i]; const [x, y] = f.proj ? f.proj(a.lng, a.lat) : [0, 0];
      q.tx = x; q.ty = y;
    },
  });
  const show = (v) => {
    // acres for progress: piecewise across the years
    const seg = v * (years.length - 1), i = Math.min(years.length - 2, Math.floor(seg)), k = seg - i;
    const ac = Math.round(lerp(years[i][1], years[i + 1][1], ease(clamp(k))));
    const yIdx = Math.round(seg); const [y] = years[yIdx];
    gnum.textContent = ac.toLocaleString('en'); gyear.textContent = `${y} · ${label[y]}`;
    if (gph && gph._y !== y) { gph._y = y; gph.querySelectorAll('img').forEach((im) => im.classList.toggle('on', +im.dataset.y === y)); if (gcap) gcap.innerHTML = gcapT[y]; }
    const n = Math.round((ac / 2000) * MAX);
    f.points.forEach((q, j) => { q.a = j < n ? 1 : 0; q.c = j > (600 / 2000) * MAX ? GREEN : GOLD; });
  };
  f.set(acres.map(() => ({ x: 0, y: 0, a: 0 })), true); f.points.forEach((q, i) => { q.i = i; q.s = 0.9; });
  // start positions: points rise from the bottom of the stage
  f.points.forEach((q) => { q.x = Math.random() * 1600; q.y = 2000; });
  const onScroll = () => { const r = growth.getBoundingClientRect(), run = growth.offsetHeight - innerHeight; p = reduce ? 1 : clamp((-r.top / Math.max(1, run)) * 1.06); show(p); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll(); f.loop();
}

// ---------- farm with us: the grower's dot lights up ----------
const gmapCv = $('[data-grower-map]');
if (gmapCv) {
  const centroids = { Perlis: [100.25, 6.45], Kedah: [100.6, 6.0], Perak: [101.05, 4.6], Pahang: [102.8, 3.7], Selangor: [101.45, 3.2], 'Negeri Sembilan': [102.1, 2.75], Melaka: [102.3, 2.25], Johor: [103.4, 1.95], Kelantan: [102.0, 5.4], Terengganu: [103.0, 5.0] };
  const land = peninsulaDots(phone ? 0.14 : 0.1), farms = company.farms, cp = [company.cppc.lng, company.cppc.lat];
  const form = $('[data-wa-form="grower"]'), cap = $('[data-grower-cap]');
  let you = null, born = 0, acresN = 5;
  const net = farms.flatMap((fm, j) => Array.from({ length: 9 }, () => [fm.lng + (Math.random() - 0.5) * 0.35, fm.lat + (Math.random() - 0.5) * 0.35, j]));
  const f = new Field(gmapCv, {
    size: 1.7, lerp: 0.1, windR: 70,
    before(ctx, t) {
      const proj = mapProj({ x: 0, y: 0, w: f.w, h: f.h - 20 }); f.proj = proj;
      ctx.fillStyle = '#D6C9A9'; for (const [lng, lat] of land) { const [x, y] = proj(lng, lat); ctx.fillRect(x - 1, y - 1, 2, 2); }
      const C = proj(...cp);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.globalAlpha = 0.25;
      farms.forEach((fm) => { const P = proj(fm.lng, fm.lat); ctx.beginPath(); ctx.moveTo(...P); ctx.quadraticCurveTo((P[0] + C[0]) / 2 + 20, (P[1] + C[1]) / 2, ...C); ctx.stroke(); });
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(C[0], C[1], 9 + Math.sin(t * 2) * 2, 0, 6.283); ctx.stroke();
      ctx.font = '500 10px "Martian Mono", monospace'; ctx.fillStyle = WARM; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('CPPC', C[0] - 16, C[1]);
      if (you) {
        const Y = proj(...you), k = clamp((t - born) / 1.6);
        const r = 6 + Math.sqrt(acresN) * 1.2;
        ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9; ctx.setLineDash([3, 5]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.moveTo(...Y); const mx = (Y[0] + C[0]) / 2 - 30, my = (Y[1] + C[1]) / 2;
        for (let s = 0; s <= k; s += 0.04) { const v = 1 - s; ctx.lineTo(v * v * Y[0] + 2 * v * s * mx + s * s * C[0], v * v * Y[1] + 2 * v * s * my + s * s * C[1]); }
        ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i < 3; i++) { const ph = ((t * 0.6 + i / 3) % 1); ctx.globalAlpha = (1 - ph) * 0.6; ctx.beginPath(); ctx.arc(Y[0], Y[1], r + ph * 40, 0, 6.283); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = GREEN; ctx.shadowColor = GREEN; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(Y[0], Y[1], r * clamp(k * 3), 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = WARM; ctx.textAlign = 'left'; ctx.fillText('YOUR FARM', Y[0] + r + 10, Y[1]);
      }
    },
    target(q) { const n = net[q.i]; if (!f.proj) return; const [x, y] = f.proj(n[0], n[1]); q.tx = x; q.ty = y; },
  });
  f.set(net.map((n, i) => ({ x: 0, y: 0, c: i % 4 ? GOLD : GREEN })), true); f.points.forEach((q, i) => { q.i = i; }); f.scatter();
  onView(gmapCv, () => f.loop(), { threshold: 0.1 });
  const light = () => {
    const st = form.elements.state.value, a = +form.elements.acres.value || 1; acresN = a;
    const c = centroids[st];
    if (c && (!you || you[0] !== c[0])) { you = c; born = f.t; }
    if (!c) you = null;
    cap.textContent = c ? `${a} acre${a > 1 ? 's' : ''} in ${st} joins 50+ growers and 600+ acres` : 'Pick a state in the Peninsula to see your farm join the network';
  };
  form.addEventListener('wa-update', light); light();
}

// ---------- footer: points regather into the pineapple ----------
$$('[data-foot-pine]').forEach(async (cv) => {
  const pts = await pineapple(phone ? 300 : 560);
  const f = new Field(cv, { size: 1.6, lerp: 0.06, windR: 110 });
  const place = (snap) => { const H = Math.min(f.h * 0.92, f.w * 1.2), cx = f.w / 2, cy = f.h / 2; f.set(pts.map((q) => ({ x: cx + q.x * H, y: cy + q.y * H, c: q.c, s: q.s })), snap); };
  f.o.onResize = () => place(false);
  place(true); f.scatter();
  onView(cv, () => { if (!reduce) { f.scatter(); } f.loop(); }, { threshold: 0.2 });
});

// ---------- inner-page hero art: data-art="pineapple|map|globe|flow" ----------
$$('[data-art]').forEach(async (cv) => {
  const kind = cv.dataset.art;
  const withPhoto = !!cv.parentElement.querySelector('.ph-photo');
  if (withPhoto && phone) { cv.remove(); return; }
  const f = new Field(cv, { size: 1.6, lerp: 0.09, windR: 110, windHost: cv.parentElement });
  const full = cv.hasAttribute('data-full');
  const box = () => (full ? { x: 0, y: 0, w: f.w, h: f.h } : withPhoto ? (phone ? { x: f.w * 0.46, y: f.h * 0.1, w: f.w * 0.5, h: f.h * 0.3 } : { x: f.w * 0.465, y: f.h * 0.12, w: f.w * 0.15, h: f.h * 0.8 }) : phone ? { x: f.w * 0.1, y: f.h * 0.06, w: f.w * 0.8, h: f.h * 0.48 } : { x: f.w * 0.52, y: f.h * 0.1, w: f.w * 0.42, h: f.h * 0.82 });
  let place;
  if (kind === 'pineapple') {
    const pts = await pineapple(phone ? 320 : 600);
    place = () => { const b = box(), H = b.h * 0.95; f.set(pts.map((q) => ({ x: b.x + b.w / 2 + q.x * H, y: b.y + b.h / 2 + q.y * H, c: q.c, s: q.s }))); };
  } else if (kind === 'map') {
    const land = peninsulaDots(phone ? 0.15 : 0.11), farms = company.farms;
    place = () => { const pr = mapProj(box()); f.set(land.map(([lng, lat]) => { const near = farms.some((fm) => Math.hypot(fm.lng - lng, fm.lat - lat) < 0.32); const P = pr(lng, lat); return { x: P[0], y: P[1], c: near ? GOLD : '#BFAF8A', s: near ? 1.15 : 0.9, a: near ? 1 : 0.9 }; })); };
  } else if (kind === 'globe') {
    const g = globeDots(phone ? 1400 : 2600).filter((d) => d[2] || Math.random() < 0.5);
    f.o.target = (q, t) => { const d = g[q.i], b = box(), R = Math.min(b.w, b.h) / 2; const [x, y, z] = ortho(d[0], d[1], 80 + t * 4, 14); q.tx = b.x + b.w / 2 + x * R; q.ty = b.y + b.h / 2 - y * R; q.a = z > 0 ? (d[2] ? 0.4 + z * 0.6 : 0.25) : 0; };
    place = () => { f.set(g.map((d) => ({ x: 0, y: 0, c: d[2] ? '#6E6046' : '#CDBF9F', s: d[2] ? 0.8 : 0.6 }))); f.points.forEach((q, i) => { q.i = i; }); };
    const mk = company.markets, MY = [company.cppc.lng, company.cppc.lat];
    f.o.after = (ctx, t) => { const b = box(), R = Math.min(b.w, b.h) * (full ? 0.4 : 0.5); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.7; mk.forEach((m, i) => { const d = clamp(t * 0.5 - i * 0.15); ctx.beginPath(); for (let u = 0; u <= d; u += 0.03) { const [lng, lat, l] = arcPoint(MY, [m.lng, m.lat], u); const [x, y] = ortho(lng, lat, 80 + t * 4, 14); const X = b.x + b.w / 2 + x * R * l, Y = b.y + b.h / 2 - y * R * l; u ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); }); ctx.globalAlpha = 1; };
  } else {
    const txt = kind.replace(/^text:/, '');
    place = () => { const b = box(), th = txt.length <= 2 ? b.h * 0.9 : b.h * 0.5; const pts = textPoints(txt, b.w, th, phone ? 400 : 800); const mx = Math.max(...pts.map((q) => q.x)), mn = Math.min(...pts.map((q) => q.x)); const off = b.x + (b.w - (mx - mn)) / 2 - mn; f.set(pts.map((p, i) => ({ x: off + p.x, y: b.y + (b.h - th) / 2 + p.y, c: i % 7 ? GOLD : GREEN }))); };
  }
  f.o.onResize = place; await document.fonts.ready; place(); if (!reduce) f.scatter(); f.loop();
});

// ---------- styled controls: chips for short lists, a listbox for long ones, month chips ----------
$$('.wa-form').forEach((form) => {
  $$('select', form).forEach((sel) => {
    const opts = [...sel.options].map((o) => o.value);
    const fire = () => { sel.dispatchEvent(new Event('change', { bubbles: true })); };
    if (opts.length <= 8) {
      const wrap = document.createElement('div'); wrap.className = 'chips'; wrap.setAttribute('role', 'radiogroup');
      wrap.innerHTML = opts.map((v) => `<button type="button" class="chip" role="radio" aria-checked="${v === sel.value}" data-v="${v.replace(/"/g, '&quot;')}">${v}</button>`).join('');
      wrap.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; sel.value = b.dataset.v; $$('.chip', wrap).forEach((c) => c.setAttribute('aria-checked', String(c === b))); fire(); });
      sel.after(wrap);
      sel.addEventListener('sync', () => $$('.chip', wrap).forEach((c) => c.setAttribute('aria-checked', String(c.dataset.v === sel.value))));
    } else {
      const lb = document.createElement('div'); lb.className = 'lb';
      lb.innerHTML = `<button type="button" class="lb-btn" aria-haspopup="listbox" aria-expanded="false">${sel.value}</button><ul class="lb-list" role="listbox" tabindex="-1" hidden>${opts.map((v) => `<li role="option" aria-selected="${v === sel.value}">${v}</li>`).join('')}</ul>`;
      sel.after(lb);
      const btn = $('.lb-btn', lb), list = $('.lb-list', lb), items = $$('li', list); let act = 0;
      const open = (o) => { list.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) { act = Math.max(0, opts.indexOf(sel.value)); mark(); list.focus(); } };
      const mark = () => items.forEach((li, i) => li.classList.toggle('act', i === act));
      const pick = (i) => { sel.value = opts[i]; btn.textContent = opts[i]; items.forEach((li, j) => li.setAttribute('aria-selected', String(i === j))); open(false); btn.focus(); fire(); };
      btn.addEventListener('click', () => open(list.hidden));
      items.forEach((li, i) => li.addEventListener('click', () => pick(i)));
      list.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { act = Math.min(items.length - 1, act + 1); mark(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { act = Math.max(0, act - 1); mark(); e.preventDefault(); }
        else if (e.key === 'Enter') { pick(act); e.preventDefault(); }
        else if (e.key === 'Escape') { open(false); btn.focus(); }
        else if (e.key.length === 1) { const i = opts.findIndex((v) => v.toLowerCase().startsWith(e.key.toLowerCase())); if (i >= 0) { act = i; mark(); items[i].scrollIntoView({ block: 'nearest' }); } }
      });
      document.addEventListener('click', (e) => { if (!lb.contains(e.target)) open(false); });
    }
  });
  // month: chips of the next six months
  const m = form.elements.start;
  if (m && m.type === 'month') {
    const wrap = document.createElement('div'); wrap.className = 'chips'; wrap.setAttribute('role', 'radiogroup');
    const d = new Date(); const ms = Array.from({ length: 6 }, (_, i) => new Date(d.getFullYear(), d.getMonth() + 1 + i, 1));
    wrap.innerHTML = ms.map((x) => `<button type="button" class="chip" role="radio" aria-checked="false" data-v="${x.toLocaleString('en', { month: 'long', year: 'numeric' })}">${x.toLocaleString('en', { month: 'short' })} ${String(x.getFullYear()).slice(2)}</button>`).join('');
    m.type = 'hidden'; m.after(wrap);
    wrap.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; const on = b.getAttribute('aria-checked') !== 'true'; $$('.chip', wrap).forEach((c) => c.setAttribute('aria-checked', 'false')); b.setAttribute('aria-checked', String(on)); m.value = on ? b.dataset.v : ''; form.dispatchEvent(new Event('input', { bubbles: true })); });
  }
  // steppers: minus disabled at the minimum
  $$('.stepper', form).forEach((s) => { const inp = $('input', s), minus = $('button', s); const sync = () => { minus.disabled = +inp.value <= +inp.min; }; form.addEventListener('wa-update', sync); sync(); });
});

// "Add to my sourcing brief" from a product: presets variety and form, then the message glows
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-brief-variety]'); if (!a) return;
  const form = $('[data-wa-form="brief"]'); if (!form) return;
  [['variety', a.dataset.briefVariety], ['form', a.dataset.briefForm]].forEach(([n, v]) => { const s = form.elements[n]; s.value = v; s.dispatchEvent(new Event('sync')); s.dispatchEvent(new Event('change', { bubbles: true })); });
  const side = $('.brief-side .wa-pre'); side?.animate([{ boxShadow: '0 0 0 0 rgba(247,183,51,0)' }, { boxShadow: '0 0 0 8px rgba(247,183,51,.25)' }, { boxShadow: '0 0 0 0 rgba(247,183,51,0)' }], { duration: 1400, delay: 900 });
}, true);
