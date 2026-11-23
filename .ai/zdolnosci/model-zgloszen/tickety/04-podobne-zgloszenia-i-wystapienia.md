---
nr: "04"
tytul: Podobne zgłoszenia i komentarz „wystąpienie”
status: do-zrobienia
blokowany-przez: ["02"]
scenariusze: ["S6", "S8"]
budowal: null
github: 6
---

# 04 — Podobne zgłoszenia i komentarz „wystąpienie”

## Co widać po zrobieniu

Przed nowym Issue retro szuka podobnych otwartych zgłoszeń. Przy trafieniu proponuje komentarz `Occurrence` do istniejącego zgłoszenia albo nowe Issue, a wybiera użytkownik. Lekcja z dopiskiem `Zgłoszenie: <link>` przy nowym wystąpieniu dostaje propozycję komentarza do tego zgłoszenia, bez progu.

## Kryteria akceptacji

- [ ] S6: test akceptacyjny przechodzi. Atrapa `gh issue list` zwraca podobne zgłoszenie; wybór komentarza daje `gh issue comment`, a wybór nowego zgłoszenia `gh issue create`.
- [ ] S8: test akceptacyjny przechodzi przy jednym nowym wystąpieniu. W zapisie atrapy nie ma `issue create`, jest `issue comment` do numeru z linku, a treść komentarza jest sprawdzona.
- [ ] Wyszukiwanie: `gh issue list -R <repozytorium zgłoszeń> --label process-report --state open --search "<słowa objawu i nazwa skilla>"`.
- [ ] Komentarz:
  - po angielsku, zaczyna się nagłówkiem `Occurrence`;
  - pola: `Date`, `Workshop version`, `Agent and model`, `Skill and step`, `Symptom`;
  - przechodzi ten sam filtr prywatności i skan co szkic (S5) i wymaga tej samej zgody.
- [ ] Po komentarzu lekcja ma `Zgłoszenie: <link do zgłoszenia>`, tak jak w S7.
- [ ] S8 dla zgłoszenia, które nie jest już otwarte w bieżącym repozytorium zgłoszeń (`gh issue view` przed komentarzem):
  - zamknięte jako wdrożone → najpierw sprawdzenie nowszej wersji z S9, gdy jest dostępne. Gdy problem nadal występuje, retro proponuje nowe zgłoszenie z odnośnikiem do starego.
  - zamknięte jako „not planned” → retro niczego nie proponuje i pokazuje powód zamknięcia; lekcja zostaje.
  - link do innego repozytorium niż bieżące ustawienie → reguły S12 dla bieżącego ustawienia, jak dla nowej lekcji.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Liczenie wystąpień po kontach — ticket 08.

## Notatki

- Kryterium o zamkniętym zgłoszeniu doprecyzowuje założenie S8 („zgłoszenie otwarte”), które spec przyjmuje bez słowa. Ustalone przy krojeniu i zapisane w mapie.
