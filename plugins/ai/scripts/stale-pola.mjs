// Rozpoznanie stałych pól zgłoszenia warsztatu (słownik → „Stałe pola”; skill retro, skrypty grup zgłoszeń).
// Użycie: node stale-pola.mjs [plik z treścią Issue]   (bez pliku — treść na stdin)
//         import { wStalychPolach } from './stale-pola.mjs'
// Wynik CLI (stdout, JSON): wStalychPolach — true, gdy treść zaczyna się nagłówkiem pola i ma wszystkie siedem
// nagłówków `### <pole>`, każdy raz, bez innych nagłówków trzeciego poziomu; pole może być puste.
// Brak odczytu wejścia → kod 2 i komunikat na stderr, bez wyniku.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Nagłówki stałych pól, po angielsku, jak w formularzu `process-report.yml` repozytorium warsztatu. */
export const STALE_POLA = [
  'Workshop version',
  'Agent and model',
  'Skill and step',
  'Kind',
  'Symptom',
  'Occurrences',
  'Proposed direction',
];

/** Nagłówek bez końcowych spacji i tabulatorów — liniowo, bez wyrażenia regularnego. */
function bezKoncowychSpacji(tekst) {
  let koniec = tekst.length;
  while (koniec > 0 && (tekst[koniec - 1] === ' ' || tekst[koniec - 1] === '\t')) koniec--;
  return tekst.slice(0, koniec);
}

/** Czy treść Issue jest w stałych polach. */
export function wStalychPolach(tresc) {
  const tekst = String(tresc).replace(/^﻿/, '');
  // Bez leniwego kwantyfikatora przed końcowymi spacjami: treść Issue jest cudza, a nawracanie byłoby kwadratowe.
  const dopasowania = [...tekst.matchAll(/^### ([^\r\n]*)/gm)];
  if (dopasowania.length === 0 || tekst.slice(0, dopasowania[0].index).trim() !== '') return false;
  const naglowki = dopasowania.map((n) => bezKoncowychSpacji(n[1]));
  return naglowki.length === STALE_POLA.length && STALE_POLA.every((pole) => naglowki.includes(pole));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [plik, ...nadmiar] = process.argv.slice(2);
  if (nadmiar.length > 0) {
    console.error('stale-pola: za dużo argumentów — podaj najwyżej jeden plik');
    process.exit(2);
  }
  let tresc;
  try {
    tresc = readFileSync(plik ?? 0, 'utf8');
  } catch (e) {
    console.error(`stale-pola: nie da się odczytać ${plik ?? 'stdin'}: ${e.code ?? e.message}`);
    process.exit(2);
  }
  console.log(JSON.stringify({ wStalychPolach: wStalychPolach(tresc) }));
}
