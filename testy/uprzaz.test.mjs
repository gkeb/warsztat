// Test jednostkowy uprzęży sesji: które wywołania `gh` liczą się jako zmiana stanu na GitHubie. Bez modelu i sieci.
// Od tej klasyfikacji zależy kontrola „retro niczego nie zmieniło” w testach sesji.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zmieniaStan } from "./sesja.mjs";

// Atrapa `gh`: odpowiedź z `zFlaga` pasuje tylko do wywołania z którąś z flag (sama albo `flaga=wartość`) —
// tak testy sesji odrzucają etykiety przy zakładaniu Issue z projektu (konto bez uprawnień do etykiet).
const atrapa = join(dirname(fileURLToPath(import.meta.url)), "atrapa-gh.mjs");
const odpowiedziEtykiet = [
  { argumenty: ["issue", "create"], zFlaga: ["--label", "-l"], kod: 1, stderr: "brak uprawnień do etykiet\n" },
  { argumenty: ["issue", "create"], stdout: "https://github.com/a/b/issues/1\n" },
];
for (const [opis, argumenty, kod] of [
  ["bez etykiet → założone", ["issue", "create", "--repo", "a/b", "--title", "[spec] label-like title", "--body-file", "x"], 0],
  ["--label → odrzucone", ["issue", "create", "--repo", "a/b", "--label", "process-report"], 1],
  ["--label=… → odrzucone", ["issue", "create", "--repo", "a/b", "--label=process-report"], 1],
  ["-l → odrzucone", ["issue", "create", "--repo", "a/b", "-l", "process-report"], 1],
  ["-l sklejone z wartością → odrzucone", ["issue", "create", "--repo", "a/b", "-lprocess-report"], 1],
]) {
  test(`atrapa gh, zFlaga: ${opis}`, () => {
    const katalog = mkdtempSync(join(tmpdir(), "warsztat-atrapa-"));
    try {
      writeFileSync(join(katalog, "odpowiedzi.json"), JSON.stringify(odpowiedziEtykiet));
      const wynik = spawnSync(process.execPath, [atrapa, katalog, ...argumenty], { encoding: "utf8" });
      assert.equal(wynik.status, kod, `stdout: ${wynik.stdout}\nstderr: ${wynik.stderr}`);
    } finally {
      rmSync(katalog, { recursive: true, force: true });
    }
  });
}

const zapytanie =
  "query=query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { totalContributions } } } }";

for (const [opis, argumenty, oczekiwane] of [
  ["odczyt listy zgłoszeń", ["issue", "list", "--repo", "a/b"], false],
  ["założenie zgłoszenia", ["issue", "create", "--repo", "a/b"], true],
  ["REST bez pól", ["api", "users/konto-a", "--jq", ".created_at"], false],
  ["REST z polem", ["api", "repos/a/b/labels", "-f", "name=x"], true],
  ["GraphQL query ze zmienną", ["api", "graphql", "-f", "login=konto-a", "-f", zapytanie], false],
  ["GraphQL query przed zmienną", ["api", "graphql", "-f", zapytanie, "-F", "login=konto-a"], false],
  ["GraphQL query w postaci pola sklejonego", ["api", "graphql", `-f${zapytanie}`], false],
  ["GraphQL dokument skrócony {…}", ["api", "graphql", "-f", "query={ viewer { login } }"], false],
  ["GraphQL mutation", ["api", "graphql", "-f", "query=mutation { addLabelsToLabelable { clientMutationId } }"], true],
  ["GraphQL query i mutation w jednym dokumencie", ["api", "graphql", "-f", "query=query A { a } mutation B { b }"], true],
  ["GraphQL operationName", ["api", "graphql", "-f", zapytanie, "-f", "operationName=B"], true],
  ["GraphQL --input", ["api", "graphql", "--input", "zapytanie.json"], true],
  ["GraphQL inna metoda", ["api", "graphql", "-X", "DELETE", "-f", zapytanie], true],
  ["GraphQL bez zapytania", ["api", "graphql"], true],
]) {
  test(`zmieniaStan: ${opis} → ${oczekiwane ? "zmiana" : "odczyt"}`, () => {
    assert.equal(zmieniaStan(argumenty), oczekiwane);
  });
}

// Atrapa `gitleaks` (S5): przyjmuje tylko polecenia z procedury retro i skan commita z fikstury, zapisuje wywołania
// z treścią ze stdin i zwraca kod 1 dla syntetycznego tokenu — albo dla każdej treści w trybie `zawsze`.
const atrapaGitleaks = join(dirname(fileURLToPath(import.meta.url)), "atrapa-gitleaks.mjs");
const tokenTestowy = "ghp_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8";
for (const [opis, argumenty, stdin, kod, ustawienia] of [
  ["version", ["version"], "", 0],
  ["stdin z --redact, bez sekretu", ["stdin", "--redact", "--no-banner"], "### Symptom\nplain text\n", 0],
  ["stdin z --redact, z tokenem", ["stdin", "--redact", "--no-banner"], `token ${tokenTestowy}\n`, 1],
  ["stdin bez --redact → odrzucone", ["stdin", "--no-banner"], "plain\n", 2],
  ["stdin z nieznaną flagą → odrzucone", ["stdin", "--redact", "--report-path", "x.json"], "plain\n", 2],
  [
    "skan commita z fikstury retro-warsztat",
    JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fikstury", "retro-warsztat", ".ai", "warsztat.json"), "utf8"),
    ).bezpieczenstwo.skanSekretow
      .split(" ")
      .slice(1),
    "",
    0,
  ],
  ["inne polecenie → odrzucone", ["detect", "--source", "."], "", 2],
  ["tryb zawsze: trafienie bez tokenu", ["stdin", "--redact"], "plain\n", 1, { trafienie: "zawsze" }],
]) {
  test(`atrapa gitleaks: ${opis} → kod ${kod}`, () => {
    const katalog = mkdtempSync(join(tmpdir(), "warsztat-atrapa-"));
    try {
      if (ustawienia) writeFileSync(join(katalog, "gitleaks.json"), JSON.stringify(ustawienia));
      const wynik = spawnSync(process.execPath, [atrapaGitleaks, katalog, ...argumenty], { input: stdin, encoding: "utf8" });
      assert.equal(wynik.status, kod, `stdout: ${wynik.stdout}\nstderr: ${wynik.stderr}`);
      assert.ok(!`${wynik.stdout}${wynik.stderr}`.includes(tokenTestowy), "atrapa wypisała treść sekretu");
      const [wpis] = readFileSync(join(katalog, "gitleaks.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
      assert.deepEqual(wpis.argumenty, argumenty);
      assert.equal(wpis.kod, kod);
      assert.equal(wpis.tresc, argumenty[0] === "stdin" && kod !== 2 ? stdin : null);
    } finally {
      rmSync(katalog, { recursive: true, force: true });
    }
  });
}

// Atrapa `gh`: odpowiedź z `bezFlag` pasuje tylko do wywołania bez żadnej z flag — lista opiekuna bez filtra etykiety (S33).
const odpowiedziListy = [{ argumenty: ["issue", "list"], bezFlag: ["--label", "-l"], stdout: "[]\n" }];
for (const [opis, argumenty, kod] of [
  ["bez filtra etykiety → lista", ["issue", "list", "--repo", "a/b", "--state", "open"], 0],
  ["--label → nieprzewidziane", ["issue", "list", "--repo", "a/b", "--label", "process-report"], 1],
  ["--label=… → nieprzewidziane", ["issue", "list", "--repo", "a/b", "--label=process-report"], 1],
  ["-l sklejone z wartością → nieprzewidziane", ["issue", "list", "--repo", "a/b", "-lprocess-report"], 1],
]) {
  test(`atrapa gh, bezFlag: ${opis}`, () => {
    const katalog = mkdtempSync(join(tmpdir(), "warsztat-atrapa-"));
    try {
      writeFileSync(join(katalog, "odpowiedzi.json"), JSON.stringify(odpowiedziListy));
      const wynik = spawnSync(process.execPath, [atrapa, katalog, ...argumenty], { encoding: "utf8" });
      assert.equal(wynik.status, kod, `stdout: ${wynik.stdout}\nstderr: ${wynik.stderr}`);
    } finally {
      rmSync(katalog, { recursive: true, force: true });
    }
  });
}
