// Формування тексту замовлення і надсилання кондитеру.
// Пошта — через Web3Forms (без сервера, ключ вводиться в адмінці).
// Месенджери — відкриваються з уже заповненим текстом (WhatsApp, Viber) або з копією тексту (Telegram).
export const digits = (s) => String(s || '').replace(/\D/g, '');
export const money = (n, cur = 'грн') => `${Number(n || 0).toLocaleString('uk-UA')} ${cur}`;

export function orderText(o, settings) {
  const lines = [];
  if (o.type === 'custom') {
    lines.push(`🎂 Індивідуальне замовлення — ${settings.name}`);
    lines.push(`Що: ${o.what}`); if (o.occasion) lines.push(`Привід: ${o.occasion}`);
    if (o.size) lines.push(`Гостей / вага: ${o.size}`); if (o.budget) lines.push(`Бюджет: ${o.budget}`);
    if (o.wishes) lines.push(`Побажання: ${o.wishes}`); if (o.hasPhoto) lines.push('📎 Є фото-приклад (див. адмінку)');
  } else {
    lines.push(`🛍 Нове замовлення — ${settings.name}`);
    o.items.forEach((it, i) => lines.push(`${i + 1}. ${it.name}${it.size ? ` (${it.size})` : ''}${it.filling ? `, начинка: ${it.filling}` : ''}${it.inscription ? `, напис: «${it.inscription}»` : ''} × ${it.qty} = ${money(it.price * it.qty, settings.currency)}`));
    lines.push(`Разом: ${money(o.total, settings.currency)}`);
  }
  lines.push('—');
  lines.push(`Ім'я: ${o.name}`); lines.push(`Телефон: ${o.phone}`);
  if (o.contact) lines.push(`Зв'язок: ${o.contact}`);
  if (o.date) lines.push(`Дата: ${o.date}${o.time ? ' ' + o.time : ''}`);
  if (o.delivery) lines.push(`Отримання: ${o.delivery === 'delivery' ? 'доставка — ' + (o.address || '') : 'самовивіз'}`);
  if (o.comment) lines.push(`Коментар: ${o.comment}`);
  return lines.join('\n');
}

export function messengerLinks(text, s) {
  const out = [];
  const t = encodeURIComponent(text);
  if (s.channels.whatsapp && s.whatsapp) out.push({ id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${digits(s.whatsapp)}?text=${t}` });
  if (s.channels.viber && s.viber) out.push({ id: 'viber', label: 'Viber', href: `viber://chat?number=%2B${digits(s.viber)}&draft=${t}` });
  if (s.channels.telegram && s.telegram) out.push({ id: 'telegram', label: 'Telegram', href: `https://t.me/${String(s.telegram).replace(/^@|https?:\/\/t\.me\//g, '')}`, copy: true });
  if (s.email) out.push({ id: 'mail', label: 'Пошта', href: `mailto:${s.email}?subject=${encodeURIComponent('Замовлення — ' + s.name)}&body=${t}` });
  return out;
}

// Автоматичний лист кондитеру (без участі покупця) через Web3Forms
export async function sendEmail(text, o, s) {
  if (!s.channels.email || !s.web3formsKey) return { skipped: true };
  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: s.web3formsKey, subject: `${o.type === 'custom' ? 'Індивідуальне замовлення' : 'Замовлення'} — ${s.name}`, from_name: s.name, name: o.name, phone: o.phone, message: text }),
    });
    const j = await r.json(); return { ok: !!j.success };
  } catch { return { ok: false }; }
}
