// SessionStart (Claude Code i Codex): wstrzykuje stan .ai/ bieżącego projektu.
// Projekt bez .ai/ROADMAP.md → brak wyjścia, żeby nie śmiecić w innych repozytoriach.
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

process.stdout.write(wyjscie.join('\n') + '\n');
