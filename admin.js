(() => {
  const $ = id => document.getElementById(id);
  const status = message => $('status').textContent = message;
  const ready = window.PORTFOLIO_SUPABASE_URL &&
    !window.PORTFOLIO_SUPABASE_URL.includes('YOUR-PROJECT') &&
    window.PORTFOLIO_SUPABASE_ANON_KEY &&
    !window.PORTFOLIO_SUPABASE_ANON_KEY.includes('YOUR-SUPABASE') &&
    window.supabase?.createClient;
  if (!ready) {
    status('Сначала настрой supabase-config.js и выполни SQL из supabase-setup.sql. Пока конфигурация не заполнена, админка не подключена.');
    $('loginForm').classList.add('hidden');
    return;
  }
  const db = window.supabase.createClient(window.PORTFOLIO_SUPABASE_URL, window.PORTFOLIO_SUPABASE_ANON_KEY);
  let projects = [], works = [];
  let hiddenSrc = new Set(), hiddenReady = false;   // скрытые архивные работы
  let categories = [], categoriesReady = false;     // свои категории
  let archiveFormats = {};                          // категории архивных работ: src → категория
  const guarded = handler => async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.busy) return;
    form.dataset.busy = '1';
    const buttons = [...form.querySelectorAll('button')]; buttons.forEach(b => b.disabled = true);
    try { await handler(event); } catch (error) { status('Ошибка: ' + error.message); }
    finally { delete form.dataset.busy; buttons.forEach(b => b.disabled = false); }
  };


  $('loginForm').addEventListener('submit', guarded(async e => {
    e.preventDefault(); status('Выполняется вход…');
    const { error } = await db.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value });
    if (error) return status('Ошибка входа: ' + error.message);
  }));
  $('logoutBtn').addEventListener('click', async () => {
    await db.auth.signOut();
    $('dashboard').classList.add('hidden'); $('loginPanel').classList.remove('hidden');
    status('Вы вышли из админ-панели.');
  });
  db.auth.onAuthStateChange((_event, session) => {
    if (session) setTimeout(() => refresh().catch(error => status(error.message)), 0);
    else { $('dashboard').classList.add('hidden'); $('loginPanel').classList.remove('hidden'); }
  });

  async function refresh() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return;
    const permission = await db.rpc('is_portfolio_admin');
    if (permission.error || !permission.data) {
      $('dashboard').classList.add('hidden');
      await db.auth.signOut();
      return status('У этого аккаунта нет прав администратора. Добавь его UUID в portfolio_admins через SQL Editor.');
    }
    $('loginPanel').classList.add('hidden'); $('dashboard').classList.remove('hidden');
    const [p, w, h, c, af] = await Promise.all([
      db.from('portfolio_projects').select('*').order('sort_order', { ascending: true }),
      db.from('portfolio_works').select('*').order('sort_order', { ascending: true }),
      db.from('portfolio_hidden_works').select('src'),
      db.from('portfolio_categories').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
      db.from('portfolio_archive_formats').select('src, format')
    ]);
    if (p.error || w.error) return status('Ошибка загрузки: ' + (p.error || w.error).message);
    projects = p.data || []; works = w.data || [];
    // Нет таблицы — значит, SQL из supabase-setup.sql ещё не выполнен заново
    hiddenReady = !h.error; hiddenSrc = new Set((h.data || []).map(x => x.src));
    categoriesReady = !c.error && !af.error; categories = c.data || [];
    archiveFormats = Object.fromEntries((af.data || []).map(x => [x.src, x.format]));
    renderProjects(); renderProjectSelect(); renderCategories(); renderFormatSelects(); renderGallery();
    status('Данные загружены.');
  }    
  function sortedProjects() {
    const pos = p => Math.floor(Number(p.sort_order)) || 0;
    const created = p => p.created_at || '';
    return [...projects].sort((a, b) => {
      if (!pos(a) !== !pos(b)) return pos(a) ? -1 : 1;
      return pos(a) - pos(b) || (created(a) < created(b) ? 1 : created(a) > created(b) ? -1 : 0);
    });
  }
  function renderProjects() {
    $('projectList').innerHTML = sortedProjects().map(p => `<div class="admin-item">
      <div><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.date || '')} · ${works.filter(w => w.project_id === p.id).length} работ · позиция: ${Number(p.sort_order) > 0 ? Number(p.sort_order) : 'в конец'}</small></div>
      <div class="admin-actions"><button type="button" data-show-project="${p.id}">Работы</button><button type="button" data-edit-project="${p.id}">Изменить</button><button type="button" data-delete-project="${p.id}">Удалить</button></div>
    </div>`).join('') || '<p>Пока нет разделов, создай первый выше.</p>';
  }
  function renderProjectSelect() {
    $('workProject').innerHTML = projects.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('');
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  $('projectForm').addEventListener('submit', guarded(async e => {
    e.preventDefault();
    const id = $('projectId').value;
    const payload = {
      title: $('projectTitle').value.trim(),
      title_en: $('projectTitleEn').value.trim(), date_en: $('projectDateEn').value.trim(),
      description_en: $('projectDescriptionEn').value.trim(),
      date: $('projectDate').value.trim(),
      description: $('projectDescription').value.trim(),
      colors: $('projectColors').value.split(',').map(s => s.trim()).filter(s => /^#[0-9a-f]{6}$/i.test(s)).slice(0, 6),
      sort_order: Math.max(0, Math.floor(Number($('projectOrder').value)) || 0)
    };
    if (!payload.colors.length) payload.colors = ['#C6FF00', '#141414', '#F2F2F2'];
    status('Сохраняю раздел…');
    const result = id
      ? await db.from('portfolio_projects').update(payload).eq('id', id)
      : await db.from('portfolio_projects').insert(payload);
    if (result.error) return status('Не удалось сохранить раздел: ' + result.error.message);
    resetProjectForm(); await refresh(); status('Раздел сохранён.');
  }));
  $('cancelProjectEdit').addEventListener('click', resetProjectForm);
  $('projectToTop').addEventListener('click', () => { $('projectOrder').value = 1; });
  $('projectList').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit-project]');
    const del = e.target.closest('[data-delete-project]');
    const show = e.target.closest('[data-show-project]');
    if (show) {
      $('galProject').value = show.dataset.showProject; $('galSource').value = 'all'; $('galSearch').value = '';
      renderGallery(); $('gallerySection').scrollIntoView({ behavior: 'smooth' });
    }
    if (edit) {
      const p = projects.find(x => x.id === edit.dataset.editProject); if (!p) return;
      $('projectTitleEn').value = p.title_en || ''; $('projectDateEn').value = p.date_en || ''; $('projectDescriptionEn').value = p.description_en || '';
      $('projectId').value = p.id; $('projectTitle').value = p.title;
      $('projectDate').value = p.date || ''; $('projectDescription').value = p.description || '';
      $('projectColors').value = (p.colors || []).join(', '); $('projectOrder').value = p.sort_order || 0;
      $('projectFormTitle').textContent = 'Редактировать раздел';
      $('projectTitle').focus();
    }
    if (del) {
      const p = projects.find(x => x.id === del.dataset.deleteProject); if (!p) return;
      if (!confirm(`Удалить раздел «${p.title}» и все его работы?`)) return;
      const related = works.filter(w => w.project_id === p.id);
      const { error } = await db.from('portfolio_projects').delete().eq('id', p.id);
      if (error) return status('Не удалось удалить раздел: ' + error.message);
      const paths = related.map(w => storagePath(w.image_url)).filter(Boolean);
      const cleanup = paths.length ? await db.storage.from('portfolio-images').remove(paths) : {};
      await refresh(); status(cleanup.error ? 'Раздел удалён. Не удалось очистить файлы: ' + cleanup.error.message : 'Раздел удалён.');
    }
  });
  function resetProjectForm() {
    $('projectForm').reset(); $('projectId').value = '';
    $('projectColors').value = '#C6FF00, #141414, #F2F2F2'; $('projectOrder').value = 0;
    $('projectFormTitle').textContent = 'Создать раздел / проект';
  }

  $('workForm').addEventListener('submit', guarded(async e => {
    e.preventDefault();
    const file = $('workFile').files[0], projectId = $('workProject').value;
    if (!file || !projectId) return status('Выбери раздел и изображение.');
    if (!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(file.type)) return status('Можно загружать только изображения.');
    if (file.size > 12 * 1024 * 1024) return status('Файл больше 12 МБ. Уменьши изображение и попробуй снова.');
    status('Загружаю изображение…');
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
    const upload = await db.storage.from('portfolio-images').upload(path, file, { upsert: false, contentType: file.type });
    if (upload.error) return status('Ошибка загрузки изображения: ' + upload.error.message);
    const { data: publicData } = db.storage.from('portfolio-images').getPublicUrl(path);
    const dimensions = await getImageDimensions(file);
    const result = await db.from('portfolio_works').insert({
      project_id: projectId, title: $('workTitle').value.trim(), title_en: $('workTitleEn').value.trim(),
      file_name: file.name, image_url: publicData.publicUrl,
      width: dimensions.width, height: dimensions.height,
      sort_order: Number($('workOrder').value) || 0,
      format: $('workFormat').value || null
    });
    if (result.error) {
      await db.storage.from('portfolio-images').remove([path]);
      return status('Изображение загрузилось, но запись не сохранилась: ' + result.error.message);
    }
    $('workForm').reset(); showUploadPreview(); await refresh(); status('Работа добавлена в портфолио.');
  }));
  $('workFile').addEventListener('change', showUploadPreview);
  ['workProject', 'workFormat'].forEach(id => $(id).addEventListener('change', updateFormatHint));
  function showUploadPreview() {
    const img = $('workPreview'), file = $('workFile').files[0];
    if (img.src) URL.revokeObjectURL(img.src);
    if (!file) { img.removeAttribute('src'); img.classList.add('hidden'); updateFormatHint(); return; }
    img.onload = updateFormatHint;
    img.src = URL.createObjectURL(file); img.classList.remove('hidden');
  }
  // Подсказка, в какую категорию попадёт работа, если оставить «Автоматически»
  function updateFormatHint() {
    const img = $('workPreview'), hint = $('workFormatHint');
    hint.textContent = !$('workFormat').value && $('workFile').files[0] && img.naturalWidth
      ? `${img.naturalWidth}×${img.naturalHeight} — автоматически попадёт в «${autoFormat(img.naturalWidth, img.naturalHeight, $('workProject').value)}»`
      : '';
  }

  /* ---------- Категории (те же, что в фильтрах на сайте, см. app.js) ---------- */
  const BUILTIN_FORMATS = ['БАННЕР 16:9', 'ПОСТ 1:1', 'ВЕРТИКАЛЬ / TWITCH', 'ШАПКА / ПЛАШКА', 'ДЛЯ СТРИМА', 'ЛОГОТИП', 'WEB'];
  // Все категории: встроенные хранятся по названию, свои — по id (cat-…)
  const allFormats = () => [...BUILTIN_FORMATS, ...categories.map(c => c.id)];
  const fmtName = f => categories.find(c => c.id === f)?.name || f;
  const knownFormat = f => (f && allFormats().includes(f)) ? f : '';
  // Как сайт определяет категорию, если она не выбрана вручную (копия fmt() из app.js)
  function autoFormat(w, h, projectId) {
    if (projectId === 'web') return 'WEB';
    if (projectId === 'logos') return 'ЛОГОТИП';
    const r = w / h;
    if (r > 2.3) return 'ШАПКА / ПЛАШКА';
    if (r > 1.25) return 'БАННЕР 16:9';
    if (r >= 0.9) return 'ПОСТ 1:1';
    return 'ВЕРТИКАЛЬ / TWITCH';
  }
  // Перестраивает все выпадающие списки категорий, сохраняя выбранные значения
  function renderFormatSelects() {
    const options = allFormats().map(f => `<option value="${escapeHtml(f)}">${escapeHtml(fmtName(f))}</option>`).join('');
    const fill = (id, first) => { const el = $(id), keep = el.value; el.innerHTML = first + options; el.value = keep; if (el.selectedIndex < 0) el.selectedIndex = 0; };
    fill('workFormat', '<option value="">Автоматически (по пропорциям)</option>');
    fill('viewerFormat', '<option value="">Автоматически (по пропорциям)</option>');
    fill('viewerArchiveFormat', '<option value="">Как в архиве (по умолчанию)</option>');
    fill('galFormat', '<option value="all">Все категории</option>');
  }
  renderFormatSelects();

  /* ---------- Свои категории ---------- */
  function renderCategories() {
    $('builtinCategories').innerHTML = BUILTIN_FORMATS.map(f => `<span>${f}</span>`).join('');
    $('categoryForm').classList.toggle('hidden', !categoriesReady);
    $('categoryNote').classList.toggle('hidden', categoriesReady);
    $('categoryNote').textContent = 'Чтобы добавлять свои категории, выполни заново supabase-setup.sql в Supabase → SQL Editor (добавились таблицы portfolio_categories и portfolio_archive_formats).';
    const used = id => works.filter(w => w.format === id).length + Object.values(archiveFormats).filter(f => f === id).length;
    $('categoryList').innerHTML = categories.map(c => `<div class="admin-item">
      <div><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.name_en || 'без EN')} · ${used(c.id)} работ · позиция: ${Number(c.sort_order) || 0}</small></div>
      <div class="admin-actions"><button type="button" data-show-category="${c.id}">Работы</button><button type="button" data-edit-category="${c.id}">Изменить</button><button type="button" data-delete-category="${c.id}">Удалить</button></div>
    </div>`).join('') || (categoriesReady ? '<p>Своих категорий пока нет.</p>' : '');
  }
  function resetCategoryForm() {
    $('categoryForm').reset(); $('categoryId').value = ''; $('categoryOrder').value = 0;
    $('categoryFormTitle').textContent = 'Категории для фильтров';
  }
  $('cancelCategoryEdit').addEventListener('click', resetCategoryForm);
  $('categoryForm').addEventListener('submit', guarded(async () => {
    const id = $('categoryId').value;
    const payload = {
      name: $('categoryName').value.trim().toUpperCase(),
      name_en: $('categoryNameEn').value.trim().toUpperCase(),
      sort_order: Math.max(0, Math.floor(Number($('categoryOrder').value)) || 0)
    };
    if (!payload.name) return status('Введи название категории.');
    if (BUILTIN_FORMATS.includes(payload.name) || categories.some(c => c.name === payload.name && c.id !== id))
      return status('Категория с таким названием уже есть.');
    const result = id
      ? await db.from('portfolio_categories').update(payload).eq('id', id)
      : await db.from('portfolio_categories').insert(payload);
    if (result.error) return status('Не удалось сохранить категорию: ' + result.error.message);
    resetCategoryForm(); await refresh(); status('Категория сохранена.');
  }));
  $('categoryList').addEventListener('click', async e => {
    const show = e.target.closest('[data-show-category]');
    const edit = e.target.closest('[data-edit-category]');
    const del = e.target.closest('[data-delete-category]');
    if (show) {
      $('galFormat').value = show.dataset.showCategory; $('galProject').value = 'all'; $('galSource').value = 'all'; $('galSearch').value = '';
      renderGallery(); $('gallerySection').scrollIntoView({ behavior: 'smooth' });
    }
    if (edit) {
      const c = categories.find(x => x.id === edit.dataset.editCategory); if (!c) return;
      $('categoryId').value = c.id; $('categoryName').value = c.name; $('categoryNameEn').value = c.name_en || '';
      $('categoryOrder').value = c.sort_order || 0;
      $('categoryFormTitle').textContent = 'Редактировать категорию'; $('categoryName').focus();
    }
    if (del) {
      const c = categories.find(x => x.id === del.dataset.deleteCategory); if (!c) return;
      if (!confirm(`Удалить категорию «${c.name}»? Её работы снова будут распределяться автоматически.`)) return;
      const [a, b] = await Promise.all([
        db.from('portfolio_works').update({ format: null }).eq('format', c.id),
        db.from('portfolio_archive_formats').delete().eq('format', c.id)
      ]);
      if (a.error || b.error) return status('Не удалось освободить работы категории: ' + (a.error || b.error).message);
      const { error } = await db.from('portfolio_categories').delete().eq('id', c.id);
      if (error) return status('Не удалось удалить категорию: ' + error.message);
      await refresh(); status('Категория удалена.');
    }
  });

  /* ---------- Просмотр всех работ сайта ---------- */
  // Порядок разделов такой же, как на сайте (см. app.js): архивные проекты
  // из assets/projects.js, новые вставляются на свою позицию или в конец.
  function siteProjects() {
    const list = (window.PORTFOLIO_PROJECTS || []).map(p => ({ id: p.id, title: p.title, date: p.date, source: 'static' }));
    const added = projects.map(p => ({ id: p.id, title: p.title, date: p.date, source: 'admin',
      _pos: Math.floor(Number(p.sort_order)) || 0, _created: p.created_at || '' }));
    added.filter(p => p._pos > 0)
      .sort((a, b) => a._pos - b._pos || (a._created < b._created ? -1 : a._created > b._created ? 1 : 0))
      .forEach(p => list.splice(Math.min(p._pos - 1, list.length), 0, p));
    list.push(...added.filter(p => !(p._pos > 0)));
    return list;
  }
  function siteWorks() {
    return siteProjects().flatMap((p, pi) => {
      const items = p.source === 'static'
        ? (window.WORKS?.[p.id] || []).map(w => ({ src: w.src, thumb: w.thumb || w.src, w: w.w, h: w.h, file: w.file, title: '', manualFmt: knownFormat(archiveFormats[w.src]) || w.fmt || '', archiveFmt: knownFormat(archiveFormats[w.src]), source: 'static', hidden: hiddenSrc.has(w.src) }))
        : works.filter(w => w.project_id === p.id)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || (a.created_at < b.created_at ? -1 : 1))
          .map(w => ({ src: w.image_url, thumb: w.image_url, w: w.width, h: w.height, file: w.file_name, title: w.title, manualFmt: knownFormat(w.format), source: 'admin', row: w }));
      return items.map(w => ({ ...w, fmt: w.manualFmt || autoFormat(w.w, w.h, p.id), project: p, projectNo: pi + 1 }));
    });
  }
  const pad = n => String(n).padStart(2, '0');
  let shown = [], broken = new Set(), viewerIndex = -1;
  function renderGallery() {
    const sel = $('galProject'), keep = sel.value || 'all';
    const plist = siteProjects(), all = siteWorks();
    sel.innerHTML = '<option value="all">Все разделы</option>' + plist.map((p, i) =>
      `<option value="${escapeHtml(p.id)}">PRJ_${pad(i + 1)} · ${escapeHtml(p.title)} (${all.filter(w => w.project.id === p.id).length})</option>`).join('');
    sel.value = plist.some(p => p.id === keep) ? keep : 'all';
    const source = $('galSource').value, format = $('galFormat').value, q = $('galSearch').value.trim().toLowerCase();
    [...$('galFormat').options].forEach(o => {
      if (o.value !== 'all') o.textContent = `${fmtName(o.value)} (${all.filter(w => w.fmt === o.value).length})`;
    });
    shown = all.filter(w => (sel.value === 'all' || w.project.id === sel.value) &&
      (source === 'all' || (source === 'hidden' ? w.hidden : w.source === source)) &&
      (format === 'all' || w.fmt === format) &&
      (!q || [w.title, w.file, w.project.title].some(s => String(s || '').toLowerCase().includes(q))));
    broken = new Set();
    let html = '', last = null;
    shown.forEach((w, k) => {
      if (w.project !== last) {
        last = w.project;
        html += `<div class="gal-group">PRJ_${pad(w.projectNo)} · ${escapeHtml(w.project.title)}<span>${shown.filter(x => x.project === w.project).length} шт.</span></div>`;
      }
      html += `<button type="button" class="tile${w.hidden ? ' tile--hidden' : ''}" data-k="${k}" title="${escapeHtml(w.title || w.file)}">
        ${w.source === 'admin' ? '<span class="tile__badge">АДМИНКА</span>' : ''}${w.hidden ? '<span class="tile__badge tile__badge--hidden">СКРЫТА</span>' : ''}
        <span class="tile__img"><img src="${escapeHtml(w.thumb)}" alt="" loading="lazy" decoding="async"></span>
        <span class="tile__cap">${escapeHtml(w.title || w.file || 'Работа')}<small>${escapeHtml(fmtName(w.fmt))}</small></span>
      </button>`;
    });
    $('gallery').innerHTML = html || '<p>Ничего не найдено.</p>';
    updateSummary(all.length);
  }
  function updateSummary(total = siteWorks().length) {
    const sections = new Set(shown.map(w => w.project.id)).size;
    $('galSummary').innerHTML = `Показано <b>${shown.length}</b> из <b>${total}</b> работ · разделов: <b>${sections}</b>` +
      (hiddenSrc.size ? ` · скрыто с сайта: <b>${hiddenSrc.size}</b>` : '') +
      (broken.size ? ` · <span class="bad">не загрузилось: ${broken.size}</span>` : '');
  }
  ['galProject', 'galSource', 'galFormat'].forEach(id => $(id).addEventListener('change', renderGallery));
  let searchTimer; $('galSearch').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderGallery, 150); });
  // error не всплывает, поэтому ловим на фазе перехвата
  $('gallery').addEventListener('error', e => {
    const tile = e.target.closest?.('.tile'); if (!tile) return;
    tile.classList.add('tile--broken'); broken.add(+tile.dataset.k); updateSummary();
  }, true);
  $('gallery').addEventListener('click', e => { const t = e.target.closest('.tile'); if (t) openViewer(+t.dataset.k); });

  function openViewer(k) {
    if (!shown.length) return;
    viewerIndex = (k + shown.length) % shown.length;
    const w = shown[viewerIndex];
    const img = $('viewerImg');
    img.classList.add('loading'); img.removeAttribute('src');   // не показываем прошлую картинку, пока грузится новая
    img.onload = img.onerror = () => img.classList.remove('loading');
    img.src = w.src; img.alt = w.title || w.file || '';
    $('viewerSource').textContent = w.source === 'admin' ? 'ЗАГРУЖЕНО ЧЕРЕЗ АДМИНКУ' : 'АРХИВ · assets/works.js' + (w.hidden ? ' · СКРЫТА С САЙТА' : '');
    $('viewerTitle').textContent = w.title || w.file || 'Работа';
    const meta = [
      ['Раздел', `PRJ_${pad(w.projectNo)} · ${w.project.title}`],
      ['Файл', w.file || '—'],
      ['Категория', fmtName(w.fmt) + (w.manualFmt ? '' : ' (авто)')],
      ['Размер', w.w && w.h ? `${w.w}×${w.h}` : '—'],
      w.row ? ['Порядок', String(w.row.sort_order ?? 0)] : null,
      w.row?.created_at ? ['Добавлено', new Date(w.row.created_at).toLocaleString('ru-RU')] : null,
      broken.has(viewerIndex) ? ['Статус', 'превью не загрузилось'] : null
    ].filter(Boolean);
    $('viewerMeta').innerHTML = meta.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('') +
      `<dt>Оригинал</dt><dd><a href="${escapeHtml(w.src)}" target="_blank" rel="noopener">открыть ↗</a></dd>`;
    $('viewerForm').classList.toggle('hidden', !w.row);
    $('viewerArchive').classList.toggle('hidden', !!w.row);
    if (!w.row) {
      $('viewerArchiveFormat').value = w.archiveFmt || '';
      $('viewerArchiveFormat').disabled = $('viewerArchiveSave').disabled = !categoriesReady;
      $('viewerHide').textContent = w.hidden ? 'Вернуть на сайт' : 'Скрыть с сайта';
      $('viewerArchiveNote').textContent = w.hidden
        ? 'Работа скрыта: посетители её не видят. Файл остался в репозитории, вернуть можно в любой момент.'
        : 'Архивную работу нельзя удалить из админки (файл лежит в репозитории GitHub), но можно скрыть с сайта.';
    }
    if (w.row) {
      $('viewerTitleRu').value = w.row.title || ''; $('viewerTitleEn').value = w.row.title_en || '';
      $('viewerOrder').value = w.row.sort_order || 0;
      $('viewerFormat').value = knownFormat(w.row.format);
    }
    $('viewerPos').textContent = `${viewerIndex + 1} / ${shown.length}`;
    $('viewer').classList.remove('hidden'); document.body.style.overflow = 'hidden';
  }
  function closeViewer() {
    $('viewer').classList.add('hidden'); $('viewerImg').removeAttribute('src'); document.body.style.overflow = '';
    $('gallery').querySelector(`[data-k="${viewerIndex}"]`)?.focus();
  }
  $('viewerClose').addEventListener('click', closeViewer);
  $('viewerPrev').addEventListener('click', () => openViewer(viewerIndex - 1));
  $('viewerNext').addEventListener('click', () => openViewer(viewerIndex + 1));
  $('viewer').addEventListener('click', e => { if (e.target === $('viewer') || e.target.classList.contains('viewer__img')) closeViewer(); });
  addEventListener('keydown', e => {
    if ($('viewer').classList.contains('hidden')) return;
    if (e.key === 'Escape') closeViewer();
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') openViewer(viewerIndex - 1);
    if (e.key === 'ArrowRight') openViewer(viewerIndex + 1);
  });
  $('viewerForm').addEventListener('submit', guarded(async () => {
    const w = shown[viewerIndex]?.row; if (!w) return;
    const { error } = await db.from('portfolio_works').update({
      title: $('viewerTitleRu').value.trim(), title_en: $('viewerTitleEn').value.trim(),
      sort_order: Math.floor(Number($('viewerOrder').value)) || 0,
      format: $('viewerFormat').value || null
    }).eq('id', w.id);
    if (error) return status('Не удалось изменить работу: ' + error.message);
    await refresh(); reopenViewer(w.id); status('Работа обновлена.');
  }));
  $('viewerDelete').addEventListener('click', async () => {
    const w = shown[viewerIndex]?.row; if (!w) return;
    if (!confirm(`Удалить работу «${w.title || w.file_name}»?`)) return;
    const path = storagePath(w.image_url);
    const { error } = await db.from('portfolio_works').delete().eq('id', w.id);
    if (error) return status('Не удалось удалить работу: ' + error.message);
    const cleanup = path ? await db.storage.from('portfolio-images').remove([path]) : {};
    closeViewer(); await refresh();
    status(cleanup.error ? 'Работа удалена. Не удалось очистить файл: ' + cleanup.error.message : 'Работа удалена.');
  });
  $('viewerArchiveSave').addEventListener('click', async () => {
    const w = shown[viewerIndex]; if (!w || w.row) return;
    const format = $('viewerArchiveFormat').value, btn = $('viewerArchiveSave'); btn.disabled = true;
    const { error } = format
      ? await db.from('portfolio_archive_formats').upsert({ src: w.src, format })
      : await db.from('portfolio_archive_formats').delete().eq('src', w.src);
    btn.disabled = false;
    if (error) return status('Не удалось сохранить категорию: ' + error.message);
    await refresh(); reopenViewer(w.src); status('Категория сохранена.');
  });
  $('viewerHide').addEventListener('click', async () => {
    const w = shown[viewerIndex]; if (!w || w.row) return;
    if (!hiddenReady) return status('Чтобы скрывать архивные работы, выполни заново supabase-setup.sql в Supabase → SQL Editor (добавилась таблица portfolio_hidden_works).');
    const btn = $('viewerHide'); btn.disabled = true;
    const { error } = w.hidden
      ? await db.from('portfolio_hidden_works').delete().eq('src', w.src)
      : await db.from('portfolio_hidden_works').insert({ src: w.src });
    btn.disabled = false;
    if (error) return status('Не удалось изменить видимость: ' + error.message);
    await refresh(); reopenViewer(w.src);
    status(w.hidden ? 'Работа снова видна на сайте.' : 'Работа скрыта с сайта.');
  });
  function reopenViewer(key) {
    const k = shown.findIndex(x => x.row?.id === key || x.src === key);
    if (k >= 0) openViewer(k); else closeViewer();
  }
  function storagePath(url) {
    if (!url) return null;
    const marker = '/storage/v1/object/public/portfolio-images/';
    const i = url.indexOf(marker);
    return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
  }
  function getImageDimensions(file) {
    return new Promise(resolve => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 }); URL.revokeObjectURL(url); };
      img.onerror = () => { resolve({ width: 1200, height: 800 }); URL.revokeObjectURL(url); };
      img.src = url;
    });
  }
  db.auth.getSession().then(({ data }) => { if (data.session) refresh(); });
})();
