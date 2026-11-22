# Lekcje

> Rozwiązane problemy: założenie — agenta albo nasze — okazało się fałszywe, i jak robimy teraz. Zapisuj od razu, niezależnie od tego, kto wykrył błąd. Ta sama przyczyna → dopisz wystąpienie, nie nową linijkę. Problem bez rozwiązania idzie do `proby.md`. Zasady: „Lekcje — czego się nauczyliśmy” w `kontrakt/pamiec.md`; format wpisu: „Lekcja — wpis w `lekcje.md`” w `kontrakt/formaty.md` — oba w katalogu pluginu warsztatu.

Ostatnie retro: —

<!-- - [obszar | zdolność | projekt] problem — założyliśmy X, okazało się Y → teraz Z (link do śladu). Wzorzec: plik. Wystąpienia: RRRR-MM-DD kto-wykrył; RRRR-MM-DD kto-wykrył -->

- [model-zgloszen] Zapis raportu przez `String.replace` rozwinął sekwencję z dolarem i backtickiem w nazwie uchwytu konsoli i powielił wcześniejszy tekst. Przy wstawianiu dowolnego tekstu przekazujemy funkcję zwracającą tekst i po zapisie sprawdzamy liczbę nagłówków. Wystąpienia: 2026-11-22 Codex.
- [model-zgloszen] Próby hooków Codexa na Windows traciły czas na uruchomienie CLI i logowanie — założyliśmy, że środowisko CLI jest gotowe, a pierwsza próba z modelem poszła przed sprawdzeniem ścieżki, wersji, logowania w izolowanym profilu i widoczności przeglądu → te kroki robimy przed pierwszą sesją z modelem (fakty o środowisku: `AGENTS.md` → Pułapki), a przekazanie kontekstu i odczyt indeksu mierzymy osobno ([procedura](eksperymenty/2026-11-22-hook-pluginu-spolecznosci-codex.md#procedura-na-następny-eksperyment)). Wystąpienia: 2026-11-22 użytkownik
