---
name: buduj
description: Realizuje jeden zaplanowany ticket metodą TDD, waliduje i przegląda diff, robi commit, po czym zatrzymuje się. Używaj tylko wtedy, gdy użytkownik jawnie rozpoczyna budowę.
disable-model-invocation: true
argument-hint: "[slug | slug#NN]"
---

# Budowa ticketu

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`. Użyj slugu lub identyfikatora ticketu podanego przy wywołaniu skilla albo w bieżącej wiadomości.

Pytania o decyzje wymagane do rozpoczęcia lub dokończenia ticketu zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie.

Jedna sesja = jeden ticket. Pracujemy razem: mówisz, co robisz, i pytasz tylko wtedy, gdy ticket jest niejasny, przeczy specowi albo ADR, albo wymaga decyzji spoza ticketu.

## 1. Wybierz ticket

- Argument `slug#NN` → ten ticket. Argument `slug` albo brak → zdolność z Teraz w `plan` albo `budowa`.
- Najpierw ticket `w-toku` (przerwana sesja — przeczytaj `## Stan sesji` w mapie). Jeśli go nie ma, bierz najniższy numer `do-zrobienia`, którego zależności są `zrobione`.
- Nie ma takiego ticketu? Wszystkie zrobione → krok 9 (przejście do weryfikacji). Pozostałe zablokowane → powiedz, przez co.
- Zdolność w `weryfikacja` → nie budujesz: czeka na skill `weryfikuj` w innym modelu. Wyjątek: użytkownik chce dołożyć ticket — wtedy status wraca do `budowa`, a weryfikacja odbędzie się po nim.

## 2. Warunki wstępne

- Zdolność w `grill` albo `spec` → zatrzymaj się i wskaż właściwą komendę.
- Inna zdolność już w `budowa` → zatrzymaj się (limit Teraz) i zapytaj, co robimy.
- `git status`: są niezacommitowane zmiany niezwiązane z ticketem → zapytaj, co z nimi zrobić, zanim zaczniesz.
- Remote: `git fetch` i `git status -sb` — gałąź za zdalną → `git pull --ff-only`; rozjechana → stop i pytanie (kontrakt, `### Push`).
- `git.galezie` = `zdolnosc` → praca na gałęzi `zdolnosc/<slug>`: pierwszy ticket ją zakłada z aktualnej gałęzi głównej, kolejne sprawdzają, że na niej są (kontrakt, `### Gałęzie i PR`).

## 3. Kontekst

Wczytaj: ticket, odpowiednie fragmenty `spec.md`, `.ai/SLOWNIK.md`, `.ai/ZASADY.md`, `.ai/lekcje.md`, powiązane ADR z katalogu decyzji, mapę obszaru z `.ai/obszary/` (jeśli jest) i kod, którego ticket dotyka. Sprawdź `Rodzaj:` w mapie zdolności. `lekcje.md` czytasz zawsze — to są błędy, których nie wolno powtórzyć. Przed wyborem implementacji przeszukaj też `.ai/proby.md`, a gdy ticket dotyka biblioteki, protokołu, usługi zewnętrznej albo znanego rodzaju problemu — `../../wzorce/INDEKS.md` względem tego pliku. Trafienia przywołaj w planie: przy próbach ich status i warunek powrotu, przy wzorcach — czy Warunki pasują i czy nie zachodzi „Nie dotyczy”.

## 4. Start

- Ticket → `w-toku`. Zdolność w `plan` → `budowa` w `ROADMAP.md`. To jedyna zmiana roadmapy, jaką wolno budowie.
- Pokaż plan w 3–6 punktach: które scenariusze z pola `scenariusze` ticket kończy, na jakim poziomie powstaną ich testy akceptacyjne, jakie zachowania sprawdzą testy wewnętrzne i w jakiej kolejności. Idź dalej bez czekania, chyba że coś jest niejasne.

## 5. Podwójna pętla — pionowo, jeden test naraz

Zasady: sekcja „Język → zachowanie → test” w kontrakcie.

**Pętla zewnętrzna — scenariusz.** Dla każdego scenariusza, który ten ticket kończy:

1. Napisz test akceptacyjny scenariusza przez publiczny interfejs (API, CLI, UI, publiczna funkcja modułu — poziom ze specu), z numerem scenariusza w nazwie albo opisie. Przykłady z tabeli w specu stają się przypadkami testu (test parametryzowany).
2. Uruchom go. Ma być czerwony **z właściwego powodu** — brakuje zachowania, a nie importu czy konfiguracji.
3. Przejdź do pętli wewnętrznej. Wracasz, gdy test akceptacyjny przejdzie.

Scenariusz, który ticket tylko posuwa (kończy go inny ticket), nie ma jeszcze testu akceptacyjnego — jego część sprawdzają testy wewnętrzne.

**Pętla wewnętrzna — TDD:**

1. Napisz **jeden** test jednego zachowania, przez publiczny interfejs modułu.
2. Uruchom go. Ma być czerwony **z właściwego powodu**.
3. Napisz minimalny kod, żeby przeszedł.
4. Powtórz dla następnego zachowania potrzebnego scenariuszowi albo kryterium akceptacji.
5. Refaktoryzuj tylko na zielonym.

Gdy test akceptacyjny i wewnętrzny sprawdzałyby dokładnie to samo (mały scenariusz, publiczna funkcja), wystarczy jeden — test akceptacyjny. Testy sprawdzają zachowanie, nie implementację. Mockujesz tylko granice systemu: sieć, czas, zewnętrzne usługi — nie własne moduły. Nie piszesz wszystkich testów z góry.

**Kod bez testów.** Zanim zmienisz zachowanie, którego nie pokrywa żaden test, przypnij je testem charakteryzującym — opisującym to, co kod robi dziś, nawet jeśli wygląda na błędne. Podejrzane zachowanie zgłaszasz, nie poprawiasz przy okazji.

**Refaktor** — zamiast pętli od czerwonego testu:

1. Niezmienniki ze specu mają zielone testy z numerem niezmiennika w nazwie. Jeśli nie — to praca pierwszego ticketu, nie tego.
2. Mały krok struktury → testy → zielone → następny krok.
3. Test niezmiennika zczerwieniał → cofnij krok i zrób mniejszy. **Nigdy nie poprawiasz testu niezmiennika, żeby przeszedł.**
4. Żadnych zmian zachowania. Kusząca poprawka → zapisz ją w mapie jako pomysł na osobną zdolność.

**Narzędzia testów akceptacyjnych** — według sekcji `Testy akceptacyjne` profili projektu (`warsztat.json` → `profile`, pliki w `../../profile/`): CLI uruchamiasz jak użytkownik i sprawdzasz kod wyjścia, stdout i stderr; stronę testujesz w przeglądarce na zbudowanej wersji, nie na serwerze deweloperskim.

**Wygląd** — logikę (formularz, filtr, nawigacja) prowadzisz pętlą jak wyżej. Dla tego, czego test nie oceni:

1. Test przepływu ze scenariusza (zewnętrzna pętla) — czerwony.
2. Zmiana: struktura, style, treść — w tokenach i komponentach z `ZASADY.md`; nowy element systemu wyglądu zgłaszasz.
3. Kontrole automatyczne z profilu (dostępność, kontrast, linki, budżet wydajności) — zielone.
4. Zrzuty ekranu w szerokościach kontrolnych do katalogu ignorowanego przez git (np. `.ai/zrzuty/<slug>-NN/`). Obejrzyj je sam: przepełnienia, nachodzenie, kontrast, stany puste i błędu.
5. Pokaż zrzuty (albo adres podglądu) użytkownikowi. Uwagi → poprawka → nowe zrzuty. Zgoda → w Notatkach ticketu `Akceptacja wyglądu: RRRR-MM-DD — użytkownik — szerokości … — uwagi`. Bez akceptacji ticket nie jest zrobiony.

**Szkielet** — pierwszy ticket wpisuje działające komendy do `walidacja` w `.ai/warsztat.json`. To jedyna zmiana konfiguracji, jaką wolno budowie.

## 6. Pilnuj zakresu

Zatrzymaj się i zgłoś, zamiast brnąć, gdy:

- pojawia się nowe pojęcie → wpis w słowniku, we właściwym kontekście (za zgodą);
- scenariusz w specu okazuje się niejednoznaczny albo przykład w tabeli przeczy innemu scenariuszowi → stop i pytanie; specu nie poprawiasz sam;
- pojawia się twarda decyzja → skill `decyzja`;
- ticket da się zrobić tylko łamiąc zasadę twardą z `.ai/ZASADY.md` → stop: wyjątek wpisany w zasadzie (za zgodą) albo zmiana zasady przez skill `decyzja`. Nigdy po cichu;
- ticket nie zmieści się w tej sesji → skill `przekaz`, potem skill `pokroj <slug>#NN`;
- kod przeczy specowi albo ADR → powiedz to wprost i zapytaj;
- wybrane podejście nie działa i przechodzisz na inne → najpierw wpis w `.ai/proby.md` (`nie-dziala` z dowodem albo `odlozone`), potem zmiana kursu;
- kod zależy od tego, jak działa biblioteka, API albo usługa, a nie jesteś pewien zachowania w używanej wersji → sprawdź w źródle (dokumentacja tej wersji, kod w `node_modules` / `site-packages`), nie z pamięci; pytanie, które wymaga więcej niż kilku minut → skill `badanie`.

**Fałszywe założenie** — test czerwony z innego powodu niż przewidziałeś, kod zachowuje się inaczej, niż zakładałeś, przegląd albo użytkownik pokazał błąd w rozumowaniu. Gdy znasz już rozwiązanie, od razu wpis w `.ai/lekcje.md` według sekcji „Lekcje” w kontrakcie (ta sama przyczyna → nowe wystąpienie istniejącej lekcji). Nie czekaj do końca ticketu.

## 7. Walidacja

Uruchom wszystkie komendy z `walidacja` w `.ai/warsztat.json` i poprawiaj, aż przejdą. Jeśli `odniesienie.znane` nie jest puste, „przechodzą” znaczy: brak błędów spoza tej listy. Znany błąd, który przy okazji zniknął, usuń z listy; lista nie może rosnąć. Nie wyłączasz testów, nie osłabiasz typów, nie dodajesz `ignore`, żeby było zielono. Jeśli się nie da — zatrzymaj się i opisz problem.

## 8. Przegląd

Uruchom skill `przeglad` dla bieżących zmian tego ticketu. Uwagi blokujące poprawiasz i ponownie uruchamiasz walidację. Uwaga oznaczona `[założenie]` po poprawce staje się lekcją. Pozostałe pokazujesz użytkownikowi; poprawiasz te, które wybierze. Przy trywialnym diffie (kilka linii, bez logiki) możesz przejrzeć zmiany sam — napisz to w raporcie.

## 9. Zamknięcie ticketu

- Odhacz kryteria akceptacji (scenariusze kończone w tym tickecie: test akceptacyjny z numerem istnieje i przechodzi), status ticketu → `zrobione`, a w `budowal` wpisz `"<narzędzie> / <model>"` (np. `"Claude Code / claude-opus-5-5"`). Modelu nie zgadujesz — nieznany zapisz jako `nieznany`.
- `mapa.md` → `## Następny krok`: następny ticket. Wyczyść `## Stan sesji`, jeśli dotyczył tego ticketu.
- **To był ostatni ticket** (wszystkie `zrobione` albo `porzucony`):
  - `weryfikacja.wymagana` w `.ai/warsztat.json` = `true` (domyślnie) → status zdolności w `ROADMAP.md` → `weryfikacja`; Następny krok: `skill weryfikuj <slug>`. Przy `weryfikacja.innyModel` = `true` (domyślnie) wskaż, że należy uruchomić go w modelu spoza listy `budowal`; przy `false` można użyć tego samego modelu, ale runda będzie nieniezależna;
  - `false` → Następny krok: `skill zamknij <slug>`.
- Sprawdź, czy każde fałszywe założenie z tej sesji ma lekcję w `.ai/lekcje.md` (krok 6). Jeśli pomógł albo nie pasował wzorzec — dopisek `Wzorzec:` w lekcji.
- Commit tylko plików tego ticketu (kod, testy, ticket, mapa, przy ostatnim tickecie także `ROADMAP.md`): `<slug>#<nr>: <tytuł>`, według `### Commit` w kontrakcie — skan sekretów przed commitem, `Closes #<github>` przy trackerze GitHub, potem push według `git.push`.
- Ostatni ticket i `git.galezie` = `zdolnosc` → po pushu PR w wersji roboczej z szablonu `../../szablony/pr.md` (kontrakt, `### Gałęzie i PR`). Komendę pokazujesz przed uruchomieniem, a adres PR podajesz w raporcie — nie zapisujesz go w `.ai/`, bo odnajdzie go `gh pr view zdolnosc/<slug>`.

## 10. Stop

Raport: co zrobione, wynik walidacji, skan sekretów (narzędzie albo ręczny), hash commita, czy wypchnięty, następny krok. **Nie zaczynasz następnego ticketu sam** — użytkownik jawnie uruchamia skill `buduj` ponownie, najlepiej w świeżej sesji.
