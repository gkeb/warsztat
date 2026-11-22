// Test regresji hooka SessionStart (plugins/ai/scripts/stan.mjs).
// Codex parsuje stdout zaczynający się od „[” albo „{” jako JSON; przy błędzie
// parsowania odrzuca kontekst (.ai/badania/2026-11-22-kontekst-hookow-codex.md).
// Claude Code i Codex przyjmują JSON hookSpecificOutput.additionalContext.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const skrypt = join(dirname(fileURLToPath(import.meta.url)), '..', 'plugins', 'ai', 'scripts', 'stan.mjs');

function uruchom(projekt) {
  return execFileSync(process.execPath, [skrypt], {
    input: JSON.stringify({ cwd: projekt, hook_event_name: 'SessionStart' }),
    encoding: 'utf8',
  });
}

test('stan.mjs przekazuje kontekst w formacie przyjmowanym przez Codex i Claude Code', () => {
  const projekt = mkdtempSync(join(tmpdir(), 'stan-hook-'));
  try {
    mkdirSync(join(projekt, '.ai'));
    writeFileSync(join(projekt, '.ai', 'ROADMAP.md'), '# Roadmapa\n\n## Teraz\n');
    const wyjscie = uruchom(projekt).trim();

    const json = JSON.parse(wyjscie);
    assert.equal(json.hookSpecificOutput?.hookEventName, 'SessionStart');
    assert.match(json.hookSpecificOutput?.additionalContext ?? '', /Stan projektu z \.ai\//);
  } finally {
    rmSync(projekt, { recursive: true, force: true });
  }
});

test('stan.mjs nic nie wypisuje w projekcie bez .ai/ROADMAP.md', () => {
  const projekt = mkdtempSync(join(tmpdir(), 'stan-hook-'));
  try {
    assert.equal(uruchom(projekt), '');
  } finally {
    rmSync(projekt, { recursive: true, force: true });
  }
});
