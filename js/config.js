// ===== НАЛАШТУВАННЯ ПІДКЛЮЧЕННЯ =====
// Демо-режим: FIREBASE = null. Тоді вироби й замовлення зберігаються лише в цьому браузері.
// Бойовий режим: вставте конфіг свого проєкту Firebase (див. README.md, розділ «Підключення Firebase»),
// і ваш email адміністратора — той самий, що в firestore.rules.
export const FIREBASE = null;
/* приклад:
export const FIREBASE = {
  apiKey: '…', authDomain: 'my-shop.firebaseapp.com', projectId: 'my-shop',
  storageBucket: 'my-shop.appspot.com', messagingSenderId: '…', appId: '…',
};
*/
export const ADMIN_EMAILS = ['owner@example.com'];
