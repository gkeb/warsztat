// SessionStart (Claude Code i Codex): wstrzykuje stan .ai/ bieżącego projektu.
// Projekt bez .ai/ROADMAP.md → brak wyjścia, żeby nie śmiecić w innych repozytoriach.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_LINII_STANU_SESJI = 12;

let hookInput = '';
if (!process.stdin.isTTY) {
  for await (const chunk of process.stdin) hookInput += chunk;
}

let session = {};
try {
  session = JSON.parse(hookInput);
} catch {
  // Ręczne uruchomienie poza hookiem może nie mieć wejścia JSON.
}

const root = session.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const ai = join(root, '.ai');
const roadmapPath = join(ai, 'ROADMAP.md');

if (!existsSync(roadmapPath)) process.exit(0);

function czytaj(path) {
  try {
    return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return '';
  }
}

let warsztat = {};
try {
  warsztat = JSON.parse(czytaj(join(ai, 'warsztat.json')));
} catch {
  // Brak lub niepoprawny plik: zachowaj domyślne, zalecane przypomnienie.
}
const drugaOpiniaWlaczona = warsztat.weryfikacja?.drugaOpinia !== 'wylaczona';
const innyModelWymagany = warsztat.weryfikacja?.innyModel !== false;

// Treść sekcji `## tytuł` bez komentarzy HTML i pustych linii.
function sekcja(md, tytul) {
  const linie = md.split('\n');
  const start = linie.findIndex(
    (l) => /^##\s+/.test(l) && l.replace(/^##\s+/, '').trim().toLowerCase() === tytul.toLowerCase(),
  );
  if (start < 0) return '';
  const tresc = [];
  for (const l of linie.slice(start + 1)) {
    if (/^##\s/.test(l)) break;
    tresc.push(l);
  }
  return tresc
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .filter((l) => l.trim() !== '')
    .join('\n');
}

function statusyTicketow(slug) {
  const dir = join(ai, 'zdolnosci', slug, 'tickety');
  if (!existsSync(dir)) return null;
  const liczniki = {};
  for (const plik of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const m = czytaj(join(dir, plik)).match(/^status:\s*([\w-]+)/m);
    const status = m ? m[1] : 'bez-statusu';
    liczniki[status] = (liczniki[status] || 0) + 1;
  }
  return liczniki;
}

// Kto budował zdolność: unikalne wartości pola `budowal` z ticketów.
function budujacy(slug) {
  const dir = join(ai, 'zdolnosci', slug, 'tickety');
  if (!existsSync(dir)) return [];
  const wartosci = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => czytaj(join(dir, f)).match(/^budowal:\s*"?([^"\n]+?)"?\s*$/m)?.[1])
    .filter((b) => b && b !== 'null');
  return [...new Set(wartosci)];
}

function opisTicketow(liczniki) {
  if (!liczniki) return null;
  const aktywne = Object.entries(liczniki).filter(([s]) => s !== 'porzucony');
  const wszystkie = aktywne.reduce((suma, [, n]) => suma + n, 0);
  if (wszystkie === 0) return null;
  const reszta = aktywne
    .filter(([s]) => s !== 'zrobione')
    .map(([s, n]) => `${n} ${s}`)
    .join(', ');
  return `tickety ${liczniki.zrobione || 0}/${wszystkie} zrobione${reszta ? ` (${reszta})` : ''}`;
}

// Przerwana praca poza zdolnościami: .ai/sesje/*.md, pierwsza niepusta linia jako temat.
function otwarteSesje() {
  const dir = join(ai, 'sesje');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const temat = czytaj(join(dir, f)).split('\n').find((l) => l.trim() !== '') || '';
      return `- sesje/${f} — ${temat.replace(/^#+\s*/, '').trim()}`;
    });
}

const roadmap = czytaj(roadmapPath);
const teraz = sekcja(roadmap, 'Teraz');
const wyjscie = ['[warsztat] Stan projektu z .ai/ (pełny obraz: skill gdzie)', ''];

if (!teraz) {
  wyjscie.push('Teraz: nic w locie. Wybierz coś z Dalej (skill gdzie) albo zacznij od skill pomysl.');
} else {
  wyjscie.push('Teraz:', teraz);
  const slugi = [...new Set([...teraz.matchAll(/zdolnosci\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  for (const slug of slugi) {
    const mapa = czytaj(join(ai, 'zdolnosci', slug, 'mapa.md'));
    const tickety = opisTicketow(statusyTicketow(slug));
    const nastepny = sekcja(mapa, 'Następny krok');
    const stanSesji = sekcja(mapa, 'Stan sesji');

    wyjscie.push('', `${slug}:`);
    if (tickety) wyjscie.push(`  ${tickety}`);
    if (nastepny) wyjscie.push(`  Następny krok: ${nastepny.split('\n')[0]}`);
    const liniaRoadmapy = teraz.split('\n').find((l) => l.includes(`zdolnosci/${slug}/`)) || '';
    const grill = mapa.match(/^Grill:\s*(.+)$/m)?.[1]?.trim();
    const bezDrugiejOpinii = /^Druga opinia:\s*(—|-)?\s*$/m.test(mapa);
    if (drugaOpiniaWlaczona && /—\s*grill\s*—/.test(liniaRoadmapy) && bezDrugiejOpinii && /skill spec\b/.test(nastepny)) {
      const wskazowkaOpinii = innyModelWymagany
        ? `użyj modelu spoza grilla${grill ? ` (${grill})` : ''}`
        : 'ten sam model jest dozwolony, ale oznacz opinię jako nieniezależną';
      wyjscie.push(
        `  Grill skończony, brak drugiej opinii: skill pomysl ${slug} druga-opinia — ${wskazowkaOpinii}.`,
      );
    }
    if (/—\s*weryfikacja\s*—/.test(liniaRoadmapy)) {
      const kto = budujacy(slug);
      const wskazowkaModelu = innyModelWymagany
        ? `użyj modelu spoza listy budujących${kto.length ? ` (${kto.join(', ')})` : ''}`
        : 'ten sam model jest dozwolony, ale oznacz rundę jako nieniezależną';
      wyjscie.push(
        `  Czeka na weryfikację krzyżową: skill weryfikuj ${slug} — ${wskazowkaModelu}.`,
      );
    }
    if (stanSesji) {
      const linie = stanSesji.split('\n');
      wyjscie.push('  Stan sesji:', ...linie.slice(0, MAX_LINII_STANU_SESJI).map((l) => `    ${l}`));
      if (linie.length > MAX_LINII_STANU_SESJI) wyjscie.push('    … (reszta w mapa.md)');
    }
  }
}

const sesje = otwarteSesje();
if (sesje.length > 0) wyjscie.push('', 'Przerwana praca poza zdolnościami:', ...sesje);

// Katalog prób: same nagłówki problemów bez rozwiązania; całość agent przeszukuje sam, gdy wybiera podejście.
const MAX_NIEROZWIAZANYCH = 5;
const proby = czytaj(join(ai, 'proby.md')).replace(/<!--[\s\S]*?-->/g, '');
const wpisy = proby.split(/^## /m).slice(1);
const nierozwiazane = wpisy
  .filter((w) => /^- Status:\s*nierozwiazane/m.test(w))
  .map((w) => `- ${w.split('\n')[0].trim()}`);
if (wpisy.length > 0) {
  wyjscie.push('', `Katalog prób (.ai/proby.md), liczba wpisów: ${wpisy.length} — przeszukaj go, zanim wybierzesz podejście.`);
  if (nierozwiazane.length > 0) {
    wyjscie.push('Nierozwiązane:', ...nierozwiazane.slice(0, MAX_NIEROZWIAZANYCH));
    if (nierozwiazane.length > MAX_NIEROZWIAZANYCH) wyjscie.push(`… i ${nierozwiazane.length - MAX_NIEROZWIAZANYCH} więcej`);
  }
}

// Lekcje: pełną listę czytają skille; tu tylko powtórki (≥2 wystąpienia), bo to sygnał wzorca dla retro.
const MAX_POWTOREK = 5;
const PROG_LEKCJI = 40;
const lekcje = czytaj(join(ai, 'lekcje.md'))
  .replace(/<!--[\s\S]*?-->/g, '')
  .split('\n')
  .filter((l) => /^- /.test(l))
  .map((l) => {
    const [tresc, wystapienia = ''] = l.slice(2).split(/\s*Wystąpienia:\s*/);
    return { tresc: tresc.trim(), ile: (wystapienia.match(/\d{4}-\d{2}-\d{2}/g) || []).length };
  });
const powtorki = lekcje.filter((l) => l.ile >= 2).sort((a, b) => b.ile - a.ile);
if (lekcje.length > 0) {
  const doRetro = powtorki.length > 0 || lekcje.length > PROG_LEKCJI;
  wyjscie.push('', `Lekcje (.ai/lekcje.md): ${lekcje.length}${doRetro ? ' — czas na skill retro' : ''}.`);
  if (powtorki.length > 0) {
    wyjscie.push('Powtarzają się:', ...powtorki.slice(0, MAX_POWTOREK).map((l) => `- ×${l.ile} ${l.tresc}`));
    if (powtorki.length > MAX_POWTOREK) wyjscie.push(`… i ${powtorki.length - MAX_POWTOREK} więcej`);
  }
}

// Zasady twarde z .ai/ZASADY.md: same nagłówki, żeby były w kontekście każdej sesji bez kopiowania ich do AGENTS.md.
const MAX_ZASAD = 10;
const zasady = czytaj(join(ai, 'ZASADY.md'))
  .replace(/<!--[\s\S]*?-->/g, '')
  .split(/^### /m)
  .slice(1)
  .filter((z) => /^- Siła:\s*twarda/m.test(z) && !/^- Status:\s*wycofana/m.test(z))
  .map((z) => {
    const egzekwowanie = z.match(/^- Egzekwowanie:\s*(.+)$/m)?.[1].trim() || 'brak';
    return {
      tytul: z.split('\n')[0].trim(),
      egzekwowanie,
      bezAutomatu: !/^automat(?:\s|—|$)/i.test(egzekwowanie),
    };
  });
if (zasady.length > 0) {
  const bezAutomatu = zasady.filter((z) => z.bezAutomatu).length;
  wyjscie.push(
    '',
    `Zasady twarde (.ai/ZASADY.md)${bezAutomatu ? `, bez automatu: ${bezAutomatu}` : ''} — złamanie wymaga wyjątku albo zmiany zasady:`,
    ...zasady.slice(0, MAX_ZASAD).map((z) => {
      const uwaga = /^przegląd(?:\s|$)/i.test(z.egzekwowanie)
        ? ' (pilnuje tylko przegląd)'
        : z.bezAutomatu ? ' (brak egzekwowania)' : '';
      return `- ${z.tytul}${uwaga}`;
    }),
  );
  if (zasady.length > MAX_ZASAD) wyjscie.push(`… i ${zasady.length - MAX_ZASAD} więcej`);
}

const katalogPluginu = join(dirname(fileURLToPath(import.meta.url)), '..');

// Wzorce między projektami: leżą w katalogu pluginu, więc agent w projekcie zna je tylko z tej ścieżki.
const indeksWzorcow = join(katalogPluginu, 'wzorce', 'INDEKS.md');
const wzorce = czytaj(indeksWzorcow)
  .replace(/<!--[\s\S]*?-->/g, '')
  .split('\n')
  .filter((l) => /^- \[/.test(l) && !/—\s*wycofany\b/.test(l));
if (wzorce.length > 0) {
  wyjscie.push(
    '',
    `Wzorce warsztatu: ${wzorce.length} — indeks ${indeksWzorcow}. Przeszukaj go po objawie albo haśle, gdy problem nie zależy od tego projektu.`,
  );
}

// Przemyślenia: same tytuły otwartych, żeby myśl nie zginęła między sesjami.
const MAX_PRZEMYSLEN = 5;
const katalogPrzemyslen = join(ai, 'przemyslenia');
const przemyslenia = existsSync(katalogPrzemyslen)
  ? readdirSync(katalogPrzemyslen)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => ({ plik: f, tresc: czytaj(join(katalogPrzemyslen, f)).replace(/<!--[\s\S]*?-->/g, '') }))
      .filter((p) => /^- Status:\s*otwarte/m.test(p.tresc))
      .map((p) => `- ${p.plik.replace(/\.md$/, '')} — ${(p.tresc.match(/^#\s+(?:Przemyślenie:\s*)?(.+)$/m)?.[1] || '').trim()}`)
  : [];
if (przemyslenia.length > 0) {
  wyjscie.push('', 'Otwarte przemyślenia (skill przemysl <slug>):', ...przemyslenia.slice(-MAX_PRZEMYSLEN));
  if (przemyslenia.length > MAX_PRZEMYSLEN) wyjscie.push(`… i ${przemyslenia.length - MAX_PRZEMYSLEN} starszych`);
}

// Profile klas aplikacji: ścieżki plików, bo leżą w katalogu pluginu, i liczba pozycji nierozstrzygniętych.
const profile = Array.isArray(warsztat.profile) ? warsztat.profile : [];
const plikiProfili = profile.map((p) => join(katalogPluginu, 'profile', `${p}.md`)).filter((p) => existsSync(p));
if (plikiProfili.length > 0) {
  const otwarte = czytaj(join(ai, 'profil.md'))
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .filter((l) => /^- \S+-\d+ .*—\s*otwarte\s*$/.test(l)).length;
  wyjscie.push(
    '',
    `Profile (${profile.join(', ')}): ${plikiProfili.join(', ')}${otwarte ? ` — otwarte pozycje w .ai/profil.md: ${otwarte}` : ''}.`,
  );
}

// Wydania: od kiedy nic nie wydano — sama data ostatniego wpisu; szczegóły daje skill gdzie.
const ostatnieWydanie = czytaj(join(ai, 'wydania.md'))
  .replace(/<!--[\s\S]*?-->/g, '')
  .match(/^## (\d{4}-\d{2}-\d{2})[^\n]*/m);
const niewydane = sekcja(czytaj(join(root, warsztat.wydanie?.changelog || 'CHANGELOG.md')), 'Niewydane')
  .split('\n')
  .filter((l) => /^\s*[-*] /.test(l)).length;
if (ostatnieWydanie || niewydane > 0) {
  wyjscie.push(
    '',
    `Wydania: ostatnie ${ostatnieWydanie ? ostatnieWydanie[0].slice(3) : 'brak'}${niewydane ? `; wpisy w historii zmian czekające na wydanie: ${niewydane} (skill wydaj uruchamia człowiek)` : ''}.`,
  );
}

// Instrukcje projektu: blok warsztatu w AGENTS.md w wersji pluginu i import AGENTS.md w CLAUDE.md.
function wersjaPluginu() {
  try {
    return JSON.parse(czytaj(join(katalogPluginu, 'plugin.json'))).version || null;
  } catch {
    return null;
  }
}

const uwagi = [];
const znacznik = czytaj(join(root, 'AGENTS.md')).match(/warsztat:start(?:\s+v(\d[\w.-]*))?/);
const wersja = wersjaPluginu();
if (znacznik && wersja && znacznik[1] !== wersja) {
  uwagi.push(`- Blok warsztatu w AGENTS.md: ${znacznik[1] ? `v${znacznik[1]}` : 'bez wersji'}, plugin: v${wersja} — skill start zaktualizuje blok.`);
}
const claudeMd = [join(root, 'CLAUDE.md'), join(root, '.claude', 'CLAUDE.md')].find((p) => existsSync(p));
if (claudeMd && !/^\s*@AGENTS\.md\b/m.test(czytaj(claudeMd))) {
  uwagi.push('- CLAUDE.md nie importuje @AGENTS.md — Claude Code nie widzi reguł warsztatu; skill start to poprawi.');
}
if (uwagi.length > 0) wyjscie.push('', 'Do aktualizacji:', ...uwagi);

// Git: tylko lokalne odczyty (bez fetch), żeby start sesji nie czekał na sieć.
function git(...args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }).trim();
  } catch {
    return null;
  }
}

const uwagiGit = [];
if (git('rev-parse', '--is-inside-work-tree') === 'true') {
  // Hook skanu sekretów jest w repo, ale core.hooksPath to ustawienie lokalne — na nowym komputerze trzeba je włączyć.
  if (existsSync(join(root, '.githooks', 'pre-commit')) && git('config', 'core.hooksPath') !== '.githooks') {
    uwagiGit.push('- Skan sekretów przed commitem nie działa na tym komputerze (core.hooksPath ≠ .githooks) — skill start go włączy.');
  }
  const galaz = git('branch', '--show-current');
  if (warsztat.git?.galezie === 'zdolnosc' && galaz) {
    const wBudowie = [...teraz.matchAll(/zdolnosci\/([a-z0-9-]+)\/[^\n]*—\s*(?:budowa|weryfikacja)\s*—/g)].map((m) => m[1]);
    for (const slug of wBudowie) {
      if (galaz !== `zdolnosc/${slug}`) uwagiGit.push(`- ${slug} jest w budowie, a bieżąca gałąź to ${galaz} (oczekiwana: zdolnosc/${slug}).`);
    }
  }
  const przed = Number(git('rev-list', '--count', '@{u}..HEAD'));
  if (przed > 0 && warsztat.git?.push !== 'nigdy') {
    uwagiGit.push(`- Niewypchnięte commity na ${galaz || 'bieżącej gałęzi'}: ${przed} (stan z ostatniego fetch).`);
  }
}
if (uwagiGit.length > 0) wyjscie.push('', 'Git:', ...uwagiGit);

// Sprzątanie: procesy z tego projektu, które przeżyły poprzednią sesję (np. serwer deweloperski), i śmieci z listy.
// Tylko raport — zamyka agent po zgodzie użytkownika, bo to może być jego własny serwer.
function procesyProjektu() {
  const sciezka = root.replace(/[\\/]+$/, '');
  const warianty = [
    sciezka.replace(/\//g, '\\'),
    sciezka.replace(/\\/g, '/'),
    sciezka.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`),
  ].map((w) => w.toLowerCase());
  const pasuje = (cmd) => {
    const c = (cmd || '').toLowerCase();
    return warianty.some((w) => c.includes(w)) && !c.includes('stan.mjs') && !c.includes('.vscode\\extensions') && !c.includes('.vscode/extensions');
  };
  try {
    if (process.platform === 'win32') {
      // Szybki filtr: bez żadnego node/python/deno/bun nie ma po co uruchamiać PowerShella (~2 s).
      const zadania = execFileSync('tasklist', ['/FO', 'CSV', '/NH'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000, windowsHide: true,
      });
      const nasze = zadania
        .split('\n')
        .map((l) => l.match(/^"([^"]+)","(\d+)"/))
        .filter((m) => m && /^(node|python|pythonw|deno|bun)\.exe$/i.test(m[1]) && Number(m[2]) !== process.pid);
      if (nasze.length === 0) return [];
      const ps = [
        "$ErrorActionPreference='SilentlyContinue'",
        "$p = Get-CimInstance Win32_Process -Filter \"Name='node.exe' or Name='python.exe' or Name='pythonw.exe' or Name='deno.exe' or Name='bun.exe'\"",
        "@($p | ForEach-Object { [pscustomobject]@{ pid = $_.ProcessId; start = $_.CreationDate.ToString('yyyy-MM-dd HH:mm'); cmd = $_.CommandLine } }) | ConvertTo-Json -Compress",
      ].join('; ');
      const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000, windowsHide: true,
      }).trim();
      const lista = (out ? [].concat(JSON.parse(out)) : []).filter((p) => p.pid !== process.pid && pasuje(p.cmd));
      if (lista.length === 0) return [];
      // Porty z netstat — szybciej niż Get-NetTCPConnection.
      const porty = {};
      try {
        const ns = execFileSync('netstat', ['-ano', '-p', 'TCP'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000, windowsHide: true });
        for (const l of ns.split('\n')) {
          const m = l.trim().match(/^TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/i);
          if (m) (porty[m[2]] ||= new Set()).add(Number(m[1]));
        }
      } catch {
        // Bez portów raport nadal ma sens.
      }
      return lista.map((p) => ({ ...p, porty: [...(porty[p.pid] || [])].sort((a, b) => a - b) }));
    }
    const out = execFileSync('ps', ['-eo', 'pid=,etime=,args='], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 });
    return out
      .split('\n')
      .map((l) => l.trim().match(/^(\d+)\s+(\S+)\s+(.*)$/))
      .filter((m) => m && /\b(node|python3?|deno|bun)\b/.test(m[3]) && Number(m[1]) !== process.pid && pasuje(m[3]))
      .map((m) => ({ pid: Number(m[1]), start: `działa ${m[2]}`, cmd: m[3], porty: [] }));
  } catch {
    return [];
  }
}

// Linia poleceń bez długich ścieżek: zostaje nazwa pliku i argumenty.
function krotko(cmd) {
  const s = (cmd || '')
    .replace(/"(?:[^"]*[\\/])?([^"\\/]+)"/g, '$1')
    .replace(/"?(?:[A-Za-z]:)?[\\/][^\s"]*[\\/]([^\\/\s"]+)"?/g, '$1').replace(/\s+/g, ' ').trim();
  return s.length > 90 ? `${s.slice(0, 89)}…` : s;
}

// Tylko przy nowej sesji: wznowienie i kompaktowanie widziałyby procesy uruchomione w tej samej pracy.
const nowaSesja = !session.source || session.source === 'startup' || session.source === 'clear';
const procesy = nowaSesja ? procesyProjektu() : [];
if (procesy.length > 0) {
  const zamknij = process.platform === 'win32' ? 'taskkill /PID <pid> /T /F' : 'kill <pid> (z procesami potomnymi)';
  wyjscie.push(
    '',
    'Procesy z tego projektu, które wciąż działają (mogły zostać po poprzedniej sesji):',
    ...procesy.map((p) => `- PID ${p.pid}, ${p.start}${p.porty?.length ? `, port ${p.porty.join(', ')}` : ''}: ${krotko(p.cmd)}`),
    `Zapytaj użytkownika, czy je zamknąć (${zamknij}) — mogą być jego. Bez zgody nie zamykaj.`,
  );
}

const smieci = (Array.isArray(warsztat.sprzatanie?.smieci) ? warsztat.sprzatanie.smieci : [])
  .filter((w) => !/[*?[]/.test(w))
  .filter((w) => existsSync(join(root, w.replace(/\/+$/, ''))));
if (smieci.length > 0) {
  wyjscie.push('', `Śmieci z listy sprzatanie.smieci na dysku: ${smieci.join(', ')} — można je usunąć.`);
}

process.stdout.write(wyjscie.join('\n') + '\n');
