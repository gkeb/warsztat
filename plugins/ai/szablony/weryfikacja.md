# {{Nazwa zdolności}} — weryfikacja

> Rundy weryfikacji krzyżowej: domyślnie inny model niż budujący sprawdza dowiezienie względem specu i planu. Jeśli ustawienie dopuszcza ten sam model, oznacz rundę jako nieniezależną. Najnowsza runda na górze. Format: sekcja „Weryfikacja krzyżowa” w kontrakcie warsztatu.

<!--
## Runda R2 — RRRR-MM-DD — przeszła | nie przeszła

- Zakres: cała zdolność | ticket NN — commity a1b2c3d..e4f5a6b
- Weryfikator: Codex / <model> — niezależna | nieniezależna (powód)
- Budujący: Claude Code / <model> (z pól `budowal` w ticketach)
- Walidacja: zielona | czerwona (co)
- Kryteria: 14/15 spełnione, 1 bez testu
- Scenariusze specu: 5/5 z testem akceptacyjnym — S1 `tests/…::test_s1_…`, S2 …; bez testu: —

### Uwagi

- R2.1 [blokująca] `src/faktury/webhook.ts:42` — handler nie jest zarejestrowany w routerze; nic go nie wywołuje poza testem — scenariusz 3 — otwarta
- R2.2 [warto] … — otwarta
- R1.3 [blokująca] … — naprawiona (ticket 07)
- R1.4 [drobna] … — odrzucona: <uzasadnienie>
-->
