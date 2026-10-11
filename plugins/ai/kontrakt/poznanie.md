# Poznanie kodu i aktualność wiedzy

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Zastany projekt

Dotyczy repozytoriów z kodem, historią i dokumentacją sprzed warsztatu.

- **Poznać, nie przenosić.** Zastana dokumentacja zostaje na miejscu. Wiedzę z niej wyciągasz do plików warsztatu i zawsze linkujesz źródło (`Źródło: docs/architektura.md`). Kopiowanie treści tworzy drugie źródło prawdy.
- **Zastane ADR-y.** Zostają w swoim katalogu, a `sciezki.decyzje` wskazuje na niego. Nowe ADR-y piszesz w ich formacie i numeracji (przy mieszanych formatach — według najnowszego). Przeniesienie do `.ai/decyzje/` (`git mv`, z poprawą linków) tylko na wyraźne życzenie użytkownika.
- **ADR zastany** odtwarzasz z kodu, dokumentów albo historii gita tylko dla decyzji, które ograniczają dalszą pracę. Status `zastana`, z polem `Źródło`. Obowiązuje, dopóki ktoś jej nie podważy.
- **Dokumentacja się starzeje.** Każde twierdzenie z dokumentu sprawdzasz w kodzie. Rozjazd zapisujesz w `zrodla.md` → `## Rozjazdy` i rozstrzyga go człowiek: dokument nieaktualny, ADR `nieaktualna`, albo bug w kodzie (skill `napraw`). Nie poprawiasz zastanych dokumentów bez zgody.
- **Poznajesz stopniowo.** `start` robi płytką inwentaryzację. Głęboko poznajesz tylko obszar, który właśnie ruszasz (skill `poznaj <obszar>`).
- **Punkt odniesienia walidacji.** Jeśli walidacja jest czerwona już na starcie, `warsztat.json` → `odniesienie.znane` zawiera listę znanych błędów (test, reguła lint, plik). Walidacja „przechodzi”, gdy nie ma błędów spoza listy. Naprawiony znany błąd usuwasz z listy; lista nie może rosnąć.
- **Testy charakteryzujące.** Zanim zmienisz zachowanie kodu, którego nie pokrywają testy, przypnij obecne zachowanie testem — nawet jeśli wygląda na błędne. Podejrzane zachowanie zgłaszasz, nie poprawiasz po cichu.

## Aktualność map obszarów

Mapa w `.ai/obszary/` opisuje zastany kod, a spec i ADR zapisują wymagania i decyzje. Zmiana źródła jest sygnałem do sprawdzenia mapy; nie jest dowodem jej błędu ani zgodą na zmianę wymagań. Brak zmiany źródeł nie dowodzi poprawności opisu ani kompletności listy zależności.

- Nowa mapa ma frontmatter `poznany-commit: <pełny hash>` oraz `zrodla-kodu: ["src/obszar/", "tests/obszar/", "konfiguracja.json"]`. Lista jest tablicą JSON w jednej linii; ścieżki względem korzenia projektu, z `/`, bez globów, ścieżek absolutnych i `..`. Wskaż też zależności poza katalogiem modułu, które wpływają na opis: konfigurację, kontrakty i testy. Nie wpisuj źródeł chronionych ani samej mapy.
- W treści każde istotne twierdzenie ma odnośnik do pliku, symbolu, sekcji albo testu. Numer linii jest pomocniczy. Uzasadnienie decyzji pochodzi ze źródła lub historii; domysł oznacz jako wniosek albo pytanie.
- `poznaj` odświeża tylko dotknięte fragmenty i przesuwa checkpoint po ich sprawdzeniu. Hash oznacza commit źródeł, nie commit dokumentacji. Gdy sprawdzane źródła mają niezacommitowane zmiany, nie przesuwaj checkpointu; oznacz sprawdzoną wersję roboczą w treści. `null`, brak metadanych, nieosiągalny commit albo niedostępny git oznaczają aktualność nieznaną.
- Hook `SessionStart` sprawdza nazwy zmienionych źródeł względem checkpointu, łącznie ze zmianami staged, roboczymi, usunięciami i nieśledzonymi plikami. Raportuje krótko mapy wymagające sprawdzenia; nie odświeża ich ani nie robi commitów. Mechanizm: `scripts/aktualnosc-map.mjs`, wspólny dla obu hostów. Budżet odczytów gita to 3 sekundy; pominięta lub nieudana kontrola daje aktualność nieznaną.
- `gdzie` pokazuje aktualność map. `buduj` i `napraw` sprawdzają używane mapy przed poleganiem na nich, a po zmianie wskazują mapy do odświeżenia przez `poznaj`. Aktualizacja zapisów wymaga zgody według zasad `poznaj`; nie uruchamiaj generatora dokumentacji w tle po każdym commicie.
- Starsze mapy z linią `Poznany: … (commit …)` pozostają czytelne. `poznaj` przenosi checkpoint do frontmatteru przy odświeżeniu i uzupełnia źródła. Nie migruj wszystkich map automatycznie ani nie oznaczaj starych opisów jako sprawdzonych przez samo dopisanie metadanych.

## Zasady projektu

`ZASADY.md` to aktualny, skonsolidowany zbiór reguł, których kod ma się trzymać przez cały okres życia. ADR mówi, **dlaczego** kiedyś tak zdecydowaliśmy; zasada mówi, **jak ma być teraz**. Zasada nie powtarza uzasadnienia — linkuje ADR, a gdy ADR-u nie ma (np. zasada `zastana` albo wynikająca z lekcji), linkuje źródło, które ją uzasadnia: dokument, konfigurację, kod, test lub commit.

- **AGENTS.md a ZASADY.md.** Zasady dotyczą kodu. AGENTS.md opisuje projekt (uruchamianie, mapa, pułapki) i zachowanie agenta. Konwencje kodu nie trafiają do AGENTS.md — tam jest tylko odesłanie do `ZASADY.md`.
- **Tylko stanowiska projektu.** Ogólnych zasad czystego kodu nie przepisujesz — model je zna. Zapisujesz to, co jest decyzją: tam, gdzie rozsądne podejścia się różnią.
- **Wpis** (format niżej): stały, unikalny numer `Zxx`, reguła w jednym zdaniu w nagłówku, `Siła`, `Egzekwowanie`, `Status`, `Dlaczego`, `Wyjątki`. Nowej zasadzie nadajesz kolejny wolny numer; wycofanego numeru nigdy nie używasz ponownie.
- **Siła:** `twarda` — złamanie jest uwagą blokującą w przeglądzie i weryfikacji; `preferencja` — uwaga „warto”.
- **Egzekwowanie:** `automat — <komenda albo reguła>` (kontrola jest w `walidacja` w `warsztat.json` albo — dla wzorca, który nie może trafić do kodu — w `hooki.zakazane`; zobacz „Hooki kodu”), `przegląd` (pilnują recenzenci) albo `brak` (nie ma stałej kontroli). `przegląd` i `brak` nie są automatami; zasada twarda w jednym z tych trybów to kandydat dla skilla `retro`: kierunek zależności i granice modułów da się sprawdzać automatycznie (TypeScript: `dependency-cruiser`, `eslint-plugin-boundaries`; Python: `import-linter`, reguły `ruff`, testy architektury).
- **Status:** `obowiązuje`; `zastana` — odczytana z kodu przez skill `poznaj` i zaakceptowana przez człowieka, obowiązuje tak samo; `wycofana` — z linkiem do następcy albo decyzji. Wycofanej nie usuwasz: numery są stałe.
- **Wyjątki** są jawne: miejsce, powód, link. Kod łamiący zasadę bez wpisanego wyjątku to błąd albo sygnał, że zasada jest nieaktualna.
- **Zasada, której kod nie przestrzega, jest gorsza niż brak zasady** — agent uczy się z kodu. Masowe łamanie zasady to rozjazd do rozstrzygnięcia przez człowieka: poprawiamy kod (refaktor) albo zmieniamy zasadę (skill `decyzja`).
- **Zmiana zasady** przechodzi przez skill `decyzja`, jeśli jest twarda albo trudna do odwrócenia; drobną preferencję zmieniasz za zgodą użytkownika z notatką w mapie zdolności, która ją wywołała.
- **Zasady obszaru** — dotyczące tylko jednego obszaru kodu — zapisujesz w `ZASADY.md` z zakresem w nagłówku (`[obszar: platnosci]`), żeby wszystkie zasady były w jednym miejscu.
