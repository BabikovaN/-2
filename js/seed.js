// Демо-асортимент. Кондитер змінює все це в адмінці.
// img — шлях до фото (демо-фото згенеровані; кондитер замінює їх своїми в адмінці)
export const DEFAULT_SETTINGS = {
  name: 'Пастельня', tagline: 'Домашня кондитерська ніжних десертів', currency: 'грн',
  phone: '+380 67 000 00 00', email: '', telegram: '', viber: '', whatsapp: '', instagram: '',
  address: 'м. Київ, самовивіз або доставка', hours: 'Пн–Нд 9:00–20:00', minDays: 2,
  about: 'Печемо з вершкового масла, натуральних ягід і справжньої ванілі. Кожен десерт робимо під ваше свято — без консервантів і з любов\'ю.',
  delivery: 'Самовивіз безкоштовно. Доставка по місту — від 150 грн, торти доставляємо особисто.',
  channels: { email: false, telegram: true, viber: true, whatsapp: true }, web3formsKey: '',
};

export const ALLERGENS = { gluten: 'Глютен', lactose: 'Лактоза', eggs: 'Яйця', nuts: 'Горіхи', soy: 'Соя' };
export const DIETS = { glutenfree: 'Без глютену', sugarfree: 'Без цукру', vegan: 'Веган', lactosefree: 'Без лактози' };
export const OCCASIONS = ['День народження', 'Весілля', 'Дитяче свято', 'Романтика', 'Корпоратив', 'Просто так'];

export const DEFAULT_CATEGORIES = [
  { id: 'cakes', name: 'Торти', img: 'assets/photos/cake-strawberry.webp', subs: [
    { id: 'bento', name: 'Бенто-торти', img: 'assets/photos/bento-lavender.webp' },
    { id: 'birthday', name: 'На день народження', img: 'assets/photos/cake-candles.webp' },
    { id: 'wedding', name: 'Весільні ярусні', img: 'assets/photos/wedding-white.webp' },
    { id: 'mousse', name: 'Мусові', img: 'assets/photos/mousse.webp' },
    { id: 'kids', name: 'Дитячі', img: 'assets/photos/cake-kids.webp' } ] },
  { id: 'pastries', name: 'Тістечка', img: 'assets/photos/eclair-raspberry.webp', subs: [
    { id: 'eclairs', name: 'Еклери', img: 'assets/photos/eclair-choco.webp' },
    { id: 'tarts', name: 'Тарталетки', img: 'assets/photos/tart-berries.webp' },
    { id: 'cheesecakes', name: 'Чизкейки', img: 'assets/photos/cheesecake.webp' },
    { id: 'donuts', name: 'Пончики', img: 'assets/photos/donuts.webp' } ] },
  { id: 'zefir', name: 'Зефір і пастила', img: 'assets/photos/zefir-strawberry.webp', subs: [
    { id: 'zefir', name: 'Зефір', img: 'assets/photos/zefir-currant.webp' },
    { id: 'pastila', name: 'Пастила', img: 'assets/photos/pastila-apple.webp' },
    { id: 'bouquets', name: 'Зефірні букети', img: 'assets/photos/zefir-bouquet.webp' } ] },
  { id: 'macarons', name: 'Макаронс', img: 'assets/photos/macarons-pastel.webp', subs: [
    { id: 'classic', name: 'Класичні смаки', img: 'assets/photos/macarons-sunny.webp' },
    { id: 'sets', name: 'Набори в коробці', img: 'assets/photos/macarons-box.webp' } ] },
  { id: 'cupcakes', name: 'Капкейки', img: 'assets/photos/cupcakes-strawberry.webp', subs: [
    { id: 'classic', name: 'Класичні', img: 'assets/photos/cupcakes-lemon.webp' },
    { id: 'kids', name: 'Для дітей', img: 'assets/photos/cupcakes-kids.webp' } ] },
  { id: 'cookies', name: 'Печиво й пряники', img: 'assets/photos/gingerbread.webp', subs: [
    { id: 'cookies', name: 'Печиво', img: 'assets/photos/cookies-choco.webp' },
    { id: 'gingerbread', name: 'Розписні пряники', img: 'assets/photos/gingerbread.webp' } ] },
  { id: 'gifts', name: 'Подарункові набори', img: 'assets/photos/giftbox.webp', subs: [
    { id: 'boxes', name: 'Солодкі бокси', img: 'assets/photos/giftbox.webp' },
    { id: 'corporate', name: 'Корпоративні', img: 'assets/photos/corporate.webp' } ] },
];

const kg = (base) => [{ label: '1 кг', price: base }, { label: '1,5 кг', price: Math.round(base * 1.45 / 10) * 10 }, { label: '2 кг', price: Math.round(base * 1.9 / 10) * 10 }];
const pcs = (one, labels = [6, 12, 24]) => labels.map((n) => ({ label: `${n} шт`, price: Math.round(one * n * (n >= 24 ? 0.9 : n >= 12 ? 0.95 : 1) / 10) * 10 }));
const CAKE_FILL = ['Ваніль-полуниця', 'Шоколад-вишня', 'Сніккерс', 'Фісташка-малина', 'Червоний оксамит', 'Кокос-манго'];
const ing = (s) => s;
let n = 0;
const P = (o) => ({ id: 'p' + (++n), visible: true, badges: [], allergens: ['gluten', 'lactose', 'eggs'], diet: [], occasions: ['Просто так'], fillings: [], inscription: false, ...o });

export const DEFAULT_PRODUCTS = [
  P({ name: 'Бенто «Ніжність»', cat: 'cakes', sub: 'bento', price: 550, sizes: [{ label: '450 г (Ø 12 см)', price: 550 }, { label: '700 г (Ø 14 см)', price: 750 }], fillings: CAKE_FILL, inscription: true, badges: ['hit'], occasions: ['День народження', 'Романтика', 'Просто так'],
    desc: 'Маленький торт у коробочці з написом на ваш вибір — ідеальний подарунок на двох.', ingredients: ing('Бісквіт на вершковому маслі, крем-чіз, ягідне конфі, натуральний барвник.'), img: 'assets/photos/bento-lavender.webp' }),
  P({ name: 'Бенто «М\'ятна хмарка»', cat: 'cakes', sub: 'bento', price: 550, sizes: [{ label: '450 г (Ø 12 см)', price: 550 }, { label: '700 г (Ø 14 см)', price: 750 }], fillings: CAKE_FILL, inscription: true, occasions: ['День народження', 'Просто так'],
    desc: 'Бенто у м\'ятних тонах з ніжним вершковим кремом.', ingredients: 'Ванільний бісквіт, крем-чіз, полуничне конфі.', img: 'assets/photos/bento-mint.webp' }),
  P({ name: 'Торт «Полуничне свято»', cat: 'cakes', sub: 'birthday', price: 950, sizes: kg(950), fillings: CAKE_FILL, inscription: true, badges: ['hit'], occasions: ['День народження', 'Дитяче свято'],
    desc: 'Дворівневий торт зі свіжою полуницею та шоколадними патьоками.', ingredients: 'Бісквіт, крем-чіз, свіжа полуниця, бельгійський шоколад.', img: 'assets/photos/cake-strawberry.webp' }),
  P({ name: 'Торт «Свічки бажань»', cat: 'cakes', sub: 'birthday', price: 900, sizes: kg(900), fillings: CAKE_FILL, inscription: true, occasions: ['День народження'],
    desc: 'М\'ятний торт з шоколадною глазур\'ю і святковими свічками.', ingredients: 'Шоколадний бісквіт, вершковий крем, шоколадний ганаш.', allergens: ['gluten', 'lactose', 'eggs', 'soy'], img: 'assets/photos/cake-candles.webp' }),
  P({ name: 'Весільний «Біла лаванда»', cat: 'cakes', sub: 'wedding', price: 1100, sizes: [{ label: '3 кг', price: 3300 }, { label: '5 кг', price: 5300 }, { label: '8 кг', price: 8200 }], fillings: CAKE_FILL, inscription: true, badges: ['new'], occasions: ['Весілля'],
    desc: 'Триярусний торт із живими квітами — головна прикраса весільного столу. Дегустація — безкоштовно.', ingredients: 'Ванільний бісквіт, крем на маскарпоне, ягідні шари.', img: 'assets/photos/wedding-white.webp' }),
  P({ name: 'Весільний «Пастельний сад»', cat: 'cakes', sub: 'wedding', price: 1150, sizes: [{ label: '3 кг', price: 3450 }, { label: '5 кг', price: 5600 }], fillings: CAKE_FILL, inscription: true, occasions: ['Весілля'],
    desc: 'Ярусний торт з макаронс і лавандовою глазур\'ю.', ingredients: 'Бісквіт, крем-чіз, макаронс, ягоди.', allergens: ['gluten', 'lactose', 'eggs', 'nuts'], img: 'assets/photos/wedding-lavender.webp' }),
  P({ name: 'Мусовий «Чорниця-лаванда»', cat: 'cakes', sub: 'mousse', price: 1050, sizes: [{ label: '1 кг (Ø 16 см)', price: 1050 }, { label: '1,6 кг (Ø 20 см)', price: 1600 }], fillings: ['Чорниця-лаванда', 'Манго-маракуя', 'Три шоколади'], occasions: ['Романтика', 'Просто так'],
    desc: 'Легкий мусовий торт із дзеркальною глазур\'ю.', ingredients: 'Мус на вершках, ягідне желе, мигдальний бісквіт.', allergens: ['lactose', 'eggs', 'nuts'], diet: ['glutenfree'], img: 'assets/photos/mousse.webp' }),
  P({ name: 'Дитячий «Райдужний»', cat: 'cakes', sub: 'kids', price: 900, sizes: kg(900), fillings: ['Ваніль-полуниця', 'Шоколад-банан', 'Пломбір'], inscription: true, badges: ['hit'], occasions: ['Дитяче свято', 'День народження'],
    desc: 'Яскравий торт з посипкою — без штучних барвників.', ingredients: 'Ванільний бісквіт, вершковий крем, полуниця.', img: 'assets/photos/cake-kids.webp' }),
  P({ name: 'Еклери «Шоколад»', cat: 'pastries', sub: 'eclairs', price: 75, sizes: pcs(75), fillings: ['Ванільний крем', 'Шоколадний крем', 'Солона карамель'],
    desc: 'Заварне тісто, ніжний крем і бельгійський шоколад.', ingredients: 'Заварне тісто, крем патісьєр, шоколадна глазур.', img: 'assets/photos/eclair-choco.webp' }),
  P({ name: 'Еклери «Малина»', cat: 'pastries', sub: 'eclairs', price: 80, sizes: pcs(80), fillings: ['Малиновий крем', 'Ванільний крем'], badges: ['new'],
    desc: 'Рожева глазур і свіжа малина.', ingredients: 'Заварне тісто, малиновий крем, ягоди.', img: 'assets/photos/eclair-raspberry.webp' }),
  P({ name: 'Тарталетки з ягодами', cat: 'pastries', sub: 'tarts', price: 85, sizes: pcs(85), fillings: ['Ванільний крем', 'Лимонний курд'],
    desc: 'Пісочний кошик, крем і свіжі ягоди.', ingredients: 'Пісочне тісто, крем, сезонні ягоди.', img: 'assets/photos/tart-berries.webp' }),
  P({ name: 'Тарталетки «Цитрус»', cat: 'pastries', sub: 'tarts', price: 85, sizes: pcs(85), fillings: ['Лимонний курд', 'Апельсиновий курд'],
    desc: 'Яскравий цитрусовий курд з карамелізованими фруктами.', ingredients: 'Пісочне тісто, курд, апельсин.', img: 'assets/photos/tart-citrus.webp' }),
  P({ name: 'Чизкейк «Нью-Йорк»', cat: 'pastries', sub: 'cheesecakes', price: 120, sizes: [{ label: '1 шматочок', price: 120 }, { label: 'Цілий (1,2 кг)', price: 1100 }], fillings: ['Класичний', 'Полуничний топінг', 'Солона карамель'], badges: ['hit'],
    desc: 'Щільний вершковий чизкейк на пісочній основі.', ingredients: 'Крем-сир, вершки, печиво, ягідний топінг.', img: 'assets/photos/cheesecake.webp' }),
  P({ name: 'Пончики з глазур\'ю', cat: 'pastries', sub: 'donuts', price: 55, sizes: pcs(55), fillings: ['Без начинки', 'Ванільний крем', 'Полуничний джем'], occasions: ['Дитяче свято', 'Просто так'],
    desc: 'Пишні пончики з кольоровою глазур\'ю та посипкою.', ingredients: 'Дріжджове тісто, глазур, посипка.', img: 'assets/photos/donuts.webp' }),
  P({ name: 'Зефір «Полуниця»', cat: 'zefir', sub: 'zefir', price: 45, sizes: pcs(45, [6, 12, 18]), badges: ['hit'], allergens: ['eggs'], diet: ['glutenfree', 'lactosefree'],
    desc: 'Повітряний зефір на яблучному пюре зі справжньою полуницею.', ingredients: 'Яблучне пюре, полуниця, цукор, агар-агар, білок.', img: 'assets/photos/zefir-strawberry.webp' }),
  P({ name: 'Зефір «Чорна смородина»', cat: 'zefir', sub: 'zefir', price: 45, sizes: pcs(45, [6, 12, 18]), allergens: ['eggs'], diet: ['glutenfree', 'lactosefree'],
    desc: 'Ягідний зефір лавандового відтінку.', ingredients: 'Яблучне пюре, смородина, цукор, агар-агар, білок.', img: 'assets/photos/zefir-currant.webp' }),
  P({ name: 'Пастила яблучна', cat: 'zefir', sub: 'pastila', price: 160, sizes: [{ label: '200 г', price: 160 }, { label: '400 г', price: 300 }], allergens: [], diet: ['glutenfree', 'lactosefree', 'vegan', 'sugarfree'], badges: ['new'],
    desc: 'Шарова пастила з печених яблук — без цукру.', ingredients: 'Печені яблука, ягоди.', img: 'assets/photos/pastila-apple.webp' }),
  P({ name: 'Пастила «Манго-маракуя»', cat: 'zefir', sub: 'pastila', price: 180, sizes: [{ label: '200 г', price: 180 }, { label: '400 г', price: 340 }], allergens: [], diet: ['glutenfree', 'lactosefree', 'vegan'],
    desc: 'Тропічна пастила сонячного кольору.', ingredients: 'Манго, маракуя, яблуко.', img: 'assets/photos/pastila-mango.webp' }),
  P({ name: 'Зефірний букет «Весна»', cat: 'zefir', sub: 'bouquets', price: 650, sizes: [{ label: '9 квіток', price: 650 }, { label: '15 квіток', price: 990 }, { label: '25 квіток', price: 1550 }], allergens: ['eggs'], diet: ['glutenfree'], occasions: ['Романтика', 'День народження'],
    desc: 'Букет із зефірних квітів у крафтовій упаковці.', ingredients: 'Зефір, харчові барвники, упаковка.', img: 'assets/photos/zefir-bouquet.webp' }),
  P({ name: 'Макаронс класичні', cat: 'macarons', sub: 'classic', price: 50, sizes: pcs(50), fillings: ['Мікс смаків', 'Фісташка', 'Малина', 'Солона карамель', 'Лаванда'], allergens: ['nuts', 'eggs', 'lactose'], diet: ['glutenfree'], badges: ['hit'],
    desc: 'Мигдальне печиво з ганашем — хрустке зовні, ніжне всередині.', ingredients: 'Мигдальне борошно, білок, ганаш.', img: 'assets/photos/macarons-pastel.webp' }),
  P({ name: 'Макаронс «Сонячний мікс»', cat: 'macarons', sub: 'classic', price: 50, sizes: pcs(50), fillings: ['Лимон', 'Маракуя', 'Фісташка'], allergens: ['nuts', 'eggs', 'lactose'], diet: ['glutenfree'],
    desc: 'Яскраві цитрусові смаки.', ingredients: 'Мигдальне борошно, білок, курд.', img: 'assets/photos/macarons-sunny.webp' }),
  P({ name: 'Набір макаронс у коробці', cat: 'macarons', sub: 'sets', price: 420, sizes: [{ label: '8 шт', price: 420 }, { label: '16 шт', price: 790 }], allergens: ['nuts', 'eggs', 'lactose'], diet: ['glutenfree'], occasions: ['День народження', 'Корпоратив', 'Романтика'],
    desc: 'Подарункова коробка зі стрічкою і листівкою.', ingredients: 'Макаронс 4 смаків, упаковка.', inscription: true, img: 'assets/photos/macarons-box.webp' }),
  P({ name: 'Капкейки «Полуниця»', cat: 'cupcakes', sub: 'classic', price: 70, sizes: pcs(70), fillings: ['Полуниця', 'Шоколад', 'Карамель'], badges: ['hit'],
    desc: 'Ванільні капкейки з шапочкою крем-чізу.', ingredients: 'Бісквіт, крем-чіз, ягідна начинка.', img: 'assets/photos/cupcakes-strawberry.webp' }),
  P({ name: 'Капкейки «Лимонна хмарка»', cat: 'cupcakes', sub: 'classic', price: 70, sizes: pcs(70), fillings: ['Лимонний курд', 'Ваніль'],
    desc: 'Ніжні капкейки з лимонним кремом.', ingredients: 'Бісквіт, крем, лимонний курд.', img: 'assets/photos/cupcakes-lemon.webp' }),
  P({ name: 'Дитячі капкейки з посипкою', cat: 'cupcakes', sub: 'kids', price: 65, sizes: pcs(65), fillings: ['Ваніль', 'Шоколад'], occasions: ['Дитяче свято'],
    desc: 'Кольорові капкейки для найменших гостей.', ingredients: 'Бісквіт, вершковий крем, посипка.', img: 'assets/photos/cupcakes-kids.webp' }),
  P({ name: 'Печиво з шоколадом', cat: 'cookies', sub: 'cookies', price: 35, sizes: pcs(35, [6, 12, 20]), allergens: ['gluten', 'lactose', 'eggs', 'soy'],
    desc: 'Американське печиво з шматочками шоколаду.', ingredients: 'Борошно, вершкове масло, шоколад.', img: 'assets/photos/cookies-choco.webp' }),
  P({ name: 'Розписні пряники', cat: 'cookies', sub: 'gingerbread', price: 60, sizes: pcs(60, [5, 10, 20]), inscription: true, occasions: ['Дитяче свято', 'Корпоратив', 'День народження'], badges: ['new'],
    desc: 'Імбирні пряники з айсингом — можна з іменами гостей.', ingredients: 'Імбирне тісто, мед, айсинг.', img: 'assets/photos/gingerbread.webp' }),
  P({ name: 'Бокс «Солодкий ранок»', cat: 'gifts', sub: 'boxes', price: 690, sizes: [{ label: 'Стандарт', price: 690 }, { label: 'Великий', price: 1090 }], inscription: true, allergens: ['gluten', 'lactose', 'eggs', 'nuts'], occasions: ['День народження', 'Романтика'],
    desc: 'Капкейки, макаронс і зефір в одній коробці з листівкою.', ingredients: 'Асорті десертів.', img: 'assets/photos/giftbox.webp' }),
  P({ name: 'Корпоративний набір', cat: 'gifts', sub: 'corporate', price: 950, sizes: [{ label: '10 наборів', price: 9500 }, { label: '25 наборів', price: 22500 }], inscription: true, allergens: ['gluten', 'lactose', 'eggs', 'nuts'], occasions: ['Корпоратив'],
    desc: 'Брендовані бокси з логотипом вашої компанії на пряниках.', ingredients: 'Пряники з логотипом, макаронс, зефір.', img: 'assets/photos/corporate.webp' }),
];
