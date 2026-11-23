# Słownik domeny

> Byty, nie-byty, granice i niezmienniki. Najwyżej 1–3 strony. Poprawiaj istniejące wpisy zamiast dopisywać nowe wersje. Format: „Język → zachowanie → test” w `kontrakt/praca.md` w katalogu pluginu warsztatu.

<!-- Konteksty: dopóki każde słowo znaczy w całym projekcie to samo, zostaw tylko „Pojęcia”. Gdy to samo słowo zaczyna znaczyć co innego w dwóch częściach systemu, dodaj sekcje `## Kontekst: <nazwa>` (odpowiedzialność, obszary kodu, relacje z innymi kontekstami), a w „Pojęciach” zostaw tylko to, co wspólne. -->

## Pojęcia

<!-- **Faktura** — dokument rozliczeniowy wystawiony klientowi po realizacji zamówienia. _Zawsze:_ wystawiona faktura się nie zmienia; korekta to nowa faktura. _Nie mylić z:_ Zamówieniem. -->

**Rdzeń** — skille, kontrakt i szablony warsztatu: sam proces. _Zawsze:_ zmienia go tylko opiekun; od innych przyjmuje opisy problemów (Issues), nie zmiany. _Nie mylić z:_ Rozszerzeniem.

**Rozszerzenie** — profile klas aplikacji i wzorce: wiedza, którą się głównie dopisuje, a nie zmienia.

**Katalog społeczności** — osobny plugin z profilami i wzorcami od innych osób, instalowany przez użytkownika świadomie ([ADR 0001](decyzje/0001-rdzen-i-katalog-spolecznosci.md)). _Zawsze:_ do rdzenia trafia z niego tylko pozycja `potwierdzona`, którą opiekun uznał za dotyczącą większości użytkowników.

**Pozycja katalogu** — jeden wzorzec albo jeden profil w katalogu społeczności, ze statusem jak wzorzec: `kandydat` (nowa), `potwierdzony` (wystąpienia w co najmniej dwóch niezależnych projektach), `wycofany`.

**Sygnał globalny** — liczba różnych kont GitHub, od których pochodzą wystąpienia w jednym zgłoszeniu; od 2 zgłoszenie idzie na początek listy opiekuna. Porządkuje, nie rozstrzyga.

**Opiekun** — osoba, która utrzymuje warsztat i jako jedyna wdraża zmiany w rdzeniu.

**Zgłoszenie** — opis problemu procesu warsztatu z wystąpieniami i proponowanym kierunkiem; dziś wpis w `ZGLOSZENIA.md`, po wdrożeniu `model-zgloszen` Issue z etykietą zgłoszenia w repozytorium zgłoszeń. _Zawsze:_ nie zawiera kodu, ścieżek, nazw ani pojęć projektu, z którego pochodzi; problem bezpieczeństwa warsztatu nie jest publicznym zgłoszeniem, tylko idzie kanałem bezpieczeństwa.

**Szkic zgłoszenia** — treść zgłoszenia albo komentarza „wystąpienie” przed wysłaniem, w stałych polach szablonu; widzi go użytkownik i dopiero po jego zgodzie zostaje wysłany. _Nie mylić z:_ lekcją `[warsztat]`, z której powstaje.

**Repozytorium zgłoszeń** — repozytorium GitHub, do którego retro wysyła zgłoszenia; ustawienie w `warsztat.json` projektu, domyślnie oficjalne repozytorium warsztatu, `null` wyłącza wysyłkę.

**Kanał bezpieczeństwa** — prywatne zgłaszanie podatności w repozytorium warsztatu, opisane w jego polityce bezpieczeństwa; widzi je tylko opiekun.

**Wystąpienie** — jedno potwierdzone zdarzenie danego problemu; liczone w trzech miejscach: w lekcji (kolejne zdarzenie w tym samym projekcie — próg lokalny zgłoszenia: 3), w zgłoszeniu (komentarz „Wystąpienie” — sygnał globalny liczony po różnych osobach: 2), we wzorcu (kolejny projekt — `potwierdzony` od 2). _Nie mylić:_ trzech liczników nie sumujemy.

**Rodzaj problemu** — ocena lekcji `[warsztat]` przez retro, podawana w szkicu zgłoszenia: zwykły, utrata danych albo bezpieczeństwo. Utrata danych to sytuacja, w której skill albo hook warsztatu usunął lub nadpisał pracę użytkownika (pliki, niezacommitowane zmiany, zapisy w `.ai/`) tak, że nie da się jej odzyskać z gita. Bezpieczeństwo to wyciek sekretu, ominięta kontrola albo przyznane za szerokie uprawnienie. _Zawsze:_ problem bezpieczeństwa idzie kanałem bezpieczeństwa, nie do szkicu; użytkownik może zmienić rodzaj przed zgodą.

**Próg** — minimalna liczba wystąpień, od której skill coś proponuje. _Nie mylić z:_ bramką, czyli skillem uruchamianym tylko przez człowieka.

## Czym to nie jest

<!-- Zdania w stylu: „Faktura nie jest Zamówieniem — zamówienie może istnieć bez faktury”. -->

- Zgłoszenie nie jest poprawką — opisuje problem; zmianę w rdzeniu robi opiekun.
