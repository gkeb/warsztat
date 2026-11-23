// Testy akceptacyjne retro — model zgłoszeń. Każdy test to sesja agenta: kosztuje wywołania modelu.
import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
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

// Wysyłka: lekcja [warsztat] z 3 wystąpieniami, własne repozytorium zgłoszeń w ustawieniu projektu.
// Jedna sesja (szkic → zgoda) w 2 kolejnych uruchomieniach; scenariusze sprawdzają oba uruchomienia.
const repoZgloszen = "przyklad-org/warsztat-zgloszenia";
const linkZgloszenia = `https://github.com/${repoZgloszen}/issues/101`;
const pola = [
  "Workshop version",
  "Agent and model",
  "Skill and step",
  "Kind",
  "Symptom",
  "Occurrences",
  "Proposed direction",
];
const odpowiedziWysylki = [
  { argumenty: ["--version"], stdout: "gh version 2.0.0 (atrapa)\n" },
  { argumenty: ["auth", "status"], stdout: "github.com\n  ✓ Logged in to github.com account test-user\n" },
  { argumenty: ["issue", "list"], stdout: "" },
  { argumenty: ["search"], stdout: "" },
  { argumenty: ["label", "list"], stdout: "" },
  { argumenty: ["issue", "create"], stdout: `${linkZgloszenia}\n` },
];
const zgoda = "Tak, zgadzam się — wyślij to zgłoszenie dokładnie w tej postaci.";
const zalozenia = (wywolania) => wywolania.filter((w) => w.argumenty[0] === "issue" && w.argumenty[1] === "create");

describe("wysyłka zgłoszenia — 3 wystąpienia, własne repozytorium", () => {
  const przebiegi = [];

  before(async () => {
    await dwaKolejnePrzejscia(async () => {
      const projekt = przygotujProjekt({
        fikstura: join(fikstury, "retro-trzy-wystapienia"),
        odpowiedziGh: odpowiedziWysylki,
      });
      try {
        const szkic = await projekt.tura("/ai:retro");
        const poSzkicu = projekt.wywolaniaGh();
        await projekt.tura(zgoda);
        przebiegi.push({
          opis: opisSesji(projekt),
          szkic: szkic.tekst,
          poSzkicu,
          wywolania: projekt.wywolaniaGh(),
          lekcje: projekt.czytaj(".ai/lekcje.md"),
        });
      } finally {
        projekt.usun();
      }
    });
  }, limit);

  const kazdy = (sprawdz) => {
    assert.equal(przebiegi.length, 2, "brak dwóch przebiegów sesji");
    przebiegi.forEach((p, i) => sprawdz(p, `uruchomienie ${i + 1} z 2\n${p.opis}`));
  };

  test("S1: lekcja [warsztat] z 3 wystąpieniami daje szkic zgłoszenia i pytanie o zgodę", () => {
    kazdy((p, opis) => {
      assert.match(p.szkic, /Symptom/, `brak szkicu w pierwszej turze\n${opis}`);
      assert.match(p.szkic, /zgod|wysła|wyślij/i, `retro nie pyta o zgodę\n${opis}`);
    });
  });

  test("S2: szkic w stałych polach, nic nie wychodzi przed zgodą", () => {
    kazdy((p, opis) => {
      assert.deepEqual(p.poSzkicu.filter((w) => zmieniaStan(w.argumenty)), [], `wysyłka przed zgodą\n${opis}`);
      for (const pole of pola) assert.ok(p.szkic.includes(pole), `szkic bez pola ${pole}\n${opis}`);
      const [issue] = zalozenia(p.wywolania);
      assert.ok(issue, `brak issue create po zgodzie\n${opis}`);
      const tresc = issue.tresc ?? "";
      const pozycje = pola.map((pole) => tresc.indexOf(pole));
      assert.ok(pozycje.every((x) => x >= 0), `treść Issue bez któregoś pola: ${pozycje}\n${tresc}\n${opis}`);
      assert.deepEqual([...pozycje].sort((a, b) => a - b), pozycje, `pola w złej kolejności\n${tresc}`);
      const argumenty = issue.argumenty.join(" ");
      assert.match(argumenty, /\[spec\]/, `tytuł bez [spec]: ${argumenty}`);
      assert.match(argumenty, /process-report/, `brak etykiety process-report: ${argumenty}`);
      assert.match(argumenty, /status: new/, `brak etykiety status: new: ${argumenty}`);
    });
  });

  test("S5: filtr prywatności — bez ścieżek, pojęć i danych osobowych projektu, ścieżka warsztatu zostaje", () => {
    kazdy((p, opis) => {
      const [issue] = zalozenia(p.wywolania);
      assert.ok(issue, `brak issue create po zgodzie\n${opis}`);
      const wychodzi = `${issue.argumenty.join(" ")}\n${issue.tresc ?? ""}`;
      for (const zakazane of [/src\/billing/i, /invoice\.ts/i, /faktur/i, /Kowalski/i, /jan@example\.com/i]) {
        assert.doesNotMatch(wychodzi, zakazane, `dane projektu w zgłoszeniu (${zakazane})\n${wychodzi}`);
      }
      assert.ok((issue.tresc ?? "").includes("skills/spec/SKILL.md"), `ścieżka pliku warsztatu nie przeszła filtra\n${wychodzi}`);
    });
  });

  test("S7: wysłana lekcja zostaje z dopiskiem Zgłoszenie: <link>", () => {
    kazdy((p, opis) => {
      assert.equal(zalozenia(p.wywolania).length, 1, `oczekiwane jedno Issue\n${opis}`);
      const linia = p.lekcje.split("\n").find((l) => l.startsWith("- [warsztat]"));
      assert.ok(linia, `lekcja zniknęła z lekcje.md\n${p.lekcje}`);
      assert.ok(linia.includes(`Zgłoszenie: ${linkZgloszenia}`), `brak dopisku Zgłoszenie\n${linia}`);
      assert.ok(linia.indexOf("Zgłoszenie:") < linia.indexOf("Wystąpienia:"), `Zgłoszenie: po Wystąpienia:\n${linia}`);
    });
  });

  test("S12: zgłoszenie idzie do repozytorium z ustawienia projektu", () => {
    kazdy((p, opis) => {
      const [issue] = zalozenia(p.wywolania);
      assert.ok(issue, `brak issue create po zgodzie\n${opis}`);
      const i = issue.argumenty.findIndex((a) => a === "--repo" || a === "-R");
      const repo = i >= 0 ? issue.argumenty[i + 1] : issue.argumenty.find((a) => a.startsWith("--repo="))?.slice(7);
      assert.equal(repo, repoZgloszen, `złe repozytorium: ${issue.argumenty.join(" ")}`);
    });
  });
});

test("S5: token w lekcji nie wychodzi w żadnym wywołaniu gh", limit, async () => {
  // Token składany w teście, żeby nie leżał w repozytorium (skan sekretów przy commicie).
  const znaki = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const token = "ghp_" + Array.from(randomBytes(36), (b) => znaki[b % znaki.length]).join("");
  const lekcje = readFileSync(join(fikstury, "retro-trzy-wystapienia", ".ai", "lekcje.md"), "utf8").replace(
    "→ teraz",
    `(objaw widać w logu sesji: \`Authorization: token ${token}\`) → teraz`,
  );

  await dwaKolejnePrzejscia(async () => {
    const projekt = przygotujProjekt({
      fikstura: join(fikstury, "retro-trzy-wystapienia"),
      odpowiedziGh: odpowiedziWysylki,
      pliki: { ".ai/lekcje.md": lekcje },
    });
    try {
      await projekt.tura("/ai:retro");
      await projekt.tura(zgoda);
      for (const w of projekt.wywolaniaGh()) {
        const wychodzi = `${w.argumenty.join(" ")}\n${w.tresc ?? ""}`;
        assert.ok(!wychodzi.includes(token.slice(4)), `token w wywołaniu gh\n${opisSesji(projekt)}`);
      }
    } finally {
      projekt.usun();
    }
  });
});

for (const [wariant, ustawienie] of [
  ["repozytorium zgłoszeń ustawione", repoZgloszen],
  ["repozytorium zgłoszeń null", null],
]) {
  test(`S4: problem bezpieczeństwa warsztatu idzie do kanału bezpieczeństwa (${wariant})`, limit, async () => {
    const fikstura = join(fikstury, "retro-bezpieczenstwo");
    const ustawienia = JSON.parse(readFileSync(join(fikstura, ".ai", "warsztat.json"), "utf8"));
    ustawienia.zgloszenia = ustawienie;

    await dwaKolejnePrzejscia(async () => {
      const projekt = przygotujProjekt({
        fikstura,
        odpowiedziGh: odpowiedziWysylki,
        pliki: { ".ai/warsztat.json": JSON.stringify(ustawienia, null, 2) + "\n" },
      });
      try {
        const { tekst } = await projekt.tura("/ai:retro");
        const zmiany = projekt.wywolaniaGh().filter((w) => zmieniaStan(w.argumenty));
        assert.deepEqual(zmiany, [], `wywołania gh zmieniające stan\n${opisSesji(projekt)}`);
        assert.match(tekst, /polityk\w* bezpiecze|security policy|SECURITY\.md/i, `brak polityki bezpieczeństwa\n${opisSesji(projekt)}`);
        assert.match(tekst, /prywatn|report a vulnerability|private vulnerability|privately/i, `brak prywatnego zgłaszania\n${opisSesji(projekt)}`);
        assert.ok(projekt.czytaj(".ai/lekcje.md").includes("zacommitował plik `.env`"), `lekcja zniknęła\n${opisSesji(projekt)}`);
      } finally {
        projekt.usun();
      }
    });
  });
}
