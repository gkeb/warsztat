---
nr: "04"
tytul: Podobne zgłoszenia i komentarz „wystąpienie”
status: zrobione
blokowany-przez: ["02"]
scenariusze: ["S6", "S8"]
budowal: "Claude Code / claude-opus-5-5"
github: 6
---

# 04 — Podobne zgłoszenia i komentarz „wystąpienie”

## Co widać po zrobieniu

Przed nowym Issue retro szuka podobnych otwartych zgłoszeń. Przy trafieniu proponuje komentarz `Occurrence` do istniejącego zgłoszenia albo nowe Issue, a wybiera użytkownik. Lekcja z dopiskiem `Zgłoszenie: <link>` przy nowym wystąpieniu dostaje propozycję komentarza do tego zgłoszenia, bez progu.

## Kryteria akceptacji

- [x] S6: test akceptacyjny przechodzi. Atrapa `gh issue list` zwraca podobne zgłoszenie; wybór komentarza daje `gh issue comment`, a wybór nowego zgłoszenia `gh issue create`.
- [x] S8: test akceptacyjny przechodzi przy jednym nowym wystąpieniu. W zapisie atrapy nie ma `issue create`, jest `issue comment` do numeru z linku, a treść komentarza jest sprawdzona.
- [x] Wyszukiwanie: `gh issue list -R <repozytorium zgłoszeń> --label process-report --state open --search "<słowa objawu i nazwa skilla>"`.
- [x] Komentarz:
  - po angielsku, zaczyna się nagłówkiem `Occurrence`;
  - pola: `Date`, `Workshop version`, `Agent and model`, `Skill and step`, `Symptom`;
  - przechodzi ten sam filtr prywatności i skan co szkic (S5) i wymaga tej samej zgody.
- [x] Po komentarzu lekcja ma `Zgłoszenie: <link do zgłoszenia>`, tak jak w S7.
- [x] S8 dla zgłoszenia, które nie jest już otwarte w bieżącym repozytorium zgłoszeń (`gh issue view` przed komentarzem):
  - zamknięte jako wdrożone → najpierw sprawdzenie nowszej wersji z S9, gdy jest dostępne. Gdy problem nadal występuje, retro proponuje nowe zgłoszenie z odnośnikiem do starego.
  - zamknięte jako „not planned” → retro niczego nie proponuje i pokazuje powód zamknięcia; lekcja zostaje.
  - link do innego repozytorium niż bieżące ustawienie → reguły S12 dla bieżącego ustawienia, jak dla nowej lekcji.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Liczenie wystąpień po kontach — ticket 08.

## Notatki

- Decyzja budowy: zgłoszenie zamknięte jako duplikat (`stateReason` = `DUPLICATE`) traktujemy jak „not planned” — problem jest śledzony gdzie indziej, a nowe zgłoszenie byłoby kolejnym duplikatem; powód zamknięcia zwykle wskazuje oryginał. Spec mówi tylko o „not planned” (uwaga z przeglądu zgodności).
- Sprawdzenie nowszej wersji (S9) przy zgłoszeniu zamkniętym jako wdrożone dołoży ticket 05: ścieżka idzie przez zwykły szkic nowego zgłoszenia, przed którym spec stawia sprawdzenie wersji.
- Kryterium o zamkniętym zgłoszeniu doprecyzowuje założenie S8 („zgłoszenie otwarte”), które spec przyjmuje bez słowa. Ustalone przy krojeniu i zapisane w mapie.
- Wynik sesji testowych 2026-11-24: pełny plik 25/26 (S6 i S8 zielone w obu uruchomieniach), ostatni test (S8 „link do innego repozytorium”) przerwany limitem wydatków w drugim uruchomieniu i powtórzony osobno — 2/2. Przegląd: zgodność, jakość, bezpieczeństwo — bez blokujących; uwagi `warto` i `drobne` poprawione (numer z linku tylko cyfry, słowa wyszukiwania bez dwukropka, spójność progu w krokach 1 i 3, kolejność pól komentarza w teście).
