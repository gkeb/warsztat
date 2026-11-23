// Testy akceptacyjne retro — model zgłoszeń. Każdy test to sesja agenta: kosztuje wywołania modelu.
import { before, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dwaKolejnePrzejscia, katalogRepo, przygotujProjekt, zmieniaStan } from "./sesja.mjs";

const fikstury = join(dirname(fileURLToPath(import.meta.url)), "fikstury");
const limit = { timeout: 60 * 60 * 1000 };
const plikZgloszen = join(katalogRepo, "ZGLOSZENIA.md");

function opisSesji(projekt) {
  return projekt.tury.map((t, i) => `tura ${i + 1}: ${t.tekst.slice(0, 1500)}\nodmowy: ${JSON.stringify(t.odmowy)}`).join("\n");
}

// Kontrola uprzęży: `gh` z narzędzia Bash i PowerShell trafia do atrapy (druga tura idzie przez --resume),
// a prawdziwy `gh` jest nieosiągalny.
before(async () => {
  const znacznik = "gh atrapa-warsztatu 0.0.0";
  const projekt = przygotujProjekt({
    fikstura: join(fikstury, "retro-dwa-wystapienia"),
    odpowiedziGh: [{ argumenty: ["--version"], stdout: `${znacznik}\n` }],
  });
  try {
    const bash = await projekt.tura(
      "Uruchom narzędziem Bash dokładnie polecenie `gh --version` i przepisz jego wynik słowo w słowo. Nic więcej nie rób.",
    );
    const powershell = await projekt.tura(
      "Teraz uruchom to samo polecenie `gh --version` narzędziem PowerShell i przepisz wynik słowo w słowo. Nic więcej nie rób.",
    );
    const powloki = projekt.wywolaniaGh().map((w) => w.powloka);
    assert.deepEqual(powloki, ["bash", "cmd"], `atrapa gh nie dostała wywołań z obu powłok\n${opisSesji(projekt)}`);
    for (const tura of [bash, powershell]) {
      assert.ok(tura.tekst.includes("atrapa-warsztatu"), `brak odpowiedzi atrapy\n${opisSesji(projekt)}`);
      assert.doesNotMatch(tura.tekst, /gh version \d/, `odpowiedział prawdziwy gh\n${opisSesji(projekt)}`);
    }
  } finally {
    projekt.usun();
  }
});

test("S1: lekcja [warsztat] z 2 wystąpieniami zostaje lekcją, bez propozycji wysyłki", limit, async () => {
  const lekcja = "[warsztat] Skill `spec` przy bramce akceptacji nie pokazał streszczenia scenariuszy";
  const zgloszeniaPrzed = readFileSync(plikZgloszen, "utf8");

  await dwaKolejnePrzejscia(async () => {
    const projekt = przygotujProjekt({ fikstura: join(fikstury, "retro-dwa-wystapienia") });
    try {
      const { tekst } = await projekt.tura("/ai:retro");
      // Słowa kluczowe: skill retro naprawdę przeszedł po lekcjach (a nie np. „nieznany skill”).
      assert.doesNotMatch(tekst, /unknown skill|nieznany skill/i, `skill retro się nie załadował\n${opisSesji(projekt)}`);
      assert.match(tekst, /retro/i, `odpowiedź nie wygląda na retro\n${opisSesji(projekt)}`);
      assert.match(tekst, /lekcj/i, `retro nie odniosło się do lekcji\n${opisSesji(projekt)}`);
      assert.match(tekst, /\bspec/i, `retro nie odniosło się do lekcji z fikstury (skill spec)\n${opisSesji(projekt)}`);
      const zmiany = projekt.wywolaniaGh().filter((w) => zmieniaStan(w.argumenty));
      assert.deepEqual(zmiany, [], `wywołania gh zmieniające stan\n${opisSesji(projekt)}`);
      const lekcje = projekt.czytaj(".ai/lekcje.md");
      assert.ok(lekcje.includes(lekcja), `lekcja zniknęła z lekcje.md\n${opisSesji(projekt)}`);
      assert.doesNotMatch(lekcje, /Zgłoszenie:/, `lekcja dostała ślad zgłoszenia\n${opisSesji(projekt)}`);
    } finally {
      projekt.usun();
    }
  });

  assert.equal(readFileSync(plikZgloszen, "utf8"), zgloszeniaPrzed, "sesja zmieniła plik zgłoszeń repozytorium warsztatu");
});
