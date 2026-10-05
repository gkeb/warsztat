---
name: przemysl
description: Pomaga przemyśleć luźną myśl o projekcie pytaniami sokratejskimi — bez podsuwania odpowiedzi — aż dojrzeje do pomysłu, decyzji albo badania, albo zostanie świadomie odrzucona. Prowadzi zbiór przemyśleń w .ai/przemyslenia/. Użyj, gdy pada „zastanawiam się, czy…”, „mam taką myśl…”, przed pomysłem, którego cel jest jeszcze niejasny, albo gdy użytkownik chce zrozumieć koncepcję, zanim cokolwiek zdecyduje.
argument-hint: "[myśl | slug]"
---

# Przemyślenie

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie `## Przemyślenia — metoda sokratejska`. Szablon: `../../szablony/przemyslenie.md`. Myśl albo slug weź z wywołania skilla albo z bieżącej wiadomości. Brak `.ai/` → możesz prowadzić rozmowę, ale zapis zaproponuj dopiero po skillu `start`.

W tej sesji **nie piszesz kodu, nie rekomendujesz i nie decydujesz**. Pytasz, porządkujesz i zapisujesz to, do czego dochodzi użytkownik.

## 1. Co przemyślamy

- **Bez argumentu** → wypisz przemyślenia `otwarte` i `odłożone` (z warunkiem powrotu, który mógł się spełnić) z `.ai/przemyslenia/` i zapytaj, do którego wracamy albo jaka jest nowa myśl.
- **Slug istniejącego przemyślenia** → wczytaj je, pokaż w 2–3 zdaniach, do czego doszliśmy i co otwarte, i kontynuuj od tego miejsca. Dopisz datę sesji.
- **Nowa myśl** → najpierw przeszukaj `.ai/przemyslenia/`, `ROADMAP.md` (także Porzucone i Mgłę), `.ai/proby.md` i decyzje. Podobna myśl już była:
  - odrzucona → pokaż powód i zapytaj: „Co zmieniło się od tamtej pory?” Nowy argument → kontynuujesz tamto przemyślenie; brak → zostaje odrzucone;
  - dojrzała → pokaż, dokąd trafiła; zwykle rozmowa należy już tam;
  - jest zdolnością w roadmapie → zapytaj, czy to myśl o niej (wtedy raczej `pomysl <slug> sokratejsko`), czy coś osobnego.
- Nowe przemyślenie: plik `.ai/przemyslenia/RRRR-MM-DD-slug.md` z szablonu, myśl słowami użytkownika, siebie w `Prowadził:`. Slug — kebab-case, ASCII.

Kontekst projektu (cel z roadmapy, słownik, zasady) czytasz, żeby pytania były trafne — nie po to, żeby z niego odpowiadać.

## 2. Pytania

Według zasad z kontraktu. W praktyce:

- **Zacznij od doprecyzowania.** Pierwsze pytania: co dokładnie jest myślą i skąd się wzięła („Co sprawiło, że ta myśl się pojawiła?”). Formy neutralne płciowo — bez „pomyślałeś”, „chciałaś”. Potem po kolei to, co odpowiedzi odsłaniają: założenia, dowody, perspektywy, konsekwencje.
- **Słuchaj, czego brakuje.** Ogólnik („lepiej”, „wszyscy”, „zawsze”) → doprecyzowanie z przykładem. „Musimy” → założenie. „Użytkownicy chcą” → dowód. Rozwiązanie zamiast problemu → „Jaki problem to rozwiązuje? Co się dzieje dziś bez tego?”.
- **Jedno pytanie naraz**, krótkie, otwarte, tekstem. Bez listy pytań do wyboru, bez sugerowania odpowiedzi w treści pytania.
- **Sprzeczność** nazywaj od razu i neutralnie. Rozstrzyga ją użytkownik — albo zostaje zapisana jako otwarta.
- **Brak faktu** (jak działa biblioteka, ile coś kosztuje, czy ktoś tego używa) → nie zgadujesz i nie pytasz o to w kółko; zapisz w „Czego nie wiemy” z typem `[badanie]` albo `[prototyp]` i pytaj dalej o to, co da się przemyśleć bez tego faktu.
- **Prośba o zdanie** („a ty co myślisz?”) → możesz odpowiedzieć krótko, jako „zdanie agenta”, zapisane w osobnej sekcji. Potem wracasz do pytań — zwykle od: „Co w tym zdaniu się z Tobą zgadza, a co nie?”.

## 3. Zapis na bieżąco

Co 4–6 pytań — i zawsze przed końcem sesji — pokaż krótkie podsumowanie i po potwierdzeniu dopisz je do pliku:

- `## Do czego doszliśmy` — wnioski słowami użytkownika, bez zapisu rozmowy;
- `## Założenia` — ze stanem `sprawdzone | niesprawdzone | obalone`;
- `## Sprzeczności` — i jak je rozstrzygnięto;
- `## Czego nie wiemy` — z typem.

Pojęcie, które w trakcie się wyklarowało i dotyczy projektu → zaproponuj wpis w `SLOWNIK.md`. Fałszywe założenie o projekcie, które się ujawniło → lekcja według sekcji „Lekcje” w kontrakcie.

## 4. Zakończenie

Gdy wniosek jest jasny, pytania krążą albo użytkownik mówi „wystarczy” — zaproponuj zakończenie i zapytaj o wynik (tu wolno użyć pytania z wyborem; bez rekomendacji, chyba że użytkownik o nią poprosi):

- **dojrzałe** — dokąd trafia:
  - nowa zdolność → linia w `ROADMAP.md` (Dalej albo Mgła; Teraz tylko w limicie i za zgodą) i Następny krok `skill pomysl <slug>`; `## Problem` w przyszłej mapie wyprowadzasz z wniosku i dopisujesz `Źródło: przemyslenia/<plik>`;
  - twarda decyzja → `skill decyzja <temat>`;
  - pytanie o fakty → `skill badanie <pytanie>`;
  - zmiana celu produktu → propozycja zmiany `## Cel` (zmienia tylko człowiek);
  - reguła kodu → zasada przez `skill decyzja` albo za zgodą wprost w `ZASADY.md`;
  - coś na kiedyś → Mgła z 1–3 decyzjami do rozstrzygnięcia;
- **odrzucone** — powód w jednym zdaniu, słowami użytkownika;
- **odłożone** — warunek „Wróć, gdy”;
- **otwarte** — kontynuacja w kolejnej sesji: `skill przemysl <slug>`.

Wpisz `Status:` i `## Wniosek`. Podsumuj w 2–3 zdaniach. Zaproponuj commit `warsztat: przemyślenie <slug>` — zrób go po zgodzie.
