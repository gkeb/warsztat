# Wzorce

> Problemy i rozwiązania wspólne dla projektów. Przeszukaj ten indeks, zanim wybierzesz podejście albo gdy objaw buga wygląda znajomo; potem otwórz plik wzorca i sprawdź Warunki oraz „Nie dotyczy”. Pisze tylko skill `retro`, za zgodą. Format: „Wzorce — wiedza między projektami” w `kontrakt/pamiec.md` warsztatu, szablon `szablony/wzorzec.md`.

<!-- - [Tytuł](kebab-slug.md) — kandydat | potwierdzony | wycofany — hasła: a, b, c — sygnały: krótko, co widać -->
- [Powłoka pośrednicząca zmienia argumenty](powloka-posredniczaca-zmienia-argumenty.md) — potwierdzony — hasła: cmd.exe, PowerShell, heredoc, cytowanie, zmienne środowiskowe, Windows, Docker, UTF-16, przekierowanie — sygnały: argument ze spacją rozbity, zmienna z końcową spacją, zgubione `\` z heredoca, JSON w argumencie zniekształcony, plik z przekierowania w UTF-16, ręcznie działa, przez agenta nie
- [Sandbox agenta odcina cache narzędzi](sandbox-agenta-odcina-cache-narzedzi.md) — potwierdzony — hasła: sandbox, PermissionError, cache, uv, pytest, tmp_path, basetemp — sygnały: odmowa dostępu do temp testów, globalnego cache albo `.venv`; poza agentem przechodzi
- [Poprawka dopasowuje test, który pilnował poprawianego zachowania](naprawa-oslabia-test-ktory-ja-pilnowal.md) — kandydat — hasła: osłabiona asercja, test akceptacyjny, pokrycie, agent zmienia test, review — sygnały: poprawka zmienia asercję albo listę w teście, test zielony, zachowanie ze scenariusza zniknęło, wykrywa dopiero weryfikacja
