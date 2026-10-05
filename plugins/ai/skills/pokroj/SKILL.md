---
name: pokroj
description: Dzieli zaakceptowany spec na pionowe tickety mieszczące się w jednej sesji albo dzieli zbyt duży ticket. Uruchamiaj jawnie po akceptacji specu.
disable-model-invocation: true
argument-hint: "[slug | slug#NN]"
---

# Krojenie na tickety

Otwórz `../../KONTRAKT.md` i szablon `../../szablony/ticket.md` względem tego pliku `SKILL.md`. Użyj slugu lub identyfikatora ticketu podanego przy wywołaniu skilla albo w bieżącej wiadomości.

Pytania o zgodę na podział i kolejność zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie.

## 1. Wybierz zdolność

Podany slug → ta zdolność. Bez slugu → zdolność z Teraz w statusie `spec`. Zdolność w `grill` → zatrzymaj się i zaproponuj skill `spec`. Bez zaakceptowanego specu nie kroisz.

Wczytaj `spec.md`, `mapa.md` i kod w obszarach, których zdolność dotyka.

## 2. Zasady krojenia

- **Pionowo, nie warstwami.** Każdy ticket przecina wszystkie potrzebne warstwy i kończy się czymś widocznym: w UI, w CLI, w odpowiedzi API albo w teście przez publiczny interfejs. Nie „najpierw baza, potem API, potem UI”.
- **Pierwszy ticket to najcieńsza ścieżka od początku do końca** — przechodzi przez cały system, nawet jeśli robi mało. Pierwszy ticket w projekcie bez testów stawia też infrastrukturę testów.
- **Jedna sesja.** Diff da się przejrzeć w kilka minut. Ticket, którego opis wymaga „oraz… oraz…”, dzielisz.
- **Scenariusze w tickecie.** Pole `scenariusze` wskazuje numery scenariuszy specu, które ten ticket dowozi albo posuwa. Każdy scenariusz trafia do co najmniej jednego ticketu. Gdy scenariusz jest rozłożony na kilka ticketów (np. szczęśliwa ścieżka, potem błędy), w Notatkach napisz, który ticket go kończy — tam test akceptacyjny ma przejść.
- **Kryteria akceptacji** sprawdzalne, w języku słownika: najpierw „Sx: test akceptacyjny przechodzi” dla scenariuszy kończonych w tym tickecie, potem kryteria specyficzne dla plastra.
- **Zależności jawnie** w `blokowany-przez`. Tam, gdzie się da, tickety niezależne.
- Zwykle wychodzi 3–8 ticketów. Więcej niż ~10 → zdolność jest za duża; zaproponuj podział na dwie.

**Refaktor** (linia `Rodzaj:` w mapie) — inne zasady cięcia:

- Ticket to **krok, po którym wszystko działa i da się wdrożyć** — nie musi mieć widocznego efektu. W „Co widać po zrobieniu” opisz, co jest prawdą o strukturze po kroku.
- **Pierwszy ticket: siatka bezpieczeństwa** — testy charakteryzujące wszystkie niezmienniki, których dziś nic nie chroni. Bez niej nie ma refaktoryzacji.
- Kroki wynikają ze strategii ze specu: np. nowa granica obok starej → przepinanie wywołań po kolei → usunięcie starego kodu (ostatni ticket).
- Kryteria akceptacji każdego ticketu: niezmienniki zielone + konkretna zmiana struktury. Pole `scenariusze` wskazuje niezmienniki (`Nx`), których dotyka krok; pierwszy ticket — wszystkie, których dziś nic nie chroni.

**Wygląd** — plasterek to jedna strona, sekcja albo przepływ, które człowiek obejrzy w całości. Kryteria: scenariusze przepływów z testem, kontrole automatyczne z profilu (dostępność, linki, budżet) zielone, „Akceptacja wyglądu” wpisana w tickecie. Jeśli projekt nie ma jeszcze tych kontroli ani sposobu robienia zrzutów, pierwszy ticket je stawia.

**Szkielet** — pierwszy ticket to stos + jedna ścieżka + infrastruktura testów (także testów akceptacyjnych z profilu: np. Playwright dla strony, uruchamianie polecenia dla CLI) + walidacja w `.ai/warsztat.json`, w tym automaty dla twardych zasad z `.ai/ZASADY.md` (np. kontrola kierunku zależności) i aktualizacja ich pola `Egzekwowanie`. Kolejne (lint, CI) tylko jeśli spec ich wymaga.

## 3. Uzgodnij przed zapisaniem

Pokaż listę: numer, tytuł, scenariusze, co widać po zrobieniu, zależności. Pod nią — pokrycie: każdy scenariusz specu i ticket, który go kończy; scenariusz bez ticketu to błąd krojenia. Zapytaj zgodnie z sekcją `## Jak pytać` w kontrakcie, czy kolejność i cięcie pasują. Jeśli lista pokrywa spec i tickety mieszczą się w jednej sesji, rekomenduj „Tak” jako pierwszą opcję. Popraw według uwag.

## 4. Zapisz

- `tickety/NN-slug.md` z szablonu, status `do-zrobienia`.
- `mapa.md` → `## Plasterki`: lista linków w kolejności, z zależnościami, bez statusów.
- `mapa.md` → `## Następny krok`: `skill buduj <slug>` → ticket 01.
- `ROADMAP.md`: status `plan`.

## Tryb podziału (`slug#NN`)

Ticket okazał się za duży:

- nowe tickety dostają kolejne wolne numery, nie „03a”;
- stary ticket dostaje `porzucony` i notatkę „podzielony na NN, NN”;
- przepnij `blokowany-przez` w ticketach, które zależały od starego;
- zaktualizuj Plasterki i Następny krok. Status zdolności zostaje bez zmian.
