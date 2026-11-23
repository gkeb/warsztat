---
nr: "07"
tytul: Issues jedynym źródłem zgłoszeń — migracja pliku zgłoszeń
status: do-zrobienia
blokowany-przez: ["03", "04", "06"]
scenariusze: ["S15", "S16", "S19"]
budowal: null
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

- [ ] S15: test akceptacyjny przechodzi. Skrypt sprawdza, że pliku zgłoszeń nie ma i że nic nie odsyła do niego w `plugins/ai`, w `AGENTS.md` repozytorium, w `.ai/SLOWNIK.md` ani w `.ai/ZASADY.md`.
- [ ] S16: test akceptacyjny przechodzi. Skrypt bierze numery wpisów z ostatniej wersji pliku w historii gita i dla każdego znajduje pozycję na liście wynikowej migracji w `.ai/` (numer → Issue, odnośnik do commita albo odnośnik do mapy).
- [ ] S19: test akceptacyjny sesji retro w trybie warsztatu, z atrapą `gh`, przechodzi w trzech przypadkach:
  - przyjęcie zgłoszenia → `issue edit` dodaje `status: accepted` i zdejmuje poprzednią etykietę statusu;
  - odrzucenie → `issue close --reason "not planned"` z komentarzem z powodem;
  - wdrożenie → commit z `Closes #<nr>`.
- [ ] Mapowanie statusów: `nowe` → `status: new`, `przyjete` → `status: accepted`, `do-dyskusji` → `status: discussion`.
- [ ] Zmigrowane Issue ma tytuł `Z<nr>: <tytuł po angielsku>` i treść po angielsku w polach szkicu: wystąpienia z datami, propozycja z plikiem w `plugins/ai`. Bez danych projektów, z których wyszły wystąpienia.
- [ ] Wpisy szczególne:
  - wpis już wdrożony (sprawdzony w kodzie) → na liście wynikowej odnośnik do commita, bez Issue;
  - wpis z długim planem i decyzjami (dziś Z09: część wdrożona jako skill `referencja`, reszta czeka) → niewdrożona część trafia do mapy nowej zdolności w `.ai/zdolnosci/`; jej nazwę i miejsce w roadmapie ustala użytkownik przy migracji (priorytety ustala człowiek).
- [ ] Zmienione miejsca:
  - kontrakt: sekcja o zgłoszeniach warsztatu, wiersz w tabeli jednego źródła prawdy, tabela działów;
  - `retro`: opis skilla, tryb warsztatu (zgłoszenia z Issues w `github.repo`), krok wdrożenia;
  - `gdzie`: liczba otwartych Issues `process-report` zamiast liczby wpisów pliku;
  - `AGENTS.md` repozytorium (mapa kodu), hasło „Zgłoszenie” w słowniku (bez „dziś wpis w pliku”), `.ai/zrodla.md`;
  - każde inne odwołanie znalezione przez skrypt S15. Skill `pomysl` nie odsyła do pliku zgłoszeń, więc go nie ruszamy.
- [ ] Lista Issues do utworzenia pokazana użytkownikowi przed utworzeniem, bo repozytorium jest publiczne. Issues powstają dopiero po zgodzie.
- [ ] Wersja pluginu podbita w obu manifestach, bo zmienia się kontrakt.
- [ ] Skrypty S15 i S16 są w `walidacja` w `.ai/warsztat.json` i działają bez sieci.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Kolejność według sygnału globalnego w retro opiekuna — ticket 08.

## Notatki

- Lista wynikowa migracji to jedyny ślad dla S16. Z GitHubem porównuje się ją raz, przy migracji.
