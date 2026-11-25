---
nr: "12"
tytul: Retro opiekuna nadaje etykiety zgłoszeniom czekającym
status: zrobione
blokowany-przez: ["09", "10", "11"]
scenariusze: ["S33", "S15"]
budowal: "Claude Code / claude-opus-5-5"
github: 25
---

# 12 — Retro opiekuna nadaje etykiety zgłoszeniom czekającym

## Co widać po zrobieniu

Retro w repozytorium warsztatu pokazuje osobną grupę „bez etykiety” z otwartymi Issues w stałych polach, które nie mają etykiety zgłoszenia. Po zgodzie opiekuna nadaje im `process-report` i `status: new`. Issue bez stałych pól retro pomija.

## Kryteria akceptacji

- [x] S33: test akceptacyjny przechodzi dla wierszy tabeli. Atrapa `gh` zwraca:
  - zgłoszenie z etykietą;
  - Issue w stałych polach bez etykiet, z częścią pól pustych;
  - Issue z trzema z siedmiu nagłówków;
  - zwykły błąd bez nagłówków.

  Wynik: tylko drugie z nich jest w grupie „bez etykiety”, przed zgodą zapis atrapy nie ma żadnego polecenia zmieniającego stan, a po zgodzie jest nadanie obu etykiet temu jednemu Issue.
- [x] S33: treść Issue czekającego z poleceniem dla agenta retro oznacza tak jak w S20 i niczego z niej nie wykonuje.
- [x] Podział na grupy (z etykietą / bez etykiety w stałych polach / pominięte) liczy skrypt, używając rozpoznania stałych pól z ticketu 09 i pełnego odczytu z ticketu 11. Test jednostkowy trafia do `walidacja`.
- [x] Atrapa `gh` obsługuje listę otwartych Issues bez filtra etykiety i nadawanie etykiet istniejącemu Issue, a wywołania z innymi argumentami odrzuca.
- [x] S15: kontrakt i opis skilla `retro` mówią, że zgłoszenie czekające dostaje etykietę w retro opiekuna (dopełnia brzmienie z ticketu 10). Test jednego źródła (migracja) dalej przechodzi.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Liczenie zgłoszeń czekających w `gdzie tydzien` — tylko oznaczone (ticket 11).

## Notatki

- S33 i zmianę brzmienia S15 kończy ten ticket. Nowo oznaczone zgłoszenie wchodzi do kolejności S17 od kolejnego uruchomienia retro.
- 2026-11-25 — lista opiekuna bez filtra etykiety: skrypt sygnału dostaje wszystkie otwarte Issues i zwraca `bezEtykiety` (stałe pola, `stale-pola.mjs`) oraz samą liczbę `pominiete`, bez numerów i treści — retro nie ma czego pokazać z Issues, które nie są zgłoszeniami. Limit pobrania liczy wszystkie otwarte Issues; 100 komentarzy blokuje tylko zgłoszenia i czekające. Atrapa `gh` ma pole `bezFlag` (lista opiekuna z `--label` jest nieprzewidziana).
- Asercja S19 „lista z `--label process-report`” zamieniona na „lista bez filtra etykiety” — wynika ze zmiany specu 2026-11-25 (S33); przegląd uznał ją za zastąpioną, nie osłabioną.
- Sesje S33 (×2) zielone w 2 kolejnych przebiegach; S17 ×2, S18, S19 ×3, S20 ×2 zielone w 1 przebiegu po zmianie polecenia listy (przed dwiema poprawkami brzmienia po przeglądzie). `gdzie tydzien` — odpowiedź atrapy rozdzielona na listę z etykietą, sesja niesprawdzona po zmianie. Pełny plik `testy/retro-zgloszenia.test.mjs` niesprawdzony.
- Poprawki po przeglądzie (obie, wybór użytkownika): przy niepełnym odczycie spam spoza zgłoszeń jako możliwa przyczyna; lista awaryjna (kod 2) tylko z Issues `process-report`.
