'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const calc = fs.readFileSync(path.join(root, 'raschet.html'), 'utf8');
const nav = fs.readFileSync(path.join(root, 'js/nav.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/raskroy-promo.css'), 'utf8');

test('promo remains between FAQ and contacts', () => {
  const faq = main.indexOf('<h2 class="section-title">Частые вопросы</h2>');
  const promo = main.indexOf('id="raskroy-title"');
  const contacts = main.indexOf('id="contacts"');
  assert.ok(faq >= 0 && promo > faq && contacts > promo);
  assert.ok(css.includes('.raskroy-promo{max-width:800px;'));
});

for (const [name, html] of [['главная', main], ['расчёт', calc]]) {
  test(name + ': direct email and phone links replace forms', () => {
    assert.match(html, /href="mailto:info@spk-effa\.ru(?:\?[^"]*)?"/);
    assert.match(html, /href="tel:\+79829059348"/);
    assert.doesNotMatch(html, /<\s*(?:form|input|textarea|iframe)\b/i);
    assert.doesNotMatch(html, /forms\.yandex\.ru|yandex-forms\.js|yandex-form\.css|data-yandex-form-url|privacy_consent/i);
  });
}

test('no obsolete Yandex Forms module, banner or dependency', () => {
  for (const rel of ['js/yandex-forms.js', 'css/yandex-form.css', 'docs/YANDEX_FORMS.md', 'scripts/test_yandex_embed.cjs']) {
    assert.equal(fs.existsSync(path.join(root, rel)), false, rel);
  }
  assert.doesNotMatch(nav, /ensureFormConsent|ensureCookieNotice|cookie-notice|privacy_consent|Яндекс Формы/);
});

test('calculation page stays indexable with original canonical', () => {
  assert.match(calc, /<link rel="canonical" href="https:\/\/spk-effa\.ru\/raschet\.html">/);
  assert.match(calc, /<h1>Получить расчёт расхода и КП<\/h1>/);
  assert.match(calc, /Что указать в письме/);
});
