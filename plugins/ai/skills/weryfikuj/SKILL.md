---
name: weryfikuj
description: Jawnie uruchamiana weryfikacja krzyżowa — domyślnie inny model niż budujący sprawdza, czy etap (zdolność) albo ticket został dowieziony zgodnie ze specem i planem, ze szczególnym naciskiem na niedowiezienia. Zapisuje rundę w weryfikacja.md i decyduje — przeszła albo wracamy do budowy. Sam niczego nie poprawia.
disable-model-invocation: true
argument-hint: "[slug | slug#NN]"
---

# Weryfikacja krzyżowa

Otwórz `../../KONTRAKT.md` względem tego pliku `SKILL.md` — szczególnie `## Weryfikacja krzyżowa`. Szablon raportu: `../../szablony/weryfikacja.md`. Zakres weź z wywołania skilla albo z bieżącej wiadomości. Pytania zadawaj zgodnie z `## Jak pytać`.

Jesteś **weryfikatorem, nie budującym**. Oceniasz i zapisujesz uwagi. Nie poprawiasz kodu, testów ani specu — nawet drobiazgów. Poprawki robi budujący w swojej sesji.

## 1. Zakres i niezależność

- Argument `slug` albo brak → zdolność z Teraz w statusie `weryfikacja`. Argument `slug#NN` → pojedynczy ticket (zdolność może być wtedy jeszcze w `budowa`).
- Zdolność w innym statusie niż `weryfikacja` przy weryfikacji całości → zatrzymaj się i powiedz, czego brakuje (np. otwarte tickety).
- **Kim jesteś:** narzędzie (Claude Code, Codex, inne) i model, jeśli go znasz. Nie zgaduj — nieznany model zapisz jako „nieznany”.
- **Kto budował:** pole `budowal` w ticketach z zakresu, a pomocniczo stopki commitów (`git log --format='%h %s%n%(trailers)'`).
- Porównuj nazwy modeli, nie narzędzi: ten sam model w innym kliencie nadal jest tym samym modelem. Jeśli Twój model pasuje do któregokolwiek budującego i `.ai/warsztat.json` → `weryfikacja.innyModel` = `true`, ostrzeż i zapytaj: przerwać i uruchomić w innym modelu (rekomendowane) albo kontynuować jako weryfikację nieniezależną. Gdy `innyModel` = `false`, możesz użyć tego samego modelu, ale oznacz weryfikację jako nieniezależną. Jeśli Twój albo budujący model jest `nieznany`, nie twierdź, że weryfikacja jest niezależna; ustal model albo oznacz ją jako nieniezależną za zgodą użytkownika. Wybór zapisz w raporcie.

## 2. Materiał

- `spec.md` (lub `spec-refaktor.md` — sprawdź `Rodzaj:` w mapie), wszystkie tickety z zakresu, `mapa.md` (Decyzje, Plasterki), poprzednie rundy w `weryfikacja.md`.
- Zakres kodu: commity z prefiksem `<slug>#` (albo `<slug>#NN:`), od pierwszego do ostatniego. Zapisz zakres hashy w raporcie.
- `.ai/SLOWNIK.md`, ADR-y z katalogu decyzji, `.ai/obszary/` dotkniętych obszarów, `.ai/proby.md`.
- Profile projektu (`warsztat.json` → `profile`) z `../../profile/` — sekcje `Niedowiezienia` i `Testy akceptacyjne`; `.ai/profil.md`.
- Uruchom walidację z `.ai/warsztat.json` (z uwzględnieniem `odniesienie.znane`). Czerwona walidacja to uwaga blokująca.

Przy dużym zakresie możesz rozdzielić czytanie na subagentów według `## Subagenci i modele` — ocenę i zapis robisz sam.

## 3. Co sprawdzasz

**Plan i spec — czy wszystko jest:**

1. Każdy scenariusz specu `Sx` (przy refaktorze: każdy niezmiennik `Nx` i kryterium końca) — gdzie jest w kodzie i który test akceptacyjny go sprawdza. Szukaj po numerze w testach (`grep -rn "S3"` w katalogach testów), potem sprawdź, czy test rzeczywiście ćwiczy scenariusz: przez publiczny interfejs, z „Zakładając” odtworzonym w danych testu, ze wszystkimi przykładami z tabeli i z asercją dla każdej frazy „Wtedy” / „I” — wskaż ją (plik i linię). Fraza bez asercji przez publiczny interfejs (np. sprawdzana tylko w pliku na dysku, gdy scenariusz mówi o wyjściu) to scenariusz niepokryty. Scenariusz bez testu akceptacyjnego albo z testem, który sprawdza coś innego niż scenariusz, to uwaga blokująca. Test z numerem, którego nie ma w specu (albo scenariusza usuniętego), to uwaga `warto`.
   Niezmienniki domeny ze słownika, których dotyka zdolność — czy któryś scenariusz z testem je sprawdza.
2. Każde kryterium akceptacji każdego ticketu — spełnione, niespełnione albo bez testu. Pole `scenariusze` w ticketach pokrywa wszystkie scenariusze specu.
3. „Poza zakresem” i decyzje z mapy — nie zostały złamane.
4. Przyjęte i zastane ADR-y oraz zasady z `.ai/ZASADY.md` — nie zostały złamane (zasada twarda poza wpisanym wyjątkiem = uwaga blokująca, z numerem `Zxx`).

**Niedowiezienia — czego zwykle brakuje, choć ticket jest „zrobiony”:**

- zaślepki, `TODO`, `FIXME`, `NotImplemented`, puste gałęzie, zakomentowany kod;
- dane, adresy, klucze albo konfiguracja wpisane na sztywno tam, gdzie spec mówi o prawdziwym źródle;
- tylko szczęśliwa ścieżka: brak obsługi błędów, pustych danych, limitów, uprawnień opisanych w specu;
- rzeczy niepodpięte: nowy kod, którego nic nie wywołuje — trasa, widok, komenda, handler, zadanie, rejestracja w kontenerze;
- brakujące migracje, zmienne środowiskowe, wpisy konfiguracji, uprawnienia, dokumentacja uruchomienia;
- testy, które niczego nie sprawdzają: brak asercji, asercje na mockach, pominięte (`skip`) albo osłabione;
- mocki zostawione w kodzie produkcyjnym;
- scenariusz „zrobiony” tylko w teście, a nie przez publiczny interfejs;
- każda pozycja z `Niedowiezienia` profili projektu, której dotyka zdolność;
- rodzaj `wyglad`: ticket bez „Akceptacji wyglądu”, brak zrzutów w szerokościach kontrolnych, czerwone albo pominięte kontrole automatyczne z profilu. Zrzuty możesz obejrzeć i zgłosić uwagi, ale akceptacji człowieka nie zastępujesz.

Każde niedowiezienie potwierdź w kodzie — wskaż plik i linię albo brak, który da się sprawdzić (np. „żadne wywołanie `rejestrujWebhook` poza testem”).

## 4. Raport — nowa runda w `weryfikacja.md`

Dopisz rundę na górze pliku (z szablonu). Poprzednich rund nie zmieniasz, poza statusami ich uwag: uwaga z poprzedniej rundy, którą teraz potwierdzasz jako poprawioną → `naprawiona`.

Każda uwaga: numer `R<runda>.<n>`, waga (`blokująca` / `warto` / `drobna`), miejsce, co jest nie tak, dowód, odwołanie (scenariusz, kryterium, ADR), status `otwarta`.

Wynik rundy:

- **`przeszła`** — brak otwartych uwag blokujących, walidacja zielona, a gdy projekt ma CI — zielony run dla weryfikowanego commita (`gh run list --commit <hash>`); brak runu albo czerwony to uwaga blokująca;
- **`nie przeszła`** — co najmniej jedna uwaga blokująca.

## 5. Decyzja i następny krok

Pokaż użytkownikowi podsumowanie: wynik, liczba uwag według wagi, najważniejsze trzy.

- **Przeszła (cała zdolność)** → status zostaje `weryfikacja`, `mapa.md` → Następny krok: `skill zamknij <slug>`. Uwagi `warto` i `drobna` — zapytaj, które zamienić w tickety, a które zostawić.
- **Nie przeszła (cała zdolność)** → zaproponuj tickety z uwag blokujących (jeden ticket może objąć kilka powiązanych uwag). Po zgodzie: tickety z szablonu, tytuł „Po weryfikacji R<runda>: …”, w Notatkach numery uwag; status zdolności → `budowa`; Następny krok: `skill buduj <slug>`. Po poprawkach i ukończeniu ticketów ponownie uruchom `skill weryfikuj <slug>` zgodnie z `weryfikacja.innyModel` (domyślnie w innym modelu).
- **Uwaga sporna** — budujący albo użytkownik się z nią nie zgadza → rozstrzyga użytkownik. Odrzucona dostaje status `odrzucona` i jedno zdanie uzasadnienia.
- **Weryfikacja pojedynczego ticketu** nie zmienia statusu zdolności. Wyniki trafiają do raportu, a zaakceptowane tickety z uwag do planu; Następny krok wskazuje `skill buduj <slug>`. Po naprawie sprawdź ponownie ticket naprawczy pod jego nowym numerem (`skill weryfikuj <slug>#NN`). Pełną zdolność weryfikuj dopiero po ukończeniu wszystkich ticketów.

Zaproponuj commit `<slug>: weryfikacja R<runda>` (tylko `.ai/`) — zrób go po zgodzie.
