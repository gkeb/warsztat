# Sandbox agenta blokuje narzędziom dostęp do cache i katalogów tymczasowych poza repozytorium

- Status: potwierdzony
- Hasła: sandbox, uprawnienia, PermissionError, access denied, cache menedżera pakietów, uv, pip, npm, pytest, tmp_path, basetemp, TEMP

## Sygnały

- `PermissionError` albo „access denied” przy tworzeniu lub sprzątaniu katalogu tymczasowego testów (`tmp_path`);
- menedżer pakietów odmawia odczytu albo zapisu globalnego cache, choć działa offline i „nie powinien” go dotykać;
- odmowa dostępu do interpretera albo pliku w środowisku wirtualnym;
- ten sam test albo polecenie przechodzi poza agentem.

## Warunki

Agent działa w sandboxie, który dopuszcza zapis tylko w workspace i kilku wskazanych katalogach, a narzędzia domyślnie piszą do katalogów użytkownika (cache, systemowy temp).

Nie dotyczy:

- prawdziwego braku uprawnień albo pliku zablokowanego przez inny proces — na Windows `failed to rename` przy zapisie cache zwykle mija po ponowieniu;
- błędu, który powtarza się poza sandboxem.

## Mechanizm

Narzędzia wyliczają domyślne katalogi z profilu użytkownika, a sandbox ich nie obejmuje. Opcje wiersza poleceń (np. `--cache-dir`) dotyczą tylko jednego procesu — podprocesy uruchamiane przez testy wracają do ścieżek domyślnych. Zmienne środowiskowe są dziedziczone.

## Rozwiązanie

- Każdy cache i katalog tymczasowy przypinasz jawnie do dozwolonego katalogu — przez zmienne środowiskowe (dziedziczone przez podprocesy), nie tylko opcje CLI.
- Katalog nadrzędny tworzysz wcześniej (np. pytest `--basetemp` go nie tworzy).
- Gdy sandbox nadal odmawia, eskalujesz tylko to jedno polecenie, nie całą sesję.
- Projekt zapisuje gotowy przepis (jedno polecenie) w swoim `AGENTS.md`, w sekcji o walidacji.

## Warianty i pułapki

- Test sam uruchamia narzędzie w podprocesie (np. build i instalację pakietu) — opcja przekazana do procesu nadrzędnego nie wystarcza; test odczytuje aktywną ścieżkę i przekazuje ją jawnie albo polega na zmiennej.
- Zmienna ustawiona w powłoce na czas eksperymentu przecieka do kolejnych poleceń (zob. [powłoka pośrednicząca](powloka-posredniczaca-zmienia-argumenty.md)).

## Wystąpienia

- 2026-10-08–09 — harness — lekcje [warsztat] (10 wystąpień) — Codex na Windows, uv 0.7, pytest 9 — wariant: cache uv, basetemp, `.venv`, podprocesy uv w teście instalacji
- 2026-10-12 — node4j (biblioteka Python) — lekcja [projekt] (5 wystąpień) — Codex i Claude Code na Windows, uv 0.12, pytest 9 — wariant: cache uv przy `uv run`/`uv tree`, `tmp_path` bez `--basetemp`, test poza workspace skanujący katalogi nadrzędne (`--rootdir`, `--confcutdir`); przepis trafił do `AGENTS.md` projektu
- 2026-10-14 — node4j (biblioteka Python) — lekcja [readme-aktualne] — Codex na Windows, pytest 9 — wariant: `--basetemp` w systemowym katalogu tymczasowym (`C:\Windows\Temp`) odrzucony `PermissionError`; rozwiązanie: dedykowany katalog w dozwolonym katalogu tymczasowym agenta
