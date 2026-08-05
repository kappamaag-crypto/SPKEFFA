#!/usr/bin/env python3
"""
verify_tds.py — автоматическая сверка технических таблиц страниц товаров с TDS PDF.

Запуск:
  python3 scripts/verify_tds.py
  python3 scripts/verify_tds.py --ocr          # OCR для сканов (медленнее)
  python3 scripts/verify_tds.py --json report.json
  python3 scripts/verify_tds.py --only blank/one.html

Требования: pdfplumber
Опционально для OCR: pdf2image, pytesseract, tesseract-ocr, tesseract-ocr-rus
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent

PAGE_TO_TDS: dict[str, str] = {
    "blank/dtm.html": "docs/blank/Blank_DTM.pdf",
    "blank/finish.html": "docs/blank/Blank_Finish.pdf",
    "blank/hp.html": "docs/blank/Blank_HP.pdf",
    "blank/mio.html": "docs/blank/Blank_MIO.pdf",
    "blank/one.html": "docs/blank/Blank_One.pdf",
    "blank/tank.html": "docs/blank/Blank_Tank.pdf",
    "blank/tank-lp.html": "docs/blank/Blank_Tank_LP.pdf",
    "blank/universal.html": "docs/blank/Blank_Universal.pdf",
    "blank/zinc.html": "docs/blank/Blank_Zinc.pdf",
    "ognezaschita/effa-a-01.html": "docs/effa/EFFA_A-01.pdf",
    "ognezaschita/effa-a-01-konstruktiv.html": "docs/effa/EFFA_A-01konstructive.pdf",
    "ognezaschita/effa-ep-150.html": "docs/effa/EFFA_EP150_and_EP150K.pdf",
    "ognezaschita/effa-ep-150k.html": "docs/effa/EFFA_EP150_and_EP150K.pdf",
    "ognezaschita/effa-01-rastvoritel.html": "docs/effa/EFFA_01_organic_and_EFFA_KT01_organic.pdf",
    "ognezaschita/effa-01-voda.html": "docs/effa/EFFA_01_water_and_EFFA_KT01_water.pdf",
    "ognezaschita/effa-kt01.html": "docs/effa/EFFA_01_organic_and_EFFA_KT01_organic.pdf",
    "ognezaschita/effa-01b.html": "docs/effa/EFFA_01B.pdf",
    "ognezaschita/effa-kabel.html": "docs/effa/EFFA_cable.pdf",
    "veksa/pr-10.html": "docs/veksa/VEKSA_PR_10.pdf",
    "veksa/pp-11.html": "docs/veksa/VEKSA_PP_11.pdf",
}

PARAM_ALIASES = {
    "сухой остаток": "dry_residue",
    "сухой остаток, %": "dry_residue",
    "сухой остаток по объему": "dry_residue",
    "массовая доля нелетучих веществ": "dry_residue",
    "содержание нелетучих веществ": "dry_residue",
    "плотность": "density",
    "плотность, кг/л": "density",
    "плотность при +20 °с": "density",
    "толщина сухого слоя": "dft",
    "толщина сухого слоя, мм": "dft",
    "толщина одного слоя": "dft",
    "рекомендуемая толщина покрытия": "dft",
    "толщина слоя": "dft",
    "расход теоретический": "consumption",
    "расход": "consumption",
    "расход материала": "consumption",
    "теоретическая укрывистость": "consumption",
    "температура": "temp",
    "температура воздуха": "temp",
    "температура воздуха / поверхности": "temp",
    "температура воздуха и поверхности": "temp",
    "температура воздуха и основания": "temp",
    "температура нанесения": "temp",
    "влажность": "humidity",
    "относительная влажность": "humidity",
    "содержание цинка в сухой плёнке": "zinc",
    "содержание цинка": "zinc",
    "цвет": "color",
    "цвета": "color",
    "глянец": "gloss",
    "уровень глянца": "gloss",
    "срок службы": "service_life",
    "срок службы покрытия": "service_life",
    "предел огнестойкости": "fire_rating",
    "упаковка": "packaging",
    "фасовка": "packaging",
    "растворитель": "solvent",
    "тип": "type",
}


@dataclass
class SpecValue:
    raw: str
    numbers: list[float] = field(default_factory=list)
    unit: str = ""
    note: str = ""


@dataclass
class Finding:
    page: str
    param: str
    site_value: str
    tds_value: str
    status: str
    detail: str = ""


def normalize_param(name: str) -> Optional[str]:
    n = re.sub(r"\s+", " ", name.lower().strip()).replace("ё", "е")
    if n in PARAM_ALIASES:
        return PARAM_ALIASES[n]
    for k, v in PARAM_ALIASES.items():
        if k in n or n in k:
            return v
    return None


def extract_numbers(text: str) -> list[float]:
    text = text.replace(",", ".")
    text = re.sub(r"(\d)\s*[-–—−…]\s*([+\-]?\d)", r"\1 __RANGE__ \2", text)
    found = re.findall(r"[-+]?\d+(?:\.\d+)?", text)
    nums = []
    for f in found:
        try:
            nums.append(float(f))
        except ValueError:
            pass
    return nums


def parse_spec(raw: str) -> SpecValue:
    raw = re.sub(r"\s+", " ", raw.strip())
    nums = extract_numbers(raw)
    unit = ""
    for u in ["кг/л", "г/см³", "г/см3", "кг/м²", "г/м²", "мкм", "мм", "%", "°C", "°С", "лет"]:
        if u.lower() in raw.lower() or u in raw:
            unit = u
            break
    return SpecValue(raw=raw, numbers=nums, unit=unit)


def extract_html_tables(html: str) -> list[list[tuple[str, str]]]:
    tables = []
    for m in re.finditer(r"<table[^>]*>(.*?)</table>", html, re.S | re.I):
        rows = []
        for tr in re.finditer(r"<tr[^>]*>(.*?)</tr>", m.group(1), re.S | re.I):
            cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr.group(1), re.S | re.I)
            cells = [re.sub(r"<[^>]+>", "", c).strip() for c in cells]
            cells = [re.sub(r"\s+", " ", c) for c in cells]
            if len(cells) >= 2 and cells[0].lower() not in ("параметр", "наименование", "показатель"):
                rows.append((cells[0], cells[1]))
        if rows:
            tables.append(rows)
    return tables


def site_specs(page_path: Path) -> dict[str, SpecValue]:
    html = page_path.read_text(encoding="utf-8", errors="replace")
    specs: dict[str, SpecValue] = {}
    for table in extract_html_tables(html):
        for name, value in table:
            key = normalize_param(name)
            if key and key not in specs:
                specs[key] = parse_spec(value)
    return specs


def pdf_text(pdf_path: Path, use_ocr: bool = False) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("ERROR: pip install pdfplumber", file=sys.stderr)
        sys.exit(1)
    chunks = []
    with pdfplumber.open(pdf_path) as doc:
        for pg in doc.pages:
            chunks.append(pg.extract_text() or "")
    text = "\n".join(chunks)
    if use_ocr and len(text.strip()) < 80:
        try:
            from pdf2image import convert_from_path
            import pytesseract
            images = convert_from_path(str(pdf_path), dpi=200)
            text = "\n".join(pytesseract.image_to_string(img, lang="rus+eng") for img in images)
        except Exception as e:
            text += f"\n[OCR failed: {e}]"
    return text


def tds_specs_from_text(text: str) -> dict[str, SpecValue]:
    specs: dict[str, SpecValue] = {}
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    patterns = [
        (r"сухой\s+остаток[^\n%]{0,40}?([\d,.]+\s*±\s*[\d,.]+\s*%|[\d,.]+\s*%|не\s+менее\s+[\d,.]+\s*%|[≈~]?\s*[\d,.]+\s*[-–]\s*[\d,.]+\s*%)", "dry_residue"),
        (r"содержание\s+нелетучих[^\d%]*?([\d,.\s±+\-–—]+\s*%?)", "dry_residue"),
        (r"массовая\s+доля\s+нелетучих[^\d%]*?([\d,.\s±+\-–—]+\s*%?)", "dry_residue"),
        (r"плотность(?:\s+при\s+[+\-]?\d+\s*°\s*[CС])?\s*[:\s]*([\d,.]+\s*(?:±\s*[\d,.]+)?\s*(?:кг/л|г/см[³3]))", "density"),
        (r"толщина\s+сухого\s+слоя[^\d]*?([\d,.\s\-–—]+\s*мкм)", "dft"),
        (r"толщина\s+сухого\s+слоя[^\d]*?([\d,.\s\-–—]+\s*мм)", "dft"),
        (r"рекомендуемая\s+толщина[^\d]*?([\d,.\s\-–—]+\s*(?:мм|мкм)?)", "dft"),
        (r"теоретическ\w*\s+укрывистость[^\d]*?([\d,.\s\-–—]+\s*г/м[²2]?)", "consumption"),
        (r"расход\s+теоретическ[^\d]*?([\d,.\s\-–—]+\s*г/м[²2]?)", "consumption"),
        (r"расход\s+материала[^\d]*?([\d,.\s\-–—]+\s*кг/м[²2]?)", "consumption"),
        (r"температура\s+воздуха[^\n]{0,30}?((?:от\s+)?[−\-]?\d+\s*(?:до|…|-|–|—)\s*[+]?\d+\s*°?\s*[CС]?)", "temp"),
        (r"температура\s+воздуха\s+от\s+([−\-]?\d+\s+до\s+[+]?\d+)", "temp"),
        (r"от\s+([−\-]?\d+\s*°?\s*[CС]?\s+до\s+[+]?\d+\s*°?\s*[CС]?)", "temp"),
        (r"относительная\s+влажность[^\d]*?([\d,.\s\-–—%]{1,20})", "humidity"),
        (r"влажность[^\d]*?(не\s+более\s+\d+\s*%|≤\s*\d+\s*%|от\s+\d+\s+до\s+\d+\s*%)", "humidity"),
        (r"содержание\s+цинка[^\d%]*?([≥>]?\s*\d+\s*%?)", "zinc"),
        (r"уровень\s+глянца[:\s]+([^\n,]{3,40})", "gloss"),
        (r"цвет[а]?[:\s]+([^\n,]{3,40})", "color"),
        (r"срок\s+службы(?:\s+покрытия)?[^\d]*?([\d,.\s\-–—]+\s*лет)", "service_life"),
        (r"упаковка[:\s]+([^\n]{5,50})", "packaging"),
        (r"евроведро\s+([\d,.\s\-–—]+\s*кг)", "packaging"),
    ]
    full_n = "\n".join(lines).replace("оС", "°C").replace("о С", "°C")
    for pat, key in patterns:
        if key in specs:
            continue
        m = re.search(pat, full_n, re.I)
        if m:
            specs[key] = parse_spec(m.group(1).strip())
    for ln in lines:
        low = ln.lower().replace("ё", "е")
        for alias, key in PARAM_ALIASES.items():
            if key in specs:
                continue
            if low.startswith(alias) or re.match(rf"^{re.escape(alias)}\s*[:：]", low):
                rest = re.split(r"[:：]", ln, maxsplit=1)
                val = rest[1].strip() if len(rest) > 1 else ln[len(alias):].strip()
                if val and len(val) < 80:
                    specs[key] = parse_spec(val)
    return specs


def numbers_compatible(a: list[float], b: list[float], rel_tol: float = 0.08, abs_tol: float = 0.15) -> bool:
    if not a or not b:
        return False
    a_min, a_max = min(a), max(a)
    b_min, b_max = min(b), max(b)
    if a_max < b_min - abs_tol or b_max < a_min - abs_tol:
        if len(a) == 1 and len(b) == 1:
            return abs(a[0] - b[0]) <= max(abs_tol, rel_tol * max(abs(a[0]), abs(b[0]), 1e-6))
        return False
    ok_min = abs(a_min - b_min) <= max(abs_tol, rel_tol * max(abs(a_min), abs(b_min), 1e-6)) or (
        a_min >= b_min - abs_tol and a_min <= b_max + abs_tol
    )
    ok_max = abs(a_max - b_max) <= max(abs_tol, rel_tol * max(abs(a_max), abs(b_max), 1e-6)) or (
        a_max >= b_min - abs_tol and a_max <= b_max + abs_tol
    )
    return ok_min or ok_max or (a_min >= b_min - abs_tol and a_max <= b_max + abs_tol)


def compare_specs(page: str, site: dict[str, SpecValue], tds: dict[str, SpecValue]) -> list[Finding]:
    findings: list[Finding] = []
    priority = ["dry_residue", "density", "dft", "consumption", "temp", "humidity", "zinc", "color"]
    all_keys = set(site) | set(tds)
    ordered = [k for k in priority if k in all_keys] + sorted(all_keys - set(priority))
    for key in ordered:
        s, t = site.get(key), tds.get(key)
        if s and t:
            if s.numbers and t.numbers:
                if numbers_compatible(s.numbers, t.numbers):
                    status, detail = "OK", "числа совместимы"
                else:
                    status, detail = "FAIL", f"числа: сайт {s.numbers} vs TDS {t.numbers}"
            else:
                s_norm = re.sub(r"\s+", " ", s.raw.lower())
                t_norm = re.sub(r"\s+", " ", t.raw.lower())
                if s_norm in t_norm or t_norm in s_norm or s_norm == t_norm:
                    status, detail = "OK", "текст совпадает"
                else:
                    status, detail = "WARN", "текст различается (проверьте вручную)"
            findings.append(Finding(page, key, s.raw, t.raw, status, detail))
        elif s and not t:
            findings.append(Finding(page, key, s.raw, "—", "MISSING_TDS", "в TDS не найдено (или PDF-скан)"))
        elif t and not s and key in priority:
            findings.append(Finding(page, key, "—", t.raw, "MISSING_SITE", "есть в TDS, нет на сайте"))
    return findings


def status_icon(st: str) -> str:
    return {"OK": "✓", "WARN": "⚠", "FAIL": "✗", "MISSING_TDS": "?", "MISSING_SITE": "○", "SKIP": "·"}.get(st, st)


def main() -> int:
    ap = argparse.ArgumentParser(description="Сверка таблиц страниц с TDS PDF")
    ap.add_argument("--ocr", action="store_true", help="OCR для сканированных PDF")
    ap.add_argument("--json", type=str, help="Сохранить отчёт в JSON")
    ap.add_argument("--only", type=str, help="Только одна страница, напр. blank/one.html")
    ap.add_argument("--root", type=str, default=str(ROOT), help="Корень репозитория")
    args = ap.parse_args()
    root = Path(args.root)
    pages = PAGE_TO_TDS
    if args.only:
        key = args.only.lstrip("./")
        if key not in pages:
            print(f"Неизвестная страница: {key}", file=sys.stderr)
            print("Доступные:", ", ".join(pages), file=sys.stderr)
            return 2
        pages = {key: pages[key]}
    all_findings: list[Finding] = []
    print(f"Корень: {root}")
    print(f"Страниц: {len(pages)} | OCR: {args.ocr}\n")
    for page_rel, pdf_rel in pages.items():
        page_path, pdf_path = root / page_rel, root / pdf_rel
        print(f"── {page_rel}")
        if not page_path.exists():
            print(f"   ✗ страница не найдена")
            continue
        if not pdf_path.exists():
            print(f"   ✗ PDF не найден: {pdf_rel}")
            all_findings.append(Finding(page_rel, "*", "—", pdf_rel, "FAIL", "PDF отсутствует"))
            continue
        site = site_specs(page_path)
        text = pdf_text(pdf_path, use_ocr=args.ocr)
        scanned = len(text.strip()) < 80
        tds = tds_specs_from_text(text)
        if scanned and not args.ocr:
            print(f"   ? PDF похож на скан — запустите с --ocr")
        print(f"   сайт: {list(site.keys())} | TDS: {list(tds.keys())}")
        findings = compare_specs(page_rel, site, tds)
        all_findings.extend(findings)
        for f in findings:
            print(f"   {status_icon(f.status)} {f.param}: сайт=[{f.site_value}] TDS=[{f.tds_value}] — {f.detail}")
        if not findings:
            print("   · нет пересекающихся параметров для сравнения")
        print()
    counts = {}
    for f in all_findings:
        counts[f.status] = counts.get(f.status, 0) + 1
    print("=" * 60)
    print("ИТОГО:")
    for st in ("OK", "WARN", "FAIL", "MISSING_TDS", "MISSING_SITE"):
        if st in counts:
            print(f"  {status_icon(st)} {st}: {counts[st]}")
    fails = counts.get("FAIL", 0)
    print("=" * 60)
    if args.json:
        out = {"summary": counts, "findings": [asdict(f) for f in all_findings]}
        Path(args.json).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"JSON: {args.json}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
