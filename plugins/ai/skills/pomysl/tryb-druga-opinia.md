## Tryb drugiej opinii — `pomysl <slug> druga-opinia`

Uruchamiany w **innym modelu** niż ten z linii `Grill:` w mapie — najlepiej w innym narzędziu. Cel: podważyć wynik grilla, a nie go powtórzyć. Zasady: sekcja `### Druga opinia — koncepcja` w `../../kontrakt/praca.md`.

1. **Niezależność.** Ustal, kim jesteś (narzędzie i model). Porównuj nazwę modelu, nie narzędzia; użycie tego samego modelu w innym kliencie nadal jest użyciem tego samego modelu. Jeśli Twój model pasuje do któregokolwiek modelu w `Grill:` i `weryfikacja.innyModel` = `true`, ostrzeż i zapytaj: przerwać i uruchomić w innym modelu (rekomendowane) albo kontynuować jako nieniezależną. Gdy `innyModel` = `false`, możesz kontynuować tym samym modelem, ale oznacz opinię jako nieniezależną. Jeśli model z `Grill:` albo Twój jest `nieznany`, nie twierdź, że opinia jest niezależna: zapytaj, czy ustalić model, czy kontynuować jako nieniezależną.
2. **Własne zdanie — zanim przeczytasz decyzje.** Sprawdź, czy `## Problem` w mapie jest uzupełnione. Jeśli go brakuje albo nadal zawiera szablon, zatrzymaj się i zaproponuj zwykły grill, żeby uzupełnić problem bez wyciągania go z decyzji. Następnie wczytaj tylko `## Problem` (oraz fragment pliku z zamiarem, jeśli `## Problem` wskazuje `Źródło:` — to słowa użytkownika, nie wnioski grilla), linię zdolności w roadmapie, `Rodzaj:`, `Grill:` wyłącznie do sprawdzenia niezależności, `SLOWNIK.md`, `ZASADY.md`, ADR-y i kod obszaru. **Nie czytaj jeszcze `.ai/lekcje.md`, `## Decyzje` ani `## Otwarte pytania`.** Spisz dla siebie: 5–10 kluczowych pytań, główne ryzyka, 2–3 możliwe podejścia.
3. **Porównanie.** Teraz przeczytaj całą mapę. Zestaw swoje ustalenia z wynikiem grilla w czterech grupach:
   - **zakwestionowane decyzje** — z konkretnym argumentem i tym, co by się zmieniło;
   - **pytania, których nikt nie zadał** — błędy, uprawnienia, puste i graniczne stany, współbieżność, migracja danych, wydajność, bezpieczeństwo, wycofanie zmiany;
   - **nierozważone alternatywy** — sprawdź `.ai/proby.md`, zanim je zaproponujesz;
   - **niejasne pojęcia** — słowa używane w mapie inaczej niż w słowniku albo niezdefiniowane.
   Pomiń to, z czym się zgadzasz. Pokaż użytkownikowi listę z liczbą pozycji w każdej grupie.
4. **Grill tylko na różnicach.** Zasady jak w zwykłym przesłuchaniu: jedno pytanie naraz, rekomendacja jako pierwsza opcja, od tego, od czego zależy reszta. Ustalonego i niepodważonego nie ruszasz.
5. **Zapis na bieżąco** w mapie:
   - nowe decyzje: `RRRR-MM-DD — decyzja — dlaczego (druga opinia: <narzędzie / model>)`;
   - zmienione: zmień wpis i dopisz `zmienione po drugiej opinii (było: …)`;
   - podtrzymane mimo zastrzeżeń: dopisz do wpisu `podtrzymane po drugiej opinii: <argument>` — następny czytelnik zobaczy, że kwestię rozważono;
   - nowe pytania: `## Otwarte pytania` z typem i dopiskiem źródła;
   - pojęcia: `SLOWNIK.md`.
6. **Zakończenie.** W linii `Druga opinia:` wpisz `<narzędzie / model>, RRRR-MM-DD` (i `nieniezależna`, jeśli tak było). Podsumuj w 3–5 zdaniach: co się zmieniło, co podtrzymano, co zostało otwarte. Następny krok jak w zwykłym grillu.
