# Powłoka pośrednicząca (cmd.exe, heredoc w narzędziu agenta) zmienia argumenty, zanim dotrą do programu

- Status: kandydat
- Hasła: cmd.exe, PowerShell, heredoc, cytowanie, zmienne środowiskowe, Windows, launcher agenta, argumenty ze spacjami, ukośnik wsteczny

## Sygnały

- argument ze spacją rozbity na kilka (tytuł commita zamieniony w pathspecy, wyrażenie `pytest -k` rozbite);
- wartość zmiennej środowiskowej z końcową spacją albo ścieżka z dosłownymi cudzysłowami;
- `unicodeescape … truncated \xXX escape` albo zgubione `\` w ścieżkach Windows w skrypcie przekazanym przez heredoc;
- średnik potraktowany jako część argumentu zamiast separatora poleceń;
- polecenie działa wpisane ręcznie, a nie działa wywołane przez agenta.

## Warunki

Agent uruchamia polecenia przez launcher, który oddaje je cmd.exe albo powłoce z innymi regułami cytowania niż te, które agent zakłada (typowo: składnia POSIX albo PowerShell przekazana do cmd.exe na Windows; heredoc w narzędziu powłoki).

Nie dotyczy:

- błędu w samym programie, który powtarza się przy wywołaniu z listą argumentów bez powłoki (np. `subprocess.run([...])`);
- programu, który sam źle parsuje swoje argumenty — wtedy ten sam błąd widać też przy ręcznym wywołaniu w natywnej powłoce.

## Mechanizm

Każda warstwa powłoki parsuje cytowanie i znaki specjalne po swojemu. cmd.exe nie zdejmuje cudzysłowów tak jak POSIX, `set N=w &&` dokleja spację przed `&&` do wartości, a `;` nie rozdziela poleceń. Heredoc w narzędziu agenta może przejść przez dodatkowe przetwarzanie ucieczek, zanim tekst trafi do interpretera.

## Rozwiązanie

- Zmienne i argumenty ze spacjami przekazuj przez powłokę o przewidywalnym cytowaniu (PowerShell); w cmd tylko `set "N=w"` bez spacji przed `&&`.
- Skrypt albo tekst z ukośnikami wstecznymi zapisz do pliku narzędziem do plików i uruchom z pliku.
- Ustawienia eksperymentu trzymaj w podpowłoce albo jako prefiks jednego polecenia; czerwony wynik po eksperymencie powtórz w czystej powłoce.
- Projekt dostaje sekcję „Powłoka” w swoim `AGENTS.md` z regułami dla swojego launchera — tej klasy błędów nie złapie lint ani test.

## Warianty i pułapki

- Przeciek zmiennej: zmienna z eksperymentu została w powłoce i następna walidacja dała fałszywie czerwony wynik.
- `python -I` (tryb izolowany) ignoruje wszystkie `PYTHON*`, także `PYTHONIOENCODING` — wyjście spoza strony kodowej konsoli trzeba wypisać przez `ascii()` albo do pliku.
- Skrypt diagnostyczny nazwany jak moduł standardowy (`inspect.py`) zasłania go przy imporcie z katalogu skryptu.
- `uv --env-file` nie przyjmuje bezwzględnej ścieżki Windows w wartości — w pliku env ścieżki względne z `/`.

## Wystąpienia

- 2026-10-08–09 — harness — lekcje [warsztat] (12 wystąpień) — Codex na Windows, launcher przez cmd.exe; git, pytest, uv — wariant: rozbite argumenty, spacja w zmiennej, heredoc, przeciek zmiennej
