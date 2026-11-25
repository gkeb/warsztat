---
nr: "13"
tytul: Dowody filtra prywatności i skanu sekretów
status: do-zrobienia
blokowany-przez: []
scenariusze: ["S5"]
budowal: null
github: 26
---

# 13 — Dowody filtra prywatności i skanu sekretów

## Co widać po zrobieniu

Sesje testowe dowodzą, że filtr i skan działają przed pokazaniem szkicu i przed wysyłką. Dotąd test sprawdzał tylko, że w ruchu do `gh` nie ma tokenu (weryfikacja R1.2). Brak w procedurze, który sesja wykaże, zostaje poprawiony.

## Kryteria akceptacji

- [ ] S5: test akceptacyjny przechodzi dla wierszy tabeli w pokazanym szkicu (tekst odpowiedzi), nie tylko w wysłanej treści:
  - ścieżka projektu, pojęcie ze słownika projektu i dane osobowe są przepisane;
  - kod i nazwa projektu są odfiltrowane;
  - ścieżka warsztatu zostaje.
- [ ] S5: odpowiedź mówi, które pole zmienił filtr i dlaczego.
- [ ] S5: trafienie skanu zatrzymuje wysyłkę: zapis atrapy `gh` nie ma `issue create` ani `issue comment`, a odpowiedź nie zawiera treści sekretu. Skaner w sesji to atrapa `gitleaks`, która jak atrapa `gh` przyjmuje tylko polecenia z procedury (sprawdzenie obecności i skan `stdin` z `--redact`), zapisuje wywołania i zwraca kod 1 dla treści z syntetycznym tokenem. Prawdziwy `gitleaks` na maszynie testowej nie jest wymagany.
- [ ] S5: komentarz „wystąpienie” przygotowany po wyszukiwaniu przechodzi własny filtr i skan. Zapis atrapy skanera ma drugi skan przed pokazaniem obu wariantów.
- [ ] Dowód procedury (poza tekstem S5): brak skanera w `PATH` zatrzymuje wysyłkę i podanie linków, a odpowiedź podaje powód.
- [ ] Sekrety i dane w fiksturach są syntetyczne (`example.com`, wymyślone nazwy).

## Poza zakresem

- Zmiany samego filtra poza tym, co wykażą sesje.

## Notatki

- S5 kończy ten ticket.
