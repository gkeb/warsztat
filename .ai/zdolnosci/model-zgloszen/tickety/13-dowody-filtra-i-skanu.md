---
nr: "13"
tytul: Dowody filtra prywatności i skanu sekretów
status: zrobione
blokowany-przez: []
scenariusze: ["S5"]
budowal: "Claude Code / claude-opus-5-5"
github: 26
---

# 13 — Dowody filtra prywatności i skanu sekretów

## Co widać po zrobieniu

Sesje testowe dowodzą, że filtr i skan działają przed pokazaniem szkicu i przed wysyłką. Dotąd test sprawdzał tylko, że w ruchu do `gh` nie ma tokenu (weryfikacja R1.2). Brak w procedurze, który sesja wykaże, zostaje poprawiony.

## Kryteria akceptacji

- [x] S5: test akceptacyjny przechodzi dla wierszy tabeli w pokazanym szkicu (tekst odpowiedzi), nie tylko w wysłanej treści:
  - ścieżka projektu, pojęcie ze słownika projektu i dane osobowe są przepisane;
  - kod i nazwa projektu są odfiltrowane;
  - ścieżka warsztatu zostaje.
- [x] S5: odpowiedź mówi, które pole zmienił filtr i dlaczego.
- [x] S5: trafienie skanu zatrzymuje wysyłkę: zapis atrapy `gh` nie ma `issue create` ani `issue comment`, a odpowiedź nie zawiera treści sekretu. Skaner w sesji to atrapa `gitleaks`, która jak atrapa `gh` przyjmuje tylko polecenia z procedury (sprawdzenie obecności i skan `stdin` z `--redact`), zapisuje wywołania i zwraca kod 1 dla treści z syntetycznym tokenem. Prawdziwy `gitleaks` na maszynie testowej nie jest wymagany.
- [x] S5: komentarz „wystąpienie” przygotowany po wyszukiwaniu przechodzi własny filtr i skan. Zapis atrapy skanera ma drugi skan przed pokazaniem obu wariantów.
- [x] Dowód procedury (poza tekstem S5): brak skanera w `PATH` zatrzymuje wysyłkę i podanie linków, a odpowiedź podaje powód.
- [x] Sekrety i dane w fiksturach są syntetyczne (`example.com`, wymyślone nazwy).

## Poza zakresem

- Zmiany samego filtra poza tym, co wykażą sesje.

## Notatki

- S5 kończy ten ticket.
- 2026-11-25 — atrapa skanera (`testy/atrapa-gitleaks.mjs`) ma dwa tryby: domyślny zgłasza syntetyczny token `ghp_…`, a `zawsze` — każdą niepustą treść. Filtr prywatności usuwa token przed skanem, więc zatrzymanie po trafieniu skanu sprawdza tryb `zawsze` (skaner widzi to, czego filtr nie zauważył); tryb domyślny dowodzi, że wysłana treść była skanowana przed wysyłką. Prawdziwy `gitleaks` jest odfiltrowany z `PATH` sesji jak prawdziwy `gh`.
- Lekcja fikstury w bloku wysyłki ma dodany kod i nazwę projektu (wariant w teście, fikstura bez zmian) — wspólny przebieg sesji sprawdza też S1, S2, S3, S7 i S12.
- Brak w procedurze wykazany sesją: zmiany filtra podawane jednym zdaniem o całym szkicu, potem pominięta nazwa projektu wśród trafień — krok 8 `zgloszenie.md` ma format linii `<pole>: <rodzaje trafień> — <co zrobiłeś>` i źródła nazwy projektu.
- Sesje S5 (×8), S6/S5, S1, S2, S3, S7, S12 zielone w 2 kolejnych przebiegach po ostatniej zmianie procedury i asercji ($8.43). Pozostałe testy z `sprawdzKomentarz` (S6, S8) mają szerszą listę danych projektu (`daneProjektu`) i nie były uruchomione po tej zmianie; pełny plik `testy/retro-zgloszenia.test.mjs` niesprawdzony.
- Poprawki po przeglądzie (wszystkie, wybór użytkownika): pusta treść wysyłki nie jest dowodem skanu, komunikat o trafieniu skanu w obu turach, linia zmiany filtra od nazwy pola, wspólna lista danych projektu w komentarzu, komentarze o PATH i skanie commita w atrapie z testem zgodności z fiksturą.
- Poza zakresem, do zgłoszenia: w jednej sesji odpowiedź wypisała linię „Repozytorium zgłoszeń nieznane.” mimo ustawionego `zgloszenia` (manifest bez adresu) — rozjazd z krokiem 2 procedury.
