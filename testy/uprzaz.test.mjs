// Test jednostkowy uprzęży sesji: które wywołania `gh` liczą się jako zmiana stanu na GitHubie. Bez modelu i sieci.
// Od tej klasyfikacji zależy kontrola „retro niczego nie zmieniło” w testach sesji.
import { test } from "node:test";
import assert from "node:assert/strict";
import { zmieniaStan } from "./sesja.mjs";

const zapytanie =
  "query=query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { totalContributions } } } }";

for (const [opis, argumenty, oczekiwane] of [
  ["odczyt listy zgłoszeń", ["issue", "list", "--repo", "a/b"], false],
  ["założenie zgłoszenia", ["issue", "create", "--repo", "a/b"], true],
  ["REST bez pól", ["api", "users/konto-a", "--jq", ".created_at"], false],
  ["REST z polem", ["api", "repos/a/b/labels", "-f", "name=x"], true],
  ["GraphQL query ze zmienną", ["api", "graphql", "-f", "login=konto-a", "-f", zapytanie], false],
  ["GraphQL query przed zmienną", ["api", "graphql", "-f", zapytanie, "-F", "login=konto-a"], false],
  ["GraphQL query w postaci pola sklejonego", ["api", "graphql", `-f${zapytanie}`], false],
  ["GraphQL dokument skrócony {…}", ["api", "graphql", "-f", "query={ viewer { login } }"], false],
  ["GraphQL mutation", ["api", "graphql", "-f", "query=mutation { addLabelsToLabelable { clientMutationId } }"], true],
  ["GraphQL query i mutation w jednym dokumencie", ["api", "graphql", "-f", "query=query A { a } mutation B { b }"], true],
  ["GraphQL operationName", ["api", "graphql", "-f", zapytanie, "-f", "operationName=B"], true],
  ["GraphQL --input", ["api", "graphql", "--input", "zapytanie.json"], true],
  ["GraphQL inna metoda", ["api", "graphql", "-X", "DELETE", "-f", zapytanie], true],
  ["GraphQL bez zapytania", ["api", "graphql"], true],
]) {
  test(`zmieniaStan: ${opis} → ${oczekiwane ? "zmiana" : "odczyt"}`, () => {
    assert.equal(zmieniaStan(argumenty), oczekiwane);
  });
}
