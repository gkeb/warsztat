---
nr: "12"
tytul: Retro opiekuna nadaje etykiety zgłoszeniom czekającym
status: do-zrobienia
blokowany-przez: ["09", "10", "11"]
scenariusze: ["S33", "S15"]
budowal: null
github: 25
---

# 12 — Retro opiekuna nadaje etykiety zgłoszeniom czekającym

## Co widać po zrobieniu

Retro w repozytorium warsztatu pokazuje osobną grupę „bez etykiety” z otwartymi Issues w stałych polach, które nie mają etykiety zgłoszenia. Po zgodzie opiekuna nadaje im `process-report` i `status: new`. Issue bez stałych pól retro pomija.

## Kryteria akceptacji

- [ ] S33: test akceptacyjny przechodzi dla wierszy tabeli. Atrapa `gh` zwraca:
  - zgłoszenie z etykietą;
  - Issue w stałych polach bez etykiet, z częścią pól pustych;
  - Issue z trzema z siedmiu nagłówków;
  - zwykły błąd bez nagłówków.

  Wynik: tylko drugie z nich jest w grupie „bez etykiety”, przed zgodą zapis atrapy nie ma żadnego polecenia zmieniającego stan, a po zgodzie jest nadanie obu etykiet temu jednemu Issue.
- [ ] S33: treść Issue czekającego z poleceniem dla agenta retro oznacza tak jak w S20 i niczego z niej nie wykonuje.
- [ ] Podział na grupy (z etykietą / bez etykiety w stałych polach / pominięte) liczy skrypt, używając rozpoznania stałych pól z ticketu 09 i pełnego odczytu z ticketu 11. Test jednostkowy trafia do `walidacja`.
- [ ] Atrapa `gh` obsługuje listę otwartych Issues bez filtra etykiety i nadawanie etykiet istniejącemu Issue, a wywołania z innymi argumentami odrzuca.
- [ ] S15: kontrakt i opis skilla `retro` mówią, że zgłoszenie czekające dostaje etykietę w retro opiekuna (dopełnia brzmienie z ticketu 10). Test jednego źródła (migracja) dalej przechodzi.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Liczenie zgłoszeń czekających w `gdzie tydzien` — tylko oznaczone (ticket 11).

## Notatki

- S33 i zmianę brzmienia S15 kończy ten ticket. Nowo oznaczone zgłoszenie wchodzi do kolejności S17 od kolejnego uruchomienia retro.
