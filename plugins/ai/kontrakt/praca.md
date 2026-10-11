# Budowa i weryfikacja

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Rodzaje zdolności

Rodzaj zapisujesz w `mapa.md` w linii `Rodzaj:`. Statusy i cykl są wspólne, a różni się to, co znaczy każdy etap.

| Etap | `funkcja` (domyślny) | `refaktor` | `szkielet` | `wyglad` |
| --- | --- | --- | --- | --- |
| po co | nowe zachowanie dla użytkownika | lepsza struktura, zachowanie bez zmian | pierwsza działająca ścieżka w pustym projekcie | doświadczenie, wygląd i treść: nowa strona, przeprojektowanie, przepływ, system wyglądu |
| spec | szablon `spec.md`: problem, scenariusze | szablon `spec-refaktor.md`: stan obecny → docelowy, niezmienniki, siatka bezpieczeństwa, strategia, kryterium końca | szablon `spec.md`: scenariuszem jest jedna ścieżka od wejścia do wyjścia i działająca walidacja | szablon `spec.md` z wypełnioną sekcją „Doświadczenie”: przepływy jako scenariusze, stany, szerokości kontrolne, dostępność, treści |
| plasterek | kończy się czymś widocznym | krok, po którym wszystko działa i da się wdrożyć | jak `funkcja` | jedna strona, sekcja albo przepływ — do obejrzenia w całości |
| pierwszy ticket | najcieńsza ścieżka przez system | testy charakteryzujące niezmienniki | stos + jedna ścieżka + testy + walidacja w `warsztat.json` | kontrole automatyczne z profilu (dostępność, linki, budżet) i zrzuty, jeśli projekt ich jeszcze nie ma |
| pętla budowy | czerwony test → zielony | zielone przed i po każdym kroku | czerwony test → zielony | test przepływu → zmiana → kontrole automatyczne → zrzuty → akceptacja człowieka |
| przegląd zgodności | kryteria akceptacji | niezmienniki; każda zmiana zachowania jest blokująca | kryteria akceptacji | kryteria, stany i szerokości; akceptacja wyglądu wpisana w tickecie |

Mała poprawa struktury wewnątrz ticketu to zwykły krok „refaktoryzuj na zielonym”. Rodzaj `refaktor` jest dla zmian, które same są projektem.

**`wyglad` — czego nie sprawdzi test.** Logikę (formularz, filtr, nawigacja) nadal prowadzi TDD. To, czego test nie oceni — czy wygląda dobrze, czy treść jest jasna — sprawdzają kontrole automatyczne z profilu (dostępność, kontrast, linki, budżet wydajności) i człowiek. Zrzuty ekranu w szerokościach kontrolnych z profilu powstają w katalogu ignorowanym przez git (np. `.ai/zrzuty/`, wpis w `.gitignore`). Akceptację zapisujesz w tickecie: `Akceptacja wyglądu: RRRR-MM-DD — użytkownik — szerokości 375, 1280 — uwagi`. Bez niej ticket `wyglad` nie jest zrobiony. Weryfikator może oglądać zrzuty, ale nie zastępuje akceptacji człowieka.

## Język → zachowanie → test

Trzy poziomy, każdy zakotwiczony w poprzednim: **język** domeny (lekkie, strategiczne DDD) → **zachowanie** opisane tym językiem (lekkie BDD) → **test**, który to zachowanie sprawdza (TDD). Ślad musi dać się przejść w obie strony: od pojęcia do testu i od testu do scenariusza.

### Język — słownik i konteksty

- **Wspólny język.** Kod, spec, tickety i rozmowa używają pojęć z `SLOWNIK.md`, w tym samym znaczeniu.
- **Konteksty.** Domyślnie projekt ma jeden kontekst i słownik nie ma sekcji kontekstów. Gdy to samo słowo znaczy w dwóch częściach systemu co innego (np. „Klient” w sprzedaży to osoba z koszykiem, a w księgowości — podmiot z NIP), nie sklejasz znaczeń i nie wymyślasz sztucznych nazw. Dzielisz słownik na konteksty: każdy ma nazwę, odpowiedzialność, obszary kodu i relacje z innymi (kto od kogo bierze dane i jak je tłumaczy). Pojęcie, które znaczy wszędzie to samo, zostaje we wspólnej części.
- **Konteksty a kod.** Granica kontekstu to kandydat na granicę modułu w `ZASADY.md` (z automatem) i na mapę w `obszary/`. Wprowadzenie albo zmiana granicy kontekstu to twarda decyzja → skill `decyzja`.
- **Niezmienniki domeny** — reguły, które są zawsze prawdziwe dla pojęcia („Wystawiona faktura się nie zmienia; korekta to nowa faktura”) — zapisujesz przy pojęciu w słowniku (`_Zawsze:_`). Spec, który ich dotyka, ma scenariusz, który je sprawdza.
- **Taktyczne DDD** (agregaty, encje, obiekty wartości, repozytoria, zdarzenia domenowe) nie jest domyślne. Jeśli projekt go chce, decyduje o tym ADR, a sposób stosowania trafia do `ZASADY.md`.

### Zachowanie — scenariusze

- **Format.** Scenariusz w specu ma stały numer i trzy części: `S3. <nazwa> — Zakładając <stan>, gdy <zdarzenie>, wtedy <obserwowalny wynik>`. „Zakładając” jest obowiązkowe, gdy wynik zależy od stanu. Wszystko pisane pojęciami ze słownika.
- **Przykłady.** Reguła z granicą (próg, limit, termin, uprawnienie) dostaje tabelę przykładów z wartościami po obu stronach granicy. Przykłady powstają w grillu — pytanie „pokaż na przykładzie” wyłapuje nieporozumienia szybciej niż definicje.
- **Stałe numery.** Po akceptacji specu numerów nie przesuwasz. Usunięty scenariusz zostaje jako `S4 — usunięty RRRR-MM-DD: powód`; nowy dostaje kolejny wolny numer. Przy refaktorze tę samą rolę pełnią niezmienniki `N1`, `N2`, …
- **Kontekst.** Spec zdolności podaje, w którym kontekście (albo na granicy których kontekstów) działa.
- **Gherkin** (`.feature`, Cucumber, pytest-bdd) nie jest domyślny — scenariusze w specu i testy w zwykłym frameworku wystarczają. Projekt, w którym spec czytają osoby nietechniczne, może go wybrać przez ADR.

### Test — podwójna pętla

- **Ticket wskazuje scenariusze** w polu `scenariusze` (np. `["S1", "S3"]`). Każdy scenariusz specu trafia do co najmniej jednego ticketu. Scenariusz rozłożony na kilka ticketów jest gotowy wtedy, gdy przechodzi jego test akceptacyjny.
- **Pętla zewnętrzna.** Budowa zaczyna od testu akceptacyjnego scenariusza — przez publiczny interfejs, na najwyższym sensownym poziomie (API, CLI, UI, publiczna funkcja modułu). Jest czerwony do końca pracy nad scenariuszem.
- **Pętla wewnętrzna.** Zwykłe TDD: jeden test jednego zachowania naraz, aż test akceptacyjny przejdzie.
- **Ślad w nazwie.** Test akceptacyjny ma numer scenariusza w nazwie albo opisie (`it("S3: …")`, `def test_s3_…`, `@pytest.mark.scenariusz("S3")`), tak żeby `grep S3` w testach go znalazł. Przy refaktorze — numer niezmiennika.
- **Starsze specy i tickety.** Scenariusze numerowane `1.`, `2.` czytasz jako `S1`, `S2`; prefiks i „Zakładając” dopisujesz przy najbliższej zmianie specu, za zgodą. Ticket bez pola `scenariusze` wiąże się ze scenariuszami przez kryteria akceptacji. Istniejących testów nie przemianowujesz hurtem — numer dostają przy najbliższej zmianie.

## Weryfikacja krzyżowa

Dwa modele spotykają się w dwóch miejscach: przy **koncepcji** (druga opinia po grillu) i przy **dowiezieniu** (weryfikacja po budowie). W obu jeden model tworzy, drugi podważa, a różnice rozstrzyga człowiek.

### Druga opinia — koncepcja

Kontynuacja grilla w drugim modelu niewiele wnosi: drugi model czyta decyzje pierwszego jako ustalone i idzie tym samym torem. Druga opinia **podważa wynik grilla, zamiast go powtarzać**.

- **Najpierw własne zdanie.** Weryfikator czyta tylko `## Problem` z mapy, linię roadmapy, rodzaj zdolności, `Grill:` (wyłącznie do sprawdzenia niezależności), słownik, `ZASADY.md`, powiązane ADR-y i kod — bez lekcji, decyzji i otwartych pytań — i sam spisuje kluczowe pytania, ryzyka i podejścia. Dopiero potem czyta wynik grilla i porównuje.
- **Ślepota jest częściowa.** Słownik, `ZASADY.md` i ADR-y mogą zawierać wnioski z wcześniejszego grilla. Czytanie ich przed decyzjami z mapy ogranicza sugerowanie się odpowiedziami, ale nie gwarantuje pełnej niezależności.
- **Wynik w czterech grupach:** zakwestionowane decyzje (z argumentem), pytania, których nikt nie zadał, nierozważone alternatywy, niejasne lub niespójne pojęcia.
- **Grill tylko na różnicach.** Użytkownik nie odpowiada drugi raz na to, co ustalone i niepodważone.
- **Źródło przy wpisie.** Decyzje i pytania wniesione przez drugą opinię mają dopisek `(druga opinia: <narzędzie / model>)`; zmienione decyzje — `zmienione po drugiej opinii (było: …)`.
- **Niezależność.** Porównuj nazwy modeli, nie narzędzi; ten sam model w innym kliencie nadal jest tym samym modelem. Jeśli model opiniujący pasuje do któregokolwiek modelu z `Grill:` i `weryfikacja.innyModel: true`, ostrzeż i za zgodą oznacz opinię jako nieniezależną. Gdy `innyModel: false`, ten sam model może kontynuować, ale nie nazywaj opinii niezależną. Jeśli któryś model jest `nieznany`, nie twierdź, że opinia jest niezależna.
- **Konfiguracja** `weryfikacja.drugaOpinia`: `zalecana` (domyślnie — skill `spec` przypomina przed bramką akceptacji), `wymagana` (bez drugiej opinii `spec` nie przechodzi do akceptacji) albo `wylaczona`.

### Weryfikacja — dowiezienie

Model, który zbudował, ma skłonność do potwierdzania własnego planu. Dlatego domyślnie sprawdza go **inny model** — najlepiej w innym narzędziu (budujesz w Claude Code, weryfikujesz w Codexie albo odwrotnie). Gdy `weryfikacja.innyModel` jest `false`, ten sam model może sprawdzić wynik, ale runda jest nieniezależna. Przekazanie odbywa się przez pliki `.ai/` i git, nie przez czat.

- **Role.** Budujący (`buduj`) koduje i poprawia. Weryfikator (`weryfikuj`) ocenia i zapisuje uwagi — niczego nie poprawia.
- **Kto budował.** `buduj` wpisuje do ticketu `budowal: "<narzędzie> / <model>"`. `weryfikuj` porównuje nazwy modeli, nie narzędzi, ze wszystkimi budującymi w zakresie. Ten sam model przy `weryfikacja.innyModel: true` → ostrzeżenie, a za zgodą użytkownika weryfikacja oznaczona jako nieniezależna. Przy `false` wolno użyć tego samego modelu, ale wynik oznacz jako nieniezależny. Gdy model którejkolwiek strony jest `nieznany`, nie twierdź, że weryfikacja jest niezależna.
- **Przebieg.** Ostatni ticket zrobiony → status `weryfikacja` → runda w `weryfikacja.md` → `przeszła`: `zamknij` → `gotowe`; `nie przeszła`: uwagi blokujące stają się ticketami, status wraca do `budowa`, potem kolejna runda.
- **Uwagi** mają numer `R<runda>.<n>`, wagę `blokująca | warto | drobna` i status `otwarta | naprawiona | odrzucona`. Odrzucenie wymaga decyzji użytkownika i jednego zdania uzasadnienia.
- **Zakres.** Domyślnie cała zdolność (`weryfikuj <slug>`). Pojedynczy ryzykowny ticket: `weryfikuj <slug>#NN` — bez zmiany statusu zdolności. Szybki `przeglad` po każdym tickecie zostaje: łapie drobiazgi tanio, zanim dojdzie do weryfikacji.
- **Testy mutacyjne** (decyzja P-24, `warsztat.json` → `mutacje`): `null` — brak; albo `{ "komenda": "<komenda>", "limitMinut": <liczba> }`. Sposób zawężenia zakresu zależy od narzędzia i jego wersji, więc zapisuje go komenda: znacznik `{pliki}` zastępujesz listą plików produkcyjnych z zakresu rozdzieloną przecinkami (Stryker: `npx stryker run --mutate {pliki}`), znacznik `{diff}` — ścieżką pliku z diffem zakresu, zapisanego poza repo (cargo-mutants: `cargo mutants --in-diff {diff}`). Komenda bez znacznika działa na zakresie z konfiguracji narzędzia — tak jest w `mutmut` 3, który nie przyjmuje ścieżek plików w CLI (zakres w `source_paths` i `only_mutate`, a `mutmut run` filtruje tylko po nazwach mutantów) i wymaga `fork`, czyli na Windows działa tylko w WSL. Komendę z tymi znacznikami sprawdzasz jednym uruchomieniem przy rozstrzyganiu P-24, z `--help` zainstalowanej wersji, a nie z pamięci. Uruchamia je weryfikator, nie hook ani `buduj`: przeżyte mutanty są dowodem dla oceny testów, a nie progiem do wyzerowania. Mutant równoważny (zmiana bez wpływu na zachowanie) nie jest uwagą.
- **Konfiguracja** w `.ai/warsztat.json` → `weryfikacja`: `wymagana` (domyślnie `true`; przy `false` po ostatnim tickecie idzie się prosto do `zamknij`, a status zostaje `budowa`) i `innyModel` (domyślnie `true`).

### Odbiór — sprawdzenie przez człowieka

Testy i weryfikacja sprawdzają kod. Nie sprawdzą, czy działa tam, gdzie będzie używany: migracja poszła tylko na bazę testową, brakuje zmiennej środowiskowej, przycisk działa w teście, ale nie w przeglądarce. Odbiór robi człowiek, według listy przygotowanej przez agenta.

- **Plik** `zdolnosci/<slug>/odbior.md` z szablonu `szablony/odbior.md`. Przygotowuje go `zamknij`, przechodzi człowiek.
- **Co trafia na listę:** scenariusze specu przez prawdziwy interfejs, na środowisku innym niż testowe; zmiany poza kodem z commitów zdolności — migracje, zmienne środowiskowe, konfiguracja, usługi zewnętrzne, uprawnienia — każda z tym, jak sprawdzić, że jest na miejscu; pozycje „działa tylko na maszynie autora” z `Niedowiezienia` profili, których dotyka zdolność. Nie powtarzasz tego, co sprawdza zielony test. Lista ma zająć kilka do kilkunastu minut — to nie scenariusz testów ręcznych.
- **Wynik** wpisuje człowiek albo agent z jego słów: `Odbiór: RRRR-MM-DD — kto — przeszedł | nie przeszedł`. Agent nie odhacza pozycji, których człowiek nie sprawdził. Uwaga z odbioru → `napraw` albo ticket i status `budowa`.
- **Rodzaj `wyglad`** ma akceptację wyglądu w ticketach; odbiór jej nie powtarza, dotyczy środowiska i danych.
- **Konfiguracja** `weryfikacja.odbior`: `true` (domyślnie, także przy braku klucza — `zamknij` wymaga odbioru) albo `false`. Zamknięcie bez odbioru przy `true` tylko na wyraźną decyzję użytkownika, z notatką w mapie.

## Poprawki (bugi)

Bug nie przechodzi przez cykl pomysł → spec → tickety. Prowadzi go skill `napraw`, który przed poprawką ustala rozmiar:

| Rozmiar | Gdzie ląduje | Commit |
| --- | --- | --- |
| mały: jedna przyczyna, poprawka w jednej sesji, zachowanie ze specu się nie zmienia | bez ticketu | `fix: <opis>` |
| w zdolności, która jest w `plan`, `budowa` albo `weryfikacja` | nowy ticket tej zdolności (kolejny numer, od razu `w-toku`); zdolność w `weryfikacja` wraca do `budowa` | `<slug>#<nr>: <tytuł>` |
| duży: zmienia zachowanie ze specu, wymaga przeprojektowania albo kilku sesji | skill `pomysl` — to już nie poprawka, tylko zmiana | — |

Jeśli użytkownik oczekuje czegoś innego, niż mówi spec, to nie jest bug, tylko zmiana specu. Test odtwarzający bug zostaje w repo jako test regresji.

## Eksperymenty i prototypy

`[badanie]` rozstrzygają źródła, `[prototyp]` — sprawdzenie w praktyce. Prototyp odpowiada na pytanie; optymalizacja porównuje warianty według pomiaru. Pełna procedura: [eksperyment.md](../procedury/eksperyment.md), czytana tylko przy prowadzeniu eksperymentu. Wynik: `.ai/eksperymenty/RRRR-MM-DD-slug.md` z [szablonu](../szablony/eksperyment.md).

Grill zapisuje pytanie i proponuje plan bez kodu. Eksperyment uruchamia agent po zaakceptowaniu przez użytkownika celu, zakresu i skończonego budżetu; wcześniej udzielona zgoda wystarcza. Kod prototypu i warianty warsztatu powstają w osobnym katalogu roboczym poza repo. Eksperyment w kodzie produkcyjnym odbywa się wyłącznie w tickecie `w-toku` przez `buduj` albo w naprawie przez `napraw`, w ich zakresie i z ich kontrolami. Wynik prototypu nie zastępuje budowy, przeglądu ani akceptacji decyzji.

Pomiar odniesienia, oceniający skrypt i wymagania poprawności są ustalone przed dobieraniem wariantów. Każda iteracja ma hipotezę i dowód; nie zmienia metryki ani przykładów, żeby wygrać. Wynik końcowy sprawdzasz na przypadkach niewykorzystanych do doboru wariantów. Kończysz przy osiągnięciu celu, wyczerpaniu budżetu albo ustalonej stagnacji. Brak wiarygodnego pomiaru daje wynik nierozstrzygnięty.
