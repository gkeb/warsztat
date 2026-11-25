---
nr: "14"
tytul: Próg poniżej 3 i daty odcięcia w sesjach
status: zrobione
blokowany-przez: []
scenariusze: ["S1", "S8", "S11"]
budowal: "Claude Code / claude-opus-5-5"
github: 27
---

# 14 — Próg poniżej 3 i daty odcięcia w sesjach

## Co widać po zrobieniu

Sesje przypinają brak propozycji wysyłki przy dwóch wystąpieniach (weryfikacja R1.7) i regułę odcięcia po dacie z tabel S8 i S11. Wystąpienie z dnia odcięcia jest już zgłoszone, z dnia następnego — nowe (R1.11). Skrót `WARSZTAT_TEST_PRZEBIEGI=1` działa też dla wspólnej grupy scenariuszy (R1.12).

## Kryteria akceptacji

- [x] S1: przy dwóch wystąpieniach i włączonym repozytorium zgłoszeń odpowiedź nie zawiera żadnego nagłówka stałych pól ani pytania o zgodę na wysyłkę, a zapis atrapy nie ma operacji zapisu.
- [x] S8: test akceptacyjny przechodzi dla wierszy tabeli S8. Dowody mają już: późniejsza data, zamknięte jako „not planned”, zamknięte jako wdrożone. Dochodzą równe daty: założenie, własny komentarz, `niewysłane` przy linku i zamknięcie jako wdrożone tego samego dnia co wystąpienie (→ brak propozycji).
- [x] S11: test akceptacyjny przechodzi dla obu wierszy tabeli: wystąpienie z daty dopisku `niewysłane` → brak propozycji, następny dzień → ścieżka od nowa.
- [x] Wspólna grupa scenariuszy z trzema wystąpieniami oczekuje tylu przebiegów, ile wynika z `WARSZTAT_TEST_PRZEBIEGI` (domyślnie 2), a nie zawsze dwóch.

## Poza zakresem

- Zmiana reguły dat — spec zatwierdził odcięcie po dacie (2026-11-25).

## Notatki

- S1, S8 i S11 kończy ten ticket.
- 2026-11-25 — procedura (`zgloszenie.md`, kroki 1 i 4.2) już opisywała odcięcie po dacie; ticket dodał tylko testy sesji. S1 z 2 wystąpieniami sprawdza brak nagłówków stałych pól na początku linii i brak pytania o wysłanie albo założenie Issue. S8 ma cztery wiersze równych dat (parametryzowany test `odcieciaS8`). S11 to dwa wiersze tabeli zamiast dawnych testów z 2026-11-10 i 2026-11-15. Nowe testy mają te same asercje co dawne i asercję, że pole `Occurrences` zawiera wszystkie 4 daty.
- Wspólna grupa „wysyłka zgłoszenia — 3 wystąpienia” liczy przebiegi z `WARSZTAT_TEST_PRZEBIEGI` (`liczbaPrzebiegow`) od ticketu 10 (`cbead69`); kryterium spełnione bez zmian.
- Wiersz z `niewysłane` przy linku nie wymaga `gh issue view`: data dopisku sama wyznacza odcięcie (sesja zakończyła ścieżkę bez widoku — wynik poprawny). Pozostałe wiersze S8 wymagają widoku.
- Sesje S1 (2 wystąpienia), S8 (4 wiersze równych dat) i S11 (2 wiersze) zielone w 2 kolejnych przebiegach (≈$4.6). Pełny plik `testy/retro-zgloszenia.test.mjs` niesprawdzony.
- Przegląd: bez blokujących; przyjęte — zawężenie filtra pytań w S1 (wybór użytkownika); uwaga o wymaganym widoku przy `niewysłane` najpierw odrzucona, potem przyjęta po porażce sesji (lekcja).
