# Zgłoszenia zmian warsztatu

> Kolejka zmian w samym warsztacie (skille, kontrakt, szablony, hooki, skrypty), które wyszły z pracy w projektach. Wzorce i profile mają własne katalogi w `plugins/ai/` — tu trafia to, co zmienia proces. Zasady: „Zgłoszenia warsztatu — zmiany procesu” w `plugins/ai/kontrakt/pamiec.md`. Jedno zgłoszenie = jeden problem; ten sam problem z innego projektu → dopisz wystąpienie, nie nowy wpis. Pisze i wdraża skill `retro`; wdrożone i odrzucone usuwa — historię trzyma git.

Statusy: `nowe` (zapisane, nieocenione) · `przyjete` (wiadomo, co zmienić, czeka na wdrożenie) · `do-dyskusji` (wymaga decyzji, jak).

<!--
## Z<nr> — tytuł problemu
- Status: nowe | przyjete | do-dyskusji
- Wystąpienia: RRRR-MM-DD projekt (ślad: lekcja, commit, mapa); …
- Problem: co poszło nie tak w procesie, niezależnie od projektu.
- Propozycja: plik w plugins/ai i konkretna zmiana.
-->

## Z05 — Profil CLI nie pyta o pierwsze uruchomienie w domyślnej konfiguracji

- Status: nowe
- Wystąpienia: 2026-10-04 kombus (lekcja `[weryfikacja]`; `weryfikuj` i szablon odbioru dostały tę kontrolę w 0.19.0)
- Problem: domyślne ścieżki danych CLI (katalog projektu, katalog domowy, uprawnienia, blokady plików w Windows) to decyzja klasy aplikacji, a nie tylko kontrola przy weryfikacji.
- Propozycja: rozważyć pozycję w `plugins/ai/profile/cli.md` (domyślne położenie danych i zachowanie przy braku uprawnień), jeśli problem wróci w innym projekcie CLI.

## Z07 — Czy Haiku wystarczy do recenzji

- Status: do-dyskusji
- Wystąpienia: 2026-11-19 (przy wdrożeniu Z06, warsztat 0.20.0)
- Problem: poziom `recenzja` w Claude to `sonnet`. W testach Bito Haiku 5.5 (67.4%, $0.69 za sesję) nie ustępuje Sonnetowi 5.5 (65.7%, $1.28), ale bez osobnych wyników recenzji kodu ([Bito](https://bito.ai/blog/gpt-6-2-sol-astra-vs-claude-opus-fable-gpt-6-1-sol/), 2026-11-18, 4 przebiegi, sprzedawca narzędzi).
- Propozycja: eksperyment według `procedury/eksperyment.md` („Eksperyment nad warsztatem”) — ten sam diff z prawdziwego projektu przez `przeglad` na Haiku i na Sonnecie, porównanie potwierdzonych uwag i kosztu. Wynik zmienia domyślne `modele.claude.recenzja` i `model` w definicjach recenzentów.

## Z08 — Numery scenariuszy kolidują między zdolnościami w jednym pliku testów

- Status: do-dyskusji
- Wystąpienia: 2026-11-19 tenta (weryfikacja `rejestr-projektow` R1.5: `grep S20` w jednym pliku testów zwraca scenariusz szkieletu i scenariusz rejestru)
- Problem: „Ślad w nazwie” (`kontrakt/praca.md`, „Test — podwójna pętla”) zakłada, że `grep Sx` znajduje test scenariusza. Numery są unikalne tylko w specu jednej zdolności, więc gdy kolejne zdolności dopisują testy akceptacyjne do tego samego pliku, ślad wskazuje kilka różnych scenariuszy, a `weryfikuj` musi rozróżniać je ręcznie.
- Propozycja: rozstrzygnąć konwencję w `kontrakt/praca.md` → „Ślad w nazwie” i w `skills/weryfikuj/SKILL.md` (wyszukiwanie po numerze): (a) prefiks slugu zdolności w nazwie testu (`it("rejestr-projektow S3: …")`, `grep "rejestr-projektow S3"`), albo (b) osobny plik testów akceptacyjnych na zdolność. Istniejących testów nie przemianowywać hurtem — jak przy starszych specach, przy najbliższej zmianie.
