// Uprząż skryptowanych sesji agenta: tymczasowy projekt poza repozytorium, plugin z tego repozytorium,
// atrapa `gh` na początku PATH, kolejne tury przez --resume. Każda sesja kosztuje wywołania modelu.
import { spawn, execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const katalogTestow = dirname(fileURLToPath(import.meta.url));
export const katalogRepo = dirname(katalogTestow);
export const katalogPluginu = join(katalogRepo, "plugins", "ai");
const atrapa = join(katalogTestow, "atrapa-gh.mjs");
const atrapaGitleaks = join(katalogTestow, "atrapa-gitleaks.mjs");

export const model = process.env.WARSZTAT_TEST_MODEL || "sonnet";
// Liczba kolejnych uruchomień w regule wyniku: 2 (domyślnie, przebieg przed commitem) albo 1 (w trakcie budowy).
export const przebiegi = process.env.WARSZTAT_TEST_PRZEBIEGI === "1" ? 1 : 2;

// Koszt z `total_cost_usd` każdej tury, sumowany w procesie testów (jeden plik testów).
let kosztPrzebiegu = 0;
const dolary = (koszt) => (koszt === undefined ? "koszt nieznany" : `$${koszt.toFixed(2)}`);
const limitTury = 15 * 60 * 1000;

// Uprawnienia sesji: odczyt wszędzie, edycja plików tylko w projekcie (acceptEdits), `gh` i wybrane podkomendy
// `git` w obu powłokach. Prefiksy podkomend wykluczają `git -C <inny katalog>` i `git -c alias...`.
// `cat` i `Get-Content` (odczyt szkicu do skanu) czytają dowolny plik, jak `Read`; `gitleaks` tylko `stdin` (skan) i `version`
// (sprawdzenie obecności — bez niego procedura retro nie wysyła); `gitleaks` w sesji to atrapa (`atrapa-gitleaks.mjs`).
// Skan przed commitem (wdrożenie w trybie warsztatu): dokładnie komenda `bezpieczenstwo.skanSekretow` z fikstury.
// To granica miękka (np. `gh.cmd` przepuszcza argumenty przez cmd) — fikstury i odpowiedzi atrapy muszą być zaufane.
const podkomendyGit = ["status", "log", "diff", "show", "add", "commit", "ls-files"];
const dozwoloneNarzedzia = [
  "Read",
  "Glob",
  "Grep",
  "Bash(cat:*)",
  "PowerShell(Get-Content:*)",
  // Katalog tymczasowy dla szkicu: dokładnie polecenia z procedury retro (`echo "$TEMP"` w Bash nie da się dopuścić regułą).
  "Bash(printenv TEMP)",
  "PowerShell($env:TEMP)",
  // Skrypty pluginu (np. linki zgłoszenia bez `gh`): ścieżkę skilla model podaje w różnych postaciach
  // (ukośniki, cudzysłowy, kopia pluginu), więc reguła obejmuje każde `node` — granica miękka jak `cat`.
  "Bash(node:*)",
  "PowerShell(node:*)",
  ...["Bash", "PowerShell"].flatMap((powloka) => [
    `${powloka}(gh:*)`,
    `${powloka}(gitleaks stdin:*)`,
    `${powloka}(gitleaks version:*)`,
    `${powloka}(gitleaks git --pre-commit --staged --redact --no-banner)`,
    ...podkomendyGit.map((p) => `${powloka}(git ${p}:*)`),
  ]),
];
const tokenyGitHuba = ["GH_TOKEN", "GITHUB_TOKEN", "GH_ENTERPRISE_TOKEN", "GITHUB_ENTERPRISE_TOKEN"];

const naUkosniki = (sciezka) => sciezka.replaceAll("\\", "/");

/** Opakowania atrapy dla Bash (`<nazwa>`) i PowerShell (`<nazwa>.cmd`); stdin przechodzi do atrapy (`gitleaks stdin`). */
function opakowania(katalogBin, nazwa, skrypt, katalogAtrapy) {
  const node = process.execPath;
  writeFileSync(
    join(katalogBin, nazwa),
    `#!/bin/sh\nATRAPA_POWLOKA=bash exec "${naUkosniki(node)}" "${naUkosniki(skrypt)}" "${naUkosniki(katalogAtrapy)}" "$@"\n`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(katalogBin, `${nazwa}.cmd`),
    `@echo off\r\nset ATRAPA_POWLOKA=cmd\r\n"${node}" "${skrypt}" "${katalogAtrapy}" %*\r\n`,
  );
}

// Na Windows `pwsh` w PATH bywa aliasem aplikacji (WindowsApps); narzędzie PowerShell w `claude -p`
// odrzuca wtedy każde polecenie („The command line is too long” przy parsowaniu uprawnień).
// Katalog prawdziwego pwsh.exe na początku PATH to usuwa.
function katalogPwsh() {
  if (process.platform !== "win32") return [];
  try {
    const sciezka = execFileSync("pwsh", ["-NoProfile", "-Command", "(Get-Process -Id $PID).Path"], {
      encoding: "utf8",
    }).trim();
    return [dirname(sciezka)];
  } catch {
    return [];
  }
}

// PATH sesji: atrapy na początku, bez katalogów, w których leży prawdziwy `gh` albo `gitleaks`. Usuwany jest cały katalog:
// na tym komputerze oba narzędzia mają własne (WinGet), ale wspólny katalog z innym narzędziem odebrałby sesji i je.
const prawdziwe = ["gh", "gh.exe", "gitleaks", "gitleaks.exe"];
function sciezkaSesji(katalogBin) {
  const zostaja = (process.env.PATH ?? "")
    .split(delimiter)
    .filter((k) => k && !prawdziwe.some((plik) => existsSync(join(k, plik))));
  return [katalogBin, ...katalogPwsh(), ...zostaja].join(delimiter);
}

// Katalog tymczasowy sesji (TEMP, TMP, TMPDIR) leży w korzeniu testu i jest dołączony przez --add-dir:
// pliki robocze agenta (np. szkic zgłoszenia) powstają poza projektem i znikają z testem.
function srodowiskoSesji(katalogBin, katalogTmp) {
  const env = { ...process.env, PATH: sciezkaSesji(katalogBin) };
  for (const klucz of Object.keys(env)) {
    const duze = klucz.toUpperCase();
    if (["PATH", "TEMP", "TMP", "TMPDIR"].includes(duze) && klucz !== duze) delete env[klucz];
  }
  env.TEMP = env.TMP = env.TMPDIR = katalogTmp;
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  for (const klucz of tokenyGitHuba) delete env[klucz];
  return env;
}

function git(katalog, ...argumenty) {
  execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...argumenty], {
    cwd: katalog,
    stdio: "ignore",
  });
}

function uruchomClaude(argumenty, { cwd, env }) {
  return new Promise((zrob, odrzuc) => {
    const proces = spawn("claude", argumenty, { cwd, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    proces.stdout.on("data", (d) => (stdout += d));
    proces.stderr.on("data", (d) => (stderr += d));
    const zegar = setTimeout(() => {
      if (process.platform === "win32") spawn("taskkill", ["/PID", String(proces.pid), "/T", "/F"]);
      else proces.kill("SIGKILL");
    }, limitTury);
    proces.on("error", (blad) => {
      clearTimeout(zegar);
      odrzuc(blad);
    });
    proces.on("close", (kod) => {
      clearTimeout(zegar);
      zrob({ kod, stdout, stderr });
    });
  });
}

/**
 * Tworzy tymczasowy projekt z kopią fikstury (katalog z plikami projektu, np. `.ai/`) i atrapą `gh`.
 * odpowiedziGh: lista { argumenty: [...prefiks], stdout?, stderr?, kod? } — reszta wywołań kończy się błędem.
 * pliki: { "ścieżka w projekcie": treść } — nadpisuje albo dodaje pliki fikstury przed pierwszym commitem
 * (np. wariant ustawienia albo dane, których nie wolno trzymać w repozytorium, jak syntetyczny token).
 * repozytoriumPluginu: adres oficjalnego repozytorium warsztatu — sesja dostaje kopię pluginu z tym adresem
 * w polu `repository` obu manifestów (`""` → kopia z pustym polem, niezależnie od repozytorium);
 * bez niego sesja używa pluginu z repozytorium.
 * bezGh: sesja bez `gh` w PATH (ani atrapy, ani prawdziwego).
 * gitleaks: ustawienia atrapy skanera, np. { trafienie: "zawsze" } (`atrapa-gitleaks.mjs`).
 * bezGitleaks: sesja bez `gitleaks` w PATH (ani atrapy, ani prawdziwego).
 */
export function przygotujProjekt({
  fikstura,
  odpowiedziGh = [],
  pliki = {},
  repozytoriumPluginu,
  bezGh = false,
  gitleaks,
  bezGitleaks = false,
}) {
  const korzen = realpathSync.native(mkdtempSync(join(tmpdir(), "warsztat-sesja-")));
  const katalog = join(korzen, "projekt");
  const plugin = repozytoriumPluginu === undefined ? katalogPluginu : join(korzen, "plugin", "ai");
  const katalogAtrapy = join(korzen, "atrapa");
  const katalogBin = join(korzen, "bin");
  const katalogTmp = join(korzen, "tmp");
  // Na Windows proces potomny sesji bywa chwilę po wyjściu `claude` jeszcze w katalogu projektu (EBUSY).
  // Sprzątanie czeka dłużej, a gdy i tak się nie uda, ostrzega zamiast zasłaniać wynik testu w `finally`.
  const usun = () => {
    try {
      rmSync(korzen, { recursive: true, force: true, maxRetries: 20, retryDelay: 1000 });
    } catch (blad) {
      process.emitWarning(`nie usunięto katalogu sesji ${korzen}: ${blad.code ?? blad.message}`);
    }
  };
  try {
    mkdirSync(katalogAtrapy, { recursive: true });
    mkdirSync(katalogTmp, { recursive: true });
    cpSync(fikstura, katalog, { recursive: true });
    for (const [sciezka, tresc] of Object.entries(pliki)) {
      mkdirSync(dirname(join(katalog, sciezka)), { recursive: true });
      writeFileSync(join(katalog, sciezka), tresc);
    }
    if (plugin !== katalogPluginu) {
      cpSync(katalogPluginu, plugin, { recursive: true });
      for (const manifest of ["plugin.json", join(".claude-plugin", "plugin.json")]) {
        const sciezka = join(plugin, manifest);
        const tresc = JSON.parse(readFileSync(sciezka, "utf8"));
        writeFileSync(sciezka, JSON.stringify({ ...tresc, repository: repozytoriumPluginu }, null, 2) + "\n");
      }
    }
    writeFileSync(join(katalogAtrapy, "odpowiedzi.json"), JSON.stringify(odpowiedziGh, null, 2));
    if (gitleaks) writeFileSync(join(katalogAtrapy, "gitleaks.json"), JSON.stringify(gitleaks));
    mkdirSync(katalogBin, { recursive: true });
    if (!bezGh) opakowania(katalogBin, "gh", atrapa, katalogAtrapy);
    if (!bezGitleaks) opakowania(katalogBin, "gitleaks", atrapaGitleaks, katalogAtrapy);
    git(katalog, "init", "-q", "-b", "main");
    git(katalog, "add", "-A");
    git(katalog, "commit", "-q", "-m", "projekt testowy");
  } catch (blad) {
    usun();
    throw blad;
  }

  const env = srodowiskoSesji(katalogBin, katalogTmp);
  let idSesji = null;
  const tury = [];

  return {
    katalog,
    tury,

    /** Kolejna tura sesji; pierwsza zaczyna sesję, następne wznawiają ją przez --resume. */
    async tura(tekst) {
      const argumenty = [
        "-p",
        tekst,
        // stream-json: ostatnia linia `result` ma pola wyniku jak `json`, a wcześniejsze wiadomości `assistant` —
        // wywołania narzędzi, z których test bierze polecenia powłoki (np. czy klasyfikował skrypt, a nie model).
        "--output-format",
        "stream-json",
        "--verbose",
        "--model",
        model,
        "--plugin-dir",
        plugin,
        "--setting-sources",
        "project,local",
        "--permission-mode",
        "acceptEdits",
        "--add-dir",
        katalogTmp,
        "--allowedTools",
        ...dozwoloneNarzedzia,
      ];
      if (idSesji) argumenty.push("--resume", idSesji);
      const { kod, stdout, stderr } = await uruchomClaude(argumenty, { cwd: katalog, env });
      const wiadomosci = stdout
        .split("\n")
        .filter((linia) => linia.trim())
        .flatMap((linia) => {
          try {
            return [JSON.parse(linia)];
          } catch {
            return [];
          }
        });
      const wynik = wiadomosci.findLast((w) => w.type === "result");
      if (!wynik) {
        throw new Error(`claude -p bez wyniku JSON (kod ${kod}).\nstdout: ${stdout.slice(-2000)}\nstderr: ${stderr.slice(0, 2000)}`);
      }
      if (wynik.is_error) throw new Error(`claude -p zakończył się błędem: ${wynik.result ?? stdout.slice(-2000)}`);
      idSesji = wynik.session_id;
      const polecenia = wiadomosci
        .filter((w) => w.type === "assistant")
        .flatMap((w) => w.message?.content ?? [])
        .filter((c) => c.type === "tool_use" && ["Bash", "PowerShell"].includes(c.name))
        .map((c) => String(c.input?.command ?? ""));
      const tura = {
        tekst: wynik.result ?? "",
        odmowy: wynik.permission_denials ?? [],
        koszt: wynik.total_cost_usd,
        polecenia,
      };
      tury.push(tura);
      kosztPrzebiegu += tura.koszt ?? 0;
      process.stderr.write(
        `[sesja] tura ${tury.length}: ${dolary(tura.koszt)} (sesja ${dolary(tury.reduce((s, t) => s + (t.koszt ?? 0), 0))}, przebieg ${dolary(kosztPrzebiegu)})\n`,
      );
      return tura;
    },

    /** Polecenia narzędzi Bash i PowerShell ze wszystkich tur, w kolejności. */
    polecenia() {
      return tury.flatMap((t) => t.polecenia);
    },

    /** Wywołania atrapy `gh` w kolejności. */
    wywolaniaGh() {
      const plik = join(katalogAtrapy, "wywolania.jsonl");
      if (!existsSync(plik)) return [];
      return readFileSync(plik, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((linia) => JSON.parse(linia));
    },

    /** Wywołania atrapy `gitleaks` w kolejności: argumenty, treść ze stdin (skan), kod wyjścia, czas. */
    wywolaniaGitleaks() {
      const plik = join(katalogAtrapy, "gitleaks.jsonl");
      if (!existsSync(plik)) return [];
      return readFileSync(plik, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((linia) => JSON.parse(linia));
    },

    czytaj(sciezka) {
      return readFileSync(join(katalog, sciezka), "utf8");
    },

    usun,
  };
}

// Wywołania `gh`, które tylko czytają. Każde inne traktujemy jako zmianę stanu.
const tylkoOdczyt = [
  ["--version"],
  ["version"],
  ["auth", "status"],
  ["issue", "list"],
  ["issue", "view"],
  ["search"],
  ["release", "view"],
  ["release", "list"],
  ["repo", "view"],
  ["label", "list"],
];

// `gh api` jest odczytem tylko bez metody albo z jawnym GET i bez pól; każda inna postać (także
// `--method=POST`, `-XPOST`) to zmiana stanu.
function apiTylkoCzyta(argumenty) {
  for (let i = 1; i < argumenty.length; i++) {
    const a = argumenty[i];
    if (a === "-X" || a === "--method") {
      if ((argumenty[i + 1] ?? "").toUpperCase() !== "GET") return false;
      i++;
    } else if (/^(-X|--method)/.test(a)) {
      if (a.replace(/^(-X=?|--method=)/, "").toUpperCase() !== "GET") return false;
    } else if (/^(-f|-F|--field|--raw-field|--input)(=|$)/.test(a) || /^-[fF].+/.test(a)) {
      return false;
    }
  }
  return true;
}

// `gh api graphql` jest odczytem, gdy każde pole to `query` z dokumentem zaczynającym się od `query` albo `{`,
// albo zwykła zmienna (np. `login=…`); słowo `mutation` albo `subscription` w dokumencie, `operationName`, `--input`
// i inna metoda niż POST to zmiana stanu.
function graphqlTylkoCzyta(argumenty) {
  let zapytanie = false;
  for (let i = 2; i < argumenty.length; i++) {
    const a = argumenty[i];
    let pole;
    const zalaczone = /^(?:-[fF]|--field=|--raw-field=)(.+)$/.exec(a);
    if (/^(-f|-F|--field|--raw-field)$/.test(a)) pole = argumenty[++i] ?? "";
    else if (zalaczone) pole = zalaczone[1];
    else if (a === "-X" || a === "--method") {
      if ((argumenty[++i] ?? "").toUpperCase() !== "POST") return false;
      continue;
    } else if (/^(-X|--method)/.test(a)) {
      if (a.replace(/^(-X=?|--method=)/, "").toUpperCase() !== "POST") return false;
      continue;
    } else if (/^--input(=|$)/.test(a)) return false;
    else continue;
    const [klucz, ...reszta] = pole.split("=");
    // Dokument z kilkoma operacjami (`query A {…} mutation B {…}` z `operationName=B`) wykonałby mutację.
    if (klucz === "operationName") return false;
    if (klucz === "query") {
      const dokument = reszta.join("=");
      if (!/^\s*(query\b|\{)/.test(dokument) || /\b(mutation|subscription)\b/.test(dokument)) return false;
      zapytanie = true;
    }
  }
  return zapytanie;
}

export function zmieniaStan(argumenty) {
  if (argumenty[0] === "api" && argumenty[1] === "graphql") return !graphqlTylkoCzyta(argumenty);
  if (argumenty[0] === "api") return !apiTylkoCzyta(argumenty);
  return !tylkoOdczyt.some((prefiks) => prefiks.every((a, i) => argumenty[i] === a));
}

/**
 * Reguła wyniku sesji: przebieg przechodzi, gdy przejdzie w 2 kolejnych uruchomieniach,
 * każde w świeżym projekcie; porażka któregokolwiek to porażka testu.
 * `WARSZTAT_TEST_PRZEBIEGI=1` skraca ją do jednego uruchomienia w trakcie budowy — nie zastępuje przebiegu przed commitem.
 */
export async function dwaKolejnePrzejscia(przebieg) {
  for (let nr = 1; nr <= przebiegi; nr++) {
    try {
      await przebieg(nr);
    } catch (blad) {
      blad.message = `uruchomienie ${nr} z ${przebiegi}: ${blad.message}`;
      throw blad;
    }
  }
}
