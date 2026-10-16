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

- [ ] Classes are 1:1, 60 minutes, twice a week (8 per month). Source: pricing plan features.
- [ ] One level takes about 3 months (24 sessions); a certificate is given per level. Source: pricing plans.
- [ ] Parents get a monthly progress report. Source: homepage FAQ.
- [ ] Sessions can be rescheduled through WhatsApp support. Source: homepage FAQ.
- [ ] UCMath starts with the soroban, then moves to visualisation, then tool-free calculation (your answer, 2026-10-16).
- [ ] "UCMath is not the same as UCMAS / a different commercial program." Please confirm there is no affiliation.
- [ ] Ages 4–14 (your answer, 2026-10-16).

## Claims backed by research (cited on the page)

- Arithmetic gains from abacus-based training: Barner et al. 2016 (RCT, 204 children, 3 years, ages 5–7 at start); Wang et al. 2019.
- No IQ gain (no Raven's difference): Wang et al. 2019. No change in basic cognitive abilities: Barner et al. 2016.
- Working memory: mixed (gain in Wang 2019; none in Barner 2016).

## Wording deliberately kept modest

- "Confidence" is presented as what parents report, not as a research finding.
- No claims that mental math raises IQ or prevents learning difficulties.

## Open items for you

- [ ] **Named reviewer:** the guides are credited to "the iMath teaching team". A named tutor with qualifications (and a photo) strengthens trust, for search engines and parents alike. Can a lead tutor be credited as reviewer?
- [ ] **Do families need to buy an abacus?** Parents will ask. Tell us the answer (provided, sent, or bought by the family) and we'll add it to the program FAQ.
- [ ] **Testimonial "Omar F., father of a high school student"** doesn't match the 4–14 age range. Keep, edit, or remove?
- [ ] **Header and footer links** to "Program" and "Guides" aren't added yet, because `Header.tsx`/`Footer.tsx` have your uncommitted edits. Commit or discard those first, then we'll add the links.
