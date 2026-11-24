#!/usr/bin/env python3
"""Static invariants for the site-wide visual refinement."""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REFINEMENT_HREF = "/css/refinement-2026.css"
SERVICE_FILE = ROOT / "yandex_263ea89542f6f9ea.html"
FORBIDDEN_LINK_GLYPHS = ("📄", "✉", "↗", "↓")

EXPECTED_H2 = {
    "index.html": [
        "О компании",
        "Антикоррозионные материалы",
        "Огнезащита",
        "Наливные полы",
        "Частые вопросы",
        "Онлайн-калькулятор раскроя металлопроката",
        "Путевой лист — маршруты и учёт топлива",
        "Контакты",
    ],
    "blank/universal.html": [
        "Назначение",
        "Технические характеристики",
        "Условия нанесения",
        "Технология нанесения",
        "Референс",
        "Документация",
        "Нужен расчёт?",
        "Частые вопросы",
    ],
    "ognezaschita/effa-ep-150.html": [
        "Назначение",
        "Технические характеристики",
        "Условия нанесения",
        "Технология нанесения",
        "Референс",
        "Документация",
        "Нужен расчёт?",
        "Частые вопросы",
    ],
}


def visible_text(fragment: str) -> str:
    without_tags = re.sub(r"<[^>]+>", " ", fragment)
    return " ".join(html.unescape(without_tags).split())


def h2_sequence(source: str) -> list[str]:
    return [
        visible_text(match.group(1))
        for match in re.finditer(r"<h2\b[^>]*>(.*?)</h2>", source, re.I | re.S)
    ]


def stylesheet_hrefs(source: str) -> list[str]:
    return [
        match.group(1)
        for match in re.finditer(
            r'<link\b(?=[^>]*\brel=["\']stylesheet["\'])[^>]*\bhref=["\']([^"\']+)["\'][^>]*>',
            source,
            re.I,
        )
    ]


def relative_luminance(hex_color: str) -> float:
    channels = [int(hex_color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        value / 12.92
        if value <= 0.04045
        else ((value + 0.055) / 1.055) ** 2.4
        for value in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    light, dark = sorted(
        (relative_luminance(first), relative_luminance(second)), reverse=True
    )
    return (light + 0.05) / (dark + 0.05)


def ordinary_pages() -> list[Path]:
    pages = []
    for path in sorted(ROOT.rglob("*.html")):
        if path == SERVICE_FILE:
            continue
        source = path.read_text(encoding="utf-8")
        if re.search(r'http-equiv=["\']refresh["\']', source, re.I):
            continue
        pages.append(path)
    return pages


def check() -> list[str]:
    errors: list[str] = []
    css_path = ROOT / "css" / "refinement-2026.css"
    if not css_path.exists():
        errors.append("missing css/refinement-2026.css")
    else:
        css = css_path.read_text(encoding="utf-8")
        if "linear-gradient(" in css or "radial-gradient(" in css:
            errors.append("refinement CSS must not use gradients")
        if ":focus-visible" not in css:
            errors.append("refinement CSS must define :focus-visible")
        if "prefers-reduced-motion" not in css:
            errors.append("refinement CSS must support prefers-reduced-motion")
        accent_match = re.search(r"--color-accent:\s*(#[0-9a-f]{6})", css, re.I)
        if not accent_match:
            errors.append("refinement CSS must define --color-accent as a hex color")
        elif contrast_ratio(accent_match.group(1), "#ffffff") < 4.5:
            errors.append("accent buttons must reach WCAG AA contrast against white text")

    pages = ordinary_pages()
    if len(pages) < 35:
        errors.append(f"expected at least 35 ordinary pages, found {len(pages)}")

    for path in pages:
        source = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT).as_posix()
        hrefs = stylesheet_hrefs(source)
        if hrefs.count(REFINEMENT_HREF) != 1:
            errors.append(f"{rel}: refinement stylesheet must appear exactly once")
        elif hrefs[-1] != REFINEMENT_HREF:
            errors.append(f"{rel}: refinement stylesheet must be the last stylesheet")

        for anchor in re.findall(r"<a\b[^>]*>.*?</a>", source, re.I | re.S):
            glyphs = [glyph for glyph in FORBIDDEN_LINK_GLYPHS if glyph in anchor]
            if glyphs:
                errors.append(f"{rel}: link contains generated-looking glyphs {glyphs}")
                break
        if re.search(r'<span\s+aria-hidden=["\']true["\']>\s*</span>', source, re.I):
            errors.append(f"{rel}: empty icon span remains after glyph cleanup")

    if SERVICE_FILE.exists():
        service_source = SERVICE_FILE.read_text(encoding="utf-8")
        if REFINEMENT_HREF in service_source:
            errors.append("Yandex verification file must stay untouched")

    for rel, expected in EXPECTED_H2.items():
        path = ROOT / rel
        if not path.exists():
            errors.append(f"missing structural reference page: {rel}")
            continue
        actual = h2_sequence(path.read_text(encoding="utf-8"))
        if actual != expected:
            errors.append(f"{rel}: h2 order changed: {actual!r}")

    home = (ROOT / "index.html").read_text(encoding="utf-8")
    for marker in ('class="faq-list"', 'class="raskroy-promo"', "putlist-promo"):
        if marker not in home:
            errors.append(f"index.html: missing required block marker {marker}")

    home_faq_answer = (
        "ООО «СПК ЭФФА» — официальный представитель Blank, ЭФФА и Veksa "
        "в Уфе. На сайте собраны материалы, документы производителей и "
        "контакты для запроса поставки."
    )
    if home.count(home_faq_answer) != 2:
        errors.append("index.html: concise company answer must match visible FAQ and JSON-LD")
    if "Прямые поставки, подбор систем, расчёт расхода, техподдержка." in home:
        errors.append("index.html: repeated hero boilerplate is still present")

    reference_answers = {
        "blank/universal.html": (
            "Базовая эпоксидная грунт-эмаль Blank для систем C3–C5. "
            "На объекте её используют самостоятельным слоем либо совместно "
            "с огнезащитой и финишем."
        ),
        "ognezaschita/effa-ep-150.html": (
            "Двухкомпонентный эпоксидный огнезащитный состав для стальных "
            "конструкций, применяемый в системах на R30–R120."
        ),
    }
    for rel, answer in reference_answers.items():
        source = (ROOT / rel).read_text(encoding="utf-8")
        if source.count(answer) != 2:
            errors.append(f"{rel}: concise first FAQ answer must match JSON-LD")
        if "Оставьте заявку на странице «Расчёт»" in source:
            errors.append(f"{rel}: CTA contradicts the no-form contact flow")

    return errors


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    errors = check()
    if errors:
        print("Global refinement: FAIL")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Global refinement: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
