// Every Acre hero, daylight edition. Intro: dots gather into the AGRIONYX wordmark and break into a point pineapple.
// Scroll then drops the points onto the six farm areas where photo cards pop up; they stream into the CPPC, whose pin
// opens into the real facility photo; then arcs leave a dotted globe and land on export photos in six markets.
import { company } from './app.js';
import { Field, pineapple, pineDust, textPoints, peninsulaDots, globeDots, mapProj, ortho, arcPoint, PEN, GOLD, GREEN, WARM, ease, clamp, lerp, phone, reduce } from './points.js';

const hero = document.querySelector('[data-hero]');
if (hero) {
  const canvas = hero.querySelector('canvas');
  const N = phone ? 460 : 900;
  const pine = await pineapple(N);
  const dust = pineDust(phone ? 1200 : 2600);
  const pen = peninsulaDots(phone ? 0.15 : 0.1);
  const globe = globeDots(phone ? 5000 : 11000);
  const farms = company.farms, cppc = company.cppc, markets = company.markets;
  const MY = [cppc.lng, cppc.lat];
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const meta = pine.map((q, i) => ({ fi: i % 6, gx: gauss(), gy: gauss(), ai: i % 7, u0: Math.random(), bend: Math.random() - 0.5, d: Math.random() }));
  // Intro: the dots gather into the AGRIONYX wordmark, hold, then break into the pineapple. Once per session; any input skips ahead.
  const root = document.documentElement;
  let seen = false; try { seen = sessionStorage.getItem('agx-intro') === '1'; } catch {}
  let intro = !reduce && !seen && scrollY < 40, iT0 = null, word = null;
  const HOLD = 1.7, MORPH = 1.1;
  if (intro) {
    root.classList.add('intro'); root.style.overflow = 'hidden';
    try { await document.fonts.load('600 100px Unbounded'); } catch {}
  }
  const makeWord = () => { const ww = phone ? L.w * 0.86 : Math.min(L.w * 0.7, 1100), wh = ww * 0.2; const pts = textPoints('AGRIONYX', ww, wh, N, '600 {s}px Unbounded'); word = pine.map((_, i) => { const q = pts[i % pts.length]; return [L.w / 2 - ww / 2 + q.x + (i >= pts.length ? (Math.random() - 0.5) * 3 : 0), L.h * 0.46 - wh / 2 + q.y]; }); };
  const endIntro = () => { if (!intro) return; intro = false; root.classList.remove('intro'); root.style.overflow = ''; try { sessionStorage.setItem('agx-intro', '1'); } catch {} ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => removeEventListener(e, skip)); };
  const skip = () => { if (intro && iT0 != null) iT0 = Math.min(iT0, f.t - HOLD); };
  if (intro) ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => addEventListener(e, skip, { passive: true }));
  const introK = (t) => { if (!intro) return 1; if (iT0 == null) iT0 = t; const e = t - iT0; const k = clamp((e - HOLD) / MORPH); if (k >= 1 && e > HOLD + MORPH + 0.25) endIntro(); else if (k > 0.45) root.classList.add('intro-out'); return k; };
  let IK = 1, openK = 0, L = {}, grid = null, p = 0, pS = 0, step = -1;
  const outline = [];
  for (let i = 0; i < PEN.length; i++) { const a = PEN[i], b = PEN[(i + 1) % PEN.length]; const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.07); for (let k = 0; k < n; k++) outline.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }

  // ---------- photo cards ----------
  const $hp = (k) => [...hero.querySelectorAll(`[data-hp="${k}"]`)];
  const farmCards = $hp('farm'), cppcCard = $hp('cppc')[0], gradeCard = $hp('grade')[0], mkCards = $hp('mk');
  const allCards = [...farmCards, cppcCard, gradeCard, ...mkCards].filter(Boolean);
  const CAP = phone ? 20 : 24; // caption strip height
  // farm card sides: l, r, lu (left, raised), b (below)
  const sides = phone ? ['r', 'r', 'r', 'l', 'b', 'r'] : ['l', 'l', 'r', 'lu', 'b', 'r'];
  // market card offsets at globe radius 420, desktop
  const mkOff = { Japan: [96, -58], 'South Korea': [-34, -132], China: [118, 44], UAE: [-120, -78], 'Saudi Arabia': [40, 124], Europe: [96, 4] };
  const mkPhone = ['Japan', 'China', 'UAE'];
  const put = (el, x, y, o, s = 1) => {
    if (!el) return;
    const st = el._st || (el._st = {});
    const v = o <= 0.01 ? 0 : o;
    if (v === 0) { if (st.o !== 0) { el.style.opacity = '0'; el.style.visibility = 'hidden'; st.o = 0; } return; }
    if (st.o === 0 || st.o === undefined) el.style.visibility = 'visible';
    el.style.opacity = v.toFixed(3); st.o = v;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
  };
  const size = (el, w, h) => { if (!el) return; el.style.width = `${w}px`; el.style.height = `${h}px`; el._w = w; el._h = h; };
  // dot-grid reveal that resolves into the full image
  const dots = (el, o) => { if (!el) return; const d = o >= 0.98 ? 'none' : `${(o * 7).toFixed(2)}px`; if (el._d !== d) { el._d = d; el.classList.toggle('solid', d === 'none'); el.style.setProperty('--hd', d === 'none' ? '7px' : d); } };
  let loaded = false;
  const loadCards = () => { if (loaded) return; loaded = true; hero.querySelectorAll('img[data-src]').forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); }); };
  addEventListener('load', () => setTimeout(loadCards, 300), { once: true });

  const layout = (f) => {
    const w = f.w, h = f.h, pad = Math.min(72, Math.max(20, w * 0.042));
    if (phone) {
      L.pH = h * 0.44; L.pc = [w * 0.5, h * 0.3];
      L.map = { x: w * 0.06, y: h * 0.07, w: w * 0.88, h: h * 0.5 }; L.gc = [w / 2, h * 0.42]; L.gR = w * 0.34;
    } else {
      L.pH = Math.min(h * 0.86, w * 0.56); L.pc = [Math.max(w * 0.7, pad + Math.min(w * 0.46, 760) + L.pH * 0.3), h * 0.52];
      L.map = { x: w * 0.5, y: h * 0.12, w: w * 0.4, h: h * 0.8 }; L.gc = [w * 0.67, h * 0.64]; L.gR = Math.min(h * 0.6, w * 0.33);
    }
    L.w = w; L.h = h; L.pad = pad;
    L.proj = mapProj(L.map);
    L.k = L.map.h / 6;
    L.cp = L.proj(...MY);
    L.farmPx = farms.map((fm) => L.proj(fm.lng, fm.lat));
    // card sizes
    const fw = phone ? 78 : clamp(L.k * 1.5, 120, 200), fh = fw * 0.66;
    L.fw = fw; L.fh = fh;
    farmCards.forEach((el) => size(el, fw, fh + CAP));
    const cw = phone ? w * 0.66 : clamp(w * 0.25, 300, 500), ch = cw * 9 / 16;
    size(cppcCard, cw, ch + CAP);
    L.cc = phone ? { x: w - 14 - cw, y: L.cp[1] - ch - CAP - 40 } : { x: Math.min(w - pad - cw, L.cp[0] + 64), y: L.cp[1] - ch - CAP + 10 };
    const gw = phone ? 0 : cw * 0.5;
    size(gradeCard, gw, gw * 9 / 16 + CAP);
    L.gcard = { x: L.cc.x - gw * 0.35, y: L.cc.y + ch + CAP - 6 };
    const mw = phone ? (w - 40) / 3 : clamp(L.gR * 0.32, 110, 170);
    L.mw = mw;
    mkCards.forEach((el) => size(el, mw, mw * 0.8 + CAP));
  };
  const lon0 = (t) => 80 + Math.sin(t * 0.08) * 5, lat0 = 14;
  const gp = (lng, lat, t, lift = 1) => { const [x, y, z] = ortho(lng, lat, lon0(t), lat0); return [L.gc[0] + x * L.gR * lift, L.gc[1] - y * L.gR * lift, z]; };
  const zoom = (pt, c, t) => { if (c <= 0) return pt; const my = gp(...MY, t); const z = lerp(1, 0.05, c); return [lerp(L.cp[0], my[0], c) + (pt[0] - L.cp[0]) * z, lerp(L.cp[1], my[1], c) + (pt[1] - L.cp[1]) * z]; };
  const road = (fp, u, bend) => { const mx = (fp[0] + L.cp[0]) / 2 + bend * 40, my = (fp[1] + L.cp[1]) / 2 - bend * 30; const v = 1 - u; return [v * v * fp[0] + 2 * v * u * mx + u * u * L.cp[0], v * v * fp[1] + 2 * v * u * my + u * u * L.cp[1]]; };
  const seg = () => ({ a: ease(clamp((pS - 0.08) / 0.22)), b: clamp((pS - 0.38) / 0.26), c: clamp((pS - 0.68) / 0.22) });
  let S = seg();
  const farmCardPos = (i) => {
    const [fx, fy] = L.farmPx[i], w = L.fw, h = L.fh + CAP, sd = sides[i], g = phone ? 14 : 26;
    let x = sd === 'r' ? fx + g : sd === 'b' ? fx - w * 0.6 : fx - g - w;
    let y = sd === 'lu' ? fy - h + 6 : sd === 'b' ? fy + g * 0.9 : fy - h / 2;
    x = clamp(x, 8, L.w - 8 - w); y = clamp(y, phone ? 70 : 64, L.h - h - 8);
    const ax = sd === 'r' ? x : sd === 'b' ? x + w * 0.6 : x + w, ay = sd === 'b' ? y : y + h / 2;
    return { x, y, ax, ay };
  };

  const f = new Field(canvas, {
    windHost: hero, windR: phone ? 0 : 120, lerp: 0.14, size: phone ? 1.75 : 2.35,
    onResize: (ff) => { layout(ff); if (intro) makeWord(); },
    before(ctx, t) {
      if (!reduce) pS += (p - pS) * 0.12; else pS = p;
      openK = reduce ? 1 : Math.min(1, openK + 0.02);
      S = seg();
      const { a, b, c } = S, ce = ease(c);
      IK = introK(t);
      // the pineapple's fine texture, only while it is a pineapple
      const da = (1 - a * 1.6) * openK * ease(clamp((IK - 0.5) / 0.5));
      if (da > 0.01) {
        const br = reduce ? 1 : 1 + Math.sin(t * 1.3) * 0.012;
        for (const d of dust) { ctx.globalAlpha = Math.min(1, da * d.a * 1.7); ctx.fillStyle = d.c; ctx.fillRect(L.pc[0] + d.x * L.pH * br - 0.9, L.pc[1] + d.y * L.pH * br - 0.9, 1.8, 1.8); }
        ctx.globalAlpha = 1;
      }
      // ---- the peninsula, drawn as points
      const mA = a * (1 - ce);
      if (mA > 0.01) {
        ctx.fillStyle = '#D6C9A9'; ctx.globalAlpha = mA;
        for (const [lng, lat] of pen) { const [x, y] = zoom(L.proj(lng, lat), ce, t); ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2); }
        ctx.fillStyle = '#9C8862'; ctx.globalAlpha = mA * 0.7;
        for (const [lng, lat] of outline) { const [x, y] = zoom(L.proj(lng, lat), ce, t); ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8); }
        if (b > 0) {
          ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2; ctx.globalAlpha = Math.min(1, b * 3) * 0.5 * (1 - ce);
          L.farmPx.forEach((fp, i) => { ctx.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const q = zoom(road(fp, u, i % 2 ? 0.3 : -0.3), ce, t); u ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); });
        }
        // farm photo cards pop up at the clusters, tied by a leader line
        const fade = 1 - clamp((b - 0.05) / 0.25);
        farmCards.forEach((el, i) => {
          const o = ease(clamp((a - 0.45 - i * 0.05) / 0.2)) * fade * (1 - ce);
          const P = farmCardPos(i);
          put(el, P.x, P.y, o, 0.86 + 0.14 * o);
          if (o > 0.01) { const [fx, fy] = L.farmPx[i]; ctx.globalAlpha = o * 0.55; ctx.strokeStyle = WARM; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(P.ax, P.ay); ctx.stroke(); ctx.fillStyle = WARM; ctx.beginPath(); ctx.arc(fx, fy, 2.6, 0, 6.283); ctx.fill(); }
        });
        // CPPC pin, opening into the real facility photo
        const pa = clamp((b - 0.15) / 0.3) * (1 - ce);
        const [x, y] = L.cp;
        if (pa > 0.01) {
          const r = 16 + Math.sin(t * 2) * 3;
          ctx.globalAlpha = pa; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke();
          ctx.globalAlpha = pa * 0.45; ctx.beginPath(); ctx.arc(x, y, r + 12, 0, 6.283); ctx.stroke();
          ctx.globalAlpha = pa; ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.283); ctx.fill();
        }
        const co = ease(clamp((b - 0.28) / 0.3)) * (1 - clamp(c * 2.5));
        const go = ease(clamp((b - 0.5) / 0.3)) * (1 - clamp(c * 2.5));
        const cs = 0.55 + 0.45 * co;
        // the card grows out of the pin
        const cx0 = lerp(x - (cppcCard?._w || 0) * cs * 0, L.cc.x, 1);
        put(cppcCard, lerp(x, cx0, co), lerp(y, L.cc.y, co), co, cs); dots(cppcCard, co);
        put(gradeCard, L.gcard.x, L.gcard.y + (1 - go) * 20, phone ? 0 : go, 1); dots(gradeCard, go);
        if (co > 0.01) {
          ctx.globalAlpha = co * 0.7; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2; ctx.setLineDash([2, 4]);
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, L.cc.x, co), lerp(y, L.cc.y + (cppcCard?._h || 0) * cs, co)); ctx.stroke(); ctx.setLineDash([]);
        }
      } else {
        farmCards.forEach((el) => put(el, 0, 0, 0)); put(cppcCard, 0, 0, 0); put(gradeCard, 0, 0, 0);
      }
      // ---- the globe
      if (ce > 0.01) {
        ctx.save(); ctx.globalAlpha = ce;
        const grd = ctx.createRadialGradient(L.gc[0], L.gc[1], L.gR * 0.6, L.gc[0], L.gc[1], L.gR * 1.2);
        grd.addColorStop(0, 'rgba(232,169,42,0)'); grd.addColorStop(0.5, 'rgba(232,169,42,0.09)'); grd.addColorStop(1, 'rgba(232,169,42,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(L.gc[0], L.gc[1], L.gR * 1.2, 0, 6.283); ctx.fill();
        const sc = lerp(0.8, 1, ce);
        for (const [lng, lat, land] of globe) {
          const [x0, y0, z] = gp(lng, lat, t); if (z <= 0.02) continue;
          const x = L.gc[0] + (x0 - L.gc[0]) * sc, y = L.gc[1] + (y0 - L.gc[1]) * sc;
          ctx.globalAlpha = ce * (land ? 0.45 + z * 0.55 : 0.25 + z * 0.3); ctx.fillStyle = land ? '#5E5038' : '#E2D8C0';
          const s = land ? 2.2 : 1.1; ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
        const draw = clamp((c - 0.35) / 0.6);
        ctx.lineWidth = 1.3; ctx.font = `500 ${phone ? 9 : 11}px "Martian Mono", monospace`; ctx.textBaseline = 'middle';
        const sR = L.gR / 420;
        markets.forEach((mk, i) => {
          const card = mkCards[i];
          const d = clamp(draw * 1.6 - i * 0.08);
          const showCard = !phone || mkPhone.includes(mk.name);
          if (d <= 0) { put(card, 0, 0, 0); return; }
          ctx.strokeStyle = GOLD; ctx.globalAlpha = 0.75 * ce; ctx.beginPath();
          let last = null;
          for (let u = 0; u <= d + 0.001; u += 0.02) { const [lng, lat, l] = arcPoint(MY, [mk.lng, mk.lat], Math.min(u, d)); const q = gp(lng, lat, t, l); last = q; u ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
          ctx.stroke();
          const o = ease(clamp((draw * 1.6 - i * 0.08 - 0.95) / 0.2)) * ce;
          if (d >= 0.999 && last) {
            ctx.globalAlpha = ce; ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(last[0], last[1], 3.6, 0, 6.283); ctx.fill();
            if (showCard && card) {
              let cx, cy;
              const cw = L.mw, chh = L.mw * 0.8 + CAP;
              if (phone) { const j = mkPhone.indexOf(mk.name); cx = 14 + j * (cw + 6); cy = 82; }
              else { const off = mkOff[mk.name] || [60, -60]; cx = last[0] + off[0] * sR - cw / 2; cy = last[1] + off[1] * sR - chh / 2; }
              cx = clamp(cx, 8, L.w - 8 - cw); cy = clamp(cy, phone ? 76 : 70, L.h - chh - 8);
              put(card, cx, cy + (1 - o) * 14, o, 1);
              ctx.globalAlpha = o * 0.6; ctx.strokeStyle = WARM; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(last[0], last[1]);
              ctx.lineTo(clamp(last[0], cx, cx + cw), clamp(last[1], cy, cy + chh)); ctx.stroke(); ctx.lineWidth = 1.3;
            } else {
              const lft = last[0] < L.gc[0] || mk.name === 'South Korea';
              ctx.fillStyle = WARM; ctx.textAlign = lft ? 'right' : 'left';
              ctx.fillText(mk.name.toUpperCase(), last[0] + (lft ? -10 : 10), last[1] - (mk.name === 'South Korea' ? 0 : 10));
              put(card, 0, 0, 0);
            }
          } else put(card, 0, 0, 0);
        });
        ctx.restore();
      } else mkCards.forEach((el) => put(el, 0, 0, 0));
      if (S.a > 0.3 || S.b > 0) loadCards();
    },
    target(q, t) {
      const i = q.i, m = meta[i], pp = pine[i], { a, b, c } = S;
      const br = reduce ? 1 : 1 + Math.sin(t * 1.3) * 0.012;
      let P = [L.pc[0] + pp.x * L.pH * br, L.pc[1] + pp.y * L.pH * br];
      q.c = pp.c; q.s = pp.s; q.a = 1;
      // intro: from the wordmark into the pineapple, each dot on its own small delay
      if (IK < 1 && word) { const kk = ease(clamp(IK * 1.5 - m.d * 0.5)); const W = word[i]; P = [lerp(W[0], P[0], kk), lerp(W[1], P[1], kk) - Math.sin(Math.PI * kk) * 40 * (m.d - 0.5)]; }
      const fp = L.farmPx[m.fi], spread = (phone ? 10 : 16) * (m.fi === 5 ? 1.3 : 1);
      const M = [fp[0] + m.gx * spread, fp[1] + m.gy * spread];
      const ue = ease(clamp(b * 1.6 - m.u0 * 0.6));
      let Mp = M;
      if (b > 0) { const r = road(M, ue, m.bend); Mp = [r[0] + m.gx * 7 * ue, r[1] + m.gy * 7 * ue]; }
      const cc = ease(clamp((c - m.u0 * 0.3) / 0.7));
      const Z = zoom(Mp, ease(c), t);
      let x = lerp(P[0], Z[0], a), y = lerp(P[1], Z[1], a);
      if (cc > 0) {
        let G;
        if (m.ai === 6) { const my = gp(...MY, t); G = [my[0] + m.gx * 9, my[1] + m.gy * 9, 1]; q.c = GREEN; }
        else {
          const mk = markets[m.ai], u = (m.u0 + t * 0.06) % 1;
          const [lng, lat, l] = arcPoint(MY, [mk.lng, mk.lat], u); G = gp(lng, lat, t, l);
          q.c = GOLD; q.a = 0.4 + Math.sin(Math.PI * u) * 0.6; q.s = 0.85;
        }
        x = lerp(x, G[0], cc); y = lerp(y, G[1], cc);
      }
      q.tx = x; q.ty = y;
    },
  });
  layout(f);
  if (intro) makeWord();
  allCards.forEach((el) => { el.style.opacity = '0'; el.style.visibility = 'hidden'; });
  f.set(pine.map((q) => ({ x: 0, y: 0, c: q.c, s: q.s })), true);
  f.points.forEach((q, i) => { q.i = i; });
  if (!reduce) f.scatter(); else f.points.forEach((q) => f.o.target(q, 0));
  const steps = hero.querySelectorAll('[data-s]');
  const counters = hero.querySelectorAll('[data-hcount]');
  let counted = false;
  const onScroll = () => {
    const r = hero.getBoundingClientRect(), run = hero.offsetHeight - innerHeight;
    p = clamp(-r.top / Math.max(1, run));
    const s = p < 0.24 ? 0 : p < 0.52 ? 1 : p < 0.76 ? 2 : 3;
    if (s !== step) {
      step = s; hero.dataset.step = s;
      steps.forEach((el) => el.classList.toggle('on', +el.dataset.s === s));
      if (s === 3 && !counted) { counted = true; counters.forEach((el) => countUp(el)); }
      if (s > 0) loadCards();
      if (!f.visible) return;
      f.loop();
    }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.documentElement.classList.add('hero-ready');
  if (reduce) { f.loop(); }
}
export function countUp(el) {
  const to = +el.dataset.hcount, t0 = performance.now(), dur = reduce ? 0 : 1600;
  const tick = (now) => { const k = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en'); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
