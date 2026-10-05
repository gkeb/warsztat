---
name: przekaz
description: Zapisuje stan bieżącej pracy w mapa.md, by kolejna sesja mogła ją podjąć bez czytania czatu. Użyj przed przerwą, po przerwaniu ticketu albo gdy użytkownik prosi o przekazanie.
---

# Przekazanie sesji

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`. Ustal, nad którą zdolnością i którym ticketem była ta sesja. Jeśli nie jest to oczywiste, zapytaj.

Sesja nie dotyczyła żadnej zdolności (np. naprawa bez ticketu, badanie, eksperyment) → zapisz ten sam format w `.ai/sesje/RRRR-MM-DD-slug.md`, z tematem w pierwszej linii. Hook pokazuje takie pliki na starcie sesji. Plik usuwa ten, kto skończy pracę.

Pytanie o commit roboczy zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie.

## Nadpisz `## Stan sesji` w `mapa.md`

Od 5 do 15 linijek, tylko to, czego nie da się odczytać z plików i gita:

```markdown
## Stan sesji

RRRR-MM-DD — ticket NN (w-toku)
- Zrobione: …
- W połowie: … (pliki, funkcje, test, który jeszcze nie przechodzi)
- Nieoczywiste: … (pułapki, ustalenia z rozmowy, ślepe uliczki — żeby ich nie powtarzać)
- Niezacommitowane: tak/nie — co
- Pierwszy ruch w następnej sesji: …
```

Nie streszczasz czatu i nie kopiujesz treści ticketu ani specu — linkujesz.

## Dodatkowo

- Jeśli zmienił się następny krok, zaktualizuj `## Następny krok`.
- Jeśli ticket okazał się za duży, Następny krok = `skill pokroj <slug>#NN`.
- Fałszywe założenia z tej sesji, które już mają rozwiązanie i jeszcze nie mają lekcji → wpis w `.ai/lekcje.md` (ta sama przyczyna → nowe wystąpienie). Bez rozwiązania → `proby.md` jako `nierozwiazane` albo `[badanie]` w mapie.
- Ślepe uliczki i odłożone ścieżki z tej sesji, których jeszcze nie ma w `.ai/proby.md` → dopisz je tam. `Stan sesji` jest kasowany po zamknięciu ticketu; `proby.md` zostaje. W `Nieoczywiste` tylko linkujesz wpisy.
- Kodu w połowie nie commitujesz. Zapytaj zgodnie z sekcją `## Jak pytać`, czy zrobić commit roboczy. Domyślnie rekomenduj brak commita. Zmiany w `.ai/` możesz zacommitować jako `<slug>: przekazanie`, jeśli użytkownik chce.

Na koniec potwierdź jednym zdaniem, co zapisałeś i od czego zaczyna następna sesja.
