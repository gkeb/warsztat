// Linki zgłoszenia warsztatu bez `gh` (skill retro, procedura `skills/retro/zgloszenie.md`).
// Użycie: node linki-zgloszenia.mjs --repo <właściciel/nazwa> --tytul <plik tytułu> --tresc <plik treści>
// Wynik (stdout, JSON): wyszukiwanie — link do wyszukiwania podobnych zgłoszeń, formularz — link do nowego
// Issue, trescWLinku — czy treść zmieściła się w linku formularza (false → link z samym tytułem, treść do
// wklejenia), dlugoscPelnego — długość pełnego linku z treścią, limit — największa dopuszczalna długość.
// Błędne argumenty → kod 2 i komunikat na stderr, bez linków.
import { readFileSync } from 'node:fs';

const LIMIT = 6000;
const ETYKIETY = '&labels=process-report,status:+new';
const REPOZYTORIUM = /^[A-Za-z0-9_.][A-Za-z0-9_.-]*\/[A-Za-z0-9_.-]+$/;

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

const { repo, tytul: plikTytulu, tresc: plikTresci } = argumenty(process.argv.slice(2));
// Segment `.` albo `..` zmieniłby ścieżkę linku po normalizacji adresu.
if (!REPOZYTORIUM.test(repo) || repo.split('/').some((s) => /^\.+$/.test(s))) blad(`repozytorium nie ma postaci właściciel/nazwa: ${repo}`);

const tytul = czytaj(plikTytulu).trim();
const tresc = czytaj(plikTresci);
if (!tytul || /[\r\n]/.test(tytul)) blad('tytuł musi być jedną niepustą linią');

const adres = `https://github.com/${repo}`;
// Wyszukiwanie po nazwie skilla z tytułu `[<skill>] …`: cały tytuł łączyłby słowa przez AND i zwykle nic nie znajdował.
const skill = /^\[([^\]]+)\]/.exec(tytul)?.[1] ?? tytul;
const wyszukiwanie = `${adres}/issues?q=${koduj(`is:issue label:process-report ${skill}`)}`;

const zTytulem = `${adres}/issues/new?title=${koduj(tytul)}`;
const pelny = `${zTytulem}&body=${koduj(tresc)}${ETYKIETY}`;
const trescWLinku = pelny.length <= LIMIT;

console.log(
  JSON.stringify(
    {
      wyszukiwanie,
      formularz: trescWLinku ? pelny : `${zTytulem}${ETYKIETY}`,
      trescWLinku,
      dlugoscPelnego: pelny.length,
      limit: LIMIT,
    },
    null,
    2,
  ),
);
