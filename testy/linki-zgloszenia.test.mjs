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

// Formularz `process-report.yml` wypełnia się z linku po `id` pól, nie parametrem `body`; etykiety nadaje sam formularz.
const poczatekFormularza = `https://github.com/${repo}/issues/new?template=process-report.yml&title=${encodeURIComponent(tytul)}`;
const polaFormularza = [
  ["Workshop version", "workshop-version"],
  ["Agent and model", "agent-and-model"],
  ["Skill and step", "skill-and-step"],
  ["Kind", "kind"],
  ["Symptom", "symptom"],
  ["Occurrences", "occurrences"],
  ["Proposed direction", "proposed-direction"],
];
const szkic = (wartosci) => polaFormularza.map(([pole], i) => `### ${pole}\n\n${wartosci[i]}\n`).join("\n");
const wartosciKrotkie = ["0.9.0", "Claude Code / claude-sonnet-5-5", "skills/spec/SKILL.md, step 3", "regular", "x", "3: 2026-11-01", "y"];
// Wartości z samych liter ASCII kodują się 1:1, więc długość pełnego linku ustawiamy co do znaku polem Symptom.
const koduj = (w) => w.replace(/[^A-Za-z0-9_.-]/g, (z) => encodeURIComponent(z));
const reszta = (symptom) => polaFormularza.map(([, id], i) => `&${id}=${i === 4 ? symptom : koduj(wartosciKrotkie[i])}`).join("");
const pelnaDlugosc = (n) => poczatekFormularza.length + reszta("a".repeat(n)).length;
const symptomDlaLinku = (dlugosc) => "a".repeat(dlugosc - pelnaDlugosc(0));

for (const [dlugosc, zmiescila] of [
  [5999, true],
  [6000, true],
  [6001, false],
]) {
  test(`S10: pełny link formularza ${dlugosc} znaków → ${zmiescila ? "tytuł i pola" : "sam tytuł, treść do wklejenia"}`, () => {
    const symptom = symptomDlaLinku(dlugosc);
    const wynik = uruchom(tytul, szkic(wartosciKrotkie.map((w, i) => (i === 4 ? symptom : w))));
    assert.equal(wynik.dlugoscPelnego, dlugosc);
    assert.equal(wynik.limit, 6000);
    assert.equal(wynik.trescWLinku, zmiescila);
    if (zmiescila) {
      assert.equal(wynik.formularz, `${poczatekFormularza}${reszta(symptom)}`);
      assert.equal(wynik.formularz.length, dlugosc);
    } else {
      assert.equal(wynik.formularz, poczatekFormularza);
    }
  });
}

test("S10: link wyszukiwania — bez filtra etykiety (obejmuje zgłoszenia czekające, S33), fraza pola i nazwa skilla z tytułu", () => {
  const wynik = uruchom(tytul, szkic(wartosciKrotkie));
  const q = new URL(wynik.wyszukiwanie).searchParams.get("q");
  assert.doesNotMatch(q, /label:/);
  assert.equal(q, 'is:issue "Skill and step" spec');
  assert.equal(wynik.wyszukiwanie, `https://github.com/${repo}/issues?q=is%3Aissue%20%22Skill%20and%20step%22%20spec`);
});

test("S10: każde pole szkicu trafia do pola formularza o swoim id, tytuł bez końcowej nowej linii", () => {
  const wartosci = [...wartosciKrotkie];
  wartosci[4] = "Zażółć & gęślą #1? 100% = tak\r\ndruga linia";
  wartosci[5] =
    "3: 2026-11-01, 2026-11-03\nPreviously reported: https://github.com/x/y/issues/1 (closed as completed); occurs again after closing.";
  const wynik = uruchom("﻿[gdzie] Zła ścieżka & co dalej?\r\n", szkic(wartosci));
  const url = new URL(wynik.formularz);
  assert.equal(url.searchParams.get("template"), "process-report.yml");
  assert.equal(url.searchParams.get("title"), "[gdzie] Zła ścieżka & co dalej?");
  assert.equal(url.searchParams.get("body"), null);
  assert.equal(url.searchParams.get("labels"), null);
  polaFormularza.forEach(([, id], i) => assert.equal(url.searchParams.get(id), wartosci[i], id));
  assert.match(wynik.formularz, /symptom=Za%C5%BC%C3%B3%C5%82%C4%87%20%26/);
  assert.equal(wynik.trescWLinku, true);
});

test("S10: nawiasy i znaki !'* są kodowane — link nie kończy się w markdownie na „)”", () => {
  const wartosci = [...wartosciKrotkie];
  wartosci[4] = "The limit (for example an amount) isn't asked! *always*";
  const wynik = uruchom("[spec] Limit (amount) isn't asked!", szkic(wartosci));
  for (const link of [wynik.formularz, wynik.wyszukiwanie]) assert.doesNotMatch(link, /[()!'*]/, link);
  const url = new URL(wynik.formularz);
  assert.equal(url.searchParams.get("symptom"), wartosci[4]);
  assert.equal(url.searchParams.get("title"), "[spec] Limit (amount) isn't asked!");
});

test("S10: treść spoza pól formularza → link z samym tytułem, treść do wklejenia", () => {
  for (const tresc of [
    `Wstęp poza polami\n${szkic(wartosciKrotkie)}`,
    `${szkic(wartosciKrotkie)}\n### Extra\n\nx\n`,
    `${szkic(wartosciKrotkie)}\n### Symptom\n\npowtórzone pole\n`,
  ]) {
    const wynik = uruchom(tytul, tresc);
    assert.equal(wynik.trescWLinku, false, tresc);
    assert.equal(wynik.formularz, poczatekFormularza);
  }
});

test("S10: repozytorium spoza postaci właściciel/nazwa → błąd, bez linków", () => {
  for (const zle of ["-zly/repo", "org/repo name", "org", "org/repo/x", "org/re$po", "../x", "org/.."]) {
    assert.throws(() => uruchom(tytul, "x", zle), /Command failed/, `przyjęte repozytorium ${zle}`);
  }
});
