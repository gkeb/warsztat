---
name: gdzie
description: Pokazuje postęp, następny krok i rozjazdy między roadmapą, mapami i ticketami. Użyj także po przerwie albo do cotygodniowego przeglądu (argument `tydzien`).
argument-hint: "[slug | tydzien]"
---

# Stan projektu

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`. Użyj slugu lub argumentu `tydzien` podanego przy wywołaniu skilla albo w bieżącej wiadomości. Brak `.ai/` → zaproponuj skill `start`.

Pytaj o zgodę na naprawienie wykrytych rozjazdów zgodnie z sekcją `## Jak pytać` w kontrakcie.

Domyślnie **tylko czytasz**. Rozjazdy naprawiasz dopiero po zgodzie.

## Raport — tryb domyślny albo `slug`

Wczytaj `ROADMAP.md`. Dla każdej zdolności z Teraz (albo tylko dla podanego slugu) wczytaj `mapa.md` i frontmattery ticketów. Sprawdź `git status -sb` (gałąź, przed/za zdalną) i ostatnie commity z prefiksem slugu.

Format, zwięźle:

```text
Teraz
  <slug> — <status> — tickety: 2/5 zrobione, 1 w toku
    Następny krok: …
    Stan sesji: … (jeśli jest)
Dalej: <slug>, <slug>, …   Mgła: <n> pozycji
Gałąź: … (przed/za zdalną o n; PR: adres i stan — przy trybie zdolnosc)
Niezacommitowane: … (jeśli są)

→ Proponuję skill: <nazwa> <argument>
```

## Rozjazdy do wykrycia

- Zdolność w `spec` albo dalej bez linii `Druga opinia:` (i bez notatki „spec bez drugiej opinii”) przy `weryfikacja.drugaOpinia` = `wymagana`.
- Status w roadmapie nie zgadza się z plikami: `spec` bez `spec.md`; `plan` bez ticketów; `budowa` bez żadnego ticketu `w-toku` ani `zrobione`; `weryfikacja` z otwartym ticketem albo bez rundy w `weryfikacja.md` dłużej niż dzień; najnowsza runda `nie przeszła`, a status wciąż `weryfikacja`; wszystkie tickety zrobione, a status wciąż `budowa`.
- Limit Teraz przekroczony.
- Slug w roadmapie bez folderu (poza `pomysl`) albo folder bez linii w roadmapie.
- Ticket `w-toku` bez `Stan sesji` przy niezacommitowanych zmianach — ryzyko zgubionej pracy.
- Następny krok w mapie wskazuje ticket, który jest już zrobiony albo zablokowany.
- `lekcje.md` ma ponad ~40 linijek albo lekcje z co najmniej dwoma wystąpieniami — czas na skill `retro`. Wypisz te lekcje.
- `proby.md` ma wpis `nierozwiazane`, który w międzyczasie rozwiązano (kod, commit, lekcja) — zamień go w lekcję.
- Otwarte rozjazdy w `.ai/zrodla.md` — pokaż ich liczbę; czekają na decyzję człowieka.
- Pliki z zamiarem (`.ai/zrodla.md` → `## Zamiar`) zmienione albo usunięte od ostatniego rozbioru (`git log <commit>..HEAD -- <plik>` albo niezacommitowane zmiany) — zaproponuj `skill pomysl [produkt] <plik>`, który rozbierze tylko zmiany. Jeśli zmiana jest niezacommitowana, skill zaproponuje commit tego pliku i od razu kontynuuje. Wpisy `bez gita` pomijasz — tam nie da się wykryć zmian.
- `.ai/ZASADY.md`: zasady twarde bez automatu (`Egzekwowanie: przegląd` albo `brak` — kandydaci do automatyzacji); zasady oparte na ADR `nieaktualna` albo `zastąpiona`; zasady z wyjątkiem przypisanym do zamkniętej zdolności (wyjątek miał się skończyć).
- `.ai/proby.md`: liczba wpisów `nierozwiazane` i `odlozone`; wpisy, których warunek „Wróć, gdy” wygląda na spełniony (np. nowsza wersja biblioteki w lockfile).
- Przemyślenia: `otwarte` w `.ai/przemyslenia/` nieruszane od ponad dwóch tygodni; `odłożone`, których warunek „Wróć, gdy” wygląda na spełniony; `dojrzałe → zdolność`, a zdolności nie ma w roadmapie.
- Profile: `warsztat.json` → `profile` puste albo bez klasy aplikacji, choć kod ją zdradza (np. `astro.config.*` → `strona`, ręcznie utrzymywany `index.html` → `html`); pozycje `otwarte` w `.ai/profil.md`; pozycje z plików profili w `../../profile/`, których rejestr jeszcze nie ma (profil urósł) — zaproponuj ich rozstrzygnięcie.
- Wydania: zmiany widoczne dla użytkownika od ostatniego wpisu w `.ai/wydania.md` (zdolności w Zrobione, commity `fix:`, sekcja `## Niewydane` w historii zmian) — ile i od kiedy czekają; `wydanie.komendy` puste przy profilu, który coś wydaje.
- Punkt odniesienia walidacji: ile znanych błędów w `odniesienie.znane` i czy lista maleje (`git log -p -- .ai/warsztat.json`). Rosnąca lista to rozjazd.
- Mapy w `.ai/obszary/` poznane na commicie, od którego obszar mocno się zmienił — zaproponuj `skill poznaj <obszar>`.
- Blok warsztatu w `AGENTS.md` starszy niż plugin (wersja w znaczniku `warsztat:start` kontra `version` w `../../plugin.json`) albo `CLAUDE.md` bez importu `@AGENTS.md` — zaproponuj skill `start` (krok „Aktualizacja”).
- **Git:** commity niewypchnięte przy `git.push` = `pytaj` albo `zawsze`; gałąź za zdalną (praca z innego komputera — `git pull --ff-only` przed zmianami). Przy `git.galezie` = `zdolnosc`: zdolność w `budowa` albo `weryfikacja`, a bieżąca gałąź to nie `zdolnosc/<slug>`; gałęzie `zdolnosc/*` i `fix/*` zdolności zamkniętych albo porzuconych; zdolność w `weryfikacja` bez PR (`gh pr view zdolnosc/<slug>`).
- **Bezpieczeństwo:** `bezpieczenstwo.skanSekretow` = `null`, choć `gitleaks` jest dostępny; `.githooks/pre-commit` w repo, a `git config core.hooksPath` na tym komputerze pusty; brakujące wpisy w `.gitignore` albo `permissions.deny` względem szablonów pluginu; plik z listy `chronione` śledzony przez git (`git ls-files`) — to alarm, nie zwykły rozjazd.
- **GitHub** (tylko `tracker` = `github` i działające `gh`): ticket z `github: null`; Issue otwarte przy tickecie `zrobione` albo `porzucony`; Issue zamknięte przy tickecie otwartym; w trybie `tydzien` także otwarte Issue bez ticketu (nowe zgłoszenia) — każde do decyzji: `napraw #<nr>`, `pomysl #<nr>`, Mgła albo zamknięcie.
- **Sprzątanie** (kontrakt, `## Sprzątanie`): procesy z tego projektu, które działają dalej (lista z hooka albo `Get-CimInstance Win32_Process` / `ps` z filtrem po ścieżce projektu) — zapytaj, czy zamknąć; elementy z `sprzatanie.smieci` obecne na dysku — zaproponuj usunięcie; w trybie `tydzien` także nieśledzone i ignorowane pliki oraz katalogi spoza listy i spoza cache narzędzi (`git status --short --ignored`) — dla każdego: usunąć, na listę śmieci, do `.gitignore` czy zostawić. `sprzatanie.smieci` puste przy profilu z testami → zaproponuj listę.
- Pliki w `.ai/sesje/` — przerwana praca poza zdolnościami. Pokaż je w raporcie; starsze niż tydzień zaproponuj dokończyć albo usunąć.

Każdy rozjazd: co się nie zgadza, które źródło wygrywa według kontraktu, proponowana poprawka. Zapytaj, czy naprawić.

## Przegląd tygodniowy — `tydzien`

Prowadź krótko, jedno pytanie naraz:

1. Pokaż całą roadmapę i co zmieniło się od ostatniego tygodnia (`git log --since="1 week ago" -- .ai/`).
2. Czy to, co jest w Teraz, nadal jest najważniejsze?
3. Kolejność w Dalej — użytkownik decyduje, Ty tylko przestawiasz linie.
4. Czy coś z Dalej albo Mgły porzucić?
5. Czy któraś decyzja z Mgły dojrzała do skilla `pomysl`? Przemyślenia `otwarte` — które kontynuujemy (`skill przemysl <slug>`), które odrzucamy albo odkładamy?
   Przy okazji: wpisy `nierozwiazane` z `.ai/proby.md` — który zamieniamy w zdolność albo naprawę, a który zostaje? Wpisy `odlozone` — czy któryś warto wznowić?
6. Jeśli `lekcje.md` urósł, któraś lekcja ma co najmniej dwa wystąpienia albo wygląda na problem ogólny (kandydat na wzorzec) — zaproponuj skill `retro`.
7. Zasady: ile twardych bez automatu? Czy któraś jest masowo łamana — poprawiamy kod czy zmieniamy zasadę?
8. **Pielęgnacja.** Uruchom komendy z `warsztat.json` → `pielegnacja` (tylko te, które niczego nie zmieniają — instalacja, aktualizacja i wdrożenie nie są pielęgnacją) i przejdź listy `Pielęgnacja` z profili projektu. Pokaż znaleziska krótko: zależności przestarzałe i z podatnościami, martwe linki, wyniki Lighthouse, daty wygaśnięcia, treści do odświeżenia. Dla każdego zapytaj: poprawka teraz (skill `napraw`), zdolność (np. aktualizacja wersji głównej jako `refaktor`), Mgła czy nic. Pozycji listy, której nie da się sprawdzić komendą, nie zgadujesz — pytasz albo pomijasz z notatką. Brak komend przy pozycjach, które da się zautomatyzować → zaproponuj wpis w `pielegnacja`.
9. **Wydanie.** Zmiany czekają na wydanie dłużej niż tydzień → zaproponuj skill `wydaj`. Pozycje `otwarte` w `.ai/profil.md` — który rozstrzygamy, który zostaje.

Na koniec zaproponuj commit `warsztat: przegląd RRRR-MM-DD`.
