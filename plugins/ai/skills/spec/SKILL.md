---
name: spec
description: Tworzy spec zdolności na podstawie ustaleń z grilla i prosi użytkownika o jawną akceptację przed zmianą statusu.
disable-model-invocation: true
argument-hint: "[slug]"
---

# Spec zdolności

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` i szablon według rodzaju zdolności (linia `Rodzaj:` w mapie, zob. `## Rodzaje zdolności` w kontrakcie): `../../szablony/spec.md` dla `funkcja`, `szkielet` i `wyglad`, `../../szablony/spec-refaktor.md` dla `refaktor`. Profile projektu: `warsztat.json` → `profile`, pliki w `../../profile/`. Użyj slugu podanego przy wywołaniu skilla albo w bieżącej wiadomości.

## 1. Wybierz zdolność

Podany argument → ta zdolność. Bez argumentu → zdolność z Teraz w statusie `grill`. Jeśli jest ich kilka albo żadnej — zapytaj.

## 2. Sprawdź gotowość

Wczytaj `mapa.md`, `.ai/SLOWNIK.md`, powiązane ADR i kod w obszarach, których zdolność dotyka — żeby wiedzieć, jakie moduły i interfejsy już istnieją.

Jeśli `## Problem` wskazuje `Źródło:` w pliku z zamiarem, przeczytaj ten fragment i sprawdź, czy nic z niego nie zginęło po drodze: każde wymaganie z fragmentu trafia do scenariuszy, do „Poza zakresem” (świadomie odrzucone w grillu) albo jest otwartym pytaniem. Gdy plik lub sekcja zostały usunięte, odzyskaj wersję źródłową z historii gita — dla zatwierdzonego usunięcia całego pliku użyj commita usunięcia z `.ai/zrodla.md` i `git show <commit>^:<plik>`. Wymaganie, które zniknęło bez śladu, pokaż użytkownikowi przed bramką akceptacji.

Jeśli w `## Otwarte pytania` jest cokolwiek, co blokuje spec, zatrzymaj się: wypisz te pytania i zaproponuj skill `pomysl <slug>`. Nie zgaduj odpowiedzi.

## 3. Napisz `spec.md`

- **Bez kodu i bez ścieżek plików.** Opisujesz zachowanie i granice. Moduły i interfejsy nazywasz słowami, bo ścieżki się starzeją.
- **Pojęcia ze słownika.** Jeśli potrzebujesz nowego, najpierw dopisz je do `SLOWNIK.md`.
- **Scenariusze = obserwowalne zachowania** w formacie z sekcji „Język → zachowanie → test” w kontrakcie: stały numer `Sx`, „Zakładając … gdy … wtedy …”. Każdy musi dać się sprawdzić testem akceptacyjnym przez publiczny interfejs albo — wyjątkowo — ręcznie, z dopiskiem „ręcznie: dlaczego”.
- **Przykłady.** Reguła z granicą dostaje tabelę przykładów po obu stronach granicy. Przykłady z mapy przenosisz; brakujące przy granicy zaproponuj i pokaż przy akceptacji.
- **Kontekst i niezmienniki.** Wpisz kontekst zdolności (jeśli słownik ma konteksty). Niezmienniki domeny ze słownika, których dotyka zdolność, muszą mieć scenariusz, który je sprawdza.
- **Spec już zaakceptowany i zmieniany:** numerów scenariuszy nie przesuwasz; usunięty oznaczasz, nowy dostaje kolejny wolny numer.
- **„Poza zakresem” wypełniasz zawsze.** Tu lądują rzeczy, które padły w grillu i zostały odrzucone.
- **Testy:** jakie zachowania, na jakim poziomie, przez jaki publiczny interfejs. Poziom i narzędzia testów akceptacyjnych bierzesz z sekcji `Testy akceptacyjne` profili (CLI: uruchomienie polecenia i kod wyjścia; HTML: przeglądarka na plikach serwowanych przez HTTP; strona generowana: przeglądarka na wyniku budowania). Mockujemy tylko granice systemu.
- **Doświadczenie.** Zdolność z interfejsem wypełnia sekcję „Doświadczenie” według `Doświadczenie (UX)` profili; przy rodzaju `wyglad` jest obowiązkowa, a scenariusze opisują przepływy w szerokościach albo środowiskach kontrolnych.
- **Niedowiezienia z profilu**, które dotyczą tej zdolności (np. Open Graph dla nowej strony, `--help` dla nowej flagi), wpisz jako scenariusze albo kryteria — wtedy nie wyjdą dopiero w weryfikacji.
- Decyzje z mapy przenosisz do „Decyzje projektowe” z linkami do ADR. Mapy nie kopiujesz — spec to kontrakt, mapa to dziennik.
- **Refaktor:** zamiast scenariuszy — niezmienniki z numerami `Nx`. Każdy niezmiennik da się sprawdzić testem; w „Siatce bezpieczeństwa” wypisz, które testy już go chronią, a których brakuje. Strategia musi zostawiać działający system po każdym kroku. Stan obecny opisz na podstawie kodu (i `.ai/obszary/`, jeśli jest), nie pamięci.
- **Szkielet:** scenariusz to jedna ścieżka od wejścia do wyjścia na wybranym stosie, a kryterium — działająca i zielona walidacja wpisana do `.ai/warsztat.json`, łącznie z automatami dla twardych zasad architektury z `.ai/ZASADY.md`. Bez funkcji biznesowych ponad tę ścieżkę.
- **Zasady.** „Decyzje projektowe” nie mogą łamać `.ai/ZASADY.md`. Kolizja → zatrzymaj się: zmiana podejścia, wyjątek albo zmiana zasady przez skill `decyzja`.

## 4. Bramka akceptacji — decyduje człowiek

**Druga opinia** — sprawdź linię `Druga opinia:` w mapie i `weryfikacja.drugaOpinia` w `.ai/warsztat.json`:

- `zalecana` (domyślnie) i brak drugiej opinii → przed akceptacją zapytaj, czy użytkownik chce ją wykonać. Jeśli tak, ustaw Następny krok na `skill pomysl <slug> druga-opinia` i zakończ skill; wróć do bramki po jej zapisaniu. Zaproponuj model spoza listy `Grill:`; jeśli `weryfikacja.innyModel` = `false`, ten sam model może kontynuować za zgodą, ale opinia będzie oznaczona jako nieniezależna. Jeśli użytkownik pomija opinię, dopisz w mapie `RRRR-MM-DD — spec bez drugiej opinii` i kontynuuj.
- `wymagana` i brak drugiej opinii → nie pytasz o akceptację; ustaw Następny krok na `skill pomysl <slug> druga-opinia` i zakończ. Przy `weryfikacja.innyModel` = `true` wybierz model spoza listy `Grill:`; przy `false` ten sam model jest dozwolony, ale wynik oznacz jako nieniezależny. Wyjątek od ustawienia `true` tylko na wyraźną decyzję użytkownika, z notatką w mapie i oznaczeniem nieniezależności.
- `wylaczona` → pomiń.

Pokaż krótkie streszczenie: problem, zakres, poza zakresem, największe ryzyko. Zapytaj o akceptację zgodnie z sekcją `## Jak pytać` w kontrakcie:

- **Akceptuję** → w `ROADMAP.md` status `spec`, w specu data akceptacji, w mapie Następny krok `skill pokroj <slug>`. Gdy spec odpowiada ustaleniom i nie ma znanych braków, rekomenduj tę opcję jako pierwszą.
- **Poprawki** → nanieś je i zapytaj ponownie.
- **Wracamy do grilla** → zapisz, co okazało się niejasne, jako otwarte pytania. Status zostaje `grill`.

Jeśli akceptacja nie jest właściwą rekomendacją, ustaw poprawną rekomendację jako pierwszą opcję. Nigdy nie oznaczaj akceptacji jako rekomendowanej, gdy znasz nierozstrzygnięty bloker.

Nigdy nie ustawiasz statusu `spec` bez jawnej akceptacji.

## 5. Zmiana zaakceptowanego specu

Jeśli zdolność jest już w `spec`, `plan`, `budowa` albo `weryfikacja`:

- zmiana wymaga zgody użytkownika;
- w mapie zapisz `RRRR-MM-DD — zmiana specu: … — dlaczego`;
- sprawdź, które tickety się zdezaktualizowały, i zaproponuj skill `pokroj <slug>` do ich poprawy.

Na koniec zaproponuj commit `<slug>: spec` — zrób go po zgodzie.
