// V3 The Centre: motion and page widgets. Imports pages.js so every data list is rendered first.
import { site, products, company, byId, esc, tbc, waLink } from './app.js';
import './controls.js';
import './pages.js';

const { gsap, ScrollTrigger } = window;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 860px)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EASE = 'expo.out';
if (gsap) { gsap.registerPlugin(ScrollTrigger); if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin); }

/* ---------- Renderers (this variant's own markup) ---------- */
const prodURL = (p) => `product.html?id=${encodeURIComponent(p.id)}`;
const illus = (src) => /real|cppc-facility|leader|logo/.test(src) ? '' : '<span class="illus">Illustrative</span>';
function prodHTML(p, lead) {
  return `<a class="prod${lead ? ' prod-lead' : ''}" href="${prodURL(p)}" data-rise>
    <div class="ph"><img src="${esc(p.image)}" alt="${esc(p.name)} (illustrative)" loading="lazy" width="800" height="600">${illus(p.image)}</div>
    <div class="prod-body"><p class="prod-kind">${esc(p.category)} · ${esc(p.short)}</p><h3>${esc(p.name)}</h3><p>${tbc(p.summary)}</p>
    <p class="price">${esc(site.priceNote)}</p>
    </div></a>`;
}
$$('[data-prods]').forEach((el) => {
  const list = products.filter((p) => !p.comingSoon);
  el.innerHTML = list.map((p, i) => prodHTML(p, false)).join('') +
    `<div class="buavia" data-rise><b>Buavia</b><p>Buah + via: our own tropical fruit brand, from the same farms and the same CPPC.</p><span class="when">Coming December 2026</span><img src="assets/img/pineapple-cut.webp" alt=""></div>`;
});
$$('[data-flow]').forEach((el) => {
  el.innerHTML = `<div class="flow-line"><b></b></div>` + company.process.map((s) => `<li data-rise><div class="ph"><img src="${esc(s.image)}" alt="" loading="lazy" width="600" height="800">${illus(s.image)}</div><p class="n">${esc(s.step)}</p><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('');
});
$$('[data-leaders-big]').forEach((el) => {
  el.innerHTML = company.leaders.map((l) => `<li data-rise><div class="face"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy"></div><div><h3>${esc(l.name)}</h3><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></div></li>`).join('');
});
$$('[data-events-real]').forEach((el) => {
  el.innerHTML = company.events.map((e) => `<li data-rise><figure><div class="ph"><img src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy" width="640" height="480"></div><figcaption>${esc(e.title)}</figcaption></figure></li>`).join('');
});
// product page "others"
$$('[data-p-others2]').forEach((el) => {
  const cur = new URLSearchParams(location.search).get('id') || products[0].id;
  el.innerHTML = products.filter((p) => p.id !== cur && !p.comingSoon).slice(0, 3).map((p) => prodHTML(p)).join('');
});

$$('.timeline').forEach((t) => t.insertAdjacentHTML('afterbegin', '<b class="tl-fill"></b>'));
// contact.html?product= presets for the drawn controls
const pre = byId[new URLSearchParams(location.search).get('product')];
if (pre) {
  const f = $('[data-wa-form="brief"]');
  if (f) {
    const radio = (n, v) => { const r = f.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
    if (pre.short === 'MD2') radio('variety', 'MD2');
    if (pre.short === 'SG1') radio('variety', 'Sarawak Gold (SG1)');
    if (pre.short === 'IQF') radio('form', 'IQF frozen');
    if (pre.short === 'Domestic') f.querySelector('[data-pick="market"]')?.setVal('Malaysia (domestic)');
    f.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
// pages.js wired forms before our controls existed: re-run its update once.
$$('[data-wa-form]').forEach((f) => f.dispatchEvent(new Event('change', { bubbles: true })));
// stepper minus disabled at minimum
$$('.stepper').forEach((s) => {
  const inp = s.querySelector('input'); const minus = s.querySelector('[data-by^="-"]');
  const sync = () => { minus.disabled = +inp.value <= +inp.min; };
  inp.form?.addEventListener('change', sync); inp.form?.addEventListener('input', sync); s.addEventListener('click', () => setTimeout(sync)); sync();
});

/* ---------- Volume planner ---------- */
const YIELD = 15; // indicative tonnes per acre per crop cycle [client to confirm]
$$('[data-planner]').forEach((root) => {
  const input = root.querySelector('input[name="tonnes"]');
  const rail = root.querySelector('.rail'); const knob = root.querySelector('.knob');
  const N = 35; rail.innerHTML = '<i></i>'.repeat(N); const cells = $$('i', rail);
  const days = $$('.meter b', root);
  const out = (k, v) => $$(`[data-out="${k}"]`, root).forEach((e) => { e.textContent = v; });
  const sync = () => {
    const t = +input.value; const share = t / 350;
    const on = Math.round(share * N);
    cells.forEach((c, i) => { c.className = i < on ? 'on' : ''; });
    knob.style.left = `${(t - input.min) / (input.max - input.min) * 100}%`;
    const perDay = t / 7; const fillDay = Math.min(1, perDay / 50);
    days.forEach((d) => { d.style.transform = `scaleY(${fillDay})`; });
    // acres: yearly tonnes / indicative yield per acre per year
    const acres = Math.round((t * 52) / (YIELD * 1.0) / 10) * 10;
    out('t', t); out('pct', `${Math.max(1, Math.round(share * 100))}%`); out('day', perDay.toFixed(1));
    out('acres', acres.toLocaleString('en')); out('ctrs', Math.max(1, Math.round(t / 22)));
    const of = acres > 600 ? 'more than today’s 600+ acre network: planned against the 2,000-acre target' : `of the 600+ acre network`;
    out('of', of);
  };
  input.addEventListener('input', sync); sync();
});

/* ---------- Counters ---------- */
function count(el) {
  const to = +el.dataset.count; if (reduce || !gsap) { el.textContent = to.toLocaleString('en'); return; }
  const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en'); } });
}

/* ---------- Header chapter bar ---------- */
const chapters = $$('[data-chapter]');
const chapOl = $('[data-chapters]'); const chapName = $('[data-chapter-name]');
if (chapOl && chapters.length) {
  chapOl.innerHTML = chapters.map(() => '<li></li>').join('');
  const lis = $$('li', chapOl);
  const setNow = (i) => { lis.forEach((l, j) => { l.classList.toggle('on', j < i); l.classList.toggle('now', j === i); }); chapName.textContent = chapters[i].dataset.chapter; };
  setNow(0);
  const check = () => {
    const mid = innerHeight * 0.45; let cur = 0;
    chapters.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) cur = i; });
    setNow(cur);
  };
  addEventListener('scroll', check, { passive: true }); check();
}

/* ---------- Roller-shutter page change ---------- */
const shutter = $('.shutter');
if (document.documentElement.classList.contains('shut-in') && shutter && gsap && !reduce) {
  try { sessionStorage.removeItem('agx-shutter'); } catch (e) {}
  gsap.fromTo(shutter, { scaleY: 1 }, { scaleY: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.05 });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a'); if (!a || reduce || !gsap) return;
  if (a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute('download')) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !/\.html$/.test(u.pathname) || (u.pathname === location.pathname && u.hash)) return;
  e.preventDefault();
  try { sessionStorage.setItem('agx-shutter', '1'); } catch (err) {}
  gsap.fromTo(shutter, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power3.in', onComplete: () => { location.href = u.href; } });
});
addEventListener('pageshow', (e) => { if (e.persisted && shutter) gsap?.set(shutter, { scaleY: 0 }); });

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (gsap && window.Lenis && !reduce && !phone) {
  lenis = new window.Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"], a[href*="index.html#"]').forEach((a) => a.addEventListener('click', (e) => {
  const u = new URL(a.href, location.href); if (u.pathname !== location.pathname || !u.hash) return;
  const t = document.querySelector(u.hash); if (!t) return;
  e.preventDefault(); e.stopPropagation();
  if (lenis) lenis.scrollTo(t, { offset: -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head')) }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}, true));

/* ---------- Reveals ---------- */
const io = new IntersectionObserver((ents) => ents.forEach((en) => {
  if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
  const sibs = el.parentElement ? [...el.parentElement.children].filter((x) => x.hasAttribute('data-rise')) : [];
  const d = Math.max(0, sibs.indexOf(el)) * 0.09;
  el.style.transitionDelay = `${d}s`; el.classList.add('is-in');
  $$('[data-count]', el).forEach(count); if (el.hasAttribute('data-count')) count(el);
}), { rootMargin: '0px 0px -12% 0px' });
$$('[data-rise], [data-gable-in], [data-count]').forEach((el) => { if (reduce) el.classList.add('is-in'); else io.observe(el); });

if (!gsap) { document.querySelector('[data-stage]')?.classList.add('open'); }

/* ---------- HERO: the CPPC holds the stage; Upstream, Midstream, Downstream arrive as chapters ---------- */
const stage = $('[data-stage]');
if (stage && gsap) {
  const world = $('[data-world]', stage); const frame = $('[data-frame]', stage); const photo = $('[data-photo]', stage);
  const beltLine = $('.belt-line', stage);
  const crates = $$('[data-crate]', stage); const outs = $$('[data-out]', stage);
  const doors = $$('.door', stage);
  const up = $('[data-pnl-up]', stage); const mid = $('[data-pnl-mid]', stage); const down = $('[data-pnl-down]', stage);
  const paths = $$('.leaders path', mid); const chips = $$('.chip', mid); const segs = $$('.seg', stage);
  const title = $('[data-title]', stage);
  const VW = () => innerWidth;
  // cover-fit the 16:9 photo inside the frame, keeping the door/sign overlays aligned
  const fit = () => {
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const w = Math.max(fw, fh * 16 / 9), h = w * 9 / 16;
    photo.style.width = `${w}px`; photo.style.height = `${h}px`;
    photo.style.left = `${(fw - w) * (phone ? 0.58 : 0.5)}px`; photo.style.top = `${(fh - h) * (phone ? 0.2 : 0.3)}px`;
    // chips on the grading photo: viewBox 177.8 x 100, slice
    const W = mid.clientWidth, H = mid.clientHeight, s = Math.max(W / 177.8, H / 100);
    const ox = (W - 177.8 * s) / 2, oy = (H - 100 * s) / 2;
    chips.forEach((c) => { const [x, y] = c.dataset.at.split(',').map(Number); c.style.left = `${ox + x * s}px`; c.style.top = `${oy + y * s}px`; });
  };
  fit(); addEventListener('resize', fit);
  // door centre (left roller door) as the push-in origin
  const origin = () => { const fr = frame.getBoundingClientRect(), pr = photo.getBoundingClientRect(); const x = pr.left - fr.left + pr.width * 0.413, y = pr.top - fr.top + pr.height * 0.56; return `${x}px ${y}px`; };

  const crateX = phone ? [0.02, 0.24, 0.46, 0.68] : [0.02, 0.105, 0.19, 0.275];
  const inX = phone ? [0.1, 0.32, 0.54, 0.76] : [0.3, 0.385, 0.47, 0.555];
  const outX = phone ? [0.5, 0.74] : [0.7, 0.82];
  const fillSeg = (k, v) => { const cells = $$('i', segs[k]); const on = Math.round(v * cells.length); cells.forEach((c, i) => c.classList.toggle('on', i < on)); };
  const setNowSeg = (k) => segs.forEach((s, i) => s.classList.toggle('now', i === k));
  const slide = phone ? 0 : 0.2;

  gsap.set(crates, { x: () => -0.2 * VW() });
  gsap.set(outs, { x: () => 0.62 * VW(), autoAlpha: 0 });
  gsap.set(beltLine, { scaleX: 0 });
  gsap.set(chips, { xPercent: -50, yPercent: -50 });

  // Opening (1 s): the building fades in with the sign glowing; the belt starts and crates of fruit arrive.
  stage.classList.add('open');
  const intro = gsap.timeline({ defaults: { ease: EASE } });
  intro.from(frame, { autoAlpha: 0, duration: 1 }, 0)
    .from(photo, { scale: 1.05, duration: 1.2 }, 0)
    .fromTo('[data-sign-glow]', { autoAlpha: 0 }, { autoAlpha: 0.95, duration: 0.45, ease: 'power2.out' }, 0.25)
    .to('[data-sign-glow]', { autoAlpha: 0.1, duration: 1, ease: 'power2.inOut' }, 0.7)
    .from($$('h1 span', title), { yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.1)
    .from('.st .facts, .st .hud', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.35)
    .to(beltLine, { scaleX: phone ? 1 : 0.4, duration: 0.9, ease: 'power3.inOut' }, 0.3)
    .to(crates.slice(0, phone ? 2 : 3), { x: (i) => crateX[i] * VW(), duration: 1, stagger: 0.12, ease: 'power3.out' }, 0.45);
  if (reduce) intro.progress(1);

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  // 0 → 1  Upstream: the stage slides right, the farm panel wipes in from the left, fruit rides into the building
  tl.to(title, { autoAlpha: 0, y: -30, duration: 0.3 }, 0)
    .to(world, { x: () => slide * VW(), duration: 0.8 }, 0)
    .to(up, { clipPath: 'inset(0 0% 0 0)', duration: 0.8 }, 0)
    .to(beltLine, { scaleX: 1, duration: 0.6 }, 0.1)
    .to(crates, { x: (i) => inX[i] * VW(), duration: 0.8, stagger: 0.06, ease: 'power1.inOut' }, 0.15)
    .to($('img.b', up), { opacity: 1, duration: 0.3, ease: 'none' }, 0.6)
  // 1 → 2  Midstream: push into the doorway; the grading hall opens through it
    .to(up, { clipPath: 'inset(0 100% 0 0)', duration: 0.5 }, 1.05)
    .to(world, { x: 0, duration: 0.5 }, 1.05)
    .to(doors, { autoAlpha: 1, duration: 0.25, stagger: 0.04 }, 1.05)
    .to(crates, { autoAlpha: 0, x: '+=60', duration: 0.35, stagger: 0.04 }, 1.1)
    .to(frame, { scale: phone ? 2.4 : 3.2, duration: 0.7, ease: 'power2.in' }, 1.15)
    .to(mid, { autoAlpha: 1, duration: 0.15 }, 1.35)
    .to(mid, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power2.out' }, 1.45)
    .fromTo($('img', mid), { scale: 1.25 }, { scale: 1, duration: 0.7, ease: 'power2.out' }, 1.45)
    .to(paths, { strokeDashoffset: 0, duration: 0.35, stagger: 0.06, ease: 'none' }, 1.75)
    .fromTo(chips, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.06 }, 1.85)
  // 2 → 3  Downstream: pull back out; the export panel wipes in from the right; cartons leave
    .to(chips, { autoAlpha: 0, duration: 0.15 }, 2.05)
    .to(mid, { clipPath: 'inset(48% 57% 34% 39%)', duration: 0.45, ease: 'power2.in' }, 2.1)
    .to(mid, { autoAlpha: 0, duration: 0.12 }, 2.45)
    .to(frame, { scale: 1, duration: 0.6, ease: 'power2.out' }, 2.25)
    .to(world, { x: () => -slide * VW(), duration: 0.6 }, 2.3)
    .to(down, { clipPath: 'inset(0 0 0 0%)', duration: 0.6 }, 2.3)
    .to(outs, { autoAlpha: 1, duration: 0.1, stagger: 0.1 }, 2.4)
    .to(outs, { x: (i) => outX[i] * VW(), duration: 0.55, stagger: 0.1, ease: 'power2.out' }, 2.4)
    .to($('img.b', down), { opacity: 1, duration: 0.3, ease: 'none' }, 2.75)
    .to({}, { duration: 0.12 }, 2.9);
  const T = tl.duration();
  const onProg = (p) => { const t = p * T; [0, 1, 2].forEach((k) => fillSeg(k, Math.min(1, Math.max(0, t - k)))); setNowSeg(Math.min(2, Math.floor(t))); };
  if (reduce) { tl.progress(1); onProg(1); }
  else {
    ScrollTrigger.create({
      trigger: stage, start: `top top+=${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 68}`,
      end: phone ? '+=180%' : '+=300%', pin: true, scrub: phone ? 0.6 : 1, animation: tl, invalidateOnRefresh: true,
      onRefresh: () => { fit(); gsap.set(frame, { transformOrigin: origin() }); },
      onUpdate: (s) => onProg(s.progress),
    });
    gsap.set(frame, { transformOrigin: origin() });
    onProg(0);
  }
}

/* ---------- Inside the CPPC: the front wall lifts to show four rooms ---------- */
const cppc = $('[data-cppc]');
if (cppc && gsap) {
  const wall = $('.wall', cppc); const rooms = $$('.room', cppc); const copies = $$('.room-copy', cppc);
  const bars = $$('.cppc-bar li', cppc); const fills = $$('.cppc-bar b', cppc);
  const nums = $$('.room-copy [data-n]', cppc);
  gsap.set(rooms.slice(1), { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(copies.slice(1), { autoAlpha: 0, y: 30 });
  const setNum = (el, v) => { el.textContent = Math.round(v).toLocaleString('en'); };
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(wall, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', duration: 1, ease: 'power2.inOut' }, 0)
    .to('.wall-cap', { autoAlpha: 0, duration: 0.3 }, 0)
    .from(copies[0], { autoAlpha: 0, y: 30, duration: 0.4 }, 0.55)
    .fromTo(rooms[0].querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.4 }, 0);
  const counters = [nums[0], nums[1], nums[2], nums[3]];
  if (counters[0]) tl.fromTo({ v: 0 }, { v: 0 }, { v: +counters[0].dataset.n, duration: 0.6, onUpdate() { setNum(counters[0], this.targets()[0].v); } }, 0.55);
  bars.forEach((b, i) => {
    const at = i === 0 ? 0 : 1 + (i - 1) * 1;
    tl.to(fills[i], { scaleX: 1, duration: i === 0 ? 1.2 : 1 }, i === 0 ? 0 : at + 0.2);
    if (i > 0) {
      tl.to(copies[i - 1], { autoAlpha: 0, y: -30, duration: 0.3 }, at + 0.2)
        .to(rooms[i], { clipPath: 'inset(0% 0 0 0)', duration: 0.6, ease: 'power2.inOut' }, at + 0.2)
        .fromTo(rooms[i].querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1 }, at + 0.2)
        .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.35 }, at + 0.6);
      const c = counters[i];
      if (c) { const o = { v: 0 }; tl.to(o, { v: +c.dataset.n, duration: 0.5, onUpdate: () => setNum(c, o.v) }, at + 0.6); }
    }
  });
  tl.to({}, { duration: 0.3 });
  const T = tl.duration();
  if (reduce) { tl.progress(1); }
  else ScrollTrigger.create({
    trigger: cppc, start: `top top+=${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 68}`,
    end: phone ? '+=260%' : '+=300%', pin: true, scrub: phone ? 0.6 : 1, animation: tl,
    onUpdate: (s) => { const t = s.progress * T; const k = t < 1.2 ? 0 : Math.min(3, Math.floor(t - 0.2)); bars.forEach((b, i) => b.classList.toggle('now', i === k)); },
  });
}

/* ---------- Line drawing and scroll-linked bits ---------- */
if (gsap && !reduce) {
  $$('[data-draw]').forEach((svg) => {
    const ps = $$('path.route, path.arc', svg);
    ps.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L}`; });
    gsap.to(ps, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.12, scrollTrigger: { trigger: svg, start: 'top 80%' } });
    gsap.from($$('.pin, .mk, .hub', svg), { autoAlpha: 0, scale: 0.4, transformOrigin: 'center', duration: 0.6, stagger: 0.12, ease: EASE, delay: 0.4, scrollTrigger: { trigger: svg, start: 'top 80%' } });
  });
  $$('.flow-line b, .tl-fill').forEach((b) => gsap.to(b, { scaleX: 1, scaleY: 1, ease: 'none', scrollTrigger: { trigger: b.parentElement, start: 'top 80%', end: 'bottom 50%', scrub: 0.8 } }));
  // page hero: photo settles while the gable opens
  $$('.page-hero .ph-bg').forEach((bg) => {
    gsap.from(bg, { clipPath: 'polygon(0 100%, 50% 100%, 100% 100%, 100% 100%, 0 100%)', duration: 1.1, ease: 'power3.out', delay: 0.15 });
    gsap.from(bg.querySelector('img'), { scale: 1.12, duration: 1.6, ease: 'power3.out' });
    gsap.to(bg.querySelector('img'), { yPercent: 8, ease: 'none', scrollTrigger: { trigger: bg, start: 'top top', end: 'bottom top', scrub: true } });
  });
  $$('.page-hero h1, .page-hero .lede, .page-hero .ph-facts, .page-hero .acts').forEach((el, i) => gsap.from(el, { y: 26, autoAlpha: 0, duration: 0.9, ease: EASE, delay: 0.35 + i * 0.1 }));
  // proof photos drift at different speeds
  $$('[data-drift]').forEach((el) => gsap.fromTo(el, { y: +el.dataset.drift }, { y: -el.dataset.drift, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
}
addEventListener('load', () => ScrollTrigger?.refresh());

/* Conveyor joins: an item rides the belt as the join scrolls past */
if (gsap && !reduce) {
  $$('[data-carry]').forEach((c) => {
    const item = c.querySelector('.carry-item');
    gsap.fromTo(item, { x: () => -item.offsetWidth - 20 }, { x: () => c.offsetWidth + 20, ease: 'none', immediateRender: true, scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true } });
  });
}

/* Phone WhatsApp button appears once the first screen is read */
const waf = document.querySelector('.wa-float');
if (waf) { const anchor = document.getElementById('for') || document.querySelector('main > section:nth-of-type(2)'); const t = () => waf.classList.toggle('show', anchor ? anchor.getBoundingClientRect().top < innerHeight * 0.8 : scrollY > innerHeight * 0.6); addEventListener('scroll', t, { passive: true }); t(); }
