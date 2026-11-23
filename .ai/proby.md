# Próby

> Co sprawdziliśmy w praktyce i nie zadziałało, co odłożyliśmy, czego nie rozwiązaliśmy. Przeszukaj ten plik, zanim zaproponujesz albo zaczniesz podejście. Statusy i zasady: „Próby — czego nie powtarzać” w `kontrakt/pamiec.md`; format wpisu: „Próba — wpis w `proby.md`” w `kontrakt/formaty.md` — oba w katalogu pluginu warsztatu.
> Statusy: `nie-dziala` (z dowodem) | `odlozone` | `nierozwiazane`

## 2026-11-23 — EBUSY przy usuwaniu katalogu sesji testowej [model-zgloszen]

- Status: nierozwiazane
- Hasła: EBUSY, rmSync, rimraf, claude -p, katalog projektu, sesja testowa, Windows, testy/sesja.mjs
- Warunki: Windows 10, Node 22, Claude Code 2.1.301, sesje z narzędziem PowerShell i Bash, katalog TEMP sesji w korzeniu testu
- Wynik: po zakończeniu `claude -p` usunięcie katalogu projektu kończy się `EBUSY` (3 sesje w jednym przebiegu, 1 w następnym, wcześniej żadna). Kilka sekund później nikt nie trzyma katalogu: brak procesu z `warsztat-sesja-` w linii poleceń, a `Remove-Item` przechodzi. Błąd w `finally` zasłaniał wynik tury.
- Zamiast tego: obejście — `usun()` w `testy/sesja.mjs` ponawia do 20 razy co 1 s i przy porażce ostrzega zamiast rzucać; po przebiegu usuwamy `warsztat-sesja-*` z `%TEMP%` ręcznie.
- Wróć, gdy: ostrzeżenie „nie usunięto katalogu sesji” wraca regularnie albo zostawia katalogi — wtedy ustalić, kto trzyma uchwyt (Process Explorer / `handle.exe` w chwili błędu).
