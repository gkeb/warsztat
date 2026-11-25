---
nr: "10"
tytul: Wysyłka bez etykiet i podobne zgłoszenia po treści
status: do-zrobienia
blokowany-przez: ["09"]
scenariusze: ["S2", "S6"]
budowal: null
github: 23
---

# 10 — Wysyłka bez etykiet i podobne zgłoszenia po treści

## Co widać po zrobieniu

Retro w projekcie zakłada Issue bez etykiet, więc wysyłka działa także z konta, które nie może nadawać etykiet (weryfikacja R1.1). Szukanie podobnych z `gh` nie filtruje po etykiecie. Trafienie bez etykiety liczy się tylko w stałych polach według skryptu z ticketu 09. Skill, krok i objaw retro porównuje na treści trafienia, nie na samym tytule (R1.5).

## Kryteria akceptacji

- [ ] S6: test akceptacyjny przechodzi w trzech wariantach; atrapa `gh` zwraca wyniki wyszukiwania z treścią:
  - zgłoszenie z etykietą o tym samym skillu, kroku i objawie → propozycja komentarza „wystąpienie” obok nowego zgłoszenia;
  - zgłoszenie bez etykiety w stałych polach o tym samym problemie → ta sama propozycja;
  - trafienie z tym samym skillem i tytułem, ale innym krokiem w treści, oraz zwykły błąd bez stałych pól → tylko nowe zgłoszenie.
- [ ] S6: zapytanie wyszukiwania w zapisie atrapy nie ma filtra etykiety i zawiera nazwę skilla oraz co najmniej jedno słowo objawu z tytułu szkicu. Trafienie bez etykiety klasyfikuje skrypt stałych pól na treści, a nie model.
- [ ] S2 (część „bez etykiet”): w zapisie atrapy wysyłka nowego zgłoszenia nie ma flag etykiet. To samo dotyczy wysyłki po zamknięciu jako wdrożone (S8) i wysyłki do własnego repozytorium zgłoszeń (S12). Atrapa `gh` odrzuca flagi etykiet przy zakładaniu Issue z projektu.
- [ ] Przeszukanie pluginu i `README.md` nie znajduje twierdzenia, że wysyłka z projektu nadaje etykiety. Etykiety nadaje formularz albo opiekun. Ostateczne brzmienie o opiekunie uzupełnia ticket 12.
- [ ] Zgłoszenie opiekuna (S18) dalej zakłada Issue z etykietami; jego sesja przechodzi.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Nadawanie etykiet przez opiekuna (S33) — ticket 12.

## Notatki

- S6 kończy ten ticket. S2 kończy ticket 15 (asercje pól i wartości).
