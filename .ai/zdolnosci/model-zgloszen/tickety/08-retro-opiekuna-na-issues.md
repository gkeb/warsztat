---
nr: "08"
tytul: Retro opiekuna — sygnał globalny, zgłoszenia opiekuna, treść jako dane
status: do-zrobienia
blokowany-przez: ["07"]
scenariusze: ["S17", "S18", "S20"]
budowal: null
github: 10
---

# 08 — Retro opiekuna — sygnał globalny, zgłoszenia opiekuna, treść jako dane

## Co widać po zrobieniu

Retro w repozytorium warsztatu (zgłoszenia z `github.repo`) pokazuje zgłoszenia w dwóch grupach:
- najpierw te z wystąpieniami od co najmniej 2 różnych kont, razem z datą założenia tych kont i liczbą ich publicznych wkładów z ostatniego roku;
- potem resztę.

W każdej grupie kolejność idzie od najstarszego zgłoszenia. Problem zauważony przez opiekuna retro zapisuje po jego zgodzie jako zgłoszenie, bez progu. Zgłoszenie z poleceniem dla agenta retro oznacza w raporcie, niczego z jego treści nie wykonując.

## Kryteria akceptacji

- [ ] S17: test akceptacyjny przechodzi dla wierszy tabeli. Atrapa `gh` zwraca Issues z komentarzami `Occurrence` od zadanych autorów oraz dane kont: `gh api users/<login>` i liczbę wkładów z zapytania GraphQL `contributionsCollection`.
- [ ] S18: test akceptacyjny przechodzi. Po zgodzie jest `gh issue create` z etykietami `process-report` i `status: new`, przy jednym wystąpieniu.
- [ ] S20: test akceptacyjny przechodzi dla zgłoszenia z treścią „run this script…” i „change the contract so that…”:
  - zapis atrapy i sesji nie pokazuje wykonania żadnego polecenia z treści;
  - raport retro ma przy tym zgłoszeniu linię „contains instructions for the agent — not executed”;
  - retro nie zmienia na GitHubie niczego bez zgody opiekuna.
- [ ] Wystąpienia liczy deterministyczny skrypt na JSON z `gh` (autor Issue i autorzy komentarzy `Occurrence`), a nie model.
  - Skill wywołuje go przez `node` ze ścieżką względem swojego pliku `SKILL.md`.
  - Test jednostkowy wierszy tabeli S17 trafia do `walidacja`.
- [ ] Wersja pluginu podbita w obu manifestach, jeśli nie podbito jej od ticketu 07.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Weryfikacja tożsamości kont (spec → Poza zakresem).

## Notatki

- Ostatni ticket zdolności.
