---
nr: "05"
tytul: Zgłoszenie bez gh i sprawdzenie nowszej wersji
status: do-zrobienia
blokowany-przez: ["02"]
scenariusze: ["S9", "S10"]
budowal: null
github: 7
---

# 05 — Zgłoszenie bez gh i sprawdzenie nowszej wersji

## Co widać po zrobieniu

- **Bez `gh` albo bez logowania.** Retro daje dwa linki: wyszukiwanie podobnych zgłoszeń i formularz nowego Issue z tytułem i treścią szkicu. Gdy link przekroczyłby 6 000 znaków, ma sam tytuł, a treść jest do wklejenia.
- **Z działającym `gh`.** Retro przed wysłaniem porównuje zainstalowaną wersję z najnowszym wydaniem i przeszukuje historię zmian warsztatu. Trafienie daje propozycję aktualizacji zamiast zgłoszenia.

## Kryteria akceptacji

- [ ] S10: test akceptacyjny przechodzi dla wierszy tabeli (5 999, 6 000 i 6 001 znaków), dla niezalogowanego `gh` (atrapa zwraca błąd `gh auth status`) i dla braku `gh` w `PATH`.
- [ ] S9: test akceptacyjny przechodzi w trzech wariantach:
  - starsza wersja i wpis w historii zmian → propozycja aktualizacji, bez `issue create`;
  - starsza wersja bez wpisu → zwykły szkic;
  - bez `gh` → komunikat o pominięciu sprawdzenia.
- [ ] Linki, z kodowaniem procentowym:
  - wyszukiwanie: `<repozytorium>/issues?q=<zapytanie>` z etykietą `process-report`;
  - formularz: `<repozytorium>/issues/new?title=…&body=…&labels=process-report,status:+new`. Parametr formularza `template=process-report.yml` dochodzi po ticket 06.
- [ ] Linki i długość liczy deterministyczny skrypt w katalogu skryptów pluginu, a nie model.
  - Dostaje tytuł, treść i repozytorium; zwraca linki i informację, czy treść się zmieściła.
  - Skill wywołuje go przez `node` ze ścieżką względem swojego pliku `SKILL.md`, tak samo w Claude Code i w Codexie.
  - Test jednostkowy granic z tabeli S10 trafia do `walidacja` w `.ai/warsztat.json`.
- [ ] Wersja zainstalowana pochodzi z manifestu pluginu, najnowsze wydanie z `gh release view -R <repozytorium> --json tagName`. Historię zmian z tego wydania retro przeszukuje po nazwie skilla i kroku. Brak wydań albo pliku → sprawdzenie pominięte z informacją.
- [ ] Limit 6 000 znaków sprawdzony jednym ręcznym otwarciem linku `issues/new` tej długości na GitHubie, z wynikiem w Notatkach. Jeśli nie działa, obniż limit i zapisz to w mapie, bo spec dopuszcza tylko obniżenie.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Sam plik historii zmian i wydania — zdolność `publikacja`.

## Notatki
