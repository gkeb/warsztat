// Hooki kodu (Claude Code i Codex):
//   node kod.mjs formatuj      — PostToolUse (Edit|Write|MultiEdit|apply_patch): formater projektu na zmienionym pliku.
//   node kod.mjs kontrola      — Stop: typy i lint zmienionych plików, zakazane wzorce z .ai/warsztat.json → hooki; potem dźwięk.
//   node kod.mjs dzwiek czeka  — PermissionRequest: dźwięk „czekam na zgodę”.
// Działa w każdym repozytorium, ale tylko narzędziami, które projekt już ma (node_modules, .venv, PATH) — niczego nie pobiera.
// Te same reguły stoją w bloku warsztatu w AGENTS.md, więc gdy hook nie działa (np. Codex bez zaufania), agent nadal je zna.
// Wyłączenie: WARSZTAT_HOOKI=0 (formatowanie i kontrola), WARSZTAT_DZWIEK=0 (dźwięk); w projekcie — klucz `hooki` w .ai/warsztat.json.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

const NA_WINDOWS = process.platform === 'win32';
const MAX_LINII_BLEDOW = 25;
const MAX_ZAKAZANYCH = 20;
const CZAS_FORMATERA = 30_000;
const CZAS_KONTROLI = 240_000;

const ROZSZERZENIA = {
  js: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.astro', '.css', '.scss', '.less', '.html'],
  ts: ['.ts', '.tsx', '.mts', '.cts'],
  py: ['.py', '.pyi'],
  rs: ['.rs'],
};

function czytaj(path) {
  try {
    return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return '';
  }
}

function uruchom(cmd, args, cwd, { czas = CZAS_KONTROLI, shell = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: czas, shell, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  // Brak narzędzia albo przekroczony czas: kontrola się nie odbyła, więc niczego nie zgłasza.
  if (r.error) return null;
  return { kod: r.status, wyjscie: `${r.stdout || ''}${r.stderr || ''}`.replace(/\r\n/g, '\n') };
}

// Pierwszy katalog od `start` w górę (najdalej do `koniec`), który spełnia warunek.
function wGore(start, koniec, czyPasuje) {
  let dir = start;
  for (;;) {
    if (czyPasuje(dir)) return dir;
    if (koniec && dir === koniec) return null;
    const wyzej = dirname(dir);
    if (wyzej === dir) return null;
    dir = wyzej;
  }
}

// Lokalny bin pakietu npm uruchamiany przez node — bez .cmd, który na Windowsie wymaga powłoki.
function binNode(pakiet, nazwa, start) {
  const dir = wGore(start, null, (d) => existsSync(join(d, 'node_modules', pakiet, 'package.json')));
  if (!dir) return null;
  const katalog = join(dir, 'node_modules', pakiet);
  let bin;
  try {
    bin = JSON.parse(czytaj(join(katalog, 'package.json'))).bin;
  } catch {
    return null;
  }
  const plik = typeof bin === 'string' ? bin : bin?.[nazwa];
  return plik ? { cmd: process.execPath, args: [join(katalog, plik)], cwd: dir } : null;
}

const dostepnosc = new Map();
function dostepny(cmd, args = ['--version']) {
  const klucz = [cmd, ...args].join(' ');
  if (!dostepnosc.has(klucz)) {
    const r = uruchom(cmd, args, process.cwd(), { czas: 15_000 });
    dostepnosc.set(klucz, r?.kod === 0);
  }
  return dostepnosc.get(klucz);
}

// Narzędzie Pythona: najpierw .venv/venv projektu, potem PATH.
function binPython(nazwa, start, koniec) {
  const dir = wGore(start, koniec, (d) => existsSync(join(d, '.venv')) || existsSync(join(d, 'venv')));
  for (const venv of dir ? ['.venv', 'venv'] : []) {
    const p = NA_WINDOWS ? join(dir, venv, 'Scripts', `${nazwa}.exe`) : join(dir, venv, 'bin', nazwa);
    if (existsSync(p)) return { cmd: p, args: [] };
  }
  return dostepny(nazwa) ? { cmd: nazwa, args: [] } : null;
}

function korzenRepo(cwd) {
  const r = uruchom('git', ['rev-parse', '--show-toplevel'], cwd, { czas: 15_000 });
  return r?.kod === 0 ? resolve(r.wyjscie.trim()) : null;
}

function konfiguracja(root) {
  let warsztat = {};
  try {
    warsztat = JSON.parse(czytaj(join(root, '.ai', 'warsztat.json')));
  } catch {
    // Projekt bez warsztatu: domyślnie formatowanie i kontrola automatyczna, bez zakazanych wzorców.
  }
  const hooki = warsztat.hooki || {};
  const chronione = warsztat.bezpieczenstwo?.chronione;
  return {
    formatowanie: hooki.formatowanie !== false,
    kontrola: hooki.kontrola ?? true,
    zakazane: Array.isArray(hooki.zakazane) ? hooki.zakazane : [],
    chronione: Array.isArray(chronione) ? chronione : CHRONIONE_DOMYSLNE,
  };
}

// Pliki z sekretami (jak `bezpieczenstwo.chronione` w szablonie warsztat.json): kontrola nie czyta ich treści.
const CHRONIONE_DOMYSLNE = [
  '.env', '.env.local', '.env.*.local', '.env.production', '.env.staging',
  '*.pem', '*.key', '*.p12', '*.pfx', 'id_rsa*', 'id_ed25519*',
  'secrets/**', 'credentials*.json', 'service-account*.json',
];

function wzgledna(root, p) {
  return relative(root, p).replace(/\\/g, '/');
}

// ---------- dźwięk ----------

function dzwiek(rodzaj) {
  if (process.env.WARSZTAT_DZWIEK === '0') return;
  const media = join(process.env.SystemRoot || 'C:\\Windows', 'Media');
  const pliki = {
    win32: { koniec: join(media, 'Windows Notify System Generic.wav'), czeka: join(media, 'Windows Exclamation.wav') },
    darwin: { koniec: '/System/Library/Sounds/Glass.aiff', czeka: '/System/Library/Sounds/Ping.aiff' },
    linux: { koniec: '/usr/share/sounds/freedesktop/stereo/complete.oga', czeka: '/usr/share/sounds/freedesktop/stereo/bell.oga' },
  }[process.platform];
  const plik = pliki?.[rodzaj];
  if (!plik || !existsSync(plik)) return;
  const [cmd, args] = NA_WINDOWS
    ? ['powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `(New-Object Media.SoundPlayer '${plik}').PlaySync()`]]
    : process.platform === 'darwin' ? ['afplay', [plik]] : ['paplay', [plik]];
  try {
    // Odłączony proces: hook kończy się od razu, dźwięk gra dalej.
    const p = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: true });
    p.on('error', () => {});
    p.unref();
  } catch {
    // Brak odtwarzacza nie jest błędem hooka.
  }
}

// ---------- formatowanie ----------

// Claude Code podaje tool_input.file_path; Codex przy apply_patch — tekst łatki w tool_input.command.
function sciezkiZWejscia(sesja) {
  const wejscie = sesja.tool_input || {};
  const cwd = sesja.cwd || process.cwd();
  const sciezki = [];
  if (typeof wejscie.file_path === 'string') sciezki.push(wejscie.file_path);
  const latka = [wejscie.command, wejscie.patch, wejscie.input]
    .map((v) => (Array.isArray(v) ? v.join('\n') : v))
    .filter((v) => typeof v === 'string')
    .join('\n');
  for (const m of latka.matchAll(/^\*\*\* (?:Add File|Update File|Move to): (.+)$/gm)) sciezki.push(m[1].trim());
  return [...new Set(sciezki.map((p) => resolve(cwd, p)))].filter((p) => existsSync(p) && statSync(p).isFile());
}

function formatujJs(plik) {
  const dir = dirname(plik);
  const biomeKonf = wGore(dir, null, (d) => existsSync(join(d, 'biome.json')) || existsSync(join(d, 'biome.jsonc')));
  const biome = biomeKonf && binNode('@biomejs/biome', 'biome', dir);
  if (biome) return uruchom(biome.cmd, [...biome.args, 'format', '--write', plik], biomeKonf, { czas: CZAS_FORMATERA });
  const prettier = binNode('prettier', 'prettier', dir);
  // Prettier sam respektuje .prettierignore względem katalogu roboczego.
  if (prettier) return uruchom(prettier.cmd, [...prettier.args, '--write', '--ignore-unknown', plik], prettier.cwd, { czas: CZAS_FORMATERA });
  return null;
}

function formatujPython(plik, koniec) {
  const dir = dirname(plik);
  const ruffKonf = wGore(dir, koniec, (d) =>
    existsSync(join(d, 'ruff.toml')) || existsSync(join(d, '.ruff.toml')) || /^\[tool\.ruff/m.test(czytaj(join(d, 'pyproject.toml'))),
  );
  const ruff = ruffKonf && binPython('ruff', dir, koniec);
  if (ruff) return uruchom(ruff.cmd, [...ruff.args, 'format', plik], ruffKonf, { czas: CZAS_FORMATERA });
  const blackKonf = wGore(dir, koniec, (d) => /^\[tool\.black\]/m.test(czytaj(join(d, 'pyproject.toml'))));
  const black = blackKonf && binPython('black', dir, koniec);
  if (black) return uruchom(black.cmd, [...black.args, '--quiet', plik], blackKonf, { czas: CZAS_FORMATERA });
  return null;
}

function formatujRust(plik) {
  const dir = dirname(plik);
  if (!wGore(dir, null, (d) => existsSync(join(d, 'Cargo.toml'))) || !dostepny('rustfmt')) return null;
  // Bez --edition rustfmt przyjmuje 2015 i nie parsuje nowszej składni; edycję bierze z Cargo.toml (także workspace).
  const zEdycja = wGore(dir, null, (d) => /^\s*edition\s*=\s*"\d{4}"/m.test(czytaj(join(d, 'Cargo.toml'))));
  const edycja = zEdycja && czytaj(join(zEdycja, 'Cargo.toml')).match(/^\s*edition\s*=\s*"(\d{4})"/m)[1];
  return uruchom('rustfmt', [...(edycja ? ['--edition', edycja] : []), plik], dir, { czas: CZAS_FORMATERA });
}

function formatuj(sesja) {
  const cwd = sesja.cwd || process.cwd();
  const root = korzenRepo(cwd) || resolve(cwd);
  if (!konfiguracja(root).formatowanie) return;
  for (const plik of sciezkiZWejscia(sesja)) {
    const ext = extname(plik).toLowerCase();
    // Formater, który nie przeszedł (np. błąd składni), milczy — błąd zgłosi kontrola na Stop.
    if (ROZSZERZENIA.js.includes(ext)) formatujJs(plik);
    else if (ROZSZERZENIA.py.includes(ext)) formatujPython(plik, root);
    else if (ROZSZERZENIA.rs.includes(ext)) formatujRust(plik);
  }
}

// ---------- kontrola ----------

// Zmienione pliki z `git status`: { sciezka, nowy } — nowy = nieśledzony, sprawdzany w całości.
function zmienionePliki(root) {
  const r = uruchom('git', ['-c', 'core.quotepath=off', 'status', '--porcelain', '-z', '--untracked-files=all'], root, { czas: 30_000 });
  if (r?.kod !== 0) return [];
  const wpisy = r.wyjscie.split('\0');
  const pliki = [];
  for (let i = 0; i < wpisy.length; i++) {
    const wpis = wpisy[i];
    if (wpis.length < 4) continue;
    const status = wpis.slice(0, 2);
    if (/[RC]/.test(status[0])) i++; // po nowej nazwie git podaje starą
    if (status.includes('D')) continue;
    const sciezka = resolve(root, wpis.slice(3));
    if (existsSync(sciezka) && statSync(sciezka).isFile()) pliki.push({ sciezka, nowy: status === '??' });
  }
  return pliki;
}

function grupujPoKonfiguracji(pliki, root, znacznik) {
  const grupy = new Map();
  for (const p of pliki) {
    const dir = wGore(dirname(p), root, (d) => existsSync(join(d, znacznik)));
    if (!dir) continue;
    if (!grupy.has(dir)) grupy.set(dir, []);
    grupy.get(dir).push(p);
  }
  return grupy;
}

function ogon(wyjscie, n = 30) {
  return wyjscie.trim().split('\n').slice(-n);
}

function kontrolaTs(pliki, root) {
  const wyniki = [];
  for (const dir of grupujPoKonfiguracji(pliki, root, 'tsconfig.json').keys()) {
    const tsc = binNode('typescript', 'tsc', dir);
    if (!tsc) continue;
    const r = uruchom(tsc.cmd, [...tsc.args, '--noEmit', '--pretty', 'false', '-p', dir], dir);
    if (!r || r.kod === 0) continue;
    let bledy = r.wyjscie.split('\n').filter((l) => /\berror TS\d+:/.test(l));
    bledy = bledy.map((l) => {
      const m = l.match(/^(.+?)(\(\d+,\d+\): error .*)$/);
      return m ? wzgledna(root, resolve(dir, m[1])) + m[2] : l;
    });
    wyniki.push({ narzedzie: `tsc (${wzgledna(root, dir) || '.'})`, bledy: bledy.length ? bledy : ogon(r.wyjscie) });
  }
  return wyniki;
}

function konfiguracjaPython(dir, root, sekcja, pliki) {
  return wGore(dir, root, (d) =>
    pliki.some((p) => existsSync(join(d, p))) || new RegExp(`^\\[tool\\.${sekcja}\\]`, 'm').test(czytaj(join(d, 'pyproject.toml'))),
  );
}

function kontrolaPython(pliki, root) {
  const wyniki = [];
  const wzgl = pliki.map((p) => wzgledna(root, p));
  const ruff = binPython('ruff', root, root);
  if (ruff) {
    // --no-fix: kontrola tylko czyta, nawet gdy projekt ma `fix = true`.
    const r = uruchom(ruff.cmd, [...ruff.args, 'check', '--no-fix', '--output-format', 'concise', ...wzgl], root);
    if (r && r.kod !== 0) {
      const bledy = r.wyjscie.split('\n').filter((l) => /^.+?:\d+:\d+: /.test(l));
      wyniki.push({ narzedzie: 'ruff check', bledy: bledy.length ? bledy : ogon(r.wyjscie) });
    }
  }
  const start = dirname(pliki[0]);
  const mypyKonf = konfiguracjaPython(start, root, 'mypy', ['mypy.ini', '.mypy.ini']);
  const mypy = mypyKonf && binPython('mypy', mypyKonf, root);
  if (mypy) {
    const r = uruchom(mypy.cmd, [...mypy.args, '--no-color-output', '--no-error-summary', ...pliki.map((p) => relative(mypyKonf, p))], mypyKonf);
    if (r && r.kod !== 0) {
      const bledy = r.wyjscie.split('\n').filter((l) => /: error:/.test(l));
      wyniki.push({ narzedzie: 'mypy', bledy: bledy.length ? bledy : ogon(r.wyjscie) });
    }
  }
  const pyrightKonf = konfiguracjaPython(start, root, 'pyright', ['pyrightconfig.json']);
  const pyright = pyrightKonf && (binPython('pyright', pyrightKonf, root) || binNode('pyright', 'pyright', pyrightKonf));
  if (pyright) {
    const r = uruchom(pyright.cmd, [...pyright.args, ...pliki], pyrightKonf);
    if (r && r.kod !== 0) {
      const bledy = r.wyjscie.split('\n').filter((l) => / - error: /.test(l)).map((l) => l.trim());
      wyniki.push({ narzedzie: 'pyright', bledy: bledy.length ? bledy : ogon(r.wyjscie) });
    }
  }
  return wyniki;
}

function kontrolaRust(pliki, root) {
  const wyniki = [];
  const zmienione = new Set(pliki.map((p) => p.toLowerCase()));
  const clippy = dostepny('cargo', ['clippy', '--version']);
  for (const dir of grupujPoKonfiguracji(pliki, root, 'Cargo.toml').keys()) {
    const r = uruchom('cargo', [clippy ? 'clippy' : 'check', '--all-targets', '--message-format=short', '--quiet'], dir);
    if (!r) continue;
    const bledy = [];
    for (const l of r.wyjscie.split('\n')) {
      const m = l.match(/^(.+?):(\d+:\d+: (error|warning)\b.*)$/);
      if (!m) continue;
      // Ścieżki cargo są względne do katalogu workspace, który może leżeć wyżej niż członek.
      const katalog = wGore(dir, root, (d) => existsSync(resolve(d, m[1]))) || dir;
      const sciezka = resolve(katalog, m[1]);
      // Ostrzeżenia tylko w plikach zmienionych teraz — stare ostrzeżenia nie blokują odpowiedzi.
      if (m[3] === 'warning' && !zmienione.has(sciezka.toLowerCase())) continue;
      bledy.push(`${wzgledna(root, sciezka)}:${m[2]}`);
    }
    if (bledy.length) wyniki.push({ narzedzie: `cargo ${clippy ? 'clippy' : 'check'} (${wzgledna(root, dir) || '.'})`, bledy });
    else if (r.kod !== 0) wyniki.push({ narzedzie: `cargo (${wzgledna(root, dir) || '.'})`, bledy: ogon(r.wyjscie) });
  }
  return wyniki;
}

function kontroleAuto(pliki, root) {
  const zRozszerzeniem = (lista) => pliki.map((p) => p.sciezka).filter((p) => lista.includes(extname(p).toLowerCase()));
  const ts = zRozszerzeniem(ROZSZERZENIA.ts);
  const py = zRozszerzeniem(ROZSZERZENIA.py);
  const rs = pliki.map((p) => p.sciezka).filter((p) => ROZSZERZENIA.rs.includes(extname(p).toLowerCase()) || basename(p) === 'Cargo.toml');
  return [
    ...(ts.length ? kontrolaTs(ts, root) : []),
    ...(py.length ? kontrolaPython(py, root) : []),
    ...(rs.length ? kontrolaRust(rs, root) : []),
  ];
}

function kontroleWlasne(komendy, root) {
  const wyniki = [];
  for (const komenda of komendy) {
    const r = uruchom(komenda, [], root, { shell: true });
    if (r && r.kod !== 0) wyniki.push({ narzedzie: komenda, bledy: ogon(r.wyjscie) });
  }
  return wyniki;
}

function globNaRegex(glob) {
  const zrodlo = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*\*/g, '\u0001')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\u0000/g, '(?:.*/)?')
    .replace(/\u0001/g, '.*');
  return new RegExp(`^${zrodlo}$`);
}

function pasuje(wzgl, globy) {
  // Wzorzec bez ukośnika dotyczy samej nazwy pliku w dowolnym katalogu (jak w .gitignore).
  return globy.some((g) => globNaRegex(g).test(g.includes('/') ? wzgl : wzgl.split('/').pop()));
}

// Chroniony także wtedy, gdy wzorzec z ukośnikiem (`secrets/**`) pasuje do głębiej położonego katalogu.
function chroniony(wzgl, chronione) {
  const czlony = wzgl.split('/');
  return czlony.some((_, i) => pasuje(czlony.slice(i).join('/'), chronione));
}

// Dodane linie: diff względem HEAD dla śledzonych, cała treść dla nowych (albo wszystkich, gdy nie ma jeszcze commita).
// Pliki chronione pomijamy — ich treść nie może trafić do komunikatu dla agenta.
function dodaneLinie(root, pliki, chronione) {
  const linie = [];
  const maHead = uruchom('git', ['rev-parse', '--verify', '--quiet', 'HEAD'], root, { czas: 15_000 })?.kod === 0;
  for (const { sciezka, nowy } of pliki) {
    if (chroniony(wzgledna(root, sciezka), chronione)) continue;
    if (nowy || !maHead) {
      if (statSync(sciezka).size > 1024 * 1024) continue;
      const tresc = czytaj(sciezka);
      if (tresc.includes('\0')) continue;
      tresc.split('\n').forEach((t, i) => linie.push({ plik: wzgledna(root, sciezka), nr: i + 1, tresc: t }));
    }
  }
  if (maHead) {
    const r = uruchom('git', ['-c', 'core.quotepath=off', 'diff', 'HEAD', '-U0', '--no-color', '--no-ext-diff'], root, { czas: 30_000 });
    let plik = null;
    let nr = 0;
    for (const l of r?.kod === 0 ? r.wyjscie.split('\n') : []) {
      if (l.startsWith('+++ ')) {
        plik = l === '+++ /dev/null' ? null : l.slice(6).replace(/\t$/, '');
        if (plik && chroniony(plik, chronione)) plik = null;
      }
      else if (l.startsWith('@@')) nr = Number(l.match(/\+(\d+)/)?.[1] || 0);
      else if (plik && l.startsWith('+')) linie.push({ plik, nr: nr++, tresc: l.slice(1) });
    }
  }
  return linie;
}

// Wpis: { "wzorzec": "console\\.(log|debug)", "pliki": ["*.ts", "*.tsx"], "pomin": ["**/*.test.ts"], "zamiast": "Sentry.captureException", "zasada": "Z07" }
function zakazaneWzorce(reguly, root, pliki, chronione) {
  const linie = dodaneLinie(root, pliki, chronione);
  const trafienia = [];
  for (const regula of reguly) {
    let wzorzec;
    try {
      wzorzec = new RegExp(regula.wzorzec);
    } catch {
      trafienia.push(`.ai/warsztat.json: niepoprawny wzorzec w hooki.zakazane: ${regula.wzorzec}`);
      continue;
    }
    const globy = regula.pliki?.length ? regula.pliki : ['*'];
    for (const l of linie) {
      if (!pasuje(l.plik, globy) || (regula.pomin?.length && pasuje(l.plik, regula.pomin)) || !wzorzec.test(l.tresc)) continue;
      const dopisek = [regula.zamiast && `zamiast: ${regula.zamiast}`, regula.zasada && `zasada ${regula.zasada}`].filter(Boolean).join(', ');
      trafienia.push(`${l.plik}:${l.nr}: ${l.tresc.trim()}${dopisek ? ` (${dopisek})` : ''}`);
    }
  }
  return trafienia;
}

// Odcisk zmienionych plików: kontrola rusza tylko wtedy, gdy od poprzedniej w tej sesji coś się zmieniło.
// Bez tego każda odpowiedź (także na samo pytanie) przy brudnym drzewie blokowałaby się od nowa.
function odcisk(pliki) {
  return pliki
    .map(({ sciezka }) => {
      const s = statSync(sciezka);
      return `${sciezka}:${s.mtimeMs}:${s.size}`;
    })
    .sort()
    .join('\n');
}

function plikStanu(sesja) {
  const id = String(sesja.session_id || 'bez-sesji').replace(/[^\w-]/g, '_');
  return join(tmpdir(), 'warsztat-hooki', `${id}.txt`);
}

function zapiszStan(plik, tresc) {
  try {
    mkdirSync(dirname(plik), { recursive: true });
    writeFileSync(plik, tresc);
  } catch {
    // Bez zapisu stanu kontrola po prostu uruchomi się ponownie.
  }
}

function przytnij(linie, max) {
  return linie.length > max ? [...linie.slice(0, max), `… i ${linie.length - max} więcej`] : linie;
}

function kontrola(sesja) {
  const cwd = sesja.cwd || process.cwd();
  const root = korzenRepo(cwd);
  if (!root || process.env.WARSZTAT_HOOKI === '0') return 'koniec';
  const konf = konfiguracja(root);
  const pliki = zmienionePliki(root);
  if (pliki.length === 0 || (konf.kontrola === false && konf.zakazane.length === 0)) return 'koniec';

  const stan = plikStanu(sesja);
  if (czytaj(stan) === odcisk(pliki)) return 'koniec';

  const bledy = konf.kontrola === false ? [] : Array.isArray(konf.kontrola) ? kontroleWlasne(konf.kontrola, root) : kontroleAuto(pliki, root);
  const zakazane = konf.zakazane.length ? zakazaneWzorce(konf.zakazane, root, pliki, konf.chronione) : [];
  // Odcisk po kontroli: narzędzia same zmieniają drzewo (np. cargo tworzy Cargo.lock).
  zapiszStan(stan, odcisk(zmienionePliki(root)));
  if (bledy.length === 0 && zakazane.length === 0) return 'koniec';

  const liczbaBledow = bledy.reduce((suma, b) => suma + b.bledy.length, 0);
  if (sesja.stop_hook_active) {
    // Blokujemy raz na odpowiedź — przy błędzie, z którym agent sobie nie radzi, sesja nie kręci się w kółko.
    const co = [liczbaBledow && `błędy kontroli: ${liczbaBledow}`, zakazane.length && `zakazane wzorce: ${zakazane.length}`].filter(Boolean).join(', ');
    process.stdout.write(JSON.stringify({ systemMessage: `[warsztat] Kontrola po odpowiedzi nadal czerwona (${co}). Hook nie blokuje drugi raz.` }));
    return 'koniec';
  }

  const tekst = ['[warsztat] Kontrola po odpowiedzi znalazła problemy w zmienionych plikach. Nie kończ jeszcze.'];
  if (liczbaBledow > 0) {
    let zostalo = MAX_LINII_BLEDOW;
    tekst.push('', `Kompilator, typy i linter (${liczbaBledow}):`);
    for (const b of bledy) {
      if (zostalo <= 0) break;
      const pokaz = b.bledy.slice(0, zostalo);
      zostalo -= pokaz.length;
      tekst.push(`[${b.narzedzie}]`, ...pokaz);
    }
    if (zostalo <= 0 && liczbaBledow > MAX_LINII_BLEDOW) tekst.push(`… i ${liczbaBledow - MAX_LINII_BLEDOW} więcej`);
    tekst.push(
      '',
      'Popraw je u źródła. Nie obchodź ich: bez `any`, `@ts-ignore`, `# type: ignore`, `# noqa`, `#[allow(...)]`, wyłączania reguł ani testów.',
      'Przy wielu błędach zacznij od pierwszych — kolejne często są tylko ich skutkiem.',
      'Błąd z listy `odniesienie.znane` w .ai/warsztat.json albo istniejący przed Twoją zmianą zostaw i powiedz o nim wprost. Jeśli nie da się poprawić — zatrzymaj się i opisz problem.',
    );
  }
  if (zakazane.length > 0) {
    tekst.push(
      '',
      `Zakazane wzorce w dodanych liniach (${zakazane.length}, hooki.zakazane w .ai/warsztat.json):`,
      ...przytnij(zakazane, MAX_ZAKAZANYCH),
      '',
      'Nie poprawiaj ich od razu: pokaż listę użytkownikowi i zapytaj, czy poprawić.',
    );
  }
  process.stdout.write(JSON.stringify({ decision: 'block', reason: tekst.join('\n') }));
  return null;
}

// ---------- wejście ----------

let wejscie = '';
if (!process.stdin.isTTY) {
  for await (const chunk of process.stdin) wejscie += chunk;
}
let sesja = {};
try {
  sesja = JSON.parse(wejscie);
} catch {
  // Ręczne uruchomienie bez JSON-a.
}

const tryb = process.argv[2];
try {
  if (tryb === 'formatuj' && process.env.WARSZTAT_HOOKI !== '0') formatuj(sesja);
  else if (tryb === 'kontrola') {
    const doZagrania = kontrola(sesja);
    if (doZagrania) dzwiek(doZagrania);
  } else if (tryb === 'dzwiek') dzwiek(process.argv[3] || 'koniec');
} catch (e) {
  // Błąd samego hooka nie może blokować pracy agenta — tylko krótka informacja na stderr.
  process.stderr.write(`[warsztat] hook kod.mjs ${tryb}: ${e?.message || e}\n`);
}
process.exitCode = 0;
