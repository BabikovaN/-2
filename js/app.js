import { store, cart } from './store.js';
import { ALLERGENS, DIETS, OCCASIONS } from './seed.js';
import { orderText, messengerLinks, sendEmail, money } from './order.js';

export const S = { settings: null, cats: [], products: [] };
const app = document.getElementById('app');
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function toast(msg) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }
export const imgSrc = (img) => (typeof img === 'string' && img ? img : 'assets/logo.svg');
const cur = () => S.settings.currency;
const visible = () => S.products.filter((p) => p.visible !== false);
const minPrice = (p) => Math.min(...(p.sizes?.length ? p.sizes.map((s) => +s.price) : [+p.price]));
const catById = (id) => S.cats.find((c) => c.id === id);
const subName = (c, id) => c?.subs.find((s) => s.id === id)?.name || '';

export const ICON = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
};

export function overlay(html, cls = '') {
  const o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true"><button class="icon-btn close" aria-label="Закрити">${ICON.close}</button>${html}</div>`;
  const close = () => { o.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  o.addEventListener('click', (e) => { if (e.target === o) close(); });
  $('.close', o).onclick = close; document.addEventListener('keydown', onKey);
  document.body.appendChild(o); return { el: o, close };
}

// ---------------- шапка й підвал ----------------
function header(route) {
  const n = cart.get().reduce((s, x) => s + x.qty, 0);
  return `<header class="header"><div class="container">
    <a class="brand" href="#/"><img src="assets/logo.svg" alt=""><b>${esc(S.settings.name)}</b></a>
    <button class="menu-btn" id="menuBtn" aria-expanded="false">${ICON.menu}<span class="lbl">Меню</span></button>
    <nav class="hnav"><a href="#/c/cakes" class="${route === 'c' ? 'on' : ''}">Торти</a><a href="#/custom" class="${route === 'custom' ? 'on' : ''}">Індивідуальне замовлення</a><a href="#/#about">Про нас</a></nav>
    <div class="spacer"></div>
    <a class="hphone" href="tel:${esc(S.settings.phone.replace(/\s/g, ''))}">${esc(S.settings.phone)}</a>
    <button class="icon-btn" id="cartBtn" aria-label="Кошик">${ICON.bag}${n ? `<span class="badge-count">${n}</span>` : ''}</button>
  </div></header>`;
}
function footer() {
  const s = S.settings;
  return `<footer class="footer"><div class="container">
    <div><a class="brand" href="#/"><img src="assets/logo.svg" alt=""><b>${esc(s.name)}</b></a><p class="muted" style="max-width:340px">${esc(s.tagline)}. ${esc(s.hours)}</p></div>
    <div><h4>Меню</h4>${S.cats.map((c) => `<div><a href="#/c/${c.id}">${esc(c.name)}</a></div>`).join('')}</div>
    <div><h4>Контакти</h4><div><a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${esc(s.phone)}</a></div>${s.email ? `<div><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>` : ''}
      ${s.instagram ? `<div><a href="https://instagram.com/${esc(s.instagram.replace('@', ''))}" target="_blank" rel="noopener">Instagram</a></div>` : ''}${s.telegram ? `<div><a href="https://t.me/${esc(s.telegram.replace('@', ''))}" target="_blank" rel="noopener">Telegram</a></div>` : ''}
      <div class="muted">${esc(s.address)}</div><div style="margin-top:10px"><a href="#/custom">Написати кондитеру →</a></div></div>
  </div></footer>`;
}

// ---------------- мега-меню «меню в меню» ----------------
function openMega() {
  if ($('.mega')) return closeMega();
  const m = document.createElement('div'); m.className = 'mega';
  m.innerHTML = `<div class="mega-panel"><div class="mega-grid"><div class="mega-cats">${S.cats.map((c, i) => `<button class="mega-cat ${i ? '' : 'on'}" data-c="${c.id}"><img src="${imgSrc(c.img)}" alt="">${esc(c.name)}<span class="arr">→</span></button>`).join('')}</div><div class="mega-subs" id="megaSubs"></div></div></div>`;
  document.body.appendChild(m); $('#menuBtn').setAttribute('aria-expanded', 'true');
  const show = (id) => { const c = catById(id); $$('.mega-cat', m).forEach((b) => b.classList.toggle('on', b.dataset.c === id));
    $('#megaSubs', m).innerHTML = `<h3>${esc(c.name)}</h3><a class="all" href="#/c/${c.id}">Усі ${esc(c.name.toLowerCase())} →</a><div class="sub-tiles">${c.subs.map((s) => `<a class="sub-tile" href="#/c/${c.id}/${s.id}"><div class="ph"><img src="${imgSrc(s.img)}" alt="" loading="lazy"></div><span>${esc(s.name)}</span></a>`).join('')}</div>`; };
  $$('.mega-cat', m).forEach((b) => { b.onmouseenter = () => show(b.dataset.c); b.onclick = () => (matchMedia('(max-width:760px)').matches ? show(b.dataset.c) : (location.hash = '#/c/' + b.dataset.c)); });
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('a')) closeMega(); });
  show(S.cats[0].id);
}
function closeMega() { const m = $('.mega'); if (m) m.remove(); const b = $('#menuBtn'); if (b) b.setAttribute('aria-expanded', 'false'); }

// ---------------- картка товару ----------------
function card(p) {
  const c = catById(p.cat);
  return `<article class="card"><button class="ph" data-open="${p.id}" aria-label="${esc(p.name)}"><img src="${imgSrc(p.img)}" alt="${esc(p.name)}" loading="lazy">
    <div class="tags">${p.badges.includes('hit') ? '<span class="tag hit">Хіт</span>' : ''}${p.badges.includes('new') ? '<span class="tag new">Новинка</span>' : ''}</div></button>
    <div class="body"><div class="meta">${esc(subName(c, p.sub) || c?.name || '')}</div><h3>${esc(p.name)}</h3>
      <div class="meta">${esc((p.sizes || []).map((s) => s.label).slice(0, 3).join(' · '))}</div>
      <div class="row"><div class="price"><small>від</small> ${money(minPrice(p), cur())}</div><button class="btn btn-dark btn-sm" data-open="${p.id}">Обрати</button></div></div></article>`;
}
function bindCards(root) { $$('[data-open]', root).forEach((b) => (b.onclick = () => openProduct(b.dataset.open))); }

export function openProduct(id) {
  const p = S.products.find((x) => x.id === id); if (!p) return;
  const sizes = p.sizes?.length ? p.sizes : [{ label: '', price: p.price }];
  let qty = 1;
  const { el, close } = overlay(`<div class="pmodal"><div class="ph"><img src="${imgSrc(p.img)}" alt="${esc(p.name)}"></div><div class="info">
    <div class="eyebrow">${esc(subName(catById(p.cat), p.sub) || catById(p.cat)?.name || '')}</div><h2>${esc(p.name)}</h2>
    <div class="big-price" id="pp"></div><p class="muted" style="margin:0">${esc(p.desc || '')}</p>
    ${sizes.length > 1 || sizes[0].label ? `<div><div class="eyebrow" style="color:var(--muted);margin-bottom:8px">Розмір</div><div class="seg">${sizes.map((s, i) => `<label><input type="radio" name="size" value="${i}" ${i ? '' : 'checked'}><span>${esc(s.label)}</span></label>`).join('')}</div></div>` : ''}
    ${p.fillings?.length ? `<label class="f"><span>Начинка</span><select class="input" id="pf">${p.fillings.map((f) => `<option>${esc(f)}</option>`).join('')}</select></label>` : ''}
    ${p.inscription ? `<label class="f"><span>Напис (необов'язково)</span><input class="input" id="pi" maxlength="40" placeholder="Наприклад: З днем народження, Олю!"></label>` : ''}
    <div style="display:flex;gap:12px;align-items:center"><div class="qty"><button id="qm" aria-label="Менше">−</button><span id="qv">1</span><button id="qp" aria-label="Більше">+</button></div><button class="btn btn-rose" id="addBtn" style="flex:1">Додати в кошик</button></div>
    <div class="tabs"><button class="on" data-t="sost">Склад</button><button data-t="alg">Алергени</button><button data-t="dlv">Доставка</button></div>
    <div id="tabBody" class="muted"></div></div></div>`);
  const sizeIdx = () => +($('input[name=size]:checked', el)?.value || 0);
  const upd = () => { $('#pp', el).textContent = money(sizes[sizeIdx()].price * qty, cur()); $('#qv', el).textContent = qty; };
  $$('input[name=size]', el).forEach((r) => (r.onchange = upd));
  $('#qm', el).onclick = () => { qty = Math.max(1, qty - 1); upd(); }; $('#qp', el).onclick = () => { qty++; upd(); };
  const tabs = { sost: esc(p.ingredients || '—'), alg: `${(p.allergens || []).map((a) => `<span class="allergen">${ALLERGENS[a] || a}</span>`).join('') || 'Не містить основних алергенів'}<div style="margin-top:6px">${(p.diet || []).map((d) => `<span class="allergen diet">${DIETS[d] || d}</span>`).join('')}</div>`, dlv: esc(S.settings.delivery) + `<br>Замовлення приймаємо мінімум за ${S.settings.minDays} дн.` };
  $$('.tabs button', el).forEach((b) => (b.onclick = () => { $$('.tabs button', el).forEach((x) => x.classList.toggle('on', x === b)); $('#tabBody', el).innerHTML = tabs[b.dataset.t]; }));
  $('#tabBody', el).innerHTML = tabs.sost; upd();
  $('#addBtn', el).onclick = () => {
    const s = sizes[sizeIdx()]; const filling = $('#pf', el)?.value || ''; const inscription = ($('#pi', el)?.value || '').trim();
    cart.add({ key: [p.id, s.label, filling, inscription].join('|'), id: p.id, name: p.name, img: p.img, size: s.label, price: +s.price, filling, inscription, qty });
    close(); refreshCartBadge(); toast('Додано в кошик'); openCart();
  };
}

// ---------------- кошик і оформлення ----------------
function refreshCartBadge() { const b = $('#cartBtn'); if (!b) return; const n = cart.get().reduce((s, x) => s + x.qty, 0); b.innerHTML = ICON.bag + (n ? `<span class="badge-count">${n}</span>` : ''); }
function openCart() {
  $('.drawer')?.remove(); $('.drawer-bg')?.remove();
  const bg = document.createElement('div'); bg.className = 'overlay drawer-bg'; bg.style.background = 'rgba(43,35,38,.3)';
  const d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('aria-label', 'Кошик');
  const close = () => { d.remove(); bg.remove(); };
  bg.onclick = close; document.body.append(bg, d);
  const draw = () => {
    const items = cart.get(); const total = items.reduce((s, x) => s + x.price * x.qty, 0);
    d.innerHTML = `<div class="drawer-head"><h2>Кошик</h2><button class="icon-btn" id="dc" aria-label="Закрити">${ICON.close}</button></div>
      <div class="drawer-body">${items.length ? items.map((x, i) => `<div class="citem"><img src="${imgSrc(x.img)}" alt=""><div><b>${esc(x.name)}</b><small>${esc([x.size, x.filling, x.inscription && `«${x.inscription}»`].filter(Boolean).join(' · '))}</small>
        <div class="qty" style="margin-top:6px;transform:scale(.85);transform-origin:left"><button data-m="${i}">−</button><span>${x.qty}</span><button data-p="${i}">+</button></div></div>
        <div style="text-align:right"><b>${money(x.price * x.qty, cur())}</b><button class="rm" data-r="${i}">Прибрати</button></div></div>`).join('')
        : `<div class="empty" style="box-shadow:none;background:transparent"><p class="muted">Кошик порожній</p><button class="btn btn-dark" id="toMenu">Перейти до меню</button></div>`}</div>
      ${items.length ? `<div class="drawer-foot"><div class="total"><span>Разом</span><span>${money(total, cur())}</span></div><button class="btn btn-rose btn-block" id="checkout">Оформити замовлення</button></div>` : ''}`;
    $('#dc', d).onclick = close;
    $('#toMenu', d)?.addEventListener('click', () => { close(); openMega(); });
    $$('[data-m]', d).forEach((b) => (b.onclick = () => { const c = cart.get(); c[b.dataset.m].qty = Math.max(1, c[b.dataset.m].qty - 1); cart.set(c); draw(); refreshCartBadge(); }));
    $$('[data-p]', d).forEach((b) => (b.onclick = () => { const c = cart.get(); c[b.dataset.p].qty++; cart.set(c); draw(); refreshCartBadge(); }));
    $$('[data-r]', d).forEach((b) => (b.onclick = () => { const c = cart.get(); c.splice(b.dataset.r, 1); cart.set(c); draw(); refreshCartBadge(); }));
    $('#checkout', d)?.addEventListener('click', () => { close(); checkout(); });
  };
  draw();
}

const minDate = () => new Date(Date.now() + S.settings.minDays * 864e5).toISOString().slice(0, 10);
const contactFields = () => `<div class="two"><label class="f"><span>Ім'я *</span><input class="input" name="name" required autocomplete="name"></label><label class="f"><span>Телефон *</span><input class="input" name="phone" required type="tel" autocomplete="tel" placeholder="+380"></label></div>
  <div class="f" role="radiogroup" aria-label="Як з вами зв'язатися?"><span style="display:block;margin-bottom:6px">Як з вами зв'язатися?</span><div class="seg">${['Дзвінок', 'Telegram', 'Viber', 'WhatsApp'].map((x, i) => `<label><input type="radio" name="contact" value="${x}" ${i ? '' : 'checked'}><span>${x}</span></label>`).join('')}</div></div>`;

function checkout() {
  const items = cart.get(); if (!items.length) return;
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const { el, close } = overlay(`<form id="co" novalidate><div class="eyebrow">Оформлення</div><h2 style="font-size:38px;margin:6px 0 18px">Ваше замовлення</h2>
    ${contactFields()}
    <div class="two"><label class="f"><span>Дата *</span><input class="input" type="date" name="date" required min="${minDate()}" value="${minDate()}"></label><label class="f"><span>Час</span><input class="input" type="time" name="time" value="12:00"></label></div>
    <div class="f" role="radiogroup" aria-label="Отримання"><span style="display:block;margin-bottom:6px">Отримання</span><div class="seg"><label><input type="radio" name="delivery" value="pickup" checked><span>Самовивіз</span></label><label><input type="radio" name="delivery" value="delivery"><span>Доставка</span></label></div></div>
    <label class="f hidden" id="addrF"><span>Адреса доставки *</span><input class="input" name="address" autocomplete="street-address"></label>
    <label class="f"><span>Коментар</span><textarea class="input" name="comment" rows="2" placeholder="Побажання щодо декору, алергії тощо"></textarea></label>
    <div class="total" style="border-top:1px solid var(--line);padding-top:14px"><span>Разом</span><span>${money(total, cur())}</span></div>
    <p class="muted" style="font-size:13px;margin:-6px 0 14px">Кондитер підтвердить замовлення й деталі оплати.</p>
    <div id="coErr" style="color:var(--rose-d);font-weight:600;margin-bottom:8px"></div>
    <button class="btn btn-rose btn-block">Надіслати замовлення</button></form>`, 'narrow');
  const f = $('#co', el);
  $$('input[name=delivery]', f).forEach((r) => (r.onchange = () => $('#addrF', f).classList.toggle('hidden', f.delivery.value !== 'delivery')));
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(f));
    if (v.name.trim().length < 2) return ($('#coErr', f).textContent = 'Вкажіть ім\'я');
    if (v.phone.replace(/\D/g, '').length < 10) return ($('#coErr', f).textContent = 'Вкажіть номер телефону (10+ цифр)');
    if (v.delivery === 'delivery' && !v.address.trim()) return ($('#coErr', f).textContent = 'Вкажіть адресу доставки');
    const o = { type: 'cart', ...v, items: items.map(({ name, size, filling, inscription, qty, price, id }) => ({ id, name, size, filling, inscription, qty, price })), total };
    $('button', f).disabled = true;
    await submitOrder(o, close); cart.clear(); refreshCartBadge();
  };
}

async function submitOrder(o, closePrev) {
  const s = S.settings; const text = orderText(o, s);
  try { await store.addOrder({ ...o }); } catch (e) { console.warn('order save failed', e); }
  const mail = await sendEmail(text, o, s);
  closePrev();
  const links = messengerLinks(text, s);
  const { el } = overlay(`<div class="success"><div class="ok">✓</div><h2 style="font-size:38px">Дякуємо, ${esc(o.name)}!</h2>
    <p class="muted">${mail.ok ? 'Замовлення вже надіслано кондитеру на пошту. ' : ''}${links.length ? 'Щоб кондитер отримав його миттєво, надішліть замовлення у зручний месенджер — текст уже готовий:' : 'Кондитер зв\'яжеться з вами найближчим часом.'}</p>
    <div class="msgr">${links.map((l) => `<a class="btn ${l.id === 'whatsapp' || l.id === 'viber' || l.id === 'telegram' ? 'btn-dark' : 'btn-line'}" href="${esc(l.href)}" target="_blank" rel="noopener" data-copy="${l.copy ? 1 : ''}">Надіслати в ${l.label}</a>`).join('')}</div>
    <details style="text-align:left"><summary class="muted" style="cursor:pointer">Текст замовлення</summary><pre style="white-space:pre-wrap;font-family:var(--sans);background:var(--soft);padding:12px;border-radius:12px;font-size:14px">${esc(text)}</pre></details></div>`, 'narrow');
  $$('[data-copy="1"]', el).forEach((a) => a.addEventListener('click', () => { navigator.clipboard?.writeText(text).then(() => toast('Текст скопійовано — вставте його в чат')); }));
}

// ---------------- сторінки ----------------
function home(v) {
  const s = S.settings; const hits = visible().filter((p) => p.badges.includes('hit')).slice(0, 8);
  v.innerHTML = `<section class="hero"><div class="hero-bg" style="background-image:url(assets/hero.webp)"></div><div class="container"><div class="hero-text">
      <div class="eyebrow">${esc(s.tagline)}</div><h1>Десерти, які <em>хочеться</em> зберегти на фото</h1>
      <p>Торти, бенто, макаронс, зефір і пастила ручної роботи в ніжних пастельних тонах. Оберіть готовий десерт або замовте свій — під ваше свято.</p>
      <div class="hero-actions"><button class="btn btn-dark" id="heroMenu">Відкрити меню</button><a class="btn btn-line" href="#/custom">Індивідуальне замовлення</a></div>
      <div class="hero-facts"><div><b>${S.products.length}+</b><span>десертів у меню</span></div><div><b>${S.cats.length}</b><span>категорій</span></div><div><b>від ${s.minDays} дн.</b><span>до готовності</span></div></div>
    </div></div></section>
  <section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Меню</div><h2>Що ми печемо</h2></div><button class="btn btn-ghost" id="allMenu">Усе меню →</button></div>
    <div class="cat-grid">${S.cats.slice(0, 8).map((c) => `<a class="cat-card" href="#/c/${c.id}"><img src="${imgSrc(c.img)}" alt="" loading="lazy"><div class="cap"><b>${esc(c.name)}</b><span>${visible().filter((p) => p.cat === c.id).length} поз.</span></div></a>`).join('')}</div></div></section>
  ${hits.length ? `<section class="section" style="padding-top:0"><div class="container"><div class="section-head"><div><div class="eyebrow">Обирають найчастіше</div><h2>Хіти</h2></div></div><div class="grid" id="hits">${hits.map(card).join('')}</div></div></section>` : ''}
  <section class="section" style="padding-top:0"><div class="container"><div class="section-head"><div><div class="eyebrow">Просто</div><h2>Як замовити</h2></div></div>
    <div class="steps"><div class="step"><i>01</i><h3>Оберіть десерт</h3><p class="muted">Розмір, начинку й напис — прямо в картці.</p></div><div class="step"><i>02</i><h3>Оформіть замовлення</h3><p class="muted">Вкажіть дату й зручний месенджер.</p></div><div class="step"><i>03</i><h3>Отримайте свято</h3><p class="muted">Самовивіз або доставка до дверей.</p></div></div></div></section>
  <section class="section" id="about" style="padding-top:0"><div class="container about"><img src="assets/about.webp" alt="Кондитер прикрашає торт" loading="lazy"><div><div class="eyebrow">Про нас</div><h2>Зроблено руками, з любов'ю до деталей</h2><p class="muted" style="font-size:17px">${esc(s.about)}</p><p class="muted">${esc(s.delivery)}</p><a class="btn btn-dark" href="#/custom">Написати кондитеру</a></div></div></section>
  <section class="section" style="padding-top:0"><div class="container"><div class="cta"><h2>Маєте ідею торта мрії? Розкажіть — ми втілимо.</h2><a class="btn btn-dark" href="#/custom">Індивідуальне замовлення</a></div></div></section>`;
  $('#heroMenu').onclick = openMega; $('#allMenu').onclick = openMega; bindCards(v);
  if (location.hash.includes('#about')) setTimeout(() => $('#about')?.scrollIntoView(), 50);
}

const F = { sizes: new Set(), fillings: new Set(), diet: new Set(), free: new Set(), occ: new Set(), max: null, sort: 'pop' };
function resetF() { ['sizes', 'fillings', 'diet', 'free', 'occ'].forEach((k) => F[k].clear()); F.max = null; F.sort = 'pop'; }
let lastCat = '';
function catPage(v, cid, sub) {
  const c = catById(cid); if (!c) { location.hash = '#/'; return; }
  if (lastCat !== cid) { resetF(); lastCat = cid; }
  const base = visible().filter((p) => p.cat === cid && (!sub || p.sub === sub));
  const count = (arr) => arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
  const sizeLabels = count(base.flatMap((p) => (p.sizes || []).map((s) => s.label)));
  const fills = count(base.flatMap((p) => p.fillings || []));
  const diets = count(base.flatMap((p) => p.diet || []));
  const occs = count(base.flatMap((p) => p.occasions || []));
  const allergenFree = Object.keys(ALLERGENS).filter((a) => base.some((p) => !(p.allergens || []).includes(a)));
  const maxP = Math.max(0, ...base.map(minPrice));
  const group = (title, key, map, labels = {}) => Object.keys(map).length ? `<div class="fgroup"><h4>${title}</h4>${Object.entries(map).map(([k, n]) => `<label class="check"><input type="checkbox" data-f="${key}" value="${esc(k)}" ${F[key].has(k) ? 'checked' : ''}>${esc(labels[k] || k)}<span class="n">${n}</span></label>`).join('')}</div>` : '';
  v.innerHTML = `<div class="container"><div class="crumbs"><a href="#/">Головна</a> / <a href="#/c/${c.id}">${esc(c.name)}</a>${sub ? ' / ' + esc(subName(c, sub)) : ''}</div>
    <div class="cat-head"><h1>${esc(sub ? subName(c, sub) : c.name)}</h1></div>
    <div class="chips"><a class="chip ${sub ? '' : 'on'}" href="#/c/${c.id}">Усі</a>${c.subs.map((s) => `<a class="chip ${sub === s.id ? 'on' : ''}" href="#/c/${c.id}/${s.id}"><img src="${imgSrc(s.img)}" alt="">${esc(s.name)}</a>`).join('')}</div>
    <div class="catalog"><aside class="filters" id="filters" aria-label="Фільтри"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--serif);font-size:24px">Фільтри</b><button class="btn btn-ghost btn-sm" id="fReset">Скинути</button></div>
      <div class="fgroup"><h4>Ціна до</h4><input type="range" min="0" max="${maxP}" step="10" value="${F.max ?? maxP}" id="fMax" style="width:100%;accent-color:var(--rose)"><div class="muted" id="fMaxV">${money(F.max ?? maxP, cur())}</div></div>
      ${group('Розмір / вага', 'sizes', sizeLabels)}${group('Начинка', 'fillings', fills)}${group('Особливості', 'diet', diets, DIETS)}
      ${allergenFree.length ? `<div class="fgroup"><h4>Без алергену</h4>${allergenFree.map((a) => `<label class="check"><input type="checkbox" data-f="free" value="${a}" ${F.free.has(a) ? 'checked' : ''}>Без: ${ALLERGENS[a].toLowerCase()}</label>`).join('')}</div>` : ''}
      ${group('Привід', 'occ', occs)}<button class="btn btn-dark btn-block filter-toggle" id="fDone" style="margin-top:12px">Показати</button></aside>
      <div><div class="toolbar"><button class="btn btn-ghost btn-sm filter-toggle" id="fOpen">${ICON.filter} Фільтри</button><span class="muted" id="fCount"></span>
        <select class="input" id="fSort" style="width:auto"><option value="pop">Спочатку популярні</option><option value="cheap">Дешевші</option><option value="exp">Дорожчі</option><option value="new">Новинки</option></select></div>
        <div class="grid" id="pgrid"></div></div></div></div>`;
  $('#fSort').value = F.sort;
  const apply = () => {
    let list = base.filter((p) => (F.max == null || minPrice(p) <= F.max)
      && (!F.sizes.size || (p.sizes || []).some((s) => F.sizes.has(s.label)))
      && (!F.fillings.size || (p.fillings || []).some((x) => F.fillings.has(x)))
      && [...F.diet].every((d) => (p.diet || []).includes(d))
      && [...F.free].every((a) => !(p.allergens || []).includes(a))
      && (!F.occ.size || (p.occasions || []).some((x) => F.occ.has(x))));
    const score = (p) => (p.badges.includes('hit') ? 2 : 0) + (p.badges.includes('new') ? 1 : 0);
    if (F.sort === 'cheap') list.sort((a, b) => minPrice(a) - minPrice(b)); else if (F.sort === 'exp') list.sort((a, b) => minPrice(b) - minPrice(a));
    else if (F.sort === 'new') list.sort((a, b) => b.badges.includes('new') - a.badges.includes('new')); else list.sort((a, b) => score(b) - score(a));
    $('#pgrid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty" style="grid-column:1/-1"><h3 style="font-size:28px">Нічого не знайшли</h3><p class="muted">Спробуйте змінити фільтри або замовте індивідуальний десерт.</p><a class="btn btn-dark" href="#/custom">Індивідуальне замовлення</a></div>`;
    $('#fCount').textContent = `${list.length} ${list.length === 1 ? 'позиція' : list.length < 5 && list.length ? 'позиції' : 'позицій'}`;
    bindCards($('#pgrid'));
  };
  $$('[data-f]').forEach((i) => (i.onchange = () => { F[i.dataset.f][i.checked ? 'add' : 'delete'](i.value); apply(); }));
  $('#fMax').oninput = (e) => { F.max = +e.target.value; $('#fMaxV').textContent = money(F.max, cur()); apply(); };
  $('#fSort').onchange = (e) => { F.sort = e.target.value; apply(); };
  $('#fReset').onclick = () => { resetF(); catPage(v, cid, sub); };
  $('#fOpen').onclick = () => $('#filters').classList.add('open'); $('#fDone').onclick = () => $('#filters').classList.remove('open');
  apply();
}

function customPage(v) {
  const s = S.settings;
  v.innerHTML = `<div class="container"><div class="crumbs"><a href="#/">Головна</a> / Індивідуальне замовлення</div><div class="custom">
    <div class="side"><div class="eyebrow">Написати кондитеру</div><h1 style="font-size:clamp(40px,5vw,60px);margin:8px 0 16px">Десерт за вашою ідеєю</h1>
      <p class="muted" style="font-size:17px">Опишіть свято, побажання до смаку й декору, додайте фото-приклад — кондитер зв'яжеться з вами, порахує вартість і запропонує варіанти.</p>
      <img src="assets/about.webp" alt="" loading="lazy" style="margin-top:20px"></div>
    <form class="panel" id="cf" novalidate>
      <label class="f"><span>Що бажаєте? *</span><input class="input" name="what" required placeholder="Наприклад: двоярусний торт на хрестини"></label>
      <div class="two"><label class="f"><span>Привід</span><select class="input" name="occasion"><option value="">—</option>${OCCASIONS.map((o) => `<option>${o}</option>`).join('')}</select></label>
        <label class="f"><span>Дата *</span><input class="input" type="date" name="date" required min="${minDate()}" value="${minDate()}"></label></div>
      <div class="two"><label class="f"><span>Кількість гостей / вага</span><input class="input" name="size" placeholder="15 гостей / 2 кг"></label><label class="f"><span>Бюджет</span><input class="input" name="budget" placeholder="до 2500 ${esc(s.currency)}"></label></div>
      <label class="f"><span>Побажання щодо смаку й декору</span><textarea class="input" name="wishes" rows="4" placeholder="Кольори, начинка, напис, алергії…"></textarea></label>
      <label class="f"><span>Фото-приклад</span><div class="drop" id="drop" tabindex="0">Натисніть або перетягніть фото сюди</div><input type="file" accept="image/*" id="cfFile" hidden></label>
      ${contactFields()}
      <div id="cfErr" style="color:var(--rose-d);font-weight:600;margin-bottom:8px"></div>
      <button class="btn btn-rose btn-block">Надіслати кондитеру</button></form></div></div>`;
  let photo = null;
  const f = $('#cf'); const drop = $('#drop'); const file = $('#cfFile');
  const take = async (fl) => { if (!fl) return; photo = await compressImage(fl, 900); drop.innerHTML = `<img src="${photo}" alt="">Фото додано · натисніть, щоб замінити`; };
  drop.onclick = () => file.click(); drop.onkeydown = (e) => { if (e.key === 'Enter') file.click(); };
  file.onchange = () => take(file.files[0]);
  drop.ondragover = (e) => e.preventDefault(); drop.ondrop = (e) => { e.preventDefault(); take(e.dataTransfer.files[0]); };
  f.onsubmit = async (e) => {
    e.preventDefault(); const vv = Object.fromEntries(new FormData(f));
    if (!vv.what.trim()) return ($('#cfErr').textContent = 'Опишіть, що бажаєте');
    if (vv.name.trim().length < 2) return ($('#cfErr').textContent = 'Вкажіть ім\'я');
    if (vv.phone.replace(/\D/g, '').length < 10) return ($('#cfErr').textContent = 'Вкажіть номер телефону');
    $('button', f).disabled = true;
    await submitOrder({ type: 'custom', ...vv, photo, hasPhoto: !!photo }, () => {});
    f.reset(); photo = null; drop.textContent = 'Натисніть або перетягніть фото сюди'; $('button', f).disabled = false;
  };
}

// стискання фото в браузері (для адмінки й фото-прикладів)
export function compressImage(file, max = 1000, q = 0.82) {
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onerror = rej;
    r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/webp', q).startsWith('data:image/webp') ? c.toDataURL('image/webp', q) : c.toDataURL('image/jpeg', q)); }; img.src = r.result; };
    r.readAsDataURL(file);
  });
}

// ---------------- маршрутизація ----------------
export async function reload() { [S.settings, S.cats, S.products] = await Promise.all([store.settings(), store.categories(), store.products()]); }
async function render() {
  const [route, a, b] = location.hash.replace(/^#\/?/, '').split('#')[0].split('/');
  closeMega(); $$('.overlay,.drawer').forEach((x) => x.remove());
  document.title = `${S.settings.name} — ${route === 'c' && catById(a) ? catById(a).name : 'торти й десерти на замовлення'}`;
  if (route === 'admin') { const { adminPage } = await import('./admin.js'); app.innerHTML = header('admin') + '<main id="view"></main>'; bindHeader(); return adminPage($('#view')); }
  app.innerHTML = header(route) + '<main id="view"></main>' + footer();
  bindHeader();
  const v = $('#view');
  if (route === 'c') catPage(v, a, b); else if (route === 'custom') customPage(v); else home(v);
  if (!location.hash.includes('#about')) window.scrollTo(0, 0);
}
function bindHeader() { $('#menuBtn').onclick = openMega; $('#cartBtn').onclick = openCart; }
window.addEventListener('hashchange', render);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMega(); $('.drawer')?.remove(); $('.drawer-bg')?.remove(); } });

(async () => {
  try { await store.init(); await reload(); } catch (e) { console.error(e); app.innerHTML = '<p style="padding:30px">Не вдалося завантажити меню. Оновіть сторінку.</p>'; return; }
  render();
})();
