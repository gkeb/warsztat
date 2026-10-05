---
name: badanie
description: Odpowiada na pytanie faktograficzne (jak działa biblioteka, API, limit, standard) na podstawie źródeł pierwotnych i zapisuje wynik z cytatami w .ai/badania/. Użyj dla otwartego pytania [badanie], przed decyzją lub ADR, albo gdy użytkownik prosi o sprawdzenie działania lub limitów. Może pracować w tle jako subagent.
argument-hint: "[pytanie]"
---

# Badanie

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`, szczególnie sekcję `## Subagenci i modele`. Instrukcje wykonawcy leżą obok: `badacz.md`. Szablon wyniku: `../../szablony/badanie.md`. Pytanie weź z wywołania skilla albo z bieżącej wiadomości.

Badanie nie pisze kodu produkcyjnego i nie podejmuje decyzji. Dostarcza fakty, a decyzja zapada w `pomysl`, `decyzja` albo `spec`.

## 1. Doprecyzuj pytanie

- Jedno pytanie, na które da się odpowiedzieć faktami. Z „którą bibliotekę wybrać?” robisz „czy X i Y obsługują A, B, C, i z jakimi ograniczeniami?”.
- Ustal kontekst projektu: używaną wersję biblioteki (lockfile, `package.json`, `pyproject.toml`), środowisko uruchomieniowe, powiązaną zdolność albo ADR.
- Sprawdź `.ai/badania/`. Jeśli jest aktualne badanie na ten temat, pokaż je i zapytaj, czy wystarczy.

## 2. Zleć badanie

- Plik wyniku: `.ai/badania/RRRR-MM-DD-slug.md`.
- Jeśli możesz, uruchom subagenta **w tle**: w Claude Code `badacz` z tego pluginu, w innym agencie subagent z pełną ścieżką do `badacz.md`. Model wybierz według kontraktu (`modele.<agent>.badanie`). Przekaż: pytanie, kontekst z kroku 1 i ścieżkę pliku wyniku.
- Bez subagenta wykonaj `badacz.md` sam.
- W tle użytkownik może rozmawiać dalej, np. w `pomysl`. Gdy wynik przyjdzie, wróć do kroku 3.

## 3. Sprawdź wynik i podepnij

- Przejrzyj plik: czy każde twierdzenie ma źródło i czy odpowiedź rzeczywiście odpowiada na pytanie. Wątpliwe twierdzenia sprawdź w źródle.
- Podepnij wynik tam, skąd przyszło pytanie:
  - pytanie z mapy → przenieś je do `## Decyzje` albo zostaw otwarte z linkiem do badania, jeśli decyzja wymaga jeszcze rozmowy;
  - pytanie z `decyzja` → link w sekcji „Kontekst” ADR.
- Badanie potwierdza, że podejście nie zadziała (np. biblioteka nie obsługuje przypadku) → wpis `nie-dziala` w `.ai/proby.md` z linkiem do badania.
- Podsumuj użytkownikowi odpowiedź w 2–4 zdaniach, z niepewnościami.
