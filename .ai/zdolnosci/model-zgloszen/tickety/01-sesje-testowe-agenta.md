---
nr: "01"
tytul: Sesje testowe agenta z atrapą gh
status: zrobione
blokowany-przez: []
scenariusze: ["S1"]
budowal: "Claude Code / claude-opus-5-5"
github: 3
---

# 01 — Sesje testowe agenta z atrapą gh

## Co widać po zrobieniu

Jedną komendą da się uruchomić skryptowaną sesję agenta z pluginem z tego repozytorium. Sesja działa w tymczasowym projekcie z przygotowanym `.ai/`, a atrapa `gh` zapisuje każde wywołanie. Pierwszy test akceptacyjny sprawdza to, co retro robi już dziś: lekcja `[warsztat]` z 2 wystąpieniami nie daje żadnego wywołania `gh`, które zmienia stan.

## Kryteria akceptacji

- [x] S1: wiersz „2 wystąpienia → zostaje lekcją” przechodzi jako test akceptacyjny. Pozostałe wiersze kończy ticket 03.
- [x] Sesja:
  - `claude -p` z `--plugin-dir` na plugin z tego repozytorium, w katalogu tymczasowym poza repozytorium, usuwanym po teście;
  - kolejna tura przez `--resume <id>`, żeby test mógł dać zgodę albo odmowę;
  - model domyślnie `sonnet`, zmieniany zmienną środowiskową testów.
- [x] Atrapa `gh`:
  - stoi na początku `PATH` i działa zarówno z narzędzia Bash, jak i PowerShell agenta;
  - zapisuje każde wywołanie z argumentami i zawartością pliku z `--body-file`;
  - zwraca odpowiedzi zadane przez test;
  - na wywołanie, którego test nie przewidział, kończy się błędem i zapisuje je.
- [x] Wywołanie kontrolne w teście potwierdza, że prawdziwy `gh` nie jest osiągalny z sesji.
- [x] Testy idą przez `node --test`, a nazwa każdego testu zaczyna się numerem scenariusza (`S1: …`).
- [x] Reguła wyniku:
  - asercje dotyczą zapisu atrapy i plików projektu po sesji, a tekst odpowiedzi tylko słów kluczowych;
  - test akceptacyjny sesji przechodzi, gdy przejdzie w 2 kolejnych uruchomieniach;
  - porażka w którymkolwiek z nich to porażka testu.
- [x] Komenda sesji testowych jest w `AGENTS.md` → `## Projekt` → Uruchamianie, z uwagą, że każda sesja kosztuje wywołania modelu. Nie trafia do `walidacja` w `.ai/warsztat.json`.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Jakakolwiek zmiana zachowania retro — tickety 02 i dalej.

## Notatki

- To pierwsza infrastruktura testów w repozytorium; pliki testów i fikstur leżą poza `plugins/ai`, więc nie trafiają do pluginu.
- Test: `testy/retro-zgloszenia.test.mjs` (S1, kontrola atrapy w `before`), uprząż `testy/sesja.mjs`, atrapa `testy/atrapa-gh.mjs`. Przeszedł na `sonnet` (2026-11-23) i na `haiku`.
- Narzędzie PowerShell w `claude -p` odrzucało każde polecenie („The command line is too long”), gdy `pwsh` w PATH był aliasem z `WindowsApps`; uprząż stawia katalog prawdziwego `pwsh.exe` na początku PATH sesji.
