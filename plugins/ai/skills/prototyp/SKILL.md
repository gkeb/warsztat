---
name: prototyp
description: Rozstrzyga pytanie [prototyp] z mapy zdolności ograniczonym eksperymentem — plan z celem, zakresem i budżetem do akceptacji, pętla prób poza repo (subagent eksperymentator), niezależna ocena wyniku i podpięcie odpowiedzi w mapie. Użyj dla otwartego pytania [prototyp], gdy odpowiedź wymaga sprawdzenia w praktyce, albo do wznowienia przerwanego eksperymentu.
argument-hint: "[slug | slug pytanie | pytanie]"
---

# Prototyp

Przeczytaj wspólny rdzeń `../../KONTRAKT.md`, „Eksperymenty i prototypy” w `../../kontrakt/praca.md` i procedurę `../../procedury/eksperyment.md` względem tego pliku `SKILL.md`. Procedura wskazuje dalsze działy kontraktu; przed delegowaniem czytaj „Subagenci i modele” w `../../kontrakt/narzedzia.md`. Instrukcje ról leżą obok: `eksperymentator.md` i `oceniajacy.md`. Szablon wyniku: `../../szablony/eksperyment.md`.

Prototyp odpowiada na pytanie — nie dostarcza funkcji. Nie pisze kodu produkcyjnego, nie zmienia specu ani decyzji. Kod prototypu powstaje w katalogu roboczym poza repo i nie trafia do produkcji; potrzebna zmiana kodu to ticket (`buduj`) albo naprawa (`napraw`).

## 1. Wybierz pytanie

- `slug` → otwarte pytania `[prototyp]` z `## Otwarte pytania` w mapie tej zdolności; kilka → zapytaj, które, rekomendując blokujące spec. `slug pytanie` → to pytanie. Samo pytanie bez zdolności → eksperyment bez mapy; wynik podepniesz tam, skąd przyszło (przemyślenie, sesja, ADR).
- Bez argumentu → pytania `[prototyp]` ze zdolności w Teraz; brak → zapytaj.
- Pytanie ma już link `eksperyment:` → wczytaj plik. Status `planowany` → krok 2 od akceptacji; `w-toku` albo `przerwany` → krok 3 z pozostałym budżetem, bez zaczynania budżetu od nowa; `rozstrzygniety` albo `nierozstrzygniety` → krok 5, jeśli wynik nie jest jeszcze podpięty.
- Zanim zaplanujesz: przeszukaj `.ai/proby.md`, `.ai/badania/`, `.ai/eksperymenty/` i indeks wzorców po hasłach pytania. Trafienie przywołaj. Gdy odpowiedź da się ustalić ze źródeł (dokumentacja, kod biblioteki) — to pytanie `[badanie]`: zaproponuj zmianę typu i skill `badanie`. Gdy rozstrzyga je preferencja użytkownika — `[grill]` i skill `pomysl`.

## 2. Plan i akceptacja

- Ułóż plan według „Ustal plan” w procedurze i zapisz go w `.ai/eksperymenty/RRRR-MM-DD-slug.md` ze statusem `planowany`; w polu `Pytanie` link do mapy.
- W mapie dopisz do pytania link, bez statusu — status żyje w pliku eksperymentu (format: „Otwarte pytania w mapie” w `../../kontrakt/formaty.md`). `## Następny krok` = `skill prototyp <slug>`.
- Pokaż plan krótko: pytanie, co uznamy za odpowiedź, zakres i katalog roboczy, ocena, budżet. Zapytaj o akceptację celu, zakresu i budżetu. Bez niej nie uruchamiasz prób; plan zostaje `planowany` i pytanie nie wisi bez śladu.
- Po akceptacji: `Plan zaakceptowany` z datą i zakresem zgody, status `w-toku`.

## 3. Pętla prób

- Katalog roboczy poza repo (katalog tymczasowy agenta albo systemowy). Zapisz go w pliku eksperymentu.
- Jeśli możesz, uruchom subagenta: w Claude Code `eksperymentator` z tego pluginu, w innym agencie subagent z pełną ścieżką do `eksperymentator.md`. Model według kontraktu (`modele.<agent>.prototyp`). Przekaż tylko fakty: ścieżkę pliku eksperymentu, katalog roboczy, korzeń projektu (do odczytu) i pozostały budżet. W tle tylko wtedy, gdy host pozwala subagentowi w tle uruchamiać komendy bez pytania; inaczej na pierwszym planie.
- Bez subagenta wykonaj `eksperymentator.md` sam.
- Eksperymentator kończy przy celu, budżecie albo stagnacji i nie rozszerza zakresu. Prośbę o więcej budżetu albo szerszy zakres przedstaw użytkownikowi jako nową zgodę.

## 4. Niezależna ocena

- Wybrany wariant oceniasz na przypadkach końcowych, niewykorzystanych do doboru wariantu (procedura, „Oceń wynik i przekaż”).
- Jeśli możesz, uruchom subagenta `oceniajacy` (albo subagenta z pełną ścieżką do `oceniajacy.md`) ze świeżym kontekstem: surowe wyniki przypadków końcowych, kryteria z planu i minimum kontekstu — bez hipotezy i oczekiwanej odpowiedzi. Model według `modele.<agent>.prototyp`.
- Bez subagenta albo bez świeżego kontekstu oceń sam i zapisz w wyniku, że ocena nie była niezależna.
- Sprawdź ustalenia oceniającego w danych, zanim je przyjmiesz. Ustal status: `rozstrzygniety`, `nierozstrzygniety` albo `przerwany`.

## 5. Podepnij wynik

Według „Oceń wynik i przekaż” w procedurze, a w mapie:

- `rozstrzygniety` → pytanie przenieś do `## Decyzje`: `RRRR-MM-DD — odpowiedź — dlaczego (eksperyment: link)`. Twardy wybór, który z tego wynika → zaproponuj skill `decyzja`. Odpowiedź „nie” dla podejścia → także wpis `nie-dziala` w `.ai/proby.md` z linkiem.
- `nierozstrzygniety` → pytanie zostaje otwarte z linkiem do wyniku; w wyniku warunek powrotu. Zapytaj, co dalej: nowy plan z innym pomiarem, zmiana typu na `[grill]` (decyzja mimo niepewności — z zapisanym ryzykiem w Decyzjach) albo odłożenie (`odlozone` w `proby.md`). Wyniku nierozstrzygniętego nie zapisuj w mapie jako faktu.
- `przerwany` → skill `przekaz` z pozostałym budżetem, wersją wariantu i miejscem artefaktów.
- Nowe pytania, które wyszły w trakcie → `## Otwarte pytania` z typem. Fałszywe założenie ze znanym rozwiązaniem → `lekcje.md`.
- Zaktualizuj `## Następny krok`: pytanie blokujące spec rozstrzygnięte i nic innego nie blokuje → `skill spec <slug>` (albo `pomysl <slug>`, jeśli grill trwa).
- Podsumuj użytkownikowi w 2–4 zdaniach: odpowiedź, na ile pewna, zakres obowiązywania.
- Posprzątaj katalog roboczy i procesy według kontraktu — po zapisaniu w wyniku wszystkiego, co potrzebne do odtworzenia pomiaru.

Commit `.ai/` według `### Commit` w `../../kontrakt/git.md`: `<slug>: prototyp — <krótka odpowiedź>`.
