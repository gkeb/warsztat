# Migracja pliku zgłoszeń do Issues — lista wynikowa

> Ślad S16: każdy wpis ostatniej wersji pliku zgłoszeń warsztatu (`git show db9aa48:ZGLOSZENIA.md`) ma tu jedną pozycję — Issue z etykietą `process-report`, commit wdrożenia albo mapa zdolności. Sprawdza ją test S16 (`testy/migracja-zgloszen.test.mjs`) bez sieci; z GitHubem porównana raz, przy migracji 2026-11-25 (`gh issue list --label process-report`). Ticket: [07](tickety/07-issues-jedynym-zrodlem.md).

Mapowanie statusów: `nowe` → `status: new`, `przyjete` → `status: accepted`, `do-dyskusji` → `status: discussion`.

- Z05 → https://github.com/gkeb/warsztat/issues/13 — `status: new`
- Z07 → https://github.com/gkeb/warsztat/issues/14 — `status: discussion`
- Z08 → https://github.com/gkeb/warsztat/issues/15 — `status: discussion`
- Z09 → krok 1 wdrożony w `0e24356` (0.26.0, skill `referencja`); kroki 2–3 w mapie zdolności [przeniesienie](../przeniesienie/mapa.md) — bez Issue (długi plan z decyzjami)
- Z10 → https://github.com/gkeb/warsztat/issues/16 — `status: accepted`
- Z11 → https://github.com/gkeb/warsztat/issues/17 — `status: accepted`
- Z12 → https://github.com/gkeb/warsztat/issues/18 — `status: accepted`
- Z13 → https://github.com/gkeb/warsztat/issues/19 — `status: accepted`
- Z14 → https://github.com/gkeb/warsztat/issues/20 — `status: accepted`
- Z15 → https://github.com/gkeb/warsztat/issues/21 — `status: discussion`
