# 0001. Rdzeń warsztatu i osobny plugin katalogu społeczności

- Data: 2026-11-22
- Status: przyjęta
- Źródło:
- Zdolność: [model-zgloszen](../zdolnosci/model-zgloszen/mapa.md)

## Kontekst

Warsztat ma zostać opublikowany i używany przez wiele osób. Ma jednego opiekuna. Rdzeń, czyli skille, kontrakt i szablony, to spójny proces: zmiana jednego promptu wpływa na pozostałe, a testów skilli jeszcze nie ma. Rozszerzenia, czyli profile klas aplikacji i wzorce, to wiedza, którą się głównie dopisuje. Opiekun nie zbierze jej sam dla obcych stosów. Każda pozycja rozszerzenia trafia do kontekstu agenta w cudzych projektach, więc słaba pozycja zjada kontekst i wprowadza w błąd wszystkich, którzy ją ładują.

## Decyzja

Rdzeń zmienia tylko opiekun. Od innych przyjmuje wyłącznie zgłoszenia (Issues z opisem problemu), a nie zmiany. Profile i wzorce od innych trafiają przez PR do osobnego pluginu katalogu społeczności, który użytkownik instaluje świadomie. Do rdzenia opiekun przenosi tylko pozycje `potwierdzone`, gdy uzna, że dotyczą większości użytkowników. Po przeniesieniu w katalogu zostaje wpis indeksu „przeniesiony do rdzenia”, bez treści.

## Rozważane alternatywy

- **Wkłady w rdzeniu jako `kandydat`.** Plus: jedno miejsce do utrzymania. Minus: kandydaci rozdymają indeks i profile u wszystkich, także u tych, którzy ich nie chcą, a każdy PR dotyka repozytorium rdzenia.
- **PR-y wszędzie, także do rdzenia.** Plus: najszybszy rozwój. Minus: jeden opiekun bez testów skilli nie oceni, czy zmiana promptu nie psuje reszty procesu.
- **Katalog społeczności w rdzeniu, włączany flagą w `warsztat.json`** (z drugiej opinii). Plus: jedno repozytorium, jedno wydanie i jeden hook odczytu (ten sam co w Z14). Minus: cudze PR-y lądują w repozytorium rdzenia, Z01 trzeba zawęzić do ścieżek, a wkłady leżą na dysku każdego użytkownika. Opiekun przedłożył izolację repozytorium rdzenia.
- **Tylko zgłoszenia, bez PR-ów.** Plus: pełna kontrola. Minus: gotowy profil od kogoś, kto zna inny stos, opiekun musi przepisać sam albo przepada.

## Konsekwencje

- Rdzeń zostaje czysty niezależnie od liczby wkładów. Użytkownik bez katalogu społeczności ma tylko pozycje sprawdzone przez opiekuna.
- Dochodzi drugie repozytorium do utrzymania, z własnymi zabezpieczeniami: format sprawdzany w CI, wejście jako `kandydat`, CODEOWNERS z wymaganą akceptacją opiekuna, przegląd agentem i budżet długości (decyzje w mapie [model-zgloszen](../zdolnosci/model-zgloszen/mapa.md)).
- Warsztat musi czytać wzorce i profile z dwóch miejsc. Ustalony mechanizm to hook SessionStart pluginu społeczności, który wypisuje ścieżkę swojego indeksu, bo bezpośredni odczyt innego pluginu jest nieudokumentowany ([badanie](../badania/2026-11-22-odczyt-plikow-innego-pluginu.md)). W Claude Code prototyp potwierdził ten mechanizm pod warunkiem, że plugin ma też hook `PreToolUse`, który zezwala na odczyt tylko jego własnych plików ([eksperyment](../eksperymenty/2026-11-22-hook-pluginu-spolecznosci.md)). Codex nie jest jeszcze sprawdzony. Jeśli hook okaże się zawodny, mechanizm zmienia nowy ADR, a granica z tego ADR zostaje.
- Od teraz nie przyjmujemy PR-ów do `plugins/ai` od innych osób i nie dodajemy do rdzenia wzorców ani profili od innych z pominięciem katalogu społeczności.
