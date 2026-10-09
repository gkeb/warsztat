# Profil: html

> Statyczna strona z ręcznie utrzymywanych plików HTML i CSS, opcjonalnie ze zwykłym JavaScriptem — bez generatora, frameworka i kroku budowania. Pasuje do wizytówki, portfolio, prostego landingu, dokumentacji lub małego serwisu informacyjnego. Używaj razem z profilem `przekrojowe`. Dla strony budowanej generatorem użyj `strona`.

## Decyzje

### Architektura

- **HTML-01 Zakres i odbiorcy** — cel strony, odbiorcy, liczba podstron, główne zadania i osoba utrzymująca treść.
- **HTML-02 Pliki, nawigacja i adresy** — układ plików i zasobów, wspólna nawigacja, adresy podstron, końcowy ukośnik, strona 404 i przekierowania po zmianie adresu.
- **HTML-03 Dokument i metadane** — język dokumentu (`lang`), kodowanie UTF-8, viewport, tytuł i opis każdej strony, adres kanoniczny oraz Open Graph. Mapa strony i `robots.txt`, jeśli skala serwisu tego wymaga.
- **HTML-04 Powtarzana treść** — czy nagłówek, stopka i inne wspólne fragmenty są powielane w plikach, czy potrzebny jest mały mechanizm generowania. Generator oznacza, że projekt lepiej pasuje do profilu `strona`.
- **HTML-05 CSS i wygląd** — układ arkuszy stylów, zmienne dla kolorów, typografii i odstępów, szerokości responsywne, tryb ciemny oraz miejsce wspólnych komponentów. Ustalenia → `ZASADY.md`.
- **HTML-06 JavaScript** — czy interakcja jest potrzebna; jeśli tak, zwykłe skrypty modułowe, ładowane bez blokowania treści. Podstawowa treść i nawigacja działają bez JavaScriptu.
- **HTML-07 Obrazy, media i fonty** — teksty alternatywne, wymiary obrazów, formaty i leniwe ładowanie; licencja zasobów; fonty lokalne czy systemowe.
- **HTML-08 Formularze i usługi zewnętrzne** — czy formularz wysyła dane do zewnętrznej usługi. Ustal komunikaty sukcesu i błędu, ochronę przed spamem, analitykę oraz wymagane zgody na cookies.
- **HTML-09 Hosting i domena** — hosting plików statycznych, własna domena, HTTPS, nagłówki bezpieczeństwa, cache, publikacja w podkatalogu i obsługa 404.

## Doświadczenie (UX)

- **Odbiorcy i zadania** — 1–3 główne zadania użytkownika; każdy ma krótką ścieżkę przez nawigację i treść.
- **Responsywność** — szerokości kontrolne, na których sprawdzamy strony (np. 375, 768 i 1280 px); projekt od telefonu.
- **Dostępność** — cel WCAG 2.2 AA: semantyczne elementy HTML, kolejność nagłówków, obsługa klawiaturą, widoczny focus, kontrast, teksty alternatywne i etykiety formularzy.
- **Stany i treść** — działanie bez JavaScriptu, komunikaty formularza, strony puste i błędu, zrozumiałe linki i brak tekstów zastępczych.

## Testy akceptacyjne

Publiczny interfejs to pliki udostępnione pod adresem HTTP. Testuj statyczny katalog przez lokalny serwer HTTP, nie przez `file://`; test ma używać tych samych ścieżek i ustawień podkatalogu co hosting. Nie ma kroku `build`.

- **Struktura i metadane** — walidacja HTML oraz kontrola `lang`, kodowania, viewportu, tytułów, opisów i nagłówków.
- **Linki** — sprawdzanie lokalnych odnośników i zasobów, także po wejściu bezpośrednio na podstronę.
- **Dostępność** — automatyczna kontrola wybranych stron oraz sprawdzenie klawiaturą.
- **Przepływy** — test przeglądarkowy dla kluczowej nawigacji i formularzy, jeśli istnieją.
- **Wygląd i wydajność** — zrzuty w szerokościach kontrolnych do akceptacji człowieka; budżet wydajności dobrany do projektu.

## Niedowiezienia

- strona nie ma tytułu, języka dokumentu albo poprawnego widoku na telefonie;
- treść lub nawigacja wymagają JavaScriptu, mimo że nie ma takiego wymagania;
- linki, obrazy albo arkusze stylów nie działają po wejściu bezpośrednio na podstronę lub pod adresem z podkatalogiem;
- formularz nie pokazuje wyniku wysłania, nie chroni przed spamem albo wysyła na adres testowy;
- obraz nie ma tekstu alternatywnego lub wymiarów; tekst ma niski kontrast albo nie działa z klawiaturą;
- strona 404, przekierowania lub HTTPS nie działają na hostingu;
- tekst zastępczy albo zasób bez sprawdzonej licencji trafia do publikacji.

## Wydanie

- walidacja HTML, linków i dostępności przechodzi;
- hosting publikuje pliki źródłowe bez komendy budowania;
- po publikacji sprawdź stronę główną, podstrony, zasoby, 404, HTTPS i podkatalog, jeśli jest używany;
- wycofanie: przywrócenie poprzedniego wdrożenia albo `git revert` i ponowna publikacja.

## Pielęgnacja

- martwe linki i nieaktualne treści;
- formularze i zewnętrzne skrypty nadal działają i są potrzebne;
- domena, certyfikat HTTPS i konfiguracja hostingu;
- nowe podstrony zachowują wspólne metadane, nawigację i dostępność.
