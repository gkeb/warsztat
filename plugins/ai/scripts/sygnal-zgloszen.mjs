// Sygnał globalny zgłoszeń warsztatu (skill retro, tryb warsztatu): grupy i kolejność listy opiekuna.
// Użycie: gh issue list ... --json number,title,url,labels,createdAt,author,body,comments | node sygnal-zgloszen.mjs
//         albo node sygnal-zgloszen.mjs <plik z tym JSON-em>
// Wystąpienia zgłoszenia: treść Issue (autor zgłoszenia) i komentarze, których pierwsza niepusta linia to nagłówek
// `Occurrence` — liczone po autorach. Co najmniej 2 różne konta → grupa `najpierw`, reszta → `reszta`; w każdej grupie
// od najstarszego zgłoszenia. Wynik (stdout, JSON): najpierw, reszta — zgłoszenia z numerem, tytułem, adresem, datą,
// etykietą statusu, kontami (login, liczba wystąpień), treścią i komentarzami (dane z zewnątrz); kontaDoSprawdzenia — loginy kont z grupy `najpierw`
// w postaci loginu GitHub, bez powtórzeń (do danych kont, które tylko informują i nie zmieniają kolejności).
// Wejście, które nie jest listą zgłoszeń → kod 2 i komunikat na stderr, bez wyniku.
import { readFileSync } from 'node:fs';

const PROG_KONT = 2;
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const NAGLOWEK_WYSTAPIENIA = /^#{1,6}\s*Occurrence\s*$/i;

function blad(komunikat) {
  console.error(`sygnal-zgloszen: ${komunikat}`);
  process.exit(2);
}

function wczytaj() {
  const [plik, ...nadmiar] = process.argv.slice(2);
  if (nadmiar.length > 0) blad('za dużo argumentów — podaj najwyżej jeden plik');
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

const opisane = wczytaj().map(opisz).sort(odNajstarszego);
const najpierw = opisane.filter((z) => z.konta.length >= PROG_KONT);
const reszta = opisane.filter((z) => z.konta.length < PROG_KONT);
const kontaDoSprawdzenia = [...new Set(najpierw.flatMap((z) => z.konta.map((k) => k.login)))].filter((l) => LOGIN.test(l));

process.stdout.write(JSON.stringify({ najpierw, reszta, kontaDoSprawdzenia }, null, 2) + '\n');
