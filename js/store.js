// Шар даних з однаковим інтерфейсом для двох режимів:
//  • local — localStorage (демо, працює одразу);
//  • firebase — Firestore + Auth (бойовий, дані спільні для всіх відвідувачів).
import { FIREBASE, ADMIN_EMAILS } from './config.js';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from './seed.js';

const NS = 'pastelnya:v1:';
const rd = (k, f) => { try { const v = localStorage.getItem(NS + k); return v === null ? f : JSON.parse(v); } catch { return f; } };
const wr = (k, v) => { try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; } catch { return false; } };
const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('pastelnya:' + s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// ---------- кошик (завжди локально) ----------
export const cart = {
  get: () => rd('cart', []),
  set: (items) => wr('cart', items),
  add(item) { const c = cart.get(); const same = c.find((x) => x.key === item.key); if (same) same.qty += item.qty; else c.push(item); cart.set(c); return c; },
  clear: () => wr('cart', []),
};

// ---------- локальний режим ----------
const local = {
  mode: 'local',
  async init() {},
  async settings() { return { ...clone(DEFAULT_SETTINGS), ...rd('settings', {}), channels: { ...DEFAULT_SETTINGS.channels, ...(rd('settings', {}).channels || {}) } }; },
  async saveSettings(s) { wr('settings', s); },
  async categories() { return rd('categories', null) || clone(DEFAULT_CATEGORIES); },
  async saveCategories(list) { wr('categories', list); },
  async products() { return rd('products', null) || clone(DEFAULT_PRODUCTS); },
  async saveProduct(p) { const all = await local.products(); if (!p.id) p.id = 'p' + uid(); const i = all.findIndex((x) => x.id === p.id); if (i >= 0) all[i] = p; else all.unshift(p);
    if (!wr('products', all)) throw new Error('Забагато великих фото для демо-режиму. Стисніть фото або підключіть Firebase.'); return p; },
  async deleteProduct(id) { wr('products', (await local.products()).filter((x) => x.id !== id)); },
  async addOrder(o) { const all = rd('orders', []); o.id = uid(); o.created = Date.now(); o.status = 'new'; all.unshift(o); wr('orders', all.slice(0, 300)); return o; },
  async orders() { return rd('orders', []); },
  async setOrderStatus(id, status) { const all = rd('orders', []); const o = all.find((x) => x.id === id); if (o) o.status = status; wr('orders', all); },
  // адмін у демо-режимі: пароль, що зберігається як хеш у цьому браузері
  async isAdmin() { return sessionStorage.getItem(NS + 'admin') === '1'; },
  hasPassword: () => !!rd('adminHash', null),
  async setPassword(p) { wr('adminHash', await sha(p)); sessionStorage.setItem(NS + 'admin', '1'); },
  async login(_email, p) { if ((await sha(p)) !== rd('adminHash', '')) throw new Error('Невірний пароль'); sessionStorage.setItem(NS + 'admin', '1'); },
  async logout() { sessionStorage.removeItem(NS + 'admin'); },
  async resetDemo() { ['settings', 'categories', 'products', 'orders'].forEach((k) => localStorage.removeItem(NS + k)); },
};

// ---------- Firebase ----------
function firebaseStore() {
  const V = '10.12.2'; let fs, au, db, auth;
  const s = {
    mode: 'firebase',
    async init() {
      const app = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
      fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
      au = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
      const a = app.initializeApp(FIREBASE); db = fs.getFirestore(a); auth = au.getAuth(a);
      await new Promise((r) => { const un = au.onAuthStateChanged(auth, () => { un(); r(); }); });
    },
    async settings() { const d = await fs.getDoc(fs.doc(db, 'site', 'settings')); const v = d.exists() ? d.data() : {}; return { ...clone(DEFAULT_SETTINGS), ...v, channels: { ...DEFAULT_SETTINGS.channels, ...(v.channels || {}) } }; },
    async saveSettings(v) { await fs.setDoc(fs.doc(db, 'site', 'settings'), v); },
    async categories() { const d = await fs.getDoc(fs.doc(db, 'site', 'categories')); return d.exists() ? d.data().list : clone(DEFAULT_CATEGORIES); },
    async saveCategories(list) { await fs.setDoc(fs.doc(db, 'site', 'categories'), { list }); },
    async products() { const q = await fs.getDocs(fs.collection(db, 'products')); const list = q.docs.map((d) => ({ ...d.data(), id: d.id })); return list.length ? list.sort((a, b) => (b.updated || 0) - (a.updated || 0)) : clone(DEFAULT_PRODUCTS); },
    async saveProduct(p) { p.updated = Date.now(); if (!p.id || /^p\d+$/.test(p.id)) p.id = 'p' + uid(); await fs.setDoc(fs.doc(db, 'products', p.id), p); return p; },
    async deleteProduct(id) { await fs.deleteDoc(fs.doc(db, 'products', id)); },
    async addOrder(o) { o.created = Date.now(); o.status = 'new'; const r = await fs.addDoc(fs.collection(db, 'orders'), o); o.id = r.id; return o; },
    async orders() { const q = await fs.getDocs(fs.query(fs.collection(db, 'orders'), fs.orderBy('created', 'desc'), fs.limit(300))); return q.docs.map((d) => ({ ...d.data(), id: d.id })); },
    async setOrderStatus(id, status) { await fs.updateDoc(fs.doc(db, 'orders', id), { status }); },
    async isAdmin() { const u = auth.currentUser; return !!u && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes((u.email || '').toLowerCase()); },
    hasPassword: () => true,
    async login(email, p) { await au.signInWithEmailAndPassword(auth, email, p); if (!(await s.isAdmin())) { await au.signOut(auth); throw new Error('Цей акаунт не є адміністратором'); } },
    async logout() { await au.signOut(auth); },
  };
  return s;
}

export const store = FIREBASE ? firebaseStore() : local;
