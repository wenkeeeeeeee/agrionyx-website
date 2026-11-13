// Site-wide motion: Lenis smooth scroll on the GSAP clock, the header turning navy, line reveals, the gold road
// drawing across section joins, and the page change where the road wipes across.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ready = () => new Promise((r) => (window.gsap && window.ScrollTrigger ? r() : addEventListener('load', r, { once: true })));

// Page change: the road wipes across
const wipe = document.querySelector('.wipe');
try {
  if (wipe && sessionStorage.getItem('agx-wipe') && !reduce) { wipe.classList.add('out'); sessionStorage.removeItem('agx-wipe'); }
} catch (e) {}
addEventListener('pageshow', (e) => { if (e.persisted && wipe) wipe.className = 'wipe'; });
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || !wipe || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
  if (a.hasAttribute('data-scroll')) return;
  e.preventDefault();
  try { sessionStorage.setItem('agx-wipe', '1'); } catch (err) {}
  wipe.className = 'wipe in';
  setTimeout(() => { location.href = url.href; }, 520);
});

// Header: transparent over the film, navy after the first screen(s)
const head = document.querySelector('[data-head]');
const heroEl = document.querySelector('.cx, .journey, .p-hero, .pdp');
const onHead = () => {
  if (!head) return;
  const end = heroEl ? heroEl.offsetTop + heroEl.offsetHeight - innerHeight * (heroEl.matches('.journey, .cx') ? 1 : .15) - 80 : 0;
  head.classList.toggle('is-solid', scrollY > Math.max(40, end));
  const max = document.documentElement.scrollHeight - innerHeight;
  head.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(3) : 0);
};
addEventListener('scroll', onHead, { passive: true });
onHead();

// Menu: lock scroll while open, close on link and Esc
const closeMenu = () => { document.documentElement.classList.remove('menu-open'); document.querySelector('[data-menu-btn]')?.setAttribute('aria-expanded', 'false'); window.__lenis?.start(); };
document.querySelector('[data-menu-btn]')?.addEventListener('click', () => {
  if (document.documentElement.classList.contains('menu-open')) window.__lenis?.stop(); else window.__lenis?.start();
});
document.querySelectorAll('[data-nav] a').forEach((a) => a.addEventListener('click', closeMenu));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// Reveals: lines wipe in at full brightness
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
const watch = () => document.querySelectorAll('.rv, .rv-img').forEach((el) => io.observe(el));
watch();
window.__watchReveals = watch;
// failsafe: never leave content hidden
setTimeout(() => document.querySelectorAll('.rv, .rv-img').forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); }), 2500);

await ready();
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger, window.DrawSVGPlugin);
if (!reduce && window.Lenis) {
  const lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    lenis.scrollTo(t, { duration: 1.6 });
  }, true));
}

// The gold road draws itself across each join
document.querySelectorAll('[data-draw]').forEach((p) => {
  if (reduce) return;
  gsap.fromTo(p, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: p.closest('svg').parentElement, start: 'top 95%', end: 'top 25%', scrub: 0.6 } });
});
window.__motionReady = true;
window.dispatchEvent(new Event('motion-ready'));
