/* ========== НАСТРОЙКИ — правь здесь ========== */
const CONFIG = {
  // Пустые ссылки не показываются на сайте
  contacts: [
    { label: 'TELEGRAM', value: '@habarung', url: 'https://t.me/habarung' },
    { label: 'EMAIL', value: 'krylovegorrr@gmail.com', url: 'mailto:krylovegorrr@gmail.com', copy: true },
    { label: 'BEHANCE', value: 'behance.net/overwather', url: 'https://www.behance.net/overwather' },
  ],
  // Сколько работ показывать в проекте до кнопки «Показать все»
  previewCount: 12,
};

/* Проекты: порядок = порядок на сайте */
const PROJECTS = [
  { id: 'gnc-sep-2026', title: 'GNC · 19–20 сентября', date: 'СЕН 2026',
    desc: 'Турнир по Overwatch при поддержке FunPay и FinalGear. Красно-серая айдентика: анонсы, расписания, розыгрыши, итоги, превью для YouTube, панели Twitch и баннеры для сайта.',
    colors: ['#9E1B22', '#E3DDDC', '#1A1A1A'] },
  { id: 'gnc-aug-2026', title: 'GNC · 1–2 августа', date: 'АВГ 2026',
    desc: 'Тёмная фиолетовая айдентика летнего GNC: открытие регистрации, расписания матчей, MVP, призовой фонд, Twitch-панели и шапки YouTube.',
    colors: ['#6A5BD8', '#121218', '#F2F2F2'] },
  { id: 'gnc-may-2026', title: 'GNC · 2–3 мая', date: 'МАЙ 2026',
    desc: 'Весенний GNC: светлая модульная сетка, чёрные плашки и цветные акценты. Превью, регистрация, составы команд, трансляции, результаты и баннеры для стримеров.',
    colors: ['#E4E4E4', '#000000', '#2C6FB7', '#E1A322'] },
  { id: 'gnc-oct-2025', title: 'GNC · 25–26 октября', date: 'ОКТ 2025',
    desc: 'Октябрьский GNC 2025: бело-фиолетовая система с диагональными акцентами, леопардовый логотип, шоу-матч стримеров, сетка, призовые и победители.',
    colors: ['#FFFFFF', '#5A2A9C', '#1A1A1A'] },
  { id: 'gnc-jun-2025', title: 'GNC · 27–29 июня', date: 'ИЮН 2025',
    desc: 'Летний GNC 2025 (тогда турнир назывался GandonCup): регистрация, первый матч, правила, комьюнити-стримеры, составы и «зал победителей».',
    colors: ['#6A2FBF', '#2B2B2B', '#EDEDED'] },
  { id: 'gnc-apr-2025', title: 'GNC · 26–27 апреля', date: 'АПР 2025',
    desc: 'Чёрно-оранжевая айдентика турнира (тогда ещё GandonCup), который так и не состоялся: анонсы, регистрация, обновление правил и турнирная сетка.',
    colors: ['#FF6A13', '#1E1E1E', '#FFFFFF'] },
  { id: 'stadium', title: 'GNC в Стадионе', date: 'СЕН–ОКТ 2025',
    desc: 'Временное событие и турнир в режиме «Стадион»: сине-белый стиль, регистрация, правила, рекламные баннеры для Twitch.',
    colors: ['#1366D6', '#FFFFFF', '#0B0B0B'] },
  { id: 'web', title: 'Web / UI концепты', date: 'GNCOW.RU',
    desc: 'Макеты страниц сайта турниров: команды, зал славы, расписание матчей.',
    colors: ['#0D1B2A', '#1E7BD8', '#FFFFFF'] },
  { id: 'logos', title: 'Логотипы', date: 'IDENTITY',
    desc: 'Знак GNC и логотип ///GNC, версии для Overwatch GNC, «Стадиона» и ранних сезонов, леопардовый GNC, иконка турнира и фанатский логотип в стилистике Diablo.',
    colors: ['#9E1B22', '#2A8CC4', '#000000', '#FFFFFF'] },
];

/* Формат работы по пропорциям */
function fmt(w, h, proj) {
  if (proj === 'web') return 'WEB';
  if (proj === 'logos') return 'ЛОГОТИП';
  const r = w / h;
  if (r > 2.3) return 'ШАПКА / ПЛАШКА';
  if (r > 1.25) return 'БАННЕР 16:9';
  if (r >= 0.9) return 'ПОСТ 1:1';
  return 'ВЕРТИКАЛЬ / TWITCH';
}

const $ = (s, el = document) => el.querySelector(s);
const pad = n => String(n).padStart(2, '0');

/* Палитра проекта: полоса из цветов с HEX-кодами */
function palette(colors) {
  const lum = hex => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  };
  return colors.map(c =>
    `<i style="background:${c};color:${lum(c) > .55 ? '#000' : '#fff'}"><em>${c.slice(1).toUpperCase()}</em></i>`).join('');
}
const all = [];   // плоский список для лайтбокса

/* ---------- CONTACTS ---------- */
const contacts = CONFIG.contacts.filter(c => c.url);
const ext = c => c.url.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
$('#heroLinks').innerHTML = contacts
  .map(c => `<a href="${c.url}"${ext(c)}>${c.label} ↗</a>`).join('');
$('#contactList').innerHTML = contacts.map(c => `
  <div class="crow">
    <a class="crow__link" href="${c.url}"${ext(c)}>
      <span class="crow__k">${c.label}</span><span class="crow__v">${c.value.replace(/(.)@/, "$1<wbr>@")}</span><span class="crow__arr">↗</span>
    </a>${c.copy ? `<button class="crow__copy" data-copy="${c.value}">КОПИРОВАТЬ</button>` : ''}
  </div>`).join('');
$('#contactList').addEventListener('click', async e => {
  const b = e.target.closest('.crow__copy'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'СКОПИРОВАНО ✓'; }
  catch { b.textContent = 'НЕ ВЫШЛО'; }
  setTimeout(() => { b.textContent = 'КОПИРОВАТЬ'; }, 1600);
});

/* ---------- PROJECTS INDEX + WORKS ---------- */
const total = PROJECTS.reduce((s, p) => s + (WORKS[p.id] || []).length, 0);
$('#projCount').textContent = `${PROJECTS.length} ПРОЕКТОВ / ${total} РАБОТ`;
$('#statProj').textContent = PROJECTS.length;
$('#statWorks').textContent = total;

$('#plist').innerHTML = PROJECTS.map((p, i) => `
  <li><a href="#p-${p.id}">
    <span class="p-no">PRJ_${pad(i + 1)}</span>
    <span class="p-name">${p.title}</span>
    <span class="p-date">${p.date}</span>
    <span class="p-sw">${palette(p.colors)}</span>
    <span class="p-cnt">${pad(WORKS[p.id].length)} ↗</span>
  </a></li>`).join('');

const wrap = $('#projects-wrap');
PROJECTS.forEach((p, pi) => {
  const works = WORKS[p.id] || [];
  const sec = document.createElement('article');
  sec.className = 'proj'; sec.id = 'p-' + p.id;
  sec.innerHTML = `
    <header class="proj__head">
      <div><p class="proj__code">PRJ_${pad(pi + 1)} // ${p.date}</p><h3 class="proj__title">${p.title}</h3></div>
      <p class="proj__desc">${p.desc}</p>
      <div class="proj__meta"><div class="proj__sw">${palette(p.colors)}</div><span>${pad(works.length)} РАБОТ</span></div>
    </header>
    <div class="grid"></div>`;
  sec._cards = [];
  works.forEach((w, k) => {
    const f = fmt(w.w, w.h, p.id);
    const idx = all.push({ ...w, fmt: f, proj: p.title }) - 1;
    const a = document.createElement('button');
    a.className = 'card'; a.dataset.fmt = f; a.dataset.i = idx;
    a.setAttribute('aria-label', `${p.title} — ${f}`);
    a.innerHTML = `<img src="${w.thumb}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async" alt="${p.title} — ${f}">`;
    if (k >= CONFIG.previewCount) a.hidden = true, a.dataset.extra = '1';
    sec._cards.push(a);
  });
  if (works.length > CONFIG.previewCount) {
    const more = document.createElement('button');
    more.className = 'more';
    more.innerHTML = `<span class="more__plus">+</span><span class="more__txt">ПОКАЗАТЬ ВСЕ РАБОТЫ</span><span class="more__cnt">${works.length}</span><span class="more__arr">↓</span>`;
    more.onclick = () => {
      sec.classList.add('expanded'); applyFilter();
      more.classList.add('leaving'); setTimeout(() => more.remove(), 260);
    };
    sec.appendChild(more);
  }
  wrap.appendChild(sec);
  layout(sec);
});

/* ---------- MASONRY ---------- */
// Раскладка детерминирована: первые N работ всегда стоят на тех же местах,
// поэтому при «Показать все» уже видимые карточки не двигаются.
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


/* ---------- FILTERS ---------- */
const FORMATS = ['ВСЕ', 'БАННЕР 16:9', 'ПОСТ 1:1', 'ВЕРТИКАЛЬ / TWITCH', 'ШАПКА / ПЛАШКА', 'ЛОГОТИП', 'WEB'];
let current = 'ВСЕ';
$('#filters').innerHTML = FORMATS.map(f => {
  const n = f === 'ВСЕ' ? all.length : all.filter(w => w.fmt === f).length;
  return `<button role="tab" aria-selected="${f === current}" data-f="${f}">${f}<sup>${n}</sup></button>`;
}).join('');
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
      const ok = (current === 'ВСЕ' || c.dataset.fmt === current) && (expanded || !c.dataset.extra);
      const appear = ok && c.hidden;
      c.hidden = !ok; if (ok) visible++;
      c.classList.remove('enter');
      if (appear) {
        void c.offsetWidth; // перезапуск анимации
        c.style.animationDelay = Math.min(shown++, 14) * 45 + 'ms';
        c.classList.add('enter');
      }
    });
    sec.hidden = visible === 0;
    layout(sec);
    const more = $('.more', sec); if (more) more.hidden = current !== 'ВСЕ';
  });
}

/* ---------- LIGHTBOX ---------- */
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
$('.lb__prev').onclick = () => step(-1);
$('.lb__next').onclick = () => step(1);
lb.addEventListener('click', e => { if (e.target === lb) close(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

/* ---------- NAV ---------- */
const nav = $('.nav'), burger = $('.nav__burger');
burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
$('#year').textContent = new Date().getFullYear();
