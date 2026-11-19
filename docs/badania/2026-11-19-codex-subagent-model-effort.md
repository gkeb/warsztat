# Badanie: Czy narzędzie spawn subagenta w OpenAI Codex przyjmuje model i reasoning effort, pod jakimi polami, jak wygląda dziedziczenie i czy istnieje `fork_turns`

- Data: 2026-11-19
- Dla: Z06 (poziomy modeli dla subagentów), `plugins/ai/kontrakt/narzedzia.md`, sekcja „Subagenci i modele”
- Kontekst: Codex CLI/aplikacja; najnowsze stabilne wydanie 0.170.0 (18 listopada 2026) [1]. Kod czytany z gałęzi `main` (bez przypiętego commita). Lokalnie `~/.codex/config.toml`: `model = "gpt-6.2-sol"`, `model_reasoning_effort = "high"` (nie sprawdzano, jaka wersja jest zainstalowana).
- Pewność: średnia

## Odpowiedź

Tak, ale pola zależą od wersji schematu narzędzia. W kodzie `main` argumenty `spawn_agent` (multi-agent v2) to `message`, `task_name`, `agent_type`, `model`, `reasoning_effort`, `fork_turns`. Jednak w buildach 0.144.x zgłoszono, że widoczny dla modelu schemat ma tylko `task_name`, `message`, `fork_turns`, bez `model` i `reasoning_effort`. W definicjach `.codex/agents/*.toml` klucze to `model` i `model_reasoning_effort`. Subagent bez ustawień dziedziczy model i effort rodzica. `fork_turns` nadal istnieje (`none` / `all`), a domyślnie jest `all`. Nie potwierdzono, czy wydanie 0.170.0 ma pola model/effort widoczne w schemacie.

## Ustalenia

1. Definicje agentów (pliki TOML): wymagane `name`, `description`, `developer_instructions`; opcjonalne `model`, `model_reasoning_effort`, `model_reasoning_summary`, `model_verbosity`. Dokumentacja: „If a custom agent file sets `model` or `model_reasoning_effort`, the value in the file takes precedence.” `sandbox_mode`, `approval_policy`, `model_provider`, `mcp_servers` nie nadpisują konfiguracji rodzica [2]. (Treść stron odczytana przez narzędzie streszczające; cytaty poza podanym dosłownym fragmentem są parafrazą.)
2. Dziedziczenie: bez `model` i `model_reasoning_effort` w subagencie „the subagent inherits the parent agent's model and reasoning effort”. Kolejność: jawna wartość przy spawn, potem domyślne z `[agents]`, potem wartość rodzica. Wybór modelu bez effortu daje domyślny effort tego modelu [2].
3. Klucze konfiguracji `[agents]`: `agents.default_subagent_model` („An explicit spawn model takes precedence.”), `agents.default_subagent_reasoning_effort`, `agents.<name>.config_file`, `features.multi_agent` (domyślnie włączone) [3].
4. Struktura argumentów spawn v2 w kodzie `main` (`#[serde(deny_unknown_fields)]`): `message`, `task_name`, `agent_type`, `model`, `reasoning_effort`, `fork_turns`, `fork_context`. `model` i `reasoning_effort` są przekazywane do żądania spawn bez walidacji w tym pliku [4].
5. `fork_turns`: puste = domyślnie `"all"`; `"none"` = brak odziedziczonej historii; `"all"` lub dodatnia liczba = pełna historia (liczba nie ogranicza historii); inne wartości błąd „fork_turns must be `none` or `all`”. `fork_context` jest odrzucane: „fork_context is not supported in MultiAgentV2; use fork_turns instead” [4]. Dokumentacja tych parametrów nie opisuje [2].
6. Pełny fork a override: wcześniej błąd „Full-history forked agents inherit the parent agent type, model, and reasoning effort … omit agent_type, model, and reasoning_effort, or spawn without a full-history fork.” Komentarz w issue twierdzi, że PR #37252 usunął to odrzucenie; podpowiedź w schemacie nadal mówi, że pełne forki „do not accept overrides” [5]. Aktualny `spawn.rs` na `main` nie zawiera sprawdzenia fork-mode dla override [4]. Bezpieczna praktyka (wniosek): przy podawaniu `model`/`reasoning_effort` ustawiać też `fork_turns: "none"`.
7. Brak pól w widocznym schemacie: w CLI 0.144.0–0.144.5 `spawn_agent` (przestrzeń `collaboration`) pokazywał tylko `task_name`, `message`, `fork_turns`; nadpisanie modelu istniejącego dziecka dawało „direct app-server input is not allowed for multi-agent v2 sub-agents” [6]. Użytkownicy łączą to z modelami GPT-5.6 Sol/Terra, przy których katalog modeli wybiera v2, także przy `multi_agent_v2 = false`. Wątek bez potwierdzonej poprawki; odpowiedź wsparcia (11 paź. 2026) nie rozwiązała problemu [7].
8. Obejścia zgłaszane przez użytkowników (niepotwierdzone przez OpenAI): `[features.multi_agent_v2]` z `hide_spawn_agent_metadata = false` i `tool_namespace = "agents"` oraz podawanie `model` i `reasoning_effort` w dziecku; autor zastrzega, że dziecko nie może bezpiecznie „zwęzić” mocniejszego rodzica [7]. Inny wpis: pola `agent_type`, `model`, `reasoning_effort` wstrzykiwane hookiem `PreToolUse` przez `updatedInput`, a `hide_spawn_agent_metadata = true` musi zostać, bo `false` psuje nowe duże modele; schemat jest „reserved” i dodanie pól daje błąd startu [8].
9. Wniosek: dla warsztatu pewnym kanałem jest plik `.codex/agents/<nazwa>.toml` z `model` i `model_reasoning_effort` (udokumentowany, ma pierwszeństwo nad dziedziczeniem [2]); parametry przy spawn są zależne od builda. Brak potwierdzenia, że `agent_type` wskazuje na taką definicję w v2 w każdej konfiguracji (wniosek).

## Niepewności

- Nie ustalono, czy w 0.170.0 widoczny schemat `spawn_agent` zawiera `model`/`reasoning_effort`. Ostatnie bezpośrednie świadectwa dotyczą 0.144.x (lipiec 2026) i `main` bez commita.
- Nie pobrano definicji narzędzia (`create_spawn_agent_tool_v2`): 404 pod zgadywaną ścieżką. Opis pól schematu zaczerpnięto z `spawn.rs` i zgłoszeń.
- Nie sprawdzono kodu rozwiązywania ról (czy pole `model` z roli wygrywa z `model` ze spawn); dokumentacja mówi tylko o pierwszeństwie pliku agenta.
- Pozycje 7 i 8 pochodzą z forum i issues (nie z OpenAI); pozycja 6 z komentarza w issue.
- Nazw modeli `gpt-6.1-terra` i `gpt-6.2-sol` nie weryfikowano w katalogu modeli; źródła wspominają GPT-5.6 Sol/Terra/Luna.
- Strony dokumentacji pobrano przez narzędzie streszczające, nie surowo. Starsze adresy developers.openai.com przekierowują na learn.chatgpt.com.

## Źródła

[1] Codex releases — https://github.com/openai/codex/releases — changelog — 0.170.0 (18 listopada 2026)
[2] Subagents — https://learn.chatgpt.com/docs/agent-configuration/subagents (dawniej https://developers.openai.com/codex/subagents) — dokumentacja — stan z 2026-11-19
[3] Config reference — https://learn.chatgpt.com/docs/config-file/config-reference — dokumentacja — stan z 2026-11-19 (odczytano pierwsze 100 tys. znaków)
[4] spawn.rs — https://raw.githubusercontent.com/openai/codex/main/codex-rs/core/src/tools/handlers/multi_agents_v2/spawn.rs — kod — `main`, 2026-11-19
[5] Issue „full-history forks and overrides” — https://github.com/openai/codex/issues/20077 — issue — v0.125.0 do 0.144.5, main f4e6cb7
[6] Issue — https://github.com/openai/codex/issues/32587 — issue — Codex App 26.707.51957 (codex-cli 0.144.0-alpha.4), 0.144.1, 0.144.3
[7] Codex cli can no longer spawn subagents with specific models or reasoning — https://community.openai.com/t/codex-cli-can-no-longer-spawn-subagents-with-specific-models-or-reasoning/1386290 — forum — 0.144.5
[8] Restoring subagent roles, model and reasoning in multi_agent_v2 — https://community.openai.com/t/restoring-subagent-roles-model-and-reasoning-in-multi-agent-v2/1386513 — forum (źródło wtórne) — wersja niepodana
