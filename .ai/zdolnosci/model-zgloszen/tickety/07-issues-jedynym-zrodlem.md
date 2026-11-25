---
nr: "07"
tytul: Issues jedynym źródłem zgłoszeń — migracja pliku zgłoszeń
status: zrobione
blokowany-przez: ["03", "04", "06"]
scenariusze: ["S15", "S16", "S19"]
budowal: "Claude Code / claude-opus-5-5"
github: 9
---

# 07 — Issues jedynym źródłem zgłoszeń — migracja pliku zgłoszeń

## Co widać po zrobieniu

- Pliku zgłoszeń w repozytorium warsztatu nie ma.
- Każdy jego otwarty wpis jest teraz Issue z etykietą `process-report` i etykietą statusu w repozytorium warsztatu (`github.repo`). Wpis z długim planem albo już wdrożony ma zamiast tego odnośnik na liście wynikowej migracji.
- Kontrakt, skille i dokumenty projektu mówią o zgłoszeniach jako Issues.
- Retro opiekuna czyta zgłoszenia z Issues i prowadzi ich cykl życia.
- Skrypty kontrolne potwierdzają, że nic nie zginęło.

## Kryteria akceptacji

- [x] S15: test akceptacyjny przechodzi. Skrypt sprawdza, że pliku zgłoszeń nie ma i że nic nie odsyła do niego w `plugins/ai`, w `AGENTS.md` repozytorium, w `.ai/SLOWNIK.md` ani w `.ai/ZASADY.md`.
- [x] S16: test akceptacyjny przechodzi. Skrypt bierze numery wpisów z ostatniej wersji pliku w historii gita i dla każdego znajduje pozycję na liście wynikowej migracji w `.ai/` (numer → Issue, odnośnik do commita albo odnośnik do mapy).
- [x] S19: test akceptacyjny sesji retro w trybie warsztatu, z atrapą `gh`, przechodzi w trzech przypadkach:
  - przyjęcie zgłoszenia → `issue edit` dodaje `status: accepted` i zdejmuje poprzednią etykietę statusu;
  - odrzucenie → `issue close --reason "not planned"` z komentarzem z powodem;
  - wdrożenie → commit z `Closes #<nr>`.
- [x] Mapowanie statusów: `nowe` → `status: new`, `przyjete` → `status: accepted`, `do-dyskusji` → `status: discussion`.
- [x] Zmigrowane Issue ma tytuł `Z<nr>: <tytuł po angielsku>` i treść po angielsku w polach szkicu: wystąpienia z datami, propozycja z plikiem w `plugins/ai`. Bez danych projektów, z których wyszły wystąpienia.
- [x] Wpisy szczególne:
  - wpis już wdrożony (sprawdzony w kodzie) → na liście wynikowej odnośnik do commita, bez Issue;
  - wpis z długim planem i decyzjami (dziś Z09: część wdrożona jako skill `referencja`, reszta czeka) → niewdrożona część trafia do mapy nowej zdolności w `.ai/zdolnosci/`; jej nazwę i miejsce w roadmapie ustala użytkownik przy migracji (priorytety ustala człowiek).
- [x] Zmienione miejsca:
  - kontrakt: sekcja o zgłoszeniach warsztatu, wiersz w tabeli jednego źródła prawdy, tabela działów;
  - `retro`: opis skilla, tryb warsztatu (zgłoszenia z Issues w `github.repo`), krok wdrożenia;
  - `gdzie`: liczba otwartych Issues `process-report` zamiast liczby wpisów pliku;
  - `AGENTS.md` repozytorium (mapa kodu), hasło „Zgłoszenie” w słowniku (bez „dziś wpis w pliku”), `.ai/zrodla.md`;
  - każde inne odwołanie znalezione przez skrypt S15. Skill `pomysl` nie odsyła do pliku zgłoszeń, więc go nie ruszamy.
- [x] Lista Issues do utworzenia pokazana użytkownikowi przed utworzeniem, bo repozytorium jest publiczne. Issues powstają dopiero po zgodzie.
- [x] Wersja pluginu podbita w obu manifestach, bo zmienia się kontrakt.
- [x] Skrypty S15 i S16 są w `walidacja` w `.ai/warsztat.json` i działają bez sieci.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Kolejność według sygnału globalnego w retro opiekuna — ticket 08.

## Notatki

- Lista wynikowa migracji to jedyny ślad dla S16. Z GitHubem porównuje się ją raz, przy migracji.
- 2026-11-25 — migracja: 9 Issues (#13–#21 w `gkeb/warsztat`) po zgodzie użytkownika na pokazanej liście tytułów, etykiet i zasad filtra; odczyt `gh issue list --label process-report` zgodny z [listą wynikową](../migracja-zgloszen.md). Z09 → commit `0e24356` (krok 1) i mapa [przeniesienie](../../przeniesienie/mapa.md) — nazwa i miejsce (koniec Dalej, status `pomysl`) od użytkownika. Żaden wpis nie był wdrożony w całości.
- 2026-11-25 — tabela działów kontraktu bez zmian: nazwa sekcji „Zgłoszenia warsztatu — zmiany procesu” nadal pasuje. Retro opiekuna czyta zgłoszenia z `github.repo`, kolejność na razie według statusu; sygnał globalny — ticket 08. `gdzie` pomija Issues `process-report` przy „Issue bez ticketu”.
- 2026-11-25 — po przeglądzie, za zgodą użytkownika: walidacja `<nr>` i `<github.repo>` w poleceniach retro i przeformułowanie powodu odrzucenia przed zgodą; liczba testów w `AGENTS.md`; dopisek w starym badaniu.
