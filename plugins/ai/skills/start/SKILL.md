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
- **Klasa aplikacji** (profile w `../../profile/`): `astro.config.*` albo inny generator stron → `strona`; `[project.scripts]` w `pyproject.toml`, pole `bin` w `package.json` albo parser argumentów jako punkt wejścia → `cli`. Pusty projekt — klasę ustali `pomysl produkt`, zapytaj tylko, jeśli użytkownik już ją zna.
- **Tryb:**
  - **pusty projekt** — brak kodu źródłowego (najwyżej README, licencja, konfiguracja);
  - **zastany kod** — wszystko inne.
- **Plik z zamiarem** — w obu trybach poszukaj pliku, w którym użytkownik spisał pomysł: `POMYSL*.md`, `pomysl*.md`, `brief*.md`, `koncepcja*.md`, `wizja*.md`, `IDEA*.md`, także w `docs/`. Znalezione pokaż i zapytaj, czy od nich zacząć. Nie rozbierasz ich tutaj — to robi skill `pomysl`.
- W zastanym kodzie także inwentaryzacja dokumentacji: katalogi ADR (`docs/adr`, `doc/adr`, `docs/decisions`, `adr/`, pliki z „ADR” albo „decision” w nazwie), README, ARCHITECTURE, `docs/`, CONTRIBUTING. Tylko co jest i gdzie — bez czytania wszystkiego.

Pokaż wynik rozpoznania w kilku linijkach i potwierdź tryb, jeśli nie jest oczywisty.

## 2. Git

Jeśli repo nie jest gitem, zapytaj, czy zrobić `git init`. Bez gita skill `buduj` nie będzie commitować.

## 3. Pliki warsztatu

- `.ai/`: utwórz brakujące `warsztat.json`, `ROADMAP.md`, `SLOWNIK.md`, `ZASADY.md` (z `../../szablony/ZASADY.md`), `lekcje.md` i katalog `zdolnosci/` (z `.gitkeep`).
- Profile: potwierdź klasę aplikacji z rozpoznania i wpisz ją do `warsztat.json` → `profile` obok `przekrojowe` (np. `["przekrojowe", "cli"]`). Klasa bez gotowego profilu → zostaje samo `przekrojowe`; powiedz, że brakujący profil może powstać przez `retro`. `.ai/profil.md` powstanie przy pierwszym przejściu listy (`pomysl produkt` albo `poznaj`).
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
2. **`.ai/warsztat.json`** — dopisz klucze, które przybyły w nowszym szablonie, z wartościami domyślnymi. Istniejących wartości nie zmieniasz.
3. **`CLAUDE.md`** — import `@AGENTS.md` jest na miejscu.
4. **Nowe elementy kontraktu**, których projekt jeszcze nie używa (np. katalog prób, mapy obszarów, profile, rejestr wydań) — tylko wymień je jednym zdaniem. Pliki powstaną, gdy będą potrzebne. Wyjątek: `profile` w `warsztat.json` — zaproponuj klasę z rozpoznania (krok 1), bo od niej zależą listy decyzji, niedowiezienia i wydanie.

Podsumuj zmiany i zaproponuj commit `warsztat: aktualizacja do v<wersja>`.

## 7. Podsumowanie

Lista: tryb, utworzone, pominięte (już istniały), katalog ADR, walidacja i punkt odniesienia, jeden skill na teraz. Zaproponuj commit `warsztat: start` (pliki warsztatu i ewentualne przeniesienie ADR-ów) — zrób go tylko po zgodzie.
