// Page-specific behaviour, chosen by <body data-page="...">, plus list hooks any page can use.
import { site, products, company, byId, cardHTML, priceHTML, esc, tbc, waLink, mailLink } from './app.js';

const page = document.body.dataset.page;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fillAll = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

// Lists from data. Each hook renders plain markup; restyle freely.
// <div data-products></div> = all, data-products="featured" or "id1,id2".
fillAll('[data-products]', (el) => {
  const v = el.dataset.products;
  const list = !v ? products : v === 'featured' ? products.filter((p) => p.featured) : v.split(',').map((id) => byId[id]).filter(Boolean);
  el.innerHTML = list.map(cardHTML).join('');
});
// <ul data-numbers> big proof numbers; each value carries data-count for a counter.
fillAll('[data-numbers]', (el) => {
  const only = el.dataset.numbers ? el.dataset.numbers.split(',').map(Number) : null;
  el.innerHTML = company.numbers.filter((_, i) => !only || only.includes(i))
    .map((n) => `<li><strong><span data-count="${n.value}">${n.value.toLocaleString('en')}</span>${esc(n.suffix)} <small>${esc(n.unit)}</small></strong><span>${esc(n.label)}</span></li>`).join('');
});
fillAll('[data-process]', (el) => {
  el.innerHTML = company.process.map((s, i) => `<li><img src="${esc(s.image)}" alt="" loading="lazy" width="640" height="400"><p class="step-n">${String(i + 1).padStart(2, '0')} · ${esc(s.step)}</p><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('');
});
fillAll('[data-streams]', (el) => { el.innerHTML = company.streams.map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></li>`).join(''); });
fillAll('[data-markets]', (el) => { el.innerHTML = company.markets.map((m) => `<li>${esc(m.name)}</li>`).join(''); });
fillAll('[data-farms]', (el) => { el.innerHTML = company.farms.map((f) => `<li>${esc(f.name)}</li>`).join(''); });
fillAll('[data-services]', (el) => {
  el.innerHTML = company.services.map((s) => `<li id="${esc(s.id)}"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p>${s.link ? `<a href="${esc(s.link)}">Learn more</a>` : `<a href="${waLink(`Hi ${site.brand}, I'd like to talk about ${s.name.toLowerCase()}.`)}" target="_blank" rel="noopener">Talk to us</a>`}</li>`).join('');
});
fillAll('[data-doors]', (el) => {
  el.innerHTML = company.doors.map((d) => `<li><a href="${esc(d.link)}"><strong>${esc(d.name)}</strong><span>${esc(d.for)}</span><p>${esc(d.text)}</p></a></li>`).join('');
});
fillAll('[data-timeline]', (el) => { el.innerHTML = company.timeline.map((t) => `<li><strong>${esc(t.year)}</strong><p>${esc(t.text)}</p></li>`).join(''); });
fillAll('[data-values]', (el) => { el.innerHTML = company.values.map((v) => `<li><h3>${esc(v.name)}</h3><p>${esc(v.text)}</p></li>`).join(''); });
fillAll('[data-leaders]', (el) => {
  el.innerHTML = company.leaders.map((l) => `<li><img src="${esc(l.image)}" alt="${esc(l.name)}" loading="lazy" width="420" height="560"><h3>${esc(l.name)}</h3><p class="role">${esc(l.role)}</p><p>${esc(l.text)}</p></li>`).join('');
});
fillAll('[data-roles]', (el) => { el.innerHTML = company.roles.map((r) => `<li><strong>${esc(r.role)}</strong><span>${esc(r.org)}</span></li>`).join(''); });
fillAll('[data-events]', (el) => {
  el.innerHTML = company.events.map((e) => `<li><figure><img src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy"><figcaption>${esc(e.title)}</figcaption></figure></li>`).join('');
});
fillAll('[data-faqs]', (el) => { el.innerHTML = company.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${tbc(f.a)}</p></details>`).join(''); });
fillAll('[data-grower-offer]', (el) => { el.innerHTML = company.grower.offer.map((o) => `<li>${esc(o)}</li>`).join(''); });
fillAll('[data-company]', (el) => {
  const v = el.dataset.company.split('.').reduce((o, k) => o?.[k], company);
  if (v != null) el.innerHTML = tbc(v);
});

// Product page: product.html?id=md2-fresh (falls back to the first product).
if (page === 'product') {
  const p = byId[new URLSearchParams(location.search).get('id')] || products[0];
  document.title = `${p.name} | ${site.brand}`;
  const set = (sel, html) => fillAll(sel, (el) => { el.innerHTML = html; });
  set('[data-p-name]', esc(p.name));
  set('[data-p-category]', esc(p.category));
  set('[data-p-summary]', tbc(p.summary));
  set('[data-p-description]', tbc(p.description));
  set('[data-p-notes]', (p.notes || []).map((n) => `<li>${tbc(n)}</li>`).join(''));
  set('[data-p-details]', tbc(p.details));
  set('[data-p-price]', priceHTML(p, 'pdp-price'));
  fillAll('[data-p-image]', (img) => { img.src = p.image; img.alt = p.name; });
  fillAll('[data-p-quote]', (a) => { a.href = `contact.html?product=${encodeURIComponent(p.id)}`; a.hidden = !!p.comingSoon; });
  fillAll('[data-p-ask]', (a) => { a.href = waLink(`Hi ${site.brand}, a question about ${p.name}: `); });
  const others = document.querySelector('[data-p-others]');
  if (others) others.innerHTML = products.filter((x) => x !== p && !x.comingSoon).slice(0, 3).map(cardHTML).join('');
}

// A form that writes a WhatsApp message live. <form data-wa-form="brief|grower">, <pre data-wa-preview>,
// <a data-wa-send>, <a data-mail-send>. Field names below are the hooks; restyle the form freely.
const options = (list) => list.map((t) => `<option>${esc(t)}</option>`).join('');
const builders = {
  brief: (f) => [
    `Hi ${site.brand}, here is my sourcing brief.`,
    `Variety: ${f.get('variety')}`,
    `Form: ${f.get('form')}`,
    `Volume: ${f.get('tonnes') || '?'} tonnes per week`,
    `Destination: ${f.get('market')}`,
    f.get('start') ? `Start: ${f.get('start')}` : '',
    f.get('name') ? `Name: ${f.get('name')}${f.get('company') ? `, ${f.get('company')}` : ''}` : '',
    f.get('note') ? `Note: ${f.get('note')}` : '',
  ],
  grower: (f) => [
    `Hi ${site.brand}, I'd like to farm with you.`,
    `Location: ${f.get('place') ? `${f.get('place')}, ` : ''}${f.get('state')}`,
    `Area: ${f.get('acres') || '?'} acres`,
    `Variety: ${f.get('variety')}`,
    `Stage: ${f.get('stage')}`,
    f.get('name') ? `Name: ${f.get('name')}` : '',
    f.get('phone') ? `Phone: ${f.get('phone')}` : '',
  ],
};
document.querySelectorAll('[data-wa-form]').forEach((form) => {
  const kind = form.dataset.waForm;
  const root = form.closest('[data-wa-tool]') || document;
  const preview = root.querySelector('[data-wa-preview]');
  const send = root.querySelector('[data-wa-send]');
  const mail = root.querySelector('[data-mail-send]');
  const sel = (name, list) => { const el = form.elements[name]; if (el && el.tagName === 'SELECT' && !el.options.length) el.innerHTML = options(list); };
  sel('variety', site.varieties); sel('form', site.forms); sel('market', site.markets); sel('state', site.states); sel('stage', site.plantingStages);
  // contact.html?product=iqf-frozen presets the brief.
  const pre = byId[new URLSearchParams(location.search).get('product')];
  if (kind === 'brief' && pre) {
    if (pre.short === 'MD2') form.elements.variety.value = 'MD2';
    if (pre.short === 'SG1') form.elements.variety.value = 'Sarawak Gold (SG1)';
    if (pre.short === 'IQF') form.elements.form.value = 'IQF frozen';
    if (pre.short === 'Domestic') form.elements.market.value = 'Malaysia (domestic)';
  }
  const update = () => {
    const text = builders[kind](new FormData(form)).filter(Boolean).join('\n');
    if (preview) preview.textContent = text;
    if (send) send.href = waLink(text);
    if (mail) mail.href = mailLink(kind === 'brief' ? 'Sourcing brief' : 'Farm with Agrionyx', text);
    form.dispatchEvent(new CustomEvent('wa-update', { detail: text }));
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => { e.preventDefault(); update(); window.open(send?.href || waLink(preview?.textContent || ''), '_blank', 'noopener'); });
  // Steppers: <button type="button" data-step="tonnes" data-by="5">
  form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    const el = form.elements[b.dataset.step];
    el.value = Math.max(+el.min || 0, Math.min(+el.max || 9999, (+el.value || 0) + +b.dataset.by));
    update();
  }));
  update();
});
// Buttons elsewhere can jump to a form: <a href="#brief" data-scroll>
fillAll('[data-scroll]', (a) => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}));
