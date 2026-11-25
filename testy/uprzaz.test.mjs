// Test jednostkowy uprzęży sesji: które wywołania `gh` liczą się jako zmiana stanu na GitHubie. Bez modelu i sieci.
// Od tej klasyfikacji zależy kontrola „retro niczego nie zmieniło” w testach sesji.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
