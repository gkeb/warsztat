---
nr: "11"
tytul: Pełna lista zgłoszeń opiekuna, wkłady z kalendarza i S20 osobno dla komentarza
status: zrobione
blokowany-przez: []
scenariusze: ["S17", "S20"]
budowal: "Claude Code / claude-opus-5-5"
github: 24
---

# 11 — Pełna lista zgłoszeń opiekuna, wkłady z kalendarza i S20 osobno dla komentarza

## Co widać po zrobieniu

Retro opiekuna liczy sygnał globalny na wszystkich otwartych zgłoszeniach i wszystkich ich komentarzach (weryfikacja R1.3). Gdy odczyt może być niepełny, mówi to opiekunowi zamiast pokazywać fragment. Przy kontach podaje wkłady z ostatniego roku według kalendarza profilu, a nie „publiczne” (R1.4). Polecenie dla agenta wykrywa osobno w treści Issue i osobno w komentarzu (R1.10).

## Kryteria akceptacji

- [x] Niepełny odczyt wykrywa skrypt sygnału, nie model. Skrypt dostaje limit pobrania jako parametr i zgłasza błąd, gdy liczba zgłoszeń albo komentarzy jednego zgłoszenia równa się limitowi bez potwierdzenia końca listy. Albo pobieranie idzie stronami do końca i skrypt dostaje potwierdzenie pełnej listy — wybór mechanizmu należy do budującego, kryterium jest wspólne.
- [x] Test jednostkowy skryptu w `walidacja` (obowiązkowy):
  - lista równa limitowi → błąd;
  - komentarze jednego zgłoszenia równe limitowi → błąd;
  - zgłoszenie z sygnałem globalnym za pierwszymi 200 pozycjami → grupa „najpierw”.
- [x] S17: test akceptacyjny przechodzi dla wierszy tabeli. W sesji z niepełnym odczytem odpowiedź zgłasza błąd i nie przedstawia grup jako całości.
- [x] S17: przy loginie stoi liczba wkładów z dopiskiem o kalendarzu profilu (np. „wkłady z ostatniego roku (kalendarz profilu)” albo równoważnie). W odpowiedzi ani w procedurze nie pada słowo „publiczne” przy tej liczbie.
- [x] S17: sesja pokazuje, że opiekun może wybrać do wdrożenia zgłoszenie z grupy „reszta” mimo istnienia grupy „najpierw”.
- [x] S20: test akceptacyjny przechodzi w dwóch osobnych przypadkach — polecenie tylko w treści Issue i polecenie tylko w komentarzu; w obu znacznik stoi przy właściwym zgłoszeniu, a zapis nie ma wykonania ani zmian.
- [x] `gdzie tydzien` w repozytorium warsztatu liczy oznaczone zgłoszenia bez obcięcia do limitu (albo pisze „co najmniej N”). Zgłoszeń czekających na opiekuna nie liczy — nie są w kolejności opiekuna do nadania etykiet (S33).
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Źródło liczby samych wkładów publicznych — spec zmienił brzmienie zamiast tego (2026-11-25).

## Notatki

- S17 i S20 kończy ten ticket. Sesje S20 można zrobić na końcu; gdy zabraknie budżetu sesji, ticket wraca do `pokroj` z S20 jako osobnym plastrem.
- 2026-11-25 — mechanizm niepełnego odczytu: limit jako parametr skryptu (`--limit`, ten sam co w `gh issue list`, 1000) i stała strona komentarzy `gh` (100). `gh` 2.89 eksportuje z `issue list --json comments` same węzły z `comments(first: 100)`, bez `pageInfo`, więc potwierdzenia końca listy nie ma. Kod 3 = niepełny odczyt.
- Sesje ticketu (S17 ×2, S20 ×2, `gdzie tydzien`) zielone w 2 kolejnych przebiegach; S17 z niepełnym odczytem po poprawce komunikatu (lekcja o stałych komunikatach, wystąpienie 2026-11-25) ponownie zielony w 2 przebiegach. Pełny plik `testy/retro-zgloszenia.test.mjs` niesprawdzony.
- Poprawki po przeglądzie (wszystkie, wybór użytkownika): wskazówka dla opiekuna przy zgłoszeniu ze 100 komentarzami (spam może zablokować listę), `--limit` tylko z cyfr, sesja `gdzie tydzien` dla „co najmniej 1000”.
