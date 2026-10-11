# Formaty zapisów

Część [kontraktu warsztatu](../KONTRAKT.md). Czytaj sekcje potrzebne do zadania; ścieżki zasobów pluginu w treści są względem katalogu z `KONTRAKT.md`.

## Formaty

### ROADMAP.md — linia zdolności

```markdown
- [slug](zdolnosci/slug/mapa.md) — status — jedno zdanie, po co to jest
```

W Zrobione: `— gotowe RRRR-MM —`. W Porzucone: `— porzucone RRRR-MM — powód`. W Mgle pod linią 1–3 wcięte punkty z decyzjami do rozstrzygnięcia (nie zadaniami). Zdolność w `pomysl` może nie mieć jeszcze folderu — wtedy linia bez linku.

### Próba — wpis w `proby.md`

```markdown
## 2026-10-02 — Strumieniowanie PDF przez pdfkit w workerze [faktury]

- Status: nie-dziala
- Hasła: pdfkit, worker_threads, strumień, PDF
- Warunki: Node 22, pdfkit 0.15, pliki > 20 MB
- Wynik: worker traci strumień po 64 kB, błąd `ERR_STREAM_PREMATURE_CLOSE` (commit a1b2c3d)
- Zamiast tego: generowanie w procesie głównym z kolejką ([decyzja 0007](decyzje/0007-kolejka-pdf.md))
- Wróć, gdy: pdfkit ≥ 0.16 albo przejście na inny generator
```

Nagłówek: data, krótki opis podejścia, w nawiasie zdolność albo obszar. `Hasła` służą wyszukiwaniu — nazwy, których ktoś użyje, myśląc o tym samym podejściu.

### Lekcja — wpis w `lekcje.md`

```markdown
- [platnosci] Webhook przychodził podwójnie — założyliśmy jedno doręczenie, dostawca gwarantuje „co najmniej raz” → idempotencja po `event_id` ([ADR 0006](decyzje/0006-idempotencja.md)). Wzorzec: doreczenie-co-najmniej-raz. Wystąpienia: 2026-10-02 test; 2026-10-15 przegląd
```

Jedna linijka: `[znacznik] problem — założyliśmy X, okazało się Y → teraz Z`. Znacznik to jeden slug: obszaru (z `.ai/obszary/` albo nazwa modułu), zdolności albo `projekt` — dla lekcji o całym projekcie (narzędzia, środowisko, proces) albo kilku obszarach naraz. Dalej opcjonalnie link do śladu i `Wzorzec:`, na końcu zawsze `Wystąpienia:` — data i kto wykrył (`użytkownik`, `test`, `błąd`, `badanie`, `przegląd`, `weryfikacja`), rozdzielone średnikami. Powtórka dopisuje kolejne wystąpienie na końcu linijki.

### Zasada — wpis w `ZASADY.md`

```markdown
### Z03. Domena nie importuje infrastruktury

- Siła: twarda
- Egzekwowanie: automat — `npx depcruise src` (reguła `domena-bez-infrastruktury`)
- Status: obowiązuje
- Dlaczego: [ADR 0004](decyzje/0004-architektura-heksagonalna.md)
- Wyjątki: `src/domena/legacy/` do końca zdolności `migracja-zamowien` — [ADR 0009](decyzje/0009-przejsciowy-legacy.md)
```

### ADR — statusy

`przyjęta | zastana | nieaktualna | zastąpiona przez NNNN`. ADR-ów nie usuwasz. Recenzenci i skille traktują jako obowiązujące tylko `przyjęta` i `zastana`. W obcym katalogu ADR zachowujesz jego słownictwo statusów i dopisujesz nasze tylko tam, gdzie brakuje odpowiednika.

### Otwarte pytania w mapie

```markdown
- [ ] [grill] Czy faktura korygująca jest osobnym bytem? — blokuje spec
- [ ] [badanie] Jakie limity ma webhook dostawcy płatności? — nie blokuje
- [ ] [prototyp] Czy podgląd PDF w przeglądarce wystarczy? — blokuje spec
```

Typ mówi, co rozstrzyga pytanie: `[grill]` rozmowa z użytkownikiem (skill `pomysl`), `[badanie]` źródła (skill `badanie`), `[prototyp]` eksperyment według `## Eksperymenty i prototypy`, którego kod roboczy wyrzucamy po odpowiedzi. Rozstrzygnięte pytanie przenosisz do `## Decyzje` z linkiem do badania, wyniku eksperymentu albo ADR.

### Scenariusz — wpis w `spec.md`

```markdown
S3. Rabat za próg — Zakładając koszyk klienta detalicznego, gdy wartość koszyka osiąga próg rabatowy, wtedy zamówienie dostaje rabat 10%.

| wartość koszyka | rabat |
| --- | --- |
| 499,99 zł | 0% |
| 500,00 zł | 10% |
```

### Pojęcie i kontekst — wpis w `SLOWNIK.md`

```markdown
## Kontekst: Księgowość

Odpowiada za: dokumenty rozliczeniowe i ich numerację. Obszary: `obszary/faktury.md`. Relacje: bierze Zamówienie ze Sprzedaży i tłumaczy Klienta na Nabywcę.

- **Faktura** — dokument rozliczeniowy wystawiony Nabywcy po realizacji zamówienia. _Zawsze:_ wystawiona faktura się nie zmienia; korekta to nowa faktura. _Nie mylić z:_ Zamówieniem.
```

### Ticket — frontmatter

```yaml
---
nr: "03"
tytul: Webhook oznacza fakturę jako opłaconą
status: do-zrobienia
blokowany-przez: ["01", "02"]
scenariusze: ["S3", "S5"]
budowal: "Claude Code / claude-opus-5-5"
github: null
---
```

`scenariusze` przy refaktorze wskazuje niezmienniki (`["N1", "N2"]`); ticket bez scenariusza (np. infrastruktura testów) ma `[]` i w Notatkach mówi, któremu scenariuszowi służy.

`github` zostaje `null`, dopóki `.ai/warsztat.json` ma `"tracker": "pliki"`. Przy `"tracker": "github"` to numer Issue (`github: 12`).
