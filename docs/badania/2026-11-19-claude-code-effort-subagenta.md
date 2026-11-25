# Badanie: Czy Claude Code przyjmuje `effort` we frontmatterze subagenta i czy Haiku 5.5 obsługuje poziomy effort?

- Data: 2026-11-19
- Dla: ogólne (zgłoszenie Z06 w `ZGLOSZENIA.md` — dawny plik zgłoszeń, dziś w historii gita; rola `czytelnik` na `haiku`)
- Kontekst: plugin `plugins/ai`, agenci w `agents/*.md` z samym `model: sonnet`; dokumentacja Claude Code z 2026-11-19 (changelog na wersji 2.1.328), dokumentacja API z 2026-11-19; Windows, PowerShell
- Pewność: wysoka (dokumentacja pierwotna, spójna między stronami); nie sprawdzano zachowania w działającym Claude Code

## Odpowiedź

(a) Tak. Frontmatter subagenta ma pole `effort` o wartościach `low`, `medium`, `high`, `xhigh`, `max`, przy czym dostępne poziomy zależą od modelu. Pole działa także w agentach z pluginów. Nadpisuje effort sesji, ale nie zmienną `CLAUDE_CODE_EFFORT_LEVEL`. (b) Tak. Haiku 5.5 (`claude-haiku-5-5`, wydany 2026-10-07) obsługuje wszystkie pięć poziomów w API i w Claude Code (Claude Code od v2.1.293); domyślny jest `medium`. Zapis `model: haiku` + `effort: medium` jest więc poprawny, a `medium` jest wartością domyślną Haiku 5.5.

## Ustalenia

1. Pole `effort` jest na liście obsługiwanych pól frontmattera subagenta. Cytat: „Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model.” [1]
2. Pole `model` przyjmuje `sonnet`, `opus`, `haiku`, `fable`, pełny ID modelu albo `inherit`. Nierozpoznane pola frontmattera są ignorowane bez błędu, więc literówka w `effort` nie da ostrzeżenia. [1]
3. Współgranie z `model`: gdy subagent działa na modelu sesji rodzica, bez pola `effort` dziedziczy effort sesji (`/effort`, `--effort`). Na innym modelu niż rodzic effort sesji się nie stosuje, a poziom wybiera się polem `effort`. Cytat: „On another model, that level doesn't apply. To choose its level, set the `effort` field.” [1] (wniosek: subagent na `haiku` bez `effort` nie dziedziczy poziomu rodzica na Sonnet/Opus, więc jawne `effort` ma sens, ale bez niego zadziała domyślny poziom modelu, `medium` dla Haiku 5.5 [3][4])
4. Kolejność ważności: `CLAUDE_CODE_EFFORT_LEVEL` > parametr `effort` przekazany przy wywołaniu subagenta (nie-fork; od Claude Code v2.1.292) > pole `effort` we frontmatterze > effort sesji. Wywołaniowy `effort` pozostaje po wznowieniu subagenta. [1][3] Frontmatter nie jest na numerowanej liście precedencji sesji; dokumentacja mówi, że gdy ustawiono `CLAUDE_CODE_EFFORT_LEVEL`, ten poziom obowiązuje zamiast frontmattera. [3]
5. Limity organizacji (`maxEffortLevel` albo organizacyjny cap) nadal ograniczają poziom, na którym działa subagent. [3]
6. Poziom nieobsługiwany przez model: Claude Code spada do najwyższego obsługiwanego poziomu nie wyższego niż ustawiony (np. `xhigh` działa jako `high` na Opus 4.6). Cytat: „falls back to the highest supported level at or below the one you set”. [3]
7. Agenci z pluginów: pole `effort` jest na liście obsługiwanych (`name`, `description`, `model`, `effort`, `maxTurns`, `autoCompactWindow`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `omitClaudeMd`, `isolation`, `color`, `experimental.cacheTtl`). Ignorowane w agentach pluginu: `permissionMode`, `hooks`, `mcpServers`, `initialPrompt`. [2] Ta sama składnia dotyczy `.claude/agents/*.md` [1].
8. Claude Code, obsługiwane poziomy: „Opus 5.5, Sonnet 5.5, Haiku 5.5, Opus 5, Sonnet 5, Opus 4.8, and Opus 4.7: `low`, `medium`, `high`, `xhigh`, `max`”. Opus 4.6 i Sonnet 4.6: bez `xhigh`. Domyślnie `medium` dla Fable 5.2, Opus 5.5, Sonnet 5.5 i Haiku 5.5. Cytat o wersji: „Use v2.1.293 or later with Haiku 5.5.” [3]
9. Claude Code: alias `haiku` w API Anthropic wskazuje Haiku 5.5. Haiku 5.5 zawsze używa adaptive thinking, a thinking nie da się w Claude Code wyłączyć. [3]
10. API: Haiku 5.5 jest na liście `supportedModels` strony effort. Cytat: „Claude Haiku 5.5 supports all five effort levels, and `medium` is the default.” Zalecenia producenta: start od `medium`, także dla agentic coding; `low` dla czatu, krótkich zadań z narzędziami i prostych zapytań masowych, ale w długich promptach agentowych model częściej pomija wyszukiwanie, kończy wcześniej albo pomija sprawdzenie; `high` dla knowledge work, dłuższych zadań agentowych i ścisłego trzymania instrukcji. Parametr: `output_config.effort`. [4]
11. API: ustawienie `effort` na wartość domyślną modelu daje to samo zachowanie co pominięcie parametru. Dla Haiku 5.5 `medium` = brak parametru. [4]
12. Model: `claude-haiku-5-5`, wydany 2026-10-07, okno 1M tokenów, max wyjście 128K, ceny od 0,10/0,50 USD za MTok (wyższe powyżej 100K tokenów promptu), wycofanie nie wcześniej niż 2027-10-07. [5][6]
13. Zmiany w Claude Code związane z effortem subagentów: 2.1.326 (2026-11-16) „Fixed a finished subagent resuming on the model and effort of a sibling subagent that messaged it”; 2.1.328 (2026-11-19) „Fixed effort being turned off for a subagent's model for the session if Bedrock, Google Cloud's Agent Platform or Foundry refused its progress summary's effort setting (regression in 2.1.327)”. [7]

## Niepewności

- Nie ustalono, w której wersji Claude Code pole `effort` pojawiło się we frontmatterze subagenta. Znaleziono tylko progi: parametr wywołaniowy od v2.1.292, Haiku 5.5 od v2.1.293. Przeszukano tylko początek changelogu (od 2.1.328 wstecz do części 2.1.325; strona ma ok. 1,3 mln znaków, resztę pominięto). Jeśli plugin ma działać na starszych wersjach, `engines` w `plugin.json` powinno wymagać co najmniej v2.1.293 (wniosek).
- Dokumentacja Claude Code podaje wprost, że na „innym modelu” poziom rodzica nie obowiązuje, ale nie opisuje wprost przypadku `model: haiku` przy rodzicu na Haiku (wtedy zasada „ten sam model” sugeruje dziedziczenie effortu sesji, o ile pole `effort` nie jest ustawione).
- Strona subagentów i model-config zostały odczytane tylko do ok. 100 000 znaków z odpowiednio 116 321 i 134 936; pominięte końcówki mogą zawierać dodatkowe ograniczenia.
- Jakość rozumowania Haiku 5.5 na `medium` w roli `czytelnik` nie jest przedmiotem źródeł; wymaga prototypu na realnych zadaniach.
- Brak testu uruchomieniowego (np. czy `claude plugin validate` akceptuje `effort` w agencie).

## Źródła

[1] Create custom subagents — https://code.claude.com/docs/en/sub-agents — dokumentacja — odczyt 2026-11-19 (wzmianki o v2.1.292, v2.1.296, v2.1.271)
[2] Add components to a plugin, sekcja „Frontmatter fields in plugin agents” — https://code.claude.com/docs/en/plugins/components.md — dokumentacja — odczyt 2026-11-19
[3] Model configuration, sekcje „Supported levels by model”, „Unsupported levels”, „Precedence” — https://code.claude.com/docs/en/model-config — dokumentacja — odczyt 2026-11-19 (Haiku 5.5: Claude Code v2.1.293+)
[4] Effort — https://platform.claude.com/docs/en/build-with-claude/effort — dokumentacja API — odczyt 2026-11-19
[5] Claude Haiku 5.5 overview — https://platform.claude.com/docs/en/models/haiku-5-5/overview — dokumentacja API — odczyt 2026-11-19
[6] Models overview — https://platform.claude.com/docs/en/models/overview — dokumentacja API — odczyt 2026-11-19
[7] Claude Code changelog — https://code.claude.com/docs/en/changelog — changelog — wpisy 2.1.326 (2026-11-16) i 2.1.328 (2026-11-19)
