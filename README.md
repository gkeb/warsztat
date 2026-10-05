# Warsztat

Osobisty, przenośny system pracy z agentem kodującym. Łączy pomysły ze skilli Matta Pococka (grill, spec, cięcie na pionowe plasterki, TDD, handoff) i Open Mercato (konfiguracja walidacji, dyscyplina statusów) w jeden spójny zestaw: jeden kontrakt katalogów, jedno źródło prawdy dla każdej informacji i komendy po polsku.

**Mapa → decyzja → krok.** Roadmapa mówi, dokąd idzie projekt. Słownik, zasady, ADR i spec mówią, co jest prawdą. Tickety i mapa zdolności mówią, co robimy teraz. Stan żyje w `.ai/` repozytorium, nie w czacie — dzięki temu pracę można przekazać między sesjami, narzędziami i modelami.

## Instalacja

Treść skilli, kontrakt i stan projektu są wspólne dla Claude Code i Codexa. Różnią się tylko manifesty pluginu, instalacja i składnia wywołania.

Plugin instalujesz z **klonu repozytorium** jako lokalny marketplace — nie bezpośrednio z GitHuba. Dzięki temu aktualizacja to `git pull`, a `retro` może zapisywać wzorce i profile w repo warsztatu (w kopii z cache nie może). GitHub służy do synchronizacji między komputerami.

```text
git clone https://github.com/gkeb/warsztat.git C:\progs\repo
```

**Claude Code** — w czacie albo w terminalu:

```text
/plugin marketplace add C:\progs\repo          (terminal: claude plugin marketplace add C:\progs\repo)
/plugin install ai@warsztat                    (terminal: claude plugin install ai@warsztat)
```

Claude Code czyta plugin wprost z katalogu klonu — zmiany działają od następnej sesji, bez reinstalacji.

**Codex** — w terminalu:

```text
codex plugin marketplace add C:\progs\repo
codex plugin add ai@warsztat-local
```

Albo w aplikacji: `/plugins` → Warsztat → zainstaluj. Codex kopiuje plugin do `~/.codex/plugins/cache/warsztat-local/ai/<wersja>/`, więc **po każdej zmianie w repo** uruchom ponownie `codex plugin add ai@warsztat-local` — odświeża kopię (dodaje nowe pliki, usuwa skasowane). Przed pierwszym użyciem hooka otwórz `/hooks`, przejrzyj i zaakceptuj definicję; po zmianie jego konfiguracji Codex może poprosić o ponowne zaufanie. Sama instalacja pluginu hooka nie włącza.

**Tylko rozszerzenia VS Code, bez CLI w `PATH`.** Rozszerzenia mają w sobie pełne CLI i używają tej samej konfiguracji (`~/.claude`, `~/.codex`) co wersja terminalowa — plugin zainstalowany raz działa w rozszerzeniu, terminalu i wszystkich projektach. W Claude Code wystarczą komendy `/plugin` w czacie. Do komend terminalowych użyj pliku z rozszerzenia (numer wersji w ścieżce zmienia się po aktualizacji rozszerzenia):

```text
Claude Code: %USERPROFILE%\.vscode\extensions\anthropic.claude-code-<wersja>-win32-x64\resources\native-binary\claude.exe
Codex:       %USERPROFILE%\.vscode\extensions\openai.chatgpt-<wersja>-win32-x64\bin\windows-x86_64\codex.exe
```

**Wymaganie:** hook startowy uruchamia `node`, więc Node musi być w `PATH`. Bez niego skille działają, ale stan projektu nie jest wstrzykiwany na starcie sesji.

W każdym projekcie zaczynasz od `start` — szczegóły w [Scenariuszach](#scenariusze).

### Kilka komputerów i aktualizacja

Na każdym komputerze klon repo i instalacja jak wyżej. Zmiany w warsztacie — poprawki skilli, nowe wzorce i pozycje profili z `retro` — commitujesz i wypychasz z komputera, na którym powstały.

Aktualizacja na pozostałych:

```text
cd C:\progs\repo
git pull
codex plugin add ai@warsztat-local      # tylko Codex; Claude Code czyta klon wprost
```

Potem w każdym projekcie z warsztatem `start` (sekcja [Po aktualizacji pluginu](#po-aktualizacji-pluginu)) — hook sam przypomni, gdy blok w `AGENTS.md` będzie starszy niż plugin.

**Przejście ze starszej instalacji** (z innego katalogu albo innej nazwy marketplace): usuń starą rejestrację (`claude plugin marketplace remove <nazwa>`, `codex plugin marketplace remove <nazwa>`; listę pokazuje `claude plugin marketplace list` i `codex plugin marketplace list`), sklonuj repo i zainstaluj jak wyżej.

## Skille

| Skill | Claude Code | Codex | Kiedy |
| --- | --- | --- | --- |
| `start` | `/ai:start` | `$start` | raz na projekt (i po aktualizacji pluginu): rozpoznaje pusty projekt albo zastany kod, zakłada `.ai/`, `AGENTS.md`, `CLAUDE.md` |
| `poznaj` | `/ai:poznaj [ogolnie\|obszar]` | `$poznaj [ogolnie\|obszar]` | zastany kod: kod, dokumentacja, ADR i historia → mapa obszaru, słownik, zastane ADR i zasady, rozjazdy |
| `przemysl` | `/ai:przemysl [myśl\|slug]` | `$przemysl [myśl\|slug]` | luźna myśl przemyślana pytaniami sokratejskimi, bez podsuwania odpowiedzi — dojrzewa do pomysłu, decyzji albo badania, albo zostaje odrzucona |
| `pomysl` | `/ai:pomysl [produkt [plik.md]\|plik.md\|opis\|slug\|slug druga-opinia\|slug sokratejsko]` | `$pomysl [produkt [plik.md]\|plik.md\|opis\|slug\|slug druga-opinia\|slug sokratejsko]` | grill produktu albo zdolności (`funkcja` / `refaktor` / `wyglad`); z plikiem — rozbiór spisanego pomysłu; `druga-opinia` — podważenie grilla w innym modelu; `sokratejsko` — pytania zamiast rekomendacji |
| `spec` | `/ai:spec [slug]` | `$spec [slug]` | spec i Twoja akceptacja |
| `pokroj` | `/ai:pokroj [slug\|slug#NN]` | `$pokroj [slug\|slug#NN]` | podział zaakceptowanego specu na tickety; dzielenie za dużego ticketu |
| `buduj` | `/ai:buduj [slug\|slug#NN]` | `$buduj [slug\|slug#NN]` | jeden ticket: TDD, walidacja, przegląd, commit — i stop |
| `weryfikuj` | `/ai:weryfikuj [slug\|slug#NN]` | `$weryfikuj [slug\|slug#NN]` | weryfikacja krzyżowa w innym modelu: czy etap dowieziono zgodnie ze specem i planem |
| `zamknij` | `/ai:zamknij [slug] [porzuc]` | `$zamknij [slug] [porzuc]` | ukończenie (po weryfikacji) albo porzucenie zdolności; wpis w historii zmian |
| `wydaj` | `/ai:wydaj [podglad\|wersja\|tresc]` | `$wydaj [podglad\|wersja\|tresc]` | wydanie albo wdrożenie: wersja, historia zmian, publikacja po Twojej zgodzie, sprawdzenie na miejscu, rejestr wydań |
| `napraw` | `/ai:napraw [objaw]` | `$napraw [objaw]` | bug lub regresja: czerwony test → przyczyna → poprawka → test regresji |
| `przeglad` | `/ai:przeglad [slug\|slug#NN]` | `$przeglad [slug\|slug#NN]` | szybki niezależny review: zgodność z ticketem, specem, ADR i słownikiem oraz jakość kodu i zasady |
| `decyzja` | `/ai:decyzja [temat]` | `$decyzja [temat]` | twarda decyzja architektoniczna → ADR i zasady |
| `badanie` | `/ai:badanie [pytanie]` | `$badanie [pytanie]` | fakty ze źródeł pierwotnych do `.ai/badania/`, w tle |
| `gdzie` | `/ai:gdzie [slug\|tydzien]` | `$gdzie [slug\|tydzien]` | stan projektu, rozjazdy, cotygodniowy przegląd |
| `przekaz` | `/ai:przekaz` | `$przekaz` | koniec sesji albo przerwa: stan do `mapa.md` albo `.ai/sesje/` |
| `retro` | `/ai:retro [sesja]` | `$retro [sesja]` | lekcje → automatyczne kontrole, zasady, zmiany warsztatu albo wzorce wspólne dla projektów; `sesja` — rozbiór bieżącej sesji |

Siedem skilli to bramki, które uruchamiasz tylko Ty: `start`, `spec`, `pokroj`, `buduj`, `weryfikuj`, `zamknij`, `wydaj`. W Claude Code pilnuje tego `disable-model-invocation`, w Codexie `agents/openai.yaml`. Pozostałe agent może zaproponować albo uruchomić, gdy rozmowa tego wymaga.

Pytania z wyborem używają natywnego interfejsu, jeśli agent go ma (w Claude Code: `AskUserQuestion`); bez niego skill pyta tekstowo z ponumerowanymi opcjami. Rekomendacja jest zawsze pierwsza. Pytania otwarte pozostają tekstowe. Szczegóły: sekcja `Jak pytać` w kontrakcie.

## Cykl pracy

```text
(przemysl) → pomysl → grill → spec → plan → budowa ⇄ weryfikacja → gotowe | porzucone
                       pomysl   spec   pokroj  buduj ×N   weryfikuj      zamknij
                       + druga-opinia      ↑ akceptujesz Ty
                         (inny model)                     ↑ inny model
```

Status każdej zdolności żyje tylko w `.ai/ROADMAP.md`. Następny krok w plikach `.ai/` zapisuje nazwę skilla bez składni agenta (np. `skill buduj platnosci`), więc projekt nie zależy od narzędzia. Starsze mapy z `/ai:...` nadal są czytelne; aktualizuj je przy najbliższej zmianie danego kroku.

## Język → zachowanie → test (DDD, BDD, TDD)

Cykl łączy trzy podejścia, każde w lekkiej wersji, każde na swoim etapie:

```text
DDD — język i granice     BDD — zachowanie            TDD — implementacja
pomysl, SLOWNIK.md    →   spec: scenariusze S1, S2…  →  buduj: test akceptacyjny S1 → pętla TDD
```

- **Język (DDD strategiczne).** `SLOWNIK.md` to wspólny język kodu, specu i rozmowy. Przy pojęciach zapisujemy niezmienniki domeny (`_Zawsze:_ wystawiona faktura się nie zmienia`). Gdy to samo słowo zaczyna znaczyć co innego w dwóch częściach systemu, słownik dzieli się na konteksty, a ich granice stają się decyzjami (ADR) i granicami modułów w `ZASADY.md`. Mały projekt ma jeden kontekst i nic z tym nie robi. Agregaty, encje i repozytoria (DDD taktyczne) nie są domyślne — projekt może je wybrać przez `decyzja`.
- **Zachowanie (BDD).** Grill dopytuje o przykłady na granicach reguł („499,99 zł — jest rabat?”). Spec zapisuje scenariusze ze stałymi numerami w formie `S3. Zakładając … gdy … wtedy …`, z tabelą przykładów. Bez Gherkina i Cucumbera — chyba że projekt wybierze je przez ADR.
- **Test (TDD w podwójnej pętli).** Ticket wskazuje scenariusze (`scenariusze: ["S3"]`). `buduj` zaczyna od czerwonego testu akceptacyjnego scenariusza z numerem w nazwie, a potem prowadzi zwykłe TDD, aż ten test przejdzie. `przeglad` i `weryfikuj` szukają testu po numerze (`grep S3`) i sprawdzają, czy naprawdę ćwiczy scenariusz z jego przykładami.

Komendy się nie zmieniają. Starsze specy z numeracją `1.`, `2.` są czytane jako `S1`, `S2`.

## Scenariusze

### 1. Nowy projekt — bez kodu

Najpierw ustalamy, co budujemy i na czym, dopiero potem piszemy kod.

1. `start` — rozpoznaje pusty projekt, zakłada `.ai/`. Walidacja zostaje pusta, bo nie ma jeszcze czego sprawdzać.
2. `pomysl produkt` — grill całego produktu: cel (3–5 zdań na górze roadmapy), lista 5–10 zdolności, słownik, decyzje fundamentowe. Masz pomysł spisany w pliku → `pomysl produkt POMYSL.md` (niżej).
3. `decyzja` — po jednym ADR na każdą twardą decyzję: stos, dane, uwierzytelnianie, wdrażanie, architektura. Brak faktów → `badanie`. Z decyzji powstają pierwsze zasady w `.ai/ZASADY.md`.
4. Zdolność `szkielet`: `spec szkielet` → `pokroj` → `buduj` → `weryfikuj` (inny model) → `zamknij`. Wynik: jedna działająca ścieżka od wejścia do wyjścia, testy i walidacja w `.ai/warsztat.json` — razem z automatami pilnującymi twardych zasad architektury.
5. Od teraz zwykły cykl dla kolejnych zdolności z roadmapy.

### 2. Zastany kod — rozbudowa

Kod ma historię, często też dokumentację i ADR-y. Poznajemy je, ale nie przenosimy.

1. `start` — inwentaryzacja: stos, dokumentacja, katalog ADR. Pyta, czy zastane ADR-y zostają na miejscu (rekomendowane — nowe piszemy w ich formacie i numeracji), czy je przenieść. Uruchamia walidację; jeśli już jest czerwona, zapisuje znane błędy jako punkt odniesienia — od tej pory liczy się „nie gorzej”.
2. `poznaj ogolnie` — jak uruchomić, jakie są obszary, na ile dokumentacja jest aktualna. Wynik w `AGENTS.md` → `## Projekt` i `.ai/zrodla.md`.
3. Przed pracą w konkretnym miejscu: `poznaj <obszar>` — kod, dokumenty, ADR-y i historia gita tego obszaru. Wynik: `.ai/obszary/<slug>.md`, pojęcia w słowniku, ADR-y `zastana` dla ograniczeń bez dokumentacji, zasady `zastana` w `.ai/ZASADY.md` (czego kod faktycznie się trzyma), rozjazdy dokumentacja ↔ kod do Twojej decyzji.
4. Zwykły cykl: `pomysl` (albo `pomysl <plik.md>` ze spisanym pomysłem na funkcję) → `pomysl druga-opinia` (inny model) → `spec` → `pokroj` → `buduj` ×N → `weryfikuj` (inny model) → `zamknij`. Przy zmianie nieprzetestowanego kodu `buduj` najpierw przypina jego obecne zachowanie testem charakteryzującym.

### 3. Refaktoryzacja

Zmiana struktury bez zmiany zachowania — jako osobna zdolność rodzaju `refaktor`.

1. `poznaj <obszar>`, jeśli obszar nie ma jeszcze mapy.
2. `pomysl` — rodzaj `refaktor`: co boli, stan docelowy, niezmienniki (co nie może się zmienić), strategia małych kroków, kryterium końca. Potem `pomysl <slug> druga-opinia` w innym modelu.
3. `decyzja` — jeśli refaktoryzacja wdraża decyzję architektoniczną (nowa granica modułu, zmiana przechowywania). Zasady, które się zmienią, są częścią stanu docelowego.
4. `spec` — szablon refaktoryzacji: niezmienniki zamiast scenariuszy, siatka bezpieczeństwa, strategia.
5. `pokroj` — pierwszy ticket: testy charakteryzujące niezmienniki. Kolejne: kroki, po których wszystko działa i da się wdrożyć. Ostatni: usunięcie starego kodu.
6. `buduj` — testy zielone przed i po każdym kroku. Czerwony test niezmiennika → cofnij krok, nigdy nie poprawiaj testu.
7. `weryfikuj` w innym modelu — każda zmiana zachowania jest blokująca; niezmienniki i kryterium końca. `zamknij` — `ZASADY.md` odpowiada stanowi docelowemu, wyjątki przypisane do refaktoru usunięte.

Drobna poprawa struktury wewnątrz ticketu nie potrzebuje tego procesu — to zwykły krok „refaktoryzuj na zielonym” w `buduj`.

### 4. Bug

`napraw` — czerwony sygnał odtwarzający bug → zawężenie → hipoteza → poprawka przyczyny → test regresji. Skill sam ustala, czy wystarczy commit `fix:`, czy potrzebny jest ticket, czy to w ogóle zmiana specu. Obalone hipotezy i problemy bez rozwiązania trafiają do `.ai/proby.md`.

## Spisany pomysł w pliku

Zamiast odpowiadać na pytania od zera, możesz spisać w spokoju, o co Ci chodzi — w dowolnym pliku Markdown w repozytorium (np. `POMYSL.md`) — i podać go skillowi `pomysl`:

- `pomysl produkt POMYSL.md` — plik opisuje cały projekt: cel, funkcje, technologię, podejście;
- `pomysl docs/platnosci.md` — plik opisuje jedną funkcję.

`start` sam szuka takich plików (`POMYSL*.md`, `pomysl*.md`, `brief*.md`, `koncepcja*.md`, `wizja*.md`, `IDEA*.md`, także w `docs/`) i pyta, czy od nich zacząć. W pustym projekcie zada to pytanie także wtedy, gdy niczego nie znajdzie.

Jak to przebiega:

1. **Rozbiór.** Agent przypisuje każdy fragment do miejsca: cel → roadmapa, funkcje → zdolności, szczegóły zachowania → decyzje w mapie, wybory techniczne → kandydaci na ADR, podejście do kodu → `ZASADY.md`, pojęcia → słownik, „może kiedyś” → Mgła. Przy okazji wyłapuje sprzeczności (w pliku i z tym, co już jest w projekcie), niejasności („szybko” — czyli ile?) i braki (błędy, uprawnienia, skala, poza zakresem).
2. **Tabela rozbioru — zanim cokolwiek zapisze.** Widzisz, który fragment dokąd trafi i co jest niejasne. Zapisuje tylko to, co potwierdzisz.
3. **Grill tylko luk.** Nie odpowiadasz drugi raz na to, co napisałeś — pytania dotyczą sprzeczności, niejasności i braków.
4. **Ślad.** Plik zostaje nietknięty, a każdy wyciągnięty wpis ma odnośnik `Źródło: POMYSL.md § Płatności`. `spec` sprawdza potem, czy żadne Twoje wymaganie nie zginęło po drodze.

Plik może żyć: dopisz coś po tygodniu i uruchom to samo polecenie — agent porówna go z wersją z ostatniego rozbioru i rozbierze tylko zmiany. Rozbierana wersja musi być w gicie, żeby było z czym porównywać: gdy plik nie jest zacommitowany, agent sam proponuje commit tego jednego pliku i po Twojej zgodzie kontynuuje. W projekcie bez gita rozbiór też działa, tylko każde kolejne uruchomienie jest pełnym rozbiorem porównanym z tym, co już zapisano. `gdzie` przypomina, gdy plik zmienił się albo został usunięty od rozbioru.

## Dwa modele — jeden tworzy, drugi podważa

Każdy model uczył się na innych danych i inaczej podchodzi do tego samego problemu. Ten, który coś stworzył, ma skłonność do potwierdzania własnych założeń. Dlatego w dwóch kluczowych miejscach spotykają się dwa modele, a różnice rozstrzygasz Ty:

```text
grill (model A) → druga opinia (model B) → spec → plan → budowa (A) → weryfikacja (B) → gotowe
```

Modele porównujemy niezależnie od narzędzia: ten sam model uruchomiony w Claude Code i Codexie nie daje niezależnej opinii. Kierunek nie ma znaczenia — równie dobrze budujesz w Codexie, a weryfikujesz w Claude Code. Przekazanie odbywa się przez pliki `.ai/` i git.

**Przy koncepcji — `pomysl <slug> druga-opinia`.** Zwykła kontynuacja grilla w drugim modelu niewiele daje, bo przyjmuje ustalenia pierwszego. Druga opinia najpierw buduje własne zdanie z problemu, linii roadmapy, rodzaju zdolności, słownika, `ZASADY.md`, powiązanych ADR-ów i kodu — bez czytania lekcji, decyzji ani otwartych pytań — a dopiero potem porównuje. Wynik: zakwestionowane decyzje, pytania, których nikt nie zadał, nierozważone alternatywy i niejasne pojęcia. Grill dotyczy już tylko tych różnic, więc nie odpowiadasz dwa razy na to samo. Ślepota analizy jest częściowa, bo słownik, `ZASADY.md` i ADR-y mogą zawierać wnioski z wcześniejszego grilla. Każda decyzja ma zapisane źródło, a podtrzymane mimo zastrzeżeń — argument. `spec` przypomina o drugiej opinii przed akceptacją, a hook — gdy grill jest skończony, a opinii brak.

**Przy dowiezieniu — `weryfikuj`:**

1. `buduj` ×N w jednym modelu. Każdy ticket zapisuje, kto go zbudował (`budowal`). Po ostatnim tickecie status zdolności zmienia się na `weryfikacja`, a hook przypomina, że czas przełączyć model.
2. `weryfikuj` w drugim modelu. Sprawdza każdy scenariusz specu, kryterium planu i zasady twarde, a przede wszystkim niedowiezienia: zaślepki, TODO, tylko szczęśliwą ścieżkę, niepodpięty kod, brakujące migracje i konfigurację, testy bez asercji. Niczego nie poprawia — zapisuje rundę w `zdolnosci/<slug>/weryfikacja.md`.
3. Runda nie przeszła → uwagi blokujące stają się ticketami, status wraca do `budowa`, wracasz do kroku 1. Uwagi sporne rozstrzygasz Ty.
4. Runda przeszła → `zamknij` → `gotowe`.

Szybki `przeglad` po każdym tickecie zostaje — łapie drobiazgi tanio, zanim dojdzie do weryfikacji krzyżowej. Nie zastępuje jej: recenzenci w Claude Code to model z tej samej rodziny.

## Zasady projektu — czego kod trzyma się przez cały okres życia

ADR mówi, dlaczego kiedyś tak zdecydowaliśmy. `.ai/ZASADY.md` mówi, jak ma być teraz: architektura (warstwy, kierunek zależności, granice modułów), wzorce, stanowiska kodu, strategia testów, wymagania niefunkcjonalne. Tylko to, co jest decyzją projektu — ogólnych zasad czystego kodu nie przepisujemy.

- Każda zasada ma stały numer (`Z03`), siłę (`twarda` blokuje przegląd i weryfikację, `preferencja` nie), sposób egzekwowania (`automat` / `przegląd` / `brak`), link do ADR albo — gdy go nie ma — do źródła zasady, oraz jawne wyjątki.
- Najlepsza zasada to taka, której pilnuje automat w walidacji: kierunek zależności i granice modułów sprawdzają `dependency-cruiser` albo `eslint-plugin-boundaries` (TypeScript) i `import-linter` (Python). Zasada twarda bez automatu to kandydat dla `retro`.
- Piszą: `start` (pusty plik), `pomysl produkt` (pierwsze zasady), `poznaj` (zasady zastane z kodu), `decyzja` (nowy ADR → zasada), `retro` (lekcja → zasada → automat), `zamknij` (wyjątki i stan docelowy refaktoru). Pilnują: `pomysl`, `spec`, `buduj`, `przeglad`, `weryfikuj`. Hook pokazuje zasady twarde na starcie każdej sesji.
- Konwencje kodu żyją tylko tu. `AGENTS.md` opisuje projekt i zachowanie agenta, a do zasad odsyła.
- Zasada, której kod masowo nie przestrzega, jest gorsza niż brak zasady — agent uczy się z kodu. Taki rozjazd rozstrzygasz Ty: refaktor albo zmiana zasady.

## Próby — nie powtarzamy ślepych uliczek

Każde podejście, które nie zadziałało, każda odłożona ścieżka i każdy nierozwiązany problem trafia od razu do `.ai/proby.md`: status (`nie-dziala` z dowodem, `odlozone`, `nierozwiazane`), warunki, wynik, co wybraliśmy zamiast tego i kiedy warto wrócić. Agent przeszukuje ten katalog, zanim zaproponuje podejście, a hook pokazuje nierozwiązane problemy na starcie sesji. Odrzucenie na papierze, bez próby ani weryfikacji w źródle, zostaje w ADR → „Rozważane alternatywy”.

## Lekcje i wzorce — nie popełniamy tego samego błędu

Każdy problem ma jedną drogę:

```text
luka ──→ badanie albo próba ──→ lekcja ──→ retro ──→ automat | zasada | zmiana warsztatu | wzorzec
(proby.md: nierozwiazane,       (lekcje.md)
 mapa: [badanie])
```

**Lekcja** (`.ai/lekcje.md`) to rozwiązany problem w jednej linijce: co założyliśmy, co okazało się prawdą, jak robimy teraz. Agent zapisuje ją od razu, gdy tylko założenie okaże się fałszywe — niezależnie od tego, czy wykryłeś to Ty, test, błąd w działaniu, badanie czy przegląd. Przegląd oznacza takie uwagi jako `[założenie]`. Ta sama przyczyna nie tworzy nowej linijki, tylko dopisuje wystąpienie do istniejącej. Lekcja z dwoma wystąpieniami to wzorzec — hook pokazuje ją na starcie sesji i podpowiada `retro`.

**Wzorzec** (`plugins/ai/wzorce/`) to lekcja uogólniona tak, żeby rozpoznać ją w innym projekcie, gdzie ten sam problem wygląda inaczej. Każdy wzorzec oddziela rozpoznanie od rozwiązania:

- **Sygnały** — co widać, zanim znasz przyczynę; po nich szuka `napraw`;
- **Warunki** i **Nie dotyczy** — kiedy pasuje, a kiedy podobny przypadek ma inną przyczynę;
- **Mechanizm** i **Rozwiązanie** — dlaczego tak się dzieje i jaka zasada pomaga (bez kodu);
- **Warianty** i **Wystąpienia** — czym różniły się przypadki w kolejnych projektach.

Wzorce tworzy i rozwija tylko `retro`, a uogólnienie zatwierdzasz Ty. Status rośnie z dowodami: `kandydat` (jeden projekt) → `potwierdzony` (dwa lub więcej). `napraw`, `buduj`, `pomysl` i `decyzja` przeszukują indeks wzorców i przywołują trafienie z oceną dopasowania. Wynik — pasował albo czym się różnił — wraca do lekcji projektu, a `retro` przenosi go do wzorca. Tak wzorzec uczy się z każdego użycia. We wzorcach nie ma kodu ani danych projektów.

## Przemyślenia — zanim myśl stanie się pomysłem

Czasem masz myśl o projekcie, ale zanim powstanie z niej pomysł, spec albo decyzja, trzeba ją przemyśleć: czy problem w ogóle istnieje, co jest celem, na jakich założeniach stoi. Do tego służy `przemysl`: agent prowadzi **pytania sokratejskie** i nie podsuwa odpowiedzi. Pyta o doprecyzowanie, założenia, dowody, inne perspektywy, konsekwencje i o to, czy pytanie jest właściwe. Nazywa sprzeczności, a co kilka pytań podsumowuje, do czego doszliśmy. Swoje zdanie podaje tylko na prośbę, wyraźnie oznaczone.

Każda myśl ma plik w `.ai/przemyslenia/` i może trwać przez kilka sesji. Kończy się jednym z wyników:

- **dojrzałe** → zdolność w roadmapie, decyzja, badanie, zmiana celu, zasada albo Mgła;
- **odrzucone** → z powodem; gdy ta sama myśl wróci, agent pokaże wniosek i zapyta, co się zmieniło;
- **odłożone** → z warunkiem powrotu.

Ten sam sposób prowadzenia działa w grillu konkretnej zdolności: `pomysl <slug> sokratejsko`. Można też przełączyć się na niego w trakcie zwykłego grilla przy jednym temacie („pomóż mi to przemyśleć”), a wrócić słowami „wystarczy, zarekomenduj”. Hook pokazuje otwarte przemyślenia na starcie sesji, a `gdzie tydzien` pyta, co z tymi, które leżą.

## Klasa aplikacji — profile, wygląd, wydanie, pielęgnacja

Proces jest wspólny, ale decyzje zależą od tego, co budujesz. Narzędzie CLI ma kody wyjścia, stdout kontra stderr i instalację. Strona w Astro ma tryb renderowania, SEO, hosting, dostępność i treści, które ktoś edytuje. **Profil** to lista decyzji dla klasy aplikacji, nie podręcznik: dzięki niemu nic nie umyka przypadkiem.

- **Profile** w `plugins/ai/profile/`: `przekrojowe` (zawsze: środowisko, testy, CI, sekrety, RODO, błędy, logi, wersjonowanie, historia zmian, wdrożenie, wycofanie, pielęgnacja, licencja), `cli` i `strona`. Każdy ma też sekcje: doświadczenie (UX), testy akceptacyjne (jak testować publiczny interfejs), typowe niedowiezienia, wydanie i pielęgnację.
- **Rozstrzygnięcia** trafiają do `.ai/profil.md`: każda pozycja → ADR, zasada, `pominięte: powód`, `później` albo `otwarte`. Mały pomocnik CLI na własny użytek może pominąć połowę listy — byle świadomie. Przechodzi ją `pomysl produkt` (nowy projekt) albo `poznaj` (zastany kod, z tym, co już rozstrzygnął). `gdzie tydzien` pokazuje, co otwarte.
- **Wygląd i UX** — rodzaj zdolności `wyglad`: przepływy jako scenariusze, stany (pusty, błąd, sukces), szerokości kontrolne, dostępność. Logika idzie przez TDD, a reszta przez kontrole automatyczne (axe, linki, Lighthouse), zrzuty ekranu i **Twoją akceptację** wpisaną w tickecie.
- **Wydanie** — skill `wydaj`, uruchamiany tylko przez Ciebie: co wchodzi od ostatniego wydania, wersja, historia zmian, build, podgląd, publikacja albo wdrożenie (każda komenda pokazana przed uruchomieniem), sprawdzenie na produkcji, wycofanie, gdy nie przeszło. Historia zmian dla użytkowników (`CHANGELOG.md`, sekcja `Niewydane`) rośnie na bieżąco — dopisują ją `zamknij` i `napraw`. Rejestr `.ai/wydania.md` mówi, co i kiedy trafiło na produkcję, także przy samych zmianach treści.
- **Pielęgnacja** — `gdzie tydzien` uruchamia komendy z `pielegnacja` i przechodzi listę z profilu: zależności, podatności, martwe linki, Lighthouse, domena i certyfikat, formularze, stare treści. Znalezisko staje się poprawką, zdolnością albo wpisem w Mgle — decydujesz Ty.
- **Profile się uczą** — decyzja, której zabrakło, trafia przez `retro` do profilu jako nowa pozycja.

## Rytm pracy

- **Start sesji** — hook wstrzykuje stan: sekcję Teraz z roadmapy, liczniki ticketów, następny krok, stan przerwanej sesji, przerwaną pracę poza zdolnościami, nierozwiązane próby, zasady twarde i przypomnienia (druga opinia, weryfikacja, aktualizacja bloku w `AGENTS.md`). W projektach bez `.ai/` hook milczy.
- **Po przerwie** — `gdzie`.
- **Jedna sesja = jeden ticket.** Kolejny ticket w świeżej sesji.
- **Koniec sesji** — `przekaz`, jeśli coś zostało w połowie.
- **Na koniec dłuższej albo trudnej sesji** — `retro sesja`: rozbiór według listy (pojęcia, poprawki, decyzje, brakujący kontekst, luki, wzorce, preferencje, uproszczenia, pominięte kroki, ślepe uliczki). Każde znalezisko trafia do swojego pliku, a nie do jednej notatki.
- **Po zamknięciu zdolności** — `retro`, jeśli coś się powtarzało.
- **Raz w tygodniu** — `gdzie tydzien`: priorytety, porzucenia, Mgła, rozjazdy, nierozwiązane próby, zasady bez automatu, pielęgnacja (zależności, linki, Lighthouse, wygasające domeny) i zmiany czekające na wydanie.
- **Gdy coś ma trafić do ludzi** — `wydaj`.
- **W dowolnym momencie** — `decyzja` dla twardych decyzji, `badanie` dla faktów, `przeglad` dla review.

## Dyscyplina

- W Teraz najwyżej 1 zdolność w `budowa` / `weryfikacja` i najwyżej 1 w `grill` / `spec` / `plan`.
- Grill nie pisze kodu. Budowa nie zmienia specu ani kolejności roadmapy. Weryfikator nie poprawia kodu.
- Kod trzyma się `ZASADY.md`. Zasady twardej nie łamie się bez wpisanego wyjątku albo zmiany zasady.
- Ticket, który nie mieści się w sesji, wraca do krojenia.
- Stan przenosi `.ai/` i hook, nie czat.
- Priorytety i kolejność roadmapy ustalasz Ty; agent zmienia statusy.

Pełny kontrakt — układ plików, statusy, formaty i kto co zmienia — jest w [plugins/ai/KONTRAKT.md](plugins/ai/KONTRAKT.md).

## Co powstaje w projekcie

```text
AGENTS.md                 # ## Projekt (uruchamianie, mapa kodu, pułapki) + blok warsztatu
CLAUDE.md                 # @AGENTS.md
.ai/
  warsztat.json           # konfiguracja (niżej)
  ROADMAP.md              # cel produktu i status każdej zdolności
  SLOWNIK.md              # słownik domeny
  ZASADY.md               # zasady projektu
  lekcje.md               # rozwiązane problemy z licznikiem wystąpień → retro
  proby.md                # ślepe uliczki, odłożone, nierozwiązane
  zrodla.md               # pliki z Twoim zamiarem, zastana dokumentacja, rozjazdy z kodem
  profil.md               # rozstrzygnięcia list decyzji z profili klasy aplikacji
  wydania.md              # rejestr wydań i wdrożeń
  decyzje/                # ADR (albo zastany katalog wskazany w konfiguracji)
  obszary/<slug>.md       # mapy obszarów kodu
  badania/                # wyniki skilla badanie
  przemyslenia/           # myśli przemyślane pytaniami sokratejskimi: wniosek, dokąd trafiły albo dlaczego odrzucone
  sesje/                  # przerwana praca poza zdolnościami
  zdolnosci/<slug>/
    mapa.md               # problem, rodzaj, kto grillował, następny krok, pytania, decyzje, plasterki, stan sesji
    spec.md               # kontrakt zdolności
    weryfikacja.md        # rundy weryfikacji krzyżowej
    tickety/NN-slug.md    # pionowe plasterki
```

Pliki pomocnicze (`zrodla.md`, `proby.md`, `obszary/`, `badania/`, `sesje/`) powstają dopiero wtedy, gdy są potrzebne.

### AGENTS.md i CLAUDE.md

Instrukcje projektu żyją w jednym pliku — `AGENTS.md` — bo czytają go wszystkie agenty. `CLAUDE.md` zawiera tylko import `@AGENTS.md` (i ewentualnie uwagi specyficzne dla Claude Code pod nim). Import jest konieczny: Claude Code czyta `AGENTS.md` sam tylko wtedy, gdy `CLAUDE.md` nie istnieje, a zwykłe zdanie „przeczytaj AGENTS.md” nie gwarantuje, że to zrobi. Blok warsztatu w `AGENTS.md` (między znacznikami `warsztat:start v<wersja>` i `warsztat:koniec`) należy do pluginu — własne reguły dopisuj poza nim.

### Konfiguracja — `.ai/warsztat.json`

| Klucz | Znaczenie |
| --- | --- |
| `walidacja` | komendy, które muszą przejść przed zamknięciem ticketu (testy, typy, lint, automaty zasad) |
| `odniesienie.data`, `odniesienie.znane` | punkt odniesienia w zastanym kodzie: znane błędy walidacji; przechodzi, gdy nie ma nowych, a lista może tylko maleć |
| `weryfikacja.wymagana` | czy etap wymaga weryfikacji krzyżowej przed zamknięciem (domyślnie `true`) |
| `weryfikacja.innyModel` | czy weryfikacja i druga opinia muszą pochodzić od innego modelu niż autor (domyślnie `true`) |
| `weryfikacja.drugaOpinia` | `zalecana` (domyślnie), `wymagana` albo `wylaczona` |
| `sciezki.decyzje` | katalog ADR — domyślnie `.ai/decyzje`, w zastanym projekcie może wskazywać istniejący |
| `profile` | klasy aplikacji: `przekrojowe` zawsze, plus np. `cli`, `strona` |
| `wydanie.wersjonowanie`, `wydanie.changelog` | `semver` / `data` / `brak`; ścieżka historii zmian dla użytkowników albo `null` |
| `wydanie.githubRelease` | `true` — przy każdej wersji GitHub Release z treścią jej sekcji w `CHANGELOG.md` |
| `wydanie.komendy`, `wydanie.sprawdzenie` | build, publikacja, wdrożenie; kontrole po wydaniu — uruchamia `wydaj` po Twojej zgodzie |
| `pielegnacja` | komendy tylko do odczytu dla przeglądu tygodniowego: przestarzałe zależności, audyt, martwe linki, Lighthouse |
| `modele.claude.*`, `modele.codex.*` | model subagentów dla `przeglad` i `badanie`; `null` = domyślny |
| `tracker`, `github` | na razie `pliki`; miejsce na przyszłą synchronizację z GitHubem |

### Subagenci

`przeglad` i `badanie` — a przy dużym zakresie także `poznaj` i `weryfikuj` — mogą oddawać pracę subagentom, czyli świeżym kontekstom bez historii rozmowy. W Claude Code plugin ma gotowych subagentów (`recenzent-zgodnosci`, `recenzent-jakosci`, `badacz`) z modelem `sonnet`. Codex dostaje wspólny plik instrukcji roli; jego lokalne klienty obsługują jawny wybór modelu subagenta, a skill może przekazać tam wartość z `modele.codex.*`. Ten JSON czyta skill — Codex sam nie traktuje go jako konfiguracji. Bez jawnego wyboru subagent dziedziczy model rodzica. Bez subagentów skill wykonuje role sam i oznacza przegląd jako nieniezależny. Zobacz [dokumentację subagentów Codexa](https://developers.openai.com/codex/multi-agent).

## Po aktualizacji pluginu

Uruchom `start` ponownie w projekcie. Nie zakłada niczego od nowa: wymienia blok warsztatu w `AGENTS.md` na wersję z pluginu (pokazując różnice), dopisuje nowe klucze do `.ai/warsztat.json`, sprawdza import w `CLAUDE.md` i wymienia nowe elementy kontraktu. Hook na starcie sesji sam przypomina, gdy blok jest starszy niż plugin.

## Struktura tego repo

```text
.claude-plugin/marketplace.json       # lokalny marketplace Claude Code
.agents/plugins/marketplace.json      # lokalny marketplace Codex
plugins/ai/
  .claude-plugin/plugin.json          # manifest Claude Code
  plugin.json                         # przenośny manifest Codex / Agent Plugins
  KONTRAKT.md                         # jedno źródło prawdy o formatach
  skills/<nazwa>/SKILL.md             # siedemnaście wspólnych workflowów
  skills/<nazwa>/agents/openai.yaml   # polityka jawnego wywołania w Codexie
  skills/przeglad/recenzent-*.md      # instrukcje ról recenzentów (wspólne dla obu agentów)
  skills/badanie/badacz.md            # instrukcje roli badacza
  agents/*.md                         # subagenci Claude Code: model i narzędzia, treść z plików ról
  szablony/                           # szablony plików .ai/ i sekcji AGENTS.md
  wzorce/                             # wzorce wspólne dla projektów: INDEKS.md + plik na wzorzec (pisze retro)
  profile/                            # listy decyzji klas aplikacji: przekrojowe, cli, strona (rozwija retro)
  hooks/hooks.json                    # SessionStart → scripts/stan.mjs
  scripts/stan.mjs                    # zbiera „gdzie jesteśmy” (Node, bez zależności)
```

Skille współdzielą rdzeń formatu Agent Skills (`name`, `description` i instrukcje); ograniczenia jawnego wywołania są ustawione osobno dla Claude i Codexa. `argument-hint` pokazuje podpowiedź argumentów w Claude Code. Aktualny parser `SKILL.md` Codexa odczytuje `name`, `description` i `metadata.short-description`, a pozostałe pola frontmattera pomija — więc hint nie pojawia się w Codexie. `disable-model-invocation` również nie ustawia polityki Codexa; robi to `agents/openai.yaml` → `policy.allow_implicit_invocation`. Zobacz [parser Codexa](https://github.com/openai/codex/blob/main/codex-rs/skills/src/parser.rs) i [dokumentację skilli Codexa](https://developers.openai.com/codex/skills). Hook odczytuje `cwd` z wejścia zdarzenia, więc działa, gdy Codex uruchomi go z katalogu pluginu lub innego katalogu roboczego.

**Frontmatter:** opis skilla z dwukropkiem i spacją w środku (np. „decyduje: przeszła”) psuje YAML — skill ładuje się wtedy bez metadanych, w tym bez blokady samodzielnego wywołania. Przed commitem uruchom `claude plugin validate plugins/ai`.

Przy zmianie wersji podbij ją w obu manifestach: `plugins/ai/plugin.json` i `plugins/ai/.claude-plugin/plugin.json`. Znacznik bloku w `AGENTS.md` projektów bierze wersję z manifestu sam.

Chcesz zmienić sposób pracy? Edytujesz skill albo kontrakt tutaj i działa wszędzie. System ma pasować do Ciebie, nie odwrotnie.

## Na później

- **GitHub:** `"tracker": "github"` w `warsztat.json`, pole `github` w tickecie i skill synchronizujący tickety z Issues i PR.
- **Tryb autonomiczny** dla nudnych ticketów: `buduj` w pętli po kolejce `plan` z commitem po każdym tickecie (wzorzec `om-auto-*` z Mercato).
- Ewentualnie skill `prototyp` dla pytań `[prototyp]`, które wymagają eksperymentu.
- Codex: opcjonalne definicje projektowych agentów `.codex/agents/*.toml`, jeśli potrzebne będą trwałe nazwane role lub ich własne ustawienia. Nie są częścią zasobów deklarowanych przez [format przenośnego pluginu](https://developers.openai.com/plugins/build/plugins); obecne skille mogą przekazywać role przez wspólne pliki instrukcji.
