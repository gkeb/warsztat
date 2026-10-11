# Lekcje, próby i wzorce

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Lekcje — czego się nauczyliśmy

`lekcje.md` to katalog **rozwiązanych problemów**: miejsc, w których założenie — agenta albo nasze — okazało się fałszywe, i tego, jak robimy teraz. Para z `proby.md`: lekcja mówi „wiemy, jak teraz”, próba — „to nie działa” albo „jeszcze nie wiemy”.

- **Kiedy zapisujesz.** Założenie okazało się fałszywe — niezależnie od tego, kto to wykrył: użytkownik, test czerwony z innego powodu niż przewidziany, błąd w działaniu, badanie, przegląd, weryfikacja. Kryterium jak w próbach: pomyłka kosztowała więcej niż kilka minut albo łatwo ją powtórzyć w dobrej wierze. Literówki i oczywiste pomyłki nie są lekcjami.
- **Zapisujesz od razu**, gdy znasz rozwiązanie — nie na koniec sesji. Jeśli rozwiązanie ma swój ślad (commit, ADR, zasada, test), linkujesz go.
- **Luka bez rozwiązania to jeszcze nie lekcja.** Problem, którego teraz nie rozwiążesz, albo wiedza, której brakuje → pytanie `[badanie]` w mapie zdolności albo wpis `nierozwiazane` w `proby.md`. Gdy rozwiązanie się znajdzie, wpis z `proby.md` zamieniasz w lekcję. Droga problemu: luka → badanie albo próba → lekcja → (`retro`) mechanizm.
- **Czytasz według obszaru, nie całość.** Skill, który pracuje nad kodem albo zdolnością, wczytuje z `lekcje.md` tylko linijki ze znacznikiem `[projekt]`, zdolności, nad którą pracuje (`[<slug>]`), i obszarów, których dotyka (`[<obszar>]`), np. `grep -E '^- \[(projekt|faktury|platnosci)\]' .ai/lekcje.md`. Gdy jeszcze nie wiesz, gdzie leży problem (diagnoza buga, wybór podejścia), przeszukaj cały plik po objawie i hasłach, zamiast wczytywać go w całości. Całość czytają tylko skille, które porządkują plik: `zamknij`, `retro`, `gdzie`. Długa lista naraz zaśmieca kontekst lekcjami z innych obszarów — dlatego znacznik jest obowiązkowy.
- **Powtórka to nie nowa linijka.** Zanim dopiszesz, przeszukaj `lekcje.md`. Ta sama przyczyna → dopisujesz wystąpienie do istniejącej lekcji. Lekcja z co najmniej dwoma wystąpieniami jest sygnałem dla `retro`; hook pokazuje ją na starcie sesji.
- **Lekcja a wzorzec.** Gdy problem rozwiązał wzorzec z `wzorce/` — dopisek `Wzorzec: <plik>`. Gdy wzorzec pasował tylko częściowo albo wcale — napisz w lekcji, czym ten przypadek się różnił; `retro` przeniesie to do wzorca.
- **Lekcja jest etapem, nie celem.** `retro` zamienia lekcje w mechanizmy (automat, zasada, zmiana warsztatu, wzorzec) i usuwa je z pliku. Linia `Ostatnie retro:` na górze pliku wyznacza, od kiedy liczy się nowy materiał.

## Próby — czego nie powtarzać

`proby.md` to katalog **podejść sprawdzonych w działaniu lub w źródłach pierwotnych, prób zaczętych i odłożonych oraz problemów bez rozwiązania**. Odrzucenie na papierze bez takiej weryfikacji zostaje w ADR → „Rozważane alternatywy” albo w mapie → Decyzje. Badanie, które potwierdza konkretną niezgodność biblioteki lub usługi, jest weryfikacją i może trafić do katalogu z linkiem do źródła.

| Status | Znaczenie | Czy wracać |
| --- | --- | --- |
| `nie-dziala` | sprawdzone w działaniu albo źródłach pierwotnych; w opisanych warunkach nie działa — jest dowód | tylko gdy spełniony jest warunek „Wróć, gdy” |
| `odlozone` | mogło zadziałać, ale wybraliśmy inną ścieżkę (czas, koszt, ryzyko); nie sprawdzone do końca | tak, świadomie — wiedząc, gdzie przerwaliśmy |
| `nierozwiazane` | problem bez znanej przyczyny albo rozwiązania | przegląd tygodniowy decyduje, czy staje się zdolnością |

- **Zanim zaproponujesz albo zaczniesz podejście**, przeszukaj `proby.md` (nazwy bibliotek, funkcji, modułów, nazwę podejścia). Trafienie cytujesz użytkownikowi. Podejścia `nie-dziala` nie powtarzasz, chyba że spełniony jest warunek powrotu albo użytkownik świadomie zdecyduje inaczej — wtedy aktualizujesz wpis wynikiem.
- **Zapisujesz na bieżąco**, w chwili porzucenia podejścia — nie na koniec sesji. Kryterium: próba kosztowała więcej niż kilka minut albo łatwo ją powtórzyć w dobrej wierze.
- **Tylko fakty.** `nie-dziala` wymaga dowodu (błąd, pomiar, link do commita, badania albo testu). Bez dowodu to `odlozone` albo `nierozwiazane`.
- Szczegóły (logi, pomiary) trzymasz w commicie, badaniu albo pliku sesji i linkujesz. Wpis ma 4–7 linijek.
- Wpis, który się zdezaktualizował (kod usunięty, warunek powrotu spełniony i podejście zadziałało), zmieniasz albo usuwasz w `retro`. Historię trzyma git.

## Wzorce — wiedza między projektami

Lekcja opisuje konkretny projekt. Ten sam problem w innym projekcie wygląda inaczej: inna biblioteka, inne nazwy, inny objaw. Wzorzec to lekcja **uogólniona** tak, żeby dało się ją rozpoznać i zastosować gdzie indziej — albo świadomie uznać, że nie pasuje.

- **Miejsce.** Katalog `wzorce/` w katalogu pluginu (poziom wyżej niż ten plik): `INDEKS.md` i jeden plik na wzorzec (`kebab-slug.md`, szablon `szablony/wzorzec.md`). Nie w `.ai/` projektu.
- **Co jest wzorcem.** Problem niezależny od domeny projektu: zachowanie biblioteki, protokołu, usługi albo narzędzia; powtarzalny rodzaj błędu; pułapka procesu pracy z agentem. Fakty o konkretnym projekcie zostają w jego `lekcje.md`, `ZASADY.md` albo ADR.
- **Budowa** oddziela rozpoznanie od rozwiązania:
  - **Sygnały** — objawy widoczne, zanim znasz przyczynę. Po nich szukasz przy bugu.
  - **Warunki** — kiedy wzorzec dotyczy, i osobno: kiedy **nie** dotyczy.
  - **Mechanizm** — dlaczego tak się dzieje.
  - **Rozwiązanie** — zasada, nie kod. Konkretny kod żyje w projektach.
  - **Warianty i pułapki** — czym przypadki się różniły.
  - **Wystąpienia** — projekt, link do lekcji albo commita, kontekst (stos, wersje), wariant.
- **Status:** `kandydat` (jedno wystąpienie — wskazówka, nie reguła), `potwierdzony` (wystąpienia w co najmniej dwóch projektach), `wycofany` (z powodem; pliku nie usuwasz).
- **Szukanie.** Najpierw `INDEKS.md` (tytuł, status, hasła, sygnały w jednej linii), potem plik wzorca. Szukają: `napraw` po objawie (Sygnały), `buduj`, `pomysl` i `decyzja` po hasłach — przy wyborze podejścia, razem z `proby.md`.
- **Stosowanie.** Trafienie przywołujesz użytkownikowi razem z oceną dopasowania: które Warunki projekt spełnia, czy zachodzi któryś „Nie dotyczy”, którego wariantu to przypomina. Wzorca nie stosujesz na ślepo. Wynik — pasował albo czym się różnił — trafia do lekcji projektu z dopiskiem `Wzorzec: <plik>`.
- **Kto pisze.** Tylko skill `retro`, za zgodą użytkownika: nowy wzorzec z lekcji, nowe wystąpienie, wariant albo zawężenie Warunków na podstawie lekcji z dopiskiem `Wzorzec:`. Pliki edytujesz tylko wtedy, gdy katalog pluginu jest repozytorium źródłowym, a nie kopią w cache pluginów; w przeciwnym razie podajesz gotowy tekst. Commit w repozytorium pluginu: `wzorce: <opis>`.
- **Bez danych projektu.** We wzorcu nie ma kodu, sekretów, danych ani nazw klienta. Wystąpienie identyfikuje projekt nazwą repozytorium i opisuje kontekst ogólnie.
