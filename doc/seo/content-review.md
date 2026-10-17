# Content review checklist (M5, first batch)

Please review before these pages go live. Read each page in both languages: run `npm run dev` and open the URLs below, or read the source files directly.

| Page | URL (AR / EN) | Source |
|---|---|---|
| UCMath method | `/program` · `/en/program` | `src/content/program.ts` |
| Guides hub | `/resources` · `/en/resources` | `messages/*.json` → `Resources.hub` |
| What is mental math? | `/resources/what-is-mental-math` | `src/content/resources/what-is-mental-math.ts` |
| Benefits: what the research says | `/resources/mental-math-benefits-for-kids` | `src/content/resources/mental-math-benefits-for-kids.ts` |
| Mental math vs abacus | `/resources/mental-math-vs-abacus` | `src/content/resources/mental-math-vs-abacus.ts` |

## Facts to confirm (taken from the existing site; please verify they are current)

- [x] Classes are 1:1, 60 minutes (owner, 2026-10-17). Twice a week / 8 per month still comes from the pricing plans.
- [x] Level length depends on the student: some finish a level in one month, others in two or three (owner, 2026-10-17). Program page and "what is mental math" guide updated.
- [ ] Parents get a monthly progress report. Source: homepage FAQ.
- [ ] Sessions can be rescheduled through WhatsApp support. Source: homepage FAQ.
- [ ] UCMath starts with the soroban, then moves to visualisation, then tool-free calculation (your answer, 2026-10-16).
- [x] No UCMAS mentions anywhere on the site; UCMath described neutrally as the program students follow (owner decision, 2026-10-16).
- [x] Ages 4–18 (owner, 2026-10-17; replaces the earlier 4–14). Copy, meta, schema and share cards (`imath-ar-v3`, `imath-en-v4`) updated.

## Claims backed by research (cited on the page)

- Arithmetic gains from abacus-based training: Barner et al. 2016 (RCT, 204 children, 3 years, ages 5–7 at start); Wang et al. 2019.
- No IQ gain (no Raven's difference): Wang et al. 2019. No change in basic cognitive abilities: Barner et al. 2016.
- Working memory: mixed (gain in Wang 2019; none in Barner 2016).

## Wording deliberately kept modest

- "Confidence" is presented as what parents report, not as a research finding.
- No claims that mental math raises IQ or prevents learning difficulties.

## Open items for you

- [x] **Byline:** no tutor will be credited; articles are written and reviewed with Claude Code. Byline and hub intro now say "By the iMath team" (owner, 2026-10-17).
- [x] **Abacus:** families buy it themselves. Not added to the site (owner, 2026-10-17).
- [x] **Testimonial "Omar F., father of a high school student"**: fits again with ages 4–18. Kept.
- [x] **"Certified" wording:** kept; iMath has a genuine accreditation (owner, 2026-10-17). Don't add it to schema as a credential without a named body.
- [x] **Pricing copy** reworded so no plan promises a set number of completed levels: plan 2 "24 sessions, at your child's own pace", "certificate for each completed level"; plan 3 "48 sessions, steady progress at your child's pace" (owner, 2026-10-17).
- [x] **Header and footer links** to "Program" and "Guides" added (2026-10-16). The full desktop nav now shows from 1280px wide; below that, the menu button is used (7 links don't fit on one line at 1024px).
