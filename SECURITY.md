# Security policy

## Supported versions

Only the latest release of the workshop plugin receives security fixes. Update to it before reporting.

## Reporting a vulnerability

Report security problems of the workshop itself privately, never in a public issue — a public issue reveals the problem before it is fixed. Examples: a skill or hook that leaks a secret, bypasses a check (secret scan, protected files, review) or grants a too broad permission.

Use private vulnerability reporting: open the **Security** tab of this repository, choose **Report a vulnerability** and submit the form. Only the maintainer sees the report.

## What not to put in public issues

This repository is public. Issues, comments and their edit history can be read by anyone, and new content is sent by e-mail and webhooks to watchers. Do not include:

- secrets, tokens, passwords or keys;
- code, file paths, names or terms from your project, its product or client;
- personal data: names, e-mail addresses, logins;
- details of a security problem — report it privately as above.

## If a report contained a secret or project data

Deleting an issue does not recall e-mail notifications or webhooks that were already sent. When you ask the maintainer to delete the issue, give only its link — do not repeat the secret or the data in your request.

- **Secret:** treat it as exposed and revoke or rotate it first. Then edit the issue or comment, delete the previous revision from its edit history (**edited** → revision → **Options** → **Delete revision from history**) and ask the maintainer through private vulnerability reporting to delete the issue. For access credentials you can also contact GitHub Support (private information removal).
- **Project data:** edit the issue or comment, delete the previous revision from its edit history and ask the maintainer through private vulnerability reporting to delete the issue.
