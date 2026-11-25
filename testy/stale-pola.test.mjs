// Test jednostkowy rozpoznania stałych pól zgłoszenia (słownik → „Stałe pola”): granice reguły. Bez modelu i sieci.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { katalogPluginu } from "./sesja.mjs";

const skrypt = join(katalogPluginu, "scripts", "stale-pola.mjs");

/** Uruchamia skrypt jak procedura retro: treść Issue na stdin. */
function uruchom(tresc) {
  const stdout = execFileSync(process.execPath, [skrypt], {
    input: tresc,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return JSON.parse(stdout).wStalychPolach;
}

const pola = [
  ["Workshop version", "0.29.0"],
  ["Agent and model", "Claude Code / claude-sonnet-5-5"],
  ["Skill and step", "skills/spec/SKILL.md, step 3"],
  ["Kind", "regular"],
  ["Symptom", "The spec skill writes a threshold without asking for examples."],
  ["Occurrences", "3: 2026-11-01, 2026-11-03, 2026-11-05"],
  ["Proposed direction", "Ask for examples on both sides of the threshold."],
];
const tresc = (lista) => lista.map(([pole, wartosc]) => `### ${pole}\n\n${wartosc}\n`).join("\n");

test("stałe pola: siedem nagłówków, jedno pole puste → w stałych polach", () => {
  const zPustym = pola.map(([pole, wartosc]) => [pole, pole === "Proposed direction" ? "" : wartosc]);
  assert.equal(uruchom(tresc(zPustym)), true);
});

test("stałe pola: sześć z siedmiu nagłówków → nie", () => {
  assert.equal(uruchom(tresc(pola.filter(([pole]) => pole !== "Kind"))), false);
});

test("stałe pola: nagłówek pola powtórzony → nie", () => {
  assert.equal(uruchom(tresc([...pola, ["Symptom", "Repeated field."]])), false);
});

test("stałe pola: tekst przed pierwszym nagłówkiem → nie", () => {
  assert.equal(uruchom(`Some introduction before the fields.\n\n${tresc(pola)}`), false);
});

test("stałe pola: obcy nagłówek trzeciego poziomu → nie", () => {
  assert.equal(uruchom(`${tresc(pola)}\n### Steps to reproduce\n\n1. Run the skill.\n`), false);
});

test("stałe pola: treść z formularza GitHuba, puste pole jako _No response_, końce linii CRLF → w stałych polach", () => {
  // Tak formularz `process-report.yml` składa treść Issue: `### <etykieta pola>`, pusta linia, wartość.
  const zFormularza = pola
    .map(([pole, wartosc]) => `### ${pole}\r\n\r\n${pole === "Proposed direction" ? "_No response_" : wartosc}`)
    .join("\r\n\r\n");
  assert.equal(uruchom(zFormularza), true);
});

test("stałe pola: nagłówek podobny do pola (Occurrence zamiast Occurrences) → nie", () => {
  assert.equal(uruchom(tresc(pola.map(([pole, w]) => [pole === "Occurrences" ? "Occurrence" : pole, w]))), false);
});

test("stałe pola: skrypt czyta plik z argumentu, a inne skrypty importują to samo rozpoznanie", async () => {
  const katalog = mkdtempSync(join(tmpdir(), "stale-pola-"));
  try {
    writeFileSync(join(katalog, "tresc.md"), tresc(pola));
    const stdout = execFileSync(process.execPath, [skrypt, join(katalog, "tresc.md")], { encoding: "utf8" });
    assert.deepEqual(JSON.parse(stdout), { wStalychPolach: true });
  } finally {
    rmSync(katalog, { recursive: true, force: true });
  }
  const { wStalychPolach } = await import(pathToFileURL(skrypt).href);
  assert.equal(wStalychPolach(tresc(pola)), true);
  assert.equal(wStalychPolach("A regular bug report without fields."), false);
});

test("stałe pola: nieczytelny plik → kod 2, bez wyniku", () => {
  assert.throws(
    () => execFileSync(process.execPath, [skrypt, join(katalogPluginu, "brak-takiego-pliku.md")], { stdio: "pipe" }),
    (e) => e.status === 2 && e.stdout.length === 0 && /stale-pola: nie da się odczytać/.test(e.stderr),
  );
});
