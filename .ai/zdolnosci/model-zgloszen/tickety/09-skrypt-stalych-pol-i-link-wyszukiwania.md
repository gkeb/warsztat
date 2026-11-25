---
nr: "09"
tytul: Rozpoznanie stałych pól i link wyszukiwania bez filtra etykiety
status: do-zrobienia
blokowany-przez: []
scenariusze: ["S6", "S10", "S33"]
budowal: null
github: 22
---

# 09 — Rozpoznanie stałych pól i link wyszukiwania bez filtra etykiety

## Co widać po zrobieniu

Deterministyczny skrypt odpowiada, czy treść Issue jest w stałych polach (definicja w słowniku), a test jednostkowy jego granic działa w `walidacja`. Link wyszukiwania podobnych zgłoszeń bez `gh` obejmuje zgłoszenia z etykietą i zgłoszenia czekające na opiekuna. Dotąd szukał tylko po etykiecie, więc zgłoszenie założone z konta bez uprawnień (weryfikacja R1.1) byłoby niewidoczne.

## Kryteria akceptacji

- [ ] Skrypt rozpoznania stałych pól przyjmuje treść Issue i zwraca „w stałych polach” albo „nie”. Test jednostkowy w `walidacja` sprawdza granice: 7 nagłówków z jednym pustym polem → tak; 6 nagłówków → nie; nagłówek powtórzony → nie; tekst przed pierwszym nagłówkiem → nie; obcy nagłówek trzeciego poziomu → nie; treść z formularza GitHuba z `_No response_` w pustym polu → tak.
- [ ] Skrypt jest używalny z procedury `retro` (wywołanie przez `node` ze ścieżką względem pliku skilla) i z innych skryptów (ticket 12).
- [ ] Skrypt linków: zapytanie wyszukiwania nie ma filtra etykiety zgłoszenia i zawęża wyniki do zgłoszeń, np. frazą nagłówka pola i nazwą skilla. Test skryptu linków sprawdza nową postać zapytania; dotychczasowe granice długości (5 999 / 6 000 / 6 001) dalej przechodzą.
- [ ] Kontrakt opisuje link wyszukiwania bez filtra etykiety.
- [ ] Wersja pluginu podbita w obu manifestach do 0.29.0; kolejne tickety poprawek (10–15) nie podbijają jej osobno.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Zmiana wysyłki i deduplikacji z `gh` — ticket 10.
- Grupa „bez etykiety” w retro opiekuna — ticket 12.

## Notatki

- Ticket nie kończy żadnego scenariusza: S6 kończy 10, S10 kończy 15, S33 kończy 12. Bez sesji agenta — same testy skryptów.
