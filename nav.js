/* Мобильное меню. Отдельно от app.js, чтобы бургер работал сразу,
   не дожидаясь загрузки работ из Supabase. */
(() => {
  const nav = document.querySelector('.nav'), burger = document.querySelector('.nav__burger');
  const setMenu = o => { nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.querySelector('.nav__backdrop').addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  // Перевернули телефон / расширили окно до десктопа — меню-шторка больше не нужна
  matchMedia('(min-width:1001px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
})();
