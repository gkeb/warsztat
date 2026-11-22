# Pomiar kontekstu startowego Warsztatu w Codexie

- Data: 2026-11-22
- Status: nierozstrzygniety dla dostarczenia kontekstu. Odczyt jawnie wskazanego pliku poza projektem potwierdzony.
- Procedura: kontynuacja `.ai/eksperymenty/2026-11-22-hook-pluginu-spolecznosci-codex.md` z commita `e3c769b44d6ec4666841dcd99f43ff9339a86cd1` na gałęzi `zdolnosc/model-zgloszen`.
- Środowisko: Windows, klient z rozszerzenia VS Code `codex-cli 0.171.0-alpha.13`, Node `22.17.1`, GPT-6.2-Sol. `thread/start` potwierdził `readOnly`, `networkAccess=false` i `approvalPolicy=never`. Uruchomienie App Server przez stdio.

## Instalacja i sprawdzian Warsztatu

`codex plugin add ai@warsztat-local` zaktualizował lokalny plugin z `0.26.2` do `0.27.0` z commita `cc59e15`. `codex plugin list --marketplace warsztat-local --json` potwierdził wersję, instalację i włączenie. Kopia `scripts/stan.mjs` z cache była identyczna bajtowo z plikiem w repozytorium. Oba testy z `node --test tests/stan-hook.test.mjs` przeszły.

Bezpośrednie uruchomienie zainstalowanego skryptu z wejściem `SessionStart` dla tego repozytorium zakończyło się kodem 0. JSON zawierał 13 wierszy `additionalContext`, w tym `[warsztat] Stan projektu z .ai/ (pełny obraz: skill gdzie)` i pozycję `model-zgloszen` ze statusem `grill`.

Świeży wątek dla tego samego repozytorium dostał pytanie o nagłówek i jeden wiersz kontekstu startowego, z zakazem używania narzędzi. Odpowiedź to `BRAK_KONTEKSTU`. `hooks/list` zwrócił pustą listę, a w turze nie było zdarzeń hooka. Po podpięciu tego samego zainstalowanego skryptu przez flagę sesji pojawiły się `hook/started` i `hook/completed` (`completed`, 1171 ms, `entries=[]`). Odpowiedź modelu ponownie brzmiała `BRAK_KONTEKSTU`.

## Trzy przypadki

| Przypadek | Dowód wykonania | Wynik modelu |
| --- | --- | --- |
| JSON `hookSpecificOutput.additionalContext` | `hooks/list` potwierdził stan `trusted`. Skrypt uruchomiony bezpośrednio przez hook zapisał `executed` do pliku śladu. Osobna kontrola Node potwierdziła jego stdout z oczekiwanym znacznikiem. `hook/completed` miał status `completed`, 983 ms i `entries=[]`. | `NO_STARTUP_MARKER`. Nie było wywołania narzędzia ani elementu `hookPrompt`. |
| Krótki tekst bez `[` zapisany przez `console.log` | Ten sam przebieg. Skrypt zostawił `executed`. Kontrola Node zwróciła oczekiwany znacznik. `hook/completed` miał status `completed`, 1057 ms i `entries=[]`. | `NO_STARTUP_MARKER`. Nie było wywołania narzędzia ani elementu `hookPrompt`. |
| Jawna ścieżka pliku spoza projektu | Prompt zawierał `../../outside/INDEX.txt` względem katalogu projektu. `commandExecution` z `Get-Content -LiteralPath '../../outside/INDEX.txt' -ErrorAction Stop` zakończył się kodem 0 i zwrócił jedyny wiersz pliku. | dokładny losowy znacznik z pliku (wartość pominięta w zapisie). Nie było prośby o zgodę. |

Kontrola porównawcza użyła jednego skryptu uruchamiającego przypadek według katalogu sesji. Dla starego formatu `[warsztat] …`, JSON-u i krótkiego tekstu pojawiło się `completed` z pustymi `entries`, lecz zabrakło śladów wykonania właściwych skryptów. Procesy wspólnego skryptu pozostały aktywne po zakończeniu tur i zamknięto je przy sprzątaniu. Dlatego tych trzech prób nie użyto do oceny formatów. W pomiarze końcowym JSON-u i tekstu każdy skrypt uruchamiano wprost, z odrębnym znacznikiem.

W izolowanym profilu nie było logowania. Po instalacji syntetycznego pluginu App Server nie pokazał jego hooka w `hooks/list`. Tury modelu użyły zalogowanego profilu i odrębnych katalogów tymczasowych. Hooki kontrolne podano jako `hooks.SessionStart` na czas procesu App Server, a `hooks.state` zawierało zaufany odcisk wyłącznie tej definicji, odczytany i sprawdzony przez `hooks/list`. Przeglądu `/hooks` nie wykonano. Zaufanie ustawione tym sposobem nie potwierdza wykrywania hooków zainstalowanego pluginu ani standardowej ścieżki zatwierdzania.

## Odtworzenie

1. Sprawdź `codex --version`, `node --version`, `codex plugin list --marketplace warsztat-local --json` i `node --test tests/stan-hook.test.mjs`.
2. W katalogu tymczasowym przygotuj osobny projekt dla każdej próby. Dwa skrypty Node niech zapiszą ślad do pliku i wyślą `console.log` z losowym znacznikiem odpowiednio wewnątrz JSON-u `SessionStart` i w krótkim tekście. Sprawdź stdout poza Codexem. W trzeciej próbie umieść osobny znacznik wyłącznie w `outside/INDEX.txt`, poza katalogiem `projects/explicit`.
3. Użyj `codex app-server --listen stdio:// --enable hooks -c 'windows.sandbox="unelevated"'`. W kontrolach stdout podaj komendę z pełnymi ścieżkami do `node.exe` i skryptu w `hooks.SessionStart`. Odczytaj `key` i `currentHash` przez `hooks/list`, przekaż odcisk jako `hooks.state` nowego procesu i ponownie sprawdź stan. W każdym przypadku użyj `thread/start` z `sandbox=read-only`, `approvalPolicy=never`, `ephemeral=true` oraz właściwym `cwd`.
4. W `turn/start` poproś model o dokładny znacznik z otrzymanego kontekstu, bez używania narzędzi. W odrębnym wątku podaj `../../outside/INDEX.txt` wprost i poproś o odczyt tego jednego pliku. Zapisz `hook/started`, `hook/completed`, ukończone elementy narzędzi i odpowiedź końcową. W sprawdzianie Warsztatu użyj pytania o nagłówek i jeden konkretny wiersz `SessionStart`, również bez narzędzi.

## Wniosek

W obu końcowych próbach stdout skrypt zostawił ślad wykonania, lecz model nie dostał znacznika w testowanej konfiguracji App Server. Bez dowodu, jakie bajty Codex przechwycił z procesu hooka, przyczyna i wpływ formatu wyjścia pozostają nieustalone. Zainstalowany Warsztat generuje poprawny JSON, a sprawdzian świeżej sesji nadal nie potwierdza dostarczenia kontekstu. Próba z jawną ścieżką potwierdza odczyt spoza projektu w tych uprawnieniach.

Pomiar objął 8 ukończonych tur w świeżych wątkach, łącznie 170 807 tokenów według klienta, bez informacji o kwocie. Dodatkowa próba `codex exec` nie zwróciła zdarzeń tury. Warunek powrotu to sprawdzić krótki znacznik w natywnym TUI po przeglądzie hooka i zestawić go ze zdarzeniami App Server dla tej samej definicji.
