# Lekcje

Ostatnie retro: —

- [warsztat] Skill `spec` nie pyta o próg przed zapisem scenariusza — w `src/billing/invoice.ts` spec pominął próg kwoty przy pojęciu Faktura korygująca, a zgłasza: Jan Kowalski, `jan@example.com`; założyliśmy, że skill `spec` (krok 3 w `skills/spec/SKILL.md` pluginu warsztatu) sam dopyta o progi liczbowe, okazało się, że zapisuje scenariusz bez nich → teraz sami pytamy o próg przed akceptacją specu. Wystąpienia: 2026-10-02 użytkownik; 2026-10-15 użytkownik; 2026-11-03 przegląd
