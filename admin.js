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
    const [p, w] = await Promise.all([
      db.from('portfolio_projects').select('*').order('sort_order', { ascending: true }),
      db.from('portfolio_works').select('*').order('sort_order', { ascending: true })
    ]);
    if (p.error || w.error) return status('Ошибка загрузки: ' + (p.error || w.error).message);
    projects = p.data || []; works = w.data || [];
    renderProjects(); renderWorks(); renderProjectSelect();
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
      <div class="admin-actions"><button type="button" data-edit-project="${p.id}">Изменить</button><button type="button" data-delete-project="${p.id}">Удалить</button></div>
    </div>`).join('') || '<p>Пока нет разделов, создай первый выше.</p>';
  }
  function renderWorks() {
    $('workList').innerHTML = works.map(w => `<div class="admin-item">
      <div><strong>${escapeHtml(w.title || w.file_name || 'Работа')}</strong><small>${escapeHtml(projects.find(p => p.id === w.project_id)?.title || 'Без раздела')}</small></div>
      <div class="admin-actions"><button type="button" data-edit-work="${w.id}">Изменить название</button><button type="button" data-delete-work="${w.id}">Удалить</button></div>
    </div>`).join('') || '<p>Пока нет загруженных работ.</p>';
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
      sort_order: Number($('workOrder').value) || 0
    });
    if (result.error) {
      await db.storage.from('portfolio-images').remove([path]);
      return status('Изображение загрузилось, но запись не сохранилась: ' + result.error.message);
    }
    $('workForm').reset(); await refresh(); status('Работа добавлена в портфолио.');
  }));
  $('workList').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit-work]');
    const del = e.target.closest('[data-delete-work]');
    if (edit) {
      const w = works.find(x => x.id === edit.dataset.editWork); if (!w) return;
      const title = prompt('Новое название работы:', w.title || '');
      if (title === null) return;
      const titleEn = prompt('Название на английском (можно оставить пустым):', w.title_en || '');
      if (titleEn === null) return;
      const { error } = await db.from('portfolio_works').update({ title: title.trim(), title_en: titleEn.trim() }).eq('id', w.id);
      if (error) return status('Не удалось изменить работу: ' + error.message);
      await refresh(); status('Название обновлено.');
    }
    if (del) {
      const w = works.find(x => x.id === del.dataset.deleteWork); if (!w) return;
      if (!confirm(`Удалить работу «${w.title || w.file_name}»?`)) return;
      const path = storagePath(w.image_url);
      const { error } = await db.from('portfolio_works').delete().eq('id', w.id);
      if (error) return status('Не удалось удалить работу: ' + error.message);
      const cleanup = path ? await db.storage.from('portfolio-images').remove([path]) : {};
      await refresh(); status(cleanup.error ? 'Работа удалена. Не удалось очистить файл: ' + cleanup.error.message : 'Работа удалена.');
    }
  });
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
