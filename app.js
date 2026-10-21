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
// Текст проекта: у проектов из админки свой английский вариант, его подставляет i18n.js.
// Архивные проекты переводятся по словарю; span нужен, чтобы текст был отдельным узлом
// (иначе «PRJ_01 // СЕН 2026» не найдётся в словаре целиком).
const bi = (p, key) => p.en
  ? `<span data-ru="${esc(p[key])}" data-en="${esc(p.en[key])}">${esc(p[key])}</span>`
  : `<span>${esc(p[key])}</span>`;
const isEn = () => window.PORTFOLIO_LANG === 'en';

/* Палитра проекта: полоса из цветов с HEX-кодами */
function palette(colors) {
  const lum = hex => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  };
  return colors.map(c =>
    `<i style="background:${c};color:${lum(c) > .55 ? '#000' : '#fff'}"><em>${c.slice(1).toUpperCase()}</em></i>`).join('');
}
let all = [];   // плоский список для лайтбокса

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

/* ---------- ДАННЫЕ: архив + админка ---------- */
// Архив (assets/projects.js, assets/works.js) показывается сразу. Проекты из админки
// берутся из кеша прошлого визита, затем обновляются из Supabase — страница не ждёт базу.
const CACHE_KEY = 'portfolio-admin-cache-v1';
const EMPTY_ADMIN = { projects: [], works: [], hidden: [] };
function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || EMPTY_ADMIN; } catch { return EMPTY_ADMIN; }
}
async function fetchAdminData() {
  const url = window.PORTFOLIO_SUPABASE_URL, key = window.PORTFOLIO_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('YOUR-PROJECT')) return EMPTY_ADMIN;
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
  const get = async (path, optional) => {
    const r = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key }, signal: ctrl.signal });
    if (!r.ok) { if (optional) return []; throw new Error(`${path}: ${r.status}`); }
    return r.json();
  };
  try {
    // Необязательных таблиц может не быть, если SQL из supabase-setup.sql ещё не выполнен заново
    const [projects, works, hidden, categories, archiveFormats] = await Promise.all([
      get('portfolio_projects?select=*&order=sort_order.asc'),
      get('portfolio_works?select=*&order=sort_order.asc,created_at.asc'),
      get('portfolio_hidden_works?select=src', true),
      get('portfolio_categories?select=*&order=sort_order.asc,created_at.asc', true),
      get('portfolio_archive_formats?select=src,format', true)
    ]);
    return {
      projects, works, hidden: hidden.map(h => h.src), categories,
      formats: Object.fromEntries(archiveFormats.map(f => [f.src, f.format]))
    };
  } finally { clearTimeout(timer); }
}

// Собирает итоговый список проектов и работ в порядке сайта
function buildModel(admin) {
  const hidden = new Set(admin.hidden || []);
  const works = {};
  // Свои категории: подписи для фильтров, карточек и i18n.js
  const categories = admin.categories || [];
  FORMAT_LABELS = window.PORTFOLIO_FORMAT_LABELS =
    Object.fromEntries(categories.map(c => [c.id, { ru: c.name, en: c.name_en || '' }]));
  // ссылка на удалённую категорию — работа снова определяется по пропорциям
  const known = f => (BUILTIN_FORMATS.includes(f) || FORMAT_LABELS[f]) ? f : undefined;
  const archiveFmt = admin.formats || {};
  const projects = window.PORTFOLIO_PROJECTS
    .map(p => ({ ...p }))
    .filter(p => {
      const list = (window.WORKS[p.id] || []).filter(w => !hidden.has(w.src))
        .map(w => ({ ...w, fmt: known(archiveFmt[w.src]) || w.fmt }));
      works[p.id] = list;
      // архивный проект, в котором скрыли все работы, тоже убираем
      return list.length || !(window.WORKS[p.id] || []).length;
    });
  const added = (admin.projects || []).map(p => ({
    id: p.id,
    title: p.title, date: p.date || '', desc: p.description || '',
    // английские варианты — для переключения языка на ходу (см. bi())
    en: { title: p.title_en || '', date: p.date_en || '', desc: p.description_en || '' },
    colors: Array.isArray(p.colors) && p.colors.length ? p.colors : ['#C6FF00', '#141414', '#F2F2F2'],
    _pos: Math.floor(Number(p.sort_order)) || 0,
    _created: p.created_at || ''
  }));
  added.filter(p => p._pos > 0)
    .sort((a, b) => a._pos - b._pos || (a._created < b._created ? -1 : a._created > b._created ? 1 : 0))
    .forEach(p => projects.splice(Math.min(p._pos - 1, projects.length), 0, p));
  projects.push(...added.filter(p => !(p._pos > 0)));
  added.forEach(p => { works[p.id] = []; });
  (admin.works || []).forEach(w => {
    if (!works[w.project_id]) return;
    works[w.project_id].push({
      src: w.image_url, thumb: w.image_url, w: w.width || 1200, h: w.height || 800,
      file: w.file_name || w.title || 'portfolio-image', fmt: known(w.format),
      adminId: w.id, adminTitle: w.title || '', adminTitleEn: w.title_en || ''
    });
  });
  return { projects, works, categories: categories.map(c => c.id) };
}

/* ---------- PROJECTS INDEX + WORKS ---------- */
const wrap = $('#projects-wrap');
function render({ projects, works: byProject, categories }) {
  // сохраняем, что пользователь уже раскрыл, и закрываем просмотр — индексы работ поменяются
  const expanded = new Set([...document.querySelectorAll('.proj.expanded')].map(s => s.id));
  if (!lb.hidden) close();
  all = [];

  const total = projects.reduce((s, p) => s + byProject[p.id].length, 0);
  $('#projCount').textContent = `${projects.length} ПРОЕКТОВ / ${total} РАБОТ`;

  $('#plist').innerHTML = projects.map((p, i) => `
  <li><a href="#p-${p.id}">
    <span class="p-no">PRJ_${pad(i + 1)}</span>
    <span class="p-name">${bi(p, 'title')}</span>
    <span class="p-date">${bi(p, 'date')}</span>
    <span class="p-sw">${palette(p.colors)}</span>
    <span class="p-cnt">${pad(byProject[p.id].length)} ↗</span>
  </a></li>`).join('');

  wrap.innerHTML = '';
  projects.forEach((p, pi) => {
    const works = byProject[p.id];
    const sec = document.createElement('article');
    sec.className = 'proj'; sec.id = 'p-' + p.id;
    if (expanded.has(sec.id)) sec.classList.add('expanded');
    sec.innerHTML = `
    <header class="proj__head">
      <div><p class="proj__code">PRJ_${pad(pi + 1)} // ${bi(p, 'date')}</p><h3 class="proj__title">${bi(p, 'title')}</h3></div>
      <p class="proj__desc">${bi(p, 'desc')}</p>
      <div class="proj__meta"><div class="proj__sw">${palette(p.colors)}</div><span>${pad(works.length)} РАБОТ</span></div>
    </header>
    <div class="grid"></div>`;
    sec._cards = [];
    works.forEach((w, k) => {
      const f = w.fmt || fmt(w.w, w.h, p.id);   // w.fmt — ручная категория из works.js / админки
      const idx = all.push({ ...w, fmt: f, proj: p }) - 1;
      const a = document.createElement('button');
      a.className = 'card'; a.dataset.fmt = f; a.dataset.i = idx;
      a.innerHTML = `<img src="${esc(w.thumb || w.src)}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async" alt="">`;
      labelCard(a);
      retryOnError(a.firstChild);
      if (k >= CONFIG.previewCount) a.hidden = true, a.dataset.extra = '1';
      sec._cards.push(a);
    });
    if (works.length > CONFIG.previewCount && !sec.classList.contains('expanded')) {
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

  // встроенные категории — всегда, свои — только если в них есть работы
  const filters = ['ВСЕ', ...BUILTIN_FORMATS, ...categories.filter(id => all.some(w => w.fmt === id))];
  if (!filters.includes(current)) current = 'ВСЕ';
  $('#filters').innerHTML = filters.map(f => {
    const n = f === 'ВСЕ' ? all.length : all.filter(w => w.fmt === f).length;
    const label = FORMAT_LABELS[f]
      ? `<span data-ru="${esc(FORMAT_LABELS[f].ru)}" data-en="${esc(FORMAT_LABELS[f].en)}">${esc(FORMAT_LABELS[f].ru)}</span>`
      : f;
    return `<button role="tab" aria-selected="${f === current}" data-f="${esc(f)}">${label}<sup>${n}</sup></button>`;
  }).join('');
  applyFilter();
  window.translatePortfolio();
}

// Перерисовка, когда пришли свежие данные: блок вверху экрана остаётся на месте
function rerender(model) {
  const top = $('.nav')?.offsetHeight || 0;
  const blocks = [...document.querySelectorAll('#hero, #projects, #works, .proj, #services, #contact')]
    .filter(el => !el.hidden && el.getBoundingClientRect().bottom > top);
  const anchor = blocks.filter(el => el.getBoundingClientRect().top <= top + 1).pop() || blocks[0];
  const id = anchor?.id, before = anchor?.getBoundingClientRect().top;
  render(model);
  const after = id && document.getElementById(id);
  if (after && scrollY > 0) window.scrollBy({ top: after.getBoundingClientRect().top - before, behavior: 'instant' });
}

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
const BUILTIN_FORMATS = ['БАННЕР 16:9', 'ПОСТ 1:1', 'ВЕРТИКАЛЬ / TWITCH', 'ШАПКА / ПЛАШКА', 'ДЛЯ СТРИМА', 'ЛОГОТИП', 'WEB'];
let FORMAT_LABELS = {};   // свои категории из админки: id → { ru, en }
// Название категории на текущем языке
const fmtLabel = f => FORMAT_LABELS[f] ? (isEn() && FORMAT_LABELS[f].en || FORMAT_LABELS[f].ru) : tr(f);
let current = 'ВСЕ';
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
// Подпись работы на текущем языке: своё название из админки или название проекта
function workTitle(w) {
  if (isEn() && w.adminTitleEn) return w.adminTitleEn;
  if (w.adminTitle) return w.adminTitle;
  const p = w.proj;
  return isEn() ? (p.en ? p.en.title || p.title : tr(p.title)) : p.title;
}
function labelCard(c) {
  const w = all[c.dataset.i], text = `${workTitle(w)} — ${fmtLabel(w.fmt)}`;
  c.setAttribute('aria-label', text); c.firstChild.alt = text;
}
addEventListener('portfolio:lang', () => {
  document.querySelectorAll('.card').forEach(labelCard);
  if (!lb.hidden) open(cur);
});
function open(i) {
  cur = i; const w = all[i];
  const name = workTitle(w);
  lbImg.src = w.src; lbImg.alt = `${name} — ${fmtLabel(w.fmt)}`;
  lbCap.textContent = `${name} // ${fmtLabel(w.fmt)} // ${w.w}×${w.h}`;
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

/* ---------- START ---------- */
// Сразу рисуем архив + кеш, потом тихо обновляем из Supabase, если что-то поменялось
render(buildModel(readCache()));
fetchAdminData().then(fresh => {
  const str = JSON.stringify(fresh);
  let old; try { old = localStorage.getItem(CACHE_KEY); } catch {}
  try { localStorage.setItem(CACHE_KEY, str); } catch {}
  if (str !== (old || JSON.stringify(EMPTY_ADMIN))) rerender(buildModel(fresh));
}).catch(error => console.error('Не удалось загрузить работы из админки:', error));
