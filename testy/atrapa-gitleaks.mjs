// Atrapa `gitleaks` dla sesji testowych agenta (S5): prawdziwy skaner na maszynie testowej nie jest wymagany.
// Wywołanie: node atrapa-gitleaks.mjs <katalog-atrapy> <argumenty gitleaks...>
// Przyjmuje tylko polecenia z procedury zgłoszenia w `retro` — `version` (sprawdzenie obecności) i `stdin` z `--redact`
// (skan szkicu) — oraz skan commita z fikstur (`bezpieczenstwo.skanSekretow`); inne kończy kodem 2.
// <katalog-atrapy>/gitleaks.json (opcjonalnie) — { trafienie: "token" (domyślnie) | "zawsze" }: kod 1 dla treści
// z syntetycznym tokenem GitHuba albo dla każdej niepustej treści (skaner widzi to, czego filtr prywatności nie zauważył).
// <katalog-atrapy>/gitleaks.jsonl — każde wywołanie: argumenty, treść ze stdin, kod wyjścia, czas.
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [katalog, ...argumenty] = process.argv.slice(2);

function wczytajUstawienia() {
  try {
    return JSON.parse(readFileSync(join(katalog, "gitleaks.json"), "utf8"));
  } catch (blad) {
    if (blad.code === "ENOENT") return {};
    throw blad;
  }
}

const flagiStdin = new Set(["--redact", "--no-banner"]);
// Skan commita z `bezpieczenstwo.skanSekretow` fikstury `retro-warsztat` (test zgodności w `uprzaz.test.mjs`); atrapa
// niczego nie skanuje i zawsze zwraca 0 — sesja S19 dowodzi postaci komendy, nie wykrycia sekretu w commicie.
const skanCommita = ["git", "--pre-commit", "--staged", "--redact", "--no-banner"];
const token = /\bghp_[A-Za-z0-9]{36}\b/;

let tresc = null;
let kod;
let wyjscie = "";
if (argumenty.length === 1 && argumenty[0] === "version") {
  kod = 0;
  wyjscie = "8.30.1\n";
} else if (argumenty[0] === "stdin" && argumenty.includes("--redact") && argumenty.slice(1).every((a) => flagiStdin.has(a))) {
  tresc = readFileSync(0, "utf8");
  const trafienie = (wczytajUstawienia().trafienie ?? "token") === "zawsze" ? tresc.trim() !== "" : token.test(tresc);
  kod = trafienie ? 1 : 0;
  wyjscie = trafienie
    ? "Finding:     REDACTED\nSecret:      REDACTED\nRuleID:      github-pat\n\nWRN leaks found: 1\n"
    : "INF no leaks found\n";
} else if (argumenty.length === skanCommita.length && argumenty.every((a, i) => a === skanCommita[i])) {
  kod = 0;
  wyjscie = "INF no leaks found\n";
} else {
  kod = 2;
  wyjscie = `atrapa gitleaks: nieprzewidziane wywołanie: gitleaks ${argumenty.join(" ")}\n`;
}

appendFileSync(
  join(katalog, "gitleaks.jsonl"),
  JSON.stringify({ argumenty, tresc, kod, czas: new Date().toISOString() }) + "\n",
);
(kod === 0 && argumenty[0] === "version" ? process.stdout : process.stderr).write(wyjscie);
process.exit(kod);
