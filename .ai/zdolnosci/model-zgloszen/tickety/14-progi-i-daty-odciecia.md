---
nr: "14"
tytul: Próg poniżej 3 i daty odcięcia w sesjach
status: do-zrobienia
blokowany-przez: []
scenariusze: ["S1", "S8", "S11"]
budowal: null
github: 27
---

# 14 — Próg poniżej 3 i daty odcięcia w sesjach

## Co widać po zrobieniu

Sesje przypinają brak propozycji wysyłki przy dwóch wystąpieniach (weryfikacja R1.7) i regułę odcięcia po dacie z tabel S8 i S11. Wystąpienie z dnia odcięcia jest już zgłoszone, z dnia następnego — nowe (R1.11). Skrót `WARSZTAT_TEST_PRZEBIEGI=1` działa też dla wspólnej grupy scenariuszy (R1.12).

## Kryteria akceptacji

- [ ] S1: przy dwóch wystąpieniach i włączonym repozytorium zgłoszeń odpowiedź nie zawiera żadnego nagłówka stałych pól ani pytania o zgodę na wysyłkę, a zapis atrapy nie ma operacji zapisu.
- [ ] S8: test akceptacyjny przechodzi dla wierszy tabeli S8. Dowody mają już: późniejsza data, zamknięte jako „not planned”, zamknięte jako wdrożone. Dochodzą równe daty: założenie, własny komentarz, `niewysłane` przy linku i zamknięcie jako wdrożone tego samego dnia co wystąpienie (→ brak propozycji).
- [ ] S11: test akceptacyjny przechodzi dla obu wierszy tabeli: wystąpienie z daty dopisku `niewysłane` → brak propozycji, następny dzień → ścieżka od nowa.
- [ ] Wspólna grupa scenariuszy z trzema wystąpieniami oczekuje tylu przebiegów, ile wynika z `WARSZTAT_TEST_PRZEBIEGI` (domyślnie 2), a nie zawsze dwóch.

## Poza zakresem

- Zmiana reguły dat — spec zatwierdził odcięcie po dacie (2026-11-25).

## Notatki

- S1, S8 i S11 kończy ten ticket.
