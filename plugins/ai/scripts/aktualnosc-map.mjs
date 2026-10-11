// Tylko lokalne odczyty: metadane map i nazwy plików z gita, bez treści źródeł.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function metadane(tresc) {
  const frontmatter = tresc.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (!frontmatter) return null;
  const commity = [...frontmatter.matchAll(/^poznany-commit:[ \t]*([^\n]*)$/gm)];
  const listy = [...frontmatter.matchAll(/^zrodla-kodu:[ \t]*([^\n]*)$/gm)];
  if (commity.length !== 1 || listy.length !== 1) return null;
  const commit = commity[0][1].trim();
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(commit)) return null;
  try {
    const zrodla = JSON.parse(listy[0][1]);
    if (!Array.isArray(zrodla) || zrodla.length === 0) return null;
    const poprawne = zrodla.every((p) => typeof p === 'string' && p.length > 0
      && !/[\\:*?\[\]{}\x00-\x1f]/.test(p) && !p.startsWith('/')
      && p.replace(/\/$/, '').split('/').every((s) => s !== '' && s !== '.' && s !== '..'));
    return poprawne ? { commit, zrodla: zrodla.map((p) => p.replace(/\/$/, '')) } : null;
  } catch {
    return null;
  }
}

export function sprawdzMapy(root, budzetMs = 3000) {
  const katalog = join(root, '.ai', 'obszary');
  let pliki;
  try {
    pliki = readdirSync(katalog).filter((p) => p.endsWith('.md')).sort();
  } catch (blad) {
    return { mapy: [], blad: blad.code === 'ENOENT' ? null : 'Nie można odczytać katalogu map.' };
  }
  if (pliki.length === 0) return { mapy: [], blad: null };

  const koniec = Date.now() + budzetMs;
  const git = (...args) => {
    const pozostalo = koniec - Date.now();
    if (pozostalo <= 0) return null;
    try {
      return execFileSync('git', args, {
        cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        timeout: pozostalo, maxBuffer: 4 * 1024 * 1024, windowsHide: true,
      });
    } catch {
      return null;
    }
  };
  const nieznana = (plik, powod) => ({ plik, status: 'nieznana', powod });
  const nieSledzone = git('ls-files', '--others', '--exclude-standard', '-z');
  const wedlugCommitu = new Map();
  const mapy = pliki.map((plik) => {
    let dane;
    try {
      dane = metadane(readFileSync(join(katalog, plik), 'utf8'));
    } catch {
      return nieznana(plik, 'Nie można odczytać mapy.');
    }
    if (!dane) return nieznana(plik, 'Brak poprawnego checkpointu lub listy źródeł; uzupełnij przez poznaj.');
    if (nieSledzone === null) return nieznana(plik, 'Git niedostępny, błąd odczytu lub wyczerpany budżet kontroli.');
    if (!wedlugCommitu.has(dane.commit)) {
      const typ = git('cat-file', '-t', dane.commit);
      const diff = typ?.trim() === 'commit'
        ? git('diff', '--relative', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-only', '-z', dane.commit, '--')
        : null;
      // Indeks może różnić się od checkpointu, choć plik roboczy ma znowu jego treść.
      const staged = diff !== null
        ? git('diff', '--cached', '--relative', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-only', '-z', dane.commit, '--')
        : null;
      wedlugCommitu.set(dane.commit, diff === null || staged === null ? null : [...new Set(
        `${diff}${staged}${nieSledzone}`.split('\0').filter(Boolean),
      )]);
    }
    const zmienione = wedlugCommitu.get(dane.commit);
    if (zmienione === null) return nieznana(plik, 'Checkpoint nieosiągalny, błąd gita lub wyczerpany budżet kontroli.');
    const dotkniete = zmienione.some((p) => dane.zrodla.some((z) => p === z || p.startsWith(`${z}/`)));
    return { plik, status: dotkniete ? 'zmienione' : 'bez-zmian' };
  });
  return { mapy, blad: null };
}

export function opisAktualnosci({ mapy, blad }, limit = 5) {
  if (blad) return [`Aktualność map nieznana: ${blad}`];
  const doSprawdzenia = mapy.filter((m) => m.status !== 'bez-zmian');
  if (doSprawdzenia.length === 0) return [];
  const zmienione = doSprawdzenia.filter((m) => m.status === 'zmienione').length;
  return [
    `Mapy obszarów: zmienione źródła ${zmienione}, aktualność nieznana ${doSprawdzenia.length - zmienione}. Sprawdź przez skill poznaj; pełny raport: skill gdzie.`,
    ...doSprawdzenia.slice(0, limit).map((m) => `- .ai/obszary/${m.plik} — ${m.status === 'zmienione' ? 'źródła zmienione; opis wymaga sprawdzenia' : m.powod}`),
    ...(doSprawdzenia.length > limit ? [`… i ${doSprawdzenia.length - limit} więcej`] : []),
  ];
}

// Agent może odczytać pełny raport w gdzie; nie uruchamia to generatora ani modelu.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(sprawdzMapy(resolve(process.argv[2] || process.cwd())), null, 2)}\n`);
}
