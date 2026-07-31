/**
 * Единое меню, футер, мессенджеры, нормализация кнопок, BreadcrumbList JSON-LD, согласие 152-ФЗ.
 */
(function () {
  var PHONE = '79829059348';
  var PHONE_DISPLAY = '+7 (982) 905-93-48';

  function ensureStyles() {
    if (document.getElementById('css-messengers')) return;
    var link = document.createElement('link');
    link.id = 'css-messengers';
    link.rel = 'stylesheet';
    link.href = '/css/messengers.css';
    document.head.appendChild(link);
  }

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

    // Всегда обновляем мессенджеры (чтобы подхватывать новые иконки)
    var messengers = header.querySelector('.header-messengers');
    if (messengers) messengers.remove();
    messengers = document.createElement('div');
    messengers.className = 'header-messengers';
    messengers.setAttribute('aria-label', 'Мессенджеры');
    messengers.innerHTML =
      /* WhatsApp */
      '<a class="msg-btn msg-wa" href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">' +
          '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24zM8.53 7.33c-.16 0-.43.06-.66.31-.24.26-.9.88-.9 2.13 0 1.25.92 2.48 1.05 2.65.12.17 1.78 2.83 4.41 3.86 2.2.87 2.65.7 3.13.66.48-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.1-.26-.17-.54-.3-.28-.14-1.67-.82-1.93-.92-.26-.1-.45-.14-.64.15-.19.28-.74.92-.9 1.11-.17.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.47.1-.19.05-.36-.02-.5-.08-.14-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48z"/>' +
        '</svg>' +
      '</a>' +
      /* Telegram */
      '<a class="msg-btn msg-tg" href="https://t.me/kappam6abless" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">' +
          '<path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>' +
        '</svg>' +
      '</a>' +
      /* Max — толстое кольцо как в официальном логотипе */
      '<a class="msg-btn msg-max" href="https://max.ru/u/f9LHodD0cOK1_MzS_d0c5a3nP4p3wlhHK73nirp7wU3DQbRRzM8P8lkkhII" target="_blank" rel="noopener noreferrer" title="Max" aria-label="Max">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
          '<defs>' +
            '<linearGradient id="maxGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
              '<stop offset="0%" stop-color="#4fc3f7"/>' +
              '<stop offset="45%" stop-color="#7c4dff"/>' +
              '<stop offset="100%" stop-color="#e040fb"/>' +
            '</linearGradient>' +
          '</defs>' +
          /* Внешний круг + внутреннее отверстие (толстое кольцо ~35% радиуса) */
          '<path fill="url(#maxGrad)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 5.2c2.65 0 4.8 2.15 4.8 4.8s-2.15 4.8-4.8 4.8-4.8-2.15-4.8-4.8 2.15-4.8 4.8-4.8z"/>' +
        '</svg>' +
      '</a>';
    var phoneEl = header.querySelector('.header-phone');
    if (phoneEl) header.insertBefore(messengers, phoneEl);
    else header.appendChild(messengers);

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
            ' · <a href="https://t.me/kappam6abless" target="_blank" rel="noopener noreferrer">Telegram</a>' +
            ' · <a href="https://max.ru/u/f9LHodD0cOK1_MzS_d0c5a3nP4p3wlhHK73nirp7wU3DQbRRzM8P8lkkhII" target="_blank" rel="noopener noreferrer">Max</a>' +
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

  function injectBreadcrumbJsonLd() {
    var el = document.querySelector('.breadcrumb');
    if (!el || document.getElementById('ld-breadcrumb')) return;

    var items = [];
    var position = 1;
    el.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var name = (a.textContent || '').trim();
      if (!name) return;
      var url = href;
      if (href.indexOf('http') !== 0) {
        if (href === '/' || href === '') {
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
      items.push({ '@type': 'ListItem', position: position++, name: name, item: url });
    });

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
    ensureStyles();
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
