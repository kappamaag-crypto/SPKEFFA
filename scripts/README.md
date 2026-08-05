# scripts/

## verify_tds.py — сверка таблиц страниц с TDS PDF

Автоматически сравнивает ключевые технические параметры на страницах товаров
с данными из PDF в `docs/`.

### Установка

```bash
pip install pdfplumber
# опционально для сканов (EFFA 01, cable и т.п.):
pip install pdf2image pytesseract
# + системно: tesseract-ocr tesseract-ocr-rus poppler-utils
```

### Запуск

```bash
# все 20 страниц
python3 scripts/verify_tds.py

# с OCR для сканированных PDF
python3 scripts/verify_tds.py --ocr

# одна страница
python3 scripts/verify_tds.py --only blank/one.html

# JSON-отчёт
python3 scripts/verify_tds.py --json /tmp/tds-report.json
```

### Статусы

| Символ | Статус | Значение |
|--------|--------|----------|
| ✓ | OK | числа/текст совместимы |
| ⚠ | WARN | текст отличается — проверить глазами |
| ✗ | FAIL | числа не сходятся |
| ? | MISSING_TDS | параметр на сайте, в PDF не извлечён |
| ○ | MISSING_SITE | есть в TDS, нет в таблице страницы |

### Важно

- Парсер эвристический: PDF без текстового слоя (сканы) требуют `--ocr`.
- «Срок хранения» (месяцы) не смешивается со «сроком службы покрытия» (годы).
- Расхождения WARN/FAIL всегда перепроверяйте по исходному TDS перед правкой сайта.
- Карта страница→PDF задана в `PAGE_TO_TDS` внутри скрипта.

### CI (опционально)

В GitHub Actions можно добавить шаг:

```yaml
- run: pip install pdfplumber
- run: python3 scripts/verify_tds.py
```

Exit code ≠ 0 при наличии FAIL.
