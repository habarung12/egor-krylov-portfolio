/* Переключатель RU / EN. Язык меняется на ходу, без перезагрузки страницы:
   все тексты переводятся по словарю в обе стороны. */
(() => {
  const query = new URLSearchParams(location.search).get('lang');
  let saved; try { saved = localStorage.getItem('portfolio-language'); } catch {}
  window.PORTFOLIO_LANG = ['ru', 'en'].includes(query) ? query : (saved === 'en' ? 'en' : 'ru');
  document.documentElement.lang = window.PORTFOLIO_LANG;
  const words = {"ГЛАВНАЯ": "HOME", "ПРОЕКТЫ": "PROJECTS", "РАБОТЫ": "WORKS", "УСЛУГИ": "SERVICES", "КОНТАКТЫ": "CONTACT", "НАПИСАТЬ": "GET IN TOUCH", "ЕГОР КРЫЛОВ": "EGOR KRYLOV", "СМОТРЕТЬ РАБОТЫ": "VIEW WORKS", "ЧТО Я ДЕЛАЮ": "WHAT I DO", "Айдентика турнира": "Tournament identity", "Соцсети": "Social media", "Логотипы": "Logos", "Программы": "Tools", "СВЯЗАТЬСЯ": "GET IN", "СО МНОЙ": "TOUCH", "НАВЕРХ ↑": "BACK TO TOP ↑", "ВСЕ ИГРОВЫЕ ПЕРСОНАЖИ И ЛОГОТИПЫ ПРИНАДЛЕЖАТ ИХ ПРАВООБЛАДАТЕЛЯМ": "ALL GAME CHARACTERS AND LOGOS BELONG TO THEIR RESPECTIVE OWNERS", "КОПИРОВАТЬ": "COPY", "СКОПИРОВАНО ✓": "COPIED ✓", "НЕ ВЫШЛО": "COPY FAILED", "ПОКАЗАТЬ ВСЕ РАБОТЫ": "SHOW ALL WORKS", "ВСЕ": "ALL", "БАННЕР 16:9": "BANNER 16:9", "ПОСТ 1:1": "POST 1:1", "ВЕРТИКАЛЬ / TWITCH": "PORTRAIT / TWITCH", "ШАПКА / ПЛАШКА": "HEADER / STRIP", "ДЛЯ СТРИМА": "STREAM ASSET", "ЛОГОТИП": "LOGO", "Меню": "Menu", "Закрыть": "Close", "Предыдущая": "Previous", "Следующая": "Next", "Графический дизайнер, специализируюсь на киберспорте. Делаю визуал турниров от первого анонса до баннера «Спасибо за участие». Отвечаю за оформление GNC — турнира по Overwatch (ранее GandonCup): соцсети, стримы, YouTube и сайт.": "Graphic designer focused on esports. I create tournament visuals from the first announcement to the final thank-you banner. I design for GNC, an Overwatch tournament formerly known as GandonCup: social media, streams, YouTube and the website.", "Ключевой визуал, логотип, цвет и типографика — единый стиль для всех площадок.": "Key visuals, logos, colour and typography — a consistent identity across every platform.", "Анонсы, расписания, составы команд, итоги, розыгрыши для Telegram и Discord.": "Announcements, schedules, team rosters, results and giveaways for Telegram and Discord.", "Шапки каналов и превью видео, которые читаются в ленте.": "Channel banners and video thumbnails that stand out in the feed.", "Знаки и логотипы для турниров, команд и проектов.": "Symbols and logos for tournaments, teams and projects.", "Концепты страниц турниров: каталог, сетка, команды, зал славы.": "Tournament website concepts: listings, brackets, teams and a hall of fame.", "Photoshop, Illustrator, After Effects и Figma — от макета и иллюстраций до анимации и интерфейсов.": "Photoshop, Illustrator, After Effects and Figma — from layouts and illustrations to animation and interfaces.", "Пишите в Telegram или на почту — обсудим задачу, сроки и стоимость.": "Message me on Telegram or email to discuss your project, timeline and budget.", "GNC · 19–20 сентября": "GNC · 19–20 September", "СЕН 2026": "SEP 2026", "Турнир по Overwatch при поддержке FunPay и FinalGear. Красно-серая айдентика: анонсы, расписания, розыгрыши, итоги, превью для YouTube, панели Twitch и баннеры для сайта.": "Overwatch tournament supported by FunPay and FinalGear. Red and grey identity: announcements, schedules, giveaways, results, YouTube thumbnails, Twitch panels and website banners.", "GNC · 1–2 августа": "GNC · 1–2 August", "АВГ 2026": "AUG 2026", "Тёмная фиолетовая айдентика летнего GNC: открытие регистрации, расписания матчей, MVP, призовой фонд, Twitch-панели и шапки YouTube.": "Dark purple identity for the summer GNC: registration, match schedules, MVP, prize pool, Twitch panels and YouTube banners.", "GNC · 2–3 мая": "GNC · 2–3 May", "МАЙ 2026": "MAY 2026", "Весенний GNC: светлая модульная сетка, чёрные плашки и цветные акценты. Превью, регистрация, составы команд, трансляции, результаты и баннеры для стримеров.": "Spring GNC: a light modular grid, black blocks and colourful accents. Thumbnails, registration, team rosters, broadcasts, results and streamer banners.", "GNC · 25–26 октября": "GNC · 25–26 October", "ОКТ 2025": "OCT 2025", "Октябрьский GNC 2025: бело-фиолетовая система с диагональными акцентами, леопардовый логотип, шоу-матч стримеров, сетка, призовые и победители.": "October GNC 2025: a white and purple system with diagonal accents, a leopard logo, streamer showmatch, brackets, prizes and winners.", "GNC · 27–29 июня": "GNC · 27–29 June", "ИЮН 2025": "JUN 2025", "Летний GNC 2025 (тогда турнир назывался GandonCup): регистрация, первый матч, правила, комьюнити-стримеры, составы и «зал победителей».": "Summer GNC 2025, then called GandonCup: registration, opening match, rules, community streamers, rosters and a hall of winners.", "GNC · 26–27 апреля": "GNC · 26–27 April", "АПР 2025": "APR 2025", "Чёрно-оранжевая айдентика турнира (тогда ещё GandonCup), который так и не состоялся: анонсы, регистрация, обновление правил и турнирная сетка.": "Black and orange identity for a tournament, then called GandonCup, that never took place: announcements, registration, rule updates and brackets.", "GNC в Стадионе": "GNC in Stadium", "СЕН–ОКТ 2025": "SEP–OCT 2025", "Временное событие и турнир в режиме «Стадион»: сине-белый стиль, регистрация, правила, рекламные баннеры для Twitch.": "A limited-time event and tournament in Stadium mode: blue and white styling, registration, rules and Twitch advertising banners.", "Web / UI концепты": "Web / UI concepts", "GNCOW.RU": "GNCOW.RU", "Макеты страниц сайта турниров: команды, зал славы, расписание матчей.": "Tournament website layouts: teams, hall of fame and match schedules.", "IDENTITY": "IDENTITY", "Знак GNC и логотип ///GNC, версии для Overwatch GNC, «Стадиона» и ранних сезонов, леопардовый GNC, иконка турнира и фанатский логотип в стилистике Diablo.": "GNC symbols and the ///GNC logo, versions for Overwatch GNC, Stadium and early seasons, leopard GNC, a tournament icon and a Diablo-inspired fan logo."};
  const reverse = Object.fromEntries(Object.entries(words).map(([ru, en]) => [en, ru]));
  const toRu = value => reverse[value] ||
    value.replace(/(\d+) PROJECTS \/ (\d+) WORKS/g, '$1 ПРОЕКТОВ / $2 РАБОТ').replace(/(\d+) WORKS/g, '$1 РАБОТ');
  const toEn = value => words[value] ||
    value.replace(/(\d+) ПРОЕКТОВ \/ (\d+) РАБОТ/g, '$1 PROJECTS / $2 WORKS').replace(/(\d+) РАБОТ/g, '$1 WORKS');
  // Перевод строки на текущий язык; на вход можно давать и русский, и английский вариант
  window.portfolioTranslate = value => {
    const ru = toRu(value);
    return window.PORTFOLIO_LANG === 'en' ? toEn(ru) : ru;
  };
  window.translatePortfolio = () => {
    const t = window.portfolioTranslate, en = window.PORTFOLIO_LANG === 'en';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script, style, [data-user-content], [data-en]')) continue;
      const trimmed = node.nodeValue.trim(), translated = t(trimmed);
      if (translated !== trimmed) node.nodeValue = node.nodeValue.replace(trimmed, translated);
    }
    document.querySelectorAll('[aria-label]').forEach(el => el.setAttribute('aria-label', t(el.getAttribute('aria-label'))));
    // Тексты из админки: оба варианта лежат в data-ru / data-en
    document.querySelectorAll('[data-en]').forEach(el => { el.textContent = en && el.dataset.en ? el.dataset.en : el.dataset.ru; });
    document.querySelectorAll('[data-fmt]').forEach(el => { el.dataset.label = t(el.dataset.fmt); });
  };
  window.setPortfolioLang = lang => {
    window.PORTFOLIO_LANG = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('portfolio-language', lang); } catch {}
    const url = new URL(location.href); url.searchParams.set('lang', lang);
    history.replaceState(history.state, '', url);
    document.getElementById('languageToggle')?.setAttribute('aria-checked', String(lang === 'en'));
    // Тексты на другом языке другой длины, и блоки выше экрана меняют высоту.
    // Запоминаем блок вверху экрана и после перевода возвращаем его на то же место.
    const top = document.querySelector('.nav')?.offsetHeight || 0;
    const blocks = [...document.querySelectorAll('#hero, #projects, .plist li, #works, .proj, #services, #contact')]
      .filter(el => !el.hidden && el.getBoundingClientRect().bottom > top);
    const anchor = blocks.filter(el => el.getBoundingClientRect().top <= top + 1).pop() || blocks[0];
    const before = anchor?.getBoundingClientRect().top;
    window.translatePortfolio();
    dispatchEvent(new Event('portfolio:lang'));
    if (anchor && scrollY > 0) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: 'instant' });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('languageToggle');
    button.setAttribute('aria-checked', String(window.PORTFOLIO_LANG === 'en'));
    button.onclick = () => window.setPortfolioLang(window.PORTFOLIO_LANG === 'en' ? 'ru' : 'en');
    window.translatePortfolio();
  });
})();
