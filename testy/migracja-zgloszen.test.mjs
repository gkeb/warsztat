// Testy akceptacyjne migracji pliku zgłoszeń do Issues (S15, S16). Bez sieci: czytają repozytorium i historię gita.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const katalogRepo = dirname(dirname(fileURLToPath(import.meta.url)));
const plikZgloszen = "ZGLOSZENIA.md";
const listaMigracji = join(katalogRepo, ".ai", "zdolnosci", "model-zgloszen", "migracja-zgloszen.md");
// Odwołanie do pliku zgłoszeń: nazwa pliku (wielkimi literami — klucz `zgloszenia` w konfiguracji to co innego)
// albo opis „plik zgłoszeń” w dowolnej odmianie.
const odwolanie = /ZGLOSZENIA|[Pp]lik\w* zgłoszeń/;

const git = (...argumenty) => execFileSync("git", argumenty, { cwd: katalogRepo, encoding: "utf8" });

function pliki(katalog) {
  return readdirSync(katalog).flatMap((nazwa) => {
    const sciezka = join(katalog, nazwa);
    return statSync(sciezka).isDirectory() ? pliki(sciezka) : [sciezka];
  });
}

test("S15: pliku zgłoszeń nie ma, a plugin i dokumenty projektu do niego nie odsyłają", () => {
  assert.equal(existsSync(join(katalogRepo, plikZgloszen)), false, `${plikZgloszen} nadal istnieje`);
  const sprawdzane = [
    ...pliki(join(katalogRepo, "plugins", "ai")),
    ...["AGENTS.md", ".ai/SLOWNIK.md", ".ai/ZASADY.md"].map((p) => join(katalogRepo, p)),
  ];
  const trafienia = sprawdzane.flatMap((sciezka) =>
    readFileSync(sciezka, "utf8")
      .split("\n")
      .flatMap((linia, i) => (odwolanie.test(linia) ? [`${relative(katalogRepo, sciezka)}:${i + 1}: ${linia.trim()}`] : [])),
  );
  assert.deepEqual(trafienia, [], "odwołania do pliku zgłoszeń");
});

// Ostatnia wersja pliku w historii: commit, który go ostatni zmienił, a gdy go usunął — jego rodzic.
function ostatniaWersja() {
  const commit = git("log", "-1", "--format=%H", "--", plikZgloszen).trim();
  assert.ok(commit, `${plikZgloszen} nie ma w historii gita`);
  try {
    return git("show", `${commit}:${plikZgloszen}`);
  } catch {
    return git("show", `${commit}^:${plikZgloszen}`);
  }
}

const repoZgloszen = JSON.parse(readFileSync(join(katalogRepo, ".ai", "warsztat.json"), "utf8")).github.repo;

function istniejeCommit(hash) {
  try {
    git("cat-file", "-e", `${hash}^{commit}`);
    return true;
  } catch {
    return false;
  }
}

// Cele pozycji listy: Issue w repozytorium warsztatu, commit (hash w backtickach), mapa zdolności (link do mapa.md).
function cele(linia) {
  const issues = [...linia.matchAll(/https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/issues\/(\d+)/g)].map((m) => ({
    rodzaj: "issue",
    ok: m[1].toLowerCase() === repoZgloszen.toLowerCase(),
    opis: m[0],
  }));
  const commity = [...linia.matchAll(/`([0-9a-f]{7,40})`/g)].map((m) => ({
    rodzaj: "commit",
    ok: istniejeCommit(m[1]),
    opis: m[1],
  }));
  const mapy = [...linia.matchAll(/\]\(([^)]*mapa\.md)\)/g)].map((m) => ({
    rodzaj: "mapa",
    ok: existsSync(resolve(dirname(listaMigracji), m[1])),
    opis: m[1],
  }));
  return [...issues, ...commity, ...mapy];
}

test("S16: każdy wpis ostatniej wersji pliku zgłoszeń ma pozycję na liście wynikowej migracji", () => {
  const numery = [...ostatniaWersja().matchAll(/^## (Z\d+) /gm)].map((m) => m[1]);
  assert.ok(numery.length > 0, "ostatnia wersja pliku zgłoszeń bez wpisów");
  assert.ok(existsSync(listaMigracji), `brak listy wynikowej migracji ${relative(katalogRepo, listaMigracji)}`);
  const pozycje = readFileSync(listaMigracji, "utf8")
    .split("\n")
    .filter((l) => /^- Z\d+ /.test(l));
  for (const numer of numery) {
    const linie = pozycje.filter((l) => l.startsWith(`- ${numer} `));
    assert.equal(linie.length, 1, `${numer}: oczekiwana jedna pozycja na liście, jest ${linie.length}`);
    const znalezione = cele(linie[0]);
    assert.ok(znalezione.length > 0, `${numer}: pozycja bez Issue, commita ani mapy: ${linie[0]}`);
    for (const cel of znalezione) assert.ok(cel.ok, `${numer}: nieprawidłowy cel (${cel.rodzaj}) ${cel.opis}`);
  }
});
