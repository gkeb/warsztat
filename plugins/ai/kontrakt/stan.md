# Stan projektu

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Trzy poziomy — nigdy w jednym pliku

| Poziom | Pytanie | Gdzie |
| --- | --- | --- |
| Mapa | dokąd idzie projekt | `ROADMAP.md` |
| Decyzja | co jest prawdą o świecie | `SLOWNIK.md`, katalog decyzji, `spec.md`, `obszary/` |
| Krok | co robimy teraz | `tickety/`, `mapa.md` → Następny krok |

## Jedno źródło prawdy

| Informacja | Jedyne miejsce | Zmienia |
| --- | --- | --- |
| cel produktu | `ROADMAP.md` → `## Cel` | skill `pomysl produkt`; zmiana tylko za zgodą człowieka |
| status zdolności | `ROADMAP.md` | skille (przejścia niżej); kolejność i priorytety — tylko człowiek |
| rodzaj zdolności | `mapa.md` → linia `Rodzaj:` | skill `pomysl` |
| problem, który zdolność rozwiązuje | `mapa.md` → `## Problem` | skill `pomysl` |
| kto grillował, kto dał drugą opinię | `mapa.md` → linie `Grill:` i `Druga opinia:` | skill `pomysl` |
| status ticketu | frontmatter ticketu | skill `buduj`, `pokroj`, `zamknij` |
| następny krok zdolności | `mapa.md` → `## Następny krok` | każdy skill, który zmienia stan |
| stan przerwanej sesji | `mapa.md` → `## Stan sesji` | skill `przekaz`, `buduj` (czyści po zamknięciu ticketu) |
| definicje pojęć, konteksty i niezmienniki domeny | `SLOWNIK.md` | skill `pomysl`, `spec`, `poznaj`, `zamknij`; nowa albo zmieniona granica kontekstu — skill `decyzja` |
| scenariusze zachowania z numerami `Sx` (przy refaktorze niezmienniki `Nx`) | `spec.md` | skill `spec`; numery stałe po akceptacji |
| decyzje trudne do odwrócenia | katalog decyzji | skill `decyzja`; zastane — skill `poznaj` |
| jak uruchomić projekt, mapa kodu, pułapki | `AGENTS.md` → `## Projekt` | skill `start`, `poznaj` |
| zasady, których kod ma się trzymać (architektura, wzorce, kod, testy, niefunkcjonalne) | `ZASADY.md` | skille `decyzja`, `poznaj`, `pomysl produkt`, `retro`, `zamknij`; zmiana zasady tylko za zgodą człowieka |
| szczegóły obszaru kodu | `obszary/<slug>.md` | skill `poznaj` |
| zastana dokumentacja i rozjazdy z kodem | `zrodla.md` | skill `start`, `poznaj` |
| pliki z zamiarem użytkownika i stan ich rozbioru | `zrodla.md` → `## Zamiar` | skill `pomysl` |
| punkt odniesienia walidacji | `warsztat.json` → `odniesienie` | skill `start`; lista znanych błędów może tylko maleć |
| zachowanie zdolności | `spec.md` | skill `spec` (po akceptacji — tylko za zgodą człowieka) |
| wynik weryfikacji krzyżowej i jej uwagi | `zdolnosci/<slug>/weryfikacja.md` | skill `weryfikuj` |
| odbiór zdolności przez człowieka: lista i wynik | `zdolnosci/<slug>/odbior.md` | skill `zamknij` przygotowuje, człowiek przechodzi |
| kto zbudował ticket (narzędzie i model) | frontmatter ticketu → `budowal` | skill `buduj`, `napraw` |
| numer Issue ticketu na GitHubie | frontmatter ticketu → `github` | skill `pokroj`, `napraw` (tylko przy `tracker` = `github`) |
| sposób pracy z gitem: gałęzie, push, scalanie | `warsztat.json` → `git` | skill `start`; zmiana za zgodą człowieka |
| pliki z sekretami i komenda skanu sekretów | `warsztat.json` → `bezpieczenstwo` | skill `start`; zmiana za zgodą człowieka, lista może tylko rosnąć |
| pliki i katalogi bezpieczne do usunięcia po pracy | `warsztat.json` → `sprzatanie.smieci` | skill `start`, `buduj`, `gdzie` — dopisanie za zgodą człowieka |
| ustalenia ze źródeł | `badania/` | skill `badanie` |
| plan i wynik mierzalnego eksperymentu | `eksperymenty/` | agent prowadzący zatwierdzony eksperyment według `procedury/eksperyment.md` |
| myśli przed pomysłem: przebieg namysłu, wniosek, dokąd trafiły albo dlaczego odrzucone | `przemyslenia/` | skill `przemysl` |
| podejścia sprawdzone w praktyce, które nie zadziałały, odłożone albo nierozwiązane | `proby.md` | każdy skill, który na nie trafi; porządkuje `retro` |
| rozwiązane problemy: fałszywe założenie i jak robimy teraz | `lekcje.md` | każdy skill, który na nie trafi; porządkuje `retro` |
| uogólnione problemy i rozwiązania, wspólne dla projektów | `wzorce/` w katalogu pluginu | tylko skill `retro`, za zgodą człowieka |
| profile klas aplikacji projektu | `warsztat.json` → `profile` | skill `start`, `pomysl produkt`; zmiana za zgodą człowieka |
| rozstrzygnięcie każdej pozycji profilu | `profil.md` (wynik i link; treść w ADR, zasadzie albo specu) | skill `pomysl produkt`, `poznaj`, `decyzja`, `gdzie tydzien` |
| listy decyzji dla klas aplikacji | `profile/` w katalogu pluginu | tylko skill `retro`, za zgodą człowieka |
| co i kiedy wydano albo wdrożono | `wydania.md` | skill `wydaj` |
| historia zmian dla użytkowników | `CHANGELOG.md` (gdy `wydanie.changelog`) | sekcję „Niewydane” — `zamknij`, `napraw`; wersje — `wydaj` |
| przerwana praca poza zdolnością | `sesje/` | skill `przekaz`; plik usuwa ten, kto kończy pracę |

Nie kopiuj tych informacji w inne miejsca — linkuj. Jeśli dwa pliki mówią co innego, wygrywa plik z tej tabeli, a rozjazd naprawiasz.

## Statusy zdolności

`pomysl → grill → spec → plan → budowa → weryfikacja → gotowe | porzucone`

| Status | Znaczenie | Sekcja ROADMAP | Kto ustawia |
| --- | --- | --- | --- |
| `pomysl` | zapisany, jeszcze nieomówiony | Dalej albo Mgła | człowiek, skill `start`, skill `pomysl` |
| `grill` | trwa doprecyzowanie, nie ma zaakceptowanego specu | Teraz | skill `pomysl` |
| `spec` | spec zaakceptowany przez człowieka | Teraz | skill `spec` — wyłącznie po jawnej akceptacji |
| `plan` | pokrojona na tickety | Teraz | skill `pokroj` |
| `budowa` | co najmniej jeden ticket ruszony | Teraz | skill `buduj`; powrót z `weryfikacja` — skill `weryfikuj`, gdy runda nie przeszła |
| `weryfikacja` | wszystkie tickety zrobione; czeka na weryfikację krzyżową albo ją przeszła | Teraz | skill `buduj` po ostatnim tickecie |
| `gotowe` | weryfikacja przeszła, spec zgodny z rzeczywistością | Zrobione | skill `zamknij` |
| `porzucone` | świadomie odłożone na zawsze, z powodem | Porzucone | skill `zamknij porzuc` |

**Limity sekcji Teraz:** najwyżej 1 zdolność w `budowa` albo `weryfikacja` (to jedno miejsce — etap dowozimy do końca) i najwyżej 1 w `grill`/`spec`/`plan`. Trzecia rzecz nie wchodzi — najpierw coś zamknij albo odłóż do Dalej. Skill, który miałby złamać limit, zatrzymuje się i pyta.

## Statusy ticketu

`do-zrobienia | w-toku | zrobione | zablokowane | porzucony`

Ticket jest gotowy do wzięcia, gdy ma `do-zrobienia` i wszystkie numery z `blokowany-przez` mają `zrobione`. Następny ticket = najniższy numer spełniający ten warunek. Ticket podzielony na mniejsze dostaje `porzucony` i notatkę „podzielony na NN, NN”.
