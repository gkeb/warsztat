---
name: poznaj
description: Poznaje zastany projekt albo jego obszar — kod, dokumentację, ADR-y i historię gita — sprawdza dokumenty z kodem i zapisuje wiedzę w plikach warsztatu (mapa obszaru, AGENTS.md, słownik, zastane ADR-y, rozjazdy) z linkami do źródeł. Nie pisze kodu i nie przenosi dokumentacji. Użyj przed pracą w nieznanym obszarze, po starcie warsztatu w istniejącym repo albo gdy użytkownik pyta „jak to działa i dlaczego tak”.
argument-hint: "[ogolnie | obszar]"
---

# Poznanie projektu

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie sekcję `## Zastany projekt`. Szablony: `../../szablony/obszar.md`, `../../szablony/zrodla.md`, `../../szablony/AGENTS-projekt.md`, `../../szablony/decyzja.md`. Zakres weź z wywołania skilla albo z bieżącej wiadomości. Pytania zadawaj zgodnie z `## Jak pytać`.

Poznanie **niczego nie zmienia w kodzie ani w zastanej dokumentacji**. Tylko czyta, a zapisuje wyłącznie pliki warsztatu.

## 1. Zakres

- **`ogolnie`** (domyślnie przy pierwszym uruchomieniu): cały projekt, płytko. Cel: jak uruchomić, jakie są obszary, gdzie leży dokumentacja i ADR-y.
- **`<obszar>`**: katalog, moduł albo temat (np. `platnosci`), głęboko. Jeśli `.ai/obszary/<slug>.md` istnieje, zacznij od niego i odśwież tylko to, co zmieniło się od zapisanego commita (`git log <commit>..HEAD -- <katalogi>`).

## 2. Zbierz materiał

Czytaj w tej kolejności — od najbardziej wiarygodnego:

1. **Kod i testy** obszaru: punkty wejścia, główne moduły, przepływ danych, co jest pokryte testami.
2. **Konfiguracja i uruchamianie**: manifesty pakietów, skrypty, CI, pliki środowiskowe (bez wartości sekretów).
3. **ADR-y** z katalogu decyzji i innych miejsc wskazanych w `.ai/zrodla.md`.
4. **Dokumentacja**: README, ARCHITECTURE, dokumenty projektowe, komentarze modułów.
5. **Historia gita**, wybiórczo: najczęściej zmieniane pliki, duże zmiany, commity i opisy PR-ów (`gh pr view`, jeśli dostępne) przy kluczowych modułach — tam często jest „dlaczego”.

Przy dużym obszarze możesz, jeśli agent na to pozwala, czytać równolegle subagentami (np. kod, dokumentacja, historia) według `## Subagenci i modele`. Każdy zwraca fakty z odnośnikami, a scalasz i sprawdzasz Ty.

## 3. Sprawdź dokumenty w kodzie

Każde twierdzenie z dokumentu albo ADR, które wpływa na dalszą pracę, sprawdź w kodzie. Wynik:

- zgodne → możesz na nim polegać;
- rozjazd → wpis w `.ai/zrodla.md` → `## Rozjazdy`: co mówi dokument, co robi kod, gdzie. Nie rozstrzygasz go sam.

## 4. Zaproponuj zapis

Przedstaw użytkownikowi listę zmian w plikach warsztatu, pogrupowaną. Zapisz te, które zaakceptuje:

| Co | Gdzie |
| --- | --- |
| uruchamianie, mapa obszarów, pułapki — tylko globalne, krótko | `AGENTS.md` → `## Projekt` (z szablonu, poza blokiem warsztatu) |
| szczegóły obszaru | `.ai/obszary/<slug>.md` (z szablonu), z commitem, na którym poznano |
| pojęcia domenowe z kodu i dokumentów (5–15 najważniejszych); niezmienniki, które kod egzekwuje (walidacje, ograniczenia bazy, wyjątki domenowe); to samo słowo modelowane różnie w różnych modułach — kandydat na konteksty | `.ai/SLOWNIK.md`, z dopiskiem źródła; konteksty tylko za zgodą użytkownika, a ich granice jako ADR `zastana` |
| decyzje, które ograniczają dalszą pracę, a nie mają ADR | ADR `zastana` w katalogu decyzji, z polem `Źródło` |
| zastane dokumenty, katalog ADR, ich aktualność | `.ai/zrodla.md` |
| zasady, których kod faktycznie się trzyma: warstwy i kierunek zależności, wzorce, stanowiska kodu, strategia testów — z kodu, konfiguracji linterów i dokumentów (CONTRIBUTING, ARCHITECTURE) | `.ai/ZASADY.md` (z szablonu), status `zastana`, `Egzekwowanie` według tego, co już sprawdza lint albo CI; w `Dlaczego` link do ADR albo, gdy go brak, do źródła tej zasady; masowe odstępstwa jako rozjazd w `.ai/zrodla.md`, pojedyncze jako `Wyjątki` |
| plany i TODO z dokumentów | propozycja linii w `ROADMAP.md` (Dalej albo Mgła) — decyduje użytkownik |
| tylko w trybie `ogolnie`: pozycje profili projektu (`warsztat.json` → `profile`, `../../profile/`), które kod i konfiguracja już rozstrzygnęły — np. tryb renderowania w `astro.config.*`, parser argumentów, hosting w konfiguracji CI, sposób wersjonowania z tagów, istniejący `CHANGELOG.md` | `.ai/profil.md` (z szablonu): wynik z linkiem do źródła albo ADR `zastana`; pozycje bez śladu w kodzie — `otwarte`. Komendy wydania i pielęgnacji, które projekt już ma (skrypty `deploy`, `release`, CI) → propozycja wpisu w `warsztat.json` → `wydanie` i `pielegnacja`; istniejące wydania (tagi, historia wdrożeń) → pierwszy wpis w `.ai/wydania.md` jako punkt odniesienia |

Zasady:

- **Linkujesz, nie kopiujesz.** Każdy wpis ma źródło: plik, sekcję albo commit.
- **Zastane ADR-y tylko dla ograniczeń.** Nie odtwarzasz każdej decyzji z historii — tylko te, których złamanie zepsułoby coś albo zaskoczyłoby autora.
- **Krótko w AGENTS.md.** Ten plik czyta każda sesja. Szczegóły obszaru idą do `.ai/obszary/`.
- **Bez dublowania z CLAUDE.md.** Jeśli `CLAUDE.md` zawiera już fakty o projekcie, nie powtarzasz ich w `AGENTS.md`, tylko proponujesz przeniesienie (zob. `## AGENTS.md i CLAUDE.md` w kontrakcie).
- Niepewne wnioski oznaczasz „(wniosek)” albo zapisujesz jako otwarte pytanie.

## 5. Podsumowanie

W 5–8 zdaniach: jak działa obszar, kluczowe ograniczenia i dlaczego takie są, największe ryzyka, otwarte rozjazdy. Zaproponuj następny krok: zwykle `pomysl` dla zdolności w tym obszarze albo rozstrzygnięcie rozjazdów. Zaproponuj commit `warsztat: poznanie <obszar>` — zrób go po zgodzie.
