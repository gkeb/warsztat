---
nr: "06"
tytul: Repozytorium warsztatu — kanał bezpieczeństwa, formularz, ochrona rdzenia
status: zrobione
blokowany-przez: ["02"]
scenariusze: ["S13", "S14"]
budowal: "Claude Code / claude-opus-5-5"
github: 8
---

# 06 — Repozytorium warsztatu — kanał bezpieczeństwa, formularz, ochrona rdzenia

## Co widać po zrobieniu

Repozytorium warsztatu (`github.repo` z `.ai/warsztat.json` tego repozytorium, dziś publiczne) ma:
- politykę bezpieczeństwa po angielsku, z włączonym prywatnym zgłaszaniem podatności;
- etykiety `process-report`, `status: new`, `status: accepted`, `status: discussion`;
- formularz zgłoszenia `process-report.yml` z polami szkicu;
- plik właścicieli kodu i regułę gałęzi głównej, które spełniają obietnicę automatu z zasady Z01.

Retro, gdy użytkownik powie, że wysłane zgłoszenie zawierało sekret albo dane projektu, pokazuje procedurę po wycieku.

## Kryteria akceptacji

- [x] S13: test akceptacyjny przechodzi dla obu wariantów (sekret, dane projektu). Odpowiedź zawiera wszystkie kroki ze specu i zdanie o powiadomieniach e-mail i webhookach, a w zapisie atrapy nie ma wywołań `gh`, które zmieniają stan.
- [x] S14: sprawdzone ręcznie, przez obejrzenie formularza w przeglądarce na GitHubie, z wynikiem w Notatkach:
  - pola są w kolejności szkicu (S2);
  - formularz nadaje etykiety `process-report` i `status: new`;
  - ma ostrzeżenie o publicznym repozytorium;
  - problemy bezpieczeństwa odsyła do kanału bezpieczeństwa.
- [x] Polityka bezpieczeństwa mówi: jak zgłosić podatność prywatnie, czego nie wpisywać do publicznych Issues i które wersje są wspierane (dziś najnowsza). Prywatne zgłaszanie podatności jest włączone; odczyt przez `gh api` w Notatkach.
- [x] Ochrona rdzenia:
  - plik właścicieli kodu wskazuje opiekuna dla całego repozytorium;
  - reguła gałęzi głównej wymaga akceptacji właściciela kodu, a rola administratora jest na liście obejść, więc opiekun scala własne zmiany sam;
  - odczyt ustawień przez `gh api` w Notatkach;
  - pole `Egzekwowanie` zasady Z01 w `.ai/ZASADY.md` podaje ten automat.
- [x] Każda zmiana ustawień publicznego repozytorium (etykiety, prywatne zgłaszanie, reguła gałęzi) dzieje się po zgodzie użytkownika w sesji budowy, po pokazaniu komend.
- [x] Procedura po wycieku:
  - cytaty z dokumentacji GitHuba sprawdzone dosłownie na stronach źródłowych z badania o wycieku w Issue, a rozbieżności poprawione w badaniu;
  - procedura stoi w kontrakcie, w sekcji o zgłoszeniach warsztatu (jedno miejsce), a retro do niej odsyła.
- [x] Link formularza z ticketu 05 dostaje parametr `template=process-report.yml`, jeśli ticket 05 jest już zrobiony.
- [x] `claude plugin validate plugins/ai` przechodzi.

## Poza zakresem

- Migracja istniejących wpisów — ticket 07.

## Notatki

- Formularz, polityka i plik właścicieli kodu leżą w repozytorium warsztatu poza `plugins/ai`, więc nie zmieniają wersji pluginu.
- Reguła gałęzi głównej nie może blokować obecnego sposobu pracy z `.ai/warsztat.json` → `git` (gałęzie zdolności, scalanie). Sprawdź to jednym scaleniem próbnym albo odczytem obejść przed włączeniem.
- 2026-11-25 — link formularza: formularz YAML wypełnia się z linku po `id` pól, a nie parametrem `body` (dokumentacja GitHuba, „Syntax for GitHub's form schema”: „the `id` is the canonical identifier for the field in URL query parameter prefills”). Decyzja użytkownika: skrypt linków dzieli szkic po `### <pole>` na pola formularza i dodaje `template=process-report.yml`. Parametr `labels` wypada, bo etykiety nadaje formularz, a parametr wymaga uprawnienia do etykiet. Treść spoza pól → link z samym tytułem. Z tą zgodą asercje sesyjnego S10 (`linkiBezGh`) sprawdzają `template` i wszystkie pola zamiast `body` i `labels`.
- 2026-11-25 — zmiany ustawień `gkeb/warsztat` po zgodzie użytkownika w sesji, po pokazaniu komend. Odczyt:
  - `gh label list`: `process-report`, `status: new`, `status: accepted`, `status: discussion`;
  - `gh api repos/gkeb/warsztat/private-vulnerability-reporting` → `{"enabled":true}` (przed zmianą `false`);
  - `gh api repos/gkeb/warsztat/rulesets/24642413` → `enforcement: active`, reguły `deletion`, `non_fast_forward`, `pull_request` (`require_code_owner_review: true`, `required_approving_review_count: 1`), `bypass_actors: [{actor_id: 5, actor_type: RepositoryRole, bypass_mode: always}]` (rola admin), `current_user_can_bypass: always`. Wcześniej ruleset miał tylko `deletion` i `non_fast_forward`, bez obejść. Własne pushe i scalenia opiekuna przechodzą przez obejście, więc praca z gałęziami zdolności się nie zmienia.
- 2026-11-25 — `SECURITY.md`, `.github/CODEOWNERS` i formularz trafiają na `main` osobnym PR #11 (decyzja użytkownika), bo GitHub pokazuje formularze tylko z gałęzi domyślnej; na gałęzi zdolności są te same pliki.
- 2026-11-25 — cytaty z badania o wycieku sprawdzone dosłownie na stronach źródłowych; dwa cytaty ze strony o usuwaniu informacji prywatnych uzupełnione do pełnych zdań ([badanie](../../../badania/2026-11-22-wyciek-w-issue-github.md)).
- S14 — 2026-11-25, sprawdzone ręcznie w przeglądarce przez użytkownika, plus odczyt strony przez agenta (Claude in Chrome), po scaleniu PR #11. Otwarty był link `issues/new?template=process-report.yml` z tytułem i wszystkimi polami z `scripts/linki-zgloszenia.mjs`, bez wysyłania. Wynik:
  - 7 pól w kolejności szkicu (S2);
  - tytuł i pola wypełnione z linku po `id` — na zrzucie użytkownika widać tytuł, pola jednoliniowe i pole wieloliniowe `Symptom`;
  - etykiety `process-report` i `status: new`;
  - na górze ostrzeżenie o publicznym repozytorium i odesłanie problemów bezpieczeństwa do `SECURITY.md` (Security → Report a vulnerability);
  - GitHub dodaje też link „security policy” → `/security/policy`.
- 2026-11-25 — po przeglądzie, za zgodą użytkownika:
  - test S13 sprawdza dosłowną linię o powiadomieniach e-mail i webhookach;
  - procedura po wycieku i `SECURITY.md` mówią, żeby w prośbie do opiekuna podać tylko link do Issue;
  - ruleset ma `dismiss_stale_reviews_on_push: true` (odczyt `gh api`);
  - test jednostkowy linków obejmuje powtórzone pole.
  
  Zmiana `SECURITY.md` po PR #11 trafi na `main` z PR zdolności.
