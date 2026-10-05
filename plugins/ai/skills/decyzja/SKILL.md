---
name: decyzja
description: Zapisuje trudne do odwrócenia decyzje architektoniczne jako ADR albo dopisuje drobniejsze ustalenia do mapy. Użyj przy wyborze bazy, auth, granic modułów, usług zewnętrznych i trwałych formatów.
argument-hint: "[temat]"
---

# Decyzja architektoniczna

Otwórz `../../KONTRAKT.md` i szablon `../../szablony/decyzja.md` względem tego pliku `SKILL.md`. Użyj tematu podanego przy wywołaniu skilla albo w bieżącej wiadomości. Przejrzyj istniejące ADR w katalogu decyzji (`sciezki.decyzje` z `.ai/warsztat.json`, domyślnie `.ai/decyzje/`).

## 1. Czy to w ogóle ADR?

ADR piszemy, gdy spełnione są **wszystkie trzy** warunki:

- decyzję trudno lub drogo odwrócić;
- za pół roku ktoś (także Ty) zapyta „dlaczego tak?”;
- były realne alternatywy.

Jeśli nie — to nie ADR, tylko linijka w `## Decyzje` w mapie zdolności. Zapisz ją tam i skończ.

## 2. Zbierz materiał

- Kontekst: jaki problem wymusza decyzję, jakie są ograniczenia. Sprawdź kod i `.ai/`, zanim zapytasz.
- Brakuje faktów (jak działa biblioteka, limity usługi, zgodność wersji) → najpierw skill `badanie`, potem rekomendacja. Nie opieraj ADR na pamięci.
- Zanim wypiszesz opcje, przeszukaj `.ai/proby.md`. Uwzględnij trafienia w porównaniu: podejście ze statusem `nie-dziala` opisz razem z wynikiem i linkiem do wpisu; `odlozone` przedstaw jako świadomy powrót do niedokończonej próby.
- Przeszukaj też `.ai/lekcje.md` i `../../wzorce/INDEKS.md` (względem tego pliku). Pasujący wzorzec to argument w porównaniu opcji — z oceną, czy jego Warunki dotyczą tego projektu.
- Przedstaw 2–3 realne opcje, każdą z głównym plusem i minusem.
- Twoja rekomendacja z uzasadnieniem.
- Jeśli decyzja nie zapadła — przedstaw opcje zgodnie z sekcją `## Jak pytać` w kontrakcie. Rekomendację pokaż jako pierwszą; decyduje użytkownik.

## 3. Zapisz

- Plik w katalogu decyzji, numer = kolejny wolny. W zastanym katalogu ADR zachowujesz jego format, numerację i nazewnictwo plików (zob. `## Zastany projekt` w kontrakcie); szablon `decyzja.md` to wtedy lista treści do pokrycia, nie układ.
- Decyzja odtworzona z kodu lub historii (zwykle ze skilla `poznaj`) ma status `zastana` i wypełnione pole `Źródło`.
- Najwyżej jedna strona. Decyzja w trybie „Robimy X”, nie „Rozważamy X”.
- Zastępuje wcześniejszy ADR → w starym zmień status na `zastąpiona przez NNNN`. Nie usuwaj go. ADR, który przestał być prawdą bez następcy, dostaje `nieaktualna`.
- W mapie zdolności, której decyzja dotyczy, dodaj w `## Decyzje` linijkę z linkiem do ADR.
- Jeśli decyzja wprowadza pojęcie, dopisz je do `SLOWNIK.md`.
- Jeśli decyzja ustanawia regułę, której kod ma się trzymać (architektura, wzorzec, stanowisko kodu, testy) — dodaj albo zmień zasadę w `.ai/ZASADY.md` z linkiem do tego ADR. Nowej zasadzie nadaj kolejny wolny numer `Zxx`; wycofanych numerów nigdy nie używaj ponownie. ADR zastępujący inny → zasady oparte na starym zaktualizuj albo oznacz `wycofana`. Zaproponuj sposób egzekwowania, najlepiej automat.
