# Profil: przekrojowe

> Decyzje wspólne dla każdej klasy aplikacji. Obowiązuje zawsze, razem z profilem klasy. Format i użycie: sekcja „Profile” w kontrakcie warsztatu.
> Każda pozycja kończy się w projekcie jednym z wyników: ADR, zasada `Zxx`, decyzja w specu szkieletu, `pominięte: powód`, `później` (Mgła) albo `otwarte`. Numery są stałe.

## Decyzje

### Podstawy

- **P-01 Użytkownicy i użycie** — kto używa, jak często, na czym (system, urządzenie, przeglądarka, terminal). Od tego zależy połowa pozostałych odpowiedzi.
- **P-02 Język** — język interfejsu, treści, komunikatów błędów i historii zmian. Wielojęzyczność teraz, później czy nigdy.
- **P-03 Środowisko i wersje** — wersja Node albo Pythona przypięta w repo (`.nvmrc`, `.python-version`, `engines`, `requires-python`), menedżer pakietów (pnpm / npm, uv / pip), lockfile w repo.
- **P-04 Układ repozytorium** — katalogi, podział na moduły, gdzie testy. Kierunek zależności jako zasada z automatem.

### Jakość

- **P-05 Strategia testów** — poziomy (akceptacyjne, jednostkowe), narzędzia, co mockujemy, poziom testu akceptacyjnego z profilu klasy.
- **P-06 Walidacja** — typy, lint, format; formatowanie automatyczne czy sprawdzane. Komendy trafiają do `walidacja` w `.ai/warsztat.json`.
- **P-07 CI** — czy i gdzie (np. GitHub Actions), co uruchamia, na jakich systemach i wersjach.

### Konfiguracja i bezpieczeństwo

- **P-08 Konfiguracja i sekrety** — skąd program bierze ustawienia; sekrety tylko w zmiennych środowiskowych albo menedżerze sekretów, `.env` w `.gitignore`, `.env.example` w repo; skan sekretów przed commitem (`bezpieczenstwo.skanSekretow`, hook `.githooks/pre-commit`) i lista plików chronionych przed agentem (`bezpieczenstwo.chronione`). Domyślne ustawia skill `start`.
- **P-09 Bezpieczeństwo** — skąd przychodzą dane wejściowe i na ile im ufamy; uprawnienia; audyt zależności (`npm audit`, `pip-audit`).
- **P-10 Dane osobowe** — czy przetwarzamy (także w logach i analityce), co, gdzie, jak długo; RODO: podstawa, polityka prywatności, zgoda na cookies. Dane w testach, przykładach i `.ai/` zawsze syntetyczne; skąd brać dane do odtworzenia błędów z produkcji (anonimizacja).

### Działanie

- **P-11 Błędy** — co widzi użytkownik (zrozumiały komunikat: co się stało, co zrobić), co trafia do logu, kiedy program przerywa, a kiedy kontynuuje.
- **P-12 Logi i obserwowalność** — czy w ogóle; poziomy, gdzie trafiają; zdalne raportowanie błędów (np. Sentry) — tak czy nie.
- **P-13 Wydajność** — oczekiwania w liczbach (czas startu, czas odpowiedzi, waga strony), a nie „szybko”.
- **P-14 Dostępność** — dla wszystkiego, co ma interfejs: poziom docelowy i jak go sprawdzamy.

### Wydanie i życie projektu

- **P-15 Wersjonowanie** — `semver`, `data` albo `brak`; przy semver: co jest publicznym interfejsem, którego złamanie podbija wersję główną.
- **P-16 Historia zmian** — `.ai/wydania.md` prowadzimy zawsze; czy dodatkowo `CHANGELOG.md` dla użytkowników, w jakim języku i formacie. Projekt na GitHubie albo wydawany innym ludziom → rekomendacja: tak, plus GitHub Release z tą samą treścią przy każdej wersji (`wydanie.githubRelease`). Mały pomocnik na własny użytek → zwykle wystarczy rejestr wydań.
- **P-17 Dystrybucja i wdrożenie** — dokąd trafia wynik (rejestr pakietów, hosting, tylko lokalnie), jak i z jakiej gałęzi; środowiska (podgląd, produkcja).
- **P-18 Wycofanie** — jak cofnąć złe wydanie i ile to trwa.
- **P-19 Pielęgnacja** — jak aktualizujemy zależności (ręcznie w przeglądzie tygodniowym, Dependabot, Renovate) i co sprawdzamy cyklicznie (komendy do `pielegnacja` w `.ai/warsztat.json`).
- **P-20 Dokumentacja użytkownika** — README, pomoc w programie, strona; co minimum przy każdym wydaniu.
- **P-21 Licencja i prawa** — licencja kodu; prawa do treści, obrazów i fontów.
- **P-22 Dane trwałe** — jeśli są: format, migracje, kopie zapasowe, odtworzenie.
- **P-23 Git i GitHub** — gałęzie (`glowna` albo `zdolnosc` z PR), push po commicie (`pytaj`, `zawsze`, `nigdy`), scalanie (`merge` albo `rebase`, nigdy squash), tracker (`pliki` albo `github` — Issues jako lustro ticketów), ochrona gałęzi głównej i skanowanie sekretów na GitHubie. Zapis w `warsztat.json` → `git`, `tracker`, `github`; zasady w kontrakcie warsztatu, sekcja „Git i GitHub”.

## Doświadczenie (UX)

Dotyczy każdego interfejsu — także terminala. Szczegóły w profilu klasy.

- Kto wykonuje jakie zadanie i jaka jest najkrótsza droga do celu.
- Co widzi użytkownik w stanie pustym, w trakcie, po błędzie i po sukcesie.
- Komunikat błędu mówi: co się stało, dlaczego, co zrobić teraz.

## Testy akceptacyjne

Poziom i narzędzia określa profil klasy. Wspólne: test akceptacyjny idzie przez publiczny interfejs i nosi numer scenariusza.

## Niedowiezienia

- sekret, adres albo klucz wpisany na sztywno;
- prawdziwe dane osobowe w testach, przykładach albo logach;
- działa tylko na maszynie autora: ścieżki absolutne, zależność od katalogu roboczego, brakująca zmienna środowiskowa bez komunikatu;
- brak wpisu w historii zmian dla zmiany widocznej dla użytkownika (gdy prowadzimy `CHANGELOG.md`);
- dokumentacja użytkownika nie opisuje nowego zachowania.

## Wydanie

- walidacja zielona na czystym klonie;
- wersja i historia zmian zaktualizowane według P-15 i P-16;
- sprawdzenie po wydaniu według profilu klasy;
- wpis w `.ai/wydania.md`.

## Pielęgnacja

- zależności przestarzałe i z podatnościami;
- skan sekretów całej historii (`gitleaks git --redact --no-banner`) i alerty skanowania sekretów na GitHubie;
- wersje środowiska bliskie końca wsparcia (EOL Node, Pythona);
- wpisy „Niewydane” w historii zmian starsze niż kilka tygodni;
- zasady twarde bez automatu, otwarte pozycje profilu.
