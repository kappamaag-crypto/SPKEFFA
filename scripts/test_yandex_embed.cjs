'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root,'js/yandex-forms.js'),'utf8');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const css = fs.readFileSync(path.join(root,'css/raskroy-promo.css'),'utf8');

function evaluate(urlValue) {
  let replaced = false, child;
  const errors = [];
  function element(tag) {
    return {
      tag, children: [],
      appendChild(node) {this.children.push(node); return node;},
      setAttribute(name,value) {this[name]=value;}
    };
  }
  const container = {
    getAttribute(name) {
      return name === 'data-yandex-form-url' ? urlValue : null;
    },
    replaceChildren(...nodes) {replaced = true; child = nodes[0];}
  };
  const document = {
    querySelector(selector) {
      assert.equal(selector,'.contact-form-wrapper[data-yandex-form-url]');
      return container;
    },
    createElement: element,
    createTextNode(text) {return {textContent:text,tag:'#text'};}
  };
  require('node:vm').runInNewContext(source,{document,URL,console:{error:(...x)=>errors.push(x)}},{timeout:1000});
  return {replaced, child, errors};
}

test('main promo appears after FAQ with the same max width',()=>{
 const faq=html.indexOf('<h2 class="section-title">Частые вопросы</h2>');
 const promo=html.indexOf('id="raskroy-title"');
 const contacts=html.indexOf('id="contacts"');
 assert.ok(faq >= 0 && promo>faq && contacts>promo);
 assert.ok(css.includes('.raskroy-promo{max-width:800px;'));
});

test('unconfigured Yandex URL retains the existing functioning contact form',()=>{
 const r=evaluate('');
 assert.equal(r.replaced,false);
 assert.ok(html.includes('data-yandex-form-url=""'));
 assert.ok(html.includes('action="https://formspree.io/f/mdaqywrn"'));
});

test('published official Yandex form safely embeds and links privacy policy',()=>{
 const r=evaluate('https://forms.yandex.ru/u/5e2ac2d123456789/');
 assert.equal(r.replaced,true);
 assert.equal(r.child.tag,'div');
 const [,frame,note]=r.child.children;
 assert.equal(frame.tag,'iframe');
 assert.match(frame.src,/^https:\/\/forms\.yandex\.ru\/u\/5e2ac2d123456789\/\?/);
 assert.ok(frame.src.includes('iframe=1'));
 assert.equal(frame.title,'Яндекс Форма — заявка в СПК ЭФФА');
 assert.equal(note.children.some(x=>x.href==='/privacy.html'),true);
});

test('malicious or invalid URL never replaces working form',()=>{
 for(const url of ['https://forms.yandex.ru.evil.test/u/123456789/','http://forms.yandex.ru/u/123456789/','https://forms.yandex.ru/','https://example.com/u/123456789/']){
  const r=evaluate(url);
  assert.equal(r.replaced,false,url);
  assert.ok(r.errors.length>0,url);
 }
});

test('main page references the optional Yandex module and iframe stylesheet',()=>{
 assert.ok(html.includes('<script src="js/yandex-forms.js"></script>'));
 assert.ok(html.includes('<link rel="stylesheet" href="css/yandex-form.css">'));
 assert.ok(fs.existsSync(path.join(root,'docs/YANDEX_FORMS.md')));
});
