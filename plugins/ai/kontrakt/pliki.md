# Pliki projektu i instrukcje agentów

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Układ w repozytorium projektu

```text
AGENTS.md                    # sekcja ## Projekt (uruchamianie, mapa kodu, pułapki, odesłanie do zasad) + blok warsztatu (warsztat:start / warsztat:koniec)
CLAUDE.md                    # importuje @AGENTS.md
.gitignore                   # między innymi sekrety: .env, klucze (skill start)
.githooks/pre-commit         # skan sekretów przed każdym commitem; włączany przez core.hooksPath (skill start)
.claude/settings.json        # permissions.deny: Claude Code nie czyta plików z sekretami (skill start)
.ai/
  warsztat.json              # konfiguracja: walidacja i jej punkt odniesienia, ścieżki, git, bezpieczeństwo, tracker, modele subagentów
  ROADMAP.md                 # MAPA — cel produktu i jedyne źródło statusu zdolności
  SLOWNIK.md                 # słownik domeny: byty, nie-byty, granice
  ZASADY.md                  # zasady projektu: architektura, wzorce, kod, testy, niefunkcjonalne — czego kod ma się trzymać
  lekcje.md                  # rozwiązane problemy: fałszywe założenie → jak robimy teraz, z licznikiem wystąpień
  proby.md                   # katalog prób: co nie działa, co odłożone, co nierozwiązane — żeby nie powtarzać
  zrodla.md                  # pliki z zamiarem użytkownika i stan ich rozbioru; zastana dokumentacja i jej aktualność; rozjazdy dokumentacja ↔ kod
  przemyslenia/
    RRRR-MM-DD-slug.md       # myśl przemyślana pytaniami sokratejskimi: założenia, sprzeczności, wniosek — dojrzała albo odrzucona
  profil.md                  # rozstrzygnięcia list decyzji z profili klas aplikacji: numer → ADR, zasada, pominięte, później, otwarte
  wydania.md                 # rejestr wydań i wdrożeń: co, kiedy, dokąd, wynik sprawdzenia
  decyzje/
    0001-kebab-slug.md       # ADR — tylko decyzje trudne do odwrócenia (domyślne miejsce, patrz „Zastany projekt”)
  obszary/
    <slug>.md                # mapa obszaru kodu z skilla poznaj: moduły, przepływy, testy, pułapki, źródła
  zdolnosci/
    <slug>/
      mapa.md                # żywy stan: następny krok, pytania, decyzje, plasterki, stan sesji
      spec.md                # kontrakt: co ma powstać (bez kodu)
      weryfikacja.md         # rundy weryfikacji krzyżowej: kto, zakres, uwagi, wynik
      odbior.md              # lista dla człowieka: co przeklikać i sprawdzić na prawdziwym środowisku; wynik odbioru
      tickety/
        01-kebab-slug.md     # jeden pionowy plaster = jedna sesja
  badania/
    RRRR-MM-DD-slug.md       # wynik skilla badanie: pytanie, odpowiedź, źródła
  eksperymenty/
    RRRR-MM-DD-slug.md       # pytanie, warunki, pomiar odniesienia, iteracje i wynik; kod roboczy poza repo
  sesje/
    RRRR-MM-DD-slug.md       # przerwana praca poza zdolnością (np. naprawa); usuwa ją ten, kto kończy
```

Katalogi `obszary/`, `badania/`, `eksperymenty/`, `przemyslenia/` i `sesje/` oraz pliki `zrodla.md`, `proby.md`, `profil.md` i `wydania.md` powstają dopiero wtedy, gdy są potrzebne. `CHANGELOG.md` w korzeniu repozytorium — tylko gdy projekt prowadzi historię zmian dla użytkowników (`wydanie.changelog`).

Poza projektem, w katalogu pluginu (poziom wyżej niż ten plik), leżą `wzorce/` — wiedza przenoszona między projektami („Wzorce — wiedza między projektami” w `kontrakt/pamiec.md`) — i `profile/` — listy decyzji dla klas aplikacji („Profile — klasy aplikacji” w `kontrakt/profile-i-wydania.md`). Nie kopiujesz ich do `.ai/`.

**Katalog decyzji** to `sciezki.decyzje` z `.ai/warsztat.json` (domyślnie `.ai/decyzje`). Każdy skill, który czyta albo pisze ADR, używa tej ścieżki.

Slug zdolności i ticketu: kebab-case, tylko ASCII (bez polskich znaków: `platnosci-w-aplikacji`, nie `płatności`). Numery ticketów są lokalne dla zdolności: `01`, `02`, … Numery ADR są globalne: `0001`, `0002`, …

## AGENTS.md i CLAUDE.md

- **`AGENTS.md` to jedyne miejsce instrukcji projektu.** Czytają go Codex i inne agenty, a Claude Code przez import. Ma dwie części: `## Projekt` (fakty o repozytorium, należy do projektu) i blok warsztatu między znacznikami `warsztat:start v<wersja>` i `warsztat:koniec` (należy do pluginu).
- **`CLAUDE.md` zawiera import `@AGENTS.md`** w pierwszej linii i najwyżej uwagi specyficzne dla Claude Code pod nim. Nigdy kopię treści — Claude Code czyta `AGENTS.md` sam tylko wtedy, gdy `CLAUDE.md` nie istnieje, więc bez importu reguły by zniknęły, a z kopią — rozjechały.
- **Blok warsztatu się nie edytuje.** Własne reguły dopisujesz poza nim. Nowsza wersja pluginu wymienia blok w całości (skill `start`, krok „Aktualizacja”); hook i skill `gdzie` zgłaszają, gdy blok jest starszy niż plugin.
