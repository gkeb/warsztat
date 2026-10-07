---
name: zamknij
description: Jawnie zamyka zdolność jako gotową albo porzuconą, sprawdza kompletność i porządkuje roadmapę, słownik oraz lekcje.
disable-model-invocation: true
argument-hint: "[slug] [porzuc]"
---

# Zamknięcie zdolności

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md`. Użyj slugu i trybu podanego przy wywołaniu skilla albo w bieżącej wiadomości. Bez slugu → zdolność z Teraz w `weryfikacja` (albo w `budowa`, gdy weryfikacja jest wyłączona). Wczytaj `mapa.md`, `spec.md` i wszystkie tickety.

Wszystkie pytania o wyjątek od kryteriów zamknięcia, porzucenie i wybór następnej zdolności zadawaj zgodnie z sekcją `## Jak pytać` w kontrakcie.

## Gotowe — tryb domyślny

1. **Kompletność.** Wszystkie tickety `zrobione` albo `porzucony`, walidacja z `warsztat.json` przechodzi. Jeśli nie — wypisz braki i zapytaj, czy zamykać mimo to (z notatką w mapie), czy wracać do skilla `buduj`.
   **Weryfikacja** (gdy `weryfikacja.wymagana`): najnowsza runda w `weryfikacja.md` ma wynik `przeszła`, obejmuje ostatni commit zdolności i nie ma otwartych uwag blokujących. Jeśli nie — zatrzymaj się i wskaż skill `weryfikuj` w innym modelu. Zamknięcie bez weryfikacji tylko na wyraźną decyzję użytkownika, z notatką w mapie: `RRRR-MM-DD — zamknięte bez weryfikacji — powód`.
2. **Spec kontra rzeczywistość.** Gdy weryfikacja przeszła, opierasz się na jej raporcie — nie powtarzasz jej. Bez weryfikacji uruchom skill `przeglad` dla całej zdolności (`<slug>`). W obu przypadkach przejdź po scenariuszach specu (`Sx`): czy istnieją w kodzie i czy mają test akceptacyjny z numerem. Każdą różnicę nazwij. Za zgodą popraw spec tak, żeby opisywał to, co faktycznie działa, i dopisz w mapie: `RRRR-MM-DD — odstępstwo od specu: … — dlaczego`.
   Przy rodzaju `refaktor` zamiast scenariuszy: niezmienniki wciąż zielone, kryterium końca ze specu spełnione (np. stary kod usunięty), a `.ai/ZASADY.md` odpowiada stanowi docelowemu — nowe zasady dopisane, wyjątki usunięte.
   Wyjątki od zasad przypisane do tej zdolności („do końca zdolności …”) — usuń albo zapytaj, czy przedłużyć.
3. **Słownik.** Pojęcia, które pojawiły się w kodzie tej zdolności, są w `SLOWNIK.md`, we właściwym kontekście, i znaczą to samo. Niezmienniki ustalone w tej zdolności są przy pojęciach.
4. **Lekcje.** Najpierw sam przejrzyj mapę (odstępstwa od specu, porzucone tickety), uwagi z `weryfikacja.md` i commity `fix:` tej zdolności: fałszywe założenia bez lekcji zaproponuj jako wpisy. Potem zapytaj: „Co poszło inaczej, niż zakładaliśmy?”. Dopisz 0–3 lekcje według sekcji „Lekcje” w kontrakcie. Jeśli któraś lekcja ma co najmniej dwa wystąpienia, coś wyglądało na problem ogólny albo lekcji jest ponad ~40 linijek — zaproponuj skill `retro`.
   Jeśli zdolność zmieniła obszar opisany w `.ai/obszary/`, zaktualizuj jego mapę albo zaproponuj `skill poznaj <obszar>`.
5. **Roadmapa.** Przenieś linię do Zrobione: `— gotowe RRRR-MM —`. W mapie Następny krok: `— zamknięte RRRR-MM-DD`.
   **Historia zmian.** Projekt z `warsztat.json` → `wydanie.changelog` → dopisz zdolność do `## Niewydane` (grupa `Dodane`, `Zmienione` albo `Usunięte`), jednym albo dwoma zdaniami z perspektywy użytkownika, w języku z P-02. Zmiana niewidoczna dla użytkownika (refaktor) — bez wpisu. Zaproponuj skill `wydaj`, jeśli zmiana jest widoczna i nic nie czeka na dołączenie do wydania.
   **Profil.** Pozycje `.ai/profil.md` rozstrzygnięte w tej zdolności mają aktualny wynik.
6. **Co dalej.** Teraz ma wolne miejsce. Pokaż Dalej i zapytaj, co wchodzi (albo nic). Decyduje użytkownik. Wybrana zdolność dostaje `grill`, a Następny krok to `skill pomysl <slug>`.
7. **Commit** zmian w `.ai/`: `<slug>: zamknięcie`, według `### Commit` w kontrakcie (skan sekretów, potem push według `git.push`).
8. **Scalenie** — tylko przy `git.galezie` = `zdolnosc`: push gałęzi zdolności, `gh pr ready`, a po zgodzie `gh pr merge --merge --delete-branch` (albo `--rebase`, według `git.scalanie`; nigdy squash), potem `git switch <glowna>` i `git pull --ff-only`. Komendy pokazujesz przed uruchomieniem. Konflikt przy scaleniu → stop i pytanie; nie rozwiązujesz go sam w ciemno. Przy `tracker` = `github` sprawdź po scaleniu, że Issue ticketów się zamknęły (`gh issue list --label <slug> --state open`).

## Porzucenie — `porzuc`

1. Zapytaj o powód, jednym zdaniem.
2. Mapa: `RRRR-MM-DD — porzucone — powód`. Tickety `do-zrobienia` i `w-toku` → `porzucony`.
3. Roadmapa: linia do Porzucone: `— porzucone RRRR-MM — powód`.
4. Kod, który już wszedł, zostaje. Zapytaj, czy coś trzeba cofnąć. Nigdy nie cofasz automatycznie.
5. GitHub: `tracker` = `github` → otwarte Issue zdolności zamknij jako `not planned` z powodem. `git.galezie` = `zdolnosc` → PR zamknij bez scalania (`gh pr close`); commit porzucenia (zmiany w `.ai/`) zrób na gałęzi głównej, a gałąź zdolności usuń tylko na wyraźną prośbę.
6. Kroki 6–7 jak wyżej.
