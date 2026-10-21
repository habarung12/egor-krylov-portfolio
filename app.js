const CONFIG = {
  contacts: [
    { label: 'TELEGRAM', value: '@habarung', url: 'https://t.me/habarung' },
    { label: 'EMAIL', value: 'krylovegorrr@gmail.com', url: 'mailto:krylovegorrr@gmail.com', copy: true },
    { label: 'BEHANCE', value: 'behance.net/overwather', url: 'https://www.behance.net/overwather' },
  ],
  previewCount: 12,
};

const PROJECTS = [
  { id: 'gnc-sep-2026', title: { ru: 'GNC · 19–20 сентября', en: 'GNC · Sep 19–20' }, date: { ru: 'СЕН 2026', en: 'SEP 2026' },
    desc: { ru: 'Турнир по Overwatch при поддержке FunPay и FinalGear. Красно-серая айдентика: анонсы, расписания, розыгрыши, итоги, превью для YouTube, панели Twitch и баннеры для сайта.', en: 'Overwatch tournament supported by FunPay and FinalGear. Red & grey identity: announcements, schedules, giveaways, results, YouTube thumbnails, Twitch panels, and web banners.' },
    colors: ['#9E1B22', '#E3DDDC', '#1A1A1A'] },
  { id: 'gnc-aug-2026', title: { ru: 'GNC · 1–2 августа', en: 'GNC · Aug 1–2' }, date: { ru: 'АВГ 2026', en: 'AUG 2026' },
    desc: { ru: 'Тёмная фиолетовая айдентика летнего GNC: открытие регистрации, расписания матчей, MVP, призовой фонд, Twitch-панели и шапки YouTube.', en: 'Dark purple identity for summer GNC: registration opening, match schedules, MVP, prize pool, Twitch panels, and YouTube headers.' },
    colors: ['#6A5BD8', '#121218', '#F2F2F2'] },
  { id: 'gnc-may-2026', title: { ru: 'GNC · 2–3 мая', en: 'GNC · May 2–3' }, date: { ru: 'МАЙ 2026', en: 'MAY 2026' },
    desc: { ru: 'Весенний GNC: светлая модульная сетка, чёрные плашки и цветные акценты. Превью, регистрация, составы команд, трансляции, результаты и баннеры для стримеров.', en: 'Spring GNC: light modular grid, black plates, and color accents. Previews, registration, team rosters, streams, results, and streamer banners.' },
    colors: ['#E4E4E4', '#000000', '#2C6FB7', '#E1A322'] },
  { id: 'gnc-oct-2025', title: { ru: 'GNC · 25–26 октября', en: 'GNC · Oct 25–26' }, date: { ru: 'ОКТ 2025', en: 'OCT 2025' },
    desc: { ru: 'Октябрьский GNC 2025: бело-фиолетовая система с диагональными акцентами, леопардовый логотип, шоу-матч стримеров, сетка, призовые и победители.', en: 'October GNC 2025: white and purple system with diagonal accents, leopard logo, streamers showmatch, brackets, prizes, and winners.' },
    colors: ['#FFFFFF', '#5A2A9C', '#1A1A1A'] },
  { id: 'gnc-jun-2025', title: { ru: 'GNC · 27–29 июня', en: 'GNC · Jun 27–29' }, date: { ru: 'ИЮН 2025', en: 'JUN 2025' },
    desc: { ru: 'Летний GNC 2025 (тогда турнир назывался GandonCup): регистрация, первый матч, правила, комьюнити-стримеры, составы и «зал победителей».', en: 'Summer GNC 2025 (formerly GandonCup): registration, first match, rules, community streamers, rosters, and "winners hall".' },
    colors: ['#6A2FBF', '#2B2B2B', '#EDEDED'] },
  { id: 'gnc-apr-2025', title: { ru: 'GNC · 26–27 апреля', en: 'GNC · Apr 26–27' }, date: { ru: 'АПР 2025', en: 'APR 2025' },
    desc: { ru: 'Чёрно-оранжевая айдентика турнира (тогда ещё GandonCup), который так и не состоялся: анонсы, регистрация, обновление правил и турнирная сетка.', en: 'Black and orange identity of the tournament (formerly GandonCup) that did not take place: announcements, registration, rule updates, and tournament bracket.' },
    colors: ['#FF6A13', '#1E1E1E', '#FFFFFF'] },
  { id: 'stadium', title: { ru: 'GNC в Стадионе', en: 'GNC in Stadium' }, date: { ru: 'СЕН–ОКТ 2025', en: 'SEP–OCT 2025' },
    desc: { ru: 'Временное событие и турнир в режиме «Стадион»: сине-белый стиль, регистрация, правила, рекламные баннеры для Twitch.', en: 'Temporary event and tournament in "Stadium" mode: blue and white style, registration, rules, promotional banners for Twitch.' },
    colors: ['#1366D6', '#FFFFFF', '#0B0B0B'] },
  { id: 'web', title: { ru: 'Web / UI концепты', en: 'Web / UI Concepts' }, date: { ru: 'GNCOW.RU', en: 'GNCOW.RU' },
    desc: { ru: 'Макеты страниц сайта турниров: команды, зал славы, расписание матчей.', en: 'Tournament website page mockups: teams, hall of fame, match schedules.' },
    colors: ['#0D1B2A', '#1E7BD8', '#FFFFFF'] },
  { id: 'logos', title: { ru: 'Логотипы', en: 'Logos' }, date: { ru: 'IDENTITY', en: 'IDENTITY' },
    desc: { ru: 'Знак GNC и логотип ///GNC, версии для Overwatch GNC, «Стадиона» и ранних сезонов, леопардовый GNC, иконка турнира и фанатский логотип в стилистике Diablo.', en: 'GNC sign and ///GNC logo, versions for Overwatch GNC, Stadium and early seasons, leopard GNC, tournament icon, and fan logo in Diablo style.' },
    colors: ['#9E1B22', '#2A8CC4', '#000000', '#FFFFFF'] },
];

function fmt(w, h, proj) {
  if (proj === 'web') return 'WEB';
  if (proj === 'logos') return { ru: 'ЛОГОТИП', en: 'LOGO' };
  const r = w / h;
  if (r > 2.3) return { ru: 'ШАПКА / ПЛАШКА', en: 'HEADER / BANNER' };
  if (r > 1.25) return { ru: 'БАННЕР 16:9', en: '16:9 BANNER' };
  if (r >= 0.9) return { ru: 'ПОСТ 1:1', en: '1:1 POST' };
  return { ru: 'ВЕРТИКАЛЬ / TWITCH', en: 'VERTICAL / TWITCH' };
}

const $ = (s, el = document) => el.querySelector(s);
const pad = n => String(n).padStart(2, '0');

function palette(colors) {
  const lum = hex => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  };
  return colors.map(c =>
    `<i style="background:${c};color:${lum(c) > .55 ? '#000' : '#fff'}"><em>${c.slice(1).toUpperCase()}</em></i>`).join('');
}
const all = [];

const contacts = CONFIG.contacts.filter(c => c.url);
const ext = c => c.url.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
$('#contactList').innerHTML = contacts.map(c => `
  <div class="crow">
    <a class="crow__link" href="${c.url}"${ext(c)}>
      <span class="crow__k">${c.label}</span><span class="crow__v">${c.value.replace(/(.)@/, "$1<wbr>@")}</span><span class="crow__arr">↗</span>
    </a>${c.copy ? `<button class="crow__copy" data-copy="${c.value}" data-i18n-copy="btn_copy">КОПИРОВАТЬ</button>` : ''}
  </div>`).join('');
$('#contactList').addEventListener('click', async e => {
  const b = e.target.closest('.crow__copy'); if (!b) return;
  const lang = localStorage.getItem('site_lang') || 'ru';
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = lang === 'en' ? 'COPIED ✓' : 'СКОПИРОВАНО ✓'; }
  catch { b.textContent = lang === 'en' ? 'FAILED' : 'НЕ ВЫШЛО'; }
  setTimeout(() => { b.textContent = lang === 'en' ? 'COPY' : 'КОПИРОВАТЬ'; }, 1600);
});

function getLocalizedText(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const lang = localStorage.getItem('site_lang') || 'ru';
  return field[lang] || field.ru || field.en || '';
}

function renderSite() {
  const lang = localStorage.getItem('site_lang') || 'ru';
  
  const total = PROJECTS.reduce((s, p) => s + (WORKS[p.id] || []).length, 0);
  $('#projCount').textContent = `${PROJECTS.length} ${lang === 'en' ? 'PROJECTS' : 'ПРОЕКТОВ'} / ${total} ${lang === 'en' ? 'WORKS' : 'РАБОТ'}`;

  $('#plist').innerHTML = PROJECTS.map((p, i) => `
    <li><a href="#p-${p.id}">
      <span class="p-no">PRJ_${pad(i + 1)}</span>
      <span class="p-name">${getLocalizedText(p.title)}</span>
      <span class="p-date">${getLocalizedText(p.date)}</span>
      <span class="p-sw">${palette(p.colors)}</span>
      <span class="p-cnt">${pad(WORKS[p.id].length)} ↗</span>
    </a></li>`).join('');

  const wrap = $('#projects-wrap');
  wrap.innerHTML = '';
  all.length = 0;

  PROJECTS.forEach((p, pi) => {
    const works = WORKS[p.id] || [];
    const sec = document.createElement('article');
    sec.className = 'proj'; sec.id = 'p-' + p.id;
    sec.innerHTML = `
      <header class="proj__head">
        <div><p class="proj__code">PRJ_${pad(pi + 1)} // ${getLocalizedText(p.date)}</p><h3 class="proj__title">${getLocalizedText(p.title)}</h3></div>
        <p class="proj__desc">${getLocalizedText(p.desc)}</p>
        <div class="proj__meta"><div class="proj__sw">${palette(p.colors)}</div><span>${pad(works.length)} ${lang === 'en' ? 'WORKS' : 'РАБОТ'}</span></div>
      </header>
      <div class="grid"></div>`;
    sec._cards = [];
    works.forEach((w, k) => {
      const fObj = w.fmt || fmt(w.w, w.h, p.id);
      const fStr = typeof fObj === 'object' ? (fObj[lang] || fObj.ru) : fObj;
      const idx = all.push({ ...w, fmt: fStr, fmtObj: fObj, proj: getLocalizedText(p.title) }) - 1;
      const a = document.createElement('button');
      a.className = 'card'; a.dataset.fmt = fStr; a.dataset.i = idx;
      a.setAttribute('aria-label', `${getLocalizedText(p.title)} — ${fStr}`);
      a.innerHTML = `<img src="${w.thumb}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async" alt="${getLocalizedText(p.title)} — ${fStr}">`;
      if (k >= CONFIG.previewCount) a.hidden = true, a.dataset.extra = '1';
      sec._cards.push(a);
    });
    if (works.length > CONFIG.previewCount) {
      const more = document.createElement('button');
      more.className = 'more';
      more.innerHTML = `<span class="more__plus">+</span><span class="more__txt" data-i18n="btn_more">ПОКАЗАТЬ ВСЕ РАБОТЫ</span><span class="more__cnt">${works.length}</span><span class="more__arr">↓</span>`;
      more.onclick = () => {
        sec.classList.add('expanded'); applyFilter();
        more.classList.add('leaving'); setTimeout(() => more.remove(), 260);
      };
      sec.appendChild(more);
    }
    wrap.appendChild(sec);
    layout(sec);
  });

  renderFilters();
  if (lb && !lb.hidden && all[cur]) {
    const w = all[cur];
    lbCap.textContent = `${w.proj} // ${w.fmt} // ${w.w}×${w.h}`;
  }
}

(function heroBg() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = (p, n) => WORKS[p] && WORKS[p][n];
  const slides = [pick('gnc-sep-2026', 0), pick('gnc-may-2026', 0), pick('gnc-oct-2025', 0), pick('stadium', 0), pick('gnc-jun-2025', 0)].filter(Boolean);
  const box = $('#heroBg');
  if (box) {
    slides.forEach((w, i) => box.insertAdjacentHTML('beforeend', `<img src="${w.src}" alt="" decoding="async"${i ? ' loading="lazy"' : ''}>`));
    let cur = 0;
    const show = i => { cur = i % slides.length; [...box.children].forEach((el, k) => el.classList.toggle('on', k === cur)); };
    show(0);
    if (!reduce) setInterval(() => show(cur + 1), 6500);
  }
})();

function layout(sec) {
  const grid = $('.grid', sec), W = grid.clientWidth;
  if (!W) return;
  const gap = W < 700 ? 8 : 12;
  const n = W < 520 ? 2 : Math.max(1, Math.min(4, Math.floor((W + gap) / (260 + gap))));
  grid.style.setProperty('--gap', gap + 'px');
  if (grid._n !== n) {
    grid.innerHTML = '';
    grid._cols = Array.from({ length: n }, () => grid.appendChild(Object.assign(document.createElement('div'), { className: 'col' })));
    grid._n = n;
  }
  const colW = (W - gap * (n - 1)) / n, hs = new Array(n).fill(0);
  sec._cards.forEach(c => {
    if (c.hidden) { grid._cols[0].appendChild(c); return; }
    const k = hs.indexOf(Math.min(...hs));
    const w = all[c.dataset.i];
    grid._cols[k].appendChild(c);
    hs[k] += colW * w.h / w.w + gap;
  });
}
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => document.querySelectorAll('.proj').forEach(layout), 120); });

const FORMATS = [
  { ru: 'ВСЕ', en: 'ALL' },
  { ru: 'БАННЕР 16:9', en: '16:9 BANNER' },
  { ru: 'ПОСТ 1:1', en: '1:1 POST' },
  { ru: 'ВЕРТИКАЛЬ / TWITCH', en: 'VERTICAL / TWITCH' },
  { ru: 'ШАПКА / ПЛАШКА', en: 'HEADER / BANNER' },
  { ru: 'ДЛЯ СТРИМА', en: 'FOR STREAM' },
  { ru: 'ЛОГОТИП', en: 'LOGO' },
  { ru: 'WEB', en: 'WEB' }
];
let current = 'ВСЕ';

function renderFilters() {
  const lang = localStorage.getItem('site_lang') || 'ru';
  $('#filters').innerHTML = FORMATS.map(fObj => {
    const fNameRu = fObj.ru;
    const fNameLang = fObj[lang] || fObj.ru;
    const n = fNameRu === 'ВСЕ' ? all.length : all.filter(w => {
      if (typeof w.fmtObj === 'object') {
        return w.fmtObj.ru === fNameRu;
      }
      return w.fmt === fNameRu;
    }).length;
    return `<button role="tab" aria-selected="${fNameRu === current}" data-f="${fNameRu}">${fNameLang}<sup>${n}</sup></button>`;
  }).join('');
}

$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  current = b.dataset.f;
  [...$('#filters').children].forEach(x => x.setAttribute('aria-selected', x === b));
  applyFilter();
});

function applyFilter() {
  document.querySelectorAll('.proj').forEach(sec => {
    const expanded = sec.classList.contains('expanded') || current !== 'ВСЕ';
    let visible = 0, shown = 0;
    sec._cards.forEach(c => {
      const cardFmt = all[c.dataset.i].fmtObj;
      const cardFmtRu = typeof cardFmt === 'object' ? cardFmt.ru : cardFmt;
      const ok = (current === 'ВСЕ' || cardFmtRu === current) && (expanded || !c.dataset.extra);
      const appear = ok && c.hidden;
      c.hidden = !ok; if (ok) visible++;
      c.classList.remove('enter');
      if (appear) {
        void c.offsetWidth;
        c.style.animationDelay = Math.min(shown++, 14) * 45 + 'ms';
        c.classList.add('enter');
      }
    });
    sec.hidden = visible === 0;
    layout(sec);
    const more = $('.more', sec); if (more) more.hidden = current !== 'ВСЕ';
  });
}

const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
let cur = 0;
const visibleIdx = () => [...document.querySelectorAll('.proj')].filter(s => !s.hidden)
  .flatMap(s => s._cards.filter(c => !c.hidden).map(c => +c.dataset.i));
function open(i) {
  cur = i; const w = all[i];
  lbImg.src = w.src; lbImg.alt = `${w.proj} — ${w.fmt}`;
  lbCap.textContent = `${w.proj} // ${w.fmt} // ${w.w}×${w.h}`;
  lb.hidden = false; document.body.style.overflow = 'hidden';
}
function close() { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; }
function step(d) { const v = visibleIdx(); const k = v.indexOf(cur); open(v[(k + d + v.length) % v.length]); }
wrap.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) open(+c.dataset.i); });
$('.lb__close').onclick = close;
$('.lb__prev').onclick = () => step(-1);$('.lb__next').onclick = () => step(1);
lb.addEventListener('click', e => { if (e.target === lb) close(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

const nav = $('.nav'), burger =$('.nav__burger');
const setMenu = o => { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
burger.onclick = () => setMenu(!nav.classList.contains('open'));
$('.nav__backdrop').onclick = () => setMenu(false);
addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });
nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
$('#year').textContent = new Date().getFullYear();

window.addEventListener('langchange', () => {
  renderSite();
  applyFilter();
});

renderSite();
