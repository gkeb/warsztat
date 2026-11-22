# Badanie: Co można zrobić, gdy w Issue lub komentarzu w publicznym repo GitHub znajdzie się sekret albo dane prywatne

- Data: 2026-11-22
- Dla: ogólne (skill `retro`, Issue w publicznym repo warsztatu)
- Kontekst: GitHub.com (docs.github.com, wersja „latest”); nie GHES. Cytaty pochodzą z odpowiedzi narzędzia pobierającego strony (streszczenie modelu, nie surowy HTML), więc brzmienie warto zweryfikować przy wdrożeniu procedury.
- Pewność: średnia (pkt 1, 2, 5 wysoka; pkt 3 i 4 częściowo nieustalone)

## Odpowiedź

Issue może trwale usunąć tylko admin repo (w repo osobistym wyłącznie jego właściciel; w organizacji dodatkowo musi to włączyć właściciel organizacji). Komentarz może usunąć każdy z write; wersję z historii edycji może usunąć autor komentarza lub ktoś z write, ale historia jest widoczna dla każdego z read, więc w repo publicznym dla wszystkich. Dokumentacja nie mówi, że usunięcie cofa wyciek (e-maile, webhooki); jedyną udokumentowaną skuteczną reakcją na sekret jest jego unieważnienie/rotacja. Secret scanning obejmuje opisy i komentarze Issues, ale push protection według dokumentacji dotyczy pushy, nie Issues. Private vulnerability reporting istnieje dla repo publicznych i włącza je właściciel/admin w ustawieniach.

## Ustalenia

### Ustalone (źródło mówi)

1. Usuwanie Issue: „People with admin permissions in a repository can permanently delete an issue from a repository.” W repo osobistym: „The only account that can delete issues in a repository owned by a personal account is that account.” W organizacji właściciel musi najpierw włączyć usuwanie Issues dla repozytoriów. [1]
2. Skutki usunięcia Issue: usunięcie jest trwałe; współpracownicy nie są powiadamiani; odwiedzający URL widzą „page not found”; admini/właściciele widzą nazwę użytkownika usuwającego i czas. [1]
3. Usuwanie komentarzy: „Anyone with write access to a repository can delete comments on issues, discussions, pull requests, and commits.” [2] Autor komentarza (bez write) nie jest tam wymieniony dla komentarzy w repo; autor wymieniony jest tylko dla strony zespołu. [2]
4. Historia edycji jest widoczna: „Anyone with read access to a repository can view a comment's edit history.” (przycisk „edited” nad komentarzem). [3] W repo publicznym read ma każdy (wniosek, wynika z definicji repo publicznego).
5. Usunięcie wersji z historii: „Comment authors and anyone with write access to a repository can delete sensitive information” z historii; ścieżka: Options → „Delete revision from history”. Autor i znacznik czasu edycji pozostają widoczne, treść znika. [3] Alternatywa z [2]: edytować komentarz i wpisać `[REDACTED]` w miejsce sekretu, a potem usunąć wersję z historii (wniosek: samo `[REDACTED]` nie czyści historii, bo stara wersja zostaje w historii edycji, dopóki jej się nie usunie [3]).
6. Webhooki: akcje `issue_comment`: `created`, `deleted`, `edited`, `pinned`, `unpinned`; `issues`: m.in. `edited`, `deleted`, `opened`. Payload `deleted` dla `issue_comment` zawiera obiekt `comment` („The comment itself.”). [4] Zdarzenie `created`/`edited` przenosi więc treść do odbiorców webhooków zanim ktokolwiek ją usunie (wniosek z istnienia zdarzeń i obiektu `comment`).
7. E-maile: „GitHub will send notifications to you as multipart emails that contain both HTML and plain text copies of the content.” Treść odzwierciedla oryginalny post; subskrybują obserwujący repo (w trybie „Issues” - „updates on every issue”) i uczestnicy. [5] Wniosek: kopia wysłana e-mailem poza GitHub nie jest cofana usunięciem Issue.
8. Co robić z sekretem: dokumentacja o usuwaniu danych z repo mówi, że pierwszym krokiem jest „revoke and/or rotate that secret”; po tym sekret „can no longer be used for access”. [6]
9. GitHub Support: „We offer this private information removal process as an exceptional service only for high-risk content.” Zgłoszenie przez formularz (support.github.com/contact/private-information), treść jako zwykły tekst. Wśród kwalifikujących się: „Access credentials, such as user names combined with passwords, access tokens, or other sensitive secrets.” [7] Dla danych w repo: Support może usunąć cached views i odwołania w pull requestach, ale „Dereferencing does not remove sensitive data quoted in retained bodies or comments.” [6] (dotyczy PR, nie Issues; patrz niepewności).
10. Secret scanning obejmuje Issues: GitHub „automatically scans” „Descriptions and comments in issues” oraz „Titles, descriptions, and comments, in open and closed historical issues”; „Public repositories: Secret scanning runs automatically for free.” [8] Alerty trafiają do zakładki Security and quality repozytorium; sekrety partnerów „are reported directly to the provider and aren't displayed in your repository alerts” - dostawca może je unieważnić. [8]
11. Push protection - powierzchnie: CLI, commity w UI, upload plików, REST API (nie AI-detected), GitHub MCP server (tylko publiczne repo); opisana jako blokująca „pushes that contain secrets”. Issues i komentarze nie są wymienione. [9]
12. Private vulnerability reporting (PVR): po włączeniu „anyone can submit a private vulnerability report to the repository maintainers.” Zgłaszający: zakładka Security and quality → „Report a vulnerability” → formularz → „Submit report”; maintainerzy dostają powiadomienie. Gdy niewłączone: zgłaszający ma kierować się security policy lub otworzyć Issue z prośbą o kontakt. [10] Limity: 25 zgłoszeń/24 h na zgłaszającego, 10/24 h na repo domyślnie. [10]
13. Włączenie PVR: Settings → Advanced Security (sekcja „Security and quality”) → przy „Private vulnerability reporting” Enable. Mogą to zrobić „Owners and administrators of public repositories”. [11]
14. SECURITY.md: tworzy się przez zakładkę Security and quality → Security policy → Start setup; treść: „add information about supported versions of your project and how to report a vulnerability.” [12] Strona opisująca PVR [11] nie wspomina o SECURITY.md; strona [12] nie podaje dozwolonych lokalizacji pliku.

### Nieustalone

- Czy usunięty Issue/komentarz znika z cache/API/zdarzeń publicznych i po jakim czasie - dokumentacja tego nie mówi (strona o zdarzeniach [13] nie podaje opóźnień ani retencji).
- Czy payload webhooka `issues` `deleted` lub `issue_comment` `deleted` zawiera treść - dla `deleted` komentarza obiekt `comment` jest wymagany, ale strona nie wymienia pola `body` wprost [4]; przeczytano tylko pierwsze 100 000 z 195 159 znaków strony.
- Czy Support przyjmie zgłoszenie dotyczące treści w Issue (poza przypadkami z PR/commitami) - [7] mówi o treściach wysokiego ryzyka ogólnie, [6] o cached views w kontekście repo i PR; brak jawnej wzmianki o Issues.
- Czy secret scanning generuje alert dla sekretu w Issue (a nie tylko skanuje) i czy obejmuje edycje oraz usunięte treści - strona [8] tego nie rozstrzyga.
- Czy push protection blokuje sekret wpisany w Issue przez `gh issue create`/API - brak w dokumentacji; z [9] wynika, że nie (wniosek), wymaga testu.
- Dozwolone lokalizacje SECURITY.md (root, `docs/`, `.github/`) - nie potwierdzono w pobranych stronach (wiedza ogólna sugeruje te trzy, ale bez źródła tu nie zakładam).
- Czy `gh issue delete` istnieje i jakie uprawnienia wymaga - nie badano.

## Niepewności

Patrz „Nieustalone”. Dodatkowo: strony pobierano przez narzędzie streszczające, więc cytaty mogą być lekko sparafrazowane; przy wdrożeniu procedury sprawdzić dosłowne brzmienie na stronach źródłowych. Dokumentacja jest „latest” z dnia badania; funkcje PVR i push protection zmieniają się często (nazwa zakładki „Security and quality”).

## Źródła

[1] Deleting an issue — https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/deleting-an-issue — dokumentacja — latest
[2] Managing disruptive comments — https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments — dokumentacja — latest
[3] Tracking changes in a comment — https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment — dokumentacja — latest
[4] Webhook events and payloads — https://docs.github.com/en/webhooks/webhook-events-and-payloads — dokumentacja — latest (przeczytano ~połowę strony)
[5] Configuring notifications — https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications — dokumentacja — latest
[6] Removing sensitive data from a repository — https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository — dokumentacja — latest
[7] GitHub Private Information Removal Policy — https://docs.github.com/en/site-policy/content-removal-policies/github-private-information-removal-policy — polityka — latest
[8] About secret scanning — https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning — dokumentacja — latest
[9] About push protection — https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection — dokumentacja — latest
[10] Privately reporting a security vulnerability — https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability — dokumentacja — latest
[11] Configuring private vulnerability reporting for a repository — https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository — dokumentacja — latest
[12] Adding a security policy to your repository — https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository — dokumentacja — latest
[13] GitHub event types — https://docs.github.com/en/rest/using-the-rest-api/github-event-types — dokumentacja — latest
