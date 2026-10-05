---
name: napraw
description: Diagnozuje i naprawia bug albo regresję wydajności w zdyscyplinowanej pętli — odtworzenie (czerwony sygnał), zawężenie, hipoteza, instrumentacja, poprawka przyczyny, test regresji — i ustala, czy wystarczy commit fix, ticket w zdolności, czy trzeba wrócić do grilla. Użyj przy zgłoszeniu błędu, stack trace, regresji albo gdy coś nie działa lub działa wolniej.
argument-hint: "[objaw]"
---

# Naprawa

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie sekcję `## Poprawki (bugi)`. Wczytaj `.ai/lekcje.md` i `.ai/SLOWNIK.md`. Jeśli bug dotyczy konkretnej zdolności, wczytaj też jej `spec.md`. Opis objawu weź z wywołania skilla albo z bieżącej wiadomości.

Pytania zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie. Nie zmieniasz roadmapy ani specu.

## 1. Zrozum objaw

- Co się dzieje, a co powinno? Jakie kroki, dane, środowisko? Od kiedy? Sprawdź sam, co się da (logi, `git log`, kod), zamiast pytać.
- Zanim wybierzesz sposób odtworzenia lub diagnozy, przeszukaj `.ai/proby.md` po objawie, module i możliwych hipotezach. Trafienie przywołaj; respektuj jego status i warunek powrotu.
- Przeszukaj też `.ai/lekcje.md` i `../../wzorce/INDEKS.md` (względem tego pliku) po objawie — we wzorcach po `Sygnałach`. Trafienie to hipoteza do sprawdzenia w kroku 4, nie gotowa przyczyna: porównaj Warunki i „Nie dotyczy” z tym przypadkiem.
- **Bug czy zmiana?** Jeśli spec opisuje dokładnie to zachowanie, które widzi użytkownik, a on oczekuje innego, to nie jest bug, tylko zmiana specu. Zatrzymaj się i zaproponuj skill `pomysl` albo `spec`.

## 2. Najpierw czerwony sygnał

- Zbuduj najszybszy powtarzalny sygnał, który pokazuje bug. Najlepiej test automatyczny przez publiczny interfejs. Jeśli to niemożliwe: skrypt albo komenda. Sygnał ma być czerwony **z powodu tego buga**.
- Regresja wydajności: sygnałem jest pomiar z progiem (czas, liczba zapytań, pamięć). Najpierw zmierz punkt odniesienia.
- Nie umiesz odtworzyć? **Nie zgadujesz poprawki.** Zbierz dane (logi, instrumentacja) albo zapytaj o brakujące warunki. Przerwaną pracę zapisz skillem `przekaz`. Jeśli odkładamy problem bez rozwiązania — wpis `nierozwiazane` w `.ai/proby.md` z tym, co już wiadomo.

## 3. Zawęź

Zmniejszaj przypadek: mniej danych, mniej kroków, izolowany moduł. Jeśli w historii jest wersja, w której działało — `git bisect` z sygnałem z kroku 2.

## 4. Hipoteza → instrumentacja

- Wypisz 1–3 hipotezy, każdą z przewidywaniem: „jeśli przyczyną jest X, to Y pokaże Z”.
- Sprawdzaj od najtańszej: log, asercja, debugger. Jedna zmiana naraz.
- **Nie poprawiasz, dopóki nie umiesz wyjaśnić przyczyny.** Jeśli musisz poprawić sam objaw, powiedz to wprost i zapisz w raporcie.
- Instrumentację usuwasz przed commitem.
- Hipoteza obalona po większym wysiłku albo poprawka, która nie pomogła → wpis `nie-dziala` w `.ai/proby.md` od razu, z dowodem. Następna osoba zacznie od tego miejsca, nie od zera.

## 5. Ustal rozmiar

Według tabeli z kontraktu: mały → bez ticketu; w zdolności w `plan`/`budowa`/`weryfikacja` → nowy ticket tej zdolności z szablonu `../../szablony/ticket.md`, od razu `w-toku` (zdolność w `weryfikacja` wraca do `budowa`; w `budowal` wpisz siebie); duży → zatrzymaj się, zapisz ustalenia i zaproponuj skill `pomysl`. Jeśli rozmiar nie jest oczywisty, zapytaj.

## 6. Poprawka

- Minimalna zmiana u przyczyny. Sygnał z kroku 2 przechodzi na zielony i zostaje w repo jako test regresji, w stylu pozostałych testów.
- Uruchom całą walidację z `.ai/warsztat.json` (z uwzględnieniem `odniesienie.znane`; naprawiony znany błąd usuń z listy). Nie wyłączasz testów i nie osłabiasz typów.
- Poszukaj tego samego wzorca błędu w innych miejscach. Znaleziska zgłoś; poprawiasz je tylko za zgodą.

## 7. Przegląd

Przy zmianie większej niż kilka linii albo dotykającej logiki — skill `przeglad` dla bieżących zmian. Uwagi blokujące poprawiasz, pozostałe pokazujesz.

## 8. Zamknięcie

- Commit według rozmiaru: `fix: <opis>` albo `<slug>#<nr>: <tytuł>` (wtedy ticket → `zrobione`, a `mapa.md` wskazuje następny krok).
- Przyczyna przeczyła zastanej dokumentacji albo ADR → wpis w `.ai/zrodla.md` → `## Rozjazdy`.
- Bug był widoczny dla użytkownika, a projekt prowadzi historię zmian (`warsztat.json` → `wydanie.changelog`) → jedno zdanie w `## Niewydane` → `Naprawione`, z perspektywy użytkownika. Bug na produkcji → zaproponuj skill `wydaj` po commicie.
- Jeśli przyczyną było fałszywe założenie (w kodzie albo w diagnozie) → wpis w `.ai/lekcje.md` według sekcji „Lekcje” w kontrakcie; ta sama przyczyna co w istniejącej lekcji → nowe wystąpienie. Pomógł albo nie pasował wzorzec → dopisek `Wzorzec:`. Jeśli bug mogła wyłapać automatyczna kontrola (test, lint, typ) → zaproponuj skill `retro` albo od razu tę kontrolę, jeśli jest mała.
- Jeśli naprawa była zapisana w `.ai/sesje/`, usuń ten plik. Jeśli zamyka wpis `nierozwiazane` w `.ai/proby.md` — zamień go w lekcję (problem → przyczyna → rozwiązanie) i usuń z `proby.md`; podejścia, które po drodze okazały się błędne, zostają tam jako `nie-dziala`.
- Raport: przyczyna w 1–2 zdaniach, poprawka, test regresji, hash commita.
