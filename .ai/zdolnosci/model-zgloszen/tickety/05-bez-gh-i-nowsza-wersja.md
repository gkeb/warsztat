---
nr: "05"
tytul: Zgłoszenie bez gh i sprawdzenie nowszej wersji
status: zrobione
blokowany-przez: ["02"]
scenariusze: ["S9", "S10"]
budowal: "Claude Code / claude-opus-5-5"
github: 7
---

# 05 — Zgłoszenie bez gh i sprawdzenie nowszej wersji

## Co widać po zrobieniu

- **Bez `gh` albo bez logowania.** Retro daje dwa linki: wyszukiwanie podobnych zgłoszeń i formularz nowego Issue z tytułem i treścią szkicu. Gdy link przekroczyłby 6 000 znaków, ma sam tytuł, a treść jest do wklejenia.
- **Z działającym `gh`.** Retro przed wysłaniem porównuje zainstalowaną wersję z najnowszym wydaniem i przeszukuje historię zmian warsztatu. Trafienie daje propozycję aktualizacji zamiast zgłoszenia.

## Kryteria akceptacji

- [x] S10: test akceptacyjny przechodzi dla wierszy tabeli (5 999, 6 000 i 6 001 znaków), dla niezalogowanego `gh` (atrapa zwraca błąd `gh auth status`) i dla braku `gh` w `PATH`.
- [x] S9: test akceptacyjny przechodzi w trzech wariantach:
  - starsza wersja i wpis w historii zmian → propozycja aktualizacji, bez `issue create`;
  - starsza wersja bez wpisu → zwykły szkic;
  - bez `gh` → komunikat o pominięciu sprawdzenia.
- [x] Linki, z kodowaniem procentowym:
  - wyszukiwanie: `<repozytorium>/issues?q=<zapytanie>` z etykietą `process-report`;
  - formularz: `<repozytorium>/issues/new?title=…&body=…&labels=process-report,status:+new`. Parametr formularza `template=process-report.yml` dochodzi po ticket 06.
- [x] Linki i długość liczy deterministyczny skrypt w katalogu skryptów pluginu, a nie model.
  - Dostaje tytuł, treść i repozytorium; zwraca linki i informację, czy treść się zmieściła.
  - Skill wywołuje go przez `node` ze ścieżką względem swojego pliku `SKILL.md`, tak samo w Claude Code i w Codexie.
  - Test jednostkowy granic z tabeli S10 trafia do `walidacja` w `.ai/warsztat.json`.
- [x] Wersja zainstalowana pochodzi z manifestu pluginu, najnowsze wydanie z `gh release view -R <repozytorium> --json tagName`. Historię zmian z tego wydania retro przeszukuje po nazwie skilla i kroku. Brak wydań albo pliku → sprawdzenie pominięte z informacją.
- [x] Limit 6 000 znaków sprawdzony jednym ręcznym otwarciem linku `issues/new` tej długości na GitHubie, z wynikiem w Notatkach. Jeśli nie działa, obniż limit i zapisz to w mapie, bo spec dopuszcza tylko obniżenie.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Sam plik historii zmian i wydania — zdolność `publikacja`.

## Notatki

- Limit linku formularza: 2026-11-25 — użytkownik otworzył zalogowany link `gkeb/warsztat/issues/new` o długości dokładnie 6 000 znaków (wygenerowany skryptem linków): formularz wypełniony całą treścią do ostatniej linii `END`. Limit 6 000 zostaje.
- Wydania i historia zmian pochodzą z oficjalnego repozytorium zainstalowanego pluginu (pole `repository` manifestu), nie z repozytorium zgłoszeń — wydania należą do warsztatu, a fork ma we własnym manifeście własny adres. Historia zmian to `CHANGELOG.md` w korzeniu tego repozytorium, pobierany z tagu wydania (`gh api …/contents/CHANGELOG.md?ref=<tag>`); zdolność `publikacja` musi go tam prowadzić albo zmienić procedurę.
- Link wyszukiwania pyta o `is:issue label:process-report <skill>` (skill z tytułu), nie o cały tytuł — słowa łączą się przez AND i pełny tytuł zwykle nic nie znajduje; obejmuje też zamknięte, żeby człowiek widział naprawione.
- Skrypt linków koduje także `!'()*` (lekcja z 2026-11-25).
