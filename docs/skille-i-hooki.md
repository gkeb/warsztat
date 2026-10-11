---
title: Skille i hooki — Claude Code, Codex i warsztat
created: 2026-10-10
description: Wspólny model skilli i hooków w Claude Code i Codexie oraz ocena pluginu warsztatu (plugins/ai 0.16.0) względem tego modelu i własnego kontraktu.
---

# Skille i hooki — Claude Code, Codex i warsztat

Przegląd z 2026-10-10. Źródła są na końcu. Zakres: analiza statyczna definicji skilli, kontraktu, manifestów, szablonów i skryptów oraz porównanie z dokumentacją obu hostów. Hooków i testów nie uruchamiano. Pluginu nie zmieniano — to jest zapis ustaleń.

Claude Code i Codex stoją na tym samym otwartym standardzie [Agent Skills](https://agentskills.io/specification). Hooki mają w obu narzędziach ten sam szkielet: zdarzenie, matcher, handler. Różnią się miejscem plików, polityką wywołania i tym, co handler może zatrzymać.

Plugin warsztatu (`plugins/ai`, wersja 0.16.0) jest napisany na tym wspólnym rdzeniu. Układ skilli, polityki wywołania i używany protokół hooków odpowiadają mechanizmom opisanym przez oba hosty. Implementacja ma jednak luki względem własnego kontraktu. Analiza plików nie potwierdza pełnej zgodności ani działania całego pluginu w sesji każdego hosta; konkretne luki i ograniczenia opisano w ocenie.

## Skill

Skill to katalog z plikiem `SKILL.md`: frontmatter YAML i instrukcja w Markdownie. Obok mogą leżeć skrypty, materiały i — w Codexie — `agents/openai.yaml`.

Host na starcie sesji widzi nazwę, opis i ścieżkę. Pełną treść ładuje dopiero wtedy, gdy skill zostanie wywołany. Dzięki temu długa procedura nie zajmuje kontekstu, dopóki nie jest potrzebna.

Standard wymaga pól `name` i `description`. `name` ma mieć do 64 znaków, składać się z małych liter, cyfr i myślników oraz zgadzać się z nazwą katalogu. `description` ma mieć do 1024 znaków i mówić, co skill robi oraz kiedy go użyć. Opcjonalne pola standardu to `license`, `compatibility`, `metadata` i `allowed-tools`.

### Gdzie skill żyje i jak się go woła

| | Claude Code | Codex |
| --- | --- | --- |
| W repozytorium | `.claude/skills/<nazwa>/SKILL.md` | `.agents/skills/<nazwa>/SKILL.md`, od katalogu roboczego w górę aż do korzenia repozytorium |
| U użytkownika | `~/.claude/skills/` | `$HOME/.agents/skills` |
| W pluginie | `skills/<nazwa>/SKILL.md`, komenda `/plugin:nazwa` | ten sam układ katalogu; w CLI `$nazwa` albo `/skills`, w ChatGPT `@nazwa` |
| Wywołanie przez model | domyślnie tak, na podstawie opisu | tak samo |
| Zamknięcie auto-wywołania | `disable-model-invocation: true` w `SKILL.md` | `policy.allow_implicit_invocation: false` w `agents/openai.yaml` |
| Budżet listy skilli | około 1% okna kontekstu; opis obcinany przy 1536 znakach | 2% albo 8000 znaków; przy nadmiarze opisy są skracane, a część skilli może wypaść z listy |

Pole `disable-model-invocation` i `argument-hint` są rozszerzeniem Claude Code. Nie ma ich w standardzie. Aktualna dokumentacja Codexa opisuje politykę wywołania wyłącznie przez `openai.yaml`. Starsza strona tworzenia skilli mówiła, że Codex nieznane klucze frontmatteru ignoruje.

Po załadowaniu Claude Code trzyma treść skillu w rozmowie i nie czyta pliku ponownie. Po kompaktowaniu zostawia początek: do 5000 tokenów na skill i 25 000 łącznie. Reguła, która ma zadziałać przy każdym zdarzeniu, należy do hooka, nie do pamięci modelu. Claude Code umie też zapisać hook we frontmatterze skillu: rejestruje go w chwili wywołania i trzyma do końca sesji, chyba że hook ma `once: true`. Codex takiego mechanizmu w dokumentacji skilli nie opisuje.

## Hook

Hook uruchamia komendę albo narzędzie MCP w punkcie życia sesji. Wejście przychodzi na stdin jako jeden obiekt JSON. Decyzja wraca w JSON na stdout albo kodem wyjścia 2. Kod 0 bez treści znaczy „nic nie zmieniaj”.

Konfiguracja ma trzy poziomy: zdarzenie (`SessionStart`, `PreToolUse`, `Stop`, …), grupa matcherów, lista handlerów. Warstwy konfiguracji się sumują. Wyższa nie kasuje niższej.

### Zdarzenia, których używa warsztat

| Zdarzenie | Claude Code | Codex |
| --- | --- | --- |
| `SessionStart` | źródła `startup`, `resume`, `clear`, `compact`, `fork`. Zwykły tekst na stdout trafia do kontekstu. JSON może dodać `additionalContext` | źródła `startup`, `resume`, `clear`, `compact`. Ten sam skutek zwykłego tekstu i `additionalContext` |
| `PreToolUse` | przed wywołaniem narzędzia, poza `EndConversation`. Może pozwolić, odmówić, zapytać albo przepisać wejście | lokalne narzędzia: `Bash`, `apply_patch`, MCP i inne funkcje lokalne. Odmowa przez `permissionDecision: deny`, przepisanie przez `allow` razem z `updatedInput`, albo kod 2. Wartość `ask` jest parsowana i pomijana |
| `PostToolUse` | po udanym wywołaniu. `decision: block` dokleja powód; oryginalny wynik zostaje | także po Bashu z niezerowym kodem. `block` podmienia wynik widziany przez model. Skutku ubocznego, który narzędzie już zrobiło, nie cofa |
| `Stop` | gdy model skończył odpowiedź. `decision: block` każe jechać dalej. Po ośmiu kontynuacjach z rzędu tura i tak się kończy | to samo znaczenie `block`: powstaje nowy prompt z polem `reason`. Zwykły tekst na stdout przy kodzie 0 jest dla tego zdarzenia błędem. Puste stdout przy kodzie 0 jest sukcesem |
| `PermissionRequest` | gdy narzędzie czeka na zgodę człowieka | gdy Codex ma o zgodę zapytać. Gdy kilka hooków odpowie, `deny` wygrywa z `allow` |

Edycja pliku jest najostrzejszą różnicą. W Claude Code matcher `Edit` albo `Write` dostaje `tool_input.file_path` jako ścieżkę absolutną. Na Windowsie separatory są wsteczne. W Codexie edycja to narzędzie `apply_patch`. Matcher `Edit` albo `Write` je łapie, ale w JSON-ie `tool_name` zostaje `apply_patch`, a treść łatki siedzi w `tool_input.command` — tak jak komenda Basha.

Inne różnice, które wracają przy wspólnym pluginie:

- Claude Code ma pięć typów handlera: `command`, `http`, `mcp_tool`, `prompt`, `agent`. Codex wykonuje `command` i `mcp_tool`. Typy `prompt` i `agent` parsuje i pomija.
- Claude Code trzyma hooki w `settings.json`, w pluginie `hooks/hooks.json` oraz we frontmatterze skillu albo subagenta. Włączenie pluginu hooki włącza. Codex szuka `hooks.json` albo tabeli `[hooks]` w `config.toml`, a w pluginie domyślnie `hooks/hooks.json`. Każdy niemadżowany hook trzeba osobno zaufać w `/hooks`. Zmiana treści hooka wymaga zaufania od nowa.
- Przy hookach pluginu Codex ustawia `PLUGIN_ROOT` i `PLUGIN_DATA`, a dla zgodności ze starszymi pluginami także `CLAUDE_PLUGIN_ROOT` i `CLAUDE_PLUGIN_DATA`.
- Na Windowsie handler może mieć osobną komendę: `commandWindows` w JSON, `command_windows` w TOML. Domyślny limit czasu to 600 sekund. `SessionEnd` i `Interrupt` mają sekundę, najwyżej trzy.
- Wyłączenie globalne: u Claude'a `disableAllHooks`, u Codexa `[features] hooks = false`.

## Warsztat na tym modelu

Treść skilli, kontrakt (`plugins/ai/KONTRAKT.md`) i stan projektu w `.ai/` są wspólne. Różnią się manifest, instalacja i składnia wywołania: `/ai:<nazwa>` w Claude Code, `$<nazwa>` w Codexie. W plikach projektu następny krok zapisuje się jako `skill <nazwa>`, bez składni hosta.

### Manifesty i instalacja

| Element | Claude Code | Codex |
| --- | --- | --- |
| Marketplace | `.claude-plugin/marketplace.json`, nazwa `warsztat` | `.agents/plugins/marketplace.json`, nazwa `warsztat-local` |
| Manifest pluginu | `plugins/ai/.claude-plugin/plugin.json` | przenośny `plugins/ai/plugin.json`, z metadanymi w `extensions.com.openai` |
| Tożsamość | `ai`, wersja `0.16.0` | `ai`, wersja `0.16.0` |
| Skille i hooki | domyślne katalogi `skills/` i `hooks/hooks.json` | te same katalogi; osobny `.codex-plugin/plugin.json` nie jest potrzebny przy obecnym przenośnym manifeście |

Według aktualnej [dokumentacji Claude Code](https://code.claude.com/docs/en/plugins/loading), plugin ze źródłem względnym w marketplace dodanym z lokalnej ścieżki ładuje się bezpośrednio z katalogu źródłowego. Zmiany są widoczne po rozpoczęciu sesji lub `/reload-plugins`, bez podbijania wersji. To potwierdza sposób instalacji opisany w README warsztatu; nie dotyczy wszystkich typów marketplace, ponieważ pozostałe źródła mogą korzystać z kopii w cache.

README opisuje dla Codexa kopię w `~/.codex/plugins/cache/warsztat-local/ai/<wersja>/` i odświeżenie przez `codex plugin add ai@warsztat-local`. W tym przeglądzie nie wykonywano instalacji ani odświeżenia. Osobną, potwierdzoną w [dokumentacji OpenAI](https://developers.openai.com/plugins/build/plugins) czynnością jest zaufanie hookom: samo włączenie pluginu nie wystarcza.

### Siedemnaście skilli

Każdy skill to `plugins/ai/skills/<nazwa>/SKILL.md`. Nazwa zgadza się z katalogiem. Opis mówi, co skill robi i kiedy go użyć. Najdłuższy opis (`przemysl`) ma 441 znaków. Najdłuższy plik (`pomysl`) ma 153 linie, z frontmatterem. Procedura odsyła do kontraktu: pierwsze polecenie każe otworzyć `../../KONTRAKT.md` i potrzebne szablony.

| Skill | Działanie i wynik |
| --- | --- |
| `start` | rozpoznanie projektu; założenie lub aktualizacja `.ai/`, instrukcji agentów, konfiguracji gita i zabezpieczeń |
| `poznaj` | kod, dokumentacja i historia → propozycje map obszarów, zasad, słownika, zastanych ADR i rozjazdów |
| `przemysl` | rozmowa sokratejska → przemyślenie dojrzałe, odrzucone, odłożone albo otwarte |
| `pomysl` | doprecyzowanie produktu lub zdolności → problem, decyzje i pytania w mapie; także rozbiór pliku, Issue, tryb sokratejski i druga opinia |
| `decyzja` | porównanie alternatyw → ADR dla trwałego wyboru albo drobna decyzja w mapie |
| `badanie` | fakty ze źródeł pierwotnych → plik w `.ai/badania/`, opcjonalnie przez badacza w tle |
| `spec` | ustalenia grilla → scenariusze zachowania i zakres, zaakceptowane przez użytkownika |
| `pokroj` | zaakceptowany spec → pionowe tickety, zależności i pokrycie scenariuszy; opcjonalnie Issues |
| `buduj` | jeden ticket → TDD, walidacja, przegląd, commit, push według konfiguracji i sprawdzenie CI |
| `napraw` | odtworzenie błędu → przyczyna, minimalna poprawka i test regresji; rozmiar określa potrzebę ticketu |
| `przeglad` | dwie role: zgodność i jakość → zweryfikowana lista uwag, bez samodzielnych poprawek |
| `weryfikuj` | ticket albo zdolność → runda weryfikacji dowiezienia, domyślnie w innym modelu |
| `zamknij` | kompletność albo porzucenie → porządek w roadmapie, słowniku, lekcjach i historii zmian; ewentualne scalenie PR |
| `wydaj` | przygotowanie wersji → publikacja po zgodzie, sprawdzenie wyniku i rejestr wydania lub wycofania |
| `gdzie` | stan projektu i rozjazdy → raport i następny krok; `tydzien` obejmuje też pielęgnację |
| `przekaz` | przerwana praca → stan sesji w mapie albo `.ai/sesje/` |
| `retro` | powtarzające się problemy → propozycje kontroli, zasad, zmian warsztatu, wspólnych wzorców lub profili |

Siedem bramek uruchamia tylko człowiek. Są zamknięte po obu stronach.

| Skill | Claude Code | Codex |
| --- | --- | --- |
| `start`, `spec`, `pokroj`, `buduj`, `weryfikuj`, `zamknij`, `wydaj` | `disable-model-invocation: true` | `agents/openai.yaml` z `allow_implicit_invocation: false` |

Pozostałe dziesięć (`pomysl`, `napraw`, `gdzie`, `poznaj`, `decyzja`, `badanie`, `przeglad`, `przekaz`, `przemysl`, `retro`) model może zaproponować albo uruchomić sam. Tak opisuje to README.

Subagenci są rozdzieleni tak, jak każe sekcja „Subagenci i modele” w kontrakcie. Claude Code dostaje definicje w `plugins/ai/agents/`: `badacz`, `recenzent-zgodnosci`, `recenzent-jakosci`, z modelem `sonnet`. Codex nie ładuje tego katalogu. Skill przekazuje mu ścieżkę do wspólnego pliku roli obok `SKILL.md`.

Badacz ma dostęp do czytania, wyszukiwania, zapisu i źródeł internetowych oraz `background: true`. Recenzenci mają `Read`, `Grep`, `Glob`, `Bash`; użycie powłoki dozwolone jest instrukcją wyłącznie dla odczytów. Wybór modelu może pochodzić z `modele.<agent>.<skill>` w `.ai/warsztat.json`, jeśli host udostępnia taki parametr. Sam ten plik nie konfiguruje runtime'u Codexa. Bez delegowania agent wykonuje role kolejno i oznacza brak niezależności.

### Przebieg i stan projektu

Główna ścieżka to `pomysl → spec → pokroj → buduj × N → weryfikuj → zamknij → wydaj`. Wcześniej `start` przygotowuje warsztat, a `poznaj` rozpoznaje zastany projekt. `przemysl`, `badanie`, `decyzja` i `przeglad` wspierają poszczególne etapy; `gdzie`, `przekaz` i `retro` utrzymują ciągłość pracy.

Kontrakt rozdziela cztery rodzaje zdolności: `funkcja`, `refaktor`, `wyglad`, `szkielet`. Funkcja używa scenariuszy zachowania, refaktor — niezmienników, wygląd wymaga także akceptacji użytkownika na zrzutach lub podglądzie, a szkielet stawia pierwszą działającą ścieżkę i walidację.

Stan przenosi się między hostami przez `.ai/` i git. Status zdolności żyje w `ROADMAP.md`, status ticketu w jego frontmatterze, zachowanie w specu, trwały wybór w ADR, konwencje kodu w `ZASADY.md`, a pojęcia w `SLOWNIK.md`. `mapa.md` zawiera dziennik decyzji, następny krok i stan przerwanej sesji. Profile `przekrojowe`, `cli`, `html` i `strona` dostarczają list decyzji, typowych braków i kontroli; `wzorce/` przechowuje wiedzę między projektami.

### Hooki pluginu

`plugins/ai/hooks/hooks.json` ma cztery zdarzenia, wszystkie jako `command` wołające `node`:

| Zdarzenie | Matcher | Skrypt |
| --- | --- | --- |
| `SessionStart` | `startup\|resume\|clear\|compact` | `scripts/stan.mjs` |
| `PostToolUse` | `Edit\|Write\|MultiEdit\|apply_patch` | `scripts/kod.mjs formatuj` |
| `Stop` | każde | `scripts/kod.mjs kontrola` |
| `PermissionRequest` | każde | `scripts/kod.mjs dzwiek czeka` |

`stan.mjs` wypisuje zwykły tekst: sekcję Teraz z roadmapy, tickety, następny krok, przerwaną pracę, nierozwiązane próby, powtórzone lekcje, twarde zasady i ostrzeżenia gita. Projekt bez `.ai/ROADMAP.md` kończy się kodem 0 i pustym stdout, więc obce repozytoria nic nie dostają.

`kod.mjs` przy formatowaniu czyta `tool_input.file_path` albo ścieżki z łatki (`*** Add File`, `*** Update File`, `*** Move to` w `tool_input.command`). Formater, który nie przeszedł, milczy. Kontrola na `Stop` zwraca `{"decision":"block","reason":…}`. Gdy kontrola zostanie wykonana i `stop_hook_active` jest już prawdziwe, wysyła tylko `systemMessage` i drugi raz nie blokuje. Wcześniejsze pominięcie na podstawie odcisku plików może jednak pominąć także ten komunikat — szczegóły w ocenie. Błąd samego skryptu kończy się kodem 0. Dźwięk na prośbę o zgodę nic nie pisze na stdout i odpala odtwarzacz w oderwanym procesie.

Formatowanie obsługuje Biome albo Prettier dla JS/TS i plików interfejsu, ruff albo black dla Pythona oraz rustfmt dla Rusta. Automatyczna kontrola obejmuje `tsc --noEmit`, `ruff check`, skonfigurowane mypy/pyright oraz `cargo clippy` lub `cargo check`. Skan zakazanych wzorców dotyczy dodanych linii względem `HEAD`, a dla nowych plików — ich treści. Hooki kodu działają także w repozytoriach bez `.ai/`, korzystając z domyślnej konfiguracji i istniejących narzędzi; nie instalują zależności.

W `.ai/warsztat.json` klucz `hooki.formatowanie` włącza lub wyłącza formatowanie. `hooki.kontrola` przyjmuje `true` (dobór automatyczny), `false` albo listę komend uruchamianych zamiast doboru automatycznego. `hooki.zakazane` zawiera regex, zakres plików, pominięcia i wskazówkę poprawki. `WARSZTAT_HOOKI=0` wyłącza formatowanie i kontrolę, `WARSZTAT_DZWIEK=0` — dźwięki. Limity handlerów to 60 sekund dla formatowania, 300 dla kontroli i 10 dla dźwięku oczekiwania; pojedyncza kontrola wewnątrz skryptu ma limit 240 sekund.

Te same wymagania (formatowanie, kontrola przed końcem odpowiedzi, zakazane wzorce) stoją w bloku warsztatu w `AGENTS.md`. Hook jest automatem. Instrukcja zostaje, gdy hook nie działa: brak Node, `WARSZTAT_HOOKI=0`, albo Codex bez zaufania w `/hooks`.

### Hook gita

Osobnym mechanizmem jest `szablony/pre-commit`, instalowany przez `start` w projekcie jako `.githooks/pre-commit` albo dołączany do zastanego mechanizmu hooków. Skanuje staged zmiany przez gitleaks i blokuje commit przy niezerowym wyniku. Działa także przy commitach człowieka i nie zależy od hooków sesji agenta. Brak gitleaks powoduje komunikat i przepuszczenie commita. `core.hooksPath` jest ustawieniem lokalnym, więc trzeba je włączyć w każdym klonie i na każdym komputerze.

## Ocena

Wspólna organizacja pluginu jest zgodna z opisanym modelem obu hostów. Pełnej zgodności nie potwierdzono uruchomieniem, a w kodzie są poniższe rozjazdy względem deklarowanego zachowania.

Spełnione założenia:

- jeden skill, dwa hosty; różnica polityki wywołania jest w polu, które dany host czyta;
- opisy nadają się do dopasowania przez model i mieszczą się w limicie standardu;
- treść skillu jest krótka, a trwałe reguły żyją w kontrakcie, nie w siedemnastu kopiach;
- procedury przypisują kod produkcyjny do `buduj` i `napraw`; siedem bramek ma wyłączone automatyczne wywołanie przez model. Zasady procesu po wywołaniu pozostają instrukcjami dla agenta;
- hooki używają zdarzeń i kształtu JSON, które obie dokumentacje opisują tak samo;
- różnica `file_path` kontra łatka `apply_patch` jest obsłużona w `kod.mjs`, a nie zostawiona matcherowi;
- pętla `Stop` jest świadomie ucięta po jednej blokadzie na odpowiedź.

### Luki i rozjazdy

Ocena poniżej dotyczy wersji 0.16.0; numery linii odnoszą się do plików z tamtego przeglądu. Aktualny stan po zmianach 0.17.0 opisano w tabeli pod listą.

1. **Import w `.claude/CLAUDE.md`.** `start` zaleca `@AGENTS.md` zarówno w głównym `CLAUDE.md`, jak i w `.claude/CLAUDE.md`. [Import jest względny wobec pliku, który go zawiera](https://code.claude.com/docs/en/memory), więc drugi wariant wskazuje `.claude/AGENTS.md`. Przy wspólnym `AGENTS.md` w korzeniu potrzeba `@../AGENTS.md`. `stan.mjs` sprawdza oba położenia regexem rozpoznającym tylko `@AGENTS.md`, więc poprawnego importu z podkatalogu również nie uzna. Źródła: `skills/start/SKILL.md:69`, `scripts/stan.mjs:302`.

2. **Wykrywanie korzenia projektu.** `stan.mjs` bierze `session.cwd` i szuka w nim `.ai/ROADMAP.md`, bez przechodzenia do katalogów nadrzędnych. Uruchomienie sesji w podkatalogu pomija stan warsztatu umieszczony w korzeniu projektu. `kod.mjs` odnajduje korzeń gita, więc oba skrypty mogą czytać konfigurację z różnych miejsc. Źródła: `scripts/stan.mjs:22`, `scripts/kod.mjs:195`, `scripts/kod.mjs:450`.

3. **Brak źródła `fork`.** Matcher `SessionStart` nie obejmuje `fork`. Nowa sesja powstała przez `--fork-session`, `/fork` albo `/branch` w Claude Code nie dostaje odświeżonego stanu z `.ai/` przez ten hook. Może zachować wcześniejszy kontekst ze źródłowej sesji. Źródło: `hooks/hooks.json:5`; [zdarzenia Claude Code](https://code.claude.com/docs/en/hooks).

4. **Zapamiętanie czerwonej kontroli.** `kontrola()` zapisuje odcisk plików także po znalezieniu błędów, przed oceną `stop_hook_active`. Kolejne `Stop` przy tych samych plikach kończy się wcześniej, bez kontroli i bez komunikatu o nadal czerwonym wyniku. Przykład: `tsc` zgłasza błąd → hook blokuje → agent odpowiada bez zmiany plików → hook pomija kontrolę i może odtworzyć dźwięk zakończenia. Zapobieganie pętli działa, ale deklaracja „drugi raz informuje człowieka” nie obejmuje tego przypadku. Odcisk zapisuje wyłącznie ścieżki, czas modyfikacji i rozmiar plików; nie przechowuje wyniku kontroli. Źródło: `scripts/kod.mjs:422`, `scripts/kod.mjs:450`.

5. **Brak rozróżnienia sukcesu i pominięcia kontroli.** Brak narzędzia albo timeout w `uruchom()` zwraca `null`; wywołujący pomija taki wynik. Nie ma raportu „kontrola niewykonana”. Automatyczna ścieżka nie uruchamia lintera zwykłego JavaScriptu ani ESLinta dla TypeScriptu, więc nie zapewnia całego wymagania „typy i lint”. Lista własnych komend może rozszerzyć zakres. Limity pojedynczych kontroli sumują się przy wykonywaniu szeregowym, podczas gdy handler `Stop` ma 300 sekund łącznie. Źródła: `scripts/kod.mjs:33`, `scripts/kod.mjs:324`, `hooks/hooks.json:32`.

6. **Zakres ochrony plików.** `bezpieczenstwo.chronione` filtruje treść skanowaną pod kątem zakazanych wzorców, ale nie listę plików przekazywaną formaterom i kontrolom. Plik źródłowy w `secrets/` może więc trafić do narzędzia. Dla śledzonych plików `git diff HEAD` pobiera całość zmian przed filtrowaniem chronionych ścieżek. Wykluczenie chronionych linii z raportu zakazanych wzorców nie zapewnia deklarowanego pominięcia odczytu ich treści przez całą kontrolę. Źródła: `scripts/kod.mjs:195`, `scripts/kod.mjs:324`, `scripts/kod.mjs:370`.

7. **Świeży kontekst recenzenta w Codexie — poprawione w instrukcjach 0.17.0.** W wersji 0.16.0 kontrakt wymagał przekazywania subagentowi tylko faktów i niezależności od rozmowy, ale nie określał sposobu wyłączenia dziedziczenia historii. W interfejsie delegowania dostępnym podczas tamtej analizy `spawn_agent` domyślnie miał `fork_turns: "all"`; świeży kontekst wymagał `fork_turns: "none"`. To obserwacja tego interfejsu, nie uniwersalna nazwa ustawienia dla wszystkich klientów Codexa. Obecne [instrukcje subagentów](../plugins/ai/kontrakt/narzedzia.md) nakazują wyłączenie dziedziczenia, jeśli host na to pozwala, albo oznaczenie braku niezależności. Wykonanie tej instrukcji w klientach nadal wymaga potwierdzenia.

Stan z 2026-10-11, po korekcie 0.17.0:

| Punkty | Stan |
| --- | --- |
| 1–4 | nadal otwarte; potwierdzone odczytem `skills/start/SKILL.md`, `scripts/stan.mjs`, `hooks/hooks.json` i `scripts/kod.mjs`: import z podkatalogu, brak szukania korzenia, brak `fork`, odcisk także po czerwonej kontroli |
| 5–6 | wcześniejsze ustalenia; ta korekta nie zmienia wykonania kontroli ani ochrony plików |
| 7 | poprawione w instrukcjach; działanie świeżego kontekstu zależy od możliwości hosta i pozostaje do sprawdzenia w sesjach |

### Granice działania automatów

- Matcher formatowania nie obejmuje zapisów przez powłokę ani dowolne narzędzie MCP zapisujące pliki. Deklaracja „każdy edytowany plik” dotyczy faktycznie wymienionych narzędzi plikowych.
- `Stop` bierze całe brudne drzewo repozytorium, łącznie z nowymi plikami. Nie ustala, które zmiany powstały w bieżącej sesji. Przy czystym drzewie po commicie pomija kontrolę tej zmiany, dlatego walidacja wykonywana przez `buduj` przed commitem pozostaje potrzebna.
- Automatyczne kontrole są dobierane według zmienionych rozszerzeń i konfiguracji. Nie zastępują pełnej listy `walidacja`, testów akceptacyjnych ani CI; np. sama zmiana `tsconfig.json` nie uruchamia `kontrolaTs()`.
- `odniesienie.znane` nie jest automatycznie odejmowane od wyników hooka. Hook przekazuje agentowi polecenie rozpoznania znanych błędów.
- Blokady `permissions.deny` przygotowywane przez `start` są specyficzne dla Claude Code i narzędzi plikowych. Wspólną warstwą jest reguła w `AGENTS.md`; nie oznacza to identycznego egzekwowania w obu hostach.

### Mechanizmy niewykorzystywane

Poniższe różnice nie wymagają same w sobie rozszerzenia pluginu:

- hooki we frontmatterze skillu oraz handlery `prompt` i `agent` nie są używane. Codex i tak wykonuje tylko `command` i `mcp_tool`;
- `commandWindows` nie jest ustawione. Wspólna komenda `node` tego nie wymaga;
- `poznaj` pozwala czytać duży obszar subagentami, ale nie ma dla nich definicji w `agents/`. W Claude Code są to ogólne subagenty, bez ustalonego modelu, jaki mają `badanie` i `przeglad`.

Założenie, na którym stoi wspólny frontmatter: Codex nadal ignoruje klucze spoza standardu (`disable-model-invocation`, `argument-hint`). Bramka w Codexie i tak nie zależy od tych kluczy, tylko od `openai.yaml`.

Pierwsze kwestie do rozstrzygnięcia to import instrukcji Claude'a, wykrywanie korzenia projektu i raportowanie wyniku kontroli `Stop`. Wspólny podział skilli nie wymaga z tego powodu zmiany. Działanie na obu hostach pozostaje do potwierdzenia w sesjach, w tym po wznowieniu, kompaktowaniu i forku, z `apply_patch`, brakującym narzędziem oraz czerwonym wynikiem kontroli.

## Rozwinięcie warsztatu — 0.17.0

Aktualizacja z 2026-10-11. Powyższy przegląd opisuje wersję 0.16.0. Poniższe mechanizmy dodano w repozytorium do wersji 0.17.0; nie potwierdzono ich działaniem w sesjach obu hostów. Liczba skilli i siedem bramek pozostają takie same.

| Mechanizm | Instrukcje i wykonanie |
| --- | --- |
| aktualność map | `poznaj` zapisuje checkpoint źródeł i ich listę; `scripts/aktualnosc-map.mjs` jest wywoływany przez `stan.mjs` i dostępny jako raport dla `gdzie`; `buduj` i `napraw` wskazują mapy do ponownego sprawdzenia |
| założenia, prostota i zakres | kontrakt oraz `pomysl`, `buduj`, `napraw`; recenzent jakości ocenia uzasadnienie abstrakcji, recenzent zgodności także usunięcia poza zakresem |
| mierzalne eksperymenty | wspólna `procedury/eksperyment.md`, plan i wynik z `szablony/eksperyment.md` w `.ai/eksperymenty/`; grill proponuje plan bez kodu, wykonanie następuje po akceptacji celu, zakresu i budżetu |
| organizacja kontekstu | stałe reguły oddzielone od zmiennego stanu, czytanie potrzebnych materiałów, zwięzłe logi i przekazanie; parametrami cache steruje host |

Po korekcie ładowania instrukcji `KONTRAKT.md` jest wspólnym rdzeniem ze spisem działów (70 linii). Szczegóły przeniesiono do 12 plików w `plugins/ai/kontrakt/`, zachowując pojedyncze miejsce każdej reguły. Wszystkie 17 skilli wskazują konkretne pliki i warunki czytania kolejnych sekcji. Rdzeń czyta się przy pierwszym użyciu w sesji, ponownie po zmianie instrukcji lub utracie kontekstu. Koszt tokenów i wpływ na cache nie zostały zmierzone.

W `gdzie` ścieżka kontrolera map to `../../scripts/aktualnosc-map.mjs` względem jego `SKILL.md`. Agent rozwiązuje ją do ścieżki absolutnej i przekazuje do Node wraz z katalogiem projektu zawierającym `.ai/ROADMAP.md`. Nie polega na podstawieniu `<katalog-pluginu>`, bieżącym katalogu powłoki ani zmiennej `CLAUDE_PLUGIN_ROOT`.

Nowa mapa obszaru ma frontmatter `poznany-commit` (pełny hash źródeł) oraz `zrodla-kodu` (tablica JSON w jednej linii ze ścieżkami względem korzenia projektu, z `/`, bez globów i `..`). Źródła obejmują także istotne testy, konfiguracje i zależności poza katalogiem modułu. Starsze mapy uzupełnia `poznaj` po sprawdzeniu, bez automatycznej migracji.

Kontrola porównuje nazwy źródeł z wersją roboczą względem checkpointu oraz listą plików nieśledzonych, więc uwzględnia staged zmiany i usunięcia. Zwraca `zmienione`, `bez-zmian` albo `nieznana`. Git jest odczytywany lokalnie, z łącznym budżetem 3 sekund. Brak metadanych, niedostępny checkpoint lub błąd kontroli nie stają się wynikiem „bez zmian”. Hook pokazuje do pięciu map i liczbę pozostałych; nie uruchamia modelu, nie czyta treści źródeł i niczego nie zapisuje. Zachowuje opisane wyżej ograniczenie wykrywania korzenia przez `stan.mjs`.

Zmiana źródła jest sygnałem do sprawdzenia opisu, a brak zmiany nie potwierdza jego prawdziwości. Nie powstaje druga wiki ani automatyczna aktualizacja specu i ADR według kodu. Checkpoint przesuwa `poznaj` dopiero po sprawdzeniu; przy źródłach roboczych pozostaje wcześniejszy checkpoint i jawne ograniczenie.

Eksperyment ma punkt odniesienia, ustaloną ocenę i poprawność, ograniczenia prób, czasu i dostępnego kosztu, warunek stagnacji oraz odrębne przypadki końcowe. Prototyp pracuje poza repo; zmiany produkcyjne pozostają w zakresie ticketu lub naprawy. `retro` może proponować ocenę kandydata instrukcji w izolowanej kopii, z osobnymi wynikami Codexa i Claude Code oraz akceptacją wdrożenia. Zgoda na edycję instrukcji nie oznacza automatycznej zgody na kosztowną ocenę.

Kontrakt uzupełniono również o wyłączenie dziedziczenia rozmowy przy uruchamianiu niezależnego recenzenta lub oceniającego, jeśli host udostępnia tę możliwość. Instrukcja jest w `plugins/ai/kontrakt/narzedzia.md` → „Subagenci i modele”; zastąpiła wcześniejszy zapis w monolitycznym `KONTRAKT.md`. Luka 7 przeglądu wersji 0.16.0 jest poprawiona w instrukcjach; działanie delegowania nadal wymaga potwierdzenia w danym kliencie.

Inspiracje: cztery lokalne dokumenty analizowane przed tą zmianą — [prompt caching](Claude_%20How%20prompt%20caching%20actually%20works.md), [obserwacje Karpathy’ego](Andrej%20Karpathy%20%28%40karpathy%29%20w%20serwisie%20X.md), [universal autoresearch](I%20Turned%20Andrej%20Karpathy’s%20Autoresearch%20Into%20a%20Universal%20Skill.md) i [wiki z kodu](How%20I%20turned%20Andrej%20Karpathy’s%20LLM%20Wiki%20into%20a%20tool%20that%20writes%20wiki’s%20from%20code.md). Warsztat wykorzystuje zasady opisane w tych materiałach; ich przykładowych skryptów i nieograniczonych pętli nie skopiowano.

### Potwierdzenie użytkownika i doprecyzowanie odsyłaczy

Uzupełnienie z 2026-10-11 na podstawie sprawdzenia zgłoszonego przez użytkownika:

- Walidator Claude Code 2.1.296 przechodzi po podziale kontraktu i poprawieniu ścieżki w `gdzie`. Claude sprawdził poleceniami zachowanie nagłówków starego kontraktu, obecność wszystkich działów w indeksie i istnienie ścieżek w skillach. Po doprecyzowaniu odsyłaczy użytkownik sprawdził 134 odwołania — wszystkie istnieją. Według tego sprawdzenia skill zwykle wczytuje 15–25 KB zamiast 78 KB; to rozmiar treści, nie pomiar tokenów ani cache.
- Wersja narzędzia `claude` dostępnego w `PATH` pozostaje 2.1.59. Wynik walidatora 2.1.296 nie potwierdza wykonania hooków przez tę starszą wersję.
- Matcher `SessionStart` nadal nie obejmuje `fork`. Uruchamianie hooków z `${CLAUDE_PLUGIN_ROOT}` w Codexie na Windows pozostaje niepotwierdzone. Walidacja definicji pluginu nie potwierdza wykonania jego hooków.

Po tym przeglądzie odsyłacze w skillach doprecyzowano: wskazują plik i pełną nazwę sekcji. Sprzątanie kieruje do `kontrakt/sprzatanie.md`, commity do `kontrakt/git.md`, a profile do `kontrakt/profile-i-wydania.md` w momencie rozwijania profilu przez `retro`. Przy lekcjach rozdzielono zasady zapisu w `kontrakt/pamiec.md` od formatu wpisu w `kontrakt/formaty.md`. Pozostałe odsyłacze do wydzielonych działów również wskazują plik; nie rozszerza to zestawu materiałów wczytywanych na starcie skilla.

## Źródła

Dokumentacja, stan na 2026-10-10:

- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Plugin loading reference](https://code.claude.com/docs/en/plugins/loading)
- [Plugin manifest reference](https://code.claude.com/docs/en/plugins-reference)
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Build skills](https://learn.chatgpt.com/codex/build-skills) (wcześniej `developers.openai.com/codex/skills`)
- [Hooks](https://learn.chatgpt.com/codex/hooks)
- [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Agent Skills specification](https://agentskills.io/specification)

Kod pluginu: `plugins/ai/KONTRAKT.md` (wspólny rdzeń i indeks), `plugins/ai/kontrakt/` (szczegóły, w tym „Hooki kodu” i „Subagenci i modele” w `narzedzia.md`), `plugins/ai/hooks/hooks.json`, `plugins/ai/scripts/stan.mjs`, `plugins/ai/scripts/kod.mjs`, `plugins/ai/skills/*/SKILL.md`.
