# Badanie: jak wyjście hooka SessionStart w Codex CLI trafia do kontekstu modelu (plugin vs inne źródła, odczyt poza workspace w read-only, PreToolUse allow)

- Data: 2026-11-22
- Dla: ogólne (zdolność model-zgloszen, eksperyment [hook pluginu społeczności w Codex](../eksperymenty/2026-11-22-hook-pluginu-spolecznosci-codex.md))
- Kontekst: Codex CLI 0.171.0-alpha.13, Windows, `sandbox_mode = "read-only"`, `windows.sandbox = "unelevated"`. Kod czytany ze znacznika `rust-v0.171.0-alpha.13` (pkt 1) albo z `main` (oznaczone). Narzędzie pobierania stron streszcza treść, więc cytaty z kodu i dokumentacji pochodzą z tych streszczeń, nie z własnego odczytu plików.
- Pewność: średnia (pkt 1, 2, 4 — wysoka co do reguł; niska co do przyczyny braku kontekstu w eksperymencie; pkt 3 — średnia dla Linuksa/protokołu, niska dla Windows unelevated)

## Odpowiedź

1. Zwykły tekst na stdout (exit 0) jest dokumentowany i zaimplementowany jako kontekst modelu; JSON nie jest wymagany. Wyjątek: stdout zaczynający się od `{` lub `[` jest traktowany jako JSON, a gdy nie jest poprawny, hook dostaje status `Failed` i nic nie trafia do kontekstu. Wyjście `stan.mjs` zaczyna się od `[warsztat]`, więc w wersji z kodu trafia dokładnie w tę pułapkę (wniosek). Schemat JSON: `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"..."}}` plus pola wspólne (`continue`, `stopReason`, `systemMessage`, `suppressOutput`).
2. Hooki pluginów używają tego samego schematu zdarzeń i tego samego parsera; różnica dotyczy zaufania (wymagają przeglądu), nie wstrzykiwania kontekstu.
3. Dokumentacja nie rozstrzyga; kod protokołu mówi, że `read-only` to odczyt całego dysku (`:root` = read). Dla Windows `unelevated` nie ustalono.
4. Tak, ale tylko w znaczeniu przepisania wejścia: `permissionDecision: "allow"` z `updatedInput`. Dokumentacja PreToolUse nie mówi, że `allow` omija sandbox lub zatwierdzanie; to zdanie występuje przy PermissionRequest.

## Ustalenia

### 1. Wyjście SessionStart

1. Dokumentacja: „Plain text on `stdout` is added as extra developer context." JSON na stdout wspiera pola wspólne i kształt z `"hookEventName": "SessionStart"` oraz `additionalContext`; „That `additionalContext` text is added as extra developer context." [1]
2. Kod (znacznik 0.171.0-alpha.13), `parse_completed` dla SessionStart: dla exit code 0 puste stdout (po trim) nic nie dodaje, status `Completed`; poprawny JSON → `additional_context` trafia do kontekstu modelu, `system_message` staje się wpisem `Warning`; „looks like JSON but didn't parse" → status `Failed` i wpis `Error` z tekstem „hook returned invalid session start JSON output"; w pozostałych przypadkach przycięty stdout jest dodawany jako kontekst (`let additional_context = trimmed_stdout.to_string();`). Test `plain_stdout_becomes_model_context`: `"hello from hook\n"` daje jeden wpis `Context` o tekście „hello from hook" i status `Completed`. [2] (Numery linii z `main`: `parse_completed` ok. l. 228, gałąź zwykłego tekstu ok. l. 313–322, test ok. l. 391 — przybliżone, odczytane przez streszczenie. [3])
3. Kod, `looks_like_json`: `trimmed.starts_with('{') || trimmed.starts_with('[')` po `trim_start()`. Parser: `parse_session_start` → `parse_json::<SessionStartCommandOutputWire>`, zwraca `None` przy błędzie. [4]
4. `stan.mjs` kończy się `process.stdout.write(wyjscie.join('\n') + '\n')`, a pierwsza linia to `[warsztat] Stan projektu z .ai/ ...` [5]. Skoro zaczyna się od `[`, wg punktu 2–3 byłby uznany za „wygląda jak JSON", nie sparsowałby się i dałby `Failed` bez kontekstu (wniosek z kodu; nie testowane na prawdziwym `stan.mjs`).
5. Zgodne niezależne zgłoszenie: blog (Codex CLI 0.120.0, macOS) opisuje błąd TUI `hook returned invalid session start JSON output` przy zwykłym tekście, tezę „output zaczynający się od `[` jest walidowany jako JSON" i zalecenie `hookSpecificOutput.additionalContext`. [6] Źródło wtórne, nie opiekunowie.
6. Wersje: `hookSpecificOutput.additionalContext` jest też opisany jako wire field w narzędziach firm trzecich [7] (nieoficjalne). Od której wersji obowiązuje schemat — nie ustalono (nie znaleziono PR ani changeloga wprowadzającego). Blog dowodzi, że schemat działał w 0.120.0 [6].
7. Dokumentacja: dla Stop/SubagentStop zwykły tekst jest nieprawidłowy; dla PreToolUse, PermissionRequest, PostToolUse, PreCompact, PostCompact jest ignorowany. Dla SessionStart to jedyne z tych zdarzeń, gdzie zwykły tekst jest kontekstem. [1]
8. „Exit `0` with no output is treated as success and Codex continues." [1] Dokumentacja nie wymienia „entries".
9. Dostarczone dane z eksperymentu: oba hooki miały `status=completed` i `entries=[]`. Wg kodu `entries=[]` przy `Completed` oznacza pusty (po trim) stdout widziany przez Codex (nie JSON-wygląda-ale-zły, bo to dałoby `Failed` i wpis `Error`; nie zwykły tekst, bo to dałoby wpis `Context`). [2] Wniosek: w eksperymencie Codex nie dostał żadnego stdout od obu hooków. To inna przyczyna niż pułapka `[`.

### 2. Plugin a inne źródła

1. „Plugin hooks use the same event schema as other hooks. Review and trust them before they run." „If a plugin update changes a bundled script, Codex requires a new review even if the hook definition stays the same." [1]
2. Źródła hooków: `hooks.json` systemowy, użytkownika (`$CODEX_HOME/hooks.json`), projektu (`.codex/hooks.json`), `[hooks]` w `config.toml`, pluginy (`hooks/hooks.json` w katalogu pluginu albo wpis `hooks` w `.codex-plugin/plugin.json`). „Matching hooks from all sources run." [1]
3. Plugin dostaje `PLUGIN_ROOT`, `PLUGIN_DATA` oraz `CLAUDE_PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA`. [1]
4. W przejrzanym kodzie `common.rs` (`append_additional_context`, wersja `main`) nie ma rozróżnienia źródła `plugin`; jedyny filtr dotyczy `HandlerSourcePath::ExecutorScoped` i nie wiadomo, czy to pluginy. [8] Parser i ścieżka kontekstu są wspólne dla wszystkich handlerów SessionStart [2]. (Wniosek: brak różnicy; nie przeczytano całego kodu odkrywania hooków.)
5. Niepotwierdzone: zgłoszenie [9] (Desktop, CLI 0.129–0.166, także Windows i wtyczki) opisuje hooki, które nie są wywoływane w Desktop/app-server mimo działania w CLI/TUI; przyczyna nie została potwierdzona przez opiekunów. Eksperyment użył App Server i TUI.

### 3. Odczyt poza workspace w read-only

1. Dokumentacja sandboxingu: „The agent can inspect files, but it can't edit files or run commands without approval." Nic o odczycie poza workspace, `readable_roots`, ani o `unelevated` vs `elevated` [10]. Strona bezpieczeństwa: Windows obsługuje MXC, „with `elevated` and `unelevated` as legacy fallbacks"; bez opisu różnic [11].
2. Dokumentacja uprawnień: reguły `[permissions.<name>.filesystem]` mają `read`, `write`, `deny` („`deny` takes precedence over `write`, and `write` takes precedence over `read`"); `:read-only` „keeps local command execution read-only"; `:root` ma być używane „only when a profile intentionally needs broad read coverage"; `:minimal` to „Platform and runtime paths needed by common tools". Strona nie mówi, czy `:read-only` czyta cały dysk. [12] Nie znaleziono ustawienia `readable_roots`; `writable_roots` występuje w `sandbox_workspace_write` (tylko zapis; dokumentacja [11] opisuje `<writable_root>`).
3. Kod protokołu (0.171.0-alpha.13): `read_only()` buduje politykę z jednym wpisem `FileSystemSpecialPath::Root` w trybie `Read`; `has_full_disk_read_access_for_convention` zwraca true dla `Root` z read i bez deny-read; `get_readable_roots_with_cwd` zwraca pustą listę, gdy jest odczyt całego dysku. [13] Zatem na poziomie polityki `read-only` = odczyt całego dysku, bez workspace jako ograniczenia (źródło: kod).
4. Nie znaleziono kodu ani dokumentacji, jak Windows `unelevated` egzekwuje tę politykę (README `windows-sandbox-rs` i strona `docs/windows` zwróciły 404). Eksperyment [14] mówi tylko, że model nie otrzymał ścieżki, więc odczyt nie był próbowany; wniosek o odczycie poza projektem „pozostaje nieustalony".

### 4. PreToolUse i allow

1. „To rewrite a supported tool call without blocking, return `permissionDecision: "allow"` with `updatedInput`". „Return `updatedInput` only with `permissionDecision: "allow"`; other `updatedInput` shapes are reported as errors." [1]
2. `deny` (z `permissionDecisionReason`), legacy `decision: "block"` i exit 2 blokują. `ask` jest „parsed but not supported yet": hook jest oznaczony jako failed, a wywołanie narzędzia trwa. [1]
3. Dokumentacja PreToolUse nie mówi, że `allow` pomija zatwierdzenie lub sandbox. Zdanie, że `allow` pozwala żądaniu przejść bez monitu o zatwierdzenie, występuje w sekcji PermissionRequest. [1] (Wniosek: odpowiednik „zezwól na odczyt" to hook `PermissionRequest` z allow, nie PreToolUse; sprawdzono tylko streszczenie, nie schemat PermissionRequest.)
4. PreToolUse wspiera tylko `systemMessage` z pól wspólnych; `continue`, `stopReason`, `suppressOutput` powodują błąd hooka (wywołanie trwa). Zwykły tekst na stdout jest ignorowany. [1]

## Niepewności

- Przyczyna braku kontekstu w eksperymencie 0.171.0-alpha.13 nie jest ustalona. Z kodu wynika, że `entries=[]` przy `completed` oznacza pusty stdout po stronie Codexa, a nie odrzucenie zwykłego tekstu. Hipotezy do sprawdzenia (nie potwierdzone): hook wypisał do stdout przez `fs.writeSync(1, ...)` w sposób, który nie dotarł do Codexa na Windows/`commandWindows`; `hook/completed` w App Server nie przenosi pełnych wpisów; rozbieżność wersji kodu (czytano znacznik, ale nie przeprowadzono go). Test rozstrzygający: ten sam hook z JSON `hookSpecificOutput.additionalContext`, hook z krótkim tekstem bez `[`, osobno z `console.log`.
- Dla `stan.mjs`: prefiks `[warsztat]` będzie błędem w tej wersji kodu (wniosek). Nietestowane. Pole `entries` w `hook/completed` nie zawierałoby kontekstu, lecz wpis `Error` i status `Failed`.
- Wersja, od której obowiązuje `additionalContext` i zwykły tekst — nie ustalono. Zgłoszenia innych użytkowników (0.149.1, 0.154.0 na Windows z błędem „invalid session start JSON output") pochodzą z wyników wyszukiwania i nie zostały zweryfikowane w źródle.
- Windows `unelevated`: brak źródła pierwotnego o egzekwowaniu odczytu. Rozstrzygnie tylko próba z jawną ścieżką pliku spoza projektu, jak w planie eksperymentu.
- Struktura `SessionStartCommandOutputWire` (czy `deny_unknown_fields`) nie została odczytana; test `{"unexpectedField":true}` dla UserPromptSubmit sugeruje odrzucanie nieznanych pól (wniosek, nie ustalone dla SessionStart).
- Dokumentacja jest „release behavior reference"; `main` może mieć pola nowsze niż wydanie [1].

## Źródła

[1] Hooks — https://learn.chatgpt.com/docs/hooks (przekierowanie z https://developers.openai.com/codex/hooks) — dokumentacja — stan na 2026-11-22, bez numeru wersji
[2] codex-rs/hooks/src/events/session_start.rs — https://raw.githubusercontent.com/openai/codex/rust-v0.171.0-alpha.13/codex-rs/hooks/src/events/session_start.rs — kod — 0.171.0-alpha.13 (opis z streszczenia)
[3] ten sam plik na main — https://github.com/openai/codex/blob/main/codex-rs/hooks/src/events/session_start.rs — kod — main, 2026-11-22
[4] codex-rs/hooks/src/engine/output_parser.rs — https://raw.githubusercontent.com/openai/codex/rust-v0.171.0-alpha.13/codex-rs/hooks/src/engine/output_parser.rs — kod — 0.171.0-alpha.13
[5] c:\progs\repo\plugins\ai\scripts\stan.mjs, l. 136 i 474 — plik lokalny
[6] Codex CLI v0.120 SessionStart — https://dev.classmethod.jp/articles/codex-cli-session-start-hook-clear-distinction/ — blog (wskazówka) — 0.120.0
[7] agent-hooks-bridge, session context — https://pivanov.github.io/agent-hooks-bridge/guides/session-context.html — strona firm trzecich — bez wersji
[8] codex-rs/hooks/src/events/common.rs — https://raw.githubusercontent.com/openai/codex/main/codex-rs/hooks/src/events/common.rs — kod — main
[9] Hooks no longer run after Codex Desktop update — https://github.com/openai/codex/issues/21639 — issue, otwarte — 0.129–0.166
[10] Sandboxing — https://learn.chatgpt.com/docs/sandboxing — dokumentacja
[11] Agent approvals and security — https://learn.chatgpt.com/docs/agent-approvals-security — dokumentacja
[12] Permissions — https://learn.chatgpt.com/docs/permissions — dokumentacja
[13] codex-rs/protocol/src/permissions.rs — https://raw.githubusercontent.com/openai/codex/rust-v0.171.0-alpha.13/codex-rs/protocol/src/permissions.rs — kod — 0.171.0-alpha.13 (pierwsze 100000 znaków pliku)
[14] Eksperyment: hook pluginu społeczności w Codex CLI — c:\progs\repo\.ai\eksperymenty\2026-11-22-hook-pluginu-spolecznosci-codex.md — dane własne
