// Sygnał globalny zgłoszeń warsztatu (skill retro, tryb warsztatu): grupy i kolejność listy opiekuna.
// Użycie: gh issue list --state open ... --limit <n> --json number,title,url,labels,createdAt,author,body,comments | node sygnal-zgloszen.mjs --limit <n>
//         albo node sygnal-zgloszen.mjs --limit <n> <plik z tym JSON-em>
// Wejście to wszystkie otwarte Issues, bez filtra etykiety: zgłoszenia z etykietą `process-report`, zgłoszenia czekające
// na opiekuna (bez tej etykiety, w stałych polach — `stale-pola.mjs`) i pozostałe Issues, które skrypt tylko liczy.
// `--limit` to ta sama liczba co `--limit` w `gh issue list`. `gh` nie potwierdza końca listy (eksport bez `pageInfo`),
// a komentarzy jednego Issue pobiera najwyżej 100 (`comments(first: 100)`, gh 2.89) — liczba Issues równa limitowi
// albo 100 komentarzy jednego zgłoszenia (z etykietą albo czekającego) znaczy, że mogło być więcej: niepełny odczyt
// → kod 3 i komunikat na stderr, bez wyniku.
// Wystąpienia zgłoszenia: treść Issue (autor zgłoszenia) i komentarze, których pierwsza niepusta linia to nagłówek
// `Occurrence` — liczone po autorach. Co najmniej 2 różne konta → grupa `najpierw`, reszta → `reszta`; w każdej grupie
// od najstarszego zgłoszenia. Wynik (stdout, JSON): najpierw, reszta — zgłoszenia z numerem, tytułem, adresem, datą,
// etykietą statusu, kontami (login, liczba wystąpień), treścią i komentarzami (dane z zewnątrz); kontaDoSprawdzenia — loginy kont z grupy `najpierw`
// w postaci loginu GitHub, bez powtórzeń (do danych kont, które tylko informują i nie zmieniają kolejności);
// bezEtykiety — zgłoszenia czekające na opiekuna, od najstarszego, w tej samej postaci, poza kolejnością i sygnałem;
// pominiete — liczba Issues, które nie są zgłoszeniami (bez numerów i treści — retro ich nie pokazuje).
// Wejście, które nie jest listą zgłoszeń → kod 2 i komunikat na stderr, bez wyniku.
import { readFileSync } from 'node:fs';
import { wStalychPolach } from './stale-pola.mjs';

const PROG_KONT = 2;
const STRONA_KOMENTARZY = 100; // gh issue list --json comments: comments(first: 100), bez kolejnych stron
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAGLOWEK_WYSTAPIENIA = /^#{1,6}\s*Occurrence\s*$/i;
const ETYKIETA = 'process-report';

function blad(komunikat) {
  console.error(`sygnal-zgloszen: ${komunikat}`);
  process.exit(2);
}

function argumenty() {
  const reszta = process.argv.slice(2);
  const i = reszta.indexOf('--limit');
  const limit = i >= 0 && /^[0-9]+$/.test(reszta[i + 1] ?? '') ? Number(reszta[i + 1]) : NaN;
  if (!Number.isInteger(limit) || limit < 1) blad('podaj --limit <n> — tę samą liczbę co --limit w gh issue list');
  reszta.splice(i, 2);
  if (reszta.length > 1) blad('za dużo argumentów — podaj najwyżej jeden plik');
  return { limit, plik: reszta[0] };
}

function niepelny(komunikat) {
  console.error(`sygnal-zgloszen: odczyt niepełny — ${komunikat}`);
  process.exit(3);
}

function wczytaj(plik) {
  let tekst;
  try {
    tekst = readFileSync(plik ?? 0, 'utf8');
  } catch (e) {
    blad(`nie da się odczytać ${plik ?? 'stdin'}: ${e.code ?? e.message}`);
  }
  let dane;
  try {
    dane = JSON.parse(tekst);
  } catch {
    blad('wejście nie jest JSON-em');
  }
  if (!Array.isArray(dane)) blad('wejście nie jest listą zgłoszeń z gh issue list');
  if (dane.some((z) => z === null || typeof z !== 'object' || Array.isArray(z))) {
    blad('element listy nie jest zgłoszeniem z gh issue list');
  }
  return dane;
}

const login = (autor) => (typeof autor?.login === 'string' && autor.login !== '' ? autor.login : null);

function jestWystapieniem(komentarz) {
  const pierwsza = String(komentarz?.body ?? '')
    .split(/\r?\n/)
    .find((linia) => linia.trim() !== '');
  return pierwsza !== undefined && NAGLOWEK_WYSTAPIENIA.test(pierwsza.trim());
}

function opisz(zgloszenie) {
  const autorzy = [login(zgloszenie.author), ...(zgloszenie.comments ?? []).filter(jestWystapieniem).map((k) => login(k.author))];
  const konta = new Map();
  for (const autor of autorzy) if (autor !== null) konta.set(autor, (konta.get(autor) ?? 0) + 1);
  const status = (zgloszenie.labels ?? []).map((e) => e?.name).find((n) => typeof n === 'string' && n.startsWith('status:'));
  return {
    numer: zgloszenie.number,
    tytul: zgloszenie.title,
    url: zgloszenie.url,
    utworzone: zgloszenie.createdAt,
    status: status ?? null,
    konta: [...konta].map(([l, wystapienia]) => ({ login: l, wystapienia })),
    tresc: zgloszenie.body ?? '',
    komentarze: (zgloszenie.comments ?? []).map((k) => ({
      login: login(k.author),
      utworzony: k.createdAt,
      wystapienie: jestWystapieniem(k),
      tresc: k.body ?? '',
    })),
  };
}

// Daty ISO 8601 w UTC z `gh` porównują się jako tekst.
const porownaj = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const odNajstarszego = (a, b) => porownaj(String(a.utworzone), String(b.utworzone)) || porownaj(a.numer, b.numer);

const { limit, plik } = argumenty();
const zgloszenia = wczytaj(plik);
if (zgloszenia.length >= limit) {
  niepelny(`pobrano ${zgloszenia.length} otwartych Issues przy limicie ${limit}; zwiększ limit w obu poleceniach i odczytaj ponownie`);
}
const zEtykieta = zgloszenia.filter((z) => (z.labels ?? []).some((e) => e?.name === ETYKIETA));
const czekajace = zgloszenia.filter((z) => !zEtykieta.includes(z) && wStalychPolach(z.body ?? ''));
// Komentarze pominiętych Issues nie wchodzą do wyniku, więc ich ucięcie nie czyni odczytu niepełnym.
const uciete = [...zEtykieta, ...czekajace].filter((z) => (z.comments ?? []).length >= STRONA_KOMENTARZY).map((z) => `#${z.number}`);
if (uciete.length > 0) {
  niepelny(`zgłoszenia ${uciete.join(', ')} mają po ${STRONA_KOMENTARZY} pobranych komentarzy — gh issue list nie pobiera dalszych; sprawdź je w przeglądarce`);
}
const opisane = zEtykieta.map(opisz).sort(odNajstarszego);
const najpierw = opisane.filter((z) => z.konta.length >= PROG_KONT);
const reszta = opisane.filter((z) => z.konta.length < PROG_KONT);
const kontaDoSprawdzenia = [...new Set(najpierw.flatMap((z) => z.konta.map((k) => k.login)))].filter((l) => LOGIN.test(l));
const bezEtykiety = czekajace.map(opisz).sort(odNajstarszego);
const pominiete = zgloszenia.length - zEtykieta.length - czekajace.length;

process.stdout.write(JSON.stringify({ najpierw, reszta, kontaDoSprawdzenia, bezEtykiety, pominiete }, null, 2) + '\n');
