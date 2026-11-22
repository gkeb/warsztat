# Profil: aplikacja

> Aplikacja z serwerem i interfejsem w przeglądarce — lokalna (serwer na komputerze użytkownika, zwykle jeden użytkownik, np. panel do zarządzania projektami i procesami) albo hostowana (wielu użytkowników, konta). Serwer ma API, dane trwałe i często procesy w tle. Używaj razem z profilem `przekrojowe`; gdy aplikację uruchamia się poleceniem, dochodzi profil `cli`. Strona z treścią bez kont i stanu ma profil `strona` albo `html`. Format: „Profile — klasy aplikacji” w `kontrakt/profile-i-wydania.md` w katalogu pluginu warsztatu.
> Aplikacja lokalna nie znaczy bezpieczna: przeglądarka, w której otwierasz obce strony, może wysyłać żądania do serwera na `localhost`. Uwierzytelnienie klienta (APP-06) dotyczy obu odmian.

## Decyzje

### Architektura

- **APP-01 Odmiana i miejsce działania** — lokalna (serwer na komputerze użytkownika), hostowana (serwer w sieci, wielu użytkowników) albo opakowana jako aplikacja okienkowa (Electron, Tauri). Od tej decyzji zależy większość pozostałych pozycji — rozstrzygnij ją pierwszą.
- **APP-02 Podział klient–serwer** — jeden proces serwuje zbudowany interfejs i API, czy interfejs i serwer działają osobno; aplikacja jednostronicowa (SPA) z API, renderowanie na serwerze czy HTML z serwera z małą interaktywnością (np. HTMX). Układ repozytorium (jeden pakiet, monorepo z `client` / `server` / `shared`) → P-04.
- **APP-03 Stos** — serwer (TypeScript: Hono, Fastify, Express; Python: FastAPI, Litestar) i interfejs (React, Svelte, Solid z Vite albo bez frameworka). Trudne do odwrócenia → ADR.
- **APP-04 Protokół i kontrakt API** — REST z JSON, RPC (tRPC, oRPC) albo GraphQL. Gdzie leży schemat (zod, Pydantic, OpenAPI) i czy klient ma typy wygenerowane z serwera albo współdzielone, a nie przepisane ręcznie. Kody błędów i kształt odpowiedzi z błędem — jeden dla całego API.
- **APP-05 Adres, port i dostęp** — lokalna: nasłuch tylko na `127.0.0.1`, nie na `0.0.0.0`; port stały czy wybierany; co, gdy port jest zajęty; jak użytkownik trafia do interfejsu (adres w konsoli, otwarcie przeglądarki). Hostowana: domena, HTTPS, reverse proxy, nagłówki bezpieczeństwa (CSP, HSTS).

### Bezpieczeństwo

- **APP-06 Uwierzytelnienie klienta** — hostowana: konta, sesje w ciasteczkach (`HttpOnly`, `Secure`, `SameSite`) albo tokeny, logowanie zewnętrzne (OAuth), reset hasła, wylogowanie na wszystkich urządzeniach. Lokalna: `localhost` nie jest granicą zaufania — obca strona otwarta w tej samej przeglądarce może wysłać żądanie do lokalnego serwera (CSRF, DNS rebinding). Minimum: losowy token przy starcie (w adresie otwieranym przez serwer albo w ciasteczku), sprawdzanie nagłówków `Host` i `Origin`, zamknięty CORS. Trudne do odwrócenia → ADR.
- **APP-07 Uprawnienia** — hostowana: role i co każda może; sprawdzanie na serwerze przy każdym żądaniu, nie tylko ukrywanie przycisków. Lokalna: co serwer może zrobić na komputerze (czytać i pisać pliki, uruchamiać procesy) — najmniejszy potrzebny zakres; ścieżki z żądania sprawdzane względem dozwolonych katalogów.

### Dane i procesy

- **APP-08 Baza i migracje** — rozwija P-22. Silnik (SQLite dla lokalnej, Postgres albo SQLite dla hostowanej), warstwa dostępu (Drizzle, Kysely, Prisma; SQLAlchemy, SQLModel), migracje: przy starcie serwera czy osobnym poleceniem; kopia bazy przed migracją. Lokalna: położenie pliku bazy w katalogu danych użytkownika (`platformdirs` w Pythonie, `env-paths` w Node), nie względem katalogu roboczego. SQLite: tryb WAL i jeden proces piszący.
- **APP-09 Procesy w tle** — długie zadania i procesy potomne (agenci, kompilacje, synchronizacje): kto je uruchamia, kolejka, limit równoległości, przerwanie przez użytkownika, limit czasu, gdzie trafia ich wyjście. Stan zadania w bazie, żeby przetrwał restart. Na Windows zatrzymanie całego drzewa procesów (`taskkill /T`), nie tylko procesu głównego.
- **APP-10 Cykl życia serwera** — start, zatrzymanie (Ctrl+C, zamknięcie terminala, wylogowanie), łagodne zamknięcie (dokończ żądania, zatrzymaj albo odłącz procesy potomne, zamknij bazę). Po restarcie: co z zadaniami w stanie „w toku” (wznowić, oznaczyć jako przerwane, posprzątać sieroty). Jedna instancja — blokada i wykrycie już działającego serwera. Autostart — tak czy nie.
- **APP-11 Zdarzenia na żywo** — jak interfejs dowiaduje się o zmianach: odpytywanie, SSE albo WebSocket. Ponowne połączenie i nadrobienie zdarzeń z przerwy (identyfikator ostatniego zdarzenia albo ponowny odczyt pełnego stanu).
- **APP-12 Stan w interfejsie** — źródło prawdy na serwerze; pamięć podręczna klienta (np. TanStack Query) i kiedy ją unieważniać; aktualizacje optymistyczne — tak czy nie; co, gdy ta sama rzecz jest otwarta w dwóch kartach.

### Dystrybucja

- **APP-13 Instalacja i uruchomienie** — rozwija P-17. Lokalna: jak użytkownik instaluje i uruchamia (polecenie startujące serwer — wtedy profil `cli`; `npx`, `uv tool`, pojedyncza binarka); zbudowany interfejs w paczce, nie budowany u użytkownika. Hostowana: kontener albo platforma, środowiska (podgląd, produkcja), zmienne środowiskowe.
- **APP-14 Zgodność wersji** — klient z pamięci przeglądarki rozmawia z nowszym serwerem (wersja w odpowiedzi, odświeżenie po wdrożeniu); baza zmigrowana przez nowszą wersję a powrót do starszej — co wtedy.

## Doświadczenie (UX)

- **APP-20 Stany połączenia** — serwer nie działa, łączenie, rozłączono, ponowne łączenie, sesja wygasła. Widoczny wskaźnik zamiast cichego zawieszenia; co dzieje się z niezapisanymi zmianami.
- **APP-21 Stany danych i operacji** — ładowanie, pusto, błąd, dane częściowe; długie operacje z postępem, możliwością przerwania i wynikiem widocznym po powrocie do widoku.
- **APP-22 Pierwsze uruchomienie** — co widzi użytkownik przy pustej bazie i bez konfiguracji: pusty stan z pierwszym krokiem, nie pusta tabela.
- **APP-23 Błędy z serwera** — komunikat: co się stało, dlaczego, co zrobić. Bez śladu stosu w interfejsie; identyfikator błędu, po którym znajdziesz wpis w logu (P-11, P-12).
- **APP-24 Adresy widoków** — każdy widok ma własny adres: odświeżenie, zakładka i „wstecz” działają; serwer zwraca interfejs dla adresów SPA zamiast 404.
- **APP-25 Klawiatura i dostępność** — cel WCAG 2.2 AA (P-14); skróty klawiszowe dla częstych czynności w narzędziu codziennego użytku; widoczny focus.
- **APP-26 Szerokości ekranu** — tylko komputer czy także telefon; szerokości kontrolne, na których sprawdzamy każdą zmianę.

## Testy akceptacyjne

Publiczny interfejs to interfejs w przeglądarce i API serwera. Testy uruchamiają prawdziwy serwer na zbudowanym kodzie, z pustym katalogiem danych w katalogu tymczasowym i na wolnym porcie — nie na serwerze deweloperskim z proxy. Serwer uruchamia Playwright przez `webServer` w `playwright.config` i zamyka go po testach. `test-results/` i `playwright-report/` są na liście `sprzatanie.smieci`.

- **Przepływy** — Playwright: scenariusz przechodzi zadanie użytkownika w interfejsie i sprawdza skutek (widok po odświeżeniu, stan w API).
- **API** — żądania HTTP do działającego serwera (`fetch` z `vitest`, `httpx` z `pytest`): kody odpowiedzi, kształt błędów, odmowa bez uwierzytelnienia i przy złym `Origin`.
- **Procesy w tle** — prawdziwy menedżer procesów z podstawionym programem potomnym (mały skrypt, który pisze na wyjście, kończy się błędem albo wisi). Test zatrzymuje serwer w trakcie zadania, uruchamia go ponownie i sprawdza stan zadania oraz brak osieroconych procesów.
- **Połączenie** — zatrzymanie serwera albo `context.setOffline(true)` w Playwright: interfejs pokazuje rozłączenie, po powrocie łączy się i nadrabia zmiany.
- **Migracje** — migracja kopii bazy z poprzedniej wersji (plik testowy w repo, dane syntetyczne), nie tylko pustej.
- **Dostępność** — `@axe-core/playwright` na kluczowych widokach; zero naruszeń poważnych i krytycznych.

## Niedowiezienia

- serwer lokalny nasłuchuje na `0.0.0.0`; brak sprawdzania `Host` / `Origin`; otwarty CORS; punkt API bez uwierzytelnienia;
- uprawnienie sprawdzone tylko w interfejsie, nie na serwerze; ścieżka z żądania bez sprawdzenia katalogu;
- działa w trybie deweloperskim (proxy Vite), psuje się po zbudowaniu: CORS, ścieżka bazowa, brak zbudowanego interfejsu w paczce;
- odświeżenie widoku pod jego adresem daje 404;
- migracja działa tylko na pustej bazie; baza względem katalogu roboczego;
- zadanie po restarcie serwera wisi w stanie „w toku”; proces potomny przeżywa zatrzymanie serwera;
- interfejs zawiesza się bez komunikatu, gdy serwer nie działa; brak ponownego połączenia;
- typy klienta przepisane ręcznie i rozjechane z serwerem;
- ślad stosu albo surowy błąd bazy w interfejsie.

## Wydanie

- build interfejsu i serwera, testy akceptacyjne na zbudowanym kodzie — zielone;
- lokalna: instalacja z paczki w czystym środowisku, start, sprawdzenie: adres zdrowia (`/health` albo podobny) odpowiada, interfejs się ładuje, jeden typowy przepływ; wersja widoczna w interfejsie i w `--version`;
- hostowana: wdrożenie podglądu → przegląd człowieka → produkcja; sprawdzenie adresu zdrowia i jednego przepływu na produkcji;
- migracja bazy: kopia przed migracją; przy hostowanej najpierw na kopii danych produkcyjnych albo na podglądzie;
- wycofanie (P-18): poprzednia wersja paczki albo wdrożenia; baza po migracji w przód — przywrócenie kopii albo migracja wsteczna, rozstrzygnięte w APP-14 przed wydaniem.

## Pielęgnacja

- zależności serwera i interfejsu — wersje główne frameworków przez osobną zdolność;
- rozmiar bazy, kopie zapasowe i próba odtworzenia z kopii;
- logi i katalogi robocze procesów w tle — rotacja, czyszczenie starych;
- osierocone procesy i pliki tymczasowe po awariach;
- hostowana: certyfikat i domena (data wygaśnięcia), błędy w zdalnym raportowaniu (P-12), podatności w zależnościach.
