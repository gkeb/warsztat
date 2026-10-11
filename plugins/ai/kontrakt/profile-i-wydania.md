# Profile, wydania i pielęgnacja

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Profile — klasy aplikacji

Proces jest wspólny, ale decyzje zależą od tego, co budujesz: narzędzie CLI ma kody wyjścia i instalację, statyczny HTML — metadane, dostępność i publikację plików, strona generowana — źródło treści, renderowanie i hosting. Profil to **lista decyzji do podjęcia**, nie podręcznik: dzięki niemu pominięcie jest świadome, a nie przypadkowe. Wiedzę o konkretnym wyborze dostarcza rozmowa, skill `badanie` i wzorce.

- **Miejsce.** `profile/` w katalogu pluginu: `przekrojowe.md` (zawsze) i profil klasy (`cli.md`, `html.md`, `strona.md`, kolejne według potrzeb). Projekt wybiera profile w `warsztat.json` → `profile`; może mieć kilka (np. strona generowana z pomocniczym CLI).
- **Budowa profilu:** `Decyzje` (pozycje ze stałym numerem `P-xx`, `CLI-xx`, `HTML-xx`, `WEB-xx`), `Doświadczenie (UX)`, `Testy akceptacyjne` (czym jest publiczny interfejs i jakimi narzędziami go testować), `Niedowiezienia` (lista dla przeglądu i weryfikacji), `Wydanie`, `Pielęgnacja`.
- **Rozstrzygnięcie każdej pozycji** trafia do `.ai/profil.md` jako jedna linia: numer, nazwa, wynik. Wynik to link (`ADR NNNN`, `Zxx`, `spec szkieletu`), `pominięte: powód`, `później` (pozycja w Mgle) albo `otwarte`. Treść decyzji żyje tam, dokąd prowadzi link — `profil.md` jest tylko rejestrem.
- **„Pominięte” to decyzja.** Mały pomocnik CLI na własny użytek nie potrzebuje publikacji ani `--json`. Wystarczy jedno zdanie powodu, żeby nikt nie wracał do pytania.
- **Kto przechodzi listę:** `pomysl produkt` w pustym projekcie (pozycje fundamentowe od razu, reszta jako `później` albo `otwarte`), `poznaj` w zastanym (co już rozstrzygnął kod i konfiguracja — z linkiem do źródła). `gdzie tydzien` pokazuje pozycje `otwarte` i nowe pozycje profilu, których projekt jeszcze nie ma w rejestrze.
- **Kto korzysta:** `spec` (poziom testów akceptacyjnych, sekcja „Doświadczenie”), `buduj` (narzędzia testów akceptacyjnych), `przeglad` i `weryfikuj` (`Niedowiezienia`), `wydaj` (`Wydanie`), `gdzie tydzien` (`Pielęgnacja`).
- **Profil się uczy.** Decyzja, której zabrakło na liście, a wyszła w praktyce, trafia do profilu przez `retro` — nowa pozycja z kolejnym wolnym numerem, za zgodą użytkownika, na tych samych zasadach co wzorce. Numerów nie zmieniasz i nie używasz ponownie.

## Wydania i pielęgnacja

Zdolność `gotowe` znaczy: działa w kodzie. **Wydanie** to osobny krok: wersja, historia zmian, publikacja albo wdrożenie i sprawdzenie, że działa tam, gdzie trafiło. **Pielęgnacja** to cykliczne pilnowanie projektu, który już działa.

- **Wydanie prowadzi skill `wydaj`**, uruchamiany tylko przez człowieka — publikacja i wdrożenie są widoczne na zewnątrz i trudne do cofnięcia. Komendy i sprawdzenia bierze z `warsztat.json` → `wydanie` i z sekcji `Wydanie` profili.
- **`warsztat.json` → `wydanie`:** `wersjonowanie` (`semver` | `data` | `brak`, decyzja P-15), `changelog` (ścieżka, np. `CHANGELOG.md`, albo `null`, decyzja P-16), `githubRelease` (`true` — przy każdej wersji GitHub Release z treścią jej sekcji z historii zmian; jedno źródło, dwa miejsca), `komendy` (build, publikacja, wdrożenie — w kolejności), `sprawdzenie` (komendy po wydaniu: `narzedzie --version`, zapytanie o adres produkcyjny, Lighthouse).
- **Historia zmian jest prowadzona na bieżąco, nie przy wydaniu.** Projekt z `changelog` ma w nim sekcję `## Niewydane`. `zamknij` dopisuje tam zdolność, a `napraw` poprawkę — jedno zdanie z perspektywy użytkownika, w języku z P-02. `wydaj` zamienia „Niewydane” w sekcję wersji. Format: [Keep a Changelog](https://keepachangelog.com/) — grupy `Dodane`, `Zmienione`, `Naprawione`, `Usunięte`.
- **Rejestr wydań** `.ai/wydania.md` prowadzisz zawsze, także bez wersji i changeloga: data, wersja albo commit, dokąd, co zawiera, wynik sprawdzenia. Wdrożenie samej zmiany treści strony to też wpis. Dzięki temu wiadomo, co działa na produkcji.
- **Wycofanie.** Sprawdzenie po wydaniu nie przeszło → procedura wycofania z P-18, wpis w rejestrze z wynikiem, potem skill `napraw`. Wydanej wersji w rejestrze pakietów nie nadpisujesz — wydajesz poprawkę.
- **Pielęgnacja.** `warsztat.json` → `pielegnacja`: komendy tylko do odczytu, które `gdzie tydzien` uruchamia co tydzień (przestarzałe zależności, audyt, martwe linki, Lighthouse na produkcji). Razem z listą `Pielęgnacja` z profili dają przegląd stanu. Znalezisko staje się poprawką (`napraw`), zdolnością (np. aktualizacja wersji głównej frameworka jako `refaktor`) albo wpisem w Mgle — decyduje człowiek.
