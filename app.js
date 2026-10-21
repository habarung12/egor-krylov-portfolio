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

/* Список проектов лежит в assets/projects.js — правь там */
const PROJECTS = window.PORTFOLIO_PROJECTS.map(p => ({ ...p }));

// Проекты, добавленные через админ-панель Supabase.
if (Array.isArray(window.PORTFOLIO_ADMIN_DATA?.projects)) {
  const added = window.PORTFOLIO_ADMIN_DATA.projects.map(p => ({
    id: p.id,
    title: window.PORTFOLIO_LANG === 'en' ? (p.title_en || p.title) : p.title,
    date: (window.PORTFOLIO_LANG === 'en' ? p.date_en || p.date : p.date) || '',
    desc: (window.PORTFOLIO_LANG === 'en' ? p.description_en || p.description : p.description) || '',
    colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ['#C6FF00', '#141414', '#F2F2F2'],
    _pos: Math.floor(Number(p.sort_order)) || 0,
    _created: p.created_at || ''
  }));
  added.filter(p => p._pos > 0)
    .sort((a, b) => a._pos - b._pos || (a._created < b._created ? -1 : a._created > b._created ? 1 : 0))
    .forEach(p => PROJECTS.splice(Math.min(p._pos - 1, PROJECTS.length), 0, p));
  PROJECTS.push(...added.filter(p => !(p._pos > 0)));
}

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
// Перевод строки интерфейса (i18n.js) и экранирование для вставки в HTML
const tr = s => (window.portfolioTranslate ? window.portfolioTranslate(s) : s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

/* Картинка не загрузилась (сбой сети/CDN) — пробуем ещё раз через пару секунд */
function retryOnError(img, tries = 2) {
  img.addEventListener('error', function onErr() {
    if (tries-- <= 0) { img.removeEventListener('error', onErr); img.closest('.card')?.classList.add('card--broken'); return; }
    const base = img.src.replace(/[?&]retry=\d+$/, '');
    setTimeout(() => { img.src = base + (base.includes('?') ? '&' : '?') + 'retry=' + Date.now(); }, 1500);
  });
}

/* ---------- CONTACTS ---------- */
const contacts = CONFIG.contacts.filter(c => c.url);
const ext = c => c.url.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
$('#contactList').innerHTML = contacts.map(c => `
  <div class="crow">
    <a class="crow__link" href="${c.url}"${ext(c)}>
      <span class="crow__k">${c.label}</span><span class="crow__v">${c.value.replace(/(.)@/, "$1<wbr>@")}</span><span class="crow__arr">↗</span>
    </a>${c.copy ? `<button class="crow__copy" data-copy="${c.value}">КОПИРОВАТЬ</button>` : ''}
  </div>`).join('');
$('#contactList').addEventListener('click', async e => {
  const b = e.target.closest('.crow__copy'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = tr('СКОПИРОВАНО ✓'); }
  catch { b.textContent = tr('НЕ ВЫШЛО'); }
  setTimeout(() => { b.textContent = tr('КОПИРОВАТЬ'); }, 1600);
});

/* ---------- PROJECTS INDEX + WORKS ---------- */
const total = PROJECTS.reduce((s, p) => s + (WORKS[p.id] || []).length, 0);
$('#projCount').textContent = `${PROJECTS.length} ПРОЕКТОВ / ${total} РАБОТ`;

/* ---------- HERO: фон из работ ---------- */
(function heroBg() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = (p, n) => WORKS[p] && WORKS[p][n];
  const slides = [pick('gnc-sep-2026', 0), pick('gnc-may-2026', 0), pick('gnc-oct-2025', 0), pick('stadium', 0), pick('gnc-jun-2025', 0)].filter(Boolean);
  const box = $('#heroBg');
  slides.forEach((w, i) => box.insertAdjacentHTML('beforeend', `<img src="${w.src}" alt="" decoding="async"${i ? ' loading="lazy"' : ''}>`));
  let cur = 0;
  const show = i => { cur = i % slides.length; [...box.children].forEach((el, k) => el.classList.toggle('on', k === cur)); };
  show(0);
  if (!reduce) setInterval(() => show(cur + 1), 6500);
})();

$('#plist').innerHTML = PROJECTS.map((p, i) => `
  <li><a href="#p-${p.id}">
    <span class="p-no">PRJ_${pad(i + 1)}</span>
    <span class="p-name">${esc(p.title)}</span>
    <span class="p-date">${esc(p.date)}</span>
    <span class="p-sw">${palette(p.colors)}</span>
    <span class="p-cnt">${pad((WORKS[p.id] || []).length)} ↗</span>
  </a></li>`).join('');

const wrap = $('#projects-wrap');
PROJECTS.forEach((p, pi) => {
  const works = WORKS[p.id] || [];
  const sec = document.createElement('article');
  sec.className = 'proj'; sec.id = 'p-' + p.id;
  sec.innerHTML = `
    <header class="proj__head">
      <div><p class="proj__code">PRJ_${pad(pi + 1)} // ${esc(p.date)}</p><h3 class="proj__title">${esc(p.title)}</h3></div>
      <p class="proj__desc">${esc(p.desc)}</p>
      <div class="proj__meta"><div class="proj__sw">${palette(p.colors)}</div><span>${pad(works.length)} РАБОТ</span></div>
    </header>
    <div class="grid"></div>`;
  sec._cards = [];
  works.forEach((w, k) => {
    const f = w.fmt || fmt(w.w, w.h, p.id);   // w.fmt — ручная категория из works.js
    const idx = all.push({ ...w, fmt: f, proj: p.title }) - 1;
    const a = document.createElement('button');
    a.className = 'card'; a.dataset.fmt = f; a.dataset.i = idx;
    a.setAttribute('aria-label', `${p.title} — ${tr(f)}`);
    a.innerHTML = `<img src="${esc(w.thumb || w.src)}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async" alt="${esc(p.title)} — ${f}">`;
    retryOnError(a.firstChild);
    if (k >= CONFIG.previewCount) a.hidden = true, a.dataset.extra = '1';
    sec._cards.push(a);
  });
  if (works.length > CONFIG.previewCount) {
    const more = document.createElement('button');
    more.className = 'more';
    more.innerHTML = `<span class="more__plus">+</span><span class="more__txt">${tr('ПОКАЗАТЬ ВСЕ РАБОТЫ')}</span><span class="more__cnt">${works.length}</span><span class="more__arr">↓</span>`;
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
const FORMATS = ['ВСЕ', 'БАННЕР 16:9', 'ПОСТ 1:1', 'ВЕРТИКАЛЬ / TWITCH', 'ШАПКА / ПЛАШКА', 'ДЛЯ СТРИМА', 'ЛОГОТИП', 'WEB'];
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
  lbImg.src = w.src; lbImg.alt = `${w.adminTitle || w.proj} — ${tr(w.fmt)}`;
  lbCap.textContent = `${w.adminTitle || w.proj} // ${tr(w.fmt)} // ${w.w}×${w.h}`;
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

/* ---------- FOOTER ---------- */
// Мобильное меню — в nav.js
$('#year').textContent = new Date().getFullYear();

window.translatePortfolio();
dispatchEvent(new Event('portfolio:ready'));   // i18n.js возвращает позицию прокрутки после смены языка
