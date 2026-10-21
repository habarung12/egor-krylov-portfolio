(() => {
  const query = new URLSearchParams(location.search).get('lang');
  let saved; try { saved = localStorage.getItem('portfolio-language'); } catch {}
  window.PORTFOLIO_LANG = ['ru', 'en'].includes(query) ? query : (saved === 'en' ? 'en' : 'ru');
  document.documentElement.lang = window.PORTFOLIO_LANG;
  const words = {"ГЛАВНАЯ": "HOME", "ПРОЕКТЫ": "PROJECTS", "РАБОТЫ": "WORKS", "УСЛУГИ": "SERVICES", "КОНТАКТЫ": "CONTACT", "НАПИСАТЬ": "GET IN TOUCH", "ЕГОР КРЫЛОВ": "EGOR KRYLOV", "СМОТРЕТЬ РАБОТЫ": "VIEW WORKS", "ЧТО Я ДЕЛАЮ": "WHAT I DO", "Айдентика турнира": "Tournament identity", "Соцсети": "Social media", "Логотипы": "Logos", "Программы": "Tools", "СВЯЗАТЬСЯ": "GET IN", "СО МНОЙ": "TOUCH", "НАВЕРХ ↑": "BACK TO TOP ↑", "ВСЕ ИГРОВЫЕ ПЕРСОНАЖИ И ЛОГОТИПЫ ПРИНАДЛЕЖАТ ИХ ПРАВООБЛАДАТЕЛЯМ": "ALL GAME CHARACTERS AND LOGOS BELONG TO THEIR RESPECTIVE OWNERS", "КОПИРОВАТЬ": "COPY", "СКОПИРОВАНО ✓": "COPIED ✓", "НЕ ВЫШЛО": "COPY FAILED", "ПОКАЗАТЬ ВСЕ РАБОТЫ": "SHOW ALL WORKS", "ВСЕ": "ALL", "БАННЕР 16:9": "BANNER 16:9", "ПОСТ 1:1": "POST 1:1", "ВЕРТИКАЛЬ / TWITCH": "PORTRAIT / TWITCH", "ШАПКА / ПЛАШКА": "HEADER / STRIP", "ДЛЯ СТРИМА": "STREAM ASSET", "ЛОГОТИП": "LOGO", "Меню": "Menu", "Закрыть": "Close", "Предыдущая": "Previous", "Следующая": "Next", "Графический дизайнер, специализируюсь на киберспорте. Делаю визуал турниров от первого анонса до баннера «Спасибо за участие». Отвечаю за оформление GNC — турнира по Overwatch (ранее GandonCup): соцсети, стримы, YouTube и сайт.": "Graphic designer focused on esports. I create tournament visuals from the first announcement to the final thank-you banner. I design for GNC, an Overwatch tournament formerly known as GandonCup: social media, streams, YouTube and the website.", "Ключевой визуал, логотип, цвет и типографика — единый стиль для всех площадок.": "Key visuals, logos, colour and typography — a consistent identity across every platform.", "Анонсы, расписания, составы команд, итоги, розыгрыши для Telegram и Discord.": "Announcements, schedules, team rosters, results and giveaways for Telegram and Discord.", "Шапки каналов и превью видео, которые читаются в ленте.": "Channel banners and video thumbnails that stand out in the feed.", "Знаки и логотипы для турниров, команд и проектов.": "Symbols and logos for tournaments, teams and projects.", "Концепты страниц турниров: каталог, сетка, команды, зал славы.": "Tournament website concepts: listings, brackets, teams and a hall of fame.", "Photoshop, Illustrator, After Effects и Figma — от макета и иллюстраций до анимации и интерфейсов.": "Photoshop, Illustrator, After Effects and Figma — from layouts and illustrations to animation and interfaces.", "Пишите в Telegram или на почту — обсудим задачу, сроки и стоимость.": "Message me on Telegram or email to discuss your project, timeline and budget.", "GNC · 19–20 сентября": "GNC · 19–20 September", "СЕН 2026": "SEP 2026", "Турнир по Overwatch при поддержке FunPay и FinalGear. Красно-серая айдентика: анонсы, расписания, розыгрыши, итоги, превью для YouTube, панели Twitch и баннеры для сайта.": "Overwatch tournament supported by FunPay and FinalGear. Red and grey identity: announcements, schedules, giveaways, results, YouTube thumbnails, Twitch panels and website banners.", "GNC · 1–2 августа": "GNC · 1–2 August", "АВГ 2026": "AUG 2026", "Тёмная фиолетовая айдентика летнего GNC: открытие регистрации, расписания матчей, MVP, призовой фонд, Twitch-панели и шапки YouTube.": "Dark purple identity for the summer GNC: registration, match schedules, MVP, prize pool, Twitch panels and YouTube banners.", "GNC · 2–3 мая": "GNC · 2–3 May", "МАЙ 2026": "MAY 2026", "Весенний GNC: светлая модульная сетка, чёрные плашки и цветные акценты. Превью, регистрация, составы команд, трансляции, результаты и баннеры для стримеров.": "Spring GNC: a light modular grid, black blocks and colourful accents. Thumbnails, registration, team rosters, broadcasts, results and streamer banners.", "GNC · 25–26 октября": "GNC · 25–26 October", "ОКТ 2025": "OCT 2025", "Октябрьский GNC 2025: бело-фиолетовая система с диагональными акцентами, леопардовый логотип, шоу-матч стримеров, сетка, призовые и победители.": "October GNC 2025: a white and purple system with diagonal accents, a leopard logo, streamer showmatch, brackets, prizes and winners.", "GNC · 27–29 июня": "GNC · 27–29 June", "ИЮН 2025": "JUN 2025", "Летний GNC 2025 (тогда турнир назывался GandonCup): регистрация, первый матч, правила, комьюнити-стримеры, составы и «зал победителей».": "Summer GNC 2025, then called GandonCup: registration, opening match, rules, community streamers, rosters and a hall of winners.", "GNC · 26–27 апреля": "GNC · 26–27 April", "АПР 2025": "APR 2025", "Чёрно-оранжевая айдентика турнира (тогда ещё GandonCup), который так и не состоялся: анонсы, регистрация, обновление правил и турнирная сетка.": "Black and orange identity for a tournament, then called GandonCup, that never took place: announcements, registration, rule updates and brackets.", "GNC в Стадионе": "GNC in Stadium", "СЕН–ОКТ 2025": "SEP–OCT 2025", "Временное событие и турнир в режиме «Стадион»: сине-белый стиль, регистрация, правила, рекламные баннеры для Twitch.": "A limited-time event and tournament in Stadium mode: blue and white styling, registration, rules and Twitch advertising banners.", "Web / UI концепты": "Web / UI concepts", "GNCOW.RU": "GNCOW.RU", "Макеты страниц сайта турниров: команды, зал славы, расписание матчей.": "Tournament website layouts: teams, hall of fame and match schedules.", "IDENTITY": "IDENTITY", "Знак GNC и логотип ///GNC, версии для Overwatch GNC, «Стадиона» и ранних сезонов, леопардовый GNC, иконка турнира и фанатский логотип в стилистике Diablo.": "GNC symbols and the ///GNC logo, versions for Overwatch GNC, Stadium and early seasons, leopard GNC, a tournament icon and a Diablo-inspired fan logo."};
  window.portfolioTranslate = value => {
    if (window.PORTFOLIO_LANG !== 'en') return value;
    return words[value] || value.replace(/(\d+) ПРОЕКТОВ \/ (\d+) РАБОТ/g, '$1 PROJECTS / $2 WORKS').replace(/(\d+) РАБОТ/g, '$1 WORKS');
  };
  window.translatePortfolio = () => {
    const t = window.portfolioTranslate;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script, style, [data-user-content]')) continue;
      const trimmed = node.nodeValue.trim(), translated = t(trimmed);
      if (translated !== trimmed) node.nodeValue = node.nodeValue.replace(trimmed, translated);
    }
    document.querySelectorAll('[aria-label]').forEach(el => el.setAttribute('aria-label', t(el.getAttribute('aria-label'))));
  };
  /* Смена языка перезагружает страницу. Чтобы не прыгать по странице, запоминаем
     блок, который сейчас вверху экрана, и после загрузки работ возвращаемся к нему. */
  const SCROLL_KEY = 'portfolio-lang-scroll';
  const navHeight = () => document.querySelector('.nav')?.offsetHeight || 0;
  const anchors = () => [...document.querySelectorAll('#hero, #projects, #works, .proj, #services, #contact')];
  let pending = null;
  try { pending = JSON.parse(sessionStorage.getItem(SCROLL_KEY)); sessionStorage.removeItem(SCROLL_KEY); } catch {}
  if (pending) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    document.documentElement.classList.add('lang-switching');
    const restore = () => {
      if (!pending) return;
      const el = pending.id && document.getElementById(pending.id);
      const y = el ? el.getBoundingClientRect().top + scrollY - pending.offset : pending.y;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
      pending = null;
      setTimeout(() => document.documentElement.classList.remove('lang-switching'), 30);
    };
    addEventListener('portfolio:ready', restore);
    setTimeout(restore, 8000);   // страховка, если app.js не загрузился
  }

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('languageToggle');
    button.setAttribute('aria-checked', String(window.PORTFOLIO_LANG === 'en'));
    button.onclick = () => {
      const next = window.PORTFOLIO_LANG === 'en' ? 'ru' : 'en';
      try { localStorage.setItem('portfolio-language', next); } catch {}
      // Первый блок, который виден под шапкой, и его сдвиг относительно верха экрана
      const top = navHeight();
      // (самый вложенный: внутри «Работ» это конкретный проект, а не весь раздел)
      const vis = anchors().filter(a => !a.hidden && a.getBoundingClientRect().bottom > top + 1);
      const el = vis.filter(a => a.getBoundingClientRect().top <= top + 1).pop() || vis[0];
      try {
        sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ id: el?.id || '', offset: el ? el.getBoundingClientRect().top : 0, y: scrollY }));
      } catch {}
      button.setAttribute('aria-checked', String(next === 'en'));
      document.documentElement.classList.add('lang-switching');
      const url = new URL(location.href); url.searchParams.set('lang', next); url.hash = '';
      setTimeout(() => location.replace(url), 180);
    };
    window.translatePortfolio();
  });
})();
