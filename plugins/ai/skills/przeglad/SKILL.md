---
name: przeglad
description: Niezależny przegląd zmian przez dwóch recenzentów — zgodność z ticketem, specem, ADR i słownikiem oraz jakość kodu — najlepiej jako subagenci na tańszym modelu. Weryfikuje ich uwagi i zwraca listę od najpoważniejszej. Użyj po walidacji ticketu, po naprawie, przy zamykaniu zdolności albo na prośbę o review. Sam niczego nie poprawia.
argument-hint: "[slug | slug#NN]"
---

# Przegląd zmian

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`, szczególnie sekcję `## Subagenci i modele`. Instrukcje recenzentów leżą obok tego pliku: `recenzent-zgodnosci.md` i `recenzent-jakosci.md`.

Przegląd niczego nie zmienia w kodzie. Wynikiem jest lista uwag, a o poprawkach decyduje skill, który go wywołał, albo użytkownik.

## 1. Ustal zakres

Z wywołania albo z kontekstu:

| Tryb | Diff | Kontekst zgodności |
| --- | --- | --- |
| bieżące zmiany (domyślnie) | `git diff HEAD` plus nowe, nieśledzone pliki | ticket `w-toku`, jeśli jest, i jego spec |
| `slug#NN` | commity z prefiksem `slug#NN:` (`git log --grep`) albo bieżące zmiany, jeśli ticket nie ma jeszcze commita | ten ticket i spec zdolności |
| `slug` | wszystkie commity z prefiksem `slug#` | wszystkie tickety i cały spec zdolności |

Zbierz ścieżki: ticket(y), `spec.md`, `mapa.md` (linia `Rodzaj:`), `.ai/SLOWNIK.md`, `.ai/ZASADY.md`, katalog decyzji (`sciezki.decyzje` z `.ai/warsztat.json`), `.ai/obszary/` dotkniętych obszarów, `AGENTS.md`, `.ai/lekcje.md`, `.ai/warsztat.json` oraz pliki profili projektu (`warsztat.json` → `profile`) z `../../profile/` — pełne ścieżki, bo recenzent nie zna katalogu pluginu. Pusty diff → powiedz to i zakończ.

## 2. Uruchom recenzentów

Dwaj recenzenci pracują niezależnie od siebie i od Ciebie. Jeśli możesz, uruchom ich równolegle:

- **Zgodność** — rola `recenzent-zgodnosci`. W Claude Code subagent `recenzent-zgodnosci` z tego pluginu.
- **Jakość** — rola `recenzent-jakosci`. W Claude Code subagent `recenzent-jakosci`.

W innym agencie uruchom subagenta z pełną ścieżką do pliku roli. Model wybierz według `## Subagenci i modele` w kontrakcie (`modele.<agent>.przeglad` w `.ai/warsztat.json`).

Każdemu przekaż tylko fakty: komendę diffu, listę ścieżek z kroku 1, numer ticketu i rodzaj zdolności. Nie przekazuj streszczenia rozmowy ani swojej opinii o zmianach.

Bez możliwości uruchomienia subagentów wykonaj obie role sam, po kolei, i zaznacz w raporcie „przegląd nieniezależny”.

## 3. Zweryfikuj

Każdą uwagę sprawdź w kodzie. Odrzuć te, które się nie potwierdzają albo dotyczą kodu spoza diffu, z wyjątkiem sytuacji, gdy diff go psuje. Połącz duplikaty z obu przeglądów.

Uwagę blokującą, która wynika z fałszywego założenia autora (np. „funkcja X zwraca posortowane”, „usługa doręcza raz”), a nie z pomyłki w pisaniu, oznacz `[założenie]` i nazwij to założenie. Skill, który ją poprawia, zapisuje lekcję.

## 4. Raport

```text
Przegląd: <zakres> — recenzenci: niezależni | nieniezależny

Blokujące
  1. plik:linia — co jest nie tak — dlaczego (kryterium / ADR / błąd) — propozycja
Warto poprawić
  …
Drobne
  …
Kryteria akceptacji: spełnione N/M (niespełnione: …; bez testu: …)
```

Brak uwag to też wynik — napisz „bez uwag” i nie dopisuj uwag na siłę.

Wywołany przez `buduj` albo `napraw` — oddaj raport; poprawki i lekcje z uwag `[założenie]` robi wywołujący skill. Wywołany samodzielnie — zapytaj, które uwagi poprawić; po poprawce uwagi `[założenie]` zapisz lekcję w `.ai/lekcje.md` (wykrył: `przegląd`).
