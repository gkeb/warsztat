---
nr: "02"
tytul: Szkic zgłoszenia z filtrem i wysyłka po zgodzie
status: do-zrobienia
blokowany-przez: ["01"]
scenariusze: ["S1", "S2", "S4", "S5", "S7", "S12"]
budowal: null
github: 4
---

# 02 — Szkic zgłoszenia z filtrem i wysyłka po zgodzie

## Co widać po zrobieniu

Najcieńsza ścieżka od lekcji do Issue:
- W projekcie z lekcją `[warsztat]` o 3 wystąpieniach retro pokazuje szkic zgłoszenia w stałych polach, już po filtrze prywatności i skanie sekretów, i pyta o zgodę.
- Po „tak” w kolejnej turze zakłada Issue przez `gh` w repozytorium zgłoszeń z ustawienia projektu.
- Lekcja dostaje dopisek `Zgłoszenie: <link>`.
- Lekcja o problemie bezpieczeństwa warsztatu nie trafia do szkicu, tylko do wskazania kanału bezpieczeństwa.

## Kryteria akceptacji

- [ ] S2: test akceptacyjny przechodzi.
- [ ] S4: test akceptacyjny przechodzi dla wiersza „`buduj` zacommitował `.env`” z tabeli S1. Ustawienie ma jawne repozytorium, a potem `null`. W obu wariantach:
  - nie ma `issue create`;
  - odpowiedź wskazuje politykę bezpieczeństwa i prywatne zgłaszanie podatności oficjalnego repozytorium warsztatu.
- [ ] S5: test akceptacyjny przechodzi dla wszystkich wierszy tabeli. Asercja sprawdza treść `--body-file` w zapisie atrapy, nie tylko odpowiedź. Pojęcie „Faktura korygująca” w słowniku, śledzony plik `src/billing/invoice.ts` i token w treści to syntetyczne dane fikstury.
- [ ] S7: test akceptacyjny przechodzi.
- [ ] S1: wiersz „3 wystąpienia → szkic” przechodzi.
- [ ] S12: wiersz „własne repozytorium” przechodzi. Pozostałe wiersze kończy ticket 03.
- [ ] Ustawienie projektu: klucz `zgloszenia` w `warsztat.json` = `"<właściciel>/<nazwa>"` albo `null`.
  - Opis jest w kontrakcie (sekcja o zgłoszeniach warsztatu) i w opisie szablonu konfiguracji. Szablon nie ustawia klucza, bo brak klucza znaczy „oficjalne repozytorium” (ticket 03).
  - Kontrakt mówi wprost, że `github.repo` (lustro ticketów projektu) i `zgloszenia` (dokąd idą zgłoszenia warsztatu) to różne repozytoria.
- [ ] Kanał bezpieczeństwa zawsze należy do oficjalnego repozytorium warsztatu, niezależnie od klucza `zgloszenia`. Fork albo firma nie przejmuje podatności warsztatu. Adres oficjalnego repozytorium daje ticket 03; do tego czasu retro mówi „kanał bezpieczeństwa: polityka bezpieczeństwa oficjalnego repozytorium warsztatu” bez adresu.
- [ ] Szkic i Issue są po angielsku, z polami w tej kolejności:
  - `Workshop version`,
  - `Agent and model`,
  - `Skill and step`,
  - `Kind` (`regular` / `data loss`),
  - `Symptom`,
  - `Occurrences` (liczba i daty),
  - `Proposed direction`.
- [ ] Tytuł Issue: `[<skill>] <objaw w kilku słowach>`. Etykiety `process-report` i `status: new`.
- [ ] Filtr prywatności:
  - bierze pojęcia ze słownika projektu i listę plików z `git ls-files`;
  - skanuje szkic i każdy komentarz komendą `gitleaks stdin --redact --no-banner` (kod wyjścia różny od 0 zatrzymuje wysyłkę), niezależnie od `bezpieczenstwo.skanSekretow`, które skanuje zmiany do commita, a nie tekst;
  - bez `gitleaks` w `PATH` retro nie wysyła i mówi dlaczego.
- [ ] Format lekcji w kontrakcie (formaty, wpis lekcji): `Zgłoszenie: <link>` stoi przed `Wystąpienia:`, tak jak `Wzorzec:`.
- [ ] Retro, krok 3 punkt 3 i krok 5:
  - w projekcie innym niż repozytorium warsztatu lekcja `[warsztat]` idzie wyłącznie ścieżką zgłoszeń (S1) i już nie trafia do pliku zgłoszeń, nawet gdy klon warsztatu jest dostępny;
  - poniżej progu zostaje lekcją;
  - wdrożenie od razu (zgoda w sesji, klon dostępny) zostaje bez zmian;
  - lekcja wysłana jako zgłoszenie zostaje w lekcjach z dopiskiem, nie jest usuwana;
  - w samym repozytorium warsztatu plik zgłoszeń działa do ticketu 07.
- [ ] Słownik: wpis „Rodzaj problemu” (zwykły, utrata danych, bezpieczeństwo) z definicją utraty danych ze specu.
- [ ] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Pozostałe wiersze S1 i S12, odmowa i `niewysłane` — ticket 03.
- Wyszukiwanie podobnych i komentarze — ticket 04.
- Brak `gh`, sprawdzenie wersji — ticket 05.

## Notatki

- Kolejność sprawdzeń według specu (Decyzje projektowe); w tym tickecie bez kroku wersji (S9).
- S4 jest tu, bo słownik ma niezmiennik „problem bezpieczeństwa nie jest publicznym zgłoszeniem”, a ten ticket otwiera ścieżkę wysyłki. Z tego samego powodu tu jest S5.
