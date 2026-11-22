# Badanie: jak skill lub hook jednego pluginu może niezawodnie odczytać pliki markdown z drugiego, osobno zainstalowanego pluginu (Claude Code i Codex CLI)

- Data: 2026-11-22
- Dla: ogólne (plugin warsztat, planowany plugin społeczności z wzorcami i profilami)
- Kontekst: dokumentacja Claude Code (code.claude.com, stan z 2026-11-22), dokumentacja Codex (developers.openai.com / learn.chatgpt.com), issues openai/codex. Nie sprawdzano kodu źródłowego Claude Code (zamknięty) ani lokalnej instalacji; kod Codex (codex-rs) nie został odczytany — próba pobrania pliku manifestu zwróciła 404.
- Pewność: średnia (Claude Code: wysoka dla pkt 1–2; Codex: niska–średnia, dokumentacja milczy w kilku miejscach)

## Odpowiedź

W Claude Code nie ma udokumentowanego sposobu odnalezienia katalogu *innego* pluginu: `${CLAUDE_PLUGIN_ROOT}` wskazuje wyłącznie na własny plugin, a ścieżka zawiera numer wersji i zmienia się przy aktualizacji. Udokumentowane są tylko układ `~/.claude/plugins/` oraz pliki rejestru `installed_plugins.json` (pole `installPath`) i `known_marketplaces.json`, więc odczyt przez rejestr jest możliwy, ale to czytanie plików stanu, nie API. Zależności (`dependencies`) istnieją w Claude Code, ale gwarantują tylko instalację i włączenie drugiego pluginu, nie dają jego ścieżki. W Codex nie znaleziono ani pola `dependencies` w manifeście pluginu, ani sposobu odnalezienia katalogu innego pluginu; udokumentowana jest tylko ścieżka cache i `PLUGIN_ROOT` własnego pluginu. Najpewniejszą alternatywą jest hook SessionStart drugiego pluginu, który sam wypisuje swoją ścieżkę (wniosek, nie zweryfikowany prototypem).

## Ustalenia

### 1. Gdzie leżą pliki i czy ścieżka zależy od wersji

**Claude Code**

1. Katalog główny pluginów to `~/.claude/plugins` (lub `CLAUDE_CODE_PLUGIN_CACHE_DIR`), a plugin z marketplace leży w katalogu z wersją. Cytat: „`cache/<marketplace>/<plugin>/<version>/` | One directory per installed version of a marketplace plugin. … `${CLAUDE_PLUGIN_ROOT}` points at this directory" oraz „Because `${CLAUDE_PLUGIN_ROOT}` points at a version directory, a plugin's root path changes with every version." [1]
2. `<version>` to zwykle: pole `version` z manifestu, potem z wpisu marketplace, a gdy brak — skrót SHA commitu (12 znaków); dla lokalnego katalogu bez gita `unknown`. [1] Ustawienie `version` w manifeście przypina wersję („Setting it keeps users on that version until you change it"). [2]
3. Wyjątki — plugin ładowany „in place", bez kopiowania do cache: `--plugin-dir`, pluginy z `~/.claude/skills/`, pluginy o ścieżce względnej w marketplace dodanym z lokalnej ścieżki. Dla nich `CLAUDE_PLUGIN_ROOT` wskazuje katalog źródłowy. [1]
4. Stare wersje: „Claude Code writes an `.orphaned_at` marker into the previous version directory. It removes that directory in a background cleanup 14 days later". [1] Wniosek: zapamiętana ścieżka z numerem wersji przestaje istnieć po aktualizacji.
5. Rejestry (udokumentowane jako rekordy stanu, nie jako API): „`known_marketplaces.json` records each marketplace Claude Code has fetched, with its `source`, `installLocation`, `lastUpdated`, and `autoUpdate`" oraz „`installed_plugins.json` records each install with its `scope`, `installPath`, and `version`". [1] Pluginy ładują się przy starcie „from `installed_plugins.json` and the cache without using the network". [1] Marketplace z GitHub/URL jest sklonowany do `marketplaces/<name>/`; z lokalnego katalogu nie ma kopii, a `installLocation` to podana ścieżka. [1]
6. Zmienne: `${CLAUDE_PLUGIN_ROOT}` = „Absolute path of the plugin's installed version"; `${CLAUDE_PLUGIN_DATA}` = `~/.claude/plugins/data/<id>/`. Tabela zmiennych nie zawiera żadnej zmiennej wskazującej na inny plugin. [2] Skille podstawiają `${...}` w treści Markdown tylko dla własnego pluginu; zmienne „aren't present in the environment of commands Claude runs through the Bash tool". [2]
7. Pliki poza katalogiem pluginu nie są kopiowane: „Files outside the plugin directory aren't copied, so when a script inside a copied plugin reads a path above the plugin root, such as `../shared`, it doesn't find them". [1] Dotyczy to plików spoza pluginu przy kopiowaniu, nie czytania sąsiednich katalogów cache. Wyjątek: dowiązania symboliczne „between plugins within one marketplace" (strona host-marketplace, nie czytana w tym badaniu — tylko wzmianka w [1]).

**Codex**

8. Cache: „`~/.codex/plugins/cache/$MARKETPLACE_NAME/$PLUGIN_NAME/$VERSION/`. For local plugins, `$VERSION` is `local`." [3] Wersja w ścieżce jak w Claude Code.
9. `PLUGIN_ROOT` to „a Codex-specific extension that points to the installed plugin root"; hooki pluginu dostają też `PLUGIN_DATA`, a „Codex sets CLAUDE_PLUGIN_ROOT and CLAUDE_PLUGIN_DATA for compatibility". [4] Nie jest udokumentowana zmienna wskazująca inny plugin. [3][4]
10. Zastrzeżenie: issue #19582 zgłasza, że w `.mcp.json` Codex przekazywał `${CLAUDE_PLUGIN_ROOT}` dosłownie, bez podstawienia (dotyczy MCP, nie hooków; wersja z komentarza: Codex v0.130.0). [5] Podstawianie zmiennych różni się więc między komponentami i wersjami.

### 2. Zależności między pluginami

**Claude Code** — tak. `dependencies`: „Plugins that must be enabled for this one to work. Each entry is `"name"`, `"name@marketplace"`, or `{ "name": "...", "marketplace": "...", "version": "..." }`." [2] Zachowanie:
- Brakująca zależność jest instalowana automatycznie przy `claude plugin install`, `/reload-plugins`, auto-update, `claude plugin update` i `claude plugin marketplace add`. [6]
- Zależność z innego marketplace nie jest instalowana, dopóki root marketplace nie ma jej na liście `allowCrossMarketplaceDependenciesOn` — chyba że użytkownik zainstalował ją sam wcześniej: „By default, Claude Code doesn't install a dependency from a different marketplace than the declaring plugin's own, unless the user already has that dependency installed and enabled at the same scope." Przy deklaracji w `plugin.json` instalacja kończy się bez zależności, a plugin się nie ładuje. [6]
- Zakres wersji (semver) rozstrzyga się po tagach git `<plugin>--v<wersja>`. [6]
- Dokumentacja opisuje zależność jako plugin, „whose MCP server or skill it calls" [6]. Nie opisuje żadnego mechanizmu podania ścieżki katalogu zależności do pluginu zależnego. (Brak wzmianki w [2] i [6]; to ustalenie negatywne.)
- Gdy brak zależności lub jest wyłączona, plugin zależny się nie ładuje („is disabled — enable it or remove the dependency"). [6]

**Codex** — w dokumentacji budowania pluginów brak mechanizmu zależności między pluginami: „The page doesn't describe a plugin dependency mechanism" (wynik analizy strony [3]), a strona [7] również nie wspomina o zależnościach między pluginami. Jedyne znalezione „dependencies" to poziom skilla (`agents/openai.yaml`, `dependencies.tools` dla serwerów MCP) wg bloga — źródło wtórne, niepotwierdzone w dokumentacji. Kodu manifestu w codex-rs nie udało się odczytać.

### 3. Uprawnienia odczytu poza katalogiem projektu

**Claude Code**

11. Narzędzia odczytu (Read, Grep) nie pytają o zgodę tylko „within the working directory and additional directories". [8] Rozszerzenie: `--add-dir`, `/add-dir` lub `permissions.additionalDirectories`; pliki tam „become readable without prompts". [8] Z tego (wniosek) wynika, że odczyt narzędziem Read z `~/.claude/plugins/cache/...` spoza katalogów roboczych podlega zwykłemu mechanizmowi pytania; w tej dokumentacji nie znaleziono wyjątku dla cache pluginów. Nie zweryfikowano w praktyce.
12. Opcjonalne wzmocnienie: `permissions.blockReadsOutsideWorkingDirectories` — „the file tools refuse reads there". [8]
13. Wpisy `additionalDirectories` w `.claude/settings.json` projektu działają dopiero po akceptacji dialogu zaufania. [8] Plugin sam nie może dopisać `additionalDirectories` (w manifeście brak takiego pola; tabela pól w [2]).
14. Hook/skrypt uruchamiany przez Claude Code jest procesem command; czy podlega tym regułom narzędzi plikowych — nie ustalono ze źródła w tym badaniu. (Wniosek, niezweryfikowany: skrypt `node` z hooka czyta pliki z uprawnieniami systemowymi użytkownika, bez reguł Read; sandbox Bash jest osobnym, nieomawianym tu mechanizmem.)

**Codex**

15. Dokumentacja nie rozstrzyga, czy odczyt poza workspace wymaga zgody: strona o approvals podaje jedynie, że Codex „asks for approval to edit files outside the workspace" i nie omawia odczytu. [9] Sandbox „limits what it can touch (typically to the current workspace)". [9]
16. Maintainerzy w issue #5237 (wg streszczenia wyszukiwania, nie zweryfikowane bezpośrednio): sandbox blokuje zapis poza katalogiem roboczym, a nie odczyt. [10] Wtórne notatki z lektury kodu mówią o pełnym odczycie dysku, a nowsze profile uprawnień pozwalają na ograniczenia `read`/`deny` per ścieżka. [10][11] Domyślnie więc odczyt cache pluginów prawdopodobnie działa, ale przy niestandardowym profilu uprawnień może być zablokowany (wniosek).
17. Hooki pluginów Codex wymagają przeglądu i zaufania: „Installing or enabling a plugin doesn't automatically trust its hooks" [3]; „Codex requires a new review even if the hook definition stays the same" po zmianie skryptu. [4] Dokumentacja hooków nie mówi, czy komendy hooków działają w sandboxie. [4]

### 4. Alternatywy (wnioski; fakty w odnośnikach)

18. Hook SessionStart drugiego pluginu wypisujący własną ścieżkę — oparte na faktach: stdout SessionStart trafia do kontekstu w obu narzędziach (Codex: „Plain text on stdout is added as extra developer context" [4]); każdy plugin zna własny `CLAUDE_PLUGIN_ROOT` / `PLUGIN_ROOT` [2][4]. Zgodne z obecnym wzorcem hooka `stan.mjs` w warsztacie. Skille obu pluginów widzą wtedy wypisane ścieżki w kontekście sesji. Ograniczenie: ścieżka jest ważna do aktualizacji pluginu w trakcie sesji — „When a copied plugin updates mid-session, hook commands … keep using the previous version's path" [1]; wniosek: ścieżka wypisana przy starcie może wskazywać wersję usuwaną po 14 dniach, ale w sesji jest stabilna.
19. Wywołanie skilla drugiego pluginu po nazwie — Claude Code przestrzenia nazw: „Claude Code namespaces every component under it, so an agent `reviewer` in plugin `deploy-tools` appears as `deploy-tools:reviewer`". [2] Skille pluginu są wywoływane jako `/<plugin>:<skill>` [1]. Skill pluginu A może więc nazwać skill pluginu B (B dostarcza dane przez własną treść). Nie sprawdzono w dokumentacji, czy model może programowo wywołać skill innego pluginu bez kontroli użytkownika; i w Codex konwencja nazewnicza `plugin:skill` nie została potwierdzona. [7]
20. Plugin B jako zależność A (Claude Code): gwarantuje obecność B, a w połączeniu z pkt 18 (B wypisuje swoją ścieżkę) daje niezawodny odczyt. Dla Codex brak mechanizmu zależności, więc obecność B trzeba sprawdzać skryptem. (wniosek)
21. Klonowanie repozytorium do znanego katalogu (np. własny katalog w `${CLAUDE_PLUGIN_DATA}` lub w projekcie): `CLAUDE_PLUGIN_DATA` jest trwały między aktualizacjami, ale jest katalogiem *własnego* pluginu i „By default, Claude Code deletes the `${CLAUDE_PLUGIN_DATA}` directory when you uninstall the plugin". [1][2] Ścieżka stała, ale dane trzeba pobrać samemu (wniosek).
22. Marketplace jako repozytorium: marketplace z GitHub jest klonowany do `marketplaces/<name>/`, a `known_marketplaces.json` zapisuje `installLocation` — stały katalog bez numeru wersji, ale zawiera całe repozytorium marketplace (wszystkie pluginy), nie tylko zainstalowane. [1] Nieudokumentowane jako interfejs do czytania z innego pluginu.

## Niepewności

- Nie zweryfikowano w praktyce (prototypem) odczytu z `~/.claude/plugins/cache/` przez Read w Claude Code ani przez Node w hooku; reguły pytania o zgodę spoza katalogów roboczych wywnioskowano z tabeli uprawnień. Czy sama instalacja pluginu zmienia to zachowanie — brak informacji.
- Format i stabilność `installed_plugins.json` i `known_marketplaces.json`: opisane jako „records" (nazwy pól `scope`, `installPath`, `version`, `installLocation`), ale bez gwarancji schematu jako publicznego API; dokumentacja wspomina o odbudowie nieczytelnego pliku (strona troubleshooting, nieczytana).
- Codex: brak oficjalnej informacji o zależnościach między pluginami, o odnajdywaniu innego pluginu, o odczycie poza workspace, o sandboxie hooków. Struktura manifestu różni się (root `plugin.json` vs `.codex-plugin/plugin.json`), a dokumentacja dotyczy wersji z 2026-11; ścieżka cache pochodzi wyłącznie z dokumentacji [3], nie z kodu.
- Podstawianie `PLUGIN_ROOT` w Codex bywa niespójne między komponentami i wersjami (issue [5]); dla hooków dokumentacja [4] deklaruje obie zmienne.
- Czy skill pluginu A może wywołać skill pluginu B w Codex — nieustalone.
- Źródła wtórne użyte tylko jako wskazówki: blogi o Codex (pkt 2, `dependencies.tools`), streszczenia issues #5237 i gist o sandboxie (pkt 16).

## Źródła

[1] Plugin loading reference — https://code.claude.com/docs/en/plugins/loading.md — dokumentacja — stan 2026-11-22
[2] Plugin manifest reference — https://code.claude.com/docs/en/plugins-reference — dokumentacja — stan 2026-11-22
[3] Build plugins (Codex) — https://developers.openai.com/codex/plugins/build/ — dokumentacja — stan 2026-11-22
[4] Hooks (Codex) — https://learn.chatgpt.com/docs/hooks (przekierowanie z https://developers.openai.com/codex/hooks) — dokumentacja
[5] Codex CLI does not expand ${CLAUDE_PLUGIN_ROOT} in plugin .mcp.json — https://github.com/openai/codex/issues/19582 — issue — Codex ok. v0.130.0
[6] Plugin dependencies — https://code.claude.com/docs/en/plugins/dependencies.md — dokumentacja — stan 2026-11-22
[7] Build plugins (learn.chatgpt.com) — https://learn.chatgpt.com/docs/build-plugins.md — dokumentacja
[8] Configure permissions (Claude Code) — https://code.claude.com/docs/en/permissions.md — dokumentacja
[9] Agent approvals and security / Sandbox (Codex) — https://learn.chatgpt.com/docs/agent-approvals-security oraz https://learn.chatgpt.com/docs/sandboxing — dokumentacja
[10] Codex reads files outside working directory without my permission — https://github.com/openai/codex/issues/5237 — issue (streszczenie z wyszukiwarki, nie odczytane wprost)
[11] Codex sandboxing notes — https://gist.github.com/rtzll/8ec03ad8a4cca3ae43ce3db7eb7dcc09 — źródło wtórne (gist), niepotwierdzone w kodzie
