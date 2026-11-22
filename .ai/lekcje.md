# Lekcje

> Rozwiązane problemy: założenie — agenta albo nasze — okazało się fałszywe, i jak robimy teraz. Zapisuj od razu, niezależnie od tego, kto wykrył błąd. Ta sama przyczyna → dopisz wystąpienie, nie nową linijkę. Problem bez rozwiązania idzie do `proby.md`. Zasady: „Lekcje — czego się nauczyliśmy” w `kontrakt/pamiec.md`; format wpisu: „Lekcja — wpis w `lekcje.md`” w `kontrakt/formaty.md` — oba w katalogu pluginu warsztatu.

Ostatnie retro: —

<!-- - [obszar | zdolność | projekt] problem — założyliśmy X, okazało się Y → teraz Z (link do śladu). Wzorzec: plik. Wystąpienia: RRRR-MM-DD kto-wykrył; RRRR-MM-DD kto-wykrył -->

- [hooki] Kontekst hooka SessionStart nie docierał do modelu w Codexie — założyliśmy, że zwykły tekst na stdout działa w obu narzędziach, a Codex parsuje stdout zaczynający się od `[` albo `{` jako JSON i przy błędzie odrzuca kontekst (wyjście `stan.mjs` zaczynało się od `[warsztat]`) → hook wypisuje JSON `hookSpecificOutput.additionalContext`, który przyjmują oba narzędzia; pilnuje tego `tests/stan-hook.test.mjs` (badanie: [wynik](badania/2026-11-22-kontekst-hookow-codex.md) w gałęzi `zdolnosc/model-zgloszen`). Wystąpienia: 2026-11-22 Codex (eksperyment) i badanie
