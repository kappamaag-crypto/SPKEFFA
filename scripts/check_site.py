#!/usr/bin/env python3
"""Быстрая offline QA-проверка статического сайта. Только стандартная библиотека."""
from __future__ import annotations

import json
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HOST = "spk-effa.ru"
BASE = "https://" + HOST


def target_of(page: Path, url: str) -> Path | None:
    """Разрешить только внутренние HTTP(S) и относительные ссылки."""
    url = url.strip()
    if not url or url.startswith("#"):
        return None
    u = urlsplit(url)
    if u.scheme and u.scheme not in ("http", "https"):
        return None
    if u.netloc and u.netloc.lower() != HOST:
        return None
    if not u.path:
        return None
    path = unquote(u.path)
    if path.startswith("/"):
        rel = path.lstrip("/")
    else:
        rel = posixpath.join(page.parent.relative_to(ROOT).as_posix(), path)
    rel = posixpath.normpath(rel)
    if rel in ("", "."):
        rel = "index.html"
    if path.endswith("/"):
        rel = rel.rstrip("/") + "/index.html"
    out = (ROOT / rel).resolve()
    if not out.is_relative_to(ROOT):
        raise ValueError("Ссылка выходит за пределы сайта: " + url)
    return out


def canonical_of(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return BASE + "/"
    if rel.endswith("/index.html"):
        return BASE + "/" + rel.removesuffix("index.html")
    return BASE + "/" + rel


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs: list[str] = []
        self.canonical: list[str] = []
        self.meta: dict[str, str] = {}
        self.title = ""
        self.h1 = 0
        self.images = 0
        self.missing_alt = 0
        self.pdfs: list[str] = []
        self.consent = False
        self.forms = 0
        self.jsonld: list[str] = []
        self._script_json = False
        self._script_parts: list[str] = []
        self._title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self._title = True
        if tag == "img":
            self.images += 1
            if "alt" not in attrs:
                self.missing_alt += 1
        if tag == "form":
            self.forms += 1
        if tag == "input" and attrs.get("name") == "privacy_consent":
            self.consent = "required" in attrs and attrs.get("type") == "checkbox"
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._script_json = True
            self._script_parts = []
        if tag == "meta":
            k = attrs.get("name") or attrs.get("property")
            if k:
                self.meta[k.lower()] = attrs.get("content", "")
        if tag == "link" and "canonical" in (attrs.get("rel") or "").split():
            self.canonical.append(attrs.get("href", ""))
        for attr in ("href", "src"):
            if attrs.get(attr):
                value = attrs[attr]
                self.refs.append(value)
                if value.lower().split("?")[0].endswith(".pdf"):
                    self.pdfs.append(value)

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False
        if tag == "script" and self._script_json:
            self.jsonld.append("".join(self._script_parts))
            self._script_json = False

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._script_json:
            self._script_parts.append(data)


def run() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    def fail(where: str, detail: str) -> None:
        errors.append(f"{where}: {detail}")

    pages = sorted(ROOT.rglob("*.html"))
    indexable: set[str] = set()
    pdf_pages: set[str] = set()
    ref_count = 0
    for page in pages:
        rel = page.relative_to(ROOT).as_posix()
        parser = PageParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
            parser.close()
        except Exception as exc:
            fail(rel, "HTML не разобран: " + str(exc))
            continue

        noindex = "noindex" in parser.meta.get("robots", "").lower()
        if not noindex:
            indexable.add(canonical_of(page))
            if not parser.title.strip():
                fail(rel, "нет title")
            if not parser.meta.get("description", "").strip():
                fail(rel, "нет meta description")
            if parser.h1 != 1:
                fail(rel, f"h1: ожидается 1, найдено {parser.h1}")
            if parser.canonical != [canonical_of(page)]:
                fail(rel, f"canonical: {parser.canonical!r}; ожидается {canonical_of(page)}")
            if parser.meta.get("og:url", canonical_of(page)) != canonical_of(page):
                fail(rel, "og:url не совпадает с canonical")
            if parser.meta.get("og:title", "") == "":
                fail(rel, "нет og:title")
            if parser.meta.get("og:description", "") == "":
                fail(rel, "нет og:description")
        if parser.missing_alt:
            fail(rel, f"изображений без alt: {parser.missing_alt}")
        if parser.pdfs:
            pdf_pages.add(rel)
        if rel == "raschet.html" and (parser.forms != 1 or not parser.consent):
            fail(rel, "форма должна иметь обязательный HTML checkbox privacy_consent")
        for block in parser.jsonld:
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                fail(rel, "ошибка JSON-LD: " + str(exc))
        for ref in parser.refs:
            try:
                target = target_of(page, ref)
            except ValueError as exc:
                fail(rel, str(exc))
                continue
            if target is not None:
                ref_count += 1
                if not target.is_file():
                    fail(rel, f"не существует: {ref}")

        image = parser.meta.get("og:image", "")
        if image:
            target = target_of(page, image)
            if target is not None and not target.is_file():
                fail(rel, "не существует og:image: " + image)

    try:
        sm = ET.parse(ROOT / "sitemap.xml").getroot()
        sitemap = {n.text.strip() for n in sm.findall("{*}url/{*}loc") if n.text}
        for url in sorted(sitemap):
            target = target_of(ROOT / "index.html", url)
            if target is None or not target.is_file():
                fail("sitemap.xml", "нет файла для " + url)
            elif url != canonical_of(target):
                fail("sitemap.xml", "URL не совпадает с canonical: " + url)
        for url in sorted(indexable - sitemap):
            fail("sitemap.xml", "не добавлена индексируемая страница: " + url)
        for url in sorted(sitemap - indexable):
            fail("sitemap.xml", "в карте нет индексируемой HTML-страницы: " + url)
    except (ET.ParseError, OSError) as exc:
        fail("sitemap.xml", str(exc))

    try:
        im = ET.parse(ROOT / "sitemap-image.xml").getroot()
        image_urls = [n.text.strip() for n in im.findall(".//{*}image/{*}loc") if n.text]
        for url in image_urls:
            target = target_of(ROOT / "index.html", url)
            if target is None or not target.is_file():
                fail("sitemap-image.xml", "отсутствует файл: " + url)
    except (ET.ParseError, OSError) as exc:
        fail("sitemap-image.xml", str(exc))
        image_urls = []

    try:
        from verify_tds import PAGE_TO_TDS
        mapped = set(PAGE_TO_TDS)
        for page in sorted(pdf_pages - mapped):
            fail("verify_tds.py", "карточка с PDF не включена: " + page)
        for page in sorted(mapped - pdf_pages):
            fail("verify_tds.py", "в карте нет PDF-ссылки на странице: " + page)
        for page, document in PAGE_TO_TDS.items():
            if not (ROOT / page).is_file():
                fail("verify_tds.py", "нет страницы: " + page)
            if not (ROOT / document).is_file():
                fail("verify_tds.py", "нет паспорта: " + document)
    except ImportError as exc:
        fail("verify_tds.py", "не удалось импортировать карту паспортов: " + str(exc))

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    for name in ("sitemap.xml", "sitemap-image.xml"):
        if f"Sitemap: {BASE}/{name}" not in robots:
            fail("robots.txt", "не указан " + name)

    print(f"HTML: {len(pages)} | индексируемых: {len(indexable)} | URL sitemap: {len(sitemap) if 'sitemap' in locals() else '?'}")
    print(f"Ссылок на внутренние ресурсы: {ref_count} | картинок image-sitemap: {len(image_urls)}")
    for item in warnings:
        print("WARN:", item)
    for item in errors:
        print("FAIL:", item)
    print(f"ИТОГ: {len(errors)} ошибок")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(run())
