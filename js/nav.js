/**
 * Единое меню + гамбургер + логотип + единый футер + нормализация кнопок документации.
 */
(function () {
  function ensureNav() {
    var header = document.querySelector('.header-inner');
    if (!header) return;

    var logo = header.querySelector('a.logo');
    if (!logo) {
      logo = document.createElement('a');
      logo.className = 'logo';
      header.insertBefore(logo, header.firstChild);
    }
    logo.setAttribute('href', '/');
    logo.innerHTML =
      '<img src="/img/logo-spk-effa-mark.svg" alt="" class="logo-img" width="48" height="32">' +
      '<span class="logo-text">СПК ЭФФА</span>';

    var nav = header.querySelector('.nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'nav';
      var phone = header.querySelector('.header-phone');
      if (phone) header.insertBefore(nav, phone);
      else header.appendChild(nav);
    }

    nav.innerHTML =
      '<a href="/#about">О компании</a>' +
      '<a href="/blank/">АКЗ Blank</a>' +
      '<a href="/ognezaschita/">Огнезащита ЭФФА</a>' +
      '<a href="/veksa/">Наливные полы Veksa</a>' +
      '<a href="/raschet.html">Расчёт</a>' +
      '<a href="/#contacts">Контакты</a>';

    var toggle = header.querySelector('.nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'nav-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Меню');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      header.appendChild(toggle);
    }

    function closeMenu() {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      toggle.classList.add('active');
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.onclick = function () {
      if (nav.classList.contains('open')) closeMenu();
      else openMenu();
    };

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  function ensureFooter() {
    var footer = document.querySelector('footer.footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'footer';
      document.body.appendChild(footer);
    }
    footer.innerHTML =
      '<div class="container footer-inner">' +
        '<div class="footer-left">' +
          '<a href="/" class="logo footer-logo">' +
            '<img src="/img/logo-spk-effa-mark.svg" alt="" class="logo-img" width="40" height="28" style="filter:brightness(0) invert(1)">' +
            '<span class="logo-text">СПК ЭФФА</span>' +
          '</a>' +
          '<p>Официальный представитель ТМ Blank, ЭФФА и Veksa.</p>' +
          '<p class="footer-contacts">' +
            '<a href="tel:+79829059348">+7 (982) 905-93-48</a>' +
            ' · ' +
            '<a href="mailto:info@spk-effa.ru">info@spk-effa.ru</a>' +
          '</p>' +
        '</div>' +
        '<nav class="footer-nav" aria-label="Разделы сайта">' +
          '<a href="/blank/">АКЗ Blank</a>' +
          '<a href="/ognezaschita/">Огнезащита ЭФФА</a>' +
          '<a href="/veksa/">Наливные полы Veksa</a>' +
          '<a href="/raschet.html">Расчёт</a>' +
          '<a href="/#contacts">Контакты</a>' +
        '</nav>' +
        '<div class="footer-right">' +
          '<p>© 2024–2026 ООО «СПК ЭФФА».</p>' +
          '<p class="footer-address">г. Уфа, ул. Революционная, 221, оф. 208</p>' +
        '</div>' +
      '</div>';
  }

  /** Единые подписи кнопок; протоколы из блока документации убираем */
  function normalizeDocButtons() {
    document.querySelectorAll('a.doc-btn').forEach(function (a) {
      var t = (a.textContent || '').replace(/\s+/g, ' ').trim();
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (/протокол/i.test(t) || /protokol/i.test(href)) {
        a.remove();
        return;
      }
      if (/ТД\s*\/?\s*паспорт/i.test(t) || /^📄?\s*ТД/i.test(t)) {
        a.innerHTML = '📄 TDS / технический паспорт';
      }
      if (/Запросить/i.test(t) && (/комплект/i.test(t) || /протокол/i.test(t))) {
        a.innerHTML = '✉ Запросить комплект документации';
      }
    });
  }

  /** Обернуть таблицы .spec-table в .table-wrap, если ещё не обёрнуты */
  function wrapSpecTables() {
    document.querySelectorAll('table.spec-table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function init() {
    ensureNav();
    ensureFooter();
    normalizeDocButtons();
    wrapSpecTables();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
