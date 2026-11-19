# Środowisko sesji agenta różni się od terminala użytkownika

- Status: kandydat
- Hasła: PATH, wersja Node, nvm, menedżer wersji, .nvmrc, engines, zmienne środowiskowe, Windows, Git Bash, VS Code, sesja agenta

## Sygnały

- Runner testów albo kompilator kończy się błędem, który nie wskazuje wersji (np. „failed to find the current suite”, błąd składni w zależności, brak API).
- Ta sama komenda w terminalu użytkownika przechodzi.
- `node --version` (albo `python --version`, `which <narzędzie>`) w sesji agenta zwraca starszą wersję niż przypięta w projekcie.
- Agent wnioskuje „wersja nie jest zainstalowana”, bo nie ma jej w PATH sesji.

## Warunki

Sesja agenta (rozszerzenie IDE, CLI uruchomione z innej powłoki, podproces) dziedziczy PATH i zmienne z procesu nadrzędnego, który wystartował wcześniej albo inaczej niż terminal użytkownika: przed instalacją nowej wersji, bez inicjalizacji menedżera wersji (nvm, fnm, volta, pyenv), z innej powłoki (Git Bash zamiast PowerShella, `cmd.exe` w podwyższonym wywołaniu).

Nie dotyczy:

- Sandbox agenta blokuje dostęp do cache albo katalogów tymczasowych — to [sandbox-agenta-odcina-cache-narzedzi](sandbox-agenta-odcina-cache-narzedzi.md); wersja jest wtedy właściwa.
- Argumenty albo zmienne zniekształca powłoka pośrednicząca — to [powloka-posredniczaca-zmienia-argumenty](powloka-posredniczaca-zmienia-argumenty.md).
- Wersja jest naprawdę niezainstalowana na maszynie (brak w żadnym katalogu instalacji).

## Mechanizm

Zmienne środowiskowe procesu są kopiowane w chwili jego startu. Instalator nowej wersji albo menedżer wersji zmienia PATH dla nowych terminali, ale proces IDE i uruchomione z niego sesje agenta zachowują stary. Kilka instalacji (systemowa i użytkownika) współistnieje, a o tym, która wygrywa, decyduje kolejność w odziedziczonym PATH. Narzędzia rzadko sprawdzają wersję środowiska uruchomieniowego, więc niezgodność objawia się późno i niejasno.

## Rozwiązanie

- Automat na wejściu: skrypt uruchamiany przed buildem i testami (nie przed kontrolami, które hook agenta uruchamia w środowisku sesji) porównuje wersję środowiska z plikiem przypięcia (`.nvmrc`, `.python-version`) i kończy się od razu czytelnym błędem z podpowiedzią, gdzie leży właściwa wersja. `engines` w `package.json` nie wystarcza — npm sprawdza go tylko przy instalacji, i to ostrzeżeniem.
- W instrukcji projektu (sekcja uruchamiania w `AGENTS.md`) — gdzie jest właściwa instalacja i jak dołożyć ją na początek PATH w sesji; sprawdzaj `--version` przed walidacją.
- Brak wersji w PATH sesji nie dowodzi braku instalacji — sprawdź katalogi instalacji użytkownika, zanim zaproponujesz instalację.

## Warianty i pułapki

- Ta sama komenda działa w PowerShellu, a pada w Git Bash tej samej sesji — inna powłoka, inny PATH albo inne zachowanie narzędzia.
- Podwyższone wywołanie przez `cmd.exe` może zgubić zmianę PATH ustawioną w cytowanym `set` — wtedy jawna ścieżka do interpretera.
- Strażnik wersji podpięty pod typecheck zablokował hook kontroli agenta, który działa w środowisku sesji, choć sam kompilator działał na starszej wersji. Podpinaj go tylko pod kroki, które naprawdę wymagają przypiętej wersji (build, testy).

## Wystąpienia

- 2026-11-18 — tenta — lekcja [projekt] PATH sesji agenta (6 wystąpień w jednej zdolności) — TypeScript, Node 26 w katalogu użytkownika, Node 22 systemowy w PATH sesji VS Code, Windows 10, vitest 5 — wariant: Git Bash i `cmd.exe`
