# Badanie: Kolizje i konwencje nazw katalogu stanu (`.ai/`, `.ws/`) oraz nazwy „workshop”

- Data: 2026-11-22
- Dla: ogólne
- Kontekst: plugin workflow dla Claude Code i Codex; obecnie `warsztat` + `.ai/`; rozważane `workshop` + `.ws/`. Źródła sieciowe, stan na 2026-11-22; liczby gwiazdek odczytane ze stron GitHub tego dnia.
- Pewność: średnia (twierdzenia o istnieniu konwencji potwierdzone w dokumentacji pierwotnej; brak wyczerpującego przeszukania npm/marketplace'ów)

## Odpowiedź

`.ai/` jest już używany jako konwencja, ale jako katalog źródłowy wskazówek i skilli dla agentów (Laravel Boost, PrestaShop, Drupal, Apache DataFusion Python), więc kolizja z nazwą jest realna na poziomie konwencji, nie pojedynczego narzędzia. Nie znaleziono żadnego narzędzia agentowego używającego `.ws/` w repozytorium projektu; jedyne trafienie to crate Rust `workspacer-config` (`.ws`, lokalny lub globalny). Nazwa „workshop” koliduje wprost z Canonical Workshop (narzędzie „agent-ready”, katalog `.workshop/` w repo) oraz z kilkoma małymi pluginami Claude Code o nazwie zawierającej „workshop”. Dominującą wschodzącą konwencją jest `AGENTS.md` w korzeniu oraz `.agents/skills/`.

## Ustalenia

### Pytanie 1: `.ai/` i `.ws/` w istniejących narzędziach

**Ustalone fakty — `.ai/`:**

1. **Laravel Boost** (oficjalny pakiet Laravela, repo `laravel/boost`, 3,7k gwiazdek [2]) używa `.ai/` w repozytorium aplikacji: „add `.blade.php` or `.md` files to your application's `.ai/guidelines/*` directory” oraz „add a `SKILL.md` file to your application's `.ai/skills/{skill-name}/` directory” [1]. To jest katalog źródłowy użytkownika; wygenerowane pliki trafiają do `CLAUDE.md`, `AGENTS.md`, `junie/` [1]. Najbliższa kolizja treściowo (katalog `.ai/` z konwencją pisaną przez użytkownika), z dużą bazą użytkowników frameworka (liczba użytkowników Boost nieustalona).
2. **PrestaShop** (rdzeń): `.ai/` to „centralized source of truth for all AI-assisted development context”, z `CONTEXT.md`, `STRUCTURE.md`, `GOTCHAS.md`, `skills/`, `generated/`; pliki wskaźnikowe w korzeniu (np. `CLAUDE.md`) „simply redirect the AI tool to the `.ai/` folder” [3]. Popularność repo nie sprawdzona.
3. **Drupal `ai_best_practices`** — propozycja (work item, nie przyjęty standard): „This makes `.ai/skills/` the Drupal skills source convention”; `.agents/skills/` jako domyślny katalog wyjściowy, „because it is tool-neutral”; cytuje Laravel Boost jako precedens [4]. Status propozycji nieustalony.
4. **Apache DataFusion Python** (612 gwiazdek): „The skill definition lives in `.ai/skills/check-upstream/SKILL.md`” [5].
5. Wyszukiwanie zbiorcze wskazuje też społecznościowe wzorce `ai/` / `.ai-rules/` (np. codingbuddy-rules) — źródło wtórne, nie sprawdzone u źródła [6].

**Ustalone fakty — generatory reguł (nie używają `.ai/`):**

6. **Ruler** (`intellectronica/ruler`, 3,0k gwiazdek): „Store all AI instructions in a dedicated `.ruler/` directory”; w `.ruler/`: `AGENTS.md`, `ruler.toml`, `skills/`, `agents/`. Strona nie używa katalogu `.ai` (jedynie `.aiassistant/` jako ścieżka JetBrains) [7].
7. **rulesync** (`dyoshikawa/rulesync`, 1,6k gwiazdek): katalog `.rulesync/`; `.ai` nie występuje [8].
8. **ai-rulez** (`Goldziher/ai-rulez`, 180 gwiazdek): „keeps the instructions for your AI coding assistants in one directory, `.ai-rulez/`”; generuje m.in. `.agents/skills/` [9].
9. Ścieżki wyjściowe, które Ruler zapisuje dla agentów (żadna to `.ai/` ani `.ws/`): `.clinerules`, `.amazonq/rules/`, `.junie/guidelines.md`, `.augment/rules/`, `.kiro/steering/`, `.trae/rules/`, `.openhands/microagents/`, `.aiassistant/rules/`, `.idx/airules.md`, `.goosehints` [7].
10. Narzędzia spec-driven wg wyszukiwania (źródła wtórne, deepwiki/blogi): Spec Kit `.specify`, Kiro/cc-sdd `.kiro/`, OpenSpec `openspec/`; per-agent: `.claude/`, `.cursor/`, `.github/` [10]. Nie sprawdzono dokumentacji pierwotnej każdego.

**Ustalone fakty — `.ws/`:**

11. Crate Rust **`workspacer-config`** 0.1.2: „Represents the path to a `.ws` directory (local or global)”; „A Rust crate to manage and utilize workspace configuration data in `.ws` directories” [11]. Popularność: nie podano (docs.rs nie pokazało pobrań).
12. **alyashour/ws** (Go) trzyma dane w `~/.ws/data/` (katalog domowy, nie repo) — wg wyniku wyszukiwania, nie sprawdzone u źródła [12]. **brudil/workspace** używa plików `ws.toml`, `ws.local.toml`, `ws.repo.toml` (nie katalogu `.ws`) — wg pkg.go.dev, nie sprawdzone u źródła [12].
13. Dla WebStorm/JetBrains: wyszukiwanie dokumentacji WebStorm nie zwróciło żadnej wzmianki o `.ws`; katalog projektu to `.idea` (to ostatnie z wiedzy ogólnej, nie z cytatu) [12].

**Nieustalone:** czy istnieje zamknięte/mniej znane narzędzie agentowe z `.ws/` — wyszukiwanie „.ws folder AI agent” nie dało trafień; to brak dowodu, nie dowód braku. Wyszukiwarki nie indeksują zawartości repozytoriów, więc użycie `.ws/` w prywatnych/niszowych repozytoriach nie jest wykluczone.

### Pytanie 2: wschodzące konwencje katalogów stanu agentów

14. **`AGENTS.md`**: „A simple, open format for guiding coding agents”; „used by over 60k open-source projects”; opiekun: Agentic AI Foundation (Linux Foundation); plik w korzeniu, zagnieżdżone dozwolone, nie definiuje żadnego katalogu [13].
15. **`.agents/skills/`**: dokumentacja Codex: „Codex scans `.agents/skills` in every directory from your current working directory up to the repository root”, także `$HOME/.agents/skills` [14]. Claude Code nadal czyta `.claude/skills/`: issue #31005 „Support for AGENTS.md and .agents/skills/” otwarte; wg komentarza (Sep 2026) natywne `AGENTS.md` weszło w v2.1.277, a natywne wykrywanie `.agents/skills/` nie [15]. Twierdzenie w issue, że „`.agents/skills/` directory is the convention defined by the Agent Skills open standard” pochodzi od użytkownika; nie zweryfikowano w specyfikacji agentskills.io [15].
16. `.agents/` jest używany w repozytoriach projektów (np. Chromium devtools-frontend, WebRTC — według wyników wyszukiwania, bez pobrania pierwotnych stron) [16]. Spec oh-my-agent sam zastrzega, że nie jest formalnym standardem (wg wyniku wyszukiwania) [16].
17. Wzorzec „katalog `.nazwa-narzędzia/` na stan/pamięć w repo” jest powszechny: `.truss/`, `.mex/`, `.kiro/`, `.specify`, `.rulesync/`, `.ruler/`, `.ai-rulez/` [7][8][9][10][17]. Wniosek: dowolna nazwa własna (np. `.warsztat/`, `.workshop/`) pasuje do wzorca; `.ai/` jest nazwą wspólną (generyczną) używaną przez co najmniej cztery projekty z różną semantyką (wniosek z pkt 1–4).
18. Ważne dla Twojego plugina: `.ai/skills/` w Laravel Boost, Drupalu i DataFusion Python oznacza **skille agentów** (SKILL.md), a `.ai/guidelines/` — wskazówki. Twoje `.ai/` trzyma stan projektu (ROADMAP, SLOWNIK, tickety). Jeśli ktoś użyje obu narzędzi w jednym repo, Boost zinterpretuje `.ai/skills/` i `.ai/guidelines/` — podkatalogi o innych nazwach nie koliduje, ale przestrzeń nazw jest współdzielona (wniosek).

### Pytanie 3: kolizje nazwy „workshop”

**Ustalone fakty:**

19. **Canonical Workshop** (`canonical/workshop`, 138 gwiazdek, GPL-3.0): „Workshops are secure, fast, and composable development environments that come agent-ready” [18]. Ogłoszony przez Canonical w maju 2026 jako narzędzie sandboxowanych środowisk deweloperskich także dla agentów AI [19]. Konwencja plików: `workshop.yaml` lub `.workshop/<nazwa>.yaml` w projekcie, plus ukryty `.workshop.lock` („which must remain in the project directory”) [20]. Dostarcza trzy skille agentowe: `use-workshop`, `onboard-workshop`, `design-sdk`; skill `onboard-workshop` zapisuje `.workshop/<NAME>.yaml` w repo [21]. To najpoważniejsza kolizja: ta sama nazwa, kategoria narzędzi deweloperskich związanych z agentami, katalog `.workshop/` w repo i skille o nazwach zaczynających się od „workshop”. Brak informacji o liczbie instalacji snap.
20. **look-itsaxiom/open-workshop**: plugin Claude Code, „Self-organizing AI workshop — project portfolio, department dispatch, engine offloading, and ROI tracking for Claude Code”; ID `open-workshop@look-itsaxiom-open-workshop`; dane w `~/.open-workshop/`; 0 gwiazdek [22].
21. **edimuj/claude-workshop**: marketplace Claude Code „A collection of useful plugins and tools for Claude Code” (pluginy `cli-screenshot`, `smart-terminal-setup`); 0 gwiazdek [23].
22. Mniejsze: marketplace `malston/claude-code-tutor` (plugin dla uczestników warsztatów), `jeffdeville/zForge-marketplace` (warsztaty zForge) — z wyników wyszukiwania, niezależnie nie zweryfikowane [24].
23. **npm `workshop`**: wersja 0.0.0, bez opisu, ostatnia modyfikacja 2022-06-29, opiekun „ericz” — pakiet porzucony/pusty, nie związany z AI [25]. **PyPI `workshop`**: 0.0.0, „webAppWorkshop tools and dependencies”, wysłany 2008-09-28 [26]. Obie nazwy są zajęte, więc publikacja pod gołą nazwą `workshop` na npm/PyPI byłaby niemożliwa bez przejęcia nazwy (wniosek; polityki przejęcia nazw nie sprawdzano).
24. **@bobsworkshop/cli** (npm): asystent kodowania AI w CLI; jedna lista pokazała 1160 pobrań tygodniowo; wg wyszukiwania, bez sprawdzenia strony pakietu [27].

**Nieustalone:** czy istnieją pluginy Codex o nazwie „workshop” (wyszukiwanie ogólne nic nie zwróciło; nie przeszukano katalogu pluginów Codex bezpośrednio); pełna lista marketplace'ów Claude Code (brak wyszukiwarki po nazwie plugin w oficjalnym katalogu); pakiety npm z przedrostkiem `workshop-`/`@*/workshop`; liczba instalacji Canonical Workshop.

## Niepewności

- Nie przeszukano bezpośrednio rejestrów (npm search, PyPI search, katalogów pluginów Claude Code/Codex) — tylko wyszukiwarka ogólna i pobrania wybranych stron. Brak trafienia nie oznacza braku kolizji.
- Liczby gwiazdek to stan z dnia badania, odczyt przez narzędzie streszczające stronę.
- Twierdzenia z pkt 5, 10, 12, 16, 22, 24 pochodzą z wyników wyszukiwania, nie z pobrania źródła pierwotnego; traktować jako wskazówki.
- Nie sprawdzono, czy Claude Code/Codex/Cursor/Copilot/Windsurf/Cline/Aider w swojej dokumentacji rezerwują `.ai/` lub `.ws/`; w pobranych źródłach żadne tego nie robi (Cursor, Windsurf, Copilot, Aider nie były sprawdzane bezpośrednio).
- Czy `.agents/skills/` jest oficjalnie częścią specyfikacji Agent Skills — niezweryfikowane w agentskills.io.

## Źródła

[1] Laravel Boost (docs 12.x) — https://laravel.com/docs/12.x/boost — dokumentacja — Laravel 12.x
[2] laravel/boost — https://github.com/laravel/boost — repo (3,7k gwiazdek)
[3] PrestaShop, Context Structure — https://devdocs.prestashop-project.org/9/development/ai-assisted-development/context-structure/ — dokumentacja — PrestaShop 9
[4] Drupal ai_best_practices, work item 3588225 — https://git.drupalcode.org/project/ai_best_practices/-/work_items/3588225 — issue/propozycja
[5] apache/datafusion-python — https://github.com/apache/datafusion-python — repo (612 gwiazdek)
[6] Awesome AI Conventions / codingbuddy-rules — https://guilhermealbert.github.io/awesome-ai-conventions/docs — źródło wtórne
[7] intellectronica/ruler — https://github.com/intellectronica/ruler — repo (3,0k gwiazdek)
[8] dyoshikawa/rulesync — https://github.com/dyoshikawa/rulesync — repo (1,6k gwiazdek)
[9] Goldziher/ai-rulez — https://github.com/Goldziher/ai-rulez — repo (180 gwiazdek)
[10] Spec Kit / OpenSpec / cc-sdd — https://deepwiki.com/gotalab/cc-sdd/6.1-directory-structure-overview ; https://github.com/Fission-AI/openspec — źródło wtórne / repo
[11] workspacer-config — https://docs.rs/workspacer-config/latest/workspacer_config/ — dokumentacja crate — 0.1.2
[12] alyashour/ws, brudil/workspace — https://github.com/alyashour/ws ; https://pkg.go.dev/github.com/brudil/workspace/internal/config — wyniki wyszukiwania; JetBrains WebStorm help — https://www.jetbrains.com/webstorm/help/project.html
[13] AGENTS.md — https://agents.md — strona projektu
[14] Codex, Build skills — https://learn.chatgpt.com/docs/build-skills (przekierowanie z https://developers.openai.com/codex/skills) — dokumentacja
[15] anthropics/claude-code #31005 — https://github.com/anthropics/claude-code/issues/31005 — issue (otwarte)
[16] Chromium devtools-frontend `.agents`, WebRTC, oh-my-agent — https://chromium.googlesource.com/devtools/devtools-frontend.git/+/HEAD/.agents ; https://raw.githubusercontent.com/first-fluke/oh-my-agent/HEAD/docs/AGENTS_SPEC.md — wyniki wyszukiwania
[17] KornLabs/truss, mex-memory/mex — https://github.com/KornLabs/truss ; https://github.com/mex-memory/mex — wyniki wyszukiwania
[18] canonical/workshop — https://github.com/canonical/workshop — repo (138 gwiazdek, GPL-3.0)
[19] Canonical, Introducing Workshop — https://ubuntu.com/blog/introducing-workshop-sandboxed-development-environments ; https://www.helpnetsecurity.com/2026/05/28/canonical-workshop-ubuntu/ — blog/prasa
[20] Workshop, Projects — https://ubuntu.com/workshop/docs/explanation/workshops/projects/ — dokumentacja
[21] Workshop and AI agents — https://ubuntu.com/workshop/docs/reference/ai-agents/ — dokumentacja
[22] look-itsaxiom/open-workshop — https://github.com/look-itsaxiom/open-workshop — repo (0 gwiazdek)
[23] edimuj/claude-workshop — https://github.com/edimuj/claude-workshop — repo (0 gwiazdek)
[24] malston/claude-code-tutor, jeffdeville/zForge-marketplace — https://www.claudepluginhub.com/marketplaces/malston-claude-code-tutor-dev ; https://claudemarketplaces.com/plugins/jeffdeville-zforge-marketplace — katalogi, wynik wyszukiwania
[25] npm `workshop` — https://registry.npmjs.org/workshop — rejestr
[26] PyPI `workshop` — https://pypi.org/pypi/workshop/json — rejestr
[27] @bobsworkshop/cli — https://socket.dev/npm/package/@bobsworkshop/cli/overview/0.5.4 — wynik wyszukiwania
