# Global Site Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Обновить оформление всего статического сайта и сократить буквальные текстовые повторы, сохранив существующие блоки, порядок, ссылки и поведение.

**Architecture:** Новый `css/refinement-2026.css` подключается последним стилем на каждой обычной HTML-странице и переопределяет только существующие классы. HTML меняется механически для подключения стиля и точечно для текста; `js/nav.js`, структура секций и основной `css/style.css` не переписываются.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Python 3 для статических проверок, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-24-minimal-site-refinement-design.md`

## Global Constraints

- Сохранять состав и порядок блоков, навигацию, ссылки, FAQ, «Раскрой PRO» и «Путевой лист».
- Не менять `js/nav.js` и не добавлять JavaScript или зависимости.
- Не исправлять числовые характеристики материалов без актуального TDS.
- Не изменять `yandex_263ea89542f6f9ea.html`.
- Не использовать градиенты, декоративные эффекты и рекламные обещания.
- Поддерживать ширину 320–1440 px, клавиатурный фокус и `prefers-reduced-motion`.

## Review Focus

- Вложенные страницы должны загружать общий CSS по корректному абсолютному пути.
- Ни одна обычная HTML-страница не должна остаться в старом оформлении.
- Порядок заголовков и секций не должен измениться при текстовой правке.
- FAQ JSON-LD должен совпадать с видимыми вопросами и ответами после сокращений.
- Новый слой не должен ломать горизонтальную прокрутку таблиц на экране 320 px.

---

### Task 1: Проверка сохранности структуры и глобального подключения

**Files:**
- Create: `scripts/check_global_refinement.py`
- Test: `scripts/check_global_refinement.py`

**Interfaces:**
- Consumes: все `*.html`, кроме служебного подтверждения Яндекса.
- Produces: CLI-проверка с кодом `0` и строкой `Global refinement: PASS`.

- [ ] **Step 1: Написать падающую проверку**

Проверка должна требовать: существование `css/refinement-2026.css`; ровно одно подключение `/css/refinement-2026.css` после остальных CSS на каждой обычной HTML-странице; отсутствие подключения в файле Яндекса; наличие прежних блоков главной и прежней последовательности `h2` на главной, Blank Universal и ЭФФА ЭП-150; отсутствие эмодзи `📄`, `✉`, `↗`, `↓` в ссылках.

- [ ] **Step 2: Запустить проверку и подтвердить ожидаемое падение**

Run: `python scripts/check_global_refinement.py`
Expected: FAIL — отсутствуют новый CSS и его подключения.

- [ ] **Step 3: Зафиксировать только проверку**

Commit: `test: define global refinement invariants`

### Task 2: Общий слой оформления

**Files:**
- Create: `css/refinement-2026.css`
- Modify: все обычные `*.html`, кроме `yandex_263ea89542f6f9ea.html`
- Test: `scripts/check_global_refinement.py`

**Interfaces:**
- Consumes: существующие классы из `css/style.css`, `product-photos.css`, `raskroy-promo.css`, `messengers.css`.
- Produces: единый каскадный слой, подключённый последним на всех страницах.

- [ ] **Step 1: Создать минимальный CSS-слой**

Определить уточнённые цвета, типографику и вертикальный ритм; оформить header, hero, section, product-card, product-content, таблицы, FAQ, документы, CTA, контакты, «Раскрой PRO» и «Путевой лист». Сохранить существующую сетку и размеры изображений; добавить `:focus-visible`, мобильные правила и `prefers-reduced-motion`.

- [ ] **Step 2: Механически подключить CSS ко всем обычным HTML**

Добавить `<link rel="stylesheet" href="/css/refinement-2026.css">` последним подключением стилей; не менять остальную разметку на этом шаге.

- [ ] **Step 3: Запустить проверку**

Run: `python scripts/check_global_refinement.py`
Expected: FAIL только по оставшимся эмодзи; проверки CSS, подключения и структуры проходят.

- [ ] **Step 4: Зафиксировать оформление**

Commit: `feat: apply restrained visual refinement site-wide`

### Task 3: Точечное сокращение повторов

**Files:**
- Modify: `index.html`
- Modify: продуктовые страницы, содержащие буквальные повторы или эмодзи в ссылках
- Test: `scripts/check_global_refinement.py`

**Interfaces:**
- Consumes: текущий видимый текст и соответствующий FAQ JSON-LD.
- Produces: более короткий текст без изменения фактов, заголовков, ссылок и порядка блоков.

- [ ] **Step 1: Сократить повторы на главной**

Оставить сведения о представительстве в hero; в «О компании» заменить повтор на короткое описание роли СПК ЭФФА; в FAQ сохранить вопросы, но убрать повтор полного вводного абзаца. Не добавлять годы, количество объектов и сроки поставки без подтверждения.

- [ ] **Step 2: Обработать продуктовые страницы**

Убрать эмодзи из ссылок документов и действий; сокращать только ответы FAQ, буквально повторяющие «Назначение» или CTA; синхронно обновлять FAQ JSON-LD. Не менять технические таблицы и числовые значения.

- [ ] **Step 3: Запустить проверку**

Run: `python scripts/check_global_refinement.py`
Expected: `Global refinement: PASS`.

- [ ] **Step 4: Зафиксировать текстовые изменения**

Commit: `content: remove repeated copy without changing page structure`

### Task 4: Полная проверка ветки

**Files:**
- Verify: весь репозиторий

**Interfaces:**
- Consumes: результат Tasks 1–3.
- Produces: подтверждённая ветка для просмотра без слияния в `main`.

- [ ] **Step 1: Запустить новую статическую проверку**

Run: `python scripts/check_global_refinement.py`
Expected: `Global refinement: PASS`.

- [ ] **Step 2: Запустить существующие проверки репозитория**

Run доступных скриптов из `scripts/` и workflow-команд, относящихся к HTML, ссылкам, PDF и SEO; зафиксировать каждую недоступную внешнюю проверку отдельно.

- [ ] **Step 3: Проверить адаптивность**

Просмотреть главную, Blank Universal, ЭФФА ЭП-150, каталог Blank, каталог ЭФФА и каталог VEKSA на 390 px и 1440 px; проверить фокус, меню, таблицы, FAQ и оба блока программ.

- [ ] **Step 4: Проверить удалённую ветку после публикации**

Сверить head SHA и blob SHA всех изменённых файлов; `main` не изменять и PR автоматически не создавать.
