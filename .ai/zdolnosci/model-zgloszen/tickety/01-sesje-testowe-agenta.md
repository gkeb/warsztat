---
nr: "01"
tytul: Sesje testowe agenta z atrapą gh
status: do-zrobienia
blokowany-przez: []
scenariusze: ["S1"]
budowal: null
github: 3
---

# 01 — Sesje testowe agenta z atrapą gh

## Co widać po zrobieniu

Jedną komendą da się uruchomić skryptowaną sesję agenta z pluginem z tego repozytorium. Sesja działa w tymczasowym projekcie z przygotowanym `.ai/`, a atrapa `gh` zapisuje każde wywołanie. Pierwszy test akceptacyjny sprawdza to, co retro robi już dziś: lekcja `[warsztat]` z 2 wystąpieniami nie daje żadnego wywołania `gh`, które zmienia stan.

## Kryteria akceptacji

- [ ] S1: wiersz „2 wystąpienia → zostaje lekcją” przechodzi jako test akceptacyjny. Pozostałe wiersze kończy ticket 03.
- [ ] Sesja:
  - `claude -p` z `--plugin-dir` na plugin z tego repozytorium, w katalogu tymczasowym poza repozytorium, usuwanym po teście;
  - kolejna tura przez `--resume <id>`, żeby test mógł dać zgodę albo odmowę;
  - model domyślnie `sonnet`, zmieniany zmienną środowiskową testów.
- [ ] Atrapa `gh`:
  - stoi na początku `PATH` i działa zarówno z narzędzia Bash, jak i PowerShell agenta;
  - zapisuje każde wywołanie z argumentami i zawartością pliku z `--body-file`;
  - zwraca odpowiedzi zadane przez test;
  - na wywołanie, którego test nie przewidział, kończy się błędem i zapisuje je.
- [ ] Wywołanie kontrolne w teście potwierdza, że prawdziwy `gh` nie jest osiągalny z sesji.
- [ ] Testy idą przez `node --test`, a nazwa każdego testu zaczyna się numerem scenariusza (`S1: …`).
- [ ] Reguła wyniku:
  - asercje dotyczą zapisu atrapy i plików projektu po sesji, a tekst odpowiedzi tylko słów kluczowych;
  - test akceptacyjny sesji przechodzi, gdy przejdzie w 2 kolejnych uruchomieniach;
  - porażka w którymkolwiek z nich to porażka testu.
- [ ] Komenda sesji testowych jest w `AGENTS.md` → `## Projekt` → Uruchamianie, z uwagą, że każda sesja kosztuje wywołania modelu. Nie trafia do `walidacja` w `.ai/warsztat.json`.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Jakakolwiek zmiana zachowania retro — tickety 02 i dalej.

## Notatki

- To pierwsza infrastruktura testów w repozytorium; pliki testów i fikstur leżą poza `plugins/ai`, więc nie trafiają do pluginu.
