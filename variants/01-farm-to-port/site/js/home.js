// Home: "One company, four chapters" hero (farms → farmers → CPPC → markets, wiped along the gold farm road),
// the two doors, the product chooser, the season rail, numbers staked in the field, the proof collage and the map.
import { site, products, company, esc } from './app.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = innerWidth < 800;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const onMotion = (fn) => (window.__motionReady ? fn() : addEventListener('motion-ready', fn, { once: true }));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const arrow = '<svg class="arr" viewBox="0 0 18 10" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 5h16M12 1l4 4-4 4"/></svg>';

/* ---------------- HERO: four chapters ---------------- */
const hero = document.querySelector('[data-cx]');
if (hero) {
  const chs = [...hero.querySelectorAll('.cx-ch')];
  const idx = [...hero.querySelectorAll('[data-go]')];
  const roads = [...hero.querySelectorAll('.cx-road > i')];
  const texts = [...hero.querySelectorAll('[data-t]')];
  const facts = [...hero.querySelectorAll('[data-f]')];
  const heads = Object.fromEntries([...hero.querySelectorAll('[data-h]')].map((el) => [el.dataset.h, el]));
  const edge = hero.querySelector('.cx-edge'), eLine = edge.querySelector('line'), eDot = edge.querySelector('circle');
  const illus = hero.querySelector('.cx-illus');
  const kb = hero.querySelector('.cx-kb'), inset = hero.querySelector('.cx-inset');
  const frame = hero.querySelector('.cx-frame'), pack = hero.querySelector('.cx-pack'), blur = hero.querySelector('.cx-blur');
  const poster = hero.querySelector('.cx-poster');

  // frame sequences (kit scrub frames), drawn to canvas
  const mk = (name, count) => ({ count, imgs: [], dir: `assets/scrub/${name}${phone ? '/m' : ''}` });
  const seqs = { farm: mk('farm', 28), port: mk('port', 36), dusk: mk('dusk', 24) };
  let dirty = true;
  const load = (s, i) => {
    if (s.imgs[i]) return s.imgs[i].p;
    const im = new Image(); im.decoding = 'async'; im.src = `${s.dir}/${String(i + 1).padStart(4, '0')}.webp`;
    s.imgs[i] = im; im.p = im.decode().then(() => { im.ok = true; dirty = true; }, () => {});
    return im.p;
  };
  const nearest = (s, i) => { for (let d = 0; d < s.count; d++) { if (s.imgs[i - d]?.ok) return s.imgs[i - d]; if (s.imgs[i + d]?.ok) return s.imgs[i + d]; } return null; };
  const fill = async (s, strides) => { for (const st of strides) { const b = []; for (let i = 0; i < s.count; i += st) b.push(load(s, i)); await Promise.all(b); } };
  const cv = {};
  hero.querySelectorAll('canvas[data-seq]').forEach((c) => { cv[c.dataset.seq] = { c, ctx: c.getContext('2d'), W: 0, H: 0, last: '' }; });
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 1.5);
    Object.values(cv).forEach((o) => { o.W = o.c.width = Math.round(o.c.clientWidth * d); o.H = o.c.height = Math.round(o.c.clientHeight * d); o.last = ''; });
    dirty = true;
  };
  const cover = (o, im, alpha = 1) => {
    const s = Math.max(o.W / im.naturalWidth, o.H / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    o.ctx.globalAlpha = alpha; o.ctx.drawImage(im, (o.W - w) / 2, (o.H - h) / 2, w, h); o.ctx.globalAlpha = 1;
  };

  // lazy pictures for chapters 2-4: fetched once the visitor shows intent, so the first load stays light
  let started = false;
  const go = () => {
    if (started) return; started = true;
    hero.querySelectorAll('img[data-src]').forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
    fill(seqs.farm, [4, 2, 1]).then(() => fill(seqs.port, [6, 3, 1])).then(() => fill(seqs.dusk, [4, 2, 1]));
  };
  ['scroll', 'wheel', 'touchstart', 'keydown', 'pointermove'].forEach((ev) => addEventListener(ev, go, { passive: true, once: true }));
  setTimeout(go, 4000);

  const N = 4, seg = 1 / N, half = phone ? .06 : .05;
  let target = 0, cur = 0, state = -1, lastP = -1;
  const progress = () => { const r = hero.getBoundingClientRect(); const run = r.height - innerHeight; return run > 0 ? clamp(-r.top / run) : 0; };

  const render = (p) => {
    const W = hero.clientWidth, H = innerHeight, k = W * (phone ? .5 : .32);
    // wipes along the slanted road
    let edgeT = -1;
    chs.forEach((ch, i) => {
      if (i === 0) return;
      const b = i * seg, t = smooth(b - half, b + half, p);
      if (t <= 0) { ch.style.visibility = 'hidden'; return; }
      ch.style.visibility = 'visible';
      if (t >= 1) { ch.style.clipPath = 'none'; return; }
      const x = -k + t * (W + k);
      ch.style.clipPath = `polygon(0 0, ${x + k}px 0, ${x}px ${H}px, 0 ${H}px)`;
      edgeT = t; edge.dataset.x = x;
    });
    if (edgeT > 0 && edgeT < 1) {
      const x = +edge.dataset.x;
      eLine.setAttribute('x1', x); eLine.setAttribute('y1', H + 4); eLine.setAttribute('x2', x + k); eLine.setAttribute('y2', -4);
      eDot.setAttribute('cx', x + k * .5); eDot.setAttribute('cy', H * .5);
      edge.style.opacity = 1;
    } else edge.style.opacity = 0;

    // 01 farm frames
    const fo = cv.farm;
    if (fo && p < seg + half) {
      const im = nearest(seqs.farm, Math.round(clamp(p / (seg + half)) * (seqs.farm.count - 1)));
      if (im && (dirty || fo.last !== im.src)) { cover(fo, im); fo.last = im.src; if (poster) poster.style.opacity = 0; }
    }
    // 02 farmers: Ken Burns push and a faster parallax photo
    const l1 = clamp((p - seg + half) / (seg + half * 2));
    if (kb) kb.style.transform = `scale(${1.04 + l1 * .16}) translate3d(${-l1 * 2}%, ${-l1 * 1.5}%, 0)`;
    if (inset) inset.style.transform = `translate3d(0, ${(1 - l1) * 26 - 14}vh, 0) rotate(${2 - l1 * 4}deg)`;
    // 03 CPPC: the real building framed sharp over its blur, then the grading line rises over it
    const l2 = clamp((p - 2 * seg) / seg);
    const pk = smooth(.42, .7, l2);
    if (frame) frame.style.transform = `translate3d(0, ${-pk * 12}vh, 0) scale(${1.04 - l2 * .08})`;
    if (blur) blur.style.transform = `scale(${1.18 + l2 * .06})`;
    if (pack) pack.style.clipPath = `inset(${(1 - pk) * 100}% 0 0 0)`;
    // 04 port to dusk
    const po = cv.port;
    if (po && p > 3 * seg - half) {
      const l3 = clamp((p - (3 * seg - half)) / (seg + half));
      const a = nearest(seqs.port, Math.round(clamp(l3 / .7) * (seqs.port.count - 1)));
      const fd = smooth(.5, .92, l3);
      const d = fd > 0 ? nearest(seqs.dusk, Math.round(clamp((l3 - .5) / .5) * (seqs.dusk.count - 1))) : null;
      const key = `${a?.src}|${d?.src}|${fd.toFixed(2)}`;
      if (a && (dirty || po.last !== key)) { po.ctx.clearRect(0, 0, po.W, po.H); cover(po, a); if (d) cover(po, d, fd); po.last = key; }
    }
    dirty = false;

    // side index: the road fills between the numbers
    roads.forEach((r, i) => r.style.setProperty('--f', clamp((p - i * seg) / seg).toFixed(3)));
    const st = clamp(Math.floor((p + 0.0001) / seg), 0, N - 1);
    const sub = st === 2 && pk > .5 ? 'pack' : '';
    if (st + sub !== state) {
      state = st + sub;
      idx.forEach((b, i) => { b.classList.toggle('is-on', i === st); b.setAttribute('aria-current', i === st ? 'step' : 'false'); });
      texts.forEach((t, i) => t.classList.toggle('is-on', i === st));
      facts.forEach((f, i) => f.classList.toggle('is-on', i === st));
      const h = st < 2 ? 'root' : st === 2 ? 'pack' : 'world';
      Object.entries(heads).forEach(([key, el]) => { el.classList.toggle('is-on', key === h); });
      illus.classList.toggle('is-off', st === 2 && !sub);
      hero.dataset.ch = st;
    }
  };

  const tick = () => {
    target = progress();
    document.documentElement.classList.toggle('in-cx', hero.getBoundingClientRect().bottom > innerHeight * 1.05);
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    if (dirty || Math.abs(cur - lastP) > 0.0001) { render(cur); lastP = cur; }
    requestAnimationFrame(tick);
  };

  // side index is clickable
  idx.forEach((b, i) => b.addEventListener('click', () => {
    go();
    const run = hero.offsetHeight - innerHeight;
    const y = hero.offsetTop + run * (i === 0 ? 0 : i * seg + seg * .3);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }));

  size(); addEventListener('resize', size);
  load(seqs.farm, 0).then(() => { dirty = true; });
  if (reduce) { go(); }
  requestAnimationFrame(() => { const h = document.documentElement; h.classList.add('cx-open'); h.classList.remove('intro'); try { sessionStorage.setItem('agx-open', '1'); } catch (e) {} });
  requestAnimationFrame(tick);
}

/* ---------------- Two doors: the side under the cursor opens wider ---------------- */
const doors = document.querySelector('[data-two-doors]');
if (doors && !phone) {
  doors.addEventListener('pointermove', (e) => {
    const r = doors.getBoundingClientRect();
    const lean = (e.clientX - r.left) / r.width < .5 ? 'buy' : 'farm';
    if (doors.dataset.lean !== lean) doors.dataset.lean = lean;
  });
  doors.addEventListener('pointerleave', () => { delete doors.dataset.lean; });
  doors.querySelectorAll('a').forEach((a) => a.addEventListener('focus', () => { doors.dataset.lean = a.closest('[data-side]').dataset.side; }));
}

/* ---------------- What we grow: the cinematic chooser ---------------- */
const chooser = document.querySelector('[data-chooser]');
if (chooser) {
  const list = ['md2-fresh', 'sg1-fresh', 'iqf-frozen', 'domestic-distribution'].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const label = { 'md2-fresh': ['MD2', 'Fresh'], 'sg1-fresh': ['SG1', 'Sarawak Gold'], 'iqf-frozen': ['IQF', 'Frozen'], 'domestic-distribution': ['Domestic', 'Malaysia'] };
  const stage = chooser.querySelector('[data-pc-stage]'), tabs = chooser.querySelector('[data-pc-tabs]'), info = chooser.querySelector('[data-pc-info]');
  const giant = chooser.querySelector('[data-giant]');
  stage.innerHTML = list.map((p, i) => `<figure class="pc-ph${i === 0 ? ' is-on' : ''}" data-i="${i}"><img src="${esc(p.image)}" alt="${esc(p.name)} (illustrative)" loading="lazy" width="1000" height="1250"><span class="illus">Illustrative</span></figure>`).join('');
  tabs.innerHTML = list.map((p, i) => `<button type="button" role="tab" id="pct${i}" aria-controls="pci${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><b>${esc(label[p.id][0])}</b><span>${esc(label[p.id][1])}</span></button>`).join('');
  info.innerHTML = list.map((p, i) => `<div class="pc-p${i === 0 ? ' is-on' : ''}" role="tabpanel" id="pci${i}" aria-labelledby="pct${i}"${i ? ' hidden' : ''}>
    <h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><p class="price">${esc(site.priceNote)}</p>
    <div class="acts"><a class="btn" href="contact.html?product=${encodeURIComponent(p.id)}">Request a quote ${arrow}</a><a class="link" href="product.html?id=${encodeURIComponent(p.id)}">Details</a></div></div>`).join('');
  let cur = 0, timer = null;
  const show = (n, user) => {
    if (n === cur) return;
    const figs = stage.children, bs = tabs.children, ps = info.children;
    figs[cur].classList.remove('is-on'); figs[cur].classList.add('is-out');
    const old = figs[cur]; setTimeout(() => old.classList.remove('is-out'), 900);
    figs[n].classList.add('is-on');
    [...bs].forEach((b, i) => { b.setAttribute('aria-selected', String(i === n)); b.tabIndex = i === n ? 0 : -1; });
    [...ps].forEach((p, i) => { p.hidden = i !== n; p.classList.toggle('is-on', i === n); });
    giant.classList.remove('swap'); void giant.offsetWidth; giant.textContent = label[list[n].id][0]; giant.classList.add('swap');
    chooser.dataset.cur = n;
    cur = n;
    if (user) { clearInterval(timer); timer = null; }
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(+b.dataset.i, true); });
  tabs.addEventListener('pointerover', (e) => { const b = e.target.closest('button'); if (b && matchMedia('(hover: hover)').matches) show(+b.dataset.i, true); });
  tabs.addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); const n = (cur + d + list.length) % list.length; show(n, true); tabs.children[n].focus();
  });
  // at rest the range turns slowly through itself while in view
  if (!reduce) new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting && timer === null && !chooser.dataset.stop) timer = setInterval(() => show((cur + 1) % list.length), 5200);
    if (!en.isIntersecting && timer) { clearInterval(timer); timer = null; }
  }), { threshold: .4 }).observe(chooser);
  chooser.addEventListener('pointerdown', () => { chooser.dataset.stop = 1; clearInterval(timer); timer = null; });
  tabs.addEventListener('pointerover', () => { chooser.dataset.stop = 1; clearInterval(timer); timer = null; });
}

/* ---------------- Numbers staked in the field ---------------- */
const counts = document.querySelector('[data-counts]');
if (counts) {
  counts.innerHTML = company.numbers.map((n) => `<li><strong><span data-count="${n.value}">0</span>${esc(n.suffix)}<small>${esc(n.unit)}</small></strong><span>${esc(n.label)}${n.value === 2000 ? ' (target)' : ''}</span><i aria-hidden="true"></i></li>`).join('');
  const run = (el) => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = (t) => { const k = clamp((t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en'); if (k < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = end.toLocaleString('en')) : requestAnimationFrame(step);
  };
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { counts.classList.add('is-in'); e.target.querySelectorAll('[data-count]').forEach(run); o.disconnect(); } }), { threshold: .25 }).observe(counts);
}

/* ---------------- Proof: roles as statements, the collage of real photos ---------------- */
const roles = document.querySelector('[data-roles2]');
if (roles) roles.innerHTML = company.roles.map((r) => `<li><strong>${esc(r.role)}</strong><span>${esc(r.org)}</span></li>`).join('');
const collage = document.querySelector('[data-collage]');
if (collage) {
  const pics = [
    { src: 'assets/img/cppc-facility-real.jpg', cap: 'Our CPPC, Labu Lanjut, Sepang', x: 0, y: 0, w: 58, r: -1.5, s: [-30, -40, -10] },
    { src: 'assets/img/real-mou-maha-lpnm.jpg', cap: 'MoU exchange with LPNM at MAHA Go Global', x: 52, y: 6, w: 46, r: 2.5, s: [40, -60, 14] },
    { src: 'assets/img/real-uae-signing.jpg', cap: 'Signing in the UAE', x: 4, y: 46, w: 40, r: 2, s: [-50, 50, -12] },
    { src: 'assets/img/real-tradeshow-booth.jpg', cap: 'Our trade-show booth', x: 38, y: 40, w: 36, r: -3, s: [10, 80, 10] },
    { src: 'assets/img/real-china-meeting.jpg', cap: 'Meeting buyers in China', x: 68, y: 50, w: 32, r: 3.5, s: [60, 40, -16] },
    { src: 'assets/img/real-tradeshow-pineapples.jpg', cap: 'Our pineapples on show at a trade fair', x: 20, y: 72, w: 34, r: -2, s: [-40, 90, 12] },
    { src: 'assets/img/real-team-facility.jpg', cap: 'The team at the CPPC', x: 56, y: 76, w: 30, r: 1.5, s: [50, 100, -8] },
  ];
  collage.innerHTML = pics.map((p, i) => `<figure style="--x:${p.x}%;--y:${p.y}%;--w:${p.w}%;--r:${p.r}deg;--sx:${p.s[0]}%;--sy:${p.s[1]}%;--sr:${p.s[2]}deg;z-index:${i === 0 ? 1 : i + 1}" tabindex="0"><img src="${p.src}" alt="${esc(p.cap)}" loading="lazy" width="800" height="530"><figcaption>${esc(p.cap)}</figcaption></figure>`).join('');
}

/* ---------------- Markets map: gold lanes from Port Klang and KLIA ---------------- */
const map = document.querySelector('[data-map]');
if (map) {
  const W = 1400, H = 470;
  const lng = (x) => (x - (-5)) / (148 - (-5)) * W;
  const lat = (y) => (58 - y) / (58 - (-16)) * H;
  let dots = '';
  for (let x = 10; x < W; x += 22) for (let y = 10; y < H; y += 22) dots += `<circle class="dot" cx="${x}" cy="${y}" r="1.6"/>`;
  const home = { x: lng(company.cppc.lng), y: lat(company.cppc.lat) };
  const arcs = company.markets.map((m, i) => {
    const x = lng(m.lng), y = lat(m.lat); const mx = (home.x + x) / 2, my = Math.min(home.y, y) - 90 - Math.abs(home.x - x) * .12;
    const off = { Japan: [16, 6, 'start'], 'South Korea': [-12, -16, 'end'], China: [-14, 22, 'end'], UAE: [0, 30, 'middle'], 'Saudi Arabia': [-14, 6, 'end'], Europe: [0, 34, 'middle'] }[m.name] || [14, 5, 'start'];
    return `<path class="arc${i % 2 ? ' air' : ''}" d="M${home.x} ${home.y} Q ${mx} ${my} ${x} ${y}"/><circle class="pin" cx="${x}" cy="${y}" r="7"/><text x="${x + off[0]}" y="${y + off[1]}" text-anchor="${off[2]}">${esc(m.name)}</text>`;
  }).join('');
  map.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Lanes from Port Klang and KLIA, Malaysia to Japan, South Korea, China, the UAE, Saudi Arabia and Europe">${dots}${arcs}<circle class="home" cx="${home.x}" cy="${home.y}" r="11"/><text x="${home.x + 20}" y="${home.y + 8}">Port Klang · KLIA</text></svg>`;
  const mq = document.querySelector('[data-marquee]');
  if (mq) { const one = company.markets.map((m) => `<span>${esc(m.name)}</span>`).join('') + '<span>Malaysia</span>'; mq.innerHTML = one + one; }
  onMotion(() => {
    if (reduce) return;
    const { gsap } = window;
    gsap.fromTo(map.querySelectorAll('.arc'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, stagger: .14, ease: 'power2.inOut', scrollTrigger: { trigger: map, start: 'top 75%' } });
    gsap.from(map.querySelectorAll('.pin'), { scale: .2, transformOrigin: 'center', duration: .6, stagger: .08, delay: .9, ease: 'power3.out', scrollTrigger: { trigger: map, start: 'top 75%' } });
  });
}

/* ---------------- Leaders ---------------- */
const leaders = document.querySelector('[data-leaders2]');
if (leaders) leaders.innerHTML = company.leaders.map((l) => `<li><div class="cut rv-img"><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" width="420" height="560"></div><div class="who"><h3>${esc(l.name)}</h3><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></div></li>`).join('');
window.__watchReveals?.();

/* ---------------- GSAP scenes ---------------- */
onMotion(() => {
  const { gsap, ScrollTrigger } = window;
  window.__watchReveals?.();
  if (reduce) return;
  const field = document.querySelector('[data-field] > img');
  if (field) gsap.fromTo(field, { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1.02, ease: 'none', scrollTrigger: { trigger: field.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });

  // the proof photos fall from a scatter into place
  const figs = document.querySelectorAll('[data-collage] figure');
  figs.forEach((f) => gsap.fromTo(f, { '--k': 1 }, { '--k': 0, ease: 'power2.out', scrollTrigger: { trigger: f.parentElement, start: 'top 95%', end: 'top 25%', scrub: .8 } }));

  // the doors: photos ease as you pass
  document.querySelectorAll('.dz-half img').forEach((im) => gsap.fromTo(im, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: im.closest('.dz'), start: 'top bottom', end: 'bottom top', scrub: true } }));

  const season = document.querySelector('[data-season]');
  if (season && innerWidth >= 900) {
    const track = season.querySelector('.track');
    const svg = season.querySelector('.road');
    const stops = [...season.querySelectorAll('figure.stop')];
    const bar = [...season.querySelectorAll('.stops-bar li')];
    const build = () => {
      const tw = track.scrollWidth, h = innerHeight;
      svg.setAttribute('width', tw); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${tw} ${h}`); svg.style.width = tw + 'px';
      let d = `M 0 ${h * .82}`;
      const first = track.children[0].offsetWidth;
      d += ` C ${first * .5} ${h * .82} ${first * .7} ${h * .9} ${first} ${h * .88}`;
      stops.forEach((s, i) => { const x0 = s.offsetLeft, w = s.offsetWidth; const y = h * (i % 2 ? .9 : .86); d += ` S ${x0 + w * .55} ${h * (i % 2 ? .8 : .95)} ${x0 + w} ${y}`; });
      svg.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
      return tw - innerWidth;
    };
    let dist = build();
    track.appendChild(svg);
    svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0';
    const gold = svg.querySelector('.gold');
    const tl = gsap.timeline({ scrollTrigger: { trigger: season, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true, onRefresh: () => { dist = build(); },
      onUpdate: (st) => { const i = Math.min(stops.length - 1, Math.floor(st.progress * stops.length * 1.02)); bar.forEach((b, k) => b.classList.toggle('is-on', k <= i)); stops.forEach((s, k) => s.classList.toggle('is-on', k === i)); } } });
    tl.to(track, { x: () => -dist, ease: 'none' }, 0).fromTo(gold, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none' }, 0);
    stops.forEach((s) => tl.fromTo(s.querySelector('img'), { xPercent: 4 }, { xPercent: -4, ease: 'none' }, 0));
  }
  ScrollTrigger.refresh();
});
