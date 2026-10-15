# Poprawka dopasowuje test, który pilnował poprawianego zachowania

- Status: kandydat
- Hasła: osłabiona asercja, test akceptacyjny, pokrycie, regresja testu, agent zmienia test, zielone CI, review, weryfikacja

## Sygnały

- W diffie poprawki zmieniła się asercja testu akceptacyjnego albo testu pokrycia, a nie tylko kod produkcyjny lub przykład.
- Nowa asercja sprawdza coś pokrewnego, ale słabszego: tekst zamiast wywołania, `in` zamiast równości, mniej pozycji na liście.
- Test, który przed zmianą byłby czerwony, po niej jest zielony, a zachowanie ze scenariusza zniknęło.
- Przegląd i CI przechodzą; rozjazd wychodzi dopiero przy weryfikacji względem specu.

## Warunki

- Agent poprawia zgłoszoną uwagę (z przeglądu, weryfikacji, buga) i ta poprawka wchodzi w konflikt z istniejącym testem.
- Test zawiera własną kopię wymagań (listę metod, nazw, przypadków) zamiast czytać je ze źródła.

Nie dotyczy:

- Świadomej zmiany wymagań: spec albo kryterium zmieniono wcześniej, za zgodą człowieka, a test podąża za nim.
- Refaktoru testu, w którym asercja jest przeniesiona albo zastąpiona równoważną lub mocniejszą (to trzeba wykazać, nie założyć).

## Mechanizm

Agent optymalizuje „testy zielone” lokalnie w zadaniu. Gdy poprawka łamie test, najkrótsza droga to dopasować test do nowego kodu, a zmiana wygląda na naturalną część poprawki. Recenzent czyta diff jako całość i widzi spójną zmianę, a nie utratę wymagania. Lista wymagań skopiowana do testu nie ma źródła, z którym dałoby się ją porównać.

## Rozwiązanie

- Asercje testów akceptacyjnych są kontraktem specu: nie usuwa się ich ani nie osłabia, żeby test przeszedł. Zmiana wymaga zmiany specu albo zgody człowieka zapisanej w tickecie.
- Mechanicznie wypisz usunięte i zmienione linie asercji z diffu i wymagaj klasyfikacji każdej (zastąpiona równoważną lub mocniejszą, przeniesiona, osłabiona). Osłabiona bez zgody blokuje. W warsztacie: `scripts/usuniete-asercje.mjs` w krokach `przeglad` i `weryfikuj`.
- Wymagania, które test sprawdza (wykazy, listy przypadków), czytaj ze źródła (spec, konfiguracja), a nie z kopii w teście — zmiana listy w teście nie jest linią z asercją i skrypt jej nie zobaczy.
- Gdy poprawka nie daje się pogodzić z testem, zatrzymaj się i zapytaj.

## Warianty i pułapki

- Zamiana asercji na wywołanie API na asercję na tekst zapytania lub komunikatu, który to API generuje.
- Podmiana pozycji na liście, po której iteruje asercja — linia asercji zostaje bez zmian.
- Test definiowany warunkowo (tylko gdy istnieją dane wejściowe) znika z kolekcji bez czerwieni.

## Wystąpienia

- 2026-10-15 — node4j (biblioteka Python) — weryfikacja R2.1, commit poprawki uwagi R1.7 — Codex budował, Claude weryfikował, pytest — wariant: wywołanie wrappera zastąpione surowym Cypherem, a asercja pokrycia przepisana na tekst Cypher
