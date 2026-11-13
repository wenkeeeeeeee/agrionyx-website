// Form controls drawn in the site's style: selects become chips (short lists) or a navy list panel (long lists),
// the start month is a month grid, steppers disable at their limits. The original <select>s stay as the form values.
import './pages.js';

const chev = '<svg viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l6 6 6-6"/></svg>';
const fire = (el) => el.dispatchEvent(new Event('change', { bubbles: true }));
let uid = 0;

function chips(sel) {
  const g = document.createElement('div');
  g.className = 'chips'; g.setAttribute('role', 'radiogroup');
  const sync = () => g.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === sel.value)));
  [...sel.options].forEach((o) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.setAttribute('role', 'radio'); b.dataset.v = o.value; b.textContent = o.textContent;
    b.addEventListener('click', () => { sel.value = o.value; sync(); fire(sel); });
    g.appendChild(b);
  });
  g.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const bs = [...g.children], i = bs.findIndex((b) => b.dataset.v === sel.value);
    const n = bs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length];
    n.click(); n.focus();
  });
  sel.after(g); sync();
  sel.addEventListener('change', sync);
}

function panel(btn, pnl, onOpen) {
  const close = () => { pnl.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', () => { const o = pnl.hidden; document.querySelectorAll('.pick-panel').forEach((p) => { p.hidden = true; }); pnl.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) onOpen?.(); });
  document.addEventListener('click', (e) => { if (!btn.parentElement.contains(e.target)) close(); });
  btn.parentElement.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
  return close;
}

function listbox(sel) {
  const wrap = document.createElement('div'); wrap.className = 'pick';
  const id = `lb${++uid}`;
  wrap.innerHTML = `<button type="button" class="pick-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"><span></span>${chev}</button><div class="pick-panel" role="listbox" id="${id}" tabindex="-1" hidden></div>`;
  const btn = wrap.firstElementChild, pnl = wrap.lastElementChild, lab = btn.firstElementChild;
  pnl.innerHTML = [...sel.options].map((o) => `<div role="option" data-v="${o.value.replace(/"/g, '&quot;')}">${o.textContent}</div>`).join('');
  const opts = [...pnl.children];
  let act = 0;
  const sync = () => { lab.textContent = sel.value; opts.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.v === sel.value))); };
  const hi = (i) => { act = (i + opts.length) % opts.length; opts.forEach((o, k) => o.classList.toggle('is-active', k === act)); opts[act].scrollIntoView({ block: 'nearest' }); };
  const close = panel(btn, pnl, () => { hi(Math.max(0, opts.findIndex((o) => o.dataset.v === sel.value))); pnl.focus(); });
  const choose = (o) => { sel.value = o.dataset.v; sync(); fire(sel); close(); btn.focus(); };
  opts.forEach((o, i) => { o.addEventListener('click', () => choose(o)); o.addEventListener('mousemove', () => hi(i)); });
  let typed = '', tt = 0;
  pnl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); hi(act + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hi(act - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(opts[act]); }
    else if (e.key.length === 1) { clearTimeout(tt); typed += e.key.toLowerCase(); tt = setTimeout(() => (typed = ''), 600); const i = opts.findIndex((o) => o.textContent.toLowerCase().startsWith(typed)); if (i > -1) hi(i); }
  });
  sel.after(wrap); sync();
  sel.addEventListener('change', sync);
}

function months(input) {
  const wrap = document.createElement('div'); wrap.className = 'pick';
  const id = `mp${++uid}`;
  const now = new Date();
  const list = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + 1 + i, 1));
  const val = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const nice = (d) => d.toLocaleString('en', { month: 'long', year: 'numeric' });
  wrap.innerHTML = `<button type="button" class="pick-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"><span>Choose a month</span>${chev}</button><div class="pick-panel months" role="listbox" id="${id}" hidden>${list.map((d) => `<div role="option" tabindex="0" data-v="${val(d)}">${d.toLocaleString('en', { month: 'short' })}<small>${d.getFullYear()}</small></div>`).join('')}</div>`;
  const btn = wrap.firstElementChild, pnl = wrap.lastElementChild;
  const close = panel(btn, pnl, () => (pnl.querySelector('[aria-selected="true"]') || pnl.firstElementChild).focus());
  pnl.querySelectorAll('[role=option]').forEach((o, i) => {
    const pick = () => { input.value = o.dataset.v; btn.firstElementChild.textContent = nice(list[i]); pnl.querySelectorAll('[role=option]').forEach((x) => x.setAttribute('aria-selected', String(x === o))); fire(input); close(); btn.focus(); };
    o.addEventListener('click', pick);
    o.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[e.key];
      if (k) { e.preventDefault(); pnl.children[Math.min(11, Math.max(0, i + k))].focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });
  });
  input.after(wrap);
}

document.querySelectorAll('.wa-form').forEach((form) => {
  form.querySelectorAll('select').forEach((sel) => { sel.classList.add('enh'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true'); (sel.options.length <= 8 ? chips : listbox)(sel); });
  form.querySelectorAll('[data-month]').forEach(months);
  // steppers: minus disabled at the minimum
  form.querySelectorAll('.stepper').forEach((st) => {
    const inp = st.querySelector('input'), [minus, plus] = st.querySelectorAll('button');
    const sync = () => { minus.disabled = +inp.value <= +inp.min; plus.disabled = +inp.value >= +inp.max; };
    form.addEventListener('input', sync); form.addEventListener('change', sync);
    st.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setTimeout(sync)));
    sync();
  });
  // the message flashes as it rewrites
  const pre = (form.closest('[data-wa-tool]') || document).querySelector('[data-wa-preview]');
  form.addEventListener('wa-update', () => { if (!pre) return; pre.classList.remove('flash'); void pre.offsetWidth; pre.classList.add('flash'); });
});
