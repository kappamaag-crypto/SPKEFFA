/* Встраивание опубликованных Яндекс Форм. Внутренние поля и отступы iframe
   настраиваются только в конструкторе Яндекс Форм, а не CSS сайта. */
(function () {
  'use strict';

  var selector = '[data-yandex-form-url]';
  var containers = document.querySelectorAll
    ? document.querySelectorAll(selector)
    : [document.querySelector(selector)];

  Array.prototype.forEach.call(containers, function (container) {
    if (!container) return;

    var originalUrl = (container.getAttribute('data-yandex-form-url') || '').trim();
    if (!originalUrl) return;

    var target;
    try {
      target = new URL(originalUrl);
      if (target.protocol !== 'https:' || target.hostname !== 'forms.yandex.ru'
          || target.username || target.password || target.port
          || !/^\/(?:cloud\/)?u\/[a-z0-9_-]{6,}\/?$/i.test(target.pathname)) {
        throw new Error('Некорректный адрес опубликованной Яндекс Формы');
      }
    } catch (error) {
      console.error('Яндекс Форма не подключена: проверьте data-yandex-form-url.', error);
      return;
    }

    target.searchParams.set('iframe', '1');
    if (!target.searchParams.has('theme')) target.searchParams.set('theme', 'light');
    target.hash = '';

    var heading = container.getAttribute('data-yandex-form-title') || 'Оставить заявку';
    var variant = container.getAttribute('data-yandex-form-variant') || '';
    var embed = document.createElement('div');
    embed.className = 'yandex-form-embed' + (variant ? ' yandex-form-embed--' + variant : '');

    var title = document.createElement('h3');
    title.textContent = heading;

    var frame = document.createElement('iframe');
    frame.className = 'yandex-form-frame';
    frame.src = target.href;
    frame.name = 'ya-form-' + target.pathname.replace(/\/$/, '').split('/').pop();
    frame.title = 'Яндекс Форма — ' + heading;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('frameborder', '0');

    var fallback = document.createElement('p');
    fallback.className = 'form-note yandex-form-note';
    fallback.appendChild(document.createTextNode('Если форма не открывается, '));
    var direct = document.createElement('a');
    direct.href = target.href;
    direct.target = '_blank';
    direct.rel = 'noopener noreferrer';
    direct.textContent = 'откройте её в новой вкладке';
    fallback.appendChild(direct);
    fallback.appendChild(document.createTextNode('. Перед отправкой ознакомьтесь с '));
    var privacy = document.createElement('a');
    privacy.href = '/privacy.html';
    privacy.textContent = 'политикой обработки персональных данных';
    fallback.appendChild(privacy);
    fallback.appendChild(document.createTextNode('.'));

    embed.appendChild(title);
    embed.appendChild(frame);
    embed.appendChild(fallback);
    container.replaceChildren(embed);
  });
})();
