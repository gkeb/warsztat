# Mierzalny eksperyment

Czytaj tę procedurę, gdy pytanie `[prototyp]` wymaga sprawdzenia w praktyce (prowadzi je skill `prototyp`) albo zadanie wymaga porównania wariantów. Obowiązuje wspólny rdzeń `../KONTRAKT.md`; dodatkowo czytaj „Eksperymenty i prototypy” w `../kontrakt/praca.md`, `../kontrakt/bezpieczenstwo.md` i `../kontrakt/sprzatanie.md`, a przy zapisie wyniku „Jedno źródło prawdy” w `../kontrakt/stan.md`. Ścieżki względem tego pliku. Zwykłe TDD ani sprawdzenie jednej hipotezy naprawy nie wymagają osobnego eksperymentu.

## Ustal plan

Z istniejącego zadania i danych ustal poniższe; zapytaj tylko o brakujące decyzje. Przed rozpoczęciem uzyskaj akceptację planu, chyba że już ją masz. Plan i wyniki zapisuj w `.ai/eksperymenty/RRRR-MM-DD-slug.md` z `../szablony/eksperyment.md`.

- **Pytanie i cel:** co ma rozstrzygnąć wynik; dla optymalizacji metryka, kierunek, próg sukcesu i minimalna istotna poprawa. Dla prototypu może wystarczyć skończona lista zachowań do potwierdzenia.
- **Zakres:** dozwolone pliki lub parametry; poza zakresem wymagania, zależności i stan zewnętrzny. Prototyp oraz kandydat zmian skilli pracują w osobnym katalogu poza repo; modyfikowanie kodu produkcyjnego wymaga ticketu `w-toku` albo naprawy w ich zakresie. Nie cofaj cudzych zmian ani nie używaj resetu całego drzewa do odrzucenia wariantu.
- **Poprawność:** scenariusze i ograniczenia, których nie wolno pogorszyć. Metryka wydajności nie usprawiedliwia błędnych wyników; mniejsza liczba tokenów nie usprawiedliwia pominięcia wymaganej pracy.
- **Pomiar:** dane syntetyczne, wersje narzędzi, środowisko, komenda lub rubryka oceny. Zachowaj te same warunki między wariantami; przy szumie lub losowości ustal powtórzenia i sposób agregacji. Sprawdź, czy ocena mierzy deklarowaną cechę — obecność pola nie sprawdza jego długości ani unikalności.
- **Przypadki:** zestaw do porównań i oddzielny zestaw końcowy, niewykorzystywany do doboru wariantu. Uwzględnij przypadki graniczne. Nie dobieraj wariantów do wyniku zestawu końcowego; kolejna seria potrzebuje nowej niezależnej oceny.
- **Budżet:** skończona liczba iteracji, limit czasu, limit kosztu jeśli dostępny oraz liczba prób bez istotnej poprawy, po której kończysz. Brak statystyk kosztu zapisz; limit iteracji i czasu nadal obowiązuje. Rozszerzenie zakresu lub budżetu wymaga zgody.

Nie ma wiarygodnej oceny? Zapisz, czego brakuje. Subiektywnego wrażenia ani niedostępnego sprawdzenia nie raportuj jako pomiaru.

## Wykonaj ograniczoną pętlę

1. Sprawdź zapisany stan, zakres i pozostały budżet. Najpierw zmierz niezmieniony punkt odniesienia i jego poprawność; przy optymalizacji nowego rozwiązania zacznij od najprostszego poprawnego wariantu.
2. Sformułuj jedną hipotezę z przewidywaniem. Zmień jedną rzecz albo spójny zestaw wynikający z tej hipotezy. Zanotuj identyfikator wersji lub diff; oceniaj dokładnie ten wariant.
3. Uruchom ustaloną ocenę i kontrole poprawności. Pełne logi i robocze artefakty trzymaj poza repo, do wyniku wpisz metrykę, warunki i dowód. Brak wyniku lub przekroczenie limitu oznacza błąd albo wynik nierozstrzygnięty.
4. Zachowaj wariant tylko przy istotnej poprawie i spełnionej poprawności. Przy równoważnym wyniku preferuj prostsze rozwiązanie, jeżeli przewiduje to plan. Odrzucony wariant cofnij wyłącznie w swoim zakresie; zanotuj także niepowodzenia, nie tylko zwycięzców.
5. Kończ przy celu, limicie albo stagnacji. Gdy kolejne próby nie dają nowych dowodów, podsumuj niewiadomą i warunek powrotu, zamiast powtarzać tę samą ścieżkę. Poprawka oceniającego skryptu wymaga nowego punktu odniesienia; wcześniejszych wyników nie porównuj bez ponownego pomiaru.

## Oceń wynik i przekaż

Sprawdź wybrany wariant na zestawie końcowym; nie zakładaj, że najlepszy wynik z iteracji uogólnia się na inne dane. Przy ocenie przez model przekaż surowe wyniki, kryteria i minimum kontekstu potrzebnego do ich interpretacji, bez hipotezy autora i oczekiwanej odpowiedzi. Skorzystaj ze świeżego kontekstu, jeśli jest dostępny; podaj model i ograniczenia niezależności. Ocena modelu jest oceną według rubryki, nie obiektywnym pomiarem. Brak niezależnej oceny oznacz w wyniku.

W raporcie: odpowiedź, odniesienie i wynik końcowy, zakres obowiązywania, kontrole poprawności, wykorzystany budżet, wybrany wariant oraz odrzucone hipotezy. Status: `rozstrzygniety`, `nierozstrzygniety` albo `przerwany`. Prototyp może rozstrzygnąć pytanie odpowiedzią „nie”; brak poprawy nie dowodzi, że żadna poprawa nie jest możliwa.

Zapisz wersję źródeł, parametry i komendy wystarczające do odtworzenia pomiaru. Gdy wynikiem jest propozycja zmiany kodu lub instrukcji, przedstaw jej konkretny diff przed usunięciem roboczego wariantu. Wynik nie może opierać się wyłącznie na odnośniku do logu, który zostanie usunięty.

Nie przenoś kodu prototypu automatycznie do produkcji. Rozstrzygnięte pytanie z mapy → decyzja z linkiem do wyniku; nierozstrzygnięte zostaje otwarte z linkiem do wyniku i warunkiem powrotu; twardy wybór → `decyzja`; istotna ślepa uliczka → `proby.md`; fałszywe założenie ze znanym rozwiązaniem → `lekcje.md`. Te pliki linkują wynik, nie kopiują dziennika iteracji. Przerwanie → `przekaz` z pozostałym budżetem, wersją wariantu i miejscem artefaktów. Posprzątaj własne procesy i pliki robocze według kontraktu.

## Eksperyment nad warsztatem

`retro` może zaproponować porównanie obecnych instrukcji z kandydatem w izolowanej kopii. Ustal realistyczne zadania, oczekiwane zachowania i przypadki poza zestawem używanym do poprawiania kandydata. Oceniaj wykonane działania i artefakty, nie podobieństwo odpowiedzi do wzorcowego tekstu. Osobno raportuj wyniki Codexa i Claude Code z modelem, wersją hosta i konfiguracją; niesprawdzony host pozostaje niesprawdzony. Koszt i czas porównuj wraz z jakością i przestrzeganiem zakresu.

Eksperyment nie edytuje używanego pluginu ani jego cache. Wynikiem jest propozycja konkretnej zmiany z dowodami i ograniczeniami; wdrożenie przez `retro` po akceptacji użytkownika. Zgodę na zmianę instrukcji odróżniaj od zgody na uruchomienie kosztownej oceny lub działań zewnętrznych.
