// Usunięte i zmienione asercje w plikach testów dla zakresu gita (przeglad, weryfikuj).
// Użycie: node usuniete-asercje.mjs <korzeń projektu> [zakres]
//   zakres: `a..b`, pojedynczy commit albo brak (zmiany względem HEAD, z indeksem).
// Wynik jest faktem dla recenzenta, nie werdyktem: każdą pozycję trzeba zaklasyfikować
// jako zastąpioną równoważną lub mocniejszą, przeniesioną albo osłabioną.
import { execFileSync } from 'node:child_process';

const [root = process.cwd(), zakres] = process.argv.slice(2);

const PLIK_TESTU =
  /(^|\/)(tests?|__tests__|spec|specs)\/|(^|\/)test_[^/]*\.py$|_test\.(py|go|rs)$|\.(test|spec)\.[cm]?[jt]sx?$/;
const ASERCJA =
  /\bassert\w*|\bexpect\s*\(|\.should\b|\braises\b|\.to(Be|Equal|Throw|Match|Contain|Have)\w*|\brequire\.\w+\(|\bt\.(Error|Fatal)\w*\(/;

function diff() {
  const args = ['diff', '-U0', '--no-color', '--no-ext-diff', '--no-renames'];
  if (!zakres) args.push('HEAD');
  else if (zakres.includes('..')) args.push(zakres);
  else args.push(`${zakres}^`, zakres);
  try {
    return execFileSync('git', [...args, '--'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    console.error(`Nie udało się odczytać diffu: ${e.message.split('\n')[0]}`);
    process.exit(2);
  }
}

const pozycje = [];
let plik = null;
let linia = 0;
let fragment = null;

for (const wiersz of diff().replace(/\r\n/g, '\n').split('\n')) {
  if (wiersz.startsWith('--- ')) {
    const sciezka = wiersz.slice(4);
    plik = sciezka === '/dev/null' ? null : sciezka.replace(/^a\//, '');
    continue;
  }
  if (wiersz.startsWith('+++ ')) {
    if (!plik) plik = wiersz.slice(4).replace(/^b\//, '');
    continue;
  }
  const naglowek = wiersz.match(/^@@ -(\d+)(?:,\d+)? \+\d+(?:,\d+)? @@/);
  if (naglowek) {
    linia = Number(naglowek[1]);
    fragment = { usuniete: [], dodane: [] };
    continue;
  }
  if (!fragment || !plik || !PLIK_TESTU.test(plik)) continue;
  if (wiersz.startsWith('-')) {
    if (ASERCJA.test(wiersz)) {
      const pozycja = { plik, linia, tekst: wiersz.slice(1).trim(), dodane: fragment.dodane };
      fragment.usuniete.push(pozycja);
      pozycje.push(pozycja);
    }
    linia += 1;
  } else if (wiersz.startsWith('+')) {
    fragment.dodane.push(wiersz.slice(1).trim());
  }
}

const opisZakresu = zakres || 'zmiany względem HEAD';
if (!pozycje.length) {
  console.log(`Usunięte lub zmienione asercje w testach (${opisZakresu}): brak`);
  process.exit(0);
}
console.log(`Usunięte lub zmienione asercje w testach (${opisZakresu}): ${pozycje.length}`);
for (const p of pozycje) {
  console.log(`- ${p.plik}:${p.linia} było: ${p.tekst}`);
  const zamiast = p.dodane.filter((d) => d);
  if (zamiast.length) {
    for (const d of zamiast.slice(0, 5)) console.log(`    w tym fragmencie dodano: ${d}`);
    if (zamiast.length > 5) console.log(`    … i ${zamiast.length - 5} więcej linii`);
  } else {
    console.log('    w tym fragmencie nic nie dodano');
  }
}
console.log('Każdą pozycję zaklasyfikuj: zastąpiona równoważną lub mocniejszą / przeniesiona (gdzie) / osłabiona.');
