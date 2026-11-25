// Test jednostkowy skryptu sygnału globalnego (S17): grupy i kolejność zgłoszeń w retro opiekuna. Bez modelu i sieci.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { katalogPluginu } from "./sesja.mjs";

const skrypt = join(katalogPluginu, "scripts", "sygnal-zgloszen.mjs");

const LIMIT = 1000;

/** Uruchamia skrypt jak skill: JSON z `gh issue list` na stdin i limit pobrania. */
function uruchom(zgloszenia, limit = LIMIT) {
  const stdout = execFileSync(process.execPath, [skrypt, "--limit", String(limit)], {
    input: JSON.stringify(zgloszenia),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return JSON.parse(stdout);
}

/** Uruchomienie bez rzucania — kod wyjścia, stdout i stderr. */
const surowo = (argumenty, wejscie) => spawnSync(process.execPath, [skrypt, ...argumenty], { input: wejscie, encoding: "utf8" });

const wystapienie = (login, dzien = "2026-11-12") => ({
  author: { login },
  body: `## Occurrence\n\n### Date\n\n${dzien}`,
  createdAt: `${dzien}T10:00:00Z`,
});
const zgloszenie = (numer, login, createdAt, comments = [], status = "status: new") => ({
  number: numer,
  title: `[spec] report ${numer}`,
  url: `https://github.com/przyklad-warsztat/warsztat/issues/${numer}`,
  createdAt,
  author: { login },
  labels: [{ name: "process-report" }, { name: status }],
  body: "### Symptom\n\nSomething.",
  comments,
});
const numery = (grupa) => grupa.map((z) => z.numer);

for (const [opis, zgl, grupa, konta] of [
  ["1 konto, 1 wystąpienie", zgloszenie(1, "konto-a", "2026-11-01T10:00:00Z"), "reszta", [["konto-a", 1]]],
  [
    "1 konto, 4 komentarze „wystąpienie”",
    zgloszenie(2, "konto-a", "2026-11-01T10:00:00Z", [1, 2, 3, 4].map(() => wystapienie("konto-a"))),
    "reszta",
    [["konto-a", 5]],
  ],
  [
    "2 różne konta, po 1 wystąpieniu",
    zgloszenie(3, "konto-a", "2026-11-01T10:00:00Z", [wystapienie("konto-b")]),
    "najpierw",
    [
      ["konto-a", 1],
      ["konto-b", 1],
    ],
  ],
]) {
  test(`S17: ${opis} → ${grupa}`, () => {
    const wynik = uruchom([zgl]);
    assert.deepEqual(numery(wynik[grupa]), [zgl.number]);
    assert.deepEqual(numery(wynik[grupa === "najpierw" ? "reszta" : "najpierw"]), []);
    assert.deepEqual(
      wynik[grupa][0].konta.map((k) => [k.login, k.wystapienia]),
      konta,
    );
  });
}

test("S17: komentarz bez nagłówka Occurrence nie jest wystąpieniem", () => {
  const zgl = zgloszenie(4, "konto-a", "2026-11-01T10:00:00Z", [
    { author: { login: "konto-b" }, body: "I see this too, thanks!", createdAt: "2026-11-02T10:00:00Z" },
    { author: { login: "konto-c" }, body: "### Occurrences\n\n2026-11-03", createdAt: "2026-11-03T10:00:00Z" },
    { author: { login: "konto-d" }, body: "Quote:\n## Occurrence", createdAt: "2026-11-04T10:00:00Z" },
  ]);
  const wynik = uruchom([zgl]);
  assert.deepEqual(numery(wynik.reszta), [4]);
  assert.deepEqual(wynik.reszta[0].konta.map((k) => k.login), ["konto-a"]);
});

test("S17: w każdej grupie od najstarszego zgłoszenia, niezależnie od statusu", () => {
  const wynik = uruchom([
    zgloszenie(10, "konto-a", "2026-11-05T10:00:00Z", [], "status: accepted"),
    zgloszenie(11, "konto-a", "2026-11-02T10:00:00Z", [wystapienie("konto-b")]),
    zgloszenie(12, "konto-a", "2026-11-01T10:00:00Z", [], "status: discussion"),
    zgloszenie(13, "konto-c", "2026-11-03T10:00:00Z", [wystapienie("konto-d")], "status: accepted"),
  ]);
  assert.deepEqual(numery(wynik.najpierw), [11, 13]);
  assert.deepEqual(numery(wynik.reszta), [12, 10]);
  assert.equal(wynik.reszta[1].status, "status: accepted");
});

test("S17: wynik niesie treść zgłoszenia i komentarze, z oznaczeniem wystąpień", () => {
  const zgl = zgloszenie(5, "konto-a", "2026-11-01T10:00:00Z", [
    wystapienie("konto-b"),
    { author: { login: "konto-c" }, body: "Thanks!", createdAt: "2026-11-03T10:00:00Z" },
  ]);
  const [opisane] = uruchom([zgl]).najpierw;
  assert.equal(opisane.tresc, zgl.body);
  assert.deepEqual(
    opisane.komentarze.map((k) => [k.login, k.wystapienie, k.tresc]),
    [
      ["konto-b", true, zgl.comments[0].body],
      ["konto-c", false, "Thanks!"],
    ],
  );
});

test("S17: konta do sprawdzenia — tylko z grupy najpierw, bez powtórzeń", () => {
  const wynik = uruchom([
    zgloszenie(20, "konto-a", "2026-11-01T10:00:00Z", [wystapienie("konto-b")]),
    zgloszenie(21, "konto-b", "2026-11-02T10:00:00Z", [wystapienie("konto-c")]),
    zgloszenie(22, "konto-z", "2026-11-03T10:00:00Z"),
  ]);
  assert.deepEqual(wynik.kontaDoSprawdzenia, ["konto-a", "konto-b", "konto-c"]);
});

test("S17: login spoza postaci loginu GitHub nie trafia do kont do sprawdzenia", () => {
  const wynik = uruchom([zgloszenie(30, "konto-a", "2026-11-01T10:00:00Z", [wystapienie("x; rm -rf ~")])]);
  assert.deepEqual(numery(wynik.najpierw), [30]);
  assert.deepEqual(wynik.kontaDoSprawdzenia, ["konto-a"]);
});

test("S17: plik z JSON-em jako argument daje ten sam wynik co stdin", () => {
  const katalog = mkdtempSync(join(tmpdir(), "sygnal-zgloszen-"));
  try {
    const zgl = [zgloszenie(40, "konto-a", "2026-11-01T10:00:00Z", [wystapienie("konto-b")])];
    const plik = join(katalog, "zgloszenia.json");
    writeFileSync(plik, JSON.stringify(zgl));
    const zPliku = JSON.parse(execFileSync(process.execPath, [skrypt, "--limit", String(LIMIT), plik], { encoding: "utf8" }));
    assert.deepEqual(zPliku, uruchom(zgl));
  } finally {
    rmSync(katalog, { recursive: true, force: true });
  }
});

for (const [opis, wejscie] of [
  ["obiekt zamiast listy", '{"message":"Bad credentials"}'],
  ["lista z elementem, który nie jest zgłoszeniem", "[null]"],
]) {
  test(`S17: ${opis} — kod 2 bez wyniku`, () => {
    const wynik = surowo(["--limit", String(LIMIT)], wejscie);
    assert.equal(wynik.status, 2);
    assert.equal(wynik.stdout, "");
    assert.match(wynik.stderr, /sygnal-zgloszen:/);
  });
}

// Niepełny odczyt (S17): `gh issue list` nie potwierdza końca listy, więc liczba równa limitowi pobrania znaczy
// „mogło być więcej” — kod 3, komunikat na stderr, bez grup na stdout.
const wiele = (ile) => Array.from({ length: ile }, (_, i) => zgloszenie(1000 + i, "konto-a", "2026-11-01T10:00:00Z"));

test("S17: zgłoszeń tyle co limit pobrania — niepełny odczyt, kod 3 bez wyniku", () => {
  const wynik = surowo(["--limit", "5"], JSON.stringify(wiele(5)));
  assert.equal(wynik.status, 3);
  assert.equal(wynik.stdout, "");
  assert.match(wynik.stderr, /sygnal-zgloszen: odczyt niepełny/);
});

test("S17: komentarzy jednego zgłoszenia tyle co strona gh (100) — niepełny odczyt z numerem zgłoszenia", () => {
  const komentarze = Array.from({ length: 100 }, (_, i) => ({ author: { login: "konto-b" }, body: `Comment ${i}`, createdAt: "2026-11-02T10:00:00Z" }));
  const wynik = surowo(["--limit", String(LIMIT)], JSON.stringify([zgloszenie(60, "konto-a", "2026-11-01T10:00:00Z", komentarze)]));
  assert.equal(wynik.status, 3);
  assert.equal(wynik.stdout, "");
  assert.match(wynik.stderr, /odczyt niepełny[^\n]*#60\b/);
});

test("S17: 99 komentarzy jednego zgłoszenia to pełny odczyt", () => {
  const komentarze = Array.from({ length: 99 }, (_, i) => ({ author: { login: "konto-b" }, body: `Comment ${i}`, createdAt: "2026-11-02T10:00:00Z" }));
  assert.equal(uruchom([zgloszenie(61, "konto-a", "2026-11-01T10:00:00Z", komentarze)]).reszta[0].komentarze.length, 99);
});

test("S17: zgłoszenie z sygnałem globalnym za pierwszymi 200 pozycjami trafia do grupy najpierw", () => {
  const lista = wiele(250);
  lista[230] = zgloszenie(1230, "konto-a", "2026-11-01T10:00:00Z", [wystapienie("konto-b")]);
  const wynik = uruchom(lista);
  assert.deepEqual(numery(wynik.najpierw), [1230]);
  assert.equal(wynik.reszta.length, 249);
});

for (const [opis, argumenty] of [
  ["bez --limit", []],
  ["--limit bez liczby", ["--limit"]],
  ["--limit 0", ["--limit", "0"]],
  ["--limit w zapisie wykładniczym", ["--limit", "1e3"]],
  ["--limit szesnastkowo", ["--limit", "0x10"]],
]) {
  test(`S17: ${opis} — kod 2 bez wyniku`, () => {
    const wynik = surowo(argumenty, "[]");
    assert.equal(wynik.status, 2);
    assert.equal(wynik.stdout, "");
    assert.match(wynik.stderr, /sygnal-zgloszen: podaj --limit/);
  });
}
