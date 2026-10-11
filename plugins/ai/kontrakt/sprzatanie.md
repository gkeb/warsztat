# Procesy i pliki robocze

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Sprzątanie — procesy i pliki tymczasowe

Praca agenta zostawia ślady: serwer deweloperski, który działa po końcu sesji i trzyma port, test w trybie watch, katalogi z raportami testów, pliki robocze. Zasada: **kto uruchamia albo tworzy, ten sprząta** — i najlepiej tak, żeby nie było czego sprzątać.

### Procesy

- **Zapobieganie.** Testy uruchamiasz w trybie jednorazowym (`vitest run`, `jest --watchAll=false`, `pytest`; w razie wątpliwości `CI=1`), nigdy w trybie watch. Test, który potrzebuje serwera, uruchamia go sam i sam zamyka (Playwright: `webServer` w konfiguracji; inne: `start-server-and-test` albo fixture z zamknięciem). Do sprawdzenia, czy coś działa, wystarczy zwykle test albo build — serwer deweloperski uruchamiasz tylko, gdy człowiek ma coś obejrzeć.
- **Długotrwały proces** (serwer deweloperski, podgląd, watch) uruchamiasz wyłącznie w tle przez mechanizm agenta (w Claude Code `run_in_background`), nigdy przez `&`, `start` ani `nohup`. Zapamiętujesz komendę, PID i port.
- **Zamykasz, zanim skończysz:** przed raportem ticketu, naprawy i przekazania — chyba że użytkownik chce, żeby serwer działał dalej (wtedy mówisz to w raporcie z PID-em i portem). Zamykasz całe drzewo, bo `npm run` uruchamia proces potomny: Windows `taskkill /PID <pid> /T /F`, Linux i macOS `kill -- -<pgid>` albo `pkill -P <pid>` i potem `kill <pid>`.
- **Nie twoje — nie zamykasz.** Procesy, których nie uruchomiłeś w tej sesji, tylko zgłaszasz. Nigdy `taskkill /IM node.exe`, `killall node` ani `pkill node` — zabijają VS Code, serwery języka, serwery MCP i inne projekty.
- **Pozostałości.** Hook na starcie sesji wypisuje procesy `node`, `python`, `deno` i `bun`, których linia poleceń wskazuje katalog projektu (z PID-em, czasem startu i portami). Pytasz użytkownika, czy je zamknąć — to może być jego własny serwer.

### Pliki i katalogi

- **Cache narzędzi to nie śmieci.** `.pytest_cache`, `.ruff_cache`, `.mypy_cache`, `.astro`, `node_modules/.vite`, `dist` przyspieszają pracę i odtwarzają się same — wystarczy, że są w `.gitignore`.
- **Pliki robocze agenta** (skrypty pomocnicze, wyniki pośrednie, zrzuty do obejrzenia) powstają poza repozytorium: w katalogu roboczym agenta (scratchpad w Claude Code) albo w katalogu tymczasowym systemu. Wyjątek: zrzuty rodzaju `wyglad` w `.ai/zrzuty/` (ignorowanym).
- **Testy sprzątają po sobie:** `tmp_path` w pytest, `fs.mkdtemp` z usunięciem w `afterEach` / `afterAll` w testach TypeScript. Test, który zostawia pliki w repo, to uwaga dla przeglądu.
- **Lista śmieci** `warsztat.json` → `sprzatanie.smieci`: ścieżki i wzorce (składnia `.gitignore`) bezpieczne do usunięcia w każdej chwili — raporty i wyniki narzędzi (`test-results/`, `playwright-report/`, `coverage/`, `htmlcov/`, `.coverage`, `tmp/`, `npm-debug.log*`). Ustawia ją `start` według stosu; każdy wpis jest też w `.gitignore`.
- **Usuwanie:** elementy z listy usuwasz bez pytania i wymieniasz w raporcie. Nowy plik albo katalog spoza listy, który powstał w sesji → pytasz: usunąć, dopisać do listy śmieci (i `.gitignore`), dopisać tylko do `.gitignore` albo zostawić.
- **Nigdy `git clean -X`, `-x` ani `-fdX`** — usuwają wszystko, co ignorowane, łącznie z `.env`, `node_modules` i `.venv`. Usuwasz konkretne ścieżki z listy, sprawdzone `git status --short --ignored`, i tylko wewnątrz repozytorium.
