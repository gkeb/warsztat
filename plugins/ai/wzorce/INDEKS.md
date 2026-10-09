# Wzorce

> Problemy i rozwiązania wspólne dla projektów. Przeszukaj ten indeks, zanim wybierzesz podejście albo gdy objaw buga wygląda znajomo; potem otwórz plik wzorca i sprawdź Warunki oraz „Nie dotyczy”. Pisze tylko skill `retro`, za zgodą. Format: sekcja „Wzorce” w kontrakcie warsztatu, szablon `szablony/wzorzec.md`.

<!-- - [Tytuł](kebab-slug.md) — kandydat | potwierdzony | wycofany — hasła: a, b, c — sygnały: krótko, co widać -->
- [Powłoka pośrednicząca zmienia argumenty](powloka-posredniczaca-zmienia-argumenty.md) — kandydat — hasła: cmd.exe, PowerShell, heredoc, cytowanie, zmienne środowiskowe, Windows — sygnały: argument ze spacją rozbity, zmienna z końcową spacją, zgubione `\` z heredoca, ręcznie działa, przez agenta nie
- [Sandbox agenta odcina cache narzędzi](sandbox-agenta-odcina-cache-narzedzi.md) — kandydat — hasła: sandbox, PermissionError, cache, uv, pytest, tmp_path, basetemp — sygnały: odmowa dostępu do temp testów, globalnego cache albo `.venv`; poza agentem przechodzi
