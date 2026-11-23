---
nr: "06"
tytul: Repozytorium warsztatu — kanał bezpieczeństwa, formularz, ochrona rdzenia
status: do-zrobienia
blokowany-przez: ["02"]
scenariusze: ["S13", "S14"]
budowal: null
github: 8
---

# 06 — Repozytorium warsztatu — kanał bezpieczeństwa, formularz, ochrona rdzenia

## Co widać po zrobieniu

Repozytorium warsztatu (`github.repo` z `.ai/warsztat.json` tego repozytorium, dziś publiczne) ma:
- politykę bezpieczeństwa po angielsku, z włączonym prywatnym zgłaszaniem podatności;
- etykiety `process-report`, `status: new`, `status: accepted`, `status: discussion`;
- formularz zgłoszenia `process-report.yml` z polami szkicu;
- plik właścicieli kodu i regułę gałęzi głównej, które spełniają obietnicę automatu z zasady Z01.

Retro, gdy użytkownik powie, że wysłane zgłoszenie zawierało sekret albo dane projektu, pokazuje procedurę po wycieku.

## Kryteria akceptacji

- [ ] S13: test akceptacyjny przechodzi dla obu wariantów (sekret, dane projektu). Odpowiedź zawiera wszystkie kroki ze specu i zdanie o powiadomieniach e-mail i webhookach, a w zapisie atrapy nie ma wywołań `gh`, które zmieniają stan.
- [ ] S14: sprawdzone ręcznie, przez obejrzenie formularza w przeglądarce na GitHubie, z wynikiem w Notatkach:
  - pola są w kolejności szkicu (S2);
  - formularz nadaje etykiety `process-report` i `status: new`;
  - ma ostrzeżenie o publicznym repozytorium;
  - problemy bezpieczeństwa odsyła do kanału bezpieczeństwa.
- [ ] Polityka bezpieczeństwa mówi: jak zgłosić podatność prywatnie, czego nie wpisywać do publicznych Issues i które wersje są wspierane (dziś najnowsza). Prywatne zgłaszanie podatności jest włączone; odczyt przez `gh api` w Notatkach.
- [ ] Ochrona rdzenia:
  - plik właścicieli kodu wskazuje opiekuna dla całego repozytorium;
  - reguła gałęzi głównej wymaga akceptacji właściciela kodu, a rola administratora jest na liście obejść, więc opiekun scala własne zmiany sam;
  - odczyt ustawień przez `gh api` w Notatkach;
  - pole `Egzekwowanie` zasady Z01 w `.ai/ZASADY.md` podaje ten automat.
- [ ] Każda zmiana ustawień publicznego repozytorium (etykiety, prywatne zgłaszanie, reguła gałęzi) dzieje się po zgodzie użytkownika w sesji budowy, po pokazaniu komend.
- [ ] Procedura po wycieku:
  - cytaty z dokumentacji GitHuba sprawdzone dosłownie na stronach źródłowych z badania o wycieku w Issue, a rozbieżności poprawione w badaniu;
  - procedura stoi w kontrakcie, w sekcji o zgłoszeniach warsztatu (jedno miejsce), a retro do niej odsyła.
- [ ] Link formularza z ticketu 05 dostaje parametr `template=process-report.yml`, jeśli ticket 05 jest już zrobiony.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Migracja istniejących wpisów — ticket 07.

## Notatki

- Formularz, polityka i plik właścicieli kodu leżą w repozytorium warsztatu poza `plugins/ai`, więc nie zmieniają wersji pluginu.
- Reguła gałęzi głównej nie może blokować obecnego sposobu pracy z `.ai/warsztat.json` → `git` (gałęzie zdolności, scalanie). Sprawdź to jednym scaleniem próbnym albo odczytem obejść przed włączeniem.
