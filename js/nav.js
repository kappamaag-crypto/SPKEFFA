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

    var messengers = header.querySelector('.header-messengers');
    if (!messengers) {
      messengers = document.createElement('div');
      messengers.className = 'header-messengers';
      messengers.setAttribute('aria-label', 'Мессенджеры');
      messengers.innerHTML =
        '<a class="msg-btn msg-wa" href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
        '</a>' +
        '<a class="msg-btn msg-tg" href="https://t.me/kappam6abless" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.15 1.156-.969 3.95-1.37 5.24-.169.54-.5.72-.817.74-.69.05-1.21-.45-1.88-.83-1.05-.6-1.64-.97-2.66-1.56-.81-.46-.28-.71.18-1.12.12-.11 2.26-2.07 2.3-2.25.01-.05.01-.23-.08-.32-.09-.1-.23-.07-.33-.04-.14.04-2.34 1.49-6.61 4.37-.62.43-1.19.64-1.7.62-.56-.03-1.63-.32-2.43-.58-.98-.33-1.76-.5-1.69-1.06.04-.29.42-.6 1.15-.9 4.52-1.97 7.53-3.27 9.03-3.91 4.27-1.8 5.16-2.11 5.74-2.12z"/></svg>' +
        '</a>' +
        '<a class="msg-btn msg-max" href="https://max.ru/u/f9LHodD0cOK1_MzS_d0c5a3nP4p3wlhHK73nirp7wU3DQbRRzM8P8lkkhII" target="_blank" rel="noopener noreferrer" title="Max" aria-label="Max">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2.1 21.9l4.95-1.3A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.2 13.7c-.18.5-.9.93-1.48 1.05-.4.08-.92.14-2.67-.57-2.24-.9-3.68-3.12-3.79-3.27-.11-.15-.9-1.2-.9-2.28 0-1.09.57-1.62.77-1.84.2-.22.44-.28.58-.28.15 0 .29 0 .42.01.13.01.31-.05.49.37.18.43.62 1.51.67 1.62.05.11.09.24.02.39-.07.15-.11.24-.22.37-.11.13-.23.29-.33.39-.11.11-.22.23-.1.44.13.22.56.92 1.2 1.49.82.74 1.51 1 1.73 1.11.22.11.34.09.47-.05.13-.15.55-.64.7-.86.15-.22.29-.18.49-.11.2.07 1.26.59 1.48.7.22.11.37.16.42.25.05.09.05.52-.13 1.02z"/></svg>' +
        '</a>';
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
