# Технические паспорта (TDS) — СПК ЭФФА

Файлы PDF хранятся внутри репозитория. Ссылки в карточках продукции должны совпадать с именами файлов **с учётом регистра**. Старые имена из первоначального шаблона сайта не используются.

## Blank
- `Blank_DTM.pdf`
- `Blank_Finish.pdf`
- `Blank_HP.pdf`
- `Blank_MIO.pdf`
- `Blank_One.pdf`
- `Blank_Tank.pdf`
- `Blank_Tank_LP.pdf`
- `Blank_Universal.pdf`
- `Blank_Zinc.pdf`

## ЭФФА
- `EFFA_01B.pdf`
- `EFFA_01_organic_and_EFFA_KT01_organic.pdf`
- `EFFA_01_water_and_EFFA_KT01_water.pdf`
- `EFFA_A-01.pdf`
- `EFFA_A-01konstructive.pdf`
- `EFFA_EP150_and_EP150K.pdf`
- `EFFA_cable.pdf`
- `Технический_паспорт_ЭФФА_ПУ_026.pdf`

## VEKSA
- `VEKSA_EP_20.pdf`
- `VEKSA_EP_21.pdf`
- `VEKSA_PP_11.pdf`
- `VEKSA_PR_10.pdf`

Всего: **21 PDF**. Один документ может относиться к нескольким карточкам.

## Контроль
Запустите `python3 scripts/check_site.py`, чтобы обнаружить несуществующие ссылки на PDF, и `python3 scripts/verify_tds.py` (требует `pdfplumber`), чтобы сравнить извлекаемые технические параметры сайта с паспортами. Результаты эвристической сверки требуют экспертной проверки.
