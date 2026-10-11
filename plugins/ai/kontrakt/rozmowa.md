# Rozmowa i materiały z zamiarem

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Przemyślenia — metoda sokratejska

Zanim myśl stanie się pomysłem, zdolnością albo decyzją, czasem trzeba ją przemyśleć: czy problem w ogóle istnieje, co naprawdę jest celem, na jakich założeniach stoi. Grill w `pomysl` dąży do decyzji i podaje rekomendacje. Metoda sokratejska **nie podsuwa odpowiedzi** — pytaniami pomaga człowiekowi samemu dojść do wniosku albo zobaczyć, że myśl nie jest warta dalszej pracy.

- **Gdzie:** skill `przemysl` — osobny zbiór myśli w `.ai/przemyslenia/` (szablon `szablony/przemyslenie.md`), prowadzony przez wiele sesji; oraz tryb `pomysl <slug> sokratejsko` — ta sama metoda zastosowana do zdolności w grillu, z wynikiem w jej mapie. W zwykłym grillu użytkownik może poprosić o przejście na pytania sokratejskie przy jednym temacie i z powrotem.
- **Rodzaje pytań** (taksonomia Paula), dobierane do tego, co właśnie padło:
  - **doprecyzowanie** — „Co dokładnie znaczy »prościej«? Podaj przykład.”;
  - **założenia** — „Co musiałoby być prawdą, żeby to zadziałało?”, „Skąd to założenie?”;
  - **dowody i powody** — „Skąd wiesz, że to problem? Kiedy ostatnio się zdarzył?”;
  - **perspektywy** — „Jak zobaczyłby to ktoś, kto korzysta z tego codziennie? A ktoś, kto ma to utrzymywać?”;
  - **konsekwencje** — „Co się stanie, jeśli tego nie zrobisz? Co zmieni się za pół roku, jeśli zrobisz?”;
  - **pytanie o pytanie** — „Czy to właściwe pytanie? Co jest pod nim?”.
- **Zasady prowadzenia:**
  - jedno pytanie naraz, krótkie; pytania otwarte, tekstem — nie przez narzędzie wyboru;
  - **bez rekomendacji i ocen.** Agent nie mówi, co by zrobił. Na wyraźną prośbę może podać swoje zdanie — oznaczone jako „zdanie agenta”, zapisane osobno — i wraca do pytań;
  - nazywa sprzeczności między odpowiedziami („Wcześniej padło X, teraz Y — które jest bliżej prawdy?”) i ujawnione założenia;
  - co 4–6 pytań krótkie podsumowanie: do czego doszliśmy, co się zmieniło, co otwarte;
  - formy neutralne płciowo („Co jest dla Ciebie celem?”, „Wcześniej padło…”), bez zgadywania form rodzajowych;
  - fakty, których brakuje, nie są pytaniem sokratejskim — zapisuje je jako „Czego nie wiemy” (kandydaci na `badanie` albo `[prototyp]`), zamiast zgadywać;
  - kończy, gdy użytkownik powie „wystarczy”, gdy wniosek jest jasny albo gdy pytania zaczynają krążyć — wtedy proponuje zakończenie.
- **Zakończenie przemyślenia** — jeden z wyników, wybiera człowiek:
  - `dojrzałe → <dokąd>`: zdolność (linia w roadmapie i `skill pomysl` z `## Problem` wyprowadzonym z wniosku), decyzja (`skill decyzja`), badanie, zmiana celu produktu, zasada, lekcja, wpis w Mgle;
  - `odrzucone`: z powodem w jednym zdaniu — to też wynik, nie porażka. Odrzucone przemyślenie zostaje w zbiorze, żeby ta sama myśl nie wracała bez nowego argumentu;
  - `odłożone`: z warunkiem „Wróć, gdy”.
- **Przed nowym przemyśleniem** przeszukaj `przemyslenia/`: myśl już odrzucona albo dojrzała → pokaż wniosek i zapytaj, co się zmieniło od tamtej pory. Kontynuujesz albo zaczynasz od nowych argumentów.
- **Słowa użytkownika.** Wniosek zapisujesz jego słowami, nie parafrazą agenta — to on doszedł do odpowiedzi.

## Plik z zamiarem — pomysł spisany przez użytkownika

Użytkownik może spisać swój pomysł w pliku Markdown w dowolnym miejscu repozytorium (np. `POMYSL.md`) i podać go skillowi `pomysl` — dla całego projektu (`pomysl produkt <plik>`) albo jednej zdolności (`pomysl <plik>`). Plik opisuje to, co użytkownik **chce**, więc to materiał na grill, nie na inwentaryzację (`poznaj` opisuje to, co już jest).

- **Materiał, nie wyrocznia.** Plik rozbijasz na składniki i najpierw pokazujesz tabelę rozbioru: fragment → dokąd trafi → jasny, niejasny albo sprzeczny. Zapisujesz tylko to, co użytkownik potwierdzi.
- **Dokąd trafia:** cel i „czego nie robimy” → `ROADMAP.md` → `## Cel` (albo `## Problem` zdolności); funkcje → zdolności w roadmapie; szczegóły zachowania → decyzje w mapie zdolności; wybory techniczne → kandydaci na ADR (skill `decyzja`); podejście do kodu → `ZASADY.md`; pojęcia → `SLOWNIK.md`; ograniczenia → `ZASADY.md` → Niefunkcjonalne albo spec; „może kiedyś” → Mgła; niejasności, sprzeczności, braki → otwarte pytania.
- **Plik zastępuje początek grilla, nie cały grill.** Nie pytasz o to, co użytkownik już napisał — grill dotyczy luk i sprzeczności. Bramki (`spec`, akceptacja) obowiązują jak zawsze.
- **Ślad do źródła.** Plik zostaje nietknięty tam, gdzie leży. Każdy wyciągnięty wpis ma dopisek `Źródło: <plik> § <sekcja>`. Zdolność wyciągnięta z pliku ma taki dopisek w `## Problem` — po niego sięgają później `pomysl`, druga opinia i `spec`. Jeśli plik albo sekcja zostały usunięte, historyczną treść odzyskujesz z gita.
- **Rejestr.** `zrodla.md` → `## Zamiar`: ścieżka, czego dotyczy, data i commit ostatniego rozbioru. Rozbierana wersja musi być zacommitowana — inaczej checkpoint nie wskazywałby dokładnie przetworzonej treści. Plik nieśledzony albo zmieniony → skill proponuje, że sam zacommituje tylko ten plik, i po zgodzie kontynuuje w tym samym przebiegu; zatrzymuje się dopiero przy odmowie. Projekt bez gita → rozbiór bez punktu odniesienia, wpis z dopiskiem `bez gita`, a każde kolejne uruchomienie to pełny rozbiór porównany z istniejącymi wpisami.
- **Plik żyje.** Ponowne uruchomienie z tym samym plikiem porównuje go z wersją z ostatniego rozbioru (`git diff <commit> -- <plik>`) i rozbiera tylko zmiany. Zarejestrowany plik usunięty w commicie nadal można rozebrać: poprzednią treść pobierasz z gita, a każdy usunięty fragment jest pytaniem do użytkownika, nie automatycznym usunięciem wpisów. Pusty diff oznacza brak zmian; checkpoint przesuwasz tylko do commita zawierającego dokładnie rozebraną wersję.
- **Słowa użytkownika to nie wnioski modelu.** Fragment pliku przypisany do zdolności może czytać druga opinia na etapie własnego zdania — to zamiar, a nie wynik grilla.
