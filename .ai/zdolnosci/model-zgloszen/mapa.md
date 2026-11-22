# Model zgłoszeń — mapa

Rodzaj: funkcja
Grill: Claude Code / claude-opus-5-5
Druga opinia: —
Spec: [spec.md](spec.md) — _powstanie po grillu_

## Problem

Retro zakłada dziś, że użytkownik ma zapis w repozytorium warsztatu i sam wdraża zgłoszenia z `ZGLOSZENIA.md`. Po publikacji warsztatu wielu użytkowników będzie natrafiać na problemy procesu, a ich poprawki — wysyłane bez wspólnego kanału i filtra — rozmyją rdzeń narzędzia i mogą wynieść dane z cudzych projektów.

## Następny krok

skill prototyp model-zgloszen — hook pluginu społeczności w Codexie i Claude Code; równolegle skill decyzja — ADR granicy rdzeń / katalog społeczności

## Otwarte pytania

- [ ] [prototyp] Czy hook SessionStart pluginu społeczności niezawodnie podaje ścieżkę swojego indeksu w Codexie (zaufanie hooków, ponowny przegląd po zmianie skryptu, `PLUGIN_ROOT`) i w Claude Code po aktualizacji wersji — blokuje spec — badanie: [wynik](../../badania/2026-11-22-odczyt-plikow-innego-pluginu.md)

## Decyzje

2026-11-22 — Rdzeń (skille, kontrakt, szablony) przyjmuje od innych tylko Issues z opisem problemu, zmiany wdraża opiekun; rozszerzenia (profile klas aplikacji, wzorce) przyjmują też PR-y — jeden opiekun utrzyma spójność procesu, a wiedza o obcych stosach przyjdzie od ludzi
2026-11-22 — Profile i wzorce od innych trafiają do osobnego katalogu społeczności (osobne repo albo plugin), który użytkownik włącza świadomie; do rdzenia opiekun przenosi tylko sprawdzone — rdzeń zostaje czysty niezależnie od liczby wkładów; koszt: drugie miejsce do utrzymania (kandydat na ADR: granica modułu)
2026-11-22 — Retro u użytkownika pokazuje oczyszczoną treść zgłoszenia problemu procesu i po jego zgodzie zakłada Issue w repozytorium warsztatu przez `gh issue create` z konta użytkownika — wygoda daje więcej sygnałów; ryzyko pochopnego „tak” ogranicza filtr prywatności (otwarte pytanie)
2026-11-22 — Bramka lokalna: retro proponuje wysłanie Issue dopiero, gdy lekcja `[warsztat]` ma co najmniej 3 wystąpienia w projekcie; problem bezpieczeństwa (wyciek sekretu, ominięta kontrola) albo utraty danych wychodzi od pierwszego wystąpienia — mniej szumu i silniejszy sygnał, kosztem tego, że rzadkie skille mogą nie dobić progu. Przykłady: 2 wystąpienia zgrzytu w `spec` → zostaje lekcją; 3 → propozycja Issue; 1 wystąpienie, gdy `buduj` zacommitował `.env` → propozycja Issue od razu
2026-11-22 — Deduplikacja i ślad: przed wysłaniem retro szuka podobnego Issue (`gh issue list --search`) i przy trafieniu dopisuje wystąpienie komentarzem; wysłana lekcja zostaje w `lekcje.md` z dopiskiem `Zgłoszenie: <link>`, a kolejne wystąpienia idą jako komentarze do tego Issue — bez śladu licznik startowałby od zera i powstawałyby duplikaty, bez wyszukiwania każda osoba zakładałaby własne Issue; zmienia dzisiejszą regułę, że retro usuwa lekcję przeniesioną do zgłoszenia
2026-11-22 — Filtr prywatności: treść Issue to sztywny szablon pól — wersja warsztatu, agent i model, skill i krok (plik w `plugins/ai`), objaw opisany słowami warsztatu, liczba wystąpień i daty, proponowany kierunek; bez kodu, ścieżek, nazw i pojęć projektu. Retro sprawdza każde pole osobno (m.in. brak słów z `SLOWNIK.md` projektu i ścieżek z `git ls-files`) i skanuje szkic gitleaksem, zanim pokaże go użytkownikowi — repo warsztatu jest publiczne, a zgoda w rozpędzie chroni słabo; brakujący kontekst opiekun dopytuje w komentarzu, a użytkownik decyduje, co dopowie
2026-11-22 — Bez `gh` albo bez logowania retro daje dwa linki: wyszukiwanie podobnych Issues (duplikaty sprawdza człowiek) i formularz nowego Issue z treścią z szablonu (`…/issues/new?title=…&body=…`); bez konta GitHub zgłoszenie zostaje lokalną lekcją z dopiskiem `niewysłane` — najwięcej sygnałów przy małym nakładzie [do sprawdzenia w specu: limit długości URL formularza]
2026-11-22 — Jedno źródło zgłoszeń: także zgłoszenia opiekuna żyją w Issues repozytorium warsztatu; `ZGLOSZENIA.md` znika, a otwarte wpisy (dziś Z05–Z13) przechodzą do Issues przy wdrożeniu tej zdolności. Zgłoszenia opiekuna omijają bramkę 3 wystąpień — kontrakt wymaga jednego źródła prawdy, a dwa źródła wymagałyby sklejania duplikatów; koszt: praca nad warsztatem zależy od GitHuba
2026-11-22 — Próg globalny to sygnał, nie bramka: retro w repozytorium warsztatu pokazuje najpierw Issues z wystąpieniami od co najmniej 2 różnych osób, potem resztę; opiekun może wdrożyć każde — priorytety ustala człowiek, a trafne pojedyncze zgłoszenie nie czeka sztucznie
2026-11-22 — Cykl życia w Issues: etykieta `zgloszenie` (odróżnia zgłoszenie procesu od zwykłego buga) i etykiety statusów `nowe` / `przyjete` / `do-dyskusji`; wystąpienia to treść Issue i komentarze „Wystąpienie” z szablonu, różne osoby liczone po autorach; wdrożone zamyka commit z `Closes #<nr>`, odrzucone — zamknięcie „not planned” z powodem w komentarzu — przeniesienie 1:1 dzisiejszego `ZGLOSZENIA.md`
2026-11-22 — Zabezpieczenia katalogu społeczności: format w CI (wymagane sekcje wzorca i pozycji profilu), wejście jako `kandydat` (`potwierdzony` po drugim niezależnym projekcie), CODEOWNERS i ruleset z wymaganą akceptacją opiekuna, przegląd agentem (duplikaty, sprzeczności z kontraktem, dane projektu) i budżet długości `INDEKS.md` i profilu — każde łapie inny rodzaj szumu; zła pozycja szkodzi każdemu, kto włączył katalog [wartości budżetu do ustalenia w specu]
2026-11-22 — Awans do rdzenia: warunek konieczny `potwierdzony`, decyduje ocena opiekuna, czy pozycja dotyczy większości użytkowników; plik przechodzi do rdzenia, w katalogu społeczności zostaje tylko wpis indeksu „przeniesiony do rdzenia” bez treści — jedno źródło, autor widzi efekt, kandydat zostaje wskazówką, nie regułą
2026-11-22 — Katalog społeczności to osobny plugin z własnym hookiem SessionStart, który wypisuje ścieżkę swojego indeksu wzorców i profili; skille warsztatu przeszukują wszystkie indeksy podane przez hooki, bez szukania cudzego pluginu w cache — instalacja i aktualizacja z marketplace jak sam warsztat; bezpośredni odczyt innego pluginu jest nieudokumentowany i zmienia ścieżkę z wersją (badanie: [wynik](../../badania/2026-11-22-odczyt-plikow-innego-pluginu.md)); odrzucony klon w znanym katalogu — aktualizacja spadałaby na użytkownika

## Plasterki

## Stan sesji
