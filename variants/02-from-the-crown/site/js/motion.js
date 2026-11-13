// V2 · From the Crown: shared motion. Lenis + ScrollTrigger on one clock, line reveals, diamond-eye photo masks,
// counters, timeline year flips, the reel, drawn dropdowns, month chips, header and the diamond-iris page change.
import { site, products } from './app.js';
import './pages.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 820px)').matches;
const waitGsap = () => new Promise((r) => { const t = () => (window.gsap && window.ScrollTrigger ? r() : setTimeout(t, 20)); t(); });
await waitGsap();
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger, window.DrawSVGPlugin, window.Flip);
window.AGX = { gsap, ScrollTrigger, reduce, phone };

// Smooth scroll, one clock.
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.AGX.lenis = lenis;
}
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t || a.getAttribute('href') === '#') return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(t, { offset: -10, duration: 1.4 }); else t.scrollIntoView();
}));

// Header pill hides on the way down, returns on the way up.
const head = document.querySelector('.head');
let lastY = 0;
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
  const y = s.scroll();
  if (document.documentElement.classList.contains('menu-open')) return;
  head.classList.toggle('is-hidden', y > 300 && y > lastY + 2);
  if (y < lastY - 2) head.classList.remove('is-hidden');
  lastY = y;
} });

// Headlines: lines rise out of a mask at full brightness.
document.querySelectorAll('[data-lines]').forEach((h) => {
  if (h.querySelector('.ln')) return;
  const parts = h.innerHTML.split(/<br\s*\/?>/i);
  h.innerHTML = parts.map((p) => `<span class="ln" style="display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em"><span style="display:inline-block">${p}</span></span>`).join('');
  const inner = h.querySelectorAll('.ln > span');
  if (reduce) return;
  gsap.set(inner, { yPercent: 110 });
  ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => gsap.to(inner, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }) });
});

// Rises and diamond reveals.
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
const watch = () => document.querySelectorAll('.rise:not(.is-in), .dia-reveal:not(.is-in)').forEach((el, i) => {
  if (reduce) { el.classList.add('is-in'); return; }
  if (el.classList.contains('rise') && !el.style.transitionDelay) el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});
watch();
setTimeout(watch, 600);

// Counters (data-count, from pages.js numbers).
document.querySelectorAll('[data-count]').forEach((el) => {
  const to = +el.dataset.count;
  if (reduce) return;
  const o = { v: 0 };
  el.textContent = '0';
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en'); } }) });
});

// Parallax on page-hero and the numbers field photo.
if (!reduce) {
  document.querySelectorAll('[data-parallax], [data-parallax-box]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -4, scale: 1.08 }, { yPercent: 6, scale: 1.08, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top top', end: 'bottom top', scrub: true } });
  });
  // page hero opening: the photo settles in, eye diamonds part
  document.querySelectorAll('.phero-media img').forEach((img) => gsap.from(img.parentNode, { clipPath: 'polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%)', duration: 1.1, ease: 'expo.out' }));
}

// Flow line draws (CPPC).
document.querySelectorAll('[data-draw]').forEach((p) => {
  if (reduce) return;
  gsap.from(p, { drawSVG: '0%', duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('section'), start: 'top 40%' } });
});

// Timeline: the gold line runs and each year flips up.
document.querySelectorAll('[data-tl]').forEach((tl) => {
  const yrs = tl.querySelectorAll('.yr'); const bar = tl.querySelector('[data-tl-bar]');
  if (reduce) { if (bar) bar.style.transform = 'none'; return; }
  gsap.set(yrs, { rotateX: -90, opacity: 0 });
  const t = gsap.timeline({ scrollTrigger: { trigger: tl, start: 'top 78%' } });
  if (bar) t.to(bar, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
  t.to(yrs, { rotateX: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: 0.24 }, 0.1);
  t.from(tl.querySelectorAll('li p'), { y: 16, opacity: 0, duration: .8, ease: 'expo.out', stagger: 0.24 }, 0.3);
});

// Proof reel: drifts slowly at rest, scroll adds speed.
document.querySelectorAll('[data-reel]').forEach((reel) => {
  if (reduce) return;
  let x = 0, v = 0.35, boost = 0, w = 0, run = false;
  const measure = () => { w = reel.scrollWidth / 2; };
  measure(); addEventListener('resize', measure);
  ScrollTrigger.create({ trigger: reel, start: 'top bottom', end: 'bottom top', onToggle: (s) => { run = s.isActive; }, onUpdate: (s) => { boost = Math.min(6, Math.abs(s.getVelocity()) / 300); } });
  gsap.ticker.add(() => { if (!run) return; boost *= 0.94; x -= v + boost; if (-x >= w) x += w; reel.style.transform = `translate3d(${x}px,0,0)`; });
});

// Drawn dropdowns: every <select class="field"> becomes a styled list; the select stays as the value carrier.
function enhanceSelect(sel) {
  if (sel.dataset.dd) return; sel.dataset.dd = '1';
  const wrap = document.createElement('div'); wrap.className = 'dd';
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'field dd-btn';
  btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
  const list = document.createElement('ul'); list.className = 'dd-list'; list.setAttribute('role', 'listbox');
  sel.hidden = true; sel.parentNode.insertBefore(wrap, sel); wrap.append(btn, list, sel);
  let act = 0;
  const render = () => {
    list.innerHTML = [...sel.options].map((o, i) => `<li role="option" data-i="${i}" aria-selected="${o.selected}">${o.text}</li>`).join('');
    btn.textContent = sel.options[sel.selectedIndex]?.text || 'Choose';
  };
  const close = () => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  const open = () => { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); act = sel.selectedIndex; mark(); };
  const mark = () => list.querySelectorAll('li').forEach((li, i) => li.classList.toggle('act', i === act));
  const pick = (i) => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); render(); close(); btn.focus(); };
  btn.addEventListener('click', () => (wrap.classList.contains('open') ? close() : open()));
  list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
  btn.addEventListener('keydown', (e) => {
    const n = sel.options.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!wrap.classList.contains('open')) open(); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; mark(); }
    else if (e.key === 'Enter' && wrap.classList.contains('open')) { e.preventDefault(); pick(act); }
    else if (e.key === 'Escape') close();
    else if (e.key.length === 1) { const k = e.key.toLowerCase(); const i = [...sel.options].findIndex((o) => o.text.toLowerCase().startsWith(k)); if (i >= 0) { act = i; if (!wrap.classList.contains('open')) open(); mark(); } }
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  sel.addEventListener('change', render);
  render();
}
document.querySelectorAll('select.field').forEach(enhanceSelect);

// Chips carry hidden inputs; month chips for the next six months.
document.querySelectorAll('[data-months]').forEach((box) => {
  const d = new Date(); const out = [];
  for (let i = 1; i <= 6; i++) { const m = new Date(d.getFullYear(), d.getMonth() + i, 1); out.push(m.toLocaleString('en-GB', { month: 'short', year: 'numeric' })); }
  box.innerHTML = out.map((m) => `<button type="button" class="chip" data-v="${m}" aria-pressed="false">${m}</button>`).join('');
  box.dataset.chips = 'start'; box.dataset.optional = '1';
});
document.querySelectorAll('[data-chips]').forEach((box) => {
  const form = box.closest('form'); const input = form.elements[box.dataset.chips];
  const sync = () => box.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.v === input.value)));
  box.addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    input.value = box.dataset.optional && input.value === c.dataset.v ? '' : c.dataset.v;
    sync(); form.dispatchEvent(new Event('input', { bubbles: true }));
  });
  sync();
  form.addEventListener('agx-sync', sync);
});
// Steppers: disable minus at the minimum.
document.querySelectorAll('.stepper').forEach((s) => {
  const input = s.querySelector('input'); const minus = s.querySelector('[data-by^="-"]');
  const upd = () => { minus.disabled = +input.value <= +input.min; };
  s.closest('form').addEventListener('input', upd); s.addEventListener('click', () => setTimeout(upd)); upd();
});
// Re-sync chips after pages.js presets (contact.html?product=...).
document.querySelectorAll('form').forEach((f) => f.dispatchEvent(new Event('agx-sync')));

// Spec sheet: what Agrionyx can state now, per variety and form.
const SHEET = {
  'MD2': { name: 'MD2', maturity: '14–16 months to harvest <span class="tbc">[client to confirm]</span>', flesh: 'Golden, sweet, low-acid', source: 'Own farms and contract farmers in 6 states' },
  'Sarawak Gold (SG1)': { name: 'Sarawak Gold (SG1)', maturity: 'About 9 months to harvest <span class="tbc">[client to confirm]</span>', flesh: 'Deep golden <span class="tbc">[client to confirm]</span>', source: 'Own SG1 farm in Pontian, Johor, and growers' },
  'Not sure yet': { name: 'MD2 or SG1', maturity: 'We advise by market and season', flesh: 'Golden', source: 'Own farms and 50+ contract farmers' },
};
const FORM = {
  'Fresh': { pack: 'Graded and packed at the CPPC, kept in 3 cold rooms', grades: 'Weight grades, counts per carton, Brix <span class="tbc">[client to confirm]</span>' },
  'IQF frozen': { pack: 'Peeled, cut and individually quick frozen', grades: 'Cuts, carton sizes, shelf life <span class="tbc">[client to confirm]</span>' },
  'Both': { pack: 'Fresh in cold rooms; IQF frozen on our line', grades: 'Grades and cuts <span class="tbc">[client to confirm]</span>' },
};
document.querySelectorAll('[data-wa-form="brief"]').forEach((form) => {
  const root = form.closest('[data-wa-tool]');
  const rows = root.querySelector('[data-sheet-rows]'); const title = root.querySelector('[data-sheet-title]');
  if (!rows) return;
  const upd = () => {
    const v = SHEET[form.elements.variety.value] || SHEET.MD2; const f = FORM[form.elements.form.value] || FORM.Fresh;
    const t = +form.elements.tonnes.value || 0;
    title.textContent = `${form.elements.form.value === 'IQF frozen' ? 'IQF frozen' : form.elements.form.value === 'Both' ? 'Fresh and IQF' : 'Fresh'} ${v.name}`;
    rows.innerHTML = [
      ['Maturity', v.maturity], ['Flesh', v.flesh], ['Grown at', v.source], ['Handling', f.pack], ['Specs', f.grades],
      ['Volume', `${t} t a week, about ${(t / 6).toFixed(1)} t a working day. The CPPC handles up to 50 t a day.`],
      ['Shipping', 'Air via KLIA, sea via Port Klang. Incoterms, MOQ <span class="tbc">[client to confirm]</span>'],
      ['Price', site.priceNote],
    ].map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join('');
    if (!reduce) gsap.from(rows.children, { opacity: 0, x: 10, duration: .5, stagger: 0.03, ease: 'expo.out' });
  };
  form.addEventListener('input', upd); form.addEventListener('change', upd); upd();
});

// Diamond iris page change (internal links).
const iris = document.querySelector('.iris');
if (iris && !reduce) {
  if (document.documentElement.classList.contains('iris-in')) {
    iris.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => iris.classList.add('go')));
    setTimeout(() => iris.classList.remove('open', 'go'), 900);
    try { sessionStorage.removeItem('agx-iris'); } catch (e) { /* private */ }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    iris.classList.add('cover');
    try { sessionStorage.setItem('agx-iris', '1'); } catch (err) { /* private */ }
    setTimeout(() => { location.href = url.href; }, 600);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) iris.classList.remove('cover', 'open', 'go'); });
}

// Menu: close on link and Esc, stop smooth scroll while open.
const mb = document.querySelector('[data-menu-btn]');
if (mb) {
  new MutationObserver(() => { const o = document.documentElement.classList.contains('menu-open'); if (lenis) (o ? lenis.stop() : lenis.start()); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { document.documentElement.classList.remove('menu-open'); mb.setAttribute('aria-expanded', 'false'); } });
}
setTimeout(() => ScrollTrigger.refresh(), 400);

// Inner page hero: the diamond opens, the fruit steps in, the gold stroke signs under the headline.
if (!reduce) {
  document.querySelectorAll('[data-ph-dia]').forEach((d) => {
    gsap.from(d, { clipPath: 'polygon(50% 42%, 58% 50%, 50% 58%, 42% 50%)', duration: 1.1, ease: 'expo.out' });
    gsap.fromTo(d.querySelector('img'), { scale: 1.2 }, { scale: 1.04, duration: 1.6, ease: 'expo.out' });
    gsap.to(d.querySelector('img'), { yPercent: 6, ease: 'none', scrollTrigger: { trigger: d, start: 'top top', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('[data-ph-fruit]').forEach((f) => {
    gsap.from(f, { y: 80, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.2 });
    gsap.to(f, { rotate: 1.5, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' });
  });
  if (document.body.dataset.page !== 'home') document.querySelectorAll('[data-sign] path').forEach((p) => gsap.fromTo(p, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.3 }));
}
