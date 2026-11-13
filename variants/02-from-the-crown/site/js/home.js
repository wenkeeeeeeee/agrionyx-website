// Home V2: look inside the pineapple. A diamond lens shows the fruit's journey; scroll opens its eyes into a mosaic.
import { company } from './app.js';
const wait = () => new Promise((r) => { const t = () => (window.AGX ? r() : setTimeout(t, 20)); t(); });
await wait();
const { gsap, ScrollTrigger, reduce, phone } = window.AGX;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PHOTOS = ['farm-fruit-on-plant', 'harvest-carry', 'packhouse-grading', 'process-chunks', 'export-ship-cranes'].map((n) => `assets/img/${n}.jpg`);
const LABELS = ['The field', 'The harvest', 'CPPC grading', 'IQF chunks', 'The port'];
const later = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 700));

/* ---------------- HERO ---------------- */
const hero = $('[data-hero]');
const stage = $('[data-stage]');
const fruit = $('[data-fruit]');
const lensIn = $('[data-lens-in]');
const lensImgs = $$('img', lensIn);
const ring = $('[data-ring]');
const ringLabel = $('[data-ring-label]');
let loaded = false;
const loadLens = () => { if (loaded) return; loaded = true; $$('[data-src]').forEach((im) => { im.src = im.dataset.src; }); };
if (document.readyState === 'complete') later(loadLens); else addEventListener('load', () => later(loadLens));

const R = phone ? 70 : 118;
const lens = { x: 0.5, y: 0.6, r: 0 };
let cur = -1;
function drawLens() {
  const fr = fruit.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
  lensIn.style.setProperty('--lx', `${lens.x * 100}%`);
  lensIn.style.setProperty('--ly', `${lens.y * 100}%`);
  lensIn.style.setProperty('--lr', `${lens.r}px`);
  const px = fr.left - sr.left + lens.x * fr.width, py = fr.top - sr.top + lens.y * fr.height;
  ring.style.transform = `translate(${px}px, ${py}px)`;
  ring.style.setProperty('--rs', `${lens.r * 2}px`);
  ring.style.opacity = lens.r > 4 ? 1 : 0;
  const i = Math.max(0, Math.min(4, Math.floor((lens.y - 0.04) / 0.19)));
  if (i !== cur) { cur = i; lensImgs.forEach((im, k) => im.classList.toggle('on', k === i)); ringLabel.textContent = LABELS[i]; }
}
let auto = true, heroOn = true, t0 = performance.now();
const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reduce) {
  // Opening: under a second, never blocking.
  gsap.from(fruit, { yPercent: 8, opacity: 0, duration: 0.9, ease: 'expo.out' });
  gsap.from('[data-r1] > span, [data-r2] > span', { yPercent: 70, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
  gsap.fromTo('[data-sign] path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.25, stagger: 0.9 });
  gsap.from('.head', { y: -30, opacity: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform,opacity' });
  gsap.to(lens, { r: R, duration: 0.9, delay: 0.8, ease: 'expo.out' });
  // Alive at rest: crown sways, light glides.
  gsap.to('[data-crown]', { rotate: 1.6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.fromTo(fruit, { '--sheen': '-60%' }, { '--sheen': '150%', duration: 3.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 2.2 });
  // Lens path at rest (and always on phones): a slow figure through the fruit, top to bottom.
  gsap.ticker.add(() => {
    if (!heroOn) return;
    if (auto) { const t = (performance.now() - t0) / 1000; lens.x = 0.5 + Math.sin(t * 0.9) * 0.2; lens.y = 0.5 + Math.sin(t * 0.37) * 0.38; }
    drawLens();
  });
  if (hoverable) {
    const qx = gsap.quickTo(lens, 'x', { duration: 0.5, ease: 'power3' }); const qy = gsap.quickTo(lens, 'y', { duration: 0.5, ease: 'power3' });
    stage.addEventListener('pointermove', (e) => {
      if (window.scrollY > innerHeight * 0.3) return;
      const fr = fruit.getBoundingClientRect();
      const x = (e.clientX - fr.left) / fr.width, y = (e.clientY - fr.top) / fr.height;
      if (x > -0.6 && x < 1.6 && y > -0.05 && y < 1.05) { auto = false; loadLens(); qx(x); qy(y); $('[data-hint-t]').textContent = 'Field · harvest · CPPC · IQF · port'; }
    });
    stage.addEventListener('pointerleave', () => { auto = true; t0 = performance.now() - Math.asin(Math.max(-1, Math.min(1, (lens.y - 0.5) / 0.38))) / 0.37 * 1000; });
  }
} else { lens.r = R; drawLens(); loadLens(); }

// The mosaic: the fruit's eyes as diamond tiles over the stage.
const mosaic = $('[data-mosaic]');
let tiles = [];
function buildMosaic() {
  const W = stage.clientWidth, H = stage.clientHeight; const S = phone ? 130 : Math.max(170, Math.round(W / 9)); const h = S / 2;
  let html = ''; const meta = [];
  for (let y = 0, row = 0; y <= H + h; y += h, row++) {
    for (let x = row % 2 ? h : 0; x <= W + h; x += S) {
      const ph = PHOTOS[(row * 3 + Math.round(x / S) * 2) % 5];
      html += `<div class="t" style="left:${x - h}px;top:${y - h}px;width:${S}px;height:${S}px"><i class="a" style="left:${h - x}px;top:${h - y}px;width:${W}px;height:${H}px;background-image:url(${ph})"></i><i class="b" style="left:${h - x}px;top:${h - y}px;width:${W}px;height:${H}px;background-image:url(${PHOTOS[2]})"></i></div>`;
      meta.push(Math.hypot(x - W / 2, (y - H * 0.6) * 1.3));
    }
  }
  mosaic.innerHTML = html;
  const max = Math.max(...meta);
  tiles = $$('.t', mosaic).map((el, i) => ({ el, a: el.children[0], b: el.children[1], d: meta[i] / max }));
}
buildMosaic();

if (!reduce) {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6,
    onUpdate: (s) => { heroOn = s.progress < 0.3; if (s.progress > 0.02) loadLens(); } } });
  const T = tiles.map((t) => t.el), d = (i) => tiles[i].d;
  tl.to('[data-r1] .a', { xPercent: -140, duration: 0.12, ease: 'power2.in' }, 0).to('[data-r1] .b', { xPercent: 140, duration: 0.12, ease: 'power2.in' }, 0)
    .to('[data-r2] .a', { xPercent: -140, duration: 0.12, ease: 'power2.in' }, 0)
    .to('[data-r2] .b', { xPercent: 140, duration: 0.12, ease: 'power2.in' }, 0)
    .to('[data-sign]', { yPercent: -120, opacity: 0, duration: 0.08 }, 0)
    .to(['[data-hint]', ring], { opacity: 0, duration: 0.04 }, 0)
    .to(lens, { r: 0, duration: 0.06 }, 0)
    .to(fruit, { scale: phone ? 2.6 : 3.4, duration: 0.28, ease: 'power2.in' }, 0.02)
    .fromTo(T, { scale: 0 }, { scale: 1.02, duration: 0.12, stagger: (i) => d(i) * 0.12, ease: 'power3.out' }, 0.12)
    .to(fruit, { autoAlpha: 0, duration: 0.02 }, 0.3)
    .to(tiles.map((t) => t.b), { opacity: 1, duration: 0.06, stagger: (i) => d(i) * 0.1 }, 0.3)
    .to(T, { scale: 1.14, duration: 0.08 }, 0.36)
    .fromTo('[data-cppc]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power2.out' }, 0.42)
    .to('[data-cppc]', { autoAlpha: 0, y: -20, duration: 0.04 }, 0.58)
    .set('[data-end]', { visibility: 'visible' }, 0.58)
    .to(T, { scale: 0, duration: 0.12, stagger: (i) => (1 - d(i)) * 0.1, ease: 'power2.in' }, 0.6)
    .fromTo('[data-end-fresh]', { y: '40vh', opacity: 0 }, { y: 0, opacity: 1, duration: 0.12, ease: 'power3.out' }, 0.68)
    .fromTo('[data-end-iqf]', { scale: 0.3, rotate: -45, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.12, ease: 'power3.out' }, 0.7)
    .fromTo('[data-end-line] > *', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.06, stagger: 0.008 }, 0.74)
    .to({}, { duration: 0.14 }, 0.86);
}
let rw = innerWidth;
addEventListener('resize', () => { if (Math.abs(innerWidth - rw) < 40) return; rw = innerWidth; location.reload(); });

/* ---------------- WHAT WE GROW: the hand ---------------- */
const cards = $$('.dcard');
const bigname = $('[data-bigname]');
if (!phone) {
  const n = cards.length, mid = (n - 1) / 2;
  const fan = (i) => ({ rotate: (i - mid) * 5.5, x: (i - mid) * Math.min(innerWidth * 0.15, 290), y: Math.abs(i - mid) * 20 });
  cards.forEach((c, i) => { c.style.zIndex = 10 - Math.abs(i - mid) * 2; });
  if (!reduce) {
    gsap.timeline({ scrollTrigger: { trigger: '[data-deck]', start: 'top 85%', end: 'top 10%', scrub: 0.8 } })
      .fromTo(cards, { rotate: (i) => (i - mid) * 2, x: 0, y: 120 }, { rotate: (i) => fan(i).rotate, x: (i) => fan(i).x, y: (i) => fan(i).y, ease: 'power2.out', duration: 1 });
  } else cards.forEach((c, i) => gsap.set(c, fan(i)));
  cards.forEach((c, i) => {
    c.addEventListener('pointerenter', () => { c.style.zIndex = 30; bigname.textContent = c.dataset.name; gsap.to(c, { yPercent: -9, scale: 1.04, duration: 0.5, ease: 'expo.out' }); gsap.fromTo(bigname, { yPercent: -44 }, { yPercent: -50, duration: 0.6, ease: 'expo.out' }); });
    c.addEventListener('pointerleave', () => { c.style.zIndex = 10 - Math.abs(i - mid) * 2; gsap.to(c, { yPercent: 0, scale: 1, duration: 0.6, ease: 'expo.out' }); });
  });
}

/* ---------------- CPPC: leader lines ---------------- */
const cxStage = $('[data-cx-stage]');
const cxLines = $('[data-cx-lines]');
function cxLayout() {
  if (phone) return;
  const sr = cxStage.getBoundingClientRect(); const dia = $('[data-cx-dia]');
  const dw = dia.offsetWidth, dh = dia.offsetHeight, dl = (sr.width - dw) / 2, dt = (sr.height - dh) / 2;
  let svg = '';
  $$('.cx-tags li').forEach((li) => {
    const [fx, fy] = li.dataset.at.split(',').map(Number);
    const px = dl + fx * dw, py = dt + fy * dh;
    const left = li.dataset.side === 'l';
    const lw = li.offsetWidth;
    const lx = left ? Math.max(0, dl - lw - 60) : Math.min(sr.width - lw, dl + dw + 60);
    li.style.left = `${lx}px`; li.style.top = `${py - 14}px`;
    const ex = left ? lx + lw + 10 : lx - 10;
    svg += `<path d="M${px} ${py} L${ex} ${py}"/><circle cx="${px}" cy="${py}" r="5"/>`;
  });
  cxLines.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
  cxLines.innerHTML = svg;
}
cxLayout(); ScrollTrigger.addEventListener('refresh', cxLayout);
if (!reduce && !phone) {
  const t = gsap.timeline({ scrollTrigger: { trigger: '[data-cx]', start: 'top 55%' } });
  t.from('[data-cx-dia]', { clipPath: 'polygon(50% 40%, 60% 50%, 50% 60%, 40% 50%)', duration: 1.2, ease: 'expo.out' })
    .from('[data-cx-dia] img', { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0)
    .add(() => gsap.fromTo(cxLines.querySelectorAll('path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.out', stagger: 0.1 }), 0.5)
    .from('.cx-tags li', { opacity: 0, x: (i, el) => (el.dataset.side === 'l' ? -20 : 20), duration: 0.8, ease: 'expo.out', stagger: 0.1 }, 0.7)
    .from('[data-cx-pop]', { scale: 0, rotate: -45, duration: 1, ease: 'expo.out' }, 0.9);
  gsap.to('[data-cx-pop]', { y: -60, ease: 'none', scrollTrigger: { trigger: '[data-cx]', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------------- NUMBERS: the field drifts inside the digits ---------------- */
if (!reduce) gsap.fromTo('.nx-big .ph:first-child', { backgroundPosition: '20% 30%' }, { backgroundPosition: '60% 70%', ease: 'none', scrollTrigger: { trigger: '[data-nx]', start: 'top bottom', end: 'bottom top', scrub: true } });

/* ---------------- GROWERS: notes drawn to the photos ---------------- */
const gx = $('[data-gx]'); const notes = $('[data-gx-notes]');
function gxLayout() {
  if (phone) return;
  const sr = gx.getBoundingClientRect(); let svg = '';
  $$('.gx-ann li').forEach((li) => {
    const a = li.getBoundingClientRect(); const f = $(`[data-gp="${li.dataset.to}"]`).getBoundingClientRect();
    const fcx = f.left + f.width / 2 - sr.left, fcy = f.top + f.height / 2 - sr.top;
    const acx = a.left + a.width / 2 - sr.left, acy = a.top + a.height / 2 - sr.top;
    const sx = acx < fcx ? a.right - sr.left + 8 : a.left - sr.left - 8; const sy = acy + (acy < sr.height / 2 ? 12 : -12);
    const tx = Math.max(f.left - sr.left + 18, Math.min(f.right - sr.left - 18, sx + (fcx - sx) * 0.5));
    const ty = Math.max(f.top - sr.top + 18, Math.min(f.bottom - sr.top - 18, sy + (fcy - sy) * 0.8));
    const mx = (sx + tx) / 2 + (ty - sy) * 0.3, my = (sy + ty) / 2 - (tx - sx) * 0.25;
    const ang = Math.atan2(ty - my, tx - mx), L = 13;
    svg += `<path d="M${sx} ${sy} Q${mx} ${my} ${tx} ${ty}"/><path d="M${tx - L * Math.cos(ang - 0.5)} ${ty - L * Math.sin(ang - 0.5)} L${tx} ${ty} L${tx - L * Math.cos(ang + 0.5)} ${ty - L * Math.sin(ang + 0.5)}"/>`;
  });
  notes.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`); notes.innerHTML = svg;
}
gxLayout(); ScrollTrigger.addEventListener('refresh', gxLayout);
if (!reduce && !phone) {
  const t = gsap.timeline({ scrollTrigger: { trigger: gx, start: 'top 45%' } });
  t.from('.gp', { scale: 0.6, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 })
    .add(() => gsap.fromTo(notes.querySelectorAll('path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut', stagger: 0.09 }), 0.5)
    .from('.gx-ann li', { opacity: 0, y: 10, duration: 0.6, ease: 'expo.out', stagger: 0.12 }, 0.6);
}

/* ---------------- JOURNEY: the leaf line grows ---------------- */
const yrs = $('[data-jx-yrs]');
yrs.innerHTML = company.timeline.map((t) => `<li><span class="dot"></span><strong class="yr">${t.year}</strong><p>${t.text}</p></li>`).join('');
if (!reduce) {
  const leaves = $$('.jx-leaf .leaf');
  gsap.set(leaves, { scale: 0 });
  const t = gsap.timeline({ scrollTrigger: { trigger: '[data-jx]', start: 'top 70%', end: 'top 5%', scrub: 0.8 } });
  t.fromTo('[data-jx-stem]', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none' }, 0)
    .to(leaves, { scale: 1, duration: 0.12, stagger: 0.24, ease: 'back.out(2)' }, 0.18)
    .fromTo('.jx-yrs .yr', { rotateX: -90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.12, stagger: 0.2 }, 0.02)
    .from('.jx-yrs p, .jx-yrs .dot', { opacity: 0, y: 12, duration: 0.12, stagger: 0.1 }, 0.06);
}

/* ---------------- TWO VARIETIES ---------------- */
const VAR = {
  md2: { name: 'MD2', filter: 'none', cta: 'Request the MD2 spec sheet',
    maturity: ['14–16 months to harvest', '<span class="tbc">[client to confirm]</span>'],
    flesh: ['Golden, sweet, low-acid', 'The world’s leading export variety'],
    use: ['Fresh export · IQF processing', 'Export and domestic'],
    source: ['Own farms + contract farmers', 'Perlis to Johor, 6 states'] },
  sg1: { name: 'SG1', filter: 'saturate(1.12) brightness(1.05)', cta: 'Request the SG1 spec sheet',
    maturity: ['About 9 months to harvest', '<span class="tbc">[client to confirm]</span> press figure'],
    flesh: ['Deep golden', '<span class="tbc">[client to confirm]</span>'],
    use: ['Fresh export and domestic', 'Processing use <span class="tbc">[client to confirm]</span>'],
    source: ['Own SG1 farm, Pontian, Johor', 'Plus partner growers'] },
};
const vars = $('[data-vars]');
const specs = $$('[data-spec]');
const blue = $('[data-blue]');
const vFruit = $('[data-vfruit]');
const tilt = $('[data-tilt]');
const pill = $('[data-pill]');
const btns = $$('[data-var]');
let curVar = null;
// Place specs around the vFruit and draw blueprint lines from the vFruit to each.
const anchors = { maturity: [0.5, 0.2, -1, 0.42], flesh: [0.74, 0.58, 1, 0.42], use: [0.28, 0.72, -1, 0.72], source: [0.52, 0.9, 1, 0.72] };
function layout() {
  const st = vars.querySelector('.vars-stage').getBoundingClientRect();
  const fr = vFruit.getBoundingClientRect();
  const w = st.width, h = st.height;
  blue.setAttribute('viewBox', `0 0 ${w} ${h}`);
  let svg = '';
  specs.forEach((sp) => {
    const [ax, ay, side, ry] = anchors[sp.dataset.spec];
    const px = fr.left - st.left + fr.width * ax, py = fr.top - st.top + fr.height * ay;
    const sw = sp.offsetWidth;
    const cx = fr.left - st.left + fr.width / 2;
    const off = phone ? 0 : Math.min(w * 0.3, 470);
    let lx = side < 0 ? cx - off - sw : cx + off;
    let ly = h * ry;
    if (phone) { lx = side < 0 ? 16 : w - sw - 16; ly = ry < 0.5 ? h * 0.3 : h * 0.76; }
    sp.style.left = `${lx}px`; sp.style.top = `${ly}px`;
    const ex = side < 0 ? lx + sw + 16 : lx - 16;
    const mx = side < 0 ? ex + 50 : ex - 50;
    svg += `<path d="M${px} ${py} L${mx} ${ly + 6} L${ex} ${ly + 6}"/><circle cx="${px}" cy="${py}" r="3.5"/><path d="M${px - 10} ${py} L${px} ${py - 10} L${px + 10} ${py} L${px} ${py + 10}Z"/>`;
  });
  blue.innerHTML = svg;
}
function setVar(k, animate = true) {
  if (k === curVar) return; curVar = k;
  const v = VAR[k];
  btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.var === k)));
  const on = btns.find((b) => b.dataset.var === k);
  const state = window.Flip && animate && !reduce ? window.Flip.getState(pill) : null;
  Object.assign(pill.style, { left: `${on.offsetLeft}px`, top: `${on.offsetTop}px`, width: `${on.offsetWidth}px`, height: `${on.offsetHeight}px` });
  if (state) window.Flip.from(state, { duration: 0.6, ease: 'expo.out' });
  $('[data-vname]').textContent = v.name;
  $('[data-var-cta]').firstChild.textContent = `${v.cta} `;
  specs.forEach((sp) => {
    const [a, b] = v[sp.dataset.spec];
    const sv = sp.querySelector('[data-sv]');
    if (!animate || reduce) { sv.innerHTML = `${a}<small>${b}</small>`; return; }
    gsap.to(sv, { opacity: 0, y: -10, duration: 0.2, onComplete: () => { sv.innerHTML = `${a}<small>${b}</small>`; gsap.fromTo(sv, { y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }); } });
  });
  if (animate && !reduce) {
    // flat-photo turn: tilt away, swap light, tilt back
    gsap.timeline().to(tilt, { rotateY: k === 'sg1' ? 16 : -16, scaleX: 0.9, duration: 0.35, ease: 'power2.in' })
      .add(() => { tilt.style.filter = v.filter; tilt.querySelector('img').style.transform = k === 'sg1' ? 'scaleX(-1)' : 'none'; })
      .to(tilt, { rotateY: 0, scaleX: 1, duration: 0.8, ease: 'expo.out' })
      .fromTo('[data-lightx]', { backgroundPosition: '100% 0' }, { backgroundPosition: '-20% 0', duration: 1.1, ease: 'power2.inOut' }, 0.3);
    gsap.fromTo(blue.querySelectorAll('path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.out', stagger: 0.06 });
  } else { tilt.style.filter = v.filter; }
}
// Spec request preset from the variety CTA.
$('[data-var-cta]').addEventListener('click', () => {
  const f = document.querySelector('[data-wa-form="brief"]'); if (!f) return;
  f.elements.variety.value = curVar === 'sg1' ? 'Sarawak Gold (SG1)' : 'MD2';
  f.dispatchEvent(new Event('agx-sync')); f.dispatchEvent(new Event('input', { bubbles: true }));
});
btns.forEach((b) => b.addEventListener('click', () => {
  setVar(b.dataset.var);
  const st = vars._st; if (st && window.AGX.lenis) window.AGX.lenis.scrollTo(st.start + (st.end - st.start) * (b.dataset.var === 'sg1' ? 0.72 : 0.2), { duration: 1 });
}));
layout(); setVar('md2', false);
addEventListener('resize', () => { layout(); });
if (!reduce) {
  gsap.set(blue.querySelectorAll('path'), { drawSVG: '0%' });
  gsap.set(specs, { opacity: 0, x: (i) => (i % 2 ? 20 : -20) });
  vars._st = ScrollTrigger.create({ trigger: vars, start: 'top top', end: 'bottom bottom',
    onEnter: () => { gsap.to(blue.querySelectorAll('path'), { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut', stagger: 0.12 }); gsap.to(specs, { opacity: 1, x: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12, delay: 0.4 }); },
    onUpdate: (s) => { setVar(s.progress < 0.5 ? 'md2' : 'sg1'); } });
  // the vFruit tilts a little with scroll and the pointer; light glides at rest
  gsap.fromTo(tilt, { rotateZ: -3 }, { rotateZ: 3, ease: 'none', scrollTrigger: { trigger: vars, start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.to('[data-lightx]', { backgroundPosition: '-20% 0', duration: 5, repeat: -1, ease: 'power1.inOut', repeatDelay: 1.5 });
  vars.addEventListener('pointermove', (e) => { const r = vars.getBoundingClientRect(); gsap.to(vFruit, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotateX: -((e.clientY) / innerHeight - 0.5) * 6, duration: 1.2, ease: 'power3' }); });
} else { blue.style.opacity = 1; }
ScrollTrigger.addEventListener('refresh', layout);
