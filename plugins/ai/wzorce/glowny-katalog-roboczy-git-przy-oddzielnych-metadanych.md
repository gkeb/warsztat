# Pierwszy wpis `git worktree list` nie zawsze jest głównym katalogiem roboczym

- Status: kandydat
- Hasła: git, worktree, git worktree list, --separate-git-dir, core.worktree, główny katalog roboczy, rev-parse, --show-toplevel, --git-common-dir, powiązany worktree, korzeń repozytorium

## Sygnały

- Rozpoznanie „korzenia repozytorium” zwraca katalog metadanych (`…/metadata`, `.git` w innym miejscu) zamiast katalogu z plikami.
- Repozytorium utworzone przez `git init --separate-git-dir` albo z plikiem `.git` wskazującym inny katalog jest odrzucane jako „nie główny katalog roboczy”.
- Podpowiedź „przejdź do głównego katalogu roboczego” wskazuje ścieżkę bez plików projektu.

## Warunki

Dotyczy kodu, który z dowolnej ścieżki ustala główny katalog roboczy repozytorium Git — zwłaszcza żeby odróżnić go od powiązanego worktree albo podkatalogu.

Nie dotyczy:

- Zwykłego repo z `.git` w katalogu roboczym — tam pierwszy wpis `git worktree list` jest głównym katalogiem roboczym.
- Repo bez katalogu roboczego (bare) — to osobny przypadek, rozpoznawany przez `rev-parse --is-bare-repository`.

## Mechanizm

`git worktree list` wypisuje jako pierwszy wpis katalog, który wspólny katalog Git uważa za główny. Przy metadanych oddzielonych od katalogu roboczego wspólny katalog Git nie zawsze zna ścieżkę powrotną — wtedy pierwszy wpis wskazuje sam katalog metadanych. Ścieżkę może podać `core.worktree` w konfiguracji wspólnego katalogu.

## Rozwiązanie

- Dla bieżącej ścieżki pytaj Gita o katalog roboczy (`rev-parse --show-toplevel`) i o wspólny katalog Git (`--git-common-dir`); bieżący katalog jest główny, gdy jego katalog Git to wspólny katalog.
- Ścieżkę głównego katalogu dla powiązanego worktree bierz z pierwszego wpisu tylko po sprawdzeniu, że nie jest katalogiem metadanych; inaczej z `core.worktree`.
- Gdy ścieżki nie da się ustalić, dawaj ogólną podpowiedź zamiast błędnej ścieżki.
- Test: repo z `--separate-git-dir`, jego powiązany worktree, wariant bez i z `core.worktree`.

## Warianty i pułapki

- Bez `core.worktree` powiązany worktree nie ma skąd poznać głównego katalogu — podpowiedź musi być ogólna.

## Wystąpienia

- 2026-11-19 — tenta — lekcja `[rejestr-projektow]` (ticket 03, badanie i test) — Git na Windows, Node — wariant: `--separate-git-dir` bez i z `core.worktree`
