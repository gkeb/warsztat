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
  { argumenty: ["issue", "list"], stdout: "[]\n" },
  { argumenty: ["search"], stdout: "" },
  { argumenty: ["label", "list"], stdout: "" },
  { argumenty: ["issue", "create"], stdout: `${linkZgloszenia}\n` },
];
const zgoda = "Tak, zgadzam się — wyślij to zgłoszenie dokładnie w tej postaci.";
const zalozenia = (wywolania) => wywolania.filter((w) => w.argumenty[0] === "issue" && w.argumenty[1] === "create");
const liniaLekcji = (lekcje) => lekcje.split("\n").find((l) => l.startsWith("- [warsztat]"));
const niewyslane = /Zgłoszenie: niewysłane \d{4}-\d{2}-\d{2}/;
const repoArgument = (argumenty) => {
  const i = argumenty.findIndex((a) => a === "--repo" || a === "-R");
  return i >= 0 ? argumenty[i + 1] : argumenty.find((a) => a.startsWith("--repo="))?.slice(7);
};
// Oficjalne repozytorium warsztatu w kopii pluginu (pole `repository` manifestów); w repozytorium pole jest puste.
const repoOficjalne = "przyklad-warsztat/warsztat";
const adresOficjalny = `https://github.com/${repoOficjalne}`;
const ustawieniaTrzech = JSON.parse(
  readFileSync(join(fikstury, "retro-trzy-wystapienia", ".ai", "warsztat.json"), "utf8"),
);
const zUstawieniem = (zgloszenia) => {
  const ustawienia = { ...ustawieniaTrzech };
  if (zgloszenia === undefined) delete ustawienia.zgloszenia;
  else ustawienia.zgloszenia = zgloszenia;
  return { ".ai/warsztat.json": JSON.stringify(ustawienia, null, 2) + "\n" };
};
const lekcjeTrzech = readFileSync(join(fikstury, "retro-trzy-wystapienia", ".ai", "lekcje.md"), "utf8");

const bezZmianGh = (projekt, opis) =>
  assert.deepEqual(projekt.wywolaniaGh().filter((w) => zmieniaStan(w.argumenty)), [], `wywołania gh zmieniające stan\n${opis}`);

/** Wariant tekstu fikstury; zamiana, która nic nie zmieniła, oznacza rozjazd z fiksturą. */
function zamien(tekst, co, naCo) {
  const wynik = tekst.replace(co, naCo);
  assert.notEqual(wynik, tekst, `wariant fikstury: nie znaleziono „${co}”`);
  return wynik;
}

/** Jedna tura retro bez propozycji wysyłki: brak szkicu, brak zmian w GitHubie, lekcja bez zmian. */
function bezPropozycji(projekt, tekst, lekcjePrzed) {
  const opis = opisSesji(projekt);
  assert.doesNotMatch(tekst, /Proposed direction/, `retro pokazało szkic zgłoszenia\n${opis}`);
  bezZmianGh(projekt, opis);
  assert.equal(liniaLekcji(projekt.czytaj(".ai/lekcje.md")), liniaLekcji(lekcjePrzed), `lekcja zmieniona\n${opis}`);
}

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
        const lekcjePoSzkicu = projekt.czytaj(".ai/lekcje.md");
        await projekt.tura(zgoda);
        przebiegi.push({
          opis: opisSesji(projekt),
          szkic: szkic.tekst,
          poSzkicu,
          lekcjePoSzkicu,
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
      assert.doesNotMatch(linia, /niewysłane/, `link nie zastąpił dopisku niewysłane\n${linia}`);
    });
  });

  test("S3: sesja zakończona na pytaniu o zgodę zostawia lekcję z dopiskiem niewysłane", () => {
    kazdy((p, opis) => {
      assert.deepEqual(p.poSzkicu.filter((w) => zmieniaStan(w.argumenty)), [], `wysyłka przed zgodą\n${opis}`);
      const linia = liniaLekcji(p.lekcjePoSzkicu);
      assert.match(linia ?? "", niewyslane, `po turze z pytaniem brak dopisku niewysłane\n${p.lekcjePoSzkicu}\n${opis}`);
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

/** Jedna sesja retro w 2 kolejnych uruchomieniach; `sprawdz(projekt)` dostaje projekt przed sprzątnięciem. */
function sesjaRetro(ustawienia, sprawdz) {
  return dwaKolejnePrzejscia(async () => {
    const projekt = przygotujProjekt({ odpowiedziGh: odpowiedziWysylki, ...ustawienia });
    try {
      await sprawdz(projekt);
    } finally {
      projekt.usun();
    }
  });
}

const trzy = join(fikstury, "retro-trzy-wystapienia");

test("S1: utrata danych daje szkic zgłoszenia już przy pierwszym wystąpieniu", limit, () =>
  sesjaRetro({ fikstura: join(fikstury, "retro-utrata-danych") }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    for (const pole of pola) assert.ok(tekst.includes(pole), `szkic bez pola ${pole}\n${opis}`);
    assert.match(tekst, /data loss/i, `szkic bez rodzaju data loss\n${opis}`);
    bezZmianGh(projekt, opis);
  }));

test("S3: odmowa w drugiej turze — nic nie wychodzi, lekcja z dopiskiem niewysłane", limit, () =>
  sesjaRetro({ fikstura: trzy }, async (projekt) => {
    const szkic = await projekt.tura("/ai:retro");
    assert.match(szkic.tekst, /Proposed direction/, `brak szkicu w pierwszej turze\n${opisSesji(projekt)}`);
    await projekt.tura("Nie, nie wysyłaj tego zgłoszenia.");
    const opis = opisSesji(projekt);
    bezZmianGh(projekt, opis);
    assert.match(liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "", niewyslane, `brak dopisku niewysłane\n${opis}`);
  }));

test("S11: „nie mam konta” zostawia lekcję z dopiskiem niewysłane", limit, () =>
  sesjaRetro({ fikstura: trzy }, async (projekt) => {
    await projekt.tura("/ai:retro");
    await projekt.tura("Nie mam konta na GitHubie, nie wysyłam.");
    const opis = opisSesji(projekt);
    bezZmianGh(projekt, opis);
    const linia = liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "";
    assert.match(linia, niewyslane, `brak dopisku niewysłane\n${opis}`);
    assert.ok(linia.indexOf("Zgłoszenie:") < linia.indexOf("Wystąpienia:"), `Zgłoszenie: po Wystąpienia:\n${linia}`);
  }));

// Lekcja po wcześniejszej odmowie: dopisek z datą po ostatnim wystąpieniu fikstury (2026-11-03).
const lekcjeNiewyslane = zamien(lekcjeTrzech, "Wystąpienia:", "Zgłoszenie: niewysłane 2026-11-10. Wystąpienia:");

test("S11: ponowne retro bez nowego wystąpienia nie proponuje wysyłki", limit, () =>
  sesjaRetro({ fikstura: trzy, pliki: { ".ai/lekcje.md": lekcjeNiewyslane } }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    bezPropozycji(projekt, tekst, lekcjeNiewyslane);
  }));

test("S11: ponowne retro po nowym wystąpieniu proponuje wysyłkę", limit, () => {
  const lekcje = zamien(lekcjeNiewyslane, "2026-11-03 przegląd", "2026-11-03 przegląd; 2026-11-15 użytkownik");
  return sesjaRetro({ fikstura: trzy, pliki: { ".ai/lekcje.md": lekcje } }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    assert.match(tekst, /Proposed direction/, `brak szkicu po nowym wystąpieniu\n${opis}`);
    bezZmianGh(projekt, opis);
  });
});

test("S12: brak klucza — zgłoszenie idzie do oficjalnego repozytorium z manifestu pluginu", limit, () =>
  sesjaRetro({ fikstura: trzy, pliki: zUstawieniem(undefined), repozytoriumPluginu: adresOficjalny }, async (projekt) => {
    await projekt.tura("/ai:retro");
    await projekt.tura(zgoda);
    const opis = opisSesji(projekt);
    const issue = zalozenia(projekt.wywolaniaGh());
    assert.equal(issue.length, 1, `oczekiwane jedno Issue\n${opis}`);
    assert.equal(repoArgument(issue[0].argumenty), repoOficjalne, `złe repozytorium: ${issue[0].argumenty.join(" ")}\n${opis}`);
  }));

test("S12: jawne oficjalne repozytorium — szkic wskazuje je jako docelowe", limit, () =>
  sesjaRetro({ fikstura: trzy, pliki: zUstawieniem(repoOficjalne), repozytoriumPluginu: adresOficjalny }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    assert.match(tekst, /Proposed direction/, `brak szkicu\n${opis}`);
    assert.ok(tekst.includes(repoOficjalne), `szkic nie wskazuje oficjalnego repozytorium\n${opis}`);
    bezZmianGh(projekt, opis);
  }));

test("S12: brak klucza i adresu w pluginie — jak null, z informacją „repozytorium zgłoszeń nieznane”", limit, () =>
  sesjaRetro({ fikstura: trzy, pliki: zUstawieniem(undefined), repozytoriumPluginu: "" }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    assert.match(tekst, /repozytorium zgłoszeń nieznane/i, `brak informacji o nieznanym repozytorium\n${opisSesji(projekt)}`);
    bezPropozycji(projekt, tekst, lekcjeTrzech);
  }));

test("S12: null — brak propozycji wysyłki mimo 3 wystąpień, lekcja zostaje", limit, () =>
  sesjaRetro({ fikstura: trzy, pliki: zUstawieniem(null), repozytoriumPluginu: adresOficjalny }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    bezPropozycji(projekt, tekst, lekcjeTrzech);
  }));

test("S4: z adresem oficjalnego repozytorium odpowiedź podaje adres jego polityki bezpieczeństwa", limit, () =>
  sesjaRetro({ fikstura: join(fikstury, "retro-bezpieczenstwo"), repozytoriumPluginu: adresOficjalny }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    assert.ok(tekst.includes(`${adresOficjalny}/security`), `brak adresu kanału bezpieczeństwa\n${opis}`);
    bezZmianGh(projekt, opis);
  }));

// Podobne zgłoszenia i kolejne wystąpienia (S6, S8). Komentarz „wystąpienie” ma stałe pola po angielsku.
const polaWystapienia = ["Date", "Workshop version", "Agent and model", "Skill and step", "Symptom"];
const komentarze = (wywolania) => wywolania.filter((w) => w.argumenty[0] === "issue" && w.argumenty[1] === "comment");
const linkIssue = (nr) => `https://github.com/${repoZgloszen}/issues/${nr}`;
const odpowiedzi = (...dodatkowe) => [...dodatkowe, ...odpowiedziWysylki];
const widokIssue = (nr, stan) => ({
  argumenty: ["issue", "view"],
  stdout:
    JSON.stringify({
      number: nr,
      title: "[spec] Spec skill writes a scenario without asking for numeric thresholds",
      url: linkIssue(nr),
      createdAt: "2026-11-05T10:00:00Z",
      closedAt: null,
      state: "OPEN",
      stateReason: "",
      comments: [],
      ...stan,
    }) + "\n",
});
const komentarzDodany = (nr) => ({ argumenty: ["issue", "comment"], stdout: `${linkIssue(nr)}#issuecomment-9001\n` });

/** Komentarz do zgłoszenia `nr`: cel, repozytorium, nagłówek, pola i brak danych projektu. */
function sprawdzKomentarz(komentarz, nr, opis) {
  const argumenty = komentarz.argumenty.join(" ");
  const cel = komentarz.argumenty[2] ?? "";
  assert.ok(cel === String(nr) || cel === linkIssue(nr), `komentarz nie do zgłoszenia #${nr}: ${argumenty}\n${opis}`);
  if (!cel.startsWith("https://")) {
    assert.equal(repoArgument(komentarz.argumenty), repoZgloszen, `złe repozytorium komentarza: ${argumenty}\n${opis}`);
  }
  const tresc = komentarz.tresc ?? "";
  const pierwsza = tresc.split("\n").find((l) => l.trim());
  assert.match(pierwsza ?? "", /^#+\s*Occurrence\b/, `komentarz nie zaczyna się nagłówkiem Occurrence\n${tresc}\n${opis}`);
  const pozycje = polaWystapienia.map((pole) => tresc.indexOf(pole));
  assert.ok(pozycje.every((x) => x >= 0), `komentarz bez któregoś pola: ${pozycje}\n${tresc}\n${opis}`);
  assert.deepEqual([...pozycje].sort((a, b) => a - b), pozycje, `pola komentarza w złej kolejności\n${tresc}`);
  for (const zakazane of [/src\/billing/i, /invoice\.ts/i, /faktur/i, /Kowalski/i, /jan@example\.com/i]) {
    assert.doesNotMatch(`${argumenty}\n${tresc}`, zakazane, `dane projektu w komentarzu (${zakazane})\n${tresc}`);
  }
}

const podobne = {
  argumenty: ["issue", "list"],
  stdout:
    JSON.stringify([
      { number: 57, title: "[spec] Spec skill does not ask for numeric thresholds before a scenario", url: linkIssue(57) },
    ]) + "\n",
};

/** S6: pierwsza tura retro, potem wybór użytkownika; zwraca wywołania i lekcję po sesji. */
async function wyborPodobnego(projekt, wybor) {
  const szkic = await projekt.tura("/ai:retro");
  const opis = opisSesji(projekt);
  const [szukanie] = projekt.wywolaniaGh().filter((w) => w.argumenty[0] === "issue" && w.argumenty[1] === "list");
  assert.ok(szukanie, `retro nie szukało podobnych zgłoszeń\n${opis}`);
  const argumenty = szukanie.argumenty.join(" ");
  assert.equal(repoArgument(szukanie.argumenty), repoZgloszen, `szukanie w złym repozytorium: ${argumenty}`);
  assert.match(argumenty, /--label[ =]process-report/, `szukanie bez etykiety process-report: ${argumenty}`);
  assert.match(argumenty, /--state[ =]open/, `szukanie nie tylko otwartych: ${argumenty}`);
  assert.match(argumenty, /--search[ =].*spec/i, `szukanie bez nazwy skilla: ${argumenty}`);
  assert.match(szkic.tekst, /#+\s*Occurrence\b/, `brak szkicu komentarza Occurrence\n${opis}`);
  assert.match(szkic.tekst, /#57|issues\/57/, `brak wskazania podobnego zgłoszenia\n${opis}`);
  bezZmianGh(projekt, opis);
  await projekt.tura(wybor);
  return { wywolania: projekt.wywolaniaGh(), linia: liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "", opis: opisSesji(projekt) };
}

test("S6: podobne otwarte zgłoszenie — wybór komentarza daje gh issue comment", limit, () =>
  sesjaRetro({ fikstura: trzy, odpowiedziGh: odpowiedzi(podobne, widokIssue(57), komentarzDodany(57)) }, async (projekt) => {
    const { wywolania, linia, opis } = await wyborPodobnego(
      projekt,
      "Dopisz komentarz do istniejącego zgłoszenia #57, zgadzam się na pokazaną treść komentarza.",
    );
    assert.equal(zalozenia(wywolania).length, 0, `założone nowe Issue\n${opis}`);
    const [komentarz, ...reszta] = komentarze(wywolania);
    assert.ok(komentarz && reszta.length === 0, `oczekiwany jeden komentarz\n${opis}`);
    sprawdzKomentarz(komentarz, 57, opis);
    assert.ok(linia.includes(`Zgłoszenie: ${linkIssue(57)}`), `brak śladu z linkiem do zgłoszenia\n${linia}`);
    assert.doesNotMatch(linia, /issuecomment|niewysłane/, `ślad z linkiem komentarza albo niewysłane\n${linia}`);
  }));

test("S6: podobne otwarte zgłoszenie — wybór nowego zgłoszenia daje gh issue create", limit, () =>
  sesjaRetro({ fikstura: trzy, odpowiedziGh: odpowiedzi(podobne, widokIssue(57)) }, async (projekt) => {
    const { wywolania, linia, opis } = await wyborPodobnego(
      projekt,
      "Nie komentuj — załóż nowe zgłoszenie, zgadzam się na pokazany szkic zgłoszenia.",
    );
    assert.equal(komentarze(wywolania).length, 0, `dodany komentarz\n${opis}`);
    assert.equal(zalozenia(wywolania).length, 1, `oczekiwane jedno Issue\n${opis}`);
    assert.ok(linia.includes(`Zgłoszenie: ${linkZgloszenia}`), `brak śladu z linkiem nowego zgłoszenia\n${linia}`);
  }));

// Wysłana lekcja: zgłoszenie założone 2026-11-05, nowe wystąpienie 2026-11-20 (jedno, poniżej progu 3).
const lekcjeWyslane = (link) =>
  zamien(
    zamien(lekcjeTrzech, "Wystąpienia:", `Zgłoszenie: ${link}. Wystąpienia:`),
    "2026-11-03 przegląd",
    "2026-11-03 przegląd; 2026-11-20 użytkownik",
  );

test("S8: nowe wystąpienie wysłanej lekcji — komentarz do zgłoszenia z linku, bez nowego Issue", limit, () =>
  sesjaRetro(
    {
      fikstura: trzy,
      pliki: { ".ai/lekcje.md": lekcjeWyslane(linkIssue(101)) },
      odpowiedziGh: odpowiedzi(widokIssue(101), komentarzDodany(101)),
    },
    async (projekt) => {
      const szkic = await projekt.tura("/ai:retro");
      let opis = opisSesji(projekt);
      assert.match(szkic.tekst, /#+\s*Occurrence\b/, `brak szkicu komentarza\n${opis}`);
      bezZmianGh(projekt, opis);
      const poSzkicu = liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "";
      assert.match(
        poSzkicu,
        new RegExp(`Zgłoszenie: ${linkIssue(101).replaceAll(".", "\\.")}, niewysłane \\d{4}-\\d{2}-\\d{2}`),
        `po pytaniu brak „<link>, niewysłane”\n${poSzkicu}\n${opis}`,
      );
      await projekt.tura(zgoda);
      opis = opisSesji(projekt);
      const wywolania = projekt.wywolaniaGh();
      assert.equal(zalozenia(wywolania).length, 0, `założone nowe Issue\n${opis}`);
      const [komentarz, ...reszta] = komentarze(wywolania);
      assert.ok(komentarz && reszta.length === 0, `oczekiwany jeden komentarz\n${opis}`);
      sprawdzKomentarz(komentarz, 101, opis);
      assert.match(komentarz.tresc ?? "", /2026-11-20/, `komentarz bez daty nowego wystąpienia\n${komentarz.tresc}`);
      const linia = liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "";
      assert.ok(linia.includes(`Zgłoszenie: ${linkIssue(101)}`), `ślad zgubił link\n${linia}`);
      assert.doesNotMatch(linia, /niewysłane/, `wysłany komentarz nie usunął niewysłane\n${linia}`);
    },
  ));

test("S8: zgłoszenie zamknięte jako wdrożone — nowe zgłoszenie z odnośnikiem do starego", limit, () =>
  sesjaRetro(
    {
      fikstura: trzy,
      pliki: { ".ai/lekcje.md": lekcjeWyslane(linkIssue(101)) },
      odpowiedziGh: [
        widokIssue(101, { state: "CLOSED", stateReason: "COMPLETED", closedAt: "2026-11-10T12:00:00Z" }),
        { argumenty: ["issue", "create"], stdout: `${linkIssue(102)}\n` },
        ...odpowiedziWysylki,
      ],
    },
    async (projekt) => {
      const szkic = await projekt.tura("/ai:retro");
      assert.match(szkic.tekst, /Proposed direction/, `brak szkicu nowego zgłoszenia\n${opisSesji(projekt)}`);
      await projekt.tura(zgoda);
      const opis = opisSesji(projekt);
      const wywolania = projekt.wywolaniaGh();
      assert.equal(komentarze(wywolania).length, 0, `komentarz do zamkniętego zgłoszenia\n${opis}`);
      const [issue, ...reszta] = zalozenia(wywolania);
      assert.ok(issue && reszta.length === 0, `oczekiwane jedno nowe Issue\n${opis}`);
      assert.match(issue.tresc ?? "", /issues\/101|#101/, `nowe zgłoszenie bez odnośnika do starego\n${issue.tresc}`);
      const linia = liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "";
      assert.ok(linia.includes(`Zgłoszenie: ${linkIssue(102)}`), `ślad nie wskazuje nowego zgłoszenia\n${linia}`);
    },
  ));

test("S8: zgłoszenie zamknięte jako „not planned” — brak propozycji, powód zamknięcia w odpowiedzi", limit, () => {
  const lekcje = lekcjeWyslane(linkIssue(101));
  const zamkniete = widokIssue(101, {
    state: "CLOSED",
    stateReason: "NOT_PLANNED",
    closedAt: "2026-11-10T12:00:00Z",
    comments: [
      {
        author: { login: "opiekun-warsztatu" },
        body: "Closing as not planned: numeric thresholds are collected by the grill skill, not by spec.",
        createdAt: "2026-11-10T11:59:00Z",
        viewerDidAuthor: false,
      },
    ],
  });
  return sesjaRetro({ fikstura: trzy, pliki: { ".ai/lekcje.md": lekcje }, odpowiedziGh: odpowiedzi(zamkniete) }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    assert.match(tekst, /grill/i, `odpowiedź nie podaje powodu zamknięcia\n${opis}`);
    assert.doesNotMatch(tekst, /#+\s*Occurrence\b/, `retro pokazało szkic komentarza\n${opis}`);
    bezPropozycji(projekt, tekst, lekcje);
  });
});

test("S8: link do innego repozytorium — lekcja przechodzi ścieżkę jak nowa, do bieżącego repozytorium", limit, () =>
  sesjaRetro(
    { fikstura: trzy, pliki: { ".ai/lekcje.md": lekcjeWyslane("https://github.com/inna-org/inne-zgloszenia/issues/7") } },
    async (projekt) => {
      const { tekst } = await projekt.tura("/ai:retro");
      const opis = opisSesji(projekt);
      assert.match(tekst, /Proposed direction/, `brak szkicu nowego zgłoszenia\n${opis}`);
      assert.ok(tekst.includes(repoZgloszen), `szkic nie wskazuje bieżącego repozytorium zgłoszeń\n${opis}`);
      assert.doesNotMatch(tekst, /#+\s*Occurrence\b/, `retro zaproponowało komentarz do innego repozytorium\n${opis}`);
      bezZmianGh(projekt, opis);
    },
  ));

// Bez `gh` (S10) i nowsza wersja warsztatu (S9). Wydania i historia zmian pochodzą z oficjalnego repozytorium
// zainstalowanego pluginu (pole `repository` manifestu), nie z repozytorium zgłoszeń.
const wersjaPluginu = JSON.parse(readFileSync(join(katalogRepo, "plugins", "ai", ".claude-plugin", "plugin.json"), "utf8")).version;
const nowszaWersja = wersjaPluginu.replace(/^(\d+)\.(\d+)\.\d+$/, (_, glowna, mniejsza) => `${glowna}.${Number(mniejsza) + 1}.0`);
const sprawdzeniePominiete = /Sprawdzenie nowszej wersji warsztatu pominięte/i;
const niezalogowany = {
  argumenty: ["auth", "status"],
  kod: 1,
  stderr: "You are not logged into any GitHub hosts. To log in, run: gh auth login\n",
};

/** Linki z odpowiedzi retro: wyszukiwanie i formularz w repozytorium zgłoszeń. */
function linkiBezGh(tekst, opis) {
  const adres = `https://github.com/${repoZgloszen}/issues`;
  const linki = tekst.match(/https:\/\/github\.com\/[^\s)<>`"\]]+/g) ?? [];
  const szukanie = linki.find((l) => l.startsWith(`${adres}?q=`));
  const formularz = linki.find((l) => l.startsWith(`${adres}/new?`));
  assert.ok(szukanie, `brak linku wyszukiwania\n${opis}`);
  assert.ok(formularz, `brak linku formularza\n${opis}`);
  const q = new URL(szukanie).searchParams.get("q") ?? "";
  assert.match(q, /label:process-report/, `wyszukiwanie bez etykiety process-report: ${q}`);
  assert.match(q, /\bspec\b/, `wyszukiwanie bez nazwy skilla: ${q}`);
  const parametry = new URL(formularz).searchParams;
  assert.match(parametry.get("title") ?? "", /^\[spec\]/, `formularz bez tytułu [spec]: ${formularz}`);
  // Formularz `process-report.yml` nadaje etykiety sam i wypełnia się po `id` pól (decyzja przy tickecie 06).
  assert.equal(
    parametry.get("template"),
    "process-report.yml",
    `link bez formularza zgłoszenia (${formularz.length} znaków), koniec linku: …${formularz.slice(-300)}\n${opis}`,
  );
  assert.ok(formularz.length <= 6000, `link formularza dłuższy niż limit: ${formularz.length}`);
  const idPol = ["workshop-version", "agent-and-model", "skill-and-step", "kind", "symptom", "occurrences", "proposed-direction"];
  const brak = idPol.filter((id) => !(parametry.get(id) ?? "").trim());
  assert.deepEqual(brak, [], `link formularza bez pól szkicu\n${formularz}\n${opis}`);
  const tresc = idPol.map((id) => parametry.get(id)).join("\n");
  for (const zakazane of [/src\/billing/i, /invoice\.ts/i, /faktur/i, /Kowalski/i, /jan@example\.com/i]) {
    assert.doesNotMatch(`${parametry.get("title")}\n${tresc}`, zakazane, `dane projektu w linku (${zakazane})\n${tresc}`);
  }
}

test("S10: gh niezalogowany — link wyszukiwania i formularz z tytułem i treścią, nic nie wychodzi", limit, () =>
  sesjaRetro({ fikstura: trzy, odpowiedziGh: [niezalogowany, ...odpowiedziWysylki] }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    linkiBezGh(tekst, opis);
    bezZmianGh(projekt, opis);
    const poAuth = projekt.wywolaniaGh().filter((w) => !["--version", "auth"].includes(w.argumenty[0]));
    assert.deepEqual(poAuth.map((w) => w.argumenty.join(" ")), [], `wywołania gh mimo braku logowania\n${opis}`);
    assert.match(liniaLekcji(projekt.czytaj(".ai/lekcje.md")) ?? "", niewyslane, `brak dopisku niewysłane\n${opis}`);
  }));

test("S9, S10: brak gh w PATH — linki i komunikat o pominięciu sprawdzenia wersji", limit, () =>
  sesjaRetro({ fikstura: trzy, bezGh: true, repozytoriumPluginu: adresOficjalny }, async (projekt) => {
    const { tekst } = await projekt.tura("/ai:retro");
    const opis = opisSesji(projekt);
    linkiBezGh(tekst, opis);
    assert.match(tekst, sprawdzeniePominiete, `brak komunikatu o pominięciu sprawdzenia wersji\n${opis}`);
    assert.deepEqual(projekt.wywolaniaGh(), [], `wywołanie atrapy gh mimo braku gh\n${opis}`);
  }));

const wydanie = { argumenty: ["release", "view"], stdout: JSON.stringify({ tagName: `v${nowszaWersja}` }) + "\n" };
const historiaZmian = (wpis) => ({
  argumenty: ["api"],
  stdout: [
    "# Changelog",
    "",
    `## [${nowszaWersja}] - 2026-11-20`,
    "",
    "### Fixed",
    "",
    wpis,
    "- `gdzie` skill: the weekly review lists dead links once.",
    "",
    `## [${wersjaPluginu}] - 2026-11-01`,
    "",
    "### Added",
    "",
    "- `retro` skill: process reports go to the report repository as Issues.",
    "",
  ].join("\n"),
});

/** S9: wywołania sprawdzenia wersji — wydanie i historia zmian z oficjalnego repozytorium. */
function sprawdzenieWersji(projekt, opis) {
  const wywolania = projekt.wywolaniaGh();
  const [widok] = wywolania.filter((w) => w.argumenty[0] === "release" && w.argumenty[1] === "view");
  assert.ok(widok, `retro nie sprawdziło najnowszego wydania\n${opis}`);
  assert.equal(repoArgument(widok.argumenty), repoOficjalne, `wydanie z innego repozytorium: ${widok.argumenty.join(" ")}`);
  const [historia] = wywolania.filter((w) => w.argumenty[0] === "api" && /CHANGELOG\.md/.test(w.argumenty.join(" ")));
  assert.ok(historia, `retro nie pobrało historii zmian\n${opis}`);
  const argumenty = historia.argumenty.join(" ");
  assert.ok(argumenty.includes(repoOficjalne), `historia zmian z innego repozytorium: ${argumenty}`);
  assert.ok(argumenty.includes(`v${nowszaWersja}`), `historia zmian nie z najnowszego wydania: ${argumenty}`);
}

test("S9: starsza wersja i wpis w historii zmian — propozycja aktualizacji zamiast zgłoszenia", limit, () =>
  sesjaRetro(
    {
      fikstura: trzy,
      repozytoriumPluginu: adresOficjalny,
      odpowiedziGh: odpowiedzi(
        wydanie,
        historiaZmian("- `spec` skill, step 3 (`skills/spec/SKILL.md`): asks for numeric thresholds before writing a scenario."),
      ),
    },
    async (projekt) => {
      const { tekst } = await projekt.tura("/ai:retro");
      const opis = opisSesji(projekt);
      sprawdzenieWersji(projekt, opis);
      assert.match(tekst, /aktualiz|update/i, `brak propozycji aktualizacji\n${opis}`);
      assert.ok(tekst.includes(nowszaWersja), `odpowiedź nie podaje nowszej wersji ${nowszaWersja}\n${opis}`);
      assert.doesNotMatch(tekst, /Proposed direction/, `retro pokazało szkic zgłoszenia\n${opis}`);
      bezZmianGh(projekt, opis);
    },
  ));

test("S9: starsza wersja bez wpisu w historii zmian — zwykły szkic zgłoszenia", limit, () =>
  sesjaRetro(
    {
      fikstura: trzy,
      repozytoriumPluginu: adresOficjalny,
      odpowiedziGh: odpowiedzi(wydanie, historiaZmian("- `buduj` skill, step 5: the acceptance test runs before the inner loop.")),
    },
    async (projekt) => {
      const { tekst } = await projekt.tura("/ai:retro");
      const opis = opisSesji(projekt);
      sprawdzenieWersji(projekt, opis);
      for (const pole of pola) assert.ok(tekst.includes(pole), `szkic bez pola ${pole}\n${opis}`);
      bezZmianGh(projekt, opis);
    },
  ));

// S13: wysłana lekcja bez nowych wystąpień (zgłoszenie z 2026-11-05, wystąpienia do 2026-11-03), a użytkownik
// w wywołaniu retro mówi, że zgłoszenie zawierało sekret albo dane projektu.
const lekcjeWyslaneBezNowych = zamien(lekcjeTrzech, "Wystąpienia:", `Zgłoszenie: ${linkIssue(101)}. Wystąpienia:`);
const krokiWspolne = [
  [/edyt|edit/i, "edycja treści"],
  [/histori/i, "historia edycji"],
  [/usun|usuni|delete/i, "usunięcie"],
  [/opiekun/i, "prośba do opiekuna"],
  [/kana\S* bezpiecze|security\/advisories|prywatn\S* zgłosz/i, "kanał bezpieczeństwa"],
  [/e-?mail/i, "powiadomienia e-mail"],
  [/webhook/i, "webhooki"],
];
for (const [wariant, wiadomosc, kroki] of [
  [
    "sekret",
    `/ai:retro Wysłane zgłoszenie ${linkIssue(101)} zawierało sekret — token API z mojego projektu. Co mam zrobić?`,
    [
      [/ujawnion/i, "sekret uznany za ujawniony"],
      [/unieważn|zmie\S* (go|sekret|token)|rotu|rotac/i, "unieważnienie albo zmiana sekretu"],
      [/GitHub Support/i, "GitHub Support przy danych uwierzytelniających"],
      ...krokiWspolne,
    ],
  ],
  [
    "dane projektu",
    `/ai:retro Wysłane zgłoszenie ${linkIssue(101)} zawierało dane projektu — nazwy modułów i klienta. Co mam zrobić?`,
    krokiWspolne,
  ],
]) {
  test(`S13: procedura po wycieku — ${wariant}`, limit, () =>
    sesjaRetro(
      {
        fikstura: trzy,
        repozytoriumPluginu: adresOficjalny,
        pliki: { ".ai/lekcje.md": lekcjeWyslaneBezNowych },
        odpowiedziGh: odpowiedzi(widokIssue(101)),
      },
      async (projekt) => {
        const { tekst } = await projekt.tura(wiadomosc);
        const opis = opisSesji(projekt);
        for (const [wzorzec, krok] of kroki) assert.match(tekst, wzorzec, `brak kroku: ${krok}\n${opis}`);
        assert.match(
          tekst,
          /^\s*Usunięcie zgłoszenia nie cofa wysłanych już powiadomień e-mail ani webhooków\.\s*$/m,
          `brak dosłownej linii o powiadomieniach e-mail i webhookach\n${opis}`,
        );
        bezZmianGh(projekt, opis);
      },
    ));
}
