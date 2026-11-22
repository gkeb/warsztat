# Eksperyment: hook pluginu społeczności podaje ścieżkę swojego indeksu

- Status: rozstrzygniety (Claude Code 2.1.301; Codex i Z4 niesprawdzone)
- Pytanie: [mapa model-zgloszen → Otwarte pytania, `[prototyp]` hook pluginu społeczności](../zdolnosci/model-zgloszen/mapa.md)
- Prowadzący: Claude Code 2.1.301 / claude-opus-5-5
- Plan zaakceptowany: 2026-11-22 — Z1–Z3 na atrapach w katalogu roboczym, do 8 sesji `claude -p` na haiku, 45 minut; bez Z4 i bez zmian w `~/.claude`

## Plan

- Cel i istotna poprawa: potwierdzić albo obalić zachowania w Claude Code:
  - Z1 — hook SessionStart pluginu B (atrapa pluginu społeczności) wykonuje się obok hooka pluginu A (atrapa warsztatu), a stdout obu trafia do kontekstu sesji;
  - Z2 — `CLAUDE_PLUGIN_ROOT` w hooku B wskazuje katalog B, więc wypisana ścieżka indeksu istnieje;
  - Z3 — agent w sesji czyta indeks B pod tą ścieżką narzędziem Read bez pytania o zgodę (ścieżka poza katalogiem projektu);
  - Z4 (opcjonalne, osobna zgoda) — po instalacji B z lokalnego marketplace'u w wersji 1, potem 2, hook podaje ścieżkę nowej wersji.
  Codex: niesprawdzony — brak `codex` w `PATH` na tym komputerze.
- Zakres zmian: tylko atrapy pluginów A i B oraz pusty projekt testowy w katalogu roboczym; poza zakresem: prawdziwy plugin warsztatu, jego cache, `~/.claude` (Z4 dotyka `~/.claude` — tylko po osobnej zgodzie, ze sprzątaniem: odinstalowanie i usunięcie marketplace'u).
- Poprawność: sesja nie dostaje ścieżki z wiedzy agenta ani z promptu — prompt nie zawiera ścieżki; indeks B ma unikalny znacznik (losowe słowo), który agent musi zacytować z pliku.
- Warunki i ocena: `claude -p --plugin-dir <A> --plugin-dir <B> --model haiku --output-format json` w pustym katalogu projektu; ocena: obecność znacznika z indeksu B i z hooka A w odpowiedzi, brak odmowy dostępu (`permission_denials` w JSON). Jedno powtórzenie na przypadek; przy niezgodności drugie.
- Przypadki porównawcze / końcowe: porównawcze — B sam; A+B. Końcowe — A+B w nowym katalogu projektu z innym znacznikiem w indeksie B i innym brzmieniem promptu.
- Budżet i stop: najwyżej 8 sesji `claude -p` na modelu haiku, 45 minut; stop po celu albo po 2 kolejnych próbach bez nowych dowodów.
- Artefakty robocze: C:UsersGRZEGO~1AppDataLocalTempclaudee06f9e44b78dcccc967329ee-7a7c-485a-b61f-9c6ae5d82e31scratchpadeksperyment-hook (poza repo).

## Punkt odniesienia

Atrapy w katalogu roboczym (poza repo). A: SessionStart → `node scripts/stan.mjs` wypisuje `STAN-WARSZTATU: znacznik hooka A = KOMODA-713`. B: SessionStart → `scripts/indeks.mjs` wypisuje `Indeks pluginu spolecznosci (atrapa-b): ${CLAUDE_PLUGIN_ROOT}/indeks.md (istnieje: true|false)`; `indeks.md` zawiera `PAPRYKA-482`. Hooki w formacie jak w `plugins/ai/hooks/hooks.json`. Środowisko: Windows, Claude Code 2.1.301, Node 22.17.1, model haiku (claude-haiku-5-5), domyślne uprawnienia, `claude -p`, pusty projekt. Prompt nie zawiera ścieżki.

Punkt odniesienia (iteracje 1–3, bez hooka PreToolUse): hook SessionStart działa, odczyt indeksu jest odrzucany.

## Iteracje

| Nr | Wariant / hipoteza | Wynik i poprawność | Decyzja i dowód |
| --- | --- | --- | --- |
| 1 | B sam, ścieżka dodana jako skrócona 8.3 (`GRZEGO~1`). Przewidywanie: Z1, Z2 tak; Z3 tak | Z1, Z2 tak (agent zna ścieżkę i `istnieje: true`). Z3 odrzucone: `permission_denials` = 1 (Read), agent podał komunikat o podejrzanym wzorcu 8.3 | Wynik zakłócony nazwą 8.3 (artefakt mojego środowiska) — powtórzone z długą ścieżką. Log: `logs/s1.json` |
| 2 | B sam, długa ścieżka `C:UsersGrzegorzKe...` | Z1, Z2 tak; Z3 nie: `permission_denials` = 1, znacznik PAPRYKA-482 niezacytowany; agent: „nie zatwierdzono” | Z3 obalone w -p z domyślnymi uprawnieniami. `logs/s2.json` |
| 3 | A+B (przypadek porównawczy), długa ścieżka | Z1 tak: w odpowiedzi KOMODA-713 (hook A) i ścieżka z hooka B w jednym kontekście. Z2 tak. Z3 nie: 1 odmowa Read | Z1+Z2 zachowane; Z3 odrzucone. `logs/s3.json` |
| 4 | Hipoteza: PreToolUse (matcher Read) w B zwraca `permissionDecision: allow` tylko dla `${CLAUDE_PLUGIN_ROOT}/indeks.md`; przewidywanie: odmowa znika | Znacznik PAPRYKA-482 zacytowany, KOMODA-713 też, `permission_denials` = [] | Zachowany. `logs/s4.json`, `B/hooks/hooks.json`, `B/scripts/zezwol.mjs` |
| 5 | Przypadek końcowy: A+B z hookiem z iteracji 4, nowy projekt `proj2`, znaczniki LATARNIA-296 (A) i BURSZTYN-905 (indeks B), inny prompt | Oba znaczniki poprawne, `permission_denials` = [] | Dowód końcowy. `logs/s5.json` |
| 6 | Kontrola: to samo co 5, ale B bez hooka PreToolUse (`B0`) | Odmowa Read: `permission_denials` = 1, znacznik BURSZTYN-905 niezacytowany | Odniesienie odtwarza się w nowym projekcie. `logs/s6.json` |

## Ocena końcowa

Przypadek końcowy (iteracja 5, A+B z wariantem) — surowo: `permission_denials`: [], odpowiedź zawiera `BURSZTYN-905` i `LATARNIA-296`. Kontrola (iteracja 6, bez wariantu) — surowo: `"permission_denials":[{"tool_name":"Read","tool_input":{"file_path":"C:\Users\GrzegorzKe\AppData\Local\Temp\claude\...\B0\indeks.md"}}]`, brak BURSZTYN-905, LATARNIA-296 podany. Fragment z iteracji 2: `"permission_denials":[{"tool_name":"Read",...\B\indeks.md"}}]`, `num_turns`: 2.
Ocena była automatyczna (obecność znaczników i `permission_denials` w JSON); niezależnej oceny modelu nie robiłem. Modele: wszystkie sesje claude-haiku-5-5, Claude Code 2.1.301. Codex: niesprawdzony.
Sprawdzenie głównego agenta (2026-11-22): `permission_denials` i treść odpowiedzi w `logs/s1.json`–`s6.json` zgodne z raportem (s1–s3 i s6: 1 odmowa, brak znacznika; s4–s5: 0 odmów, znacznik zacytowany); skrypt wariantu zezwala wyłącznie na `Read` pliku `${CLAUDE_PLUGIN_ROOT}/indeks.md`, inne ścieżki zostawia zwykłym uprawnieniom. Ocena nie była niezależna — rubryka zero-jedynkowa, bez oceniającego modelu.

Budżet: 6 z 8 sesji `claude -p`, ok. 15 minut z 45. Z4 nie wykonywane (bez zgody), `~/.claude` nietknięte. Procesy `claude -p` zakończyły się same (rc=0); katalog roboczy zostawiony do odtworzenia.

## Wniosek

- Z1: potwierdzone — hooki SessionStart obu pluginów (`--plugin-dir`) wykonały się, stdout obu trafił do kontekstu.
- Z2: potwierdzone — `CLAUDE_PLUGIN_ROOT` w hooku B wskazywał katalog B, `istnieje: true`. Uwaga: ścieżka jest taka, jaką podano w `--plugin-dir`; skrócona nazwa 8.3 (`GRZEGO~1`) powoduje odrzucenie Read jako podejrzanego wzorca.
- Z3: obalone dla domyślnych uprawnień w `claude -p` — Read ścieżki poza katalogiem projektu (katalog pluginu) został odrzucony; hook SessionStart sam tego nie rozwiązuje. Ograniczenie: tryb nieinteraktywny, w sesji interaktywnej Claude Code zapewne zapyta o zgodę — niesprawdzone.
- Wariant naprawczy (do zatwierdzenia przez użytkownika): w pluginie społeczności hook PreToolUse z matcherem `Read`, który dla dokładnie `${CLAUDE_PLUGIN_ROOT}/indeks.md` zwraca `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}`. Alternatywa niesprawdzona: dopisanie katalogu pluginu do `permissions.allow`/`additionalDirectories`. Zakres: Claude Code 2.1.301, Windows, haiku; Z4 (aktualizacja wersji) i Codex niesprawdzone.
- Odrzucone: założenie, że sam hook SessionStart + zwykły Read wystarczą (iteracje 2, 3, 6).

Odtworzenie: katalog roboczy `eksperyment-hook` (A, B, B0, proj1, proj2, logs, show.mjs); w `proj2`: `claude -p "<prompt>" --plugin-dir <A> --plugin-dir <B> --model haiku --output-format json`, ocena `node show.mjs logs/s5.json`.

Wariant naprawczy, do odtworzenia bez katalogu roboczego: plugin B ma w `hooks/hooks.json` obok `SessionStart` (`node "${CLAUDE_PLUGIN_ROOT}/scripts/indeks.mjs"`, wypisuje ścieżkę indeksu) wpis `PreToolUse` z `matcher: "Read"` i komendą `node "${CLAUDE_PLUGIN_ROOT}/scripts/zezwol.mjs"` (timeout 10 s). Skrypt czyta JSON ze stdin, porównuje `path.resolve(tool_input.file_path)` z `path.join(path.resolve(CLAUDE_PLUGIN_ROOT), "indeks.md")` i tylko przy zgodności wypisuje `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"indeks wlasnego pluginu"}}`; w innym wypadku nic nie wypisuje. Uwaga do wdrożenia: porównanie jest wrażliwe na wielkość liter i nazwy 8.3 na Windows.

<!-- Statusy: planowany | w-toku | rozstrzygniety | nierozstrzygniety | przerwany. Kod prototypu nie trafia do tego pliku. -->
