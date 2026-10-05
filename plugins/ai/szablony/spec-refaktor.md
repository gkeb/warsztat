# Spec refaktoryzacji: {{Nazwa}}

> Kontrakt refaktoryzacji. Zachowanie widoczne z zewnątrz się nie zmienia — zmienia się struktura. Bez kodu; moduły nazywasz słowami.
> Zaakceptowany: {{RRRR-MM-DD}}

## Dlaczego teraz

<!-- Co boli w obecnej strukturze i co to blokuje: konkretne zdolności, błędy, koszt zmian. -->

## Stan obecny

<!-- Jak jest dziś: moduły, zależności, przepływ. Link do mapy obszaru (`.ai/obszary/…`), jeśli jest. -->

## Stan docelowy

<!-- Jak ma być po zakończeniu. Link do ADR, jeśli refaktoryzacja wdraża decyzję architektoniczną. Które zasady z `.ai/ZASADY.md` powstaną, zmienią się albo przestaną mieć wyjątki. -->

## Niezmienniki

<!-- Co nie może się zmienić — każdy da się sprawdzić testem, a test ma numer niezmiennika w nazwie. Numery stałe po akceptacji.
N1. Publiczne API … zwraca to samo dla tych samych danych.
N2. Format danych trwałych … pozostaje zgodny.
-->

## Siatka bezpieczeństwa

<!-- Które testy już chronią niezmienniki, a których brakuje (te powstaną w pierwszym tickecie jako testy charakteryzujące). -->

## Strategia

<!-- Np. stopniowe zastępowanie (nowy moduł obok, przepinanie wywołań po kolei), równoległa zmiana (rozszerz → przenieś → zawęź). Każdy krok zostawia działający system. -->

## Kryterium końca

<!-- Kiedy kończymy: np. stary moduł usunięty, żadne wywołanie nie omija nowej granicy. -->

## Poza zakresem

<!-- Zmiany zachowania, które przy okazji kuszą — trafiają do osobnych zdolności. -->
