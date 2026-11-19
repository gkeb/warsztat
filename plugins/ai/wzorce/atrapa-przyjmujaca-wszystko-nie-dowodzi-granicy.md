# Atrapa, która przyjmuje wszystko i odpowiada od razu, nie dowodzi zachowania na granicy

- Status: kandydat
- Hasła: atrapa, fake, stub, mock, fikstura, test double, port, adapter, kolejność, asynchroniczność, potwierdzenie przyjęcia, przekazanie argumentów

## Sygnały

- test akceptacyjny przechodzi, a przegląd pokazuje, że przeszedłby też przy błędnej implementacji (puste opcje, czekanie na wynik zamiast samego przyjęcia);
- atrapa portu zwraca sukces, nie sprawdzając, co dostała;
- atrapa kończy pracę natychmiast (echo), więc kolejność „zapisz → potwierdź → wykonaj” jest nieodróżnialna od innej;
- asercja sprawdza tylko pole stanu albo odczyt z własnej bazy, nie to, co przeszło przez granicę.

## Warunki

Test sprawdza kod, który przekazuje dane albo sterowanie przez granicę (port, adapter, proces, kolejka) do atrapy, a scenariusz dotyczy tego, co i kiedy przez nią przechodzi.

Nie dotyczy:

- atrapy, która tylko odcina nieistotną zależność, gdy scenariusz nie dotyczy granicy;
- mockowania własnych modułów zamiast granic (osobna kontrola recenzenta jakości);
- testu osłabionego przy poprawce — zob. [naprawa osłabia test](naprawa-oslabia-test-ktory-ja-pilnowal.md).

## Mechanizm

Atrapa, która akceptuje każde wejście i odpowiada natychmiast, pasuje do wielu implementacji, także błędnych. Test niczego nie rozróżnia: nie widzi, jakie dane dostał port, ani nie pozwala zobaczyć stanu pośredniego, gdy praca trwa.

## Rozwiązanie

- Dla każdego scenariusza zapytaj: jaka błędna implementacja przeszłaby ten test? Atrapa ma ją odrzucić.
- Dane: atrapa sprawdza oczekiwane argumenty każdego wywołania i roli, nie tylko liczbę wywołań.
- Kolejność: atrapa wstrzymana na granicy (obietnica zwalniana z testu) pozwala sprawdzić stan w trakcie — przyjęcie zapisane, wykonanie trwa — i dopiero potem ją zwolnić.
- Automatycznie: testy mutacyjne na zakresie zmiany; przeżyty mutant w przekazaniu argumentów albo kolejności wskazuje taką atrapę.

## Warianty i pułapki

- Szybki executor echo: wynik przychodzi przed asercją, więc „potwierdzenie przed wykonaniem” jest nieobserwowalne.
- Fikstura procesu przyjmująca dowolne opcje: odczyt zapisanych ustawień przechodzi, choć do portu trafiły puste opcje.

## Wystąpienia

- 2026-11-18 — tenta — lekcja [szkielet] — TypeScript, Vitest — wariant: executor echo, kolejność przyjęcia i wykonania
- 2026-11-19 — tenta — lekcja [rejestr-projektow] — TypeScript, Vitest — wariant: fikstura akceptująca dowolne opcje (S6)
