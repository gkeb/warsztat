# Profil: cli

> Narzędzie wiersza poleceń — od skryptu ułatwiającego jedno zadanie po narzędzie publikowane w rejestrze pakietów. Python albo TypeScript. Używaj razem z profilem `przekrojowe`. Format: sekcja „Profile” w kontrakcie warsztatu.
> Mały pomocnik na własny użytek: wiele pozycji kończy się `pominięte: tylko lokalnie` — to też decyzja, nie przeoczenie.

## Decyzje

### Kształt

- **CLI-01 Kształt i nazwa** — jedno polecenie czy podkomendy (`narzedzie <czasownik> <obiekt>`); nazwa krótka, bez kolizji z istniejącymi poleceniami w `PATH` (sprawdź `where` / `which`).
- **CLI-02 Parser argumentów** — Python: `argparse` (bez zależności), `typer` albo `click`; TypeScript: `node:util` `parseArgs` (bez zależności), `commander`, `citty`. Wybór wpływa na pomoc, uzupełnianie i testy.
- **CLI-03 Wejście** — argumenty pozycyjne, flagi, stdin (konwencja `-`), pliki. Na Windows powłoka nie rozwija wzorców (`*.md`) — program robi to sam albo przyjmuje tylko ścieżki.

### Wyjście i zachowanie

- **CLI-04 Wyjście** — wyniki na stdout, komunikaty, postęp i błędy na stderr. Tryb dla maszyn (`--json`) — tak czy nie. Kolory tylko w terminalu (TTY) i z poszanowaniem `NO_COLOR`. `--quiet` / `--verbose`.
- **CLI-05 Kody wyjścia** — `0` sukces, `1` błąd, `2` złe użycie; własne kody tylko udokumentowane w pomocy.
- **CLI-06 Konfiguracja** — kolejność: flaga > zmienna środowiskowa > plik projektu > plik użytkownika > domyślne. Katalogi użytkownika przez `platformdirs` (Python) albo `env-paths` (Node), nie na sztywno `~/.config`.
- **CLI-07 Interaktywność** — pytania tylko w terminalu; w skrypcie i CI program nie czeka na wejście. `--yes` dla potwierdzeń.
- **CLI-08 Operacje niebezpieczne** — usuwanie, nadpisywanie, wysyłka: potwierdzenie albo `--dry-run`; powtórne uruchomienie nie psuje stanu (idempotencja); Ctrl+C sprząta pliki tymczasowe.
- **CLI-09 Długie operacje** — postęp na stderr, limity czasu, równoległość, wznowienie po przerwaniu.
- **CLI-10 Systemy** — Windows, macOS, Linux czy tylko jeden. Ścieżki przez `pathlib` / `node:path`, kodowanie UTF-8 w konsoli Windows, końce linii, wywołanie (`shebang` nie działa na Windows — entry point pakietu działa).
- **CLI-11 Czas startu** — ile może trwać `--help`. W Pythonie ciężkie importy leniwie, wewnątrz poleceń.

### Dystrybucja

- **CLI-12 Instalacja** — tylko w repo (skrypt `uv run`, `npm run`, `npx tsx`); globalnie z pakietu (Python: `[project.scripts]` + `uv tool install` / `pipx`; TypeScript: pole `bin` + build + `npm i -g`); pojedyncza binarka (PyInstaller, `bun build --compile`). Rejestr publiczny (PyPI, npm) czy prywatny.
- **CLI-13 Wersja** — `--version`, odczytana z metadanych pakietu, nie wpisana drugi raz w kodzie.
- **CLI-14 Pomoc** — `--help` z przykładami użycia dla każdego polecenia; uzupełnianie w powłoce — tak czy nie.

## Doświadczenie (UX)

- **CLI-20 Komunikaty błędów** — co się stało, dlaczego, co zrobić („Brak pliku config.toml w bieżącym katalogu. Uruchom `narzedzie init` albo podaj `--config`.”). Bez śladu stosu domyślnie — tylko z `--debug`.
- **CLI-21 Podpowiedzi** — literówka w poleceniu → „czy chodziło o…”; brak argumentu → krótkie użycie, nie cała pomoc.
- **CLI-22 Pierwsze uruchomienie** — co widzi ktoś, kto uruchamia narzędzie bez argumentów.
- **CLI-23 Wynik** — czytelny dla człowieka domyślnie (tabela, podsumowanie), stabilny dla maszyn w `--json`. Zmiana formatu `--json` to zmiana publicznego interfejsu.

## Testy akceptacyjne

Publiczny interfejs to wywołanie polecenia. Test akceptacyjny uruchamia je tak, jak zrobi to użytkownik, i sprawdza: kod wyjścia, stdout, stderr i skutki (pliki, wywołania sieci na granicy).

- Python: `typer.testing.CliRunner` / `click.testing.CliRunner` albo `subprocess.run` na zainstalowanym entry poincie; `pytest` z `tmp_path` jako katalogiem roboczym.
- TypeScript: uruchomienie zbudowanego pliku (`execa` albo `node:child_process`) z `vitest`; katalog tymczasowy.
- Pomoc i wynik tekstowy: testy migawkowe (snapshot) — zmiana jest widoczna w diffie.
- Kolory i sterowanie terminalem: testy także z wymuszonym terminalem i kolorami (tak działa CI, np. GitHub Actions) oraz z `NO_COLOR` — biblioteki formatujące potrafią zignorować `NO_COLOR`, gdy terminal jest wymuszony. Lokalny przebieg bez TTY tego nie pokaże.
- Co najmniej jeden test uruchamia narzędzie po instalacji z pakietu, nie z kodu źródłowego (wyłapuje brakujące pliki i entry point).

## Niedowiezienia

- komunikat albo postęp na stdout (psuje potoki `| jq`, `> plik`);
- kod `0` przy błędzie albo `1` przy złym użyciu;
- brak obsługi: pliku nie ma, brak uprawnień, pusty stdin, przerwanie Ctrl+C;
- ścieżki liczone od katalogu roboczego zamiast od pliku albo konfiguracji; separator `/` na sztywno;
- pytanie interaktywne w trybie nieinteraktywnym (zawiesza CI);
- działa z repo, nie działa po instalacji: brak entry pointu, brak plików danych w pakiecie;
- `--help` bez nowej flagi albo polecenia; wersja wpisana na sztywno.

## Wydanie

- podbicie wersji według P-15 (nowa flaga → minor, zmiana zachowania albo formatu `--json` → major);
- build artefaktu i instalacja w czystym środowisku: `uv build` + `uv tool install dist/*.whl`, albo `npm pack` + `npm i -g ./*.tgz`;
- sprawdzenie po instalacji: `narzedzie --version`, `narzedzie --help`, jedno typowe polecenie;
- publikacja (`uv publish`, `npm publish`) albo tylko tag — za zgodą;
- wycofanie: rejestry nie pozwalają nadpisać wersji — wydajesz poprawkę; `npm deprecate` / „yank” na PyPI dla złej wersji.

## Pielęgnacja

- zależności i audyt;
- wspierane wersje Pythona / Node (dodaj nową, usuń po EOL — zmiana `requires-python` / `engines`);
- czy narzędzie nadal się instaluje z rejestru (raz na jakiś czas, w czystym środowisku).
