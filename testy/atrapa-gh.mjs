// Atrapa `gh` dla sesji testowych agenta.
// Wywołanie: node atrapa-gh.mjs <katalog-atrapy> <argumenty gh...>
// <katalog-atrapy>/odpowiedzi.json — lista { argumenty: [...prefiks], stdout?, stderr?, kod? } zadana przez test.
// <katalog-atrapy>/wywolania.jsonl — każde wywołanie: argumenty, treść z --body-file, powłoka, czy przewidziane.
import { appendFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [katalog, ...argumenty] = process.argv.slice(2);

function wczytajOdpowiedzi() {
  try {
    return JSON.parse(readFileSync(join(katalog, "odpowiedzi.json"), "utf8"));
  } catch (blad) {
    if (blad.code === "ENOENT") return [];
    throw blad;
  }
}

function sciezkaTresci() {
  // W `gh api` `-F` to pole formularza, nie plik treści.
  if (argumenty[0] === "api") return undefined;
  for (let i = 0; i < argumenty.length; i++) {
    const arg = argumenty[i];
    if (arg === "--body-file" || arg === "-F") return argumenty[i + 1];
    if (arg.startsWith("--body-file=")) return arg.slice("--body-file=".length);
  }
  return undefined;
}

function wczytajTresc() {
  const sciezka = sciezkaTresci();
  if (sciezka === undefined) return null;
  if (sciezka === "-") return readFileSync(0, "utf8");
  try {
    return readFileSync(resolve(process.cwd(), sciezka), "utf8");
  } catch (blad) {
    return `<nie da się odczytać ${sciezka}: ${blad.code}>`;
  }
}

const pasuje = (prefiks) => prefiks.length <= argumenty.length && prefiks.every((a, i) => argumenty[i] === a);
const odpowiedz = wczytajOdpowiedzi().find((o) => pasuje(o.argumenty));

appendFileSync(
  join(katalog, "wywolania.jsonl"),
  JSON.stringify({
    argumenty,
    tresc: wczytajTresc(),
    powloka: process.env.ATRAPA_POWLOKA ?? null,
    przewidziane: odpowiedz !== undefined,
    czas: new Date().toISOString(),
  }) + "\n",
);

if (odpowiedz === undefined) {
  process.stderr.write(`atrapa gh: nieprzewidziane wywołanie: gh ${argumenty.join(" ")}\n`);
  process.exit(1);
}
if (odpowiedz.stdout) process.stdout.write(odpowiedz.stdout);
if (odpowiedz.stderr) process.stderr.write(odpowiedz.stderr);
process.exit(odpowiedz.kod ?? 0);
