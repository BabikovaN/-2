// Адмін-панель кондитера: замовлення, вироби, категорії, налаштування.
import { store } from './store.js';
import { S, esc, $, $$, toast, imgSrc, overlay, compressImage, reload } from './app.js';
import { ALLERGENS, DIETS, OCCASIONS } from './seed.js';
import { orderText, money, digits } from './order.js';

let tab = 'orders';
const STATUSES = { new: 'Нове', work: 'В роботі', done: 'Виконано', cancel: 'Скасовано' };

export async function adminPage(v) {
  if (!(await store.isAdmin())) return loginView(v);
  const orders = await store.orders(); const fresh = orders.filter((o) => o.status === 'new').length;
  v.innerHTML = `<div class="admin"><nav class="aside">
      ${[['orders', '📥 Замовлення', fresh], ['products', '🍰 Вироби'], ['cats', '🗂 Категорії'], ['settings', '⚙️ Налаштування']].map(([k, l, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}${n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('')}
      <div style="flex:1"></div><a class="btn btn-ghost btn-sm" href="#/" style="margin:6px 0">← На сайт</a><button id="logout">🚪 Вийти</button></nav>
    <section class="amain" id="amain"></section></div>`;
  $$('[data-tab]', v).forEach((b) => (b.onclick = () => { tab = b.dataset.tab; adminPage(v); }));
  $('#logout', v).onclick = async () => { await store.logout(); adminPage(v); };
  const m = $('#amain', v);
  if (store.mode === 'local') m.insertAdjacentHTML('beforeend', `<div class="notice">Демо-режим: зміни зберігаються лише в цьому браузері. Щоб вироби й замовлення бачили всі відвідувачі, підключіть Firebase (інструкція в README).</div>`);
  ({ orders: ordersTab, products: productsTab, cats: catsTab, settings: settingsTab })[tab](m, orders, v);
}

function loginView(v) {
  const local = store.mode === 'local'; const first = local && !store.hasPassword();
  v.innerHTML = `<div class="container" style="max-width:460px;padding:60px 16px"><form class="panel" id="lf"><div class="eyebrow">Адмін-панель</div><h1 style="font-size:40px;margin:6px 0 18px">${first ? 'Створіть пароль' : 'Вхід для кондитера'}</h1>
    ${local ? '' : '<label class="f"><span>Пошта</span><input class="input" name="email" type="email" required autocomplete="username"></label>'}
    <label class="f"><span>Пароль</span><input class="input" name="pass" type="password" required minlength="6" autocomplete="${first ? 'new-password' : 'current-password'}"></label>
    ${first ? '<label class="f"><span>Повторіть пароль</span><input class="input" name="pass2" type="password" required minlength="6" autocomplete="new-password"></label>' : ''}
    <div id="lerr" style="color:var(--rose-d);font-weight:600;margin-bottom:8px"></div><button class="btn btn-dark btn-block">${first ? 'Зберегти й увійти' : 'Увійти'}</button>
    ${first ? '<p class="muted" style="font-size:13px">Демо-режим: пароль зберігається (у вигляді хешу) лише в цьому браузері.</p>' : ''}</form></div>`;
  $('#lf', v).onsubmit = async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const err = $('#lerr', v);
    try {
      if (first) { if (f.pass.length < 6) throw new Error('Мінімум 6 символів'); if (f.pass !== f.pass2) throw new Error('Паролі не збігаються'); await store.setPassword(f.pass); }
      else await store.login(f.email, f.pass);
      adminPage(v);
    } catch (x) { err.textContent = x.message.includes('auth/') ? 'Невірна пошта або пароль' : x.message; }
  };
}

// ---------- замовлення ----------
function ordersTab(m, orders, v) {
  let filter = 'all';
  const draw = () => {
    const list = orders.filter((o) => filter === 'all' || o.status === filter);
    m.innerHTML = m.querySelector('.notice')?.outerHTML || '';
    m.insertAdjacentHTML('beforeend', `<h1>Замовлення</h1><div class="chips admin-chips">${[['all', 'Усі'], ...Object.entries(STATUSES)].map(([k, l]) => `<button class="chip ${filter === k ? 'on' : ''}" data-s="${k}">${l} · ${k === 'all' ? orders.length : orders.filter((o) => o.status === k).length}</button>`).join('')}</div>
      ${list.length ? list.map((o) => `<div class="order-card"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="font-family:var(--serif);font-size:24px">${o.type === 'custom' ? 'Індивідуальне' : money(o.total, S.settings.currency)}</b>
        <span class="status ${o.status}">${STATUSES[o.status] || o.status}</span><span class="muted">${new Date(o.created).toLocaleString('uk-UA')}</span><div class="spacer"></div>
        <select class="input" data-st="${o.id}" style="width:auto">${Object.entries(STATUSES).map(([k, l]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <pre>${esc(orderText(o, S.settings))}</pre>${o.photo ? `<img src="${o.photo}" alt="Фото-приклад" style="max-height:200px;border-radius:12px;margin-bottom:10px">` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-dark btn-sm" href="tel:${esc(o.phone)}">Подзвонити</a><a class="btn btn-ghost btn-sm" href="viber://chat?number=%2B${digits(o.phone)}">Viber</a><a class="btn btn-ghost btn-sm" href="https://wa.me/${digits(o.phone)}" target="_blank" rel="noopener">WhatsApp</a></div></div>`).join('')
        : '<div class="empty"><p class="muted">Поки що замовлень немає.</p></div>'}`);
    $$('[data-s]', m).forEach((b) => (b.onclick = () => { filter = b.dataset.s; draw(); }));
    $$('[data-st]', m).forEach((sel) => (sel.onchange = async () => { await store.setOrderStatus(sel.dataset.st, sel.value); orders.find((o) => o.id === sel.dataset.st).status = sel.value; toast('Статус оновлено'); draw(); }));
  };
  draw();
}

// ---------- вироби ----------
function productsTab(m) {
  let q = '';
  const draw = () => {
    const list = S.products.filter((p) => !q || (p.name + ' ' + (S.cats.find((c) => c.id === p.cat)?.name || '')).toLowerCase().includes(q));
    $('#plist', m).innerHTML = `<table class="atable"><tr><th></th><th>Назва</th><th class="hide-m">Категорія</th><th>Ціна</th><th class="hide-m">На сайті</th><th></th></tr>
      ${list.map((p) => { const c = S.cats.find((x) => x.id === p.cat); return `<tr class="r"><td><img src="${imgSrc(p.img)}" alt=""></td><td><b>${esc(p.name)}</b>${p.badges.includes('hit') ? ' <span class="tag hit" style="position:static">Хіт</span>' : ''}${p.badges.includes('new') ? ' <span class="tag new" style="position:static">Нове</span>' : ''}</td>
        <td class="hide-m muted">${esc(c?.name || '')}${p.sub ? ' / ' + esc(c?.subs.find((s) => s.id === p.sub)?.name || '') : ''}</td><td>від ${money(Math.min(...(p.sizes?.length ? p.sizes.map((s) => +s.price) : [+p.price])), S.settings.currency)}</td>
        <td class="hide-m">${p.visible === false ? '🙈 Приховано' : '✅'}</td><td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-ed="${p.id}">Змінити</button> <button class="btn btn-ghost btn-sm" data-del="${p.id}" aria-label="Видалити">🗑</button></td></tr>`; }).join('')}</table>`;
    $$('[data-ed]', m).forEach((b) => (b.onclick = () => editProduct(S.products.find((p) => p.id === b.dataset.ed), () => productsTab(m))));
    $$('[data-del]', m).forEach((b) => (b.onclick = async () => { const p = S.products.find((x) => x.id === b.dataset.del); if (!confirm(`Видалити «${p.name}»?`)) return; await store.deleteProduct(p.id); await reload(); toast('Видалено'); draw(); }));
  };
  m.insertAdjacentHTML('beforeend', `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px"><h1 style="margin:0">Вироби</h1><button class="btn btn-dark" id="addP">+ Додати виріб</button></div>
    <input class="input" id="pq" placeholder="Пошук виробу…" style="max-width:360px;margin-bottom:8px"><div id="plist"></div>`);
  $('#pq', m).oninput = (e) => { q = e.target.value.toLowerCase(); draw(); };
  $('#addP', m).onclick = () => editProduct(null, () => productsTab(m.parentElement ? m : m));
  draw();
}

function tagInput(el, values) {
  let busy = false;
  const draw = () => { if (busy) return; busy = true; el.innerHTML = values.map((v, i) => `<span>${esc(v)}<button type="button" data-x="${i}" aria-label="Прибрати">×</button></span>`).join('') + '<input placeholder="Додайте й натисніть Enter">';
    $$('[data-x]', el).forEach((b) => (b.onclick = () => { values.splice(b.dataset.x, 1); draw(); }));
    const inp = $('input', el); inp.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) { e.preventDefault(); values.push(inp.value.trim().replace(/,$/, '')); draw(); $('input', el).focus(); } };
    inp.onblur = () => { if (!busy && inp.value.trim()) { values.push(inp.value.trim()); inp.value = ''; draw(); } }; busy = false; };
  draw(); return values;
}

function editProduct(p, done) {
  const isNew = !p;
  p = JSON.parse(JSON.stringify(p || { name: '', cat: S.cats[0]?.id, sub: S.cats[0]?.subs[0]?.id || '', price: 0, sizes: [{ label: '1 кг', price: 900 }], fillings: [], allergens: ['gluten', 'lactose', 'eggs'], diet: [], occasions: [], badges: [], visible: true, inscription: false, desc: '', ingredients: '', img: '' }));
  const { el, close } = overlay(`<form id="pf" style="padding:28px" novalidate><div class="eyebrow">${isNew ? 'Новий виріб' : 'Редагування'}</div><h2 style="font-size:34px;margin:4px 0 18px">${isNew ? 'Додати виріб' : esc(p.name)}</h2>
    <div style="display:grid;grid-template-columns:240px 1fr;gap:22px" class="pedit">
      <div><div class="drop" id="pdrop" tabindex="0" style="aspect-ratio:1;display:grid;place-items:center;padding:6px">${p.img ? `<img src="${imgSrc(p.img)}" alt="" style="max-height:none;width:100%;height:100%;object-fit:cover;margin:0">` : '📷 Натисніть або перетягніть фото'}</div><input type="file" id="pfile" accept="image/*" hidden>
        <p class="muted" style="font-size:12px">Фото стискається автоматично. Найкраще — квадратне, при денному світлі.</p>
        <label class="switch"><input type="checkbox" name="visible" ${p.visible !== false ? 'checked' : ''}>Показувати на сайті</label>
        <label class="switch"><input type="checkbox" name="hit" ${p.badges.includes('hit') ? 'checked' : ''}>Позначка «Хіт»</label>
        <label class="switch"><input type="checkbox" name="new" ${p.badges.includes('new') ? 'checked' : ''}>Позначка «Новинка»</label>
        <label class="switch"><input type="checkbox" name="inscription" ${p.inscription ? 'checked' : ''}>Можна замовити напис</label></div>
      <div><label class="f"><span>Назва *</span><input class="input" name="name" value="${esc(p.name)}" required></label>
        <div class="two"><label class="f"><span>Категорія</span><select class="input" name="cat">${S.cats.map((c) => `<option value="${c.id}" ${p.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
          <label class="f"><span>Підкатегорія</span><select class="input" name="sub" id="psub"></select></label></div>
        <label class="f"><span>Опис</span><textarea class="input" name="desc" rows="2">${esc(p.desc)}</textarea></label>
        <div class="f"><span style="display:block;font-weight:600;margin-bottom:6px">Розміри й ціни (${esc(S.settings.currency)})</span><div class="sizes-ed" id="sizes"></div><button type="button" class="btn btn-ghost btn-sm" id="addSize">+ Розмір</button></div>
        <div class="f"><span style="display:block;font-weight:600;margin-bottom:6px">Начинки</span><div class="tagbox" id="fills"></div></div>
        <label class="f"><span>Склад</span><textarea class="input" name="ingredients" rows="2">${esc(p.ingredients)}</textarea></label>
        <label class="f"><span>Зберігання (необов'язково)</span><input class="input" name="storage" value="${esc(p.storage || '')}" placeholder="Наприклад: до 72 год при +2…+6 °C"></label>
        <div class="f"><span style="display:block;font-weight:600;margin-bottom:6px">Алергени</span><div class="seg">${Object.entries(ALLERGENS).map(([k, l]) => `<label><input type="checkbox" name="al" value="${k}" ${p.allergens.includes(k) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="f"><span style="display:block;font-weight:600;margin-bottom:6px">Особливості</span><div class="seg">${Object.entries(DIETS).map(([k, l]) => `<label><input type="checkbox" name="diet" value="${k}" ${p.diet.includes(k) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="f"><span style="display:block;font-weight:600;margin-bottom:6px">Привід</span><div class="seg">${OCCASIONS.map((o) => `<label><input type="checkbox" name="occ" value="${o}" ${p.occasions.includes(o) ? 'checked' : ''}><span>${o}</span></label>`).join('')}</div></div>
      </div></div>
    <div id="perr" style="color:var(--rose-d);font-weight:600;margin:6px 0"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="btn btn-ghost" id="pcancel">Скасувати</button><button class="btn btn-dark">${isNew ? 'Додати' : 'Зберегти'}</button></div></form>`);
  if (matchMedia('(max-width:760px)').matches) $('.pedit', el).style.gridTemplateColumns = '1fr';
  const f = $('#pf', el);
  const fillSubs = () => { const c = S.cats.find((x) => x.id === f.cat.value); $('#psub', el).innerHTML = (c?.subs || []).map((s) => `<option value="${s.id}" ${p.sub === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join(''); };
  f.cat.onchange = fillSubs; fillSubs();
  const sizes = p.sizes?.length ? p.sizes : [{ label: '', price: p.price }];
  const drawSizes = () => { $('#sizes', el).innerHTML = sizes.map((s, i) => `<div class="srow"><input class="input" data-sl="${i}" value="${esc(s.label)}" placeholder="1 кг / 6 шт"><input class="input" data-sp="${i}" type="number" min="0" value="${s.price}"><button type="button" class="btn btn-ghost btn-sm" data-sr="${i}" aria-label="Прибрати">×</button></div>`).join('');
    $$('[data-sl]', el).forEach((i) => (i.oninput = () => (sizes[i.dataset.sl].label = i.value))); $$('[data-sp]', el).forEach((i) => (i.oninput = () => (sizes[i.dataset.sp].price = +i.value)));
    $$('[data-sr]', el).forEach((b) => (b.onclick = () => { if (sizes.length > 1) { sizes.splice(b.dataset.sr, 1); drawSizes(); } })); };
  $('#addSize', el).onclick = () => { sizes.push({ label: '', price: 0 }); drawSizes(); }; drawSizes();
  const fills = tagInput($('#fills', el), p.fillings || []);
  const drop = $('#pdrop', el), file = $('#pfile', el);
  const take = async (fl) => { if (!fl) return; drop.textContent = 'Обробка фото…'; p.img = await compressImage(fl, 1000, 0.8); drop.innerHTML = `<img src="${p.img}" alt="" style="max-height:none;width:100%;height:100%;object-fit:cover;margin:0">`; };
  drop.onclick = () => file.click(); file.onchange = () => take(file.files[0]);
  drop.ondragover = (e) => e.preventDefault(); drop.ondrop = (e) => { e.preventDefault(); take(e.dataTransfer.files[0]); };
  $('#pcancel', el).onclick = close;
  f.onsubmit = async (e) => {
    e.preventDefault(); const err = $('#perr', el);
    if (!f.name.value.trim()) return (err.textContent = 'Вкажіть назву');
    const cleanSizes = sizes.filter((s) => s.price > 0);
    if (!cleanSizes.length) return (err.textContent = 'Вкажіть хоча б одну ціну');
    Object.assign(p, { name: f.name.value.trim(), cat: f.cat.value, sub: f.sub.value, desc: f.desc.value.trim(), ingredients: f.ingredients.value.trim(), storage: f.storage.value.trim(), sizes: cleanSizes, price: Math.min(...cleanSizes.map((s) => s.price)),
      fillings: fills, allergens: $$('input[name=al]:checked', f).map((x) => x.value), diet: $$('input[name=diet]:checked', f).map((x) => x.value), occasions: $$('input[name=occ]:checked', f).map((x) => x.value),
      badges: [f.hit.checked && 'hit', f.new.checked && 'new'].filter(Boolean), visible: f.visible.checked, inscription: f.inscription.checked });
    try { await store.saveProduct(p); await reload(); toast(isNew ? 'Виріб додано' : 'Збережено'); close(); done(); } catch (x) { err.textContent = x.message; }
  };
}

// ---------- категорії ----------
function catsTab(m) {
  const cats = JSON.parse(JSON.stringify(S.cats));
  const slug = (s) => s.toLowerCase().replace(/[^a-zа-яіїєґ0-9]+/gi, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 5);
  const draw = () => {
    $('#clist', m).innerHTML = cats.map((c, i) => `<div class="order-card"><div style="display:flex;gap:12px;align-items:center"><button type="button" class="drop" data-cimg="${i}" style="width:64px;height:64px;padding:0;overflow:hidden;flex:none"><img src="${imgSrc(c.img)}" alt="" style="width:100%;height:100%;object-fit:cover;max-height:none;margin:0"></button>
      <input class="input" data-cn="${i}" value="${esc(c.name)}" style="font-weight:700"><button type="button" class="btn btn-ghost btn-sm" data-cdel="${i}">🗑</button></div>
      <div style="margin:10px 0 0 76px">${c.subs.map((s, j) => `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><button type="button" class="drop" data-simg="${i}:${j}" style="width:40px;height:40px;padding:0;overflow:hidden;flex:none"><img src="${imgSrc(s.img)}" alt="" style="width:100%;height:100%;object-fit:cover;max-height:none;margin:0"></button><input class="input" data-sn="${i}:${j}" value="${esc(s.name)}"><button type="button" class="btn btn-ghost btn-sm" data-sdel="${i}:${j}">×</button></div>`).join('')}
      <button type="button" class="btn btn-ghost btn-sm" data-sadd="${i}">+ Підкатегорія</button></div></div>`).join('');
    $$('[data-cn]', m).forEach((x) => (x.oninput = () => (cats[x.dataset.cn].name = x.value)));
    $$('[data-sn]', m).forEach((x) => { const [i, j] = x.dataset.sn.split(':'); x.oninput = () => (cats[i].subs[j].name = x.value); });
    $$('[data-cdel]', m).forEach((b) => (b.onclick = () => { const c = cats[b.dataset.cdel]; if (S.products.some((p) => p.cat === c.id)) return toast('Спершу перенесіть вироби з цієї категорії'); cats.splice(b.dataset.cdel, 1); draw(); }));
    $$('[data-sdel]', m).forEach((b) => (b.onclick = () => { const [i, j] = b.dataset.sdel.split(':'); cats[i].subs.splice(j, 1); draw(); }));
    $$('[data-sadd]', m).forEach((b) => (b.onclick = () => { cats[b.dataset.sadd].subs.push({ id: slug('sub'), name: 'Нова підкатегорія', img: cats[b.dataset.sadd].img }); draw(); }));
    const pick = (cb) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async () => { cb(await compressImage(inp.files[0], 700)); draw(); }; inp.click(); };
    $$('[data-cimg]', m).forEach((b) => (b.onclick = () => pick((u) => (cats[b.dataset.cimg].img = u))));
    $$('[data-simg]', m).forEach((b) => { const [i, j] = b.dataset.simg.split(':'); b.onclick = () => pick((u) => (cats[i].subs[j].img = u)); });
  };
  m.insertAdjacentHTML('beforeend', `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px"><h1 style="margin:0">Категорії меню</h1><div><button class="btn btn-ghost" id="cadd">+ Категорія</button> <button class="btn btn-dark" id="csave">Зберегти</button></div></div>
    <p class="muted">Натисніть на фото, щоб замінити його. Категорії — верхній рівень меню, підкатегорії — «меню в меню».</p><div id="clist"></div>`);
  $('#cadd', m).onclick = () => { cats.push({ id: slug('cat'), name: 'Нова категорія', img: '', subs: [] }); draw(); };
  $('#csave', m).onclick = async () => { try { await store.saveCategories(cats); await reload(); toast('Категорії збережено'); } catch (x) { toast(x.message); } };
  draw();
}

// ---------- налаштування ----------
function settingsTab(m) {
  const s = S.settings;
  const field = (k, l, ph = '', type = 'text') => `<label class="f"><span>${l}</span><input class="input" name="${k}" type="${type}" value="${esc(s[k] ?? '')}" placeholder="${esc(ph)}"></label>`;
  m.insertAdjacentHTML('beforeend', `<h1>Налаштування</h1><form class="panel" id="sf" style="max-width:820px">
    <h3 style="font-size:26px;margin-bottom:12px">Кондитерська</h3><div class="two">${field('name', 'Назва')}${field('tagline', 'Підзаголовок')}</div>
    <div class="two">${field('phone', 'Телефон', '+380…', 'tel')}${field('email', 'Пошта для замовлень', 'you@gmail.com', 'email')}</div>
    <div class="two">${field('address', 'Адреса / місто')}${field('hours', 'Графік роботи')}</div>
    <label class="f"><span>Про нас</span><textarea class="input" name="about" rows="3">${esc(s.about)}</textarea></label>
    <label class="f"><span>Доставка й оплата</span><textarea class="input" name="delivery" rows="2">${esc(s.delivery)}</textarea></label>
    <div class="two">${field('minDays', 'Мінімум днів до замовлення', '2', 'number')}${field('currency', 'Валюта', 'грн')}</div>
    <h3 style="font-size:26px;margin:18px 0 6px">Куди надходять замовлення</h3><p class="muted" style="margin-top:0">Покупець після оформлення побачить кнопки обраних месенджерів з уже готовим текстом замовлення.</p>
    <div class="two">${field('telegram', 'Telegram (username)', '@my_bakery')}${field('viber', 'Viber (номер)', '+380…', 'tel')}</div>
    <div class="two">${field('whatsapp', 'WhatsApp (номер)', '+380…', 'tel')}${field('instagram', 'Instagram', '@my_bakery')}</div>
    ${['telegram', 'viber', 'whatsapp'].map((c) => `<label class="switch"><input type="checkbox" name="ch_${c}" ${s.channels[c] ? 'checked' : ''}>Показувати кнопку ${c[0].toUpperCase() + c.slice(1)}</label>`).join('')}
    <label class="switch"><input type="checkbox" name="ch_email" ${s.channels.email ? 'checked' : ''}>Автоматично надсилати замовлення на пошту</label>
    ${field('web3formsKey', 'Ключ Web3Forms для автоматичних листів', 'безкоштовно на web3forms.com')}
    <p class="muted" style="font-size:13px;margin-top:-8px">Отримайте ключ на web3forms.com (вкажіть свою пошту) — тоді кожне замовлення приходитиме листом автоматично.</p>
    <button class="btn btn-dark">Зберегти налаштування</button></form>
    ${store.mode === 'local' ? `<div class="panel" style="max-width:820px;margin-top:18px"><h3 style="font-size:26px">Демо-дані</h3><p class="muted">Повернути демонстраційне меню й налаштування (ваш пароль залишиться).</p><button class="btn btn-ghost" id="resetDemo">Скинути демо-дані</button></div>` : ''}`);
  $('#sf', m).onsubmit = async (e) => {
    e.preventDefault(); const f = e.target; const v = Object.fromEntries(new FormData(f));
    const next = { ...s, ...v, minDays: Math.max(0, +v.minDays || 0), channels: { telegram: f.ch_telegram.checked, viber: f.ch_viber.checked, whatsapp: f.ch_whatsapp.checked, email: f.ch_email.checked } };
    ['ch_telegram', 'ch_viber', 'ch_whatsapp', 'ch_email'].forEach((k) => delete next[k]);
    await store.saveSettings(next); await reload(); toast('Збережено');
  };
  $('#resetDemo', m)?.addEventListener('click', async () => { if (!confirm('Скинути вироби, категорії, замовлення й налаштування до демо?')) return; await store.resetDemo(); await reload(); toast('Демо-дані відновлено'); });
}
