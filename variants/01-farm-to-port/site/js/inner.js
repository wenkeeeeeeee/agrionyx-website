// Inner pages: lists drawn in this variant's style (steps on the road, services, doors, timeline, leaders) and their motion.
import { site, company, esc, waLink } from './app.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const onMotion = (fn) => (window.__motionReady ? fn() : addEventListener('motion-ready', fn, { once: true }));
const put = (sel, html) => document.querySelectorAll(sel).forEach((el) => { el.innerHTML = html; });
const arrow = '<svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 5h16M12 1l4 4-4 4"/></svg>';

put('[data-steps]', company.process.map((s, i) => `<li style="--i:${i}"><span class="n">${i + 1}</span><div class="t"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div><div class="ph rv-img"><img src="${esc(s.image)}" alt="" loading="lazy" width="800" height="400"><span class="illus">Illustrative</span></div></li>`).join(''));
put('[data-svc]', company.services.map((s) => `<li id="${esc(s.id)}"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p>${s.link ? `<a class="link" href="${esc(s.link)}">See contract farming</a>` : `<a class="link" href="${waLink(`Hi ${site.brand}, I'd like to talk about ${s.name.toLowerCase()}.`)}" target="_blank" rel="noopener">Talk to us on WhatsApp</a>`}</li>`).join(''));
put('[data-doors2]', company.doors.map((d) => `<li><p class="tag">${esc(d.for)}</p><h3 style="margin-top:12px">${esc(d.name)}</h3><p>${esc(d.text)}</p><a class="link" href="${esc(d.link)}">${esc(d.name)} ${arrow}</a></li>`).join(''));
put('[data-timeline2]', company.timeline.map((t) => `<li><strong>${esc(t.year)}</strong><p>${esc(t.text)}</p></li>`).join(''));
put('[data-roles2]', company.roles.map((r) => `<li><strong>${esc(r.role)}</strong><span>${esc(r.org)}</span></li>`).join(''));
put('[data-leaders2]', company.leaders.map((l) => `<li><div class="cut rv-img"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" width="420" height="560"></div><div class="who"><h3>${esc(l.name)}</h3><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></div></li>`).join(''));
window.__watchReveals?.();

onMotion(() => {
  const { gsap } = window;
  window.__watchReveals?.();
  if (reduce) return;
  // the hero photo eases away as you leave it
  const hi = document.querySelector('.p-hero > img:not(.framed), .pdp .ph img');
  if (hi) gsap.to(hi, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hi.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
  // the road runs down the steps
  const steps = document.querySelector('.steps');
  if (steps) {
    gsap.fromTo(steps, { '--road': 0 }, { '--road': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 85%', end: 'top 30%', scrub: .6 } });
    gsap.from(steps.querySelectorAll('.n'), { scale: .4, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: steps, start: 'top 75%' } });
  }
  document.querySelectorAll('.timeline2').forEach((tl) => gsap.from(tl.children, { y: 40, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: tl, start: 'top 80%' } }));
  document.querySelectorAll('.values2, .svc, .streams3, .facts2, .farm-list, .grid').forEach((g) => gsap.from(g.children, { y: 36, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%' } }));
  document.querySelectorAll('.caps li').forEach((li, i) => gsap.from(li, { yPercent: 100, opacity: 0, duration: .8, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: li.parentElement, start: 'top 85%' } }));
});

// Chapter index on every page hero: the four chapters of the business, this page lit, the road filled up to it.
const chapters = [['01', 'Farms', 'grow.html'], ['02', 'Farmers', 'farm-with-us.html'], ['03', 'CPPC', 'how-it-works.html'], ['04', 'Markets', 'contact.html']];
const pHero = document.querySelector('.p-hero');
if (pHero) {
  const here = location.pathname.split('/').pop();
  const at = chapters.findIndex((c) => c[2] === here);
  const nav = document.createElement('nav');
  nav.className = 'p-idx'; nav.setAttribute('aria-label', 'Our chapters');
  nav.innerHTML = chapters.map((c, i) => `${i ? `<i class="${i <= at ? 'on' : ''}"></i>` : ''}<a href="${c[2]}"${i === at ? ' aria-current="page"' : ''}><b>${c[0]}</b>${c[1]}</a>`).join('');
  pHero.appendChild(nav);
  pHero.classList.add('has-idx');
}

// About: the real event photos as a collage that settles into place
const ic = document.querySelector('[data-collage-inner]');
if (ic) {
  const pos = [[0, 0, 40, -2, -30, -40, -10], [36, 4, 34, 2.5, 40, -60, 14], [68, 0, 32, -1.5, 60, -30, 10], [4, 44, 30, 2, -50, 50, -12], [30, 40, 36, -3, 10, 80, 10], [64, 46, 34, 3, 60, 40, -16], [12, 72, 30, -2, -40, 90, 12], [46, 74, 30, 1.5, 50, 100, -8]];
  ic.innerHTML = company.events.slice(0, 8).map((e, i) => { const [x, y, w, r, sx, sy, sr] = pos[i]; return `<figure style="--x:${x}%;--y:${y}%;--w:${w}%;--r:${r}deg;--sx:${sx}%;--sy:${sy}%;--sr:${sr}deg;z-index:${i + 1}" tabindex="0"><img src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy" width="800" height="530"><figcaption>${esc(e.title)}</figcaption></figure>`; }).join('');
  onMotion(() => { if (reduce) return; ic.querySelectorAll('figure').forEach((f) => window.gsap.fromTo(f, { '--k': 1 }, { '--k': 0, ease: 'power2.out', scrollTrigger: { trigger: ic, start: 'top 95%', end: 'top 30%', scrub: .8 } })); });
}
// Photo bands drift as you pass
onMotion(() => { if (reduce) return; document.querySelectorAll('.ib-bg, .ib-blur, .duo-half img').forEach((im) => window.gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })); });
