// Hook PreToolUse (Claude Code): referencje z .ai/warsztat.json → `referencje` są tylko do odczytu.
//   node referencje.mjs
// Odmawia narzędziom plikowym (Edit, Write, MultiEdit, NotebookEdit) zapisu w klonie referencji
// i poleceniom powłoki (Bash, PowerShell), które dotykają klonu, a nie są na liście tylko do odczytu.
// Kopiowanie Z referencji do projektu jest dozwolone. Rozpoznawanie jest ostrożne: lepiej odmówić
// i podać powód, niż przepuścić zapis. Deny `Edit(...)` w settings nie obejmuje powłoki, a piaskownica
// Claude Code nie działa na natywnym Windows — stąd ten hook. Reguła stoi też w bloku warsztatu w AGENTS.md.
// Projekt bez `referencje` w warsztat.json: hook nic nie robi.
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// ---------- ścieżki ----------

// Jedna postać ścieżki do porównań: `/` zamiast `\`, `/c/...` (Git Bash) jako `c:/...`,
// mała litera dysku i całość małymi literami dla ścieżek z dyskiem (Windows nie rozróżnia wielkości).
export function normalizuj(p) {
  let s = String(p || '').replace(/\\/g, '/');
  const bash = /^\/([a-zA-Z])(\/|$)/.exec(s);
  if (bash) s = `${bash[1]}:/${s.slice(3)}`;
  s = s.replace(/\/+/g, '/');
  if (/^[a-zA-Z]:/.test(s)) s = s.toLowerCase();
  if (s.length > 1 && s.endsWith('/') && !/^[a-z]:\/$/.test(s)) s = s.slice(0, -1);
  return s;
}

function bezwzgledna(p, cwd) {
  const s = String(p).replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(s) || /^\/[a-zA-Z](\/|$)/.test(s) || isAbsolute(s)) return normalizuj(s);
  return normalizuj(resolve(cwd, s));
}

function wSrodku(sciezka, ref) {
  return sciezka === ref || sciezka.startsWith(`${ref}/`);
}

// Słowo dotyka referencji, gdy jako ścieżka (względem cwd) leży w klonie albo zawiera ścieżkę klonu
// z granicą (np. `--dir=C:/ref/x`, `"cat C:/ref/x"` w `bash -c`).
export function dotykaReferencji(slowo, cwd, refs) {
  if (!slowo) return null;
  const kandydaci = [slowo];
  const rowne = slowo.indexOf('=');
  if (rowne > 0) kandydaci.push(slowo.slice(rowne + 1));
  for (const ref of refs) {
    for (const k of kandydaci) {
      if (k && !k.startsWith('-') && wSrodku(bezwzgledna(k, cwd), ref.sciezka)) return ref;
      const n = normalizuj(k).toLowerCase();
      const i = n.indexOf(ref.sciezka);
      if (i >= 0) {
        const po = n[i + ref.sciezka.length];
        if (po === undefined || /[/"'\s;)]/.test(po)) return ref;
      }
    }
  }
  return null;
}

// ---------- polecenia ----------

// Dzieli polecenie na segmenty (&&, ||, ;, |, &, nowa linia) i słowa, z cudzysłowami.
// Przekierowania `>`/`>>` (z numerem deskryptora) zapisuje osobno jako cele zapisu; `2>&1` pomija.
// Odwrotny ukośnik jest zwykłym znakiem — w ścieżkach Windows ważniejszy niż ucieczka w bashu.
export function segmenty(polecenie) {
  const wynik = [];
  let seg = { slowa: [], przekierowania: [] };
  let slowo = '';
  let maSlowo = false;
  let cel = false;
  let cudzyslow = null;
  const zamknijSlowo = () => {
    if (!maSlowo) return;
    if (cel) seg.przekierowania.push(slowo);
    else seg.slowa.push(slowo);
    slowo = '';
    maSlowo = false;
    cel = false;
  };
  const zamknijSegment = () => {
    zamknijSlowo();
    cel = false;
    if (seg.slowa.length || seg.przekierowania.length) wynik.push(seg);
    seg = { slowa: [], przekierowania: [] };
  };
  const s = String(polecenie || '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (cudzyslow) {
      if (c === cudzyslow) cudzyslow = null;
      else slowo += c;
      continue;
    }
    if (c === '"' || c === "'") {
      cudzyslow = c;
      maSlowo = true;
      continue;
    }
    if (c === '>') {
      if (maSlowo && /^\d$/.test(slowo)) {
        slowo = '';
        maSlowo = false;
      } else zamknijSlowo();
      if (s[i + 1] === '>' || s[i + 1] === '|') i++;
      if (s[i + 1] === '&') {
        // >&2, 2>&1 — przekierowanie deskryptora, nie plik.
        i++;
        while (/\d|-/.test(s[i + 1] || '')) i++;
        continue;
      }
      cel = true;
      continue;
    }
    if (c === '<') {
      zamknijSlowo();
      continue;
    }
    if (c === '&' && s[i + 1] === '>') {
      zamknijSlowo();
      i++;
      if (s[i + 1] === '>') i++;
      cel = true;
      continue;
    }
    if (c === ';' || c === '\n' || c === '\r' || c === '|' || c === '&') {
      if ((c === '|' || c === '&') && s[i + 1] === c) i++;
      zamknijSegment();
      continue;
    }
    if (c === ' ' || c === '\t') {
      zamknijSlowo();
      continue;
    }
    slowo += c;
    maSlowo = true;
  }
  zamknijSegment();
  return wynik;
}

const TYLKO_ODCZYT = new Set([
  // powłoki uniksowe
  'cat', 'head', 'tail', 'less', 'more', 'ls', 'dir', 'tree', 'find', 'grep', 'egrep', 'fgrep', 'rg', 'ag',
  'wc', 'file', 'stat', 'du', 'diff', 'cmp', 'sha256sum', 'sha1sum', 'md5sum', 'sort', 'uniq', 'cut', 'awk',
  'sed', 'jq', 'xxd', 'hexdump', 'od', 'strings', 'realpath', 'readlink', 'basename', 'dirname', 'pwd',
  'echo', 'printf', 'test', '[', 'true', 'nl', 'column', 'tac', 'rev', 'type', 'cd', 'pushd', 'popd',
  // PowerShell
  'get-content', 'gc', 'get-childitem', 'gci', 'select-string', 'sls', 'test-path', 'get-item', 'gi',
  'resolve-path', 'rvpa', 'get-filehash', 'measure-object', 'measure', 'select-object', 'select',
  'where-object', 'where', 'sort-object', 'format-list', 'fl', 'format-table', 'ft', 'out-string',
  'write-output', 'write-host', 'split-path', 'join-path', 'get-location', 'gl', 'compare-object',
  'set-location', 'sl', 'push-location', 'pop-location',
]);

const GIT_TYLKO_ODCZYT = new Set([
  'log', 'show', 'diff', 'status', 'ls-files', 'ls-tree', 'rev-parse', 'rev-list', 'blame', 'grep',
  'cat-file', 'describe', 'shortlog', 'name-rev', 'for-each-ref', 'show-ref', 'merge-base', 'help', 'version',
]);
const GIT_LISTA = new Set(['branch', 'tag', 'remote', 'config', 'worktree', 'stash']);
const GIT_LISTA_FLAGI = /^(-a|-r|-v|-vv|-l|--list|--all|--verbose|--show-current|--get|--get-all|--list|-n\d*)$/;
const GIT_OPCJE_Z_WARTOSCIA = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

const KOPIOWANIE = new Set(['cp', 'copy', 'copy-item', 'cpi', 'robocopy', 'xcopy', 'rsync']);

function nazwaPolecenia(slowo) {
  return basename(String(slowo).replace(/\\/g, '/')).toLowerCase().replace(/\.(exe|cmd|bat|ps1)$/, '');
}

// Wynik dla jednego segmentu: null (dozwolony) albo { ref, powod }.
function ocenSegment(seg, stan, refs) {
  const slowa = [...seg.slowa];
  while (slowa.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(slowa[0])) slowa.shift();
  const cwdRef = refs.find((r) => wSrodku(normalizuj(stan.cwd), r.sciezka)) || null;

  for (const cel of seg.przekierowania) {
    const ref = dotykaReferencji(cel, stan.cwd, refs);
    if (ref) return { ref, powod: `przekierowanie zapisuje w referencji (${cel})` };
  }
  if (!slowa.length) return null;

  const cmd = nazwaPolecenia(slowa[0]);
  const argumenty = slowa.slice(1);

  // Zmiana katalogu wpływa na kolejne segmenty tego samego polecenia.
  if (['cd', 'pushd', 'set-location', 'sl', 'push-location'].includes(cmd)) {
    const cel = argumenty.find((a) => !a.startsWith('-'));
    if (cel) stan.cwd = bezwzgledna(cel, stan.cwd);
    return null;
  }

  if (cmd === 'git') {
    let cwdGita = stan.cwd;
    let i = 0;
    while (i < argumenty.length && argumenty[i].startsWith('-')) {
      const a = argumenty[i];
      if (a === '-C' && argumenty[i + 1]) cwdGita = bezwzgledna(argumenty[i + 1], cwdGita);
      if (GIT_OPCJE_Z_WARTOSCIA.has(a)) i += 2;
      else i += 1;
    }
    const pod = (argumenty[i] || '').toLowerCase();
    const reszta = argumenty.slice(i + 1);
    const ref =
      refs.find((r) => wSrodku(normalizuj(cwdGita), r.sciezka)) ||
      argumenty.map((a) => dotykaReferencji(a, stan.cwd, refs)).find(Boolean) ||
      null;
    if (!ref) return null;
    if (GIT_TYLKO_ODCZYT.has(pod)) return null;
    if (GIT_LISTA.has(pod) && reszta.every((a) => GIT_LISTA_FLAGI.test(a))) return null;
    return { ref, powod: `git ${pod || ''} zmienia klon albo nie jest na liście poleceń tylko do odczytu`.trim() };
  }

  const dotkniete = argumenty.map((a) => dotykaReferencji(a, stan.cwd, refs)).find(Boolean) || cwdRef;
  if (!dotkniete) return null;

  if (KOPIOWANIE.has(cmd)) {
    const pozycyjne = [];
    let cel = null;
    for (let i = 0; i < argumenty.length; i++) {
      const a = argumenty[i];
      if (/^-destination$/i.test(a)) {
        cel = argumenty[i + 1];
        i++;
      } else if (/^-(path|literalpath)$/i.test(a)) {
        pozycyjne.push(argumenty[i + 1]);
        i++;
      } else if (!a.startsWith('-') && !(cmd === 'robocopy' && a.startsWith('/'))) pozycyjne.push(a);
    }
    if (!cel) cel = cmd === 'robocopy' || cmd === 'copy-item' || cmd === 'cpi' ? pozycyjne[1] : pozycyjne.at(-1);
    if (cel && !wSrodku(bezwzgledna(cel, stan.cwd), dotkniete.sciezka) && !dotykaReferencji(cel, stan.cwd, [dotkniete])) return null;
    return { ref: dotkniete, powod: 'kopiowanie do referencji' };
  }

  if (TYLKO_ODCZYT.has(cmd)) {
    if (cmd === 'sed' && argumenty.some((a) => /^-[a-zA-Z]*i|^--in-place/.test(a))) return { ref: dotkniete, powod: 'sed -i zmienia plik' };
    if (cmd === 'awk' && argumenty.some((a) => /inplace/.test(a))) return { ref: dotkniete, powod: 'awk -i inplace zmienia plik' };
    if (cmd === 'find' && argumenty.some((a) => /^-(delete|exec|execdir|ok|okdir|fprint\w*|fls)$/.test(a)))
      return { ref: dotkniete, powod: 'find z akcją zmieniającą pliki' };
    return null;
  }

  return { ref: dotkniete, powod: `polecenie ${cmd} nie jest na liście poleceń tylko do odczytu` };
}

export function ocenPolecenie(polecenie, cwd, refs) {
  const stan = { cwd };
  for (const seg of segmenty(polecenie)) {
    const wynik = ocenSegment(seg, stan, refs);
    if (wynik) return { ...wynik, segment: [...seg.slowa, ...seg.przekierowania.map((p) => `> ${p}`)].join(' ') };
  }
  return null;
}

const NARZEDZIA_PLIKOWE = { Edit: 'file_path', Write: 'file_path', MultiEdit: 'file_path', NotebookEdit: 'notebook_path' };
const POWLOKI = new Set(['Bash', 'PowerShell']);

// Ocena wywołania narzędzia: null (dozwolone) albo { ref, powod, segment? }.
export function ocen(sesja, refs) {
  const cwd = sesja.cwd || process.cwd();
  const narzedzie = sesja.tool_name;
  const wejscie = sesja.tool_input || {};
  if (NARZEDZIA_PLIKOWE[narzedzie]) {
    const plik = wejscie[NARZEDZIA_PLIKOWE[narzedzie]];
    if (!plik) return null;
    const ref = refs.find((r) => wSrodku(bezwzgledna(plik, cwd), r.sciezka));
    return ref ? { ref, powod: `${narzedzie} zapisuje w referencji (${plik})` } : null;
  }
  if (POWLOKI.has(narzedzie)) {
    const polecenie = Array.isArray(wejscie.command) ? wejscie.command.join(' ') : wejscie.command;
    return polecenie ? ocenPolecenie(polecenie, cwd, refs) : null;
  }
  return null;
}

// ---------- konfiguracja ----------

function korzenWarsztatu(cwd) {
  let dir = resolve(cwd);
  for (;;) {
    if (existsSync(join(dir, '.ai', 'warsztat.json'))) return dir;
    const wyzej = dirname(dir);
    if (wyzej === dir) return null;
    dir = wyzej;
  }
}

export function referencjeProjektu(cwd) {
  const root = korzenWarsztatu(cwd);
  if (!root) return [];
  let warsztat;
  try {
    warsztat = JSON.parse(readFileSync(join(root, '.ai', 'warsztat.json'), 'utf8'));
  } catch {
    return [];
  }
  const lista = Array.isArray(warsztat.referencje) ? warsztat.referencje : [];
  return lista
    .filter((r) => r && typeof r.sciezka === 'string' && r.sciezka.trim())
    .map((r) => ({ nazwa: String(r.nazwa || r.sciezka), sciezka: normalizuj(r.sciezka.trim()) }))
    .filter((r) => /^[a-z]:\/./.test(r.sciezka) || r.sciezka.startsWith('/'));
}

// ---------- wejście ----------

async function main() {
  let wejscie = '';
  if (!process.stdin.isTTY) {
    for await (const chunk of process.stdin) wejscie += chunk;
  }
  let sesja = {};
  try {
    sesja = JSON.parse(wejscie);
  } catch {
    return;
  }
  const refs = referencjeProjektu(sesja.cwd || process.cwd());
  if (!refs.length) return;
  const wynik = ocen(sesja, refs);
  if (!wynik) return;
  const powod = [
    `[warsztat] Referencja „${wynik.ref.nazwa}” (${wynik.ref.sciezka}) jest tylko do odczytu: ${wynik.powod}.`,
    wynik.segment ? `Polecenie: ${wynik.segment}` : null,
    'Czytaj narzędziami Read, Grep i Glob albo poleceniami tylko do odczytu (git log/show, cat, ls); kopiuj z referencji do projektu, nie odwrotnie.',
    'Nie obchodź tej blokady. Jeśli zapis w klonie jest naprawdę potrzebny (np. pobranie nowszej wersji), powiedz to użytkownikowi — wykona go sam.',
  ]
    .filter(Boolean)
    .join('\n');
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: powod } }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (e) {
    // Błąd hooka nie blokuje pracy; reguła w AGENTS.md obowiązuje dalej.
    process.stderr.write(`[warsztat] hook referencje.mjs: ${e?.message || e}\n`);
  }
  process.exitCode = 0;
}
