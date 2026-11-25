---
nr: "11"
tytul: Pełna lista zgłoszeń opiekuna, wkłady z kalendarza i S20 osobno dla komentarza
status: do-zrobienia
blokowany-przez: []
scenariusze: ["S17", "S20"]
budowal: null
github: 24
---

# 11 — Pełna lista zgłoszeń opiekuna, wkłady z kalendarza i S20 osobno dla komentarza

## Co widać po zrobieniu

Retro opiekuna liczy sygnał globalny na wszystkich otwartych zgłoszeniach i wszystkich ich komentarzach (weryfikacja R1.3). Gdy odczyt może być niepełny, mówi to opiekunowi zamiast pokazywać fragment. Przy kontach podaje wkłady z ostatniego roku według kalendarza profilu, a nie „publiczne” (R1.4). Polecenie dla agenta wykrywa osobno w treści Issue i osobno w komentarzu (R1.10).

## Kryteria akceptacji

- [ ] Niepełny odczyt wykrywa skrypt sygnału, nie model. Skrypt dostaje limit pobrania jako parametr i zgłasza błąd, gdy liczba zgłoszeń albo komentarzy jednego zgłoszenia równa się limitowi bez potwierdzenia końca listy. Albo pobieranie idzie stronami do końca i skrypt dostaje potwierdzenie pełnej listy — wybór mechanizmu należy do budującego, kryterium jest wspólne.
- [ ] Test jednostkowy skryptu w `walidacja` (obowiązkowy):
  - lista równa limitowi → błąd;
  - komentarze jednego zgłoszenia równe limitowi → błąd;
  - zgłoszenie z sygnałem globalnym za pierwszymi 200 pozycjami → grupa „najpierw”.
- [ ] S17: test akceptacyjny przechodzi dla wierszy tabeli. W sesji z niepełnym odczytem odpowiedź zgłasza błąd i nie przedstawia grup jako całości.
- [ ] S17: przy loginie stoi liczba wkładów z dopiskiem o kalendarzu profilu (np. „wkłady z ostatniego roku (kalendarz profilu)” albo równoważnie). W odpowiedzi ani w procedurze nie pada słowo „publiczne” przy tej liczbie.
- [ ] S17: sesja pokazuje, że opiekun może wybrać do wdrożenia zgłoszenie z grupy „reszta” mimo istnienia grupy „najpierw”.
- [ ] S20: test akceptacyjny przechodzi w dwóch osobnych przypadkach — polecenie tylko w treści Issue i polecenie tylko w komentarzu; w obu znacznik stoi przy właściwym zgłoszeniu, a zapis nie ma wykonania ani zmian.
- [ ] `gdzie tydzien` w repozytorium warsztatu liczy oznaczone zgłoszenia bez obcięcia do limitu (albo pisze „co najmniej N”). Zgłoszeń czekających na opiekuna nie liczy — nie są w kolejności opiekuna do nadania etykiet (S33).
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Źródło liczby samych wkładów publicznych — spec zmienił brzmienie zamiast tego (2026-11-25).

## Notatki

- S17 i S20 kończy ten ticket. Sesje S20 można zrobić na końcu; gdy zabraknie budżetu sesji, ticket wraca do `pokroj` z S20 jako osobnym plastrem.
