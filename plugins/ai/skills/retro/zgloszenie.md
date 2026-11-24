# Zgłoszenie warsztatu z projektu

Procedura skilla `retro` dla lekcji `[warsztat]` w projekcie innym niż repozytorium warsztatu (krok 3, punkt 3 w `SKILL.md`). Zasady i ustawienie: „Zgłoszenia warsztatu” w `../../kontrakt/pamiec.md`. Wysyła tylko ten skill, z konta użytkownika, po jego jawnej zgodzie — żaden hook ani inny skill.

Kolejność jest stała: rodzaj i próg → repozytorium zgłoszeń → szkic i filtr prywatności → skan sekretów → zgoda → wysyłka → ślad. Krok, który kończy ścieżkę, kończy ją dla tej lekcji; lekcja zostaje w `lekcje.md`. Ścieżkę przechodzisz dla każdej lekcji `[warsztat]` w projekcie, także gdy proponujesz też wdrożenie zmiany od razu w dostępnym klonie warsztatu — wynik ścieżki (szkic, kanał bezpieczeństwa albo powód braku wysyłki, np. „repozytorium zgłoszeń nieznane”) jest zawsze częścią odpowiedzi.

## Oficjalne repozytorium warsztatu

Adres stoi w polu `repository` manifestu pluginu (`../../.claude-plugin/plugin.json`) w postaci `https://github.com/<właściciel>/<nazwa>`; końcowe `/` i `.git` pomijasz. `<właściciel>` i `<nazwa>` mają te same ograniczenia znaków co ustawienie w kroku 2. Pole puste, brak pola albo inna postać → adres nieznany (wersja warsztatu sprzed publikacji). Z adresu bierzesz domyślne repozytorium zgłoszeń (krok 2) i kanał bezpieczeństwa (krok 1).

## 1. Rodzaj problemu i próg

Oceń rodzaj problemu lekcji:

- **bezpieczeństwo** — wyciek sekretu, ominięta kontrola, przyznane za szerokie uprawnienie;
- **utrata danych** — skill albo hook warsztatu usunął lub nadpisał pracę użytkownika (pliki, niezacommitowane zmiany, zapisy w `.ai/`) tak, że nie da się jej odzyskać z gita;
- **zwykły** — reszta.

Bezpieczeństwo → **kanał bezpieczeństwa**, już od pierwszego wystąpienia i niezależnie od ustawienia `zgloszenia` (także `null`). Nie przygotowujesz szkicu, nie proponujesz publicznego Issue i niczego nie wysyłasz. Powiedz użytkownikowi, że to problem bezpieczeństwa samego warsztatu i że zgłasza go prywatnie według polityki bezpieczeństwa (`SECURITY.md`) oficjalnego repozytorium warsztatu, przez prywatne zgłaszanie podatności na GitHubie (Security → Report a vulnerability) — nigdy w publicznym Issue, bo ujawniłoby lukę przed poprawką. Kanał należy zawsze do oficjalnego repozytorium warsztatu, nie do repozytorium z ustawienia `zgloszenia`. Znany adres → podaj oba linki: polityka `<adres>/security/policy`, prywatne zgłoszenie `<adres>/security/advisories/new`; nieznany → opis kanału bez adresu. Koniec ścieżki.

Próg lokalny: zwykły problem — od 3 wystąpień w lekcji; utrata danych — od pierwszego. Poniżej progu lekcja zostaje lekcją, bez propozycji wysyłki.

Lekcja z dopiskiem `Zgłoszenie: niewysłane RRRR-MM-DD` — szkic był już pokazany i nie wyszedł (odmowa, brak konta albo sesja bez odpowiedzi). Nie proponujesz go ponownie, dopóki lekcja nie ma wystąpienia z datą późniejszą niż data dopisku; powiedz tylko, że czeka na nowe wystąpienie. Z nowym wystąpieniem lekcja przechodzi ścieżkę od nowa, a próg liczy wszystkie jej wystąpienia.

## 2. Repozytorium zgłoszeń

`.ai/warsztat.json` → `zgloszenia`:

- `"<właściciel>/<nazwa>"` → zgłoszenie idzie tam (fork albo firma może wpisać własne);
- `null` → brak propozycji wysyłki, także ponad progiem; lekcja zostaje. Koniec ścieżki;
- brak klucza → oficjalne repozytorium warsztatu (`<właściciel>/<nazwa>` z jego adresu); adres nieznany → jak `null`, a odpowiedź zawiera osobną linię przepisaną bez zmian (bez wtrąceń w środku, np. „jest”), po niej możesz wyjaśnić powód:

  ```text
  Repozytorium zgłoszeń nieznane.
  ```

- wartość, która nie ma postaci `właściciel/nazwa` (litery, cyfry, `-`, `_`, `.`; bez wiodącego `-`, spacji i innych znaków) → nie wysyłasz i mówisz, że ustawienie jest błędne.

`github.repo` to lustro ticketów projektu, nie miejsce zgłoszeń — nigdy go tu nie używasz.

## 3. Szkic w stałych polach

Szkic piszesz po angielsku, wyłącznie w tych polach i w tej kolejności, każde jako nagłówek `### <pole>`:

1. `Workshop version` — `version` z manifestu pluginu (`../../.claude-plugin/plugin.json`).
2. `Agent and model` — narzędzie i model tej sesji (np. `Claude Code / claude-sonnet-5-5`); nieznany → `unknown`.
3. `Skill and step` — skill i krok, którego dotyczy problem, jako plik w pluginie warsztatu (np. `skills/spec/SKILL.md, step 3`).
4. `Kind` — `regular` albo `data loss`.
5. `Symptom` — co się stało, opisane słowami warsztatu: skill, krok, plik stanu, pojęcie kontraktu.
6. `Occurrences` — liczba wystąpień i ich daty.
7. `Proposed direction` — jaka zmiana warsztatu usunęłaby problem.

Tytuł: `[<skill>] <objaw w kilku słowach>` — jedna linia, bez znaków `"`, `'`, `$`, `` ` `` i `\`, bo trafia do polecenia powłoki. Etykiety: `process-report` i `status: new`.

## 4. Filtr prywatności

Repozytorium zgłoszeń jest publiczne. Sprawdź **tytuł i każde pole osobno**:

- pojęcia ze słownika projektu (`.ai/SLOWNIK.md`, także odmiany i tłumaczenia);
- ścieżki i nazwy plików śledzonych w projekcie (`git ls-files`); ścieżki plików pluginu warsztatu (`skills/…`, `kontrakt/…`) zostają;
- kod, nazwy projektu, produktu, klienta, repozytorium;
- dane osobowe: imiona, nazwiska, adresy e-mail, loginy;
- sekrety i tokeny.

Pole z trafieniem przepisz słowami warsztatu albo usuń z niego trafienie. Potem powiedz użytkownikowi, które pole zmieniłeś i dlaczego (rodzaj trafienia), nie powtarzając usuniętej treści.

## 5. Skan sekretów

Zapisz w katalogu tymczasowym systemu, poza repozytorium projektu, dwa pliki. Ścieżkę katalogu bierzesz z wyniku polecenia (`echo "$TEMP"` albo `$env:TEMP`), nie z pamięci — wartość zmiennej bywa inna niż domyślny katalog użytkownika, a zapis gdzie indziej może zostać odrzucony. Pliki: tytuł i treść szkicu (same pola, bez tytułu — ten plik pójdzie jako `--body-file`). Przeskanuj oba razem, niezależnie od `bezpieczenstwo.skanSekretow`, który skanuje zmiany do commita, nie tekst:

- Bash: `cat <plik-tytułu> <plik-treści> | gitleaks stdin --redact --no-banner`;
- PowerShell: `Get-Content -Raw <plik-tytułu>, <plik-treści> | gitleaks stdin --redact --no-banner`.

Kod wyjścia różny od 0 → wysyłka zatrzymana: powiedz, że skan znalazł sekret (bez jego treści), usuń oba pliki i nie wysyłasz. Obecność sprawdzasz poleceniem `gitleaks version`. Bez `gitleaks` w `PATH` → nie wysyłasz i mówisz dlaczego (brak skanu sekretów; instalacja `gitleaks` odblokuje wysyłkę). Każda zmiana szkicu wymaga ponownego filtra i skanu.

## 6. Zgoda

Pokaż użytkownikowi w odpowiedzi repozytorium docelowe, tytuł, etykiety i **treść szkicu dosłownie, w całości** — wszystkie pola z nagłówkami `### <pole>`, tak jak pójdą do Issue. Nie streszczaj szkicu i nie odsyłaj do pliku: użytkownik zgadza się na to, co widzi. Dodaj zmiany z filtra i rodzaj problemu, który może zmienić: zmiana na bezpieczeństwo → kanał bezpieczeństwa (krok 1) zamiast szkicu; inna zmiana → nowy `Kind`, ponowny filtr i skan, ponowne pytanie. Zapytaj, czy wysłać (odpowiedzi: wysłać / nie wysyłać / nie mam konta GitHub), i zakończ odpowiedź — przed jawną zgodą niczego nie wysyłasz.

Zanim zakończysz odpowiedź pytaniem, dopisz w lekcji `Zgłoszenie: niewysłane RRRR-MM-DD` (dzisiejsza data) w miejscu śladu z kroku 8; istniejący dopisek `niewysłane` zastępujesz. Sesja może się skończyć bez odpowiedzi (tryb nieinteraktywny) — wtedy ślad już jest.

Odmowa albo „nie mam konta” → nie wysyłasz, usuwasz pliki tymczasowe, a dopisek `niewysłane` zostaje. Do tej lekcji retro wróci dopiero po nowym wystąpieniu (krok 1).

## 7. Wysyłka

Po „tak” wyślij dokładnie pokazany szkic z pliku, który przeszedł skan:

```sh
gh issue create --repo <zgloszenia> --title "<tytuł>" --label process-report --label "status: new" --body-file <plik>
```

`gh` zwraca link do Issue. Błąd `gh` → powiedz, co się nie udało; dopisek `niewysłane` zostaje.

Pliki tymczasowe (tytuł i treść) usuwasz w każdej ścieżce zakończenia: po wysyłce, po błędzie `gh`, po zatrzymaniu przez skan i po odmowie — mogą zawierać treść szkicu albo wykryty sekret.

## 8. Ślad

Lekcja zostaje w `lekcje.md` (nie usuwasz jej) i dostaje dopisek `Zgłoszenie: <link>` przed `Wystąpienia:` — za `Wzorzec:`, jeśli jest; link zastępuje dopisek `Zgłoszenie: niewysłane …` z kroku 6 (format: „Lekcja — wpis w `lekcje.md`” w `../../kontrakt/formaty.md`).
