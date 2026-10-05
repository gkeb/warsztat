---
name: wydaj
description: Jawnie uruchamiane wydanie albo wdrożenie — zbiera zmiany od ostatniego wydania, ustala wersję, zamyka historię zmian, uruchamia build, publikację lub wdrożenie dopiero po pokazaniu komend, sprawdza wynik na miejscu i zapisuje rejestr wydań. Przy nieudanym sprawdzeniu prowadzi wycofanie.
disable-model-invocation: true
argument-hint: "[podglad | wersja | tresc]"
---

# Wydanie

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie `## Wydania i pielęgnacja` i `## Profile`. Profile projektu: `warsztat.json` → `profile`, pliki w `../../profile/`. Szablon rejestru: `../../szablony/wydania.md`. Pytania zadawaj zgodnie z `## Jak pytać`.

Wydanie wychodzi poza repozytorium: publikuje pakiet albo zmienia stronę, którą widzą ludzie. **Każdą komendę, która publikuje, wdraża, taguje albo wypycha, pokazujesz przed uruchomieniem i uruchamiasz dopiero po zgodzie.** Kodu nie zmieniasz — poza wersją i historią zmian.

Argument: `podglad` — tylko wdrożenie podglądu (bez wersji i tagu); `wersja` — pełne wydanie z wersją (domyślne przy `wersjonowanie` = `semver`); `tresc` — wdrożenie samej zmiany treści strony, bez wersji.

## 1. Konfiguracja

- `warsztat.json` → `wydanie` puste (`komendy` = `[]`) → to pierwsze wydanie. Ustal z użytkownikiem decyzje P-15–P-18 z profilu `przekrojowe` i sekcję `Wydanie` profilu klasy, zapisz komendy w `wydanie`, rozstrzygnięcia w `.ai/profil.md`. Twarde decyzje (dokąd i jak wdrażamy) — skill `decyzja`.
- Komendy nie istnieją w projekcie (brak skryptu, brak narzędzia) → zatrzymaj się i powiedz, czego brakuje. Nie wymyślasz ich w locie.

## 2. Warunki

- `git status` czysty; gałąź zgodna z P-17 (zwykle główna).
- Walidacja z `warsztat.json` zielona (z `odniesienie.znane`).
- Testy akceptacyjne i kontrole z sekcji `Wydanie` profili (np. `astro check`, linki, Lighthouse; instalacja z artefaktu dla CLI) — zielone.
- Zdolność w `budowa` albo `weryfikacja` z commitami od ostatniego wydania → zapytaj: wydajemy bez niej (jej kod jest już w gałęzi — upewnij się, że jest nieaktywny albo bezpieczny) czy czekamy. Rekomenduj czekanie, chyba że zmiana jest niewidoczna dla użytkownika.

Coś czerwone → stop. Wydanie nie naprawia — wskaż skill `napraw` albo `buduj`.

## 3. Co wchodzi

- Ostatnie wydanie: najnowszy wpis w `.ai/wydania.md`, a pomocniczo ostatni tag.
- Od niego: commity, zdolności przeniesione do Zrobione, poprawki `fix:`, sekcja `## Niewydane` w historii zmian.
- Porównaj: zmiana widoczna dla użytkownika w commitach, a nie w „Niewydane” → zaproponuj brakujący wpis.
- Nic się nie zmieniło → powiedz to i zakończ.

## 4. Wersja i historia zmian

- `wersjonowanie` = `semver` → zaproponuj wersję na podstawie zmian i publicznego interfejsu z P-15: usunięta albo zmieniona funkcja, flaga, format wyjścia → wersja główna; nowa funkcja → pomniejsza; tylko poprawki → poprawka. Przed `1.0.0` zmiana łamiąca podbija pomniejszą. Decyduje użytkownik.
- `data` → wersja to data (`2026.10.05`); `brak` albo argument `tresc` / `podglad` → bez wersji, w rejestrze zapisujesz commit.
- Wpisz wersję tam, skąd czytają ją narzędzia (`pyproject.toml`, `package.json`) — tylko w jednym miejscu, zgodnie z CLI-13.
- `changelog` ustawiony → sekcja `## Niewydane` staje się `## [wersja] — RRRR-MM-DD`; nad nią nowa, pusta `## Niewydane`.
- Commit `wydanie: <wersja albo data>` — wersja i historia zmian.

## 5. Wykonanie — po zgodzie

Pokaż listę komend z `wydanie.komendy` w kolejności, z tym, co każda zrobi i dokąd wyśle. Zapytaj o zgodę na całość albo krok po kroku (rekomenduj krok po kroku przy pierwszym wydaniu).

- Kolejność zwykle: build → (podgląd → akceptacja człowieka) → publikacja albo wdrożenie produkcji → tag → push → GitHub Release.
- `wydanie.githubRelease` = `true` i wydanie z wersją → po pushu tagu: sekcję tej wersji z historii zmian zapisz do pliku tymczasowego i pokaż komendę `gh release create v<wersja> --title "v<wersja>" --notes-file <plik>` (z `--prerelease` dla wersji `0.x` albo z sufiksem, jeśli użytkownik tak chce). Treść release'u bierzesz z `CHANGELOG.md` — nie piszesz jej drugi raz. Brak `gh` albo brak logowania → podaj komendę do ręcznego uruchomienia i odnotuj to w rejestrze.
- Strona: najpierw podgląd, adres pokazujesz użytkownikowi; produkcja dopiero po jego akceptacji. Argument `podglad` kończy się tutaj — wpis w rejestrze z celem `podgląd`.
- Komenda zawiodła → stop. Nie ponawiasz z innymi flagami bez pytania. Zapisz stan (co już wyszło, co nie) w rejestrze.

## 6. Sprawdzenie na miejscu

Uruchom `wydanie.sprawdzenie` i kontrole z sekcji `Wydanie` profili — na tym, co faktycznie wydano: zainstalowany pakiet z rejestru, adres produkcyjny strony. Pokaż wynik.

**Nie przeszło** → zaproponuj wycofanie według P-18 (poprzednie wdrożenie na hostingu, `git revert` i ponowne wdrożenie, przy pakiecie — oznaczenie złej wersji i wydanie poprawki). Wycofujesz po zgodzie. Potem skill `napraw` dla przyczyny.

## 7. Zapis

- `.ai/wydania.md` (z szablonu, jeśli go nie ma): nowy wpis na górze — data, wersja albo commit, cel (`produkcja` | `podgląd`), co zawiera, dokąd (z adresem GitHub Release, jeśli powstał), wynik sprawdzenia, uwagi. Także dla nieudanego wydania i wycofania.
- Commit `wydanie: <wersja albo data> — rejestr` (tylko `.ai/wydania.md`, jeśli nie wszedł do poprzedniego commita).
- Wydanie ujawniło fałszywe założenie (np. „działa po instalacji”) → lekcja według sekcji „Lekcje” w kontrakcie; brakujący krok wydania → propozycja zmiany `wydanie.komendy` albo sprawdzeń.
- Raport: wersja, dokąd, wynik sprawdzenia, hash i tag.
