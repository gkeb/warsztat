---
title: Rodzina marketing — ustalenia wstępne
created: 2026-10-20
description: Wstępne ustalenia i propozycje dla drugiej rodziny pluginów (marketing), jako wejście dla skill pomysl w trybie z pliku. Oparte na zasadach z zasady-rodzin.md.
---

# Rodzina marketing — ustalenia wstępne

Punkt wyjścia do zaprojektowania drugiej rodziny pluginów obok warsztatu. Kroki i rdzeń zasad: [zasady-rodzin.md](zasady-rodzin.md). Plik rozróżnia **ustalone** (zdecydował człowiek), **propozycje** (do potwierdzenia) i **otwarte pytania**.

## Cel

Plugin, który obsługuje marketing stron i produktów budowanych warsztatem: SEO/GEO, teksty, wpisy powiązane z social, kampanie, monitorowanie ruchu. Współpracuje z warsztatem przez stan w plikach, ale działa też bez niego.

## Realne przypadki

1. **Domy na wynajem — redesign.** Migracja z WordPressa na Astro. Potrzeba na już: spis istniejących treści, zachowanie pozycji w wyszukiwarce (mapa starych adresów na nowe, przekierowania, meta), przeniesienie i poprawa tekstów.
2. **Strona fotografa — od zera.** Całość w Astro. Treść tworzona od podstaw: teksty, zdjęcia, głos marki, wpisy.

Pierwsze komendy mają wynikać z tych dwóch przypadków.

## Ustalone

- **Zakres:** SEO w całości, w tym podejście do wyszukiwania przez AI (GEO); teksty; wpisy na stronie powiązane z social; monitorowanie ruchu.
- **Wiedza domeny:** pozycjonowanie i obietnica produktu, persony, głos marki, treści, kalendarz publikacji, wyniki. Pozycjonowanie, persony i głos zmienia człowiek — to poziom „prawdy”.
- **Inicjacja:** własny start, który w repozytorium projektu (tam, gdzie jest kod i `.ai/`) zakłada katalog marketingu.
- **Rytm:** kampania i cykl wydawniczy mogą iść obok siebie.
- **Publikacja:** na początku bez automatu. Agent przygotowuje materiał, publikacja jest decyzją człowieka.
- **Komendy:** nie mogą mylić się przy wykonaniu — ani z sobą, ani z komendami warsztatu.

## Propozycje do potwierdzenia

### Podział SEO/GEO

- **Marketing:** strategia i treść — słowa kluczowe, tytuły i opisy meta, treść danych strukturalnych (FAQ, opis usługi), teksty pisane pod cytowanie przez modele AI.
- **Warsztat:** mechanizm — generowanie sitemap, `robots.txt`, `llms.txt`, komponenty renderujące schema.org, przekierowania.
- Pola meta jako frontmatter plików treści, pilnowane przez schemat kolekcji.

Rozjazd: przykład w [zasady-rodzin.md](zasady-rodzin.md) („Jak powstaje nowa rodzina”, krok 1) przypisuje całe techniczne SEO warsztatowi. Po potwierdzeniu podziału przykład trzeba poprawić.

### Wpisy i social

Źródłem jest wpis na stronie. Posty w social to pochodne z odnośnikiem do wpisu, nie osobne treści.

### Monitorowanie ruchu

Wybór narzędzia (np. GA4, Plausible, Search Console) to decyzja trudna do odwrócenia — ADR. Osadzenie skryptu robi warsztat, raporty czyta marketing. Dane z analityki pochodzą z zewnątrz i mogą zawierać dane osobowe — podlegają zasadzie 12.

### Rytm i kroki

Kalendarz publikacji to oś czasu, kampania to cel z okresem trwania. Jeden rodzaj kroku — treść w drodze do publikacji — z opcjonalnym przypisaniem do kampanii.

### Granice z warsztatem

| Ścieżka / informacja | Właściciel | Druga rodzina |
|---|---|---|
| `.ai/marketing/` — pozycjonowanie, persony, głos, kalendarz, kampanie | marketing | warsztat czyta |
| `src/content/**` — teksty, wpisy, pola SEO | marketing | warsztat czyta |
| `content.config.ts` — schemat kolekcji | warsztat | marketing zgłasza potrzebę zmiany |
| komponenty, layouty, sitemap, robots, `llms.txt`, przekierowania, skrypt analityki | warsztat | marketing zgłasza wymagania |
| spec, słownik, roadmapa w `.ai/` | warsztat | marketing czyta |

Schemat kolekcji jest umową między rodzinami: treść niezgodna ze schematem nie przejdzie builda.

### Nazwy komend

Inne nazwy niż w warsztacie (bez drugiego `badanie` czy `pomysl`). Każdy opis wywołania wskazuje wprost, z którą komendą warsztatu się nie mylić. Przedrostek pluginu chroni przy ręcznym wywołaniu; opis chroni przy wyborze przez model.

## Otwarte pytania

- **Zdjęcia** (szczególnie strona fotografa): czy wybór, kolejność i podpisy `alt` należą do marketingu, a optymalizacja (`astro:assets`) do warsztatu? Gdzie leżą pliki i kto jest ich właścicielem?
- **Narzędzie analityki:** które, i czy jedno dla obu projektów. `[badanie]` przed ADR.
- **GEO:** co konkretnie obejmuje i jakie są źródła pierwotne — praktyki wyszukiwarek AI szybko się zmieniają. `[badanie]`.
- **Migracja z WordPressa:** kto robi spis treści i mapę adresów — marketing (treść, priorytety SEO) czy warsztat (eksport, przekierowania), i jak dzielą pracę.
- **Social:** które platformy i czy plugin przygotowuje tylko tekst, czy także format (długość, grafika, hashtagi).
- **Przepisy:** RODO przy formularzach i mailingu, oznaczanie treści reklamowych. `[badanie]`.
- **Stan ponad projektem:** czy głos marki albo wspólne zasady SEO mają kiedyś żyć poza repo pojedynczej strony. Na razie: wszystko w repo projektu.
- **Pierwsze 2–3 komendy:** wynikają z przypadków — kandydaci: start marketingu w projekcie, spis treści i plan SEO przy migracji, pisanie treści z niezależną oceną względem pozycjonowania i person.
