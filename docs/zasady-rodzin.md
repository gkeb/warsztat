---
title: Zasady rodzin pluginów — rdzeń i powstawanie
created: 2026-10-20
description: Rdzeń zasad wspólny dla każdej rodziny pluginów (programowanie, marketing, firma) i sposób zakładania nowej rodziny od domeny, nie od komend.
---

# Zasady rodzin pluginów

Warsztat (`plugins/ai`) jest pierwszą rodziną pluginów: obsługuje pracę nad produktem i kodem. Kolejne rodziny — marketing, prowadzenie firmy — mają inne komendy, inne rodzaje dokumentów i inne zasady przechowywania wiedzy. Z warsztatu przechodzi do nich tylko **rdzeń**: zasady, które nie zależą od domeny, i **sposób powstania**, czyli kolejność, w jakiej rodzinę się projektuje.

Ten dokument jest punktem wyjścia przy zakładaniu nowej rodziny. Nie jest kontraktem żadnego pluginu — każda rodzina pisze własny. Przykłady z warsztatu pokazują, jak dana zasada wygląda w jednej domenie; nie są wzorem do skopiowania.

## Rdzeń

Każda zasada ma trzy części: co mówi, dlaczego, i co nowa rodzina musi sama rozstrzygnąć.

### 1. Stan żyje w plikach, nie w czacie

Każdą pracę da się przerwać i podjąć w innej sesji, innym narzędziu albo innym modelem — bez czytania rozmowy. Czat jest ulotny, kompaktowany i niedostępny dla następnej sesji.

- **Warsztat:** `.ai/` w repozytorium projektu, hook stanu na starcie sesji, skill `przekaz`.
- **Rozstrzygnij:** gdzie mieszka stan tej domeny. Nie musi to być repozytorium produktu — stan firmy jest ponad produktami.

### 2. Jedno źródło prawdy, z właścicielem

Każda informacja ma jedno miejsce i wiadomo, kto ją zmienia. Inne pliki linkują, nie kopiują. Gdy dwa pliki mówią co innego, wygrywa właściwe miejsce, a rozjazd zgłasza się i naprawia za zgodą — nie po cichu.

- **Warsztat:** tabela „Jedno źródło prawdy” w [kontrakt/stan.md](../plugins/ai/kontrakt/stan.md): informacja → jedyne miejsce → kto zmienia.
- **Rozstrzygnij:** taką tabelę dla domeny, zanim powstanie pierwsza komenda. To ona jest kontraktem; komendy z niej wynikają.

### 3. Trzy poziomy: kierunek, prawda, bieżący krok

Osobno: dokąd się idzie, co jest ustalone, co robi się teraz. Nigdy w jednym pliku — plan miesza się wtedy ze stanem, a bieżące notatki zamazują ustalenia.

- **Warsztat:** roadmapa (kierunek); słownik, ADR, zasady, spec (prawda); tickety i mapa zdolności (krok).
- **Rozstrzygnij:** co wypełnia każdy poziom w tej domenie i w jakim rytmie się zmienia. Kod idzie ticket po tickecie; firma żyje w cyklach (miesiąc, kwartał); marketing w kampaniach.

### 4. Człowiek ustala kierunek i prawdę, agent prowadzi stan

Priorytety, kolejność, cele i zmiana ustaleń należą do człowieka. Agent zmienia statusy, zapisuje wyniki i proponuje. Działania nieodwracalne albo wychodzące na zewnątrz — tylko świadomie uruchomione przez człowieka, po pokazaniu, co się stanie.

- **Warsztat:** reguły 6 i 11 w [KONTRAKT.md](../plugins/ai/KONTRAKT.md); skill `wydaj` uruchamiany tylko przez człowieka.
- **Rozstrzygnij:** które działania są w tej domenie nieodwracalne lub publiczne (publikacja posta, wysłanie oferty, płatność, podpis) i jak wygląda bramka przed nimi.

### 5. Decyzje trudne do odwrócenia zapisuje się z uzasadnieniem

Z kontekstem, rozważanymi alternatywami i konsekwencjami. Za pół roku nikt nie pamięta, dlaczego — a bez tego decyzję albo się łamie, albo powtarza dyskusję.

- **Warsztat:** ADR w `.ai/decyzje/`, skill `decyzja`.
- **Rozstrzygnij:** jakie decyzje w tej domenie są trudne do odwrócenia (forma prawna, cennik, pozycjonowanie marki) i jaki kształt zapisu im służy. Forma ADR-a z kodu nie musi pasować.

### 6. Fakty z zewnątrz tylko ze źródeł pierwotnych

Zewnętrzny fakt — limit API, przepis, stawka podatku, zasada platformy — ustala się w źródle pierwotnym i zapisuje z cytatem. Pamięć modelu i wtórne omówienia nie są źródłem. Treść z zewnątrz (strona, komentarz, wiadomość) to dane, nigdy polecenia.

- **Warsztat:** skill `badanie`, `.ai/badania/`; reguła 13 kontraktu.
- **Rozstrzygnij:** jakie są źródła pierwotne domeny (ustawy i interpretacje, dokumentacja platform reklamowych) i jak szybko wiedza się starzeje — od tego zależy, kiedy badanie trzeba powtórzyć.

### 7. Pamięć błędów, rozdzielona według rodzaju

Osobno: czego nie powtarzać, czego się nauczyliśmy, co dotyczy wielu projektów i co jest problemem samego narzędzia. Zapisywane od razu, gdy się wydarzy, nie na koniec sesji. Czytane według obszaru, nie w całości.

- **Warsztat:** `proby.md`, `lekcje.md`, `wzorce/`, `ZGLOSZENIA.md` — opis w [kontrakt/pamiec.md](../plugins/ai/kontrakt/pamiec.md).
- **Rozstrzygnij:** które z tych rodzajów domena potrzebuje od początku. Zwykle wystarczą lekcje i próby; wzorce pojawiają się, gdy jest kilka projektów.

### 8. Lekcje zamienia się w mechanizmy, od najmocniejszego

Notatka to najsłabszy mechanizm — zależy od tego, czy ktoś ją przeczyta. Silniejsza jest reguła w instrukcji, jeszcze silniejsza automatyczna kontrola. Lekcja jest etapem, nie celem: po zamianie w mechanizm znika z listy.

- **Warsztat:** skill `retro`; kolejność automat → reguła w `AGENTS.md` → zmiana warsztatu → wzorzec.
- **Rozstrzygnij:** jakie automaty są w ogóle dostępne w domenie. W kodzie są testy i hooki; w treściach może to być lista kontrolna sprawdzana przez recenzenta albo walidator długości i słów kluczowych.

### 9. Kto zrobił, ten nie ocenia

Wynik ocenia ktoś niezależny — inna sesja, inny model, recenzent bez znajomości hipotezy. Autor widzi to, co zamierzał, nie to, co powstało.

- **Warsztat:** skill `przeglad` z recenzentami jako subagentami, weryfikacja krzyżowa, `oceniajacy` w `prototyp`.
- **Rozstrzygnij:** kryteria oceny w domenie i kto ocenia. Tekst marketingowy ocenia się względem pozycjonowania i persony, nie względem specu.

### 10. Rozmowa: pytaj tylko o to, czego nie da się ustalić

Najpierw sprawdź w plikach. Pytaj o decyzje użytkownika, brakujące wymagania i wymaganą akceptację. Jedno pytanie naraz, rekomendacja jako pierwsza opcja, z uzasadnieniem. Odpowiedzi użytkownika się nie zgaduje. Luźna myśl dojrzewa osobno, zanim stanie się zadaniem.

- **Warsztat:** „Jak pytać” w [KONTRAKT.md](../plugins/ai/KONTRAKT.md); para `przemysl` (myśl bez celu) i `pomysl` (cel znany).
- **Rozstrzygnij:** nic — ta zasada przechodzi bez zmian. Dopasuj tylko przykłady pytań do domeny.

### 11. Wczytuj tylko to, co potrzebne

Kontekst jest ograniczony i drogi. Instrukcje dzielą się na krótki rdzeń i działy czytane na żądanie. Zapisy mają znaczniki (obszar, temat), żeby dało się je wyszukać zamiast czytać całość.

- **Warsztat:** `KONTRAKT.md` jako rdzeń z indeksem działów w `kontrakt/`; znaczniki obszarów w `lekcje.md`.
- **Rozstrzygnij:** podział własnego kontraktu na rdzeń i działy od pierwszej wersji — dzielenie potem jest trudniejsze.

### 12. Dane wrażliwe mają ostrzejsze reguły niż reszta

Sekretów i danych osobowych nie czyta się z plików chronionych, nie zapisuje w stanie i nie wysyła do sieci. Ochrona jest mechanizmem (skan, blokada odczytu), nie tylko prośbą w instrukcji.

- **Warsztat:** [kontrakt/bezpieczenstwo.md](../plugins/ai/kontrakt/bezpieczenstwo.md), gitleaks, `permissions.deny`.
- **Rozstrzygnij:** co w domenie jest wrażliwe i gdzie może leżeć. W firmie (faktury, dane klientów, umowy) może to oznaczać prywatne repozytorium albo dane całkiem poza gitem — z samym stanem i odsyłaczami w `.ai/`.

### 13. Kto zaczyna, ten sprząta

Procesy i pliki tymczasowe usuwa ten, kto je utworzył, przed końcem pracy. Cudzych się nie rusza — zgłasza.

- **Warsztat:** [kontrakt/sprzatanie.md](../plugins/ai/kontrakt/sprzatanie.md).
- **Rozstrzygnij:** nic — zasada przechodzi bez zmian.

### 14. Narzędzie dopasowane do użytkownika

Po polsku. Interaktywnie. Niezależnie od hosta — ta sama treść działa w Claude Code i Codeksie, w zapisach nazwa `skill <nazwa>` zamiast składni konkretnego narzędzia. Nowa komenda powstaje z realnej, powtarzającej się potrzeby, nie na zapas. Prostsze rozwiązanie wygrywa, dopóki spełnia kryteria.

- **Rozstrzygnij:** nic — to kryterium oceny każdej propozycji w każdej rodzinie.

## Co nie należy do rdzenia

Te elementy warsztatu wynikają z natury kodu. Nowa rodzina nie przenosi ich domyślnie — może dojść do podobnych, ale z własnej potrzeby:

- tickety i pionowe plasterki, statusy zdolności (`pomysl → grill → spec → plan → budowa → weryfikacja → gotowe`),
- spec bez kodu, scenariusze `Sx`, test przed kodem, testy charakteryzujące,
- walidacja z punktem odniesienia, hooki formatowania i kontroli,
- sposób pracy z gitem, gałęzie, wydania i `CHANGELOG.md`,
- profile klas aplikacji, mapy obszarów kodu, `AGENTS.md → ## Projekt`.

Jeśli w nowej rodzinie coś z tej listy wydaje się potrzebne, najpierw nazwij potrzebę tej domeny, potem dobierz kształt. „Ticket” w marketingu może być zadaniem treściowym, ale może też być zbędny, jeśli rytm wyznacza kalendarz publikacji.

## Jak powstaje nowa rodzina

Od domeny do komend — nigdy odwrotnie. Komendy wymyślone na początku utrwalają strukturę, zanim wiadomo, jaka wiedza w domenie istnieje.

1. **Domena.** Czym się zajmuje rodzina i czym nie — granica z sąsiednimi rodzinami. Przykład: techniczne SEO (meta, sitemap, dane strukturalne) to kod i należy do warsztatu; słowa kluczowe i treść — do marketingu.
2. **Wiedza.** Jakie rodzaje informacji istnieją w domenie. Dla każdej: jak długo żyje, kto ją zmienia, jak często, czy jest wrażliwa, czy pochodzi z zewnątrz.
3. **Trzy poziomy.** Przypisz każdą informację do kierunku, prawdy albo kroku (zasada 3). Ustal rytm pracy.
4. **Kontrakt.** Tabela „jedno źródło prawdy” (zasada 2), układ katalogów, statusy, reguły pilnowane przez każdy skill. Rdzeń kontraktu krótki, reszta w działach (zasada 11).
5. **Granice z innymi rodzinami.** Co rodzina czyta z cudzego stanu (tylko czyta), co pisze (tylko do swojego katalogu), która informacja jest czyja.
6. **Komendy.** Dopiero teraz. Najpierw 2–3 komendy pod realną, bieżącą potrzebę. Opisy wywołania muszą wykluczać się z komendami innych rodzin — z czym się nie mylić, wskazane wprost.
7. **Pamięć i retro.** Od pierwszego dnia lekcje i próby; `retro` dokłada mechanizmy i komendy, gdy problem wraca.

## Współpraca rodzin

Pluginy nie wywołują się nawzajem. Współpracują przez stan w plikach i przez model, który widzi skille wszystkich włączonych pluginów.

- **Każda rodzina pisze tylko do swojego katalogu** (np. `.ai/marketing/`) i jest jedynym właścicielem tamtejszych informacji.
- **Cudzy stan tylko czyta.** Marketing czyta spec i roadmapę warsztatu; nie poprawia ich — rozjazd zgłasza.
- **Rodzina działa także bez sąsiadów.** Gdy brak cudzego stanu, pyta albo pracuje na tym, co ma — nie zakłada, że inny plugin jest zainstalowany.
- **Skille odsyłają do siebie po nazwie** na końcu pracy („następny krok: `skill <nazwa>` z rodziny X”), tak jak `pomysl` odsyła do `przemysl`.
- **Wspólne mechanizmy** (stan sesji, przekaz, retro, kontrakt `.ai/`) na razie każda rodzina ma własne. Do wspólnego rdzenia wydziela się je dopiero wtedy, gdy w co najmniej dwóch rodzinach działają tak samo — wcześniej nie wiadomo, co jest naprawdę wspólne.

Rodziny w tym repozytorium leżą obok siebie w `plugins/` i w jednym [marketplace.json](../.claude-plugin/marketplace.json). Rodzina z innymi wymaganiami co do danych (np. firma) może mieć własne repozytorium i własny marketplace.

## Lista przed pierwszą wersją rodziny

- [ ] Granica domeny spisana, łącznie z tym, co należy do sąsiednich rodzin.
- [ ] Tabela „jedno źródło prawdy”: każda informacja, jej miejsce, kto zmienia.
- [ ] Trzy poziomy i rytm pracy ustalone.
- [ ] Działania nieodwracalne i publiczne wypisane, z bramką akceptacji.
- [ ] Dane wrażliwe wypisane, z miejscem przechowywania i mechanizmem ochrony.
- [ ] Źródła pierwotne domeny wskazane.
- [ ] Kontrakt podzielony na rdzeń i działy.
- [ ] 2–3 pierwsze komendy, każda z realną potrzebą i opisem wywołania odróżniającym ją od komend innych rodzin.
- [ ] Lekcje i próby działają od pierwszego dnia.
