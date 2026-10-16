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
