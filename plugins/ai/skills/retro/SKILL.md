---
name: retro
description: Zamienia lekcje i powtarzające się problemy w trwałe mechanizmy — automatyczne kontrole, reguły w AGENTS.md, zmiany w samym warsztacie albo wzorce wspólne dla projektów — od najmocniejszego. Użyj po zamknięciu zdolności, w cotygodniowym przeglądzie, gdy lekcje.md urósł, ten sam błąd wraca albo użytkownik prosi o retro. Proponuje, a zmienia dopiero po zgodzie.
argument-hint: "[sesja]"
---

# Retro

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`. Pytania zadawaj zgodnie z sekcją `## Jak pytać`.

Lekcja w pliku to najsłabszy mechanizm: agent musi ją przeczytać i o niej pamiętać. Celem retro jest przesunięcie każdego powtarzalnego problemu jak najwyżej w hierarchii mechanizmów.

## 1. Materiał

Od ostatniego retro (linia `Ostatnie retro:` na górze `.ai/lekcje.md`, a jeśli jej nie ma — od początku):

- `.ai/lekcje.md` — najpierw lekcje z co najmniej dwoma wystąpieniami, potem te z dopiskiem `Wzorzec:`;
- `git log`: commity `fix:`, cofnięcia, poprawki tuż po ticketach;
- w mapach zdolności: `odstępstwo od specu`, zmiany specu, porzucone i podzielone tickety;
- blokujące uwagi z przeglądów, jeśli były zapisane;
- `.ai/proby.md`: powtarzające się ślepe uliczki w jednym obszarze to sygnał problemu w strukturze albo w wiedzy.

## Tryb `sesja` — rozbiór bieżącej sesji

Przejdź po sesji według tej listy i każde znalezisko zapisz **tam, gdzie jest jego miejsce** — nie w jednej notatce:

| Co się wydarzyło | Gdzie trafia |
| --- | --- |
| niejasne słowo, brakujące pojęcie, niespójne nazewnictwo | `SLOWNIK.md` |
| założenie okazało się fałszywe, a rozwiązanie jest znane (kto by tego nie wykrył) | `lekcje.md` — istniejąca lekcja dostaje nowe wystąpienie |
| luka w wiedzy, której nie rozwiązaliśmy | mapa → `[badanie]` albo `proby.md` → `nierozwiazane` |
| wybór A albo B | mapa → Decyzje albo ADR (skill `decyzja`) |
| brakujący kontekst: czego nie dało się wyczytać z kodu | `AGENTS.md` → `## Projekt` albo `.ai/obszary/` |
| luka: brakująca funkcja, konfiguracja, krok w planie | `ROADMAP.md` (Dalej) albo ticket |
| powtarzalny wzorzec w kodzie | `ZASADY.md` (nowa zasada albo doprecyzowanie) |
| powtarzalny wzorzec w prośbach użytkownika | `AGENTS.md` albo `lekcje.md` |
| preferencja użytkownika | `AGENTS.md` albo `lekcje.md` |
| krok usunięty jako zbędny, uproszczenie | spec → Poza zakresem albo mapa → Decyzje |
| pominięty albo pospieszny krok procesu | propozycja zmiany warsztatu (krok 3 niżej) |
| podejście, które nie zadziałało, odłożona ścieżka, problem bez rozwiązania | `proby.md` |

Rozwiązanie zapisujesz jako sprawdzone tylko wtedy, gdy potwierdził je użytkownik albo test. Jeśli próba została przerwana, zanim dało się ją ocenić, oznacz ją `odlozone`; jeśli problem nadal nie ma znanej przyczyny ani rozwiązania, oznacz go `nierozwiazane`. Podejście zweryfikowane jako nieskuteczne dostaje `nie-dziala` wraz z dowodem. Potem przechodzisz do kroków 2–5 dla wzorców, które się powtarzają.

## 2. Znajdź wzorce

Szukaj problemów, nie pojedynczych incydentów: ten sam typ błędu, ta sama poprawka użytkownika, to samo miejsce w procesie. Lekcja z co najmniej dwoma wystąpieniami jest wzorcem z definicji. Jednorazowy incydent zostaje lekcją.

Osobno oceń, czy problem jest **ogólny** — nie zależy od domeny projektu (zachowanie biblioteki, protokołu, usługi, narzędzia; rodzaj błędu; pułapka pracy z agentem). Taki problem może wystąpić w innym projekcie w innej postaci — to kandydat na wzorzec (krok 3, punkt 4), nawet przy jednym wystąpieniu.

## 3. Dobierz mechanizm — najmocniejszy możliwy

1. **Automatyczna kontrola** — test, reguła lint albo typów, skrypt w `walidacja` w `.ai/warsztat.json`, hook. Agent nie może jej zapomnieć. Wraca ten sam zły wzorzec w kodzie (np. `console.log` zamiast Sentry)? Najtańszy automat to wpis w `hooki.zakazane` (kontrakt, „Hooki kodu”) razem z zasadą w `ZASADY.md`.
2. **Zasada w `ZASADY.md`** (gdy dotyczy kodu) albo **reguła w `AGENTS.md`** (gdy dotyczy zachowania agenta lub projektu — poza blokiem warsztatu). Zasada twarda z `Egzekwowanie: przegląd` albo `brak`, łamana ponownie, wraca do punktu 1 — jako automat.
3. **Zmiana w warsztacie** — skill, kontrakt albo szablon. Wybierz ją, gdy problem leży w samym procesie i dotyczy wszystkich projektów. Edytuj pliki warsztatu tylko wtedy, gdy katalog pluginu jest repozytorium źródłowym, a nie kopią w cache pluginów. W przeciwnym razie podaj gotową zmianę: plik i tekst.
4. **Wzorzec w `wzorce/`** (katalog pluginu, sekcja „Wzorce” w kontrakcie) — dla problemu ogólnego. Łączy się z punktami 1–3: projekt dostaje mechanizm, inne projekty — wiedzę. Najpierw przeszukaj `wzorce/INDEKS.md`:
   - jest pasujący wzorzec → dopisz wystąpienie; przypadek różnił się → wariant albo zawężenie `Warunki` / `Nie dotyczy`; drugi niezależny projekt → status `potwierdzony`;
   - wzorzec nie pasował, choć wyglądał (lekcja z `Wzorzec:` i opisem różnicy) → doprecyzuj `Nie dotyczy`; kolejne chybienia → zaproponuj `wycofany`;
   - nie ma → nowy wzorzec z `../../szablony/wzorzec.md`, status `kandydat`. Uogólniaj: nazwij problem przez mechanizm, nie przez projekt; Sygnały opisz tak, jak widać je przed znaniem przyczyny; w `Nie dotyczy` wpisz przypadki, które wyglądają podobnie, a mają inną przyczynę. Bez kodu i danych projektu.
5. **Pozycja profilu w `profile/`** (katalog pluginu, sekcja „Profile” w kontrakcie) — gdy problem wynikał z decyzji, której nikt nie podjął, choć dotyczy całej klasy aplikacji (np. nikt nie zapytał o kodowanie konsoli Windows w CLI, o przekierowania po zmianie adresów strony). Nowa pozycja z kolejnym wolnym numerem w profilu klasy albo w `przekrojowe`; typowe niedowiezienie → sekcja `Niedowiezienia`; brakujący krok wydania albo kontrola cykliczna → `Wydanie` albo `Pielęgnacja`. Klasa aplikacji bez profilu, a w projekcie powtarzają się jej decyzje → zaproponuj nowy profil według budowy z kontraktu. Edycja i commit — jak przy wzorcach.
6. **Zostaje lekcją** — gdy nic wyżej nie pasuje.

## 4. Propozycje

Najwyżej 5, od najpoważniejszego (koszt powtórki × częstość). Każda: problem, dowód (commit, lekcja, mapa), mechanizm, konkretna zmiana. Wzorzec pokaż w całości przed zapisem — uogólnienie zatwierdza użytkownik. Zapytaj, które wdrożyć.

## 5. Wdrożenie

- Wprowadź wybrane zmiany. Nowa automatyczna kontrola musi przejść na obecnym kodzie — albo najpierw naprawiasz kod, albo pytasz.
- Nowa zasada w `.ai/ZASADY.md` dostaje kolejny wolny numer `Zxx` i link do ADR albo źródła (testu, kodu lub commita), które ją uzasadnia. Wycofanych numerów nie używaj ponownie.
- Lekcje, które stały się mechanizmem albo wystąpieniem wzorca, usuń z `lekcje.md`. Historię trzyma git. Powtarzające się lekcje połącz w jedną, sumując wystąpienia.
- Wzorce: plik wzorca i jego linia w `wzorce/INDEKS.md` (tytuł, status, hasła, sygnały). Profile: nowa pozycja w pliku profilu; w projekcie od razu jej rozstrzygnięcie w `.ai/profil.md`. Jedne i drugie edytujesz tylko wtedy, gdy katalog pluginu jest repozytorium źródłowym; w przeciwnym razie podaj gotowy tekst.
- Uporządkuj `proby.md`: wpisy dotyczące usuniętego kodu usuń; wpisy ze spełnionym warunkiem powrotu oznacz do ponownego sprawdzenia; zduplikowane połącz.
- Ustaw `Ostatnie retro: RRRR-MM-DD` na górze `lekcje.md`.
- Commit `warsztat: retro RRRR-MM-DD`. Zmiany w repozytorium warsztatu (skille, kontrakt, wzorce, profile) commitujesz osobno, w tamtym repo, po zgodzie — wzorce jako `wzorce: <opis>`, profile jako `profile: <opis>`.
