# Hooki i subagenci

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Hooki kodu

Plugin ma hooki, które pilnują kodu bez pamięci agenta (`scripts/kod.mjs`, Claude Code i Codex). Działają w każdym repozytorium gita, ale tylko narzędziami, które projekt już ma (`node_modules`, `.venv`, `PATH`) — niczego nie pobierają ani nie instalują.

- **Po edycji pliku** (`PostToolUse`: `Edit`, `Write`, `MultiEdit`, `apply_patch`) — formater projektu na tym pliku: Biome (gdy jest `biome.json`) albo Prettier dla JS/TS/CSS; `ruff format` (gdy ruff jest skonfigurowany) albo `black` (gdy jest `[tool.black]`) dla Pythona; `rustfmt` z edycją z `Cargo.toml` dla Rusta. Formater, który nie przeszedł, milczy.
- **Przed końcem odpowiedzi** (`Stop`) — kontrola plików zmienionych względem `HEAD` (z nieśledzonymi): `tsc --noEmit` dla TypeScriptu; `ruff check` oraz `mypy` / `pyright`, gdy są skonfigurowane, dla Pythona; `cargo clippy` (albo `cargo check`) dla Rusta — błędy zawsze, ostrzeżenia tylko w zmienionych plikach. Do tego zakazane wzorce w dodanych liniach. Problemy blokują zakończenie **raz na odpowiedź** (`stop_hook_active`); drugi raz hook tylko informuje człowieka. Kontrola rusza tylko wtedy, gdy od poprzedniej w tej sesji zmieniły się pliki — samo pytanie przy brudnym drzewie nie blokuje odpowiedzi. Po przejściu — dźwięk „gotowe”.
- **Prośba o zgodę** (`PermissionRequest`) — inny dźwięk: agent stoi i czeka.
- **`warsztat.json` → `hooki`:** `formatowanie` (`true` / `false`), `kontrola` (`true` — automatyczna jak wyżej; `false`; albo lista szybkich komend uruchamianych zamiast niej — nie pełne testy, te są w `walidacja`), `zakazane` — lista `{ "wzorzec": "<regex>", "pliki": ["*.ts"], "pomin": ["**/*.test.ts"], "zamiast": "<co użyć>", "zasada": "Zxx" }`. Agent nie poprawia zakazanych wzorców sam — pokazuje listę i pyta. Pliki z `bezpieczenstwo.chronione` (bez konfiguracji — lista domyślna z szablonu) kontrola pomija: ich treść nie trafia do komunikatu.
- **Zmienne środowiskowe** (dla człowieka, np. `env` w ustawieniach agenta): `WARSZTAT_HOOKI=0` wyłącza formatowanie i kontrolę, `WARSZTAT_DZWIEK=0` — dźwięki.
- **Hook nie zastępuje reguły.** Te same wymagania stoją w bloku warsztatu w `AGENTS.md` (formatowanie, kontrola przed końcem, bez obchodzenia błędów, zakazane wzorce), a zakazany wzorzec ma swoją zasadę w `ZASADY.md` z `Egzekwowanie: automat — hooki.zakazane`. Gdy hook nie działa — Codex bez zaufania w `/hooks`, brak Node, wyłączenie — agent nadal zna regułę z instrukcji.

## Subagenci i modele

Skille `przeglad`, `badanie` i `prototyp` oddają część pracy subagentom, czyli świeżym kontekstom, które nie znają przebiegu rozmowy; `buduj`, `napraw`, `poznaj` i `weryfikuj` mogą oddać czytanie i uruchamianie testów roli `czytelnik`. Tak jak przy pytaniach, korzystasz tylko z możliwości, które bieżący agent faktycznie ma.

- **Poziomy pracy.** Model subagenta zależy od rodzaju pracy, nie od skilla. Główny model zostaje przy pisaniu kodu, decyzjach oraz scalaniu i sprawdzaniu wyników subagentów.

  | Poziom | Role | Domyślnie Claude | Domyślnie Codex |
  | --- | --- | --- | --- |
  | `czytanie` | `czytelnik` — eksploracja kodu, dokumentacji i historii, uruchomienie testów i walidacji, streszczenie porażek | `haiku`, effort `medium` | `gpt-6.1-terra`, `medium` |
  | `recenzja` | `recenzent-zgodnosci`, `recenzent-jakosci`, `recenzent-bezpieczenstwa`, `oceniajacy` | `sonnet` | `gpt-6.2-sol`, `medium` |
  | `badanie` | `badacz`, `eksperymentator` | `sonnet` | `gpt-6.2-sol`, `medium` |

  Źródło wartości: `.ai/warsztat.json` → `modele.<agent>.<poziom>` = `{ "model": …, "wysilek": … }`; `null` = domyślny modelu albo definicji. Uzasadnienie wyboru: zgłoszenie Z06 i badania w `docs/badania/` repozytorium warsztatu.
- **Jedno źródło instrukcji.** Instrukcje każdej roli leżą w pliku obok skilla (np. `skills/przeglad/recenzent-zgodnosci.md`); rola wspólna dla kilku skilli (`czytelnik`) — w `procedury/`. Obowiązują w każdym agencie.
- **Claude Code.** Plugin ma gotowe definicje subagentów w `agents/` z modelem i effortem domyślnymi dla poziomu i narzędziami dobranymi do roli. Uruchamiasz je po nazwie i przekazujesz `model` oraz `effort` z `modele.claude.<poziom>`, jeśli narzędzie delegowania je przyjmuje. Subagent na innym modelu niż rodzic nie dziedziczy effortu sesji — bez wartości przy wywołaniu obowiązuje pole `effort` z definicji.
- **Codex.** Definicje w `plugins/ai/agents/` są dla Claude Code; przenośny manifest pluginu nie deklaruje agentów. Model i wysiłek niosą projektowe definicje `.codex/agents/warsztat-<poziom>.toml` (`model`, `model_reasoning_effort`), które `start` generuje z `modele.codex` — mają pierwszeństwo przed dziedziczeniem z rodzica. Uruchamiasz subagenta z `agent_type` = `warsztat-<poziom>`, a w wiadomości podajesz pełną ścieżkę do pliku roli i fakty. Gdy schemat narzędzia pokazuje `model` i `reasoning_effort`, podaj je też przy wywołaniu, razem z `fork_turns: "none"`. `.ai/warsztat.json` nie jest konfiguracją Codexa — po zmianie `modele.codex` uruchom `start`, żeby odświeżył definicje.
- **Model faktycznie użyty.** Bez definicji poziomu i bez pola modelu przy wywołaniu subagent dziedziczy model rodzica. Nie raportuj użycia tańszego modelu, jeśli nie został faktycznie wybrany.
- **Tylko fakty na wejściu.** Subagentowi przekazujesz ścieżki i zakres (komendę diffu, ticket, spec, pytanie), nie streszczenie rozmowy. Jego wartością jest niezależność.
- **Świeży kontekst.** Jeśli narzędzie delegowania domyślnie dziedziczy rozmowę, wyłącz to przy uruchomieniu recenzenta lub oceniającego eksperyment (np. `fork_turns: "none"`, gdy taki parametr jest dostępny). Samo pominięcie streszczenia nie usuwa odziedziczonej historii. Gdy host nie pozwala zapewnić świeżego kontekstu, zaznacz brak niezależności; oszczędność cache nie zmienia tej oceny.
- **Subagent, który zapisuje.** Tylko `eksperymentator` uruchamia komendy i zapisuje pliki: plik eksperymentu i katalog roboczy poza repo, nic więcej. W tle uruchamiasz go tylko wtedy, gdy host pozwala subagentowi w tle wykonywać komendy bez pytań o uprawnienia.
- **Bez subagentów.** Wykonaj instrukcje ról sam, po kolei, i napisz w raporcie, że przegląd nie był niezależny.
- **Weryfikacja.** Ustalenia subagenta sprawdzasz w kodzie lub w źródle, zanim je przekażesz użytkownikowi. Fałszywe alarmy odrzucasz.
