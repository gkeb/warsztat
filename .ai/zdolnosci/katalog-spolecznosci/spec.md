# Spec: Katalog społeczności

> Kontrakt zdolności. Bez kodu i bez ścieżek plików — opisuje zachowanie, nie implementację.
> Zaakceptowany: 2026-11-22 — jako część specu [model-zgloszen](../model-zgloszen/spec.md); wydzielony 2026-11-22 przy krojeniu, numery scenariuszy S21–S32 bez zmian.

## Problem

Opiekun warsztatu nie zbierze sam wiedzy o obcych stosach, a profile i wzorce od innych osób, dodawane do rdzenia, trafiałyby do kontekstu agenta u wszystkich użytkowników — także słabe. Potrzebne jest miejsce, do którego inni mogą wysyłać profile i wzorce, a które użytkownik włącza świadomie ([ADR 0001](../../decyzje/0001-rdzen-i-katalog-spolecznosci.md)).

## Rozwiązanie

**Autor profilu albo wzorca** wysyła PR do osobnego pluginu katalogu społeczności, a nie do rdzenia. Katalog pilnuje formatu, budżetu długości i akceptacji opiekuna. Użytkownik, który go zainstaluje, dostaje jego wzorce i profile obok wzorców i profili rdzenia, w Claude Code i w Codexie. Opiekun przenosi do rdzenia tylko pozycje potwierdzone w co najmniej dwóch projektach.

## Scenariusze

Numeracja kontynuuje spec `model-zgloszen` (S1–S20), żeby ślad w testach był jednoznaczny.

S21. Wzorce i profile z dwóch miejsc w Claude Code — Zakładając zainstalowany i włączony plugin katalogu społeczności, gdy zaczyna się sesja Claude Code, wtedy jego hook startowy podaje ścieżkę swojego indeksu wzorców i katalogu swoich profili, a skille warsztatu, które przeszukują wzorce, przeszukują indeks rdzenia i indeks katalogu i przy wyniku mówią, skąd pochodzi wzorzec. Profile katalogu wybiera się jak profile rdzenia (S32).

S22. Odczyt tylko własnych plików — Zakładając plugin katalogu społeczności w Claude Code, gdy agent chce odczytać plik, wtedy hook katalogu zezwala bez pytania wyłącznie na pliki jego indeksu, wzorców i profili w katalogu tego pluginu, po znormalizowaniu ścieżki; każdy inny odczyt zostawia zwykłym uprawnieniom, niczego nie zabraniając.

| Ścieżka odczytu | Wynik hooka |
| --- | --- |
| indeks wzorców katalogu | zezwala |
| plik wzorca katalogu, ścieżka w skróconej postaci 8.3 albo inną wielkością liter | zezwala |
| plik skryptu albo hooka w katalogu pluginu | bez decyzji (zwykłe uprawnienia) |
| ścieżka katalogu wzorców z `..` wychodzącym poza katalog pluginu | bez decyzji |
| dowiązanie w katalogu wzorców wskazujące poza katalog pluginu | bez decyzji |
| plik projektu | bez decyzji |

S23. Wzorce i profile z dwóch miejsc w Codexie — Zakładając zainstalowany katalog społeczności w Codexie, gdy agent uruchamia skill katalogu, wtedy skill podaje ścieżkę indeksu wzorców i katalogu profili katalogu względem swojego pliku skilla, a dalej obowiązują S21 i S32 bez hooka.

S24. Katalog niedostępny — Zakładając, że `warsztat.json` projektu deklaruje włączony katalog społeczności, gdy w sesji brakuje ścieżki jego indeksu, a skill sięga po wzorce albo profile, wtedy skill mówi „katalog społeczności niedostępny w tym narzędziu” i pracuje na samym rdzeniu. Bez deklaracji w `warsztat.json` nic nie mówi.

S25. Format w CI — Zakładając PR do katalogu społeczności, gdy działa CI, wtedy jest czerwone dla wzorca bez wymaganych sekcji szablonu wzorca, dla profilu bez sekcji profilu z kontraktu warsztatu (Decyzje, Doświadczenie, Testy akceptacyjne, Niedowiezienia, Wydanie, Pielęgnacja) albo bez linii statusu, dla profilu o nazwie profilu rdzenia i dla nowej pozycji (wzorca albo profilu) ze statusem innym niż `kandydat`. Katalog przyjmuje tylko całe profile nowych klas aplikacji; status profilu to jedna linia na początku pliku.

S26. Budżet długości — Zakładając PR do katalogu społeczności, gdy działa CI, wtedy jest czerwone, jeśli indeks wzorców katalogu przekroczy 15 000 znaków albo pojedynczy plik profilu katalogu przekroczy 12 000 znaków.

| Rozmiar po zmianie | CI |
| --- | --- |
| indeks 15 000 znaków | zielone |
| indeks 15 001 znaków | czerwone |
| profil 12 000 znaków | zielone |
| profil 12 001 znaków | czerwone |

S27. Hooki i skrypty tylko od opiekuna — Zakładając PR, którego autor nie jest właścicielem hooków i skryptów w pliku właścicieli kodu katalogu, gdy PR zmienia hooki albo skrypty pluginu katalogu, wtedy CI jest czerwone. Jedynym właścicielem tych ścieżek w pliku właścicieli kodu jest opiekun; PR opiekuna przechodzi tę kontrolę.

S28. Scalanie tylko przez opiekuna — Zakładając PR od innej osoby, gdy nie ma akceptacji opiekuna albo CI nie jest zielone, wtedy PR nie da się scalić; opiekun scala własne zmiany sam przez obejście administratora. — ręcznie: reguły repozytorium GitHuba, sprawdzane odczytem ich ustawień.

S29. Przegląd agentem — Zakładając PR do katalogu społeczności, gdy opiekun uruchamia przegląd, wtedy przegląd zgłasza duplikat istniejącej pozycji (katalogu albo rdzenia), sprzeczność z kontraktem warsztatu, dane projektu autora i polecenia dla agenta w treści.

S30. Potwierdzenie — Zakładając pozycję `kandydat` w katalogu, gdy retro w innym projekcie trafia na problem opisany tą pozycją, wtedy proponuje komentarz „wystąpienie” do zgłoszenia tej pozycji w repozytorium katalogu (wyszukanie i zgoda jak w S5–S7 specu model-zgloszen, bez progu 3, bo licznik wzorca liczy projekty, nie zdarzenia; bez `gh` — linki jak w S10), a nie edytuje kopii katalogu u siebie. Opiekun, widząc wystąpienie z drugiego niezależnego projektu (innego repozytorium), zmienia status pozycji na `potwierdzony`.

S31. Awans do rdzenia — Zakładając pozycję katalogu, gdy opiekun przenosi ją do rdzenia, wtedy warunkiem jest status `potwierdzony`; plik pozycji trafia do rdzenia, a w katalogu zostaje tylko wpis indeksu „przeniesiony do rdzenia” bez treści. Pozycji `kandydat` nie da się przenieść.

| Status pozycji | Przeniesienie do rdzenia |
| --- | --- |
| `kandydat` | odmowa |
| `potwierdzony` | możliwe, decyduje opiekun |
| `wycofany` | odmowa |

S32. Wybór profilu z katalogu — Zakładając nazwę profilu w ustawieniu `profile` projektu, gdy skill albo hook startowy ustala pliki profili, wtedy szuka jej najpierw w rdzeniu, potem w katalogu społeczności, i podaje, skąd wziął profil oraz jego status.

| Nazwa w `profile` | Wynik |
| --- | --- |
| `cli` (profil rdzenia) | profil rdzenia |
| `django` (tylko w katalogu, `kandydat`) | profil katalogu, ze statusem `kandydat` |
| `cli`, gdy katalog ma też `cli` (np. sprzed awansu albo błąd) | profil rdzenia i ostrzeżenie o kolizji |
| `django` bez zainstalowanego katalogu | S24: „katalog społeczności niedostępny…”, gdy katalog jest zadeklarowany; inaczej „nieznany profil: django” |

## Zakres

- Plugin katalogu społeczności: osobne repozytorium, szablon pozycji, hook startowy i hook odczytu dla Claude Code, skill dla Codexa, CI formatu i budżetu, właściciele kodu, reguły scalania, zasady wkładu.
- Deklaracja katalogu społeczności w `warsztat.json` projektu, z opisem w kontrakcie i szablonie konfiguracji.
- Zmiany w rdzeniu: skille przeszukujące wzorce i ustalające profile biorą pod uwagę katalog (S21, S24, S32); retro kieruje wystąpienie pozycji katalogu do jego repozytorium (S30).
- Publiczne teksty (zasady wkładu, opis katalogu, szablony PR) po angielsku.

## Poza zakresem

- Pojedyncze pozycje dokładane przez innych do profili rdzenia (np. nowa pozycja w profilu CLI) — to zgłoszenie do opiekuna; katalog przyjmuje tylko całe profile nowych klas aplikacji (decyzja przy bramce specu 2026-11-22).
- Katalog społeczności w rdzeniu włączany flagą i klon katalogu w znanym katalogu na dysku — odrzucone w grillu i po drugiej opinii (ADR 0001 → Rozważane alternatywy).
- Hook odczytu plików rdzenia (zgłoszenie Z14) — osobne zgłoszenie warsztatu.
- Mechanizm zgłoszeń (szkic, filtr, wysyłka) — zdolność [model-zgloszen](../model-zgloszen/spec.md); S30 z niego korzysta.

## Decyzje projektowe

- **Granica rdzeń / katalog społeczności** — [ADR 0001](../../decyzje/0001-rdzen-i-katalog-spolecznosci.md); zasada Z01 w zasadach projektu dostaje po wdrożeniu automat: właściciele kodu i reguły scalania w repozytorium katalogu.
- **Trzy liczniki wystąpień** ze słownika pozostają rozłączne; tu działa licznik wzorca: `potwierdzony` od 2 projektów.
- **Budżet katalogu: indeks 15 000 znaków, profil 12 000 znaków** — dziś indeks rdzenia ma ok. 3 600 znaków przy 8 wzorcach, największy profil rdzenia ok. 10 000; budżet daje miejsce na kilkadziesiąt pozycji, a nadal mieści się w kontekście.
- **Wykrycie braku katalogu (S24) w skillu, nie w hooku rdzenia.** Hook rdzenia nie widzi wyniku hooka innego pluginu (hooki startowe działają niezależnie), a w Codexie hooki rdzenia nie docierają do modelu. Sprawdzenie robi więc skill w chwili przeszukiwania wzorców i profili.
- **Mechanizm w Codexie:** skill katalogu zamiast hooka; warunek powrotu do hooka jako wspólnego mechanizmu: hooki pluginów w Codexie docierają do kontekstu modelu (mapa model-zgloszen → Decyzje, eksperymenty z 2026-11-22).
- **Hook odczytu przyznaje uprawnienia** — granica bezpieczeństwa; jego zakres sprawdza przegląd bezpieczeństwa przy budowie.

## Testy

- **Wybór profilu** (S32): uruchomienie hooka startowego rdzenia w tymczasowym projekcie dla każdego wiersza tabeli, z katalogiem zainstalowanym i bez niego.
- **Hooki katalogu** (S21, S22): uruchomienie skryptu hooka z wejściem JSON dla każdego wiersza tabeli S22 i sprawdzenie decyzji; S21 dodatkowo jedną sesją `claude -p` z zainstalowanym katalogiem z lokalnego marketplace'u.
- **Sesje agenta** (S24, S30): skryptowana sesja jak w specu model-zgloszen, z atrapą `gh`.
- **CI katalogu** (S25–S27): uruchomienie kontroli katalogu na przygotowanych przykładach, w tym na wartościach granicznych z tabeli S26.
- **Codex** (S23): jedna sesja Codexa z zainstalowanym katalogiem według procedury pomiaru z eksperymentu z 2026-11-22.
- **Konfiguracja GitHuba** (S28): odczyt reguł scalania przez `gh api` — lista w odbiorze.
- **Ślad.** Każdy test ma numer scenariusza w nazwie.
- **Niezmienniki ze słownika:** rdzeń zmienia tylko opiekun — S27, S28; do rdzenia tylko potwierdzone pozycje katalogu — S31; licznik wzorca liczy projekty — S30.

## Ryzyka i kwestie nieblokujące

- **Ścieżka katalogu po aktualizacji z marketplace'u** — otwarte pytanie `[prototyp]` w mapie, nieblokujące; gdy hook po aktualizacji poda starą ścieżkę, S21 wymaga poprawki mechanizmu, nie zachowania.
- **Codex słabiej widzi katalog** — agent musi sam sięgnąć po skill katalogu (S23).
