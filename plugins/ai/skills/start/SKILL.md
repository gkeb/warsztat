---
name: start
description: Jawnie uruchamiany raz na projekt, by założyć lub uzupełnić szkielet warsztatu (.ai/, AGENTS.md, CLAUDE.md) bez nadpisywania istniejących plików. Rozpoznaje pusty projekt albo zastany kod z dokumentacją i dobiera pierwsze kroki.
disable-model-invocation: true
---

# Start warsztatu w tym repozytorium

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie `## Zastany projekt` i `## Rodzaje zdolności`. Szablony są w `../../szablony/`.

Wszystkie pytania do użytkownika zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie.

Zasada nadrzędna: **niczego nie nadpisujesz i niczego nie przenosisz bez zgody**. Istniejące pliki zostawiasz, brakujące tworzysz z szablonów. Nie migrujesz historii projektu.

## 1. Rozpoznanie — sam, bez pytania

- Git: czy to repo, ile ma commitów.
- Warsztat: czy istnieją `.ai/`, `AGENTS.md`, `CLAUDE.md`.
- Stos: `package.json` / `tsconfig.json` → TypeScript; `pyproject.toml` / `requirements*.txt` → Python.
- Komendy, które faktycznie istnieją: skrypty `test`, `typecheck`, `lint`; `ruff`, `pytest`, `mypy`.
- **Klasa aplikacji** (profile w `../../profile/`): `astro.config.*` albo inny generator stron → `strona`; `index.html` z ręcznie utrzymywanymi plikami HTML/CSS i bez generatora lub frameworka → `html`; `[project.scripts]` w `pyproject.toml`, pole `bin` w `package.json` albo parser argumentów jako punkt wejścia → `cli`. Pusty projekt — klasę ustali `pomysl produkt`, zapytaj tylko, jeśli użytkownik już ją zna.
- **Tryb:**
  - **pusty projekt** — brak kodu źródłowego (najwyżej README, licencja, konfiguracja);
  - **zastany kod** — wszystko inne.
- **Plik z zamiarem** — w obu trybach poszukaj pliku, w którym użytkownik spisał pomysł: `POMYSL*.md`, `pomysl*.md`, `brief*.md`, `koncepcja*.md`, `wizja*.md`, `IDEA*.md`, także w `docs/`. Znalezione pokaż i zapytaj, czy od nich zacząć. Nie rozbierasz ich tutaj — to robi skill `pomysl`.
- W zastanym kodzie także inwentaryzacja dokumentacji: katalogi ADR (`docs/adr`, `doc/adr`, `docs/decisions`, `adr/`, pliki z „ADR” albo „decision” w nazwie), README, ARCHITECTURE, `docs/`, CONTRIBUTING. Tylko co jest i gdzie — bez czytania wszystkiego.

Pokaż wynik rozpoznania w kilku linijkach i potwierdź tryb, jeśli nie jest oczywisty.

## 2. Git i bezpieczeństwo

Zasady: sekcje `## Git i GitHub` i `## Bezpieczeństwo i dane` w kontrakcie.

Jeśli repo nie jest gitem, zapytaj, czy zrobić `git init -b main`. Bez gita skill `buduj` nie będzie commitować, a reszta tego kroku odpada.

**Sprawdź sam**, potem pokaż wynik i propozycje jedną listą — zgoda na całość albo po punkcie:

- **Tożsamość:** `git config user.name` i `user.email`. Brak → poproś o wartości, nie zgadujesz.
- **Remote i gałąź główna:** `git remote get-url origin` → GitHub → `github.repo` (`właściciel/nazwa`); nazwa gałęzi głównej → `git.glowna`. Bez remote powiedz, że push, PR i Issues odpadają, dopóki go nie będzie. Repo na GitHubie zakładasz (`gh repo create`) tylko na prośbę.
- **`.gitignore`:** brakujące wpisy z `../../szablony/gitignore-bezpieczenstwo` → dopisz na końcu pliku. Plik śledzony przez git, który pasuje do tych wpisów (`git ls-files` — np. `.env`, `*.pem`) → **alarm**: zatrzymaj się i postępuj według punktu „Wyciek” w kontrakcie.
- **Skan sekretów:** `gitleaks version`.
  - Jest → `bezpieczenstwo.skanSekretow` = `gitleaks git --pre-commit --staged --redact --no-banner` (wersja starsza niż 8.19: `gitleaks protect --staged --redact --no-banner`).
  - Brak → zaproponuj instalację: Windows `winget install Gitleaks.Gitleaks` albo `scoop install gitleaks`, macOS `brew install gitleaks`, Linux — menedżer pakietów albo plik z wydań na GitHubie. Nie instalujesz sam. Do czasu instalacji `skanSekretow` zostaje `null`, a skille skanują zmiany ręcznie.
  - Hook: projekt ma `.husky/` albo `.pre-commit-config.yaml` → dopisz gitleaks do istniejącego mechanizmu (w `pre-commit`: repo `https://github.com/gitleaks/gitleaks`, hook `gitleaks`). Inaczej skopiuj `../../szablony/pre-commit` do `.githooks/pre-commit`, dopisz do `.gitattributes` linię `.githooks/* text eol=lf` (skrypt z CRLF nie ruszy na Windowsie) i ustaw `git config core.hooksPath .githooks`.
  - Zastane repo z historią → zaproponuj jednorazowy skan całej historii: `gitleaks git --redact --no-banner`. Znaleziska pokazujesz; co z nimi zrobić, decyduje człowiek.
- **Lista śmieci** (`sprzatanie.smieci`, kontrakt `## Sprzątanie`): zaproponuj według stosu — Playwright → `test-results/`, `playwright-report/`, `blob-report/`; pokrycie testów → `coverage/` (TypeScript), `htmlcov/` i `.coverage` (Python); zawsze `tmp/`, `.tmp/`, `npm-debug.log*`, `yarn-error.log*`. Każdy wpis musi być też w `.gitignore`. Nic, co może być pracą człowieka albo konfiguracją — w razie wątpliwości pytasz.
- **Blokada odczytu w Claude Code:** `.claude/settings.json` → `permissions.deny` — dopisz brakujące reguły z `../../szablony/claude-settings.json` (dla każdego wzorca z `bezpieczenstwo.chronione` para `Read(**/<wzorzec>)` i `Edit(**/<wzorzec>)`). Istniejących ustawień nie ruszasz. Powiedz wprost, że te reguły nie zatrzymują powłoki, a w Codexie działa tylko reguła z `AGENTS.md`.
- **Sposób pracy** — jedno wywołanie narzędzia pytań z trzema niezależnymi pytaniami (decyzja P-23):
  1. gałęzie: `glowna` (rekomendowane przy pracy solo) albo `zdolnosc` z PR;
  2. push po commicie: `pytaj` (rekomendowane) / `zawsze` / `nigdy`;
  3. tracker: `pliki` (rekomendowane) albo `github` — Issues jako lustro ticketów. Wymaga `gh` i remote na GitHubie; przy repo publicznym Issues są publiczne.

  Tryb `zdolnosc` albo tracker `github` → sprawdź `gh auth status`. Brak `gh` albo logowania → powiedz, że skille podadzą komendy do ręcznego uruchomienia, i zaproponuj `gh auth login`.
- **Ustawienia GitHuba** — tylko gdy jest remote na GitHubie i `gh` jest zalogowane; każdą komendę pokazujesz przed uruchomieniem, bo zmienia ustawienia poza repozytorium:
  - skanowanie sekretów z blokadą pushu: `gh api -X PATCH repos/<repo> -f "security_and_analysis[secret_scanning][status]=enabled" -f "security_and_analysis[secret_scanning_push_protection][status]=enabled"`;
  - ruleset gałęzi głównej (zakaz force-pusha i usunięcia): `gh api -X POST repos/<repo>/rulesets --input <katalog pluginu>/szablony/github-ruleset.json`.
  
  Widoczność sprawdź przez `gh repo view <repo> --json visibility`. Repo prywatne na darmowym planie → obie funkcje są płatne; pomiń je i zapisz to w podsumowaniu.

## 3. Pliki warsztatu

- `.ai/`: utwórz brakujące `warsztat.json`, `ROADMAP.md`, `SLOWNIK.md`, `ZASADY.md` (z `../../szablony/ZASADY.md`), `lekcje.md` i katalog `zdolnosci/` (z `.gitkeep`).
- Profile: potwierdź klasę aplikacji z rozpoznania i wpisz ją do `warsztat.json` → `profile` obok `przekrojowe` (np. `["przekrojowe", "html"]`). Klasa bez gotowego profilu → zostaje samo `przekrojowe`; powiedz, że brakujący profil może powstać przez `retro`. `.ai/profil.md` powstanie przy pierwszym przejściu listy (`pomysl produkt` albo `poznaj`).
- `AGENTS.md` — wspólne instrukcje dla wszystkich agentów (zob. `## AGENTS.md i CLAUDE.md` w kontrakcie):
  - brak pliku → utwórz: nagłówek `# <nazwa projektu>`, jedno zdanie o projekcie, sekcja z `AGENTS-projekt.md` (w pustym projekcie pomiń), potem blok z `AGENTS-blok.md`;
  - plik jest, bez znacznika `warsztat:start` → dopisz blok na końcu. Istniejącej treści nie zmieniasz;
  - blok już jest → krok „Aktualizacja” niżej.
  - W znaczniku bloku `{{wersja}}` zastąp wersją pluginu z pola `version` w `../../plugin.json` (względem tego pliku `SKILL.md`).
- `CLAUDE.md` (także `.claude/CLAUDE.md`) — tylko import `@AGENTS.md` i ewentualne uwagi specyficzne dla Claude Code, nigdy kopia treści:
  - brak pliku → utwórz z jedną linią `@AGENTS.md`;
  - plik jest, bez importu → dopisz `@AGENTS.md` w pierwszej linii. Zwykłe zdanie „przeczytaj AGENTS.md” nie wystarcza — Claude czyta wtedy plik tylko, jeśli sam uzna to za potrzebne;
  - plik zawiera fakty o projekcie → zaproponuj przeniesienie: uruchamianie i pułapki do `AGENTS.md` → `## Projekt`, konwencje kodu i architekturę do `.ai/ZASADY.md`, żeby widziały je wszystkie agenty, a w `CLAUDE.md` zostaw import i treść specyficzną dla Claude Code. Przenosisz tylko po zgodzie.

## 4. Decyzje (ADR)

- **Brak zastanych ADR-ów** → `sciezki.decyzje` = `.ai/decyzje`, utwórz katalog z `.gitkeep`.
- **Są zastane ADR-y** → zapytaj, rekomendując pierwszą opcję:
  1. zostawić je na miejscu — `sciezki.decyzje` wskazuje ich katalog, nowe ADR-y piszemy w ich formacie i numeracji (rekomendowane: zachowuje historię i linki);
  2. przenieść do `.ai/decyzje/` przez `git mv`, z zachowaniem numeracji i poprawą linków w repo — gdy stary układ jest martwy i nikt inny z niego nie korzysta.
- Zapisz katalog, format i liczbę ADR-ów w `.ai/zrodla.md` (z szablonu).

## 5. Walidacja

- **Pusty projekt** → `walidacja` zostaje pusta. Ustawi ją pierwsza zdolność `szkielet`. Powiedz to wprost.
- **Zastany kod** → zaproponuj komendy (TypeScript: `npx tsc --noEmit` + skrypt testów; Python: `ruff check .` + `pytest`; albo to, czego używa CI) i potwierdź jednym pytaniem. Potem **uruchom je**:
  - zielone → `odniesienie` zostaje puste;
  - czerwone → pokaż błędy i zaproponuj zapisanie ich jako punktu odniesienia (`odniesienie.data` + `odniesienie.znane`: test, reguła lint, plik). Od tej pory walidacja przechodzi, gdy nie ma nowych błędów. Lista może tylko maleć;
  - testów brak → powiedz to; pierwszy ticket pierwszej zdolności je postawi.

## 6. Pierwsze kroki — zależnie od trybu

**Pusty projekt:**

- Nic nie wpisujesz do roadmapy sam. Następny krok to `skill pomysl produkt` — albo `skill pomysl produkt <plik>`, jeśli użytkownik ma spisany pomysł (zapytaj, nawet gdy rozpoznanie niczego nie znalazło): wspólnie ustalimy cel produktu, listę zdolności i decyzje fundamentowe (stos, dane, wdrażanie), a pierwszą zdolnością w Teraz zostanie `szkielet`.
- Zaproponuj, żeby zrobić to od razu, w tej sesji.

**Zastany kod:**

- Zaproponuj `skill poznaj ogolnie` (rekomendowane, jeśli `AGENTS.md` nie ma sekcji `## Projekt`): uruchamianie, mapa obszarów, aktualność dokumentacji i rozstrzygnięcia z profilu, które kod już podjął.
- Plik z zamiarem dla tego projektu → po poznaniu zaproponuj `skill pomysl produkt <plik>` (cały projekt) albo `skill pomysl <plik>` (jedna zdolność).
- Roadmapa — krótko, najwyżej kwadrans:
  - zapytaj o 3–10 zdolności, które użytkownik ma w głowie, i o tę jedną, nad którą realnie teraz siedzi;
  - wszystkie wpisz do `ROADMAP.md` jako `pomysl` (Dalej albo Mgła — decyduje użytkownik);
  - zapytaj, czy warto zapisać `## Cel` produktu (3–5 zdań). Przy dojrzałym projekcie zwykle tak;
  - tę jedną przenieś do Teraz i załóż jej `zdolnosci/<slug>/mapa.md` z linią `Rodzaj:`:
    - praca już trwa i wiadomo, co robić → jeden ticket `01` opisujący bieżący kawałek, status `plan`, Następny krok `skill buduj <slug>`;
    - dopiero pomysł → status `grill`, Następny krok `skill pomysl <slug>` (albo najpierw `skill poznaj <obszar>`, jeśli obszar jest nieznany).
  - Zrobionych rzeczy nie wpisujesz wstecz. Trafią do roadmapy, gdy ktoś je ruszy.

## Aktualizacja — ponowne uruchomienie w projekcie z warsztatem

`start` w projekcie, który ma już `.ai/`, niczego nie zakłada od nowa. Sprawdza i proponuje:

1. **Blok w `AGENTS.md`** — porównaj wersję w znaczniku `warsztat:start v…` z wersją pluginu (`../../plugin.json`). Brak wersji w znaczniku = blok sprzed wersjonowania. Starszy blok:
   - pokaż różnice między obecnym blokiem a nowym szablonem;
   - zmiany wewnątrz bloku wprowadzone ręcznie wskaż osobno i zaproponuj przeniesienie ich poza blok (do `## Projekt` albo własnej sekcji), zanim blok zostanie zastąpiony;
   - po zgodzie zastąp całość między `warsztat:start` a `warsztat:koniec`. Treści poza blokiem nie ruszasz.
2. **`.ai/warsztat.json`** — dopisz klucze, które przybyły w nowszym szablonie, z wartościami domyślnymi. Istniejących wartości nie zmieniasz. Klucze, których szablon już nie ma (np. `github.synchronizacja`), wymień i zaproponuj usunięcie.
3. **`CLAUDE.md`** — import `@AGENTS.md` jest na miejscu.
4. **Git i bezpieczeństwo** — krok 2 w trybie sprawdzania: brakujące wpisy w `.gitignore` i `permissions.deny`, `skanSekretow` przy zainstalowanym już gitleaks, a przede wszystkim `core.hooksPath` **na tym komputerze**. To ustawienie lokalne, więc na drugim komputerze albo w świeżym klonie trzeba je włączyć ponownie. Nowe klucze `git` i `tracker` przy pierwszej aktualizacji → zadaj pytania o sposób pracy z kroku 2.
5. **Nowe elementy kontraktu**, których projekt jeszcze nie używa (np. katalog prób, mapy obszarów, profile, rejestr wydań) — tylko wymień je jednym zdaniem. Pliki powstaną, gdy będą potrzebne. Wyjątek: `profile` w `warsztat.json` — zaproponuj klasę z rozpoznania (krok 1), bo od niej zależą listy decyzji, niedowiezienia i wydanie.

Podsumuj zmiany i zaproponuj commit `warsztat: aktualizacja do v<wersja>`.

## 7. Podsumowanie

Lista: tryb, utworzone, pominięte (już istniały), katalog ADR, walidacja i punkt odniesienia, lista śmieci, git i bezpieczeństwo (skan sekretów: hook / ręczny; blokada odczytu; gałęzie, push, tracker; ustawienia GitHuba albo powód pominięcia), jeden skill na teraz. Zaproponuj commit `warsztat: start` (pliki warsztatu, `.gitignore`, `.gitattributes`, `.githooks/`, `.claude/settings.json` i ewentualne przeniesienie ADR-ów) — zrób go tylko po zgodzie, według `### Commit` w kontrakcie.
