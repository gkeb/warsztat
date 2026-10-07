# Profil: strona

> Strona albo serwis WWW — wizytówka, blog, dokumentacja, landing, sklep — budowane generatorem jak Astro (podobnie: Eleventy, Hugo, Next w trybie statycznym). Używaj razem z profilem `przekrojowe`. Przy rozbudowanej aplikacji z kontami i danymi dochodzą decyzje aplikacji webowej (P-08–P-12, P-22) w pełnym zakresie. Format: sekcja „Profile” w kontrakcie warsztatu.
> Strona żyje dłużej niż jej budowa: treść, wygląd i wdrożenia zmieniają się co tydzień. Dlatego tu ważą wydanie, historia zmian i pielęgnacja.

## Decyzje

### Architektura

- **WEB-01 Rodzaj i skala** — co to za strona, ile podstron, jak często zmienia się treść i kto ją zmienia (Ty w kodzie, ktoś nietechniczny w edytorze).
- **WEB-02 Renderowanie** — statycznie (SSG, domyślne w Astro), na serwerze (SSR) albo hybrydowo (pojedyncze strony na serwerze). SSR wymaga adaptera (Node, Netlify, Vercel, Cloudflare) i zmienia hosting.
- **WEB-03 Źródło treści** — Markdown / MDX w repo (Astro content collections ze schematem — błąd w treści łapie build), CMS oparty na gicie (Decap, Tina — edycja w przeglądarce, commity w repo), CMS zewnętrzny (Sanity, Storyblok — treść poza repo, przebudowa po webhooku) albo dane z API.
- **WEB-04 Historia edycji treści** — przy treści w repo historią jest git: kto, kiedy, co. Czy strona pokazuje datę aktualizacji (z frontmattera albo z gita), czy zmiany treści przechodzą przez podgląd przed publikacją, czy są wpisem w historii zmian. Przy CMS zewnętrznym — jego wersjonowanie i czy wystarcza.
- **WEB-05 Interaktywność** — ile JavaScriptu: zero, wyspy (`client:load`, `client:visible`, `client:idle`) z jednym frameworkiem (Preact, Svelte, React, Solid) albo bez frameworka. Minimum JS jako zasada.
- **WEB-06 System wyglądu** — sposób stylowania (zwykły CSS ze zmiennymi, CSS w komponentach Astro, Tailwind), tokeny (kolory, typografia, odstępy, promienie), tryb ciemny, komponenty bazowe i gdzie leżą. Ustalenia → `ZASADY.md`.
- **WEB-07 Adresy URL** — struktura, końcowy ukośnik (`trailingSlash`), `base` przy hostingu w podkatalogu, przekierowania po zmianie adresu, strona 404.
- **WEB-08 Obrazy, media, fonty** — `astro:assets` (formaty, rozmiary, leniwe ładowanie), tekst alternatywny jako wymóg; fonty u siebie (bez zewnętrznego CDN), podzbiór znaków z polskimi literami, `font-display`.
- **WEB-09 SEO i udostępnianie** — tytuł i opis każdej strony, adres kanoniczny, Open Graph z obrazem, mapa strony (`@astrojs/sitemap`), `robots.txt`, dane strukturalne, RSS dla bloga.
- **WEB-10 Formularze i zaplecze** — kontakt, zapis na newsletter: usługa zewnętrzna, funkcja serverless albo endpoint SSR; ochrona przed spamem; co widzi wysyłający po sukcesie i błędzie.
- **WEB-11 Analityka i cookies** — czy w ogóle; analityka bez cookies (Plausible, Umami) bez baneru albo Google Analytics z banerem zgody (RODO, P-10).
- **WEB-12 Języki** — wersje językowe, routing (`/en/`), co z treścią nieprzetłumaczoną.
- **WEB-13 Hosting i domena** — Netlify, Vercel, Cloudflare Pages, GitHub Pages albo własny serwer; domena, HTTPS, nagłówki bezpieczeństwa (CSP, HSTS), cache zasobów.
- **WEB-14 Środowiska** — podgląd dla każdej gałęzi albo PR, produkcja z gałęzi głównej; zmienne środowiskowe w czasie budowania a w czasie działania.

## Doświadczenie (UX)

- **WEB-20 Odbiorcy i zadania** — kto przychodzi na stronę i z jakimi 1–3 zadaniami (znaleźć kontakt, przeczytać artykuł, kupić). Każde zadanie to przepływ i scenariusz.
- **WEB-21 Architektura informacji** — nawigacja, hierarchia stron, liczba kroków do każdego zadania, wyszukiwarka (np. Pagefind) — tak czy nie.
- **WEB-22 Responsywność** — szerokości kontrolne, na których sprawdzamy każdą zmianę (np. 375, 768, 1280, 1920), projekt od telefonu.
- **WEB-23 Stany** — pusty (brak wpisów), ładowanie, błąd, brak JavaScriptu, wolne łącze.
- **WEB-24 Dostępność** — cel WCAG 2.2 AA: kontrast, obsługa klawiaturą, widoczny focus, teksty alternatywne, kolejność nagłówków, etykiety formularzy, `prefers-reduced-motion`.
- **WEB-25 Treści** — ton, wezwania do działania, komunikaty formularzy, teksty pustych stanów; kto je pisze i zatwierdza.
- **WEB-26 Odczuwalna wydajność** — budżet Core Web Vitals (LCP < 2,5 s, CLS < 0,1, INP < 200 ms) i waga strony; sprawdzany automatem, nie na oko.

## Testy akceptacyjne

Publiczny interfejs to zbudowana strona w przeglądarce. Testy idą na wyniku `astro build` + `astro preview`, nie na serwerze deweloperskim. Podgląd uruchamia sam Playwright przez `webServer` w `playwright.config` (komenda podglądu, port, `reuseExistingServer: !process.env.CI`) — po testach go zamyka, więc żaden serwer nie zostaje. `test-results/` i `playwright-report/` są na liście `sprzatanie.smieci`.

- **Przepływy** — Playwright: scenariusz przechodzi zadanie użytkownika (nawigacja, formularz, wyszukiwanie) w szerokościach kontrolnych.
- **Treść i meta** — Playwright albo test na wygenerowanym HTML: tytuł, opis, Open Graph, kanoniczny, nagłówki; schemat treści sprawdza `astro check`.
- **Dostępność** — `@axe-core/playwright` na kluczowych stronach; zero naruszeń poważnych i krytycznych.
- **Linki** — sprawdzanie martwych linków na zbudowanej stronie (np. `lychee`).
- **Wydajność** — Lighthouse CI z budżetem z WEB-26.
- **Wygląd** — zrzuty ekranu w szerokościach kontrolnych do akceptacji człowieka (rodzaj `wyglad`); porównanie zrzutów jako regresja wizualna (`toHaveScreenshot`) — decyzja projektu, bo bywa kruche.

## Niedowiezienia

- nowa strona bez tytułu, opisu, Open Graph albo poza mapą strony i nawigacją;
- obraz bez tekstu alternatywnego albo bez wymiarów (skacze układ);
- działa w `astro dev`, psuje się w `astro build` albo pod adresem z `base`;
- zmieniony adres bez przekierowania;
- formularz bez komunikatu błędu, bez ochrony przed spamem albo wysyłający na adres testowy;
- tekst zastępczy (lorem ipsum, „TODO”), obrazy zastępcze;
- sprawdzone tylko na szerokim ekranie; niewystarczający kontrast; treść widoczna tylko z JavaScriptem;
- skrypt analityki bez zgody tam, gdzie zgoda jest wymagana.

## Wydanie

- `astro check`, build, testy akceptacyjne, linki, Lighthouse — zielone;
- wdrożenie podglądu → przegląd człowieka (zrzuty albo adres podglądu) → produkcja;
- sprawdzenie po wdrożeniu: kluczowe adresy zwracają 200, nieistniejący — 404, mapa strony i `robots.txt` dostępne, Lighthouse na produkcji w budżecie;
- wycofanie: poprzednie wdrożenie na hostingu (Netlify, Vercel, Cloudflare mają przywrócenie jednym kliknięciem) albo `git revert` + ponowne wdrożenie;
- zmiana treści bez zmiany kodu to też wydanie — krótki wpis w `.ai/wydania.md`, bez podbijania wersji (P-15 zwykle `data` albo `brak`).

## Pielęgnacja

- zależności, szczególnie wersje główne Astro i integracji — przez osobną zdolność, nie przy okazji;
- martwe linki zewnętrzne;
- Lighthouse i dostępność na produkcji — trend, nie jednorazowo;
- formularze nadal dochodzą (testowa wysyłka);
- domena i certyfikat — data wygaśnięcia;
- treści nieaktualizowane od dawna (stare daty, nieaktualne ceny, nieistniejące oferty);
- błędy w Google Search Console, jeśli podpięte.
