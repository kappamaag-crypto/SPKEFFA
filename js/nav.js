/**
 * Единое меню + гамбургер для всех страниц сайта.
 * Подключать: /js/nav.js или ../js/nav.js
 */
(function () {
  function rootPrefix() {
    var p = location.pathname || '';
    if (/\/(blank|ognezaschita|veksa)(\/|$)/.test(p)) return '../';
    return '';
  }

  function ensureNav() {
    var header = document.querySelector('.header-inner');
    if (!header) return;

    var r = rootPrefix();
    var home = r ? r + 'index.html' : 'index.html';

    var nav = header.querySelector('.nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'nav';
      var phone = header.querySelector('.header-phone');
      if (phone) header.insertBefore(nav, phone);
      else header.appendChild(nav);
    }

    nav.innerHTML =
      '<a href="' + home + '#about">О компании</a>' +
      '<a href="' + r + 'blank/">Blank</a>' +
      '<a href="' + r + 'ognezaschita/">Огнезащита</a>' +
      '<a href="' + r + 'veksa/">Veksa</a>' +
      '<a href="' + r + 'raschet.html">Расчёт</a>' +
      '<a href="' + home + '#contacts">Контакты</a>';

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureNav);
  } else {
    ensureNav();
  }
})();
