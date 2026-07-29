/**
 * Единое меню, футер, мессенджеры, нормализация кнопок, BreadcrumbList JSON-LD.
 */
(function () {
  var PHONE = '79829059348';
  var PHONE_DISPLAY = '+7 (982) 905-93-48';

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

    /* Мессенджеры рядом с телефоном */
    var messengers = header.querySelector('.header-messengers');
    if (!messengers) {
      messengers = document.createElement('div');
      messengers.className = 'header-messengers';
      messengers.setAttribute('aria-label', 'Мессенджеры');
      messengers.innerHTML =
        '<a class="msg-btn msg-wa" href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp">WA</a>' +
        '<a class="msg-btn msg-tg" href="https://t.me/+' + PHONE + '" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">TG</a>' +
        '<a class="msg-btn msg-max" href="https://max.ru/" target="_blank" rel="noopener noreferrer" title="Max" aria-label="Max">Max</a>';
      var phoneEl = header.querySelector('.header-phone');
      if (phoneEl) header.insertBefore(messengers, phoneEl);
      else header.appendChild(messengers);
    }

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
            '<a href="tel:+' + PHONE + '">' + PHONE_DISPLAY + '</a>' +
            ' · ' +
            '<a href="mailto:info@spk-effa.ru">info@spk-effa.ru</a>' +
          '</p>' +
          '<p class="footer-messengers">' +
            '<a href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
            ' · <a href="https://t.me/+' + PHONE + '" target="_blank" rel="noopener noreferrer">Telegram</a>' +
            ' · <a href="https://max.ru/" target="_blank" rel="noopener noreferrer">Max</a>' +
          '</p>' +
        '</div>' +
        '<nav class="footer-nav" aria-label="Разделы сайта">' +
          '<a href="/blank/">АКЗ Blank</a>' +
          '<a href="/ognezaschita/">Огнезащита ЭФФА</a>' +
          '<a href="/veksa/">Наливные полы Veksa</a>' +
          '<a href="/raschet.html">Расчёт</a>' +
          '<a href="/#contacts">Контакты</a>' +
          '<a href="/privacy.html">Конфиденциальность</a>' +
        '</nav>' +
        '<div class="footer-right">' +
          '<p>© 2024–2026 ООО «СПК ЭФФА».</p>' +
          '<p class="footer-address">г. Уфа, ул. Революционная, 221, оф. 208</p>' +
        '</div>' +
      '</div>';
  }

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

  function wrapSpecTables() {
    document.querySelectorAll('table.spec-table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /** BreadcrumbList JSON-LD из видимых .breadcrumb */
  function injectBreadcrumbJsonLd() {
    var el = document.querySelector('.breadcrumb');
    if (!el || document.getElementById('ld-breadcrumb')) return;

    var items = [];
    var position = 1;
    var links = el.querySelectorAll('a');
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var name = (a.textContent || '').trim();
      if (!name) return;
      var url = href;
      if (href.indexOf('http') !== 0) {
        if (href === '/' || href === '' || href === 'index.html' && !href.includes('/')) {
          url = 'https://spk-effa.ru/';
        } else if (href.charAt(0) === '/') {
          url = 'https://spk-effa.ru' + href;
        } else {
          try {
            url = new URL(href, window.location.href).href;
          } catch (e) {
            url = window.location.href;
          }
        }
      }
      items.push({
        '@type': 'ListItem',
        position: position++,
        name: name,
        item: url
      });
    });

    /* Текущая страница (текст после последней ссылки) */
    var full = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var parts = full.split('/').map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length && items.length && parts[parts.length - 1] !== items[items.length - 1].name) {
      items.push({
        '@type': 'ListItem',
        position: position,
        name: parts[parts.length - 1],
        item: window.location.href.split('#')[0]
      });
    }

    if (items.length < 2) return;

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ld-breadcrumb';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    });
    document.head.appendChild(script);
  }

  /** Согласие 152-ФЗ в формах, если ещё нет */
  function ensureFormConsent() {
    document.querySelectorAll('form').forEach(function (form) {
      if (form.querySelector('.consent-check')) return;
      var btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      var wrap = document.createElement('label');
      wrap.className = 'consent-check';
      wrap.innerHTML =
        '<input type="checkbox" name="privacy_consent" value="yes" required>' +
        '<span>Согласен на <a href="/privacy.html" target="_blank" rel="noopener">обработку персональных данных</a></span>';

      btn.parentNode.insertBefore(wrap, btn);

      var note = form.querySelector('.form-note');
      if (note) {
        note.innerHTML = 'Подробнее — в <a href="/privacy.html">политике конфиденциальности</a>';
      }
    });
  }

  function init() {
    ensureNav();
    ensureFooter();
    normalizeDocButtons();
    wrapSpecTables();
    injectBreadcrumbJsonLd();
    ensureFormConsent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
