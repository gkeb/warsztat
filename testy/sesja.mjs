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

export const model = process.env.WARSZTAT_TEST_MODEL || "sonnet";
const limitTury = 15 * 60 * 1000;

// Uprawnienia sesji: odczyt wszędzie, edycja plików tylko w projekcie (acceptEdits), `gh` i wybrane podkomendy
// `git` w obu powłokach. Prefiksy podkomend wykluczają `git -C <inny katalog>` i `git -c alias...`.
// `cat` i `Get-Content` (odczyt szkicu do skanu) czytają dowolny plik, jak `Read`; `gitleaks` tylko `stdin` (skan) i `version`
// (sprawdzenie obecności — bez niego procedura retro nie wysyła).
// To granica miękka (np. `gh.cmd` przepuszcza argumenty przez cmd) — fikstury i odpowiedzi atrapy muszą być zaufane.
const podkomendyGit = ["status", "log", "diff", "show", "add", "commit", "ls-files"];
const dozwoloneNarzedzia = [
  "Read",
  "Glob",
  "Grep",
  "Bash(cat:*)",
  "PowerShell(Get-Content:*)",
  ...["Bash", "PowerShell"].flatMap((powloka) => [
    `${powloka}(gh:*)`,
    `${powloka}(gitleaks stdin:*)`,
    `${powloka}(gitleaks version:*)`,
    ...podkomendyGit.map((p) => `${powloka}(git ${p}:*)`),
  ]),
];
const tokenyGitHuba = ["GH_TOKEN", "GITHUB_TOKEN", "GH_ENTERPRISE_TOKEN", "GITHUB_ENTERPRISE_TOKEN"];

const naUkosniki = (sciezka) => sciezka.replaceAll("\\", "/");

function opakowaniaGh(katalogBin, katalogAtrapy) {
  mkdirSync(katalogBin, { recursive: true });
  const node = process.execPath;
  writeFileSync(
    join(katalogBin, "gh"),
    `#!/bin/sh\nATRAPA_POWLOKA=bash exec "${naUkosniki(node)}" "${naUkosniki(atrapa)}" "${naUkosniki(katalogAtrapy)}" "$@"\n`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(katalogBin, "gh.cmd"),
    `@echo off\r\nset ATRAPA_POWLOKA=cmd\r\n"${node}" "${atrapa}" "${katalogAtrapy}" %*\r\n`,
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

// PATH sesji: atrapa na początku, bez katalogów, w których leży prawdziwy `gh`.
function sciezkaSesji(katalogBin) {
  const zostaja = (process.env.PATH ?? "")
    .split(delimiter)
    .filter((k) => k && !existsSync(join(k, "gh.exe")) && !existsSync(join(k, "gh")));
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
 */
export function przygotujProjekt({ fikstura, odpowiedziGh = [], pliki = {} }) {
  const korzen = realpathSync.native(mkdtempSync(join(tmpdir(), "warsztat-sesja-")));
  const katalog = join(korzen, "projekt");
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
    writeFileSync(join(katalogAtrapy, "odpowiedzi.json"), JSON.stringify(odpowiedziGh, null, 2));
    opakowaniaGh(katalogBin, katalogAtrapy);
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
        "--output-format",
        "json",
        "--model",
        model,
        "--plugin-dir",
        katalogPluginu,
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
      let wynik;
      try {
        wynik = JSON.parse(stdout);
      } catch {
        throw new Error(`claude -p bez wyniku JSON (kod ${kod}).\nstdout: ${stdout.slice(0, 2000)}\nstderr: ${stderr.slice(0, 2000)}`);
      }
      if (wynik.is_error) throw new Error(`claude -p zakończył się błędem: ${wynik.result ?? stdout.slice(0, 2000)}`);
      idSesji = wynik.session_id;
      const tura = { tekst: wynik.result ?? "", odmowy: wynik.permission_denials ?? [], koszt: wynik.total_cost_usd };
      tury.push(tura);
      return tura;
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

export function zmieniaStan(argumenty) {
  if (argumenty[0] === "api") return !apiTylkoCzyta(argumenty);
  return !tylkoOdczyt.some((prefiks) => prefiks.every((a, i) => argumenty[i] === a));
}

/**
 * Reguła wyniku sesji: przebieg przechodzi, gdy przejdzie w 2 kolejnych uruchomieniach,
 * każde w świeżym projekcie; porażka któregokolwiek to porażka testu.
 */
export async function dwaKolejnePrzejscia(przebieg) {
  for (let nr = 1; nr <= 2; nr++) {
    try {
      await przebieg(nr);
    } catch (blad) {
      blad.message = `uruchomienie ${nr} z 2: ${blad.message}`;
      throw blad;
    }
  }
}
