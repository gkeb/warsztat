# Test negatywny przechodzi z innego powodu, niż zakłada

- Status: kandydat
- Hasła: test negatywny, oczekiwany błąd, kod błędu, kod wyjścia, asercja zbyt ogólna, stan początkowy, wariant testu, awaria, restart, fikstura, test akceptacyjny

## Sygnały

- Test oczekuje błędu albo odrzucenia i jest zielony od pierwszego uruchomienia — nie było fazy „czerwony z właściwego powodu”.
- Po usunięciu albo zepsuciu sprawdzanej funkcji test nadal przechodzi (np. nieznana flaga daje ten sam kod co konflikt flag).
- Dwa warianty testu (np. „zatrzymanie” i „awaria”) dzielą stan, więc drugi wariant sprawdza skutek pierwszego.
- Test pada albo przechodzi na kroku przygotowania (fikstura odrzuca dane), a nie na kroku, o którym mówi scenariusz.

## Warunki

Dotyczy testów, w których oczekiwany wynik jest porażką, odrzuceniem albo przetrwaniem stanu: kody błędów, kody wyjścia CLI, walidacja wejścia, odporność na awarię i restart, odrzucenie przez zależność.

Nie dotyczy:

- Atrapa, która przyjmuje każde wejście i dlatego test sukcesu przechodzi przy błędnej implementacji — to wzorzec [Atrapa, która przyjmuje wszystko](atrapa-przyjmujaca-wszystko-nie-dowodzi-granicy.md); tu chodzi o asercję albo stan, które przyjmują każdą porażkę.
- Poprawka, która osłabiła istniejącą asercję — [Poprawka dopasowuje test](naprawa-oslabia-test-ktory-ja-pilnowal.md).

## Mechanizm

Klasa błędu (kod `USAGE`, kod wyjścia 1, „rejestr bez zmian”) jest wspólna dla wielu przyczyn. Asercja, która sprawdza tylko klasę, przechodzi przy każdej z nich — także gdy zachowanie w ogóle nie istnieje. Podobnie wspólny stan między wariantami albo nieprzewidziany krok przygotowania daje oczekiwany wynik bez udziału sprawdzanego mechanizmu.

## Rozwiązanie

- Asercja rozróżnia przyczynę, nie tylko klasę: komunikat, pole błędu albo inny ślad, którego nie da żadna inna ścieżka.
- Każdy wariant ma własny stan początkowy, w którym tylko on może dać oczekiwany wynik (osobny katalog danych, osobny zapis tuż przed przerwaniem).
- Przygotowanie testu sprawdza swój sukces osobną asercją, zanim nastąpi krok sprawdzany.
- Kontrola: test negatywny musi być czerwony, gdy sprawdzany mechanizm jest wyłączony — sprawdź to raz przy pisaniu (albo testem mutacyjnym).

## Warianty i pułapki

- Kod błędu wspólny dla złego użycia: konflikt flag i nieznana flaga dają ten sam kod.
- Trwałość po awarii sprawdzana na wpisie, który wcześniejsze zwykłe zatrzymanie już utrwaliło.
- Fikstura odrzucająca dane z innego powodu niż scenariusz — test zatrzymał się na przygotowaniu.

## Wystąpienia

- 2026-11-19 — tenta — lekcje `[rejestr-projektow]` (S24: sam kod `USAGE`; S15: awaria po wcześniejszym zatrzymaniu; S14: fikstura odrzucała opcje) — TypeScript, Vitest, CLI przez zbudowany proces, SQLite — warianty: kod błędu, wspólny stan, przygotowanie
