// V3 The Centre: drawn form controls (chips, list pickers), rendered before pages.js wires the forms.
import { site, esc } from './app.js';
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
// Start months for the brief: the next 12 months, drawn as a list (no browser month picker).
{ const d = new Date(); site.startMonths = Array.from({ length: 12 }, (_, i) => new Date(d.getFullYear(), d.getMonth() + 1 + i, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })).concat('Not sure yet'); }
/* ---------- Drawn controls: chips are radios; picks are listboxes with a hidden input ---------- */
$$('[data-chips]').forEach((box) => {
  const name = box.dataset.chips; const list = site[box.dataset.list] || [];
  box.innerHTML = list.map((v, i) => `<label><input type="radio" name="${name}" value="${esc(v)}"${i === 0 ? ' checked' : ''}><span>${esc(v)}</span></label>`).join('');
});
$$('[data-pick]').forEach((pick) => {
  const name = pick.dataset.pick; const list = site[pick.dataset.list] || [];
  const id = `pk-${name}`;
  pick.innerHTML = `<input type="hidden" name="${name}" value="${esc(list[0])}"><button type="button" class="pick-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"><span>${esc(list[0])}</span></button><ul class="pick-list" role="listbox" id="${id}" tabindex="-1">${list.map((v, i) => `<li role="option" data-v="${esc(v)}" aria-selected="${i === 0}">${esc(v)}</li>`).join('')}</ul>`;
  const input = pick.querySelector('input'); const btn = pick.querySelector('button'); const ul = pick.querySelector('ul');
  const opts = $$('li', ul); let act = 0;
  const setVal = (v, fire = true) => {
    input.value = v; btn.firstChild.textContent = v;
    opts.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.v === v)));
    if (fire) input.form?.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const mark = (i) => { act = (i + opts.length) % opts.length; opts.forEach((o, j) => o.classList.toggle('active', j === act)); opts[act].scrollIntoView({ block: 'nearest' }); };
  const open = (o) => { pick.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); if (o) { mark(Math.max(0, opts.findIndex((x) => x.dataset.v === input.value))); ul.focus({ preventScroll: true }); } };
  btn.addEventListener('click', () => open(!pick.classList.contains('open')));
  opts.forEach((o, i) => { o.addEventListener('click', () => { setVal(o.dataset.v); open(false); btn.focus(); }); o.addEventListener('mousemove', () => mark(i)); });
  ul.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); mark(act + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); mark(act - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVal(opts[act].dataset.v); open(false); btn.focus(); }
    else if (e.key === 'Escape') { open(false); btn.focus(); }
    else if (e.key.length === 1) { const k = e.key.toLowerCase(); const j = opts.findIndex((o) => o.dataset.v.toLowerCase().startsWith(k)); if (j >= 0) mark(j); }
  });
  btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(true); } });
  document.addEventListener('click', (e) => { if (!pick.contains(e.target)) open(false); });
  pick.setVal = setVal;
});
