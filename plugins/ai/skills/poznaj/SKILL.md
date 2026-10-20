---
name: poznaj
description: Poznaje zastany projekt lub jego obszar w tym repozytorium na podstawie kodu, dokumentacji, ADR-ów i historii gita; zapisuje mapę oraz wnioski z linkami do źródeł. Użyj, gdy pytanie dotyczy tego, jak działa ten kod lub dlaczego projekt tak robi. Dla zewnętrznego faktu o bibliotece, API, limicie lub standardzie użyj `badanie`. Nie pisze kodu i nie przenosi dokumentacji.
argument-hint: "[ogolnie | obszar]"
---

# Poznanie projektu

Przeczytaj wspólny rdzeń `../../KONTRAKT.md` oraz `../../kontrakt/poznanie.md` i `../../kontrakt/pliki.md` względem tego pliku `SKILL.md`. Szablony: `../../szablony/obszar.md`, `../../szablony/zrodla.md`, `../../szablony/AGENTS-projekt.md`, `../../szablony/decyzja.md`. Zakres weź z wywołania skilla albo z bieżącej wiadomości. Pytania zadawaj zgodnie z `## Jak pytać`.

W trybie `ogolnie`, przy rozstrzyganiu profilu lub inwentaryzacji wydań, czytaj odpowiednie sekcje `../../kontrakt/profile-i-wydania.md`.

Poznanie **niczego nie zmienia w kodzie ani w zastanej dokumentacji**. Tylko czyta, a zapisuje wyłącznie pliki warsztatu.

## 1. Zakres

- **`ogolnie`** (domyślnie przy pierwszym uruchomieniu): cały projekt, płytko. Cel: jak uruchomić, jakie są obszary, gdzie leży dokumentacja i ADR-y.
- **`<obszar>`**: katalog, moduł albo temat (np. `platnosci`), głęboko. Jeśli `.ai/obszary/<slug>.md` istnieje, zacznij od niego i jego źródeł według `## Aktualność map obszarów` w `../../kontrakt/poznanie.md`. Sprawdź diff źródeł od `poznany-commit`, także zmiany robocze i nieśledzone; odśwież dotknięte fragmenty oraz ich zależności. Brak checkpointu lub nieosiągalny commit → sprawdź opis od źródeł, nie zakładaj aktualności.

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
| szczegóły obszaru | `.ai/obszary/<slug>.md` (z szablonu), z `poznany-commit` i `zrodla-kodu` według kontraktu |
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
- **Bez dublowania z CLAUDE.md.** Jeśli `CLAUDE.md` zawiera już fakty o projekcie, nie powtarzasz ich w `AGENTS.md`, tylko proponujesz przeniesienie (zob. `## AGENTS.md i CLAUDE.md` w `../../kontrakt/pliki.md`).
- Niepewne wnioski oznaczasz „(wniosek)” albo zapisujesz jako otwarte pytanie.
- **Źródła i checkpoint.** Wskaż kod, testy, konfiguracje i kontrakty poza katalogiem modułu, które podpierają opis. Istotne twierdzenia linkuj przy ich treści do pliku i symbolu lub sekcji. Przy odświeżeniu starej mapy przenieś commit z linii `Poznany` do frontmatteru i usuń jego duplikat; checkpoint przesuwaj dopiero po sprawdzeniu źródeł. Wersja robocza nie dostaje checkpointu udającego commit tej wersji.
- **Opis i wymagania.** Nie zmieniaj specu ani ADR, żeby dopasować je do kodu. Zmieniony plik sygnalizuje potrzebę sprawdzenia, nie rozstrzyga, po której stronie jest błąd. Nie twórz równoległej wiki, słownika ani rejestru decyzji.

## 5. Podsumowanie

W 5–8 zdaniach: jak działa obszar, kluczowe ograniczenia i dlaczego takie są, największe ryzyka, otwarte rozjazdy. Zaproponuj następny krok: zwykle `pomysl` dla zdolności w tym obszarze albo rozstrzygnięcie rozjazdów. Zaproponuj commit `warsztat: poznanie <obszar>` — zrób go po zgodzie.
