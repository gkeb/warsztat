## Tryb z pliku — `pomysl <plik.md>` i `pomysl produkt <plik.md>`

Użytkownik spisał swój pomysł w pliku. Zasady: sekcja `## Plik z zamiarem — pomysł spisany przez użytkownika` w `../../kontrakt/rozmowa.md`. Plik **zastępuje początek grilla**, nie cały grill.

1. **Punkt odniesienia w git.** Sprawdź `.ai/zrodla.md` → `## Zamiar`, śledzenie (`git ls-files --error-unmatch -- <plik>`) i zmiany (`git status --porcelain -- <plik>`). Rozbierana wersja musi być zacommitowana — dzięki temu checkpoint wskazuje dokładnie rozebraną treść.
   - Plik nieśledzony albo ze zmianami → **zaproponuj, że sam zrobisz commit tylko tego pliku** (`warsztat: zamiar <plik>`), rekomendując tę opcję. Po zgodzie zrób commit i kontynuuj w tym samym przebiegu. Odmowa → zatrzymaj się bez zapisywania rejestru i wyjaśnij jednym zdaniem, że bez commita kolejny rozbiór nie pokaże zmian.
   - Projekt bez gita (użytkownik nie chciał `git init`) → rozbierz plik bez punktu odniesienia. W rejestrze zapisz `bez gita — porównanie wersji niedostępne`. Każde kolejne uruchomienie to pełny rozbiór: wpisy, które już istnieją ze `Źródło:` tego pliku, porównujesz z nową treścią i pytasz tylko o różnice.
   - Wyjątek: zarejestrowany plik usunięty w commicie rozbierasz jako usunięcie (niżej).
   - Plik nie był jeszcze rozbierany → wczytaj go w całości.
   - Plik był już rozbierany i nadal istnieje → wczytaj go oraz użyj `git diff <commit z rejestru> -- <plik>`; dalej pracuj tylko na różnicy.
   - Zarejestrowany plik został usunięty w commicie → pobierz poprzednią treść przez `git show <commit z rejestru>:<plik>` i rozbierz usunięcie jako zmianę. Dla każdego usuniętego fragmentu zapytaj, czy usunąć wyciągnięte z niego wpisy; niczego nie usuwaj automatycznie.
   - Różnica jest pusta → powiedz, że od ostatniego rozbioru plik się nie zmienił, i nie powtarzaj rozbioru.
2. **Rozbiór.** Przypisz każdy fragment do miejsca według kontraktu (cel albo problem, zdolności, decyzje, kandydaci na ADR, zasady, słownik, niefunkcjonalne, Mgła). Przy okazji wyłap:
   - **sprzeczności** — wewnątrz pliku oraz z `ZASADY.md`, ADR-ami, kodem i `.ai/proby.md`;
   - **niejasności** — słowa, które można zrozumieć na dwa sposoby, pojęcia bez definicji;
   - **braki** — o czym plik milczy, a co trzeba wiedzieć: kto jest użytkownikiem, co przy błędzie, uprawnienia, dane i ich źródło, skala, co jest poza zakresem.
3. **Tabela rozbioru — zanim cokolwiek zapiszesz.** Pokaż ją użytkownikowi:

   ```text
   Fragment (§ sekcja, skrót)          → Dokąd                         Stan
   § Cel: „…dla małych firm…”          → ROADMAP › Cel                 jasny
   § Faktury: „…wysyłka mailem…”       → zdolność faktury › Decyzje    jasny
   § Technika: „…Postgres…”            → ADR (skill decyzja)           do decyzji
   § Faktury: „…szybko…”               → otwarte pytanie [grill]       niejasny: ile to „szybko”?
   ```

   Potem lista sprzeczności i braków. Zapytaj zgodnie z `## Jak pytać`, czy rozbiór pasuje — całość albo grupami.
4. **Zapis** potwierdzonych wpisów, każdy z dopiskiem `Źródło: <plik> § <sekcja>`:
   - **`produkt`**: `## Cel` w roadmapie; zdolności jako `pomysl` w Dalej albo Mgle (każda z linkiem do swojego fragmentu); słownik; zasady w `ZASADY.md` (status `obowiązuje`, `Dlaczego: Źródło: …`); wybory techniczne jako kandydaci na ADR — dla każdego Następny krok `skill decyzja <temat>` albo od razu skill `decyzja`, jeśli użytkownik chce. Dalej jak w trybie produktu (krok 3 i kolejne).
   - **zdolność**: mapa z `## Problem` (i dopiskiem źródła), decyzje, otwarte pytania; status i limit Teraz jak przy nowym pomyśle.
5. **Grill tylko luk.** Zasady jak w zwykłym przesłuchaniu, ale pytasz wyłącznie o sprzeczności, niejasności i braki z kroku 2. Tego, co użytkownik napisał jasno i potwierdził w tabeli, nie powtarzasz.
6. **Rejestr.** Dopisz albo zaktualizuj wpis w `.ai/zrodla.md` → `## Zamiar`: ścieżka, czego dotyczy, data i commit zawierający dokładnie rozebraną wersję (`git log -1 --format=%h -- <plik>`). Jeśli plik zmienił się w trakcie rozbioru, nie przesuwaj checkpointu — zaproponuj commit zmiany i rozbiór samej różnicy w tym samym przebiegu. Projekt bez gita → wpis bez commita, z dopiskiem `bez gita`.

Pliku z zamiarem nie edytujesz. Jeśli użytkownik chce w nim coś poprawić po rozbiorze — robi to sam, a kolejne uruchomienie złapie zmianę.
