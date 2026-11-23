# Spec: Model zgłoszeń

> Kontrakt zdolności. Bez kodu i bez ścieżek plików — opisuje zachowanie, nie implementację.
> Zaakceptowany: 2026-11-22; zmieniony 2026-11-22: S21–S32 wydzielone do zdolności katalog-spolecznosci

## Problem

Retro zakłada dziś, że użytkownik ma zapis w repozytorium warsztatu i sam wdraża zgłoszenia z pliku zgłoszeń w korzeniu tego repozytorium. Po publikacji warsztatu wielu użytkowników będzie natrafiać na problemy procesu. Bez wspólnego kanału i filtra ich poprawki rozmyją rdzeń, a zgłoszenia mogą wynieść dane z cudzych projektów do publicznego repozytorium.

## Rozwiązanie

- **Użytkownik warsztatu** w swoim projekcie dostaje od retro gotowy, oczyszczony szkic zgłoszenia, gdy problem procesu powtórzył się w projekcie wystarczająco często. Po jego zgodzie retro zakłada Issue w repozytorium zgłoszeń albo dopisuje wystąpienie do istniejącego. Bez narzędzia `gh` dostaje linki do wyszukiwania i do wypełnionego formularza. Problem bezpieczeństwa samego warsztatu retro kieruje do kanału bezpieczeństwa, nigdy do publicznego Issue.
- **Opiekun** ma jedno źródło zgłoszeń: Issues z etykietą zgłoszenia w repozytorium warsztatu. Retro w repozytorium warsztatu porządkuje je według sygnału globalnego, czyli wystąpień od różnych osób. Plik zgłoszeń w repozytorium znika.
- **Autor profilu albo wzorca** — osobny plugin katalogu społeczności: zdolność [katalog-spolecznosci](../katalog-spolecznosci/spec.md).

## Scenariusze

Scenariusze S1–S14 dotyczą retro w projekcie użytkownika. S15–S20 dotyczą repozytorium warsztatu; S21–S32 przeniesiono do zdolności katalogu społeczności.

### Wysyłka zgłoszenia z projektu

S1. Próg lokalny — Zakładając lekcję `[warsztat]` z daną liczbą wystąpień w projekcie i włączone repozytorium zgłoszeń, gdy użytkownik uruchamia retro, wtedy retro proponuje wysłanie zgłoszenia dopiero od 3 wystąpień, a poniżej progu lekcja zostaje lekcją bez propozycji.

| Lekcja `[warsztat]` | Wynik retro |
| --- | --- |
| 2 wystąpienia zgrzytu w skillu `spec` | zostaje lekcją, brak propozycji wysyłki |
| 3 wystąpienia zgrzytu w skillu `spec` | szkic zgłoszenia i pytanie o zgodę |
| 1 wystąpienie: skill skasował niezacommitowane zmiany (utrata danych) | szkic zgłoszenia od razu |
| 1 wystąpienie: `buduj` zacommitował `.env` (bezpieczeństwo) | kanał bezpieczeństwa, S4 |

Utrata danych to sytuacja, w której skill albo hook warsztatu usunął lub nadpisał pracę użytkownika (pliki, niezacommitowane zmiany, zapisy w `.ai/`) tak, że nie da się jej odzyskać z gita. Rodzaj problemu (zwykły, utrata danych, bezpieczeństwo) ocenia retro i podaje go w szkicu, a użytkownik może go zmienić przed zgodą.

S2. Szkic w stałych polach — Zakładając lekcję, która przeszła próg, gdy retro przygotowuje zgłoszenie, wtedy pokazuje użytkownikowi szkic zgłoszenia złożony wyłącznie z pól: wersja warsztatu, agent i model, skill i krok (plik w pluginie warsztatu), objaw opisany słowami warsztatu, liczba wystąpień i ich daty, proponowany kierunek — i niczego nie wysyła przed jawną zgodą.

S3. Bez zgody nic nie wychodzi — Zakładając pokazany szkic zgłoszenia, gdy użytkownik odmawia albo sesja nie pozwala zapytać (tryb nieinteraktywny), wtedy retro niczego nie wysyła, a lekcja zostaje z dopiskiem `niewysłane`.

S4. Problem bezpieczeństwa warsztatu — Zakładając lekcję o problemie bezpieczeństwa samego warsztatu (wyciek sekretu, ominięta kontrola, przyznane za szerokie uprawnienie), gdy retro ją ocenia, wtedy już przy pierwszym wystąpieniu wskazuje kanał bezpieczeństwa (polityka bezpieczeństwa i prywatne zgłoszenie podatności) i nie proponuje publicznego Issue — także przy repozytorium zgłoszeń ustawionym na `null`, przy którym tylko wskazuje kanał, niczego nie wysyłając.

S5. Filtr prywatności — Zakładając szkic zgłoszenia, gdy retro go sprawdza przed pokazaniem, wtedy każde pole sprawdza osobno: brak pojęć ze słownika projektu, brak ścieżek plików śledzonych w repozytorium projektu, brak kodu, nazw projektu i danych osobowych, a cały szkic przechodzi skan sekretów. Pole z trafieniem retro przepisuje słowami warsztatu albo usuwa i mówi użytkownikowi, co i dlaczego zmienił; trafienie skanu sekretów zatrzymuje wysyłkę.

| Treść pola szkicu | Wynik filtra |
| --- | --- |
| „skill `spec` nie pyta o próg przed zapisem scenariusza” | przechodzi |
| „w `src/billing/invoice.ts` spec pominął…” | ścieżka projektu → pole przepisane bez ścieżki |
| „przy pojęciu Faktura korygująca…” (pojęcie ze słownika projektu) | pojęcie projektu → pole przepisane słowami warsztatu |
| „krok 3 w skillu `retro`” (plik pluginu warsztatu) | przechodzi — ścieżka warsztatu, nie projektu |
| fragment z tokenem dostępu | skan sekretów → wysyłka zatrzymana |
| „zgłasza: Jan Kowalski, `jan@example.com`” | dane osobowe → pole przepisane bez nich |

S6. Najpierw szukaj podobnego — Zakładając zgłoszenie gotowe do wysłania i działające `gh`, gdy w repozytorium zgłoszeń jest otwarte zgłoszenie o tym samym problemie, wtedy retro proponuje dopisanie komentarza „wystąpienie” (pola: data, wersja, agent i model, skill i krok, objaw) zamiast nowego Issue; użytkownik wybiera między komentarzem a nowym zgłoszeniem.

S7. Ślad wysłania — Zakładając wysłane zgłoszenie albo komentarz, gdy retro kończy wysyłkę, wtedy lekcja zostaje w lekcjach projektu z dopiskiem `Zgłoszenie: <link>`, a nie jest usuwana.

S8. Kolejne wystąpienie wysłanej lekcji — Zakładając lekcję z dopiskiem `Zgłoszenie: <link>`, gdy dochodzi do niej nowe wystąpienie, wtedy retro proponuje komentarz „wystąpienie” do tego zgłoszenia, bez ponownego progu i bez nowego Issue.

S9. Naprawione w nowszej wersji — Zakładając zgłoszenie gotowe do wysłania i działające `gh`, gdy zainstalowana wersja warsztatu jest starsza od najnowszego wydania, a historia zmian warsztatu ma wpis o tym skillu i kroku, wtedy retro proponuje aktualizację warsztatu zamiast zgłoszenia. Bez `gh` retro pomija to sprawdzenie i mówi o tym.

S10. Bez `gh` — Zakładając zgłoszenie gotowe do wysłania, gdy `gh` nie jest zainstalowane albo zalogowane, wtedy retro daje dwa linki: wyszukiwanie podobnych zgłoszeń w repozytorium zgłoszeń i formularz nowego Issue wypełniony tytułem i treścią szkicu. Gdy pełny link przekroczyłby limit długości, link formularza ma tylko tytuł, a treść szkicu retro pokazuje do wklejenia.

| Długość pełnego linku formularza | Wynik |
| --- | --- |
| 5 999 znaków | link z tytułem i treścią |
| 6 000 znaków | link z tytułem i treścią |
| 6 001 znaków | link z samym tytułem + treść do wklejenia |

S11. Bez konta GitHub — Zakładając zgłoszenie gotowe do wysłania, gdy użytkownik wybiera „nie mam konta / nie wysyłam”, wtedy zgłoszenie zostaje lokalną lekcją z dopiskiem `niewysłane`, a retro nie proponuje go ponownie, dopóki nie dojdzie nowe wystąpienie.

S12. Repozytorium zgłoszeń z ustawienia — Zakładając lekcję ponad progiem, gdy retro ustala, dokąd wysłać, wtedy bierze repozytorium zgłoszeń z ustawienia projektu.

| Ustawienie w `warsztat.json` projektu | Wynik |
| --- | --- |
| brak klucza (stary projekt) | oficjalne repozytorium warsztatu |
| brak klucza, a plugin warsztatu nie podaje adresu oficjalnego repozytorium (wersja sprzed publikacji) | jak `null`, z informacją „repozytorium zgłoszeń nieznane” |
| oficjalne repozytorium (domyślnie) | oficjalne repozytorium warsztatu |
| własne repozytorium (fork, firma) | to repozytorium |
| `null` | brak propozycji wysyłki, także przy 3 wystąpieniach; lekcja zostaje; S4 nadal wskazuje kanał bezpieczeństwa |

S13. Procedura po wycieku — Zakładając wysłane zgłoszenie, gdy użytkownik mówi w retro, że zawierało sekret albo dane projektu, wtedy retro pokazuje kroki: przy sekrecie — uznać go za ujawniony i unieważnić albo zmienić, edytować treść, usunąć poprzednią wersję z historii edycji, poprosić opiekuna kanałem bezpieczeństwa o usunięcie Issue, przy danych uwierzytelniających zgłosić do GitHub Support; przy danych projektu — edycja, usunięcie wersji z historii, prośba kanałem bezpieczeństwa o usunięcie Issue. Retro dodaje, że usunięcie nie cofa wysłanych już powiadomień e-mail ani webhooków.

S14. Szablon formularza — Zakładając repozytorium warsztatu po wdrożeniu, gdy ktoś otwiera formularz nowego zgłoszenia w przeglądarce, wtedy formularz ma po angielsku te same pola co szkic zgłoszenia (S2), nadaje etykietę zgłoszenia i ostrzega, że repozytorium jest publiczne, a problemy bezpieczeństwa idą kanałem bezpieczeństwa. — ręcznie: formularz i jego etykiety widać tylko w interfejsie GitHuba.

### Repozytorium warsztatu — opiekun

S15. Jedno źródło zgłoszeń — Zakładając wdrożoną zdolność, gdy ktokolwiek szuka zgłoszeń warsztatu, wtedy jedynym miejscem są Issues z etykietą zgłoszenia w repozytorium warsztatu: pliku zgłoszeń nie ma, a kontrakt, skille i szablony nie odsyłają do niego.

S16. Migracja otwartych wpisów — Zakładając otwarte wpisy pliku zgłoszeń z dnia wdrożenia, gdy opiekun przeprowadza migrację, wtedy każdy krótki wpis staje się jednym Issue z etykietą zgłoszenia i etykietą swojego statusu, z wystąpieniami w treści, a wpis z długim planem i decyzjami (jak dzisiejszy Z09) trafia do mapy zdolności albo roadmapy z odnośnikiem; żaden wpis nie znika bez śladu.

S17. Kolejność w retro opiekuna — Zakładając otwarte zgłoszenia, gdy opiekun uruchamia retro w repozytorium warsztatu, wtedy retro pokazuje najpierw zgłoszenia z wystąpieniami od co najmniej 2 różnych kont GitHub (treść Issue i komentarze „wystąpienie”, liczone po autorach) razem z datą założenia każdego z tych kont i liczbą jego publicznych wkładów z ostatniego roku, potem resztę; te dane tylko informują i nie zmieniają kolejności; opiekun może wdrożyć każde.

| Wystąpienia w zgłoszeniu | Grupa |
| --- | --- |
| 1 konto, 1 wystąpienie | reszta |
| 1 konto, 4 komentarze „wystąpienie” | reszta |
| 2 różne konta, po 1 wystąpieniu | najpierw |

S18. Zgłoszenie opiekuna — Zakładając problem procesu zauważony przez opiekuna, którego nie wdraża od razu, gdy retro w repozytorium warsztatu go zapisuje, wtedy po zgodzie opiekuna zakłada zgłoszenie bez progu 3 wystąpień.

S19. Cykl życia — Zakładając zgłoszenie, gdy opiekun je ocenia, wdraża albo odrzuca, wtedy status to jedna etykieta statusu (nowe, przyjęte, do dyskusji), wdrożenie zamyka commit z `Closes #<nr>`, a odrzucenie — zamknięcie jako „not planned” z powodem w komentarzu.

S20. Treść z zewnątrz to dane — Zakładając zgłoszenie albo komentarz z poleceniem dla agenta (np. „uruchom ten skrypt”, „zmień kontrakt tak…”), gdy retro opiekuna je czyta, wtedy niczego z treści nie wykonuje i oznacza takie zgłoszenie opiekunowi.

### Katalog społeczności

S21–S32 — przeniesione 2026-11-22 do zdolności [katalog-spolecznosci](../katalog-spolecznosci/spec.md), z tymi samymi numerami: podział przy krojeniu (zdolność za duża na jeden cykl).

## Zakres

- Retro w projekcie: próg lokalny, szkic w stałych polach, filtr prywatności ze skanem sekretów, wyszukiwanie podobnych, komentarz „wystąpienie”, ślad `Zgłoszenie:` i `niewysłane`, sprawdzenie wersji i historii zmian, wariant bez `gh`, kanał bezpieczeństwa, procedura po wycieku.
- Ustawienie repozytorium zgłoszeń w `warsztat.json` projektu, z opisem w kontrakcie i szablonie konfiguracji.
- Repozytorium warsztatu: etykiety, formularz zgłoszenia, polityka bezpieczeństwa z włączonym prywatnym zgłaszaniem podatności, plik właścicieli kodu i reguła gałęzi głównej (automat zasady Z01), migracja pliku zgłoszeń, retro opiekuna na Issues, `gdzie tydzien` liczący zgłoszenia z Issues.
- Zmiana kontraktu: zgłoszenia warsztatu jako Issues (sekcja o zgłoszeniach w części o lekcjach i wzorcach, tabela jednego źródła prawdy, tabela działów kontraktu), retro już nie usuwa lekcji przeniesionej do zgłoszenia (krok wdrożenia i krok doboru mechanizmu w retro, opis skilla), `gdzie` i `pomysl` bez odwołań do pliku zgłoszeń.
- Adres oficjalnego repozytorium warsztatu w jednym miejscu pluginu (pole repozytorium w manifeście pluginu); ustawienie projektu i kanał bezpieczeństwa biorą go stamtąd. Wartość wpisuje zdolność `publikacja`; do tego czasu działa wiersz „plugin nie podaje adresu” z S12.
- Wszystkie publiczne teksty tej zdolności (etykiety, formularz, komentarz „wystąpienie”, polityka bezpieczeństwa) po angielsku; adres repozytorium zgłoszeń jest wartością ustawienia, nie stałą w tekstach.

## Poza zakresem

- Plugin katalogu społeczności (S21–S32) — zdolność [katalog-spolecznosci](../katalog-spolecznosci/spec.md), wydzielona przy krojeniu 2026-11-22.
- PR-y od innych osób do rdzenia — rdzeń przyjmuje tylko zgłoszenia ([ADR 0001](../../decyzje/0001-rdzen-i-katalog-spolecznosci.md)).
- Plik zgłoszeń jako lokalna kolejka obok Issues — odrzucone po drugiej opinii; jedno źródło wygrało z pracą offline.
- Podział zdolności na etapy przed i po publikacji — opiekun wybrał pełny zakres od publikacji.
- Weryfikacja tożsamości kont w sygnale globalnym — ryzyko wielu kont przyjęte, sygnał tylko porządkuje listę.
- Hook odczytu plików rdzenia (zgłoszenie Z14) i stan projektu w Codexie (Z15) — osobne zgłoszenia; ta zdolność tylko przenosi je do Issues.
- Tłumaczenie skilli, kontraktu i nazw na angielski — zdolność `wersja-angielska`.
- README, wersjonowanie i historia zmian warsztatu — zdolność `publikacja`; S9 korzysta z historii zmian, gdy już istnieje.
- Automatyczne wykrywanie wycieku w wysłanym zgłoszeniu — retro reaguje na informację od użytkownika (S13); główną obroną jest filtr przed wysłaniem.

## Decyzje projektowe

- **Rdzeń przyjmuje od innych tylko zgłoszenia** — [ADR 0001](../../decyzje/0001-rdzen-i-katalog-spolecznosci.md); zasada Z01 dostaje po wdrożeniu automat: plik właścicieli kodu i reguła gałęzi głównej z wymaganą akceptacją opiekuna w repozytorium warsztatu.
- **Kto wysyła.** Retro w projekcie użytkownika, z jego konta, przez `gh`; każda wysyłka (Issue i komentarz) po jawnej zgodzie na pokazanym szkicu. Wysyłki nie robi żaden hook ani inny skill.
- **Kolejność sprawdzeń przed szkicem:** próg i rodzaj problemu (bezpieczeństwo → kanał bezpieczeństwa, koniec) → ustawienie repozytorium zgłoszeń (`null` → koniec) → wersja i historia zmian (S9) → filtr prywatności (S5) → wyszukiwanie podobnych (S6) → pytanie o zgodę.
- **Trzy liczniki wystąpień** ze słownika pozostają rozłączne: próg lokalny 3 (lekcja w projekcie), sygnał globalny 2 konta (zgłoszenie), `potwierdzony` od 2 projektów (wzorzec, pozycja katalogu).
- **Etykiety po angielsku** (propozycja do akceptacji): `process-report` dla zgłoszenia oraz statusy `status: new`, `status: accepted`, `status: discussion`; komentarz „wystąpienie” zaczyna się nagłówkiem `Occurrence`. Mapa nazywała je po polsku — decyzja o języku publicznej wersji ma pierwszeństwo.
- **Limit linku formularza: 6 000 znaków** pełnego adresu — wartość ostrożna; budowa sprawdza ją pomiarem na GitHubie i może ją tylko obniżyć.

## Testy

- **Poziom.** Warsztat nie ma dziś testów skilli; testem akceptacyjnym scenariusza retro (S1–S13, S17–S20) jest skryptowana sesja agenta (`claude -p`) w tymczasowym projekcie poza repozytorium, z przygotowanymi plikami `.ai/` i atrapą `gh`, która zapisuje wywołania i zwraca zadane odpowiedzi — GitHub to jedyna mockowana granica. Wynik sprawdza skrypt testu: wywołania atrapy (czy było `issue create`, `issue comment`, z jaką treścią), plik lekcji po sesji i tekst odpowiedzi. Zgodę i odmowę daje kolejna tura sesji. Atrapa `gh` sprawdza argumenty, a nie przyjmuje wszystkiego.
- **S9** atrapa `gh` zwraca najnowsze wydanie i historię zmian z wpisem o danym skillu i kroku (oraz bez wpisu); bez `gh` test sprawdza komunikat o pominięciu.
- **Migracja i jedno źródło** (S15, S16): skrypt sprawdzający, że pliku zgłoszeń nie ma, że w pluginie nie ma do niego odwołań i że każdy numer wpisu z ostatniej wersji pliku ma Issue albo odnośnik w mapie lub roadmapie.
- **Konfiguracja GitHuba** (S14, polityka bezpieczeństwa): odczyt ustawień przez `gh api` (etykiety, prywatne zgłaszanie podatności) plus ręczne obejrzenie formularza — lista w odbiorze.
- **Ślad.** Każdy test ma numer scenariusza w nazwie (`S5: …`).
- **Niezmienniki ze słownika:** zgłoszenie bez danych projektu — S5; problem bezpieczeństwa poza publicznym zgłoszeniem — S4, S12; trzy liczniki nie sumują się — S1, S17 (licznik wzorca — zdolność katalogu).

## Ryzyka i kwestie nieblokujące

- **Filtr prywatności nie jest szczelny** — opis słowami warsztatu może nadal zdradzić projekt. Zabezpieczenia: stałe pola, kontrola każdego pola, skan sekretów i zgoda na pokazanym szkicu; reszta to procedura po wycieku (S13).
- **Brzmienie cytatów** z dokumentacji GitHuba w procedurze po wycieku pochodzi z narzędzia streszczającego; przy budowie sprawdzić dosłownie na stronach źródłowych ([badanie](../../badania/2026-11-22-wyciek-w-issue-github.md)).
- **Rzadkie skille mogą nie dobić progu 3** — świadomy koszt mniejszego szumu.
- **Zależność od GitHuba** — praca nad zgłoszeniami opiekuna wymaga GitHuba; świadomy koszt jednego źródła.
