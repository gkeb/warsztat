---
nr: "15"
tytul: Dokładne pola szkicu, link z samym tytułem i kroki po wycieku
status: do-zrobienia
blokowany-przez: ["10"]
scenariusze: ["S2", "S10", "S13"]
budowal: null
github: 28
---

# 15 — Dokładne pola szkicu, link z samym tytułem i kroki po wycieku

## Co widać po zrobieniu

Sesje sprawdzają, że szkic ma dokładnie siedem stałych pól z rodzajem problemu i poprawnymi wartościami (weryfikacja R1.6). Przy zbyt długim linku retro daje link z samym tytułem i pełny szkic do wklejenia (R1.8). Odpowiedź z procedurą po wycieku zawiera każdy wymagany krok, a nie tylko słowa kluczowe (R1.9).

## Kryteria akceptacji

- [ ] S2: test akceptacyjny sprawdza w pokazanym szkicu i w wysłanej treści:
  - dokładnie siedem nagłówków stałych pól (słownik, nazwy angielskie jak w procedurze zgłoszenia) w kolejności, bez dodatkowych;
  - niepuste wartości;
  - rodzaj `regular`, a w wariancie utraty danych `data loss` (S2: „zwykły albo utrata danych”);
  - liczbę i daty wystąpień zgodne z lekcją z fikstury.
- [ ] S10: sesja z wynikiem skryptu „treść nie mieści się w linku” pokazuje link formularza z samym tytułem i pełny szkic do wklejenia w odpowiedzi; sesja z wynikiem „mieści się” — link z treścią, jak dotąd. Trzy granice długości sprawdza dalej test skryptu linków (spec → Testy).
- [ ] S13: test akceptacyjny sprawdza w wariancie sekretu każdy krok osobno:
  - uznanie sekretu za ujawniony i jego unieważnienie;
  - edycja treści;
  - usunięcie poprzedniej wersji z historii edycji;
  - prośba do opiekuna kanałem bezpieczeństwa o usunięcie konkretnego Issue (link albo numer z lekcji);
  - zgłoszenie do GitHub Support przy danych uwierzytelniających.
- [ ] S13: w wariancie danych projektu test sprawdza edycję, usunięcie wersji z historii i prośbę kanałem bezpieczeństwa o usunięcie Issue; w obu wariantach — dosłowne ostrzeżenie o e-mailach i webhookach.
- [ ] Końcowe spacje w tickecie 06 (linia 70) usunięte (R1.13).

## Poza zakresem

- Zmiana listy pól — spec ją ustalił (S2 z rodzajem problemu).

## Notatki

- S2, S10 i S13 kończy ten ticket. Zależy od 10, bo asercje wysłanej treści dotyczą wysyłki już bez etykiet.
- S10 „nie mieści się”: fikstura z lekcją o długim objawie i kierunku, tak by pełny link przekroczył 6 000 znaków; skryptu nie podmieniasz.
