// Linki zgłoszenia warsztatu bez `gh` (skill retro, procedura `skills/retro/zgloszenie.md`).
// Użycie: node linki-zgloszenia.mjs --repo <właściciel/nazwa> --tytul <plik tytułu> --tresc <plik treści>
// Wynik (stdout, JSON): wyszukiwanie — link do wyszukiwania podobnych zgłoszeń, formularz — link do formularza
// zgłoszenia (`process-report.yml`) z tytułem i polami szkicu, trescWLinku — czy treść jest w linku (false → link
// z samym tytułem, treść do wklejenia), dlugoscPelnego — długość pełnego linku z polami (null, gdy treść nie składa
// się wyłącznie z pól formularza), limit — największa dopuszczalna długość.
// Błędne argumenty → kod 2 i komunikat na stderr, bez linków.
import { readFileSync } from 'node:fs';

const LIMIT = 6000;
const SZABLON = 'process-report.yml';
const REPOZYTORIUM = /^[A-Za-z0-9_.][A-Za-z0-9_.-]*\/[A-Za-z0-9_.-]+$/;
// Pola szkicu (`### <pole>`) i `id` pól formularza `.github/ISSUE_TEMPLATE/process-report.yml` repozytorium warsztatu.
// Formularz wypełnia się z linku po `id`, nie parametrem `body`; etykiety nadaje sam formularz.
const POLA = new Map([
  ['Workshop version', 'workshop-version'],
  ['Agent and model', 'agent-and-model'],
  ['Skill and step', 'skill-and-step'],
  ['Kind', 'kind'],
  ['Symptom', 'symptom'],
  ['Occurrences', 'occurrences'],
  ['Proposed direction', 'proposed-direction'],
]);

// encodeURIComponent zostawia `!'()*`; nawias zamykający kończy link w markdownie `[…](url)`, więc kodujemy i je.
const koduj = (tekst) =>
  encodeURIComponent(tekst).replace(/[!'()*]/g, (z) => `%${z.charCodeAt(0).toString(16).toUpperCase()}`);

function blad(komunikat) {
  console.error(`linki-zgloszenia: ${komunikat}`);
  process.exit(2);
}

function argumenty(lista) {
  const wynik = {};
  for (let i = 0; i < lista.length; i += 2) {
    const klucz = lista[i];
    if (!['--repo', '--tytul', '--tresc'].includes(klucz) || lista[i + 1] === undefined) {
      blad(`nieznany albo niepełny argument: ${klucz}`);
    }
    wynik[klucz.slice(2)] = lista[i + 1];
  }
  for (const klucz of ['repo', 'tytul', 'tresc']) if (wynik[klucz] === undefined) blad(`brak --${klucz}`);
  return wynik;
}

function czytaj(plik) {
  try {
    return readFileSync(plik, 'utf8').replace(/^﻿/, '');
  } catch (e) {
    blad(`nie da się odczytać ${plik}: ${e.code ?? e.message}`);
  }
}

/** Wartości pól szkicu po `id` formularza; null, gdy treść ma coś poza znanymi polami albo pole się powtarza. */
function polaSzkicu(tresc) {
  const naglowki = [...tresc.matchAll(/^### ([^\r\n]*?)[ \t]*\r?$/gm)];
  if (naglowki.length === 0 || tresc.slice(0, naglowki[0].index).trim()) return null;
  const wartosci = new Map();
  for (const [i, naglowek] of naglowki.entries()) {
    const id = POLA.get(naglowek[1]);
    if (id === undefined || wartosci.has(id)) return null;
    const koniec = naglowki[i + 1]?.index ?? tresc.length;
    wartosci.set(id, tresc.slice(naglowek.index + naglowek[0].length, koniec).trim());
  }
  return [...POLA.values()].filter((id) => wartosci.has(id)).map((id) => [id, wartosci.get(id)]);
}

const { repo, tytul: plikTytulu, tresc: plikTresci } = argumenty(process.argv.slice(2));
// Segment `.` albo `..` zmieniłby ścieżkę linku po normalizacji adresu.
if (!REPOZYTORIUM.test(repo) || repo.split('/').some((s) => /^\.+$/.test(s))) blad(`repozytorium nie ma postaci właściciel/nazwa: ${repo}`);

const tytul = czytaj(plikTytulu).trim();
const tresc = czytaj(plikTresci);
if (!tytul || /[\r\n]/.test(tytul)) blad('tytuł musi być jedną niepustą linią');

const adres = `https://github.com/${repo}`;
// Wyszukiwanie po nazwie skilla z tytułu `[<skill>] …`: cały tytuł łączyłby słowa przez AND i zwykle nic nie znajdował.
// Bez filtra etykiety: Issue z konta, które nie może nadawać etykiet, czeka bez niej na opiekuna. Zawęża fraza nagłówka
// stałego pola, którą ma każde zgłoszenie, z etykietą albo bez.
const skill = /^\[([^\]]+)\]/.exec(tytul)?.[1] ?? tytul;
const wyszukiwanie = `${adres}/issues?q=${koduj(`is:issue "Skill and step" ${skill}`)}`;

const zTytulem = `${adres}/issues/new?template=${SZABLON}&title=${koduj(tytul)}`;
const pola = polaSzkicu(tresc);
const pelny = pola && `${zTytulem}${pola.map(([id, wartosc]) => `&${id}=${koduj(wartosc)}`).join('')}`;
const trescWLinku = pelny !== null && pelny.length <= LIMIT;

console.log(
  JSON.stringify(
    {
      wyszukiwanie,
      formularz: trescWLinku ? pelny : zTytulem,
      trescWLinku,
      dlugoscPelnego: pelny?.length ?? null,
      limit: LIMIT,
    },
    null,
    2,
  ),
);
