// Test jednostkowy skryptu linków zgłoszenia (S10): granice limitu długości i postać linków. Bez modelu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { katalogPluginu } from "./sesja.mjs";

const skrypt = join(katalogPluginu, "scripts", "linki-zgloszenia.mjs");
const repo = "przyklad-org/warsztat-zgloszenia";
const tytul = "[spec] Spec skill writes a scenario without asking for thresholds";
const etykiety = "&labels=process-report,status:+new";

/** Uruchamia skrypt jak skill: `node <skrypt> --repo <r> --tytul <plik> --tresc <plik>`. */
function uruchom(tytulPliku, trescPliku, repozytorium = repo) {
  const katalog = mkdtempSync(join(tmpdir(), "linki-zgloszenia-"));
  try {
    writeFileSync(join(katalog, "tytul.txt"), tytulPliku);
    writeFileSync(join(katalog, "tresc.md"), trescPliku);
    const stdout = execFileSync(
      process.execPath,
      [skrypt, "--repo", repozytorium, "--tytul", join(katalog, "tytul.txt"), "--tresc", join(katalog, "tresc.md")],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return JSON.parse(stdout);
  } finally {
    rmSync(katalog, { recursive: true, force: true });
  }
}

const poczatekFormularza = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(tytul)}`;
// Treść z samych liter ASCII koduje się 1:1, więc długość pełnego linku ustawiamy co do znaku.
const pelnaDlugosc = (n) => poczatekFormularza.length + "&body=".length + n + etykiety.length;
const trescDlaLinku = (dlugosc) => "a".repeat(dlugosc - pelnaDlugosc(0));

for (const [dlugosc, zmiescila] of [
  [5999, true],
  [6000, true],
  [6001, false],
]) {
  test(`S10: pełny link formularza ${dlugosc} znaków → ${zmiescila ? "tytuł i treść" : "sam tytuł, treść do wklejenia"}`, () => {
    const tresc = trescDlaLinku(dlugosc);
    const wynik = uruchom(tytul, tresc);
    assert.equal(wynik.dlugoscPelnego, dlugosc);
    assert.equal(wynik.limit, 6000);
    assert.equal(wynik.trescWLinku, zmiescila);
    if (zmiescila) {
      assert.equal(wynik.formularz, `${poczatekFormularza}&body=${tresc}${etykiety}`);
      assert.equal(wynik.formularz.length, dlugosc);
    } else {
      assert.equal(wynik.formularz, `${poczatekFormularza}${etykiety}`);
    }
  });
}

test("S10: link wyszukiwania — etykieta process-report i nazwa skilla z tytułu", () => {
  const wynik = uruchom(tytul, "### Symptom\nx\n");
  assert.equal(
    wynik.wyszukiwanie,
    `https://github.com/${repo}/issues?q=${encodeURIComponent("is:issue label:process-report spec")}`,
  );
});

test("S10: tytuł i treść z kodowaniem procentowym, bez końcowego znaku nowej linii tytułu", () => {
  const tresc = "### Symptom\nZażółć & gęślą #1? 100% = tak\r\n";
  const wynik = uruchom("﻿[gdzie] Zła ścieżka & co dalej?\r\n", tresc);
  const url = new URL(wynik.formularz);
  assert.equal(url.searchParams.get("title"), "[gdzie] Zła ścieżka & co dalej?");
  assert.equal(url.searchParams.get("body"), tresc);
  assert.equal(url.searchParams.get("labels"), "process-report,status: new");
  assert.match(wynik.formularz, /body=%23%23%23%20Symptom%0AZa%C5%BC/);
  assert.equal(wynik.trescWLinku, true);
});

test("S10: nawiasy i znaki !'* są kodowane — link nie kończy się w markdownie na „)”", () => {
  const tresc = "### Symptom\nThe limit (for example an amount) isn't asked! *always*\n";
  const wynik = uruchom("[spec] Limit (amount) isn't asked!", tresc);
  for (const link of [wynik.formularz, wynik.wyszukiwanie]) assert.doesNotMatch(link, /[()!'*]/, link);
  const url = new URL(wynik.formularz);
  assert.equal(url.searchParams.get("body"), tresc);
  assert.equal(url.searchParams.get("title"), "[spec] Limit (amount) isn't asked!");
});

test("S10: repozytorium spoza postaci właściciel/nazwa → błąd, bez linków", () => {
  for (const zle of ["-zly/repo", "org/repo name", "org", "org/repo/x", "org/re$po", "../x", "org/.."]) {
    assert.throws(() => uruchom(tytul, "x", zle), /Command failed/, `przyjęte repozytorium ${zle}`);
  }
});
