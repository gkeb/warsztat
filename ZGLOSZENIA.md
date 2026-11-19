# Zgłoszenia zmian warsztatu

> Kolejka zmian w samym warsztacie (skille, kontrakt, szablony, hooki, skrypty), które wyszły z pracy w projektach. Wzorce i profile mają własne katalogi w `plugins/ai/` — tu trafia to, co zmienia proces. Zasady: „Zgłoszenia warsztatu — zmiany procesu” w `plugins/ai/kontrakt/pamiec.md`. Jedno zgłoszenie = jeden problem; ten sam problem z innego projektu → dopisz wystąpienie, nie nowy wpis. Pisze i wdraża skill `retro`; wdrożone i odrzucone usuwa — historię trzyma git.

Statusy: `nowe` (zapisane, nieocenione) · `przyjete` (wiadomo, co zmienić, czeka na wdrożenie) · `do-dyskusji` (wymaga decyzji, jak).

<!--
## Z<nr> — tytuł problemu
- Status: nowe | przyjete | do-dyskusji
- Wystąpienia: RRRR-MM-DD projekt (ślad: lekcja, commit, mapa); …
- Problem: co poszło nie tak w procesie, niezależnie od projektu.
- Propozycja: plik w plugins/ai i konkretna zmiana.
-->

## Z05 — Profil CLI nie pyta o pierwsze uruchomienie w domyślnej konfiguracji

- Status: nowe
- Wystąpienia: 2026-10-04 kombus (lekcja `[weryfikacja]`; `weryfikuj` i szablon odbioru dostały tę kontrolę w 0.19.0)
- Problem: domyślne ścieżki danych CLI (katalog projektu, katalog domowy, uprawnienia, blokady plików w Windows) to decyzja klasy aplikacji, a nie tylko kontrola przy weryfikacji.
- Propozycja: rozważyć pozycję w `plugins/ai/profile/cli.md` (domyślne położenie danych i zachowanie przy braku uprawnień), jeśli problem wróci w innym projekcie CLI.

## Z06 — Delegowanie do tańszych modeli: tylko w części skilli, bez wysiłku, w Codexie martwe

- Status: przyjete
- Wystąpienia: 2026-11-19 tenta (`buduj` — użytkownik ręcznie dopisywał polecenie rozdzielenia pracy na subagentów na tańszym modelu)
- Problem:
  - Delegują tylko `przeglad`, `badanie`, `prototyp` (opcjonalnie `poznaj`, `weryfikuj`). `buduj` i `napraw` nie mają ani słowa o subagentach.
  - `modele.<agent>.<skill>` w `warsztat.json` jest per skill i przyjmuje tylko nazwę modelu, bez wysiłku rozumowania. W Codexie wszystkie wartości to `null`, więc subagent dziedziczy model rodzica i nic nie przechodzi na tańszy model.
  - Wszystkie agenty Claude mają `model: sonnet`, także do zadań, którym wystarczy tańszy model.
- Ustalone (decyzja użytkownika 2026-11-19) — poziomy pracy zamiast kluczy per skill:

  | Poziom | Codex | Claude | Zadania |
  | --- | --- | --- | --- |
  | `czytanie` | `gpt-6.1-terra`, medium | `haiku`, effort medium | eksploracja kodu, streszczenie logów i wyników testów, wyszukiwanie |
  | `recenzja` / `badanie` | `gpt-6.2-sol`, medium | `sonnet` | recenzenci `przeglad`, `oceniajacy`, `badacz` |
  | główny | `gpt-6.2-sol`, high | `opus` | pisanie kodu, decyzje, scalanie i sprawdzanie wyników subagentów |

  Uzasadnienie (benchmarki ogólne, nie nasze zadania): Terra high nie wygrywa z Sol medium — słabsza (Intelligence Index 42–44 vs 48) przy podobnym koszcie na zadanie ($0.13–0.26 vs $0.21), bo na wyższym wysiłku zużywa więcej tokenów; Terra medium ($0.17, 38) i low ($0.07, 29) są tanie i szybkie, a Terra słabiej wyłapuje ukryte problemy (analiza danych: ukryte wzorce 3/5 vs 5/5), więc nie do recenzji. Wysiłek zmienia model bardziej niż nazwa (Terra low 29 → max 51), dlatego format musi go zapisywać. Źródła: [Artificial Analysis Astra vs Terra](https://artificialanalysis.ai/models/comparisons/gpt-6-2-astra-vs-gpt-6-1-terra) (dane z 2026-11-18), [OpenRouter Terra vs Sol](https://openrouter.ai/compare/openai/gpt-6.1-terra/openai/gpt-6.2-sol), [EvoLink Terra vs Sol](https://evolink.ai/blog/gpt-6-1-terra-vs-gpt-6-1-sol) (2026-10-28, migawka AA z 2026-10-27; sprzedawca API), [Bito Sol/Astra vs Claude](https://bito.ai/blog/gpt-6-2-sol-astra-vs-claude-opus-fable-gpt-6-1-sol/) (2026-11-18; własne testy, 4 przebiegi, sprzedawca narzędzi).
- Propozycja:
  - `szablony/warsztat.json` i `kontrakt/narzedzia.md` („Subagenci i modele”): `modele.<agent>.<poziom>` = `{ "model": …, "wysilek": … }`, domyślne wartości z tabeli (zamiast `null`); `start` je wpisuje, a dopasowanie migruje stare klucze per skill.
  - `agents/*.md`: recenzenci, `oceniajacy` i `badacz` zostają na `sonnet`; nowa rola `czytelnik` (Read, Grep, Glob, Bash tylko do odczytu i uruchamiania testów) na `haiku` z `effort: medium`, zwraca fakty z odnośnikami.
  - `buduj` i `napraw`: główny model może oddać poziomowi `czytanie` eksplorację obszaru, uruchomienie walidacji i streszczenie porażek, a według dokładnej instrukcji — mechaniczne zmiany, które potem sprawdza. Kod ticketu, decyzje i scalanie zostają w głównym modelu; bez równoległych subagentów piszących w tym samym drzewie roboczym.
  - `poznaj`, `weryfikuj`: równoległe czytanie przez rolę `czytelnik` zamiast ogólnego subagenta.
- Ustalenia badań z 2026-11-19:
  - [Claude Code](docs/badania/2026-11-19-claude-code-effort-subagenta.md) (pewność wysoka): frontmatter agenta, także w pluginie, przyjmuje `effort` (`low`…`max`). Na innym modelu niż rodzic effort sesji nie obowiązuje, więc pole trzeba ustawić. Haiku 5.5 obsługuje wszystkie poziomy, a `medium` jest domyślny. Wymaga Claude Code ≥ 2.1.293 → rozważyć wymaganie wersji w `plugin.json`.
  - [Codex](docs/badania/2026-11-19-codex-subagent-model-effort.md) (pewność średnia): `.codex/agents/*.toml` przyjmuje `model` i `model_reasoning_effort`, które mają pierwszeństwo przed dziedziczeniem; globalny zapas to `agents.default_subagent_model` / `agents.default_subagent_reasoning_effort`. `spawn_agent` v2 ma w kodzie `model` i `reasoning_effort`, ale część wydań nie pokazywała ich modelowi. → Poziomy w Codexie opierać na definicjach `.codex/agents/*.toml` zakładanych przez `start`, a nie tylko na polu przy wywołaniu. Kontrakt uzupełnić o `model_reasoning_effort`. Przy nadpisaniu modelu przy wywołaniu ustawić `fork_turns: "none"`.
- Do potwierdzenia później (`[prototyp]`): czy Haiku nie wystarczy też do recenzji — w testach Bito Haiku 5.5 (67.4%, $0.69/sesję) nie ustępuje Sonnetowi 5.5 (65.7%, $1.28), ale bez osobnych wyników recenzji kodu. Test: ten sam diff z tenta przez `przeglad` na Haiku i na Sonnecie, porównanie potwierdzonych uwag.
