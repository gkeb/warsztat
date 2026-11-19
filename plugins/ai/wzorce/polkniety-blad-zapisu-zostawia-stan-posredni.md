# Połknięty błąd zapisu stanu zostawia stan pośredni

- Status: kandydat
- Hasła: catch, połknięty wyjątek, zapis stanu, maszyna stanów, persistence, SQLite, kolejka zadań, worker, stan pośredni, zawieszone zadanie

## Sygnały

- Obraz stanu (status, lista zadań) pokazuje zadanie jako oczekujące albo wykonywane, choć wykonawca dawno skończył albo nigdy nie wystartował.
- W logach brak błędu — wyjątek złapano i zignorowano.
- Po restarcie procesu stan się porządkuje (odzyskanie przy starcie przestawia go na przerwany albo błędny).
- Kod ma `catch` z pustym ciałem albo komentarzem w rodzaju „zostaje ostatni zatwierdzony stan”.

## Warunki

Proces przeprowadza encję przez kilka trwale zapisywanych stanów (przyjęte → wykonywane → zakończone), a zapis między krokami może się nie udać: pełny dysk, blokada bazy, ograniczenie integralności, uprawnienia. Błąd zapisu jest łapany, żeby nie zatrzymać całego procesu.

Nie dotyczy:

- Zapis jest atomowy razem z działaniem (jedna transakcja) — nie ma stanu pośredniego do zostawienia.
- Stan pośredni jest jawnie dopuszczony i ma nadzorcę (limit czasu, heartbeat), który go wykrywa i zamyka.
- Błąd zapisu zatrzymuje proces, a odzyskanie przy starcie porządkuje stan — wtedy problemem jest dostępność, nie fałszywy obraz.

## Mechanizm

„Ostatni zatwierdzony stan” jest prawdą o przeszłości, nie o teraźniejszości. Gdy zapis przejścia się nie powiedzie, a proces dalej działa, utrwalony stan (`queued`, `running`) przeczy rzeczywistości: wykonawca skończył albo nie wystartuje. Odzyskanie zaprojektowane na awarię procesu nie uruchamia się, bo proces nie padł. Połknięcie wyjątku zamienia błąd zapisu w trwałe kłamstwo w obrazie stanu.

## Rozwiązanie

- Każdy nieudany zapis stanu ma jawną ścieżkę: utrwal stan zgodny z prawdą przez funkcję modelu domeny (np. przejście do przerwanego), a gdy i to się nie uda — przejdź w tryb błędu (odpowiedzi „stan niedostępny” z podpowiedzią restartu), aż odzyskanie przy starcie go uporządkuje. Nie wracaj do zwykłej obsługi, jakby nic się nie stało.
- Przejścia stanów buduj tylko w modelu domeny, nie przez ręczne kopiowanie obiektu w warstwie aplikacji.
- Test: wymuś błąd zapisu konkretnego przejścia (np. trigger w bazie odrzucający dany stan) i sprawdź przez publiczny interfejs, że obraz stanu nie pokazuje zadania jako trwającego bez końca ani pozornego sukcesu.

## Warianty i pułapki

- Błąd zapisu startu (zadanie zostaje „w kolejce”) i błąd zapisu wyniku (zostaje „w toku”) to dwa osobne miejsca — poprawka pierwszego nie pokrywa drugiego.
- Test, który czeka na zakończenie wykonania przed pierwszym odczytem, może przejść przypadkiem; potwierdzenie przyjęcia nie oznacza wykonania — czekaj w limicie na oczekiwany błąd.

## Wystąpienia

- 2026-11-18 — tenta — weryfikacja R1.5 (błąd zapisu startu, Task `queued`) — TypeScript, Node 26, `node:sqlite`, demon w tle
- 2026-11-19 — tenta — weryfikacja R2.1 (błąd zapisu wyniku, Task `running`) — jw.
