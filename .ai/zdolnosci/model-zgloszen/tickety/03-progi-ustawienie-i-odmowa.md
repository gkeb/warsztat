---
nr: "03"
tytul: Progi, domyślne repozytorium zgłoszeń i odmowa
status: do-zrobienia
blokowany-przez: ["02"]
scenariusze: ["S1", "S3", "S4", "S11", "S12"]
budowal: null
github: 5
---

# 03 — Progi, domyślne repozytorium zgłoszeń i odmowa

## Co widać po zrobieniu

Retro ma pełne reguły decyzji:
- utrata danych daje szkic już od pierwszego wystąpienia;
- brak klucza `zgloszenia` prowadzi do oficjalnego repozytorium z manifestu pluginu, a gdy manifest nie ma adresu, wysyłka jest wyłączona z informacją;
- `null` niczego nie proponuje.

Odmowa, odpowiedź „nie mam konta” albo koniec tury na pytaniu zostawiają lekcję z dopiskiem `Zgłoszenie: niewysłane <data>`. Do takiej lekcji retro nie wraca, dopóki nie dojdzie nowe wystąpienie.

## Kryteria akceptacji

- [ ] S1: test akceptacyjny przechodzi dla wszystkich wierszy tabeli; ten ticket go kończy.
- [ ] S3: test akceptacyjny przechodzi dla odmowy w drugiej turze i dla sesji zakończonej na pytaniu.
- [ ] S11: test akceptacyjny przechodzi. Ponowne retro bez nowego wystąpienia nie proponuje wysyłki, a po nowym wystąpieniu proponuje.
- [ ] S12: test akceptacyjny przechodzi dla wszystkich wierszy tabeli; ten ticket go kończy.
- [ ] S4: test akceptacyjny przechodzi także wtedy, gdy manifest ma adres: odpowiedź podaje adres polityki bezpieczeństwa oficjalnego repozytorium; ten ticket go kończy.
- [ ] Adres oficjalnego repozytorium:
  - stoi w polu `repository` obu manifestów pluginu, w postaci `https://github.com/<właściciel>/<nazwa>`;
  - pole zostaje puste, bo wartość wpisze zdolność `publikacja`;
  - test wiersza „brak klucza → oficjalne” ustawia pole w kopii pluginu użytej w teście.
- [ ] Przed użyciem pola `repository` sprawdź, że dopuszczają je schematy obu manifestów (schemat `agent-plugins.org` i schemat manifestu Claude Code). Gdy któryś go nie dopuszcza, adres stoi w jednym pliku danych pluginu, a retro czyta go stamtąd.
- [ ] Kontrakt opisuje rodzaje problemu według wpisu w słowniku. Użytkownik może zmienić rodzaj w szkicu przed zgodą.
- [ ] Format lekcji w kontrakcie: `Zgłoszenie: niewysłane RRRR-MM-DD` stoi w tym samym miejscu co link, a wysyłka zastępuje go linkiem.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Wyszukiwanie podobnych, komentarze — ticket 04.

## Notatki

- „Sesja nie pozwala zapytać” (S3): retro kończy turę pytaniem i przed końcem tury zapisuje `niewysłane`. Odpowiedź „tak” w następnej turze wysyła zgłoszenie i podmienia dopisek na link.
- S11 porównuje datę z dopisku `niewysłane` z datą ostatniego wystąpienia lekcji.
- Z przeglądu ticketu 01: fikstura S1 (`testy/fikstury/retro-dwa-wystapienia`) nie ma jeszcze ustawienia repozytorium zgłoszeń — przy tym tickecie dostaje je jawnie, inaczej wiersz „2 wystąpienia” nie odróżni „poniżej progu” od „brak funkcji wysyłki”. Retro w sesji z `haiku` uznało też problem z fikstury za już naprawiony w warsztacie (commit w skillu `spec`) — fikstura z 3 wystąpieniami potrzebuje zgrzytu, którego warsztat nie poprawił.
