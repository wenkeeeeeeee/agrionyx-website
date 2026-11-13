// Shared behaviour for every page: loads data/site.json, data/products.json and data/company.json, fills the
// business details into the HTML hooks, header menu. No basket: every enquiry ends in a WhatsApp message.
const getJSON = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); });
export const [site, products, company] = await Promise.all([getJSON('data/site.json'), getJSON('data/products.json'), getJSON('data/company.json')]);
export const byId = Object.fromEntries(products.map((p) => [p.id, p]));

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Escape text and highlight any "[client to confirm ...]" placeholder.
export const tbc = (s) => esc(s).replace(/\[client to confirm[^\]]*\]/g, (m) => `<span class="tbc">${m}</span>`);
export const waLink = (text) => `https://wa.me/${site.whatsapp.intl}?text=${encodeURIComponent(text)}`;
export const mailLink = (subject, body = '') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const fill = (text) => String(text).replaceAll('{brand}', site.brand);

// "Price on request" line. Never a number.
export const priceHTML = (p, cls = 'price') => p.comingSoon
  ? `<p class="${cls}">Coming December 2026</p>`
  : `<p class="${cls}">${esc(site.priceNote)}</p>`;

// One product card. Restyle .card freely; keep the data-* hooks.
export function cardHTML(p) {
  const url = `product.html?id=${encodeURIComponent(p.id)}`;
  return `<article class="card" data-card>
    <a class="card-media" href="${url}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" width="640" height="480" loading="lazy"></a>
    <div class="card-body">
      <p class="card-cat">${esc(p.category)}</p>
      <h3 class="card-name"><a href="${url}">${esc(p.name)}</a></h3>
      <p class="card-line">${tbc(p.summary)}</p>
      ${priceHTML(p)}
      ${p.comingSoon ? '' : `<a class="btn btn-sm" href="contact.html?product=${encodeURIComponent(p.id)}">Request a quote</a>`}
    </div>
  </article>`;
}

// Business details into the page. Hooks:
//   data-site="brand|tagline|sub|email|address|hours|whatsapp|priceNote"  text from site.json
//   data-wa="Hi {brand}, ..."     WhatsApp link with a pre-written message
//   data-email                    mailto link
//   data-social="linkedin"        social link (hidden if empty)
//   data-product-links            list of links to every product
const siteText = { brand: site.brand, legalName: site.legalName, tagline: site.tagline, sub: site.sub, email: site.email, address: site.address, hours: site.hours, whatsapp: site.whatsapp.display, priceNote: site.priceNote };
document.querySelectorAll('[data-site]').forEach((el) => { const v = siteText[el.dataset.site]; if (v != null) el.innerHTML = tbc(v); });
document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(fill(a.dataset.wa || 'Hi {brand}, ')); });
document.querySelectorAll('[data-social]').forEach((a) => { const u = site.socials?.[a.dataset.social]; if (u) a.href = u; else (a.closest('li') || a).hidden = true; });
document.querySelectorAll('[data-email]').forEach((a) => { a.href = `mailto:${site.email}`; });
document.querySelectorAll('[data-product-links]').forEach((ul) => {
  ul.innerHTML = products.map((p) => `<li><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></li>`).join('');
});

// Header: mobile menu and current page.
const menuBtn = document.querySelector('[data-menu-btn]');
if (menuBtn) menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('menu-open', open);
});
document.querySelectorAll('[data-nav] a').forEach((a) => { if (a.pathname === location.pathname) a.setAttribute('aria-current', 'page'); });
