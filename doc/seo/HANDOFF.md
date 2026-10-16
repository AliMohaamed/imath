# SEO Project Handoff

**Read this first in any new session.** Snapshot as of 2026-10-16. The full plan, audit and roadmap live in `SEO_MASTER_PLAN.md` (root). This file covers current state and how to work.

## 1. Project in one paragraph

iMath (https://www.imathmental.com, Vercel) is an online academy teaching **1:1 mental math to kids aged 4–14** (abacus/soroban first, then mental visualisation, then tool-free). Markets: Egypt plus Saudi Arabia, UAE, Kuwait and Qatar. Arabic is the default locale at `/`, English is at `/en` (next-intl, `localePrefix: "as-needed"`). Stack: Next.js 16 App Router, React 19, Tailwind 4, next-intl 4, Convex (admin, leads, assessments). Conversions: free trial booking (homepage stepper) and WhatsApp.

## 2. Owner decisions (fixed, don't revisit)

- **UCMAS must never be mentioned anywhere on the website.** iMath has no affiliation with it. Don't target UCMAS keywords or write comparison content.
- **UCMath** = the name of the structured mental math program students follow. Describe it neutrally ("the UCMath method/program"). **Never** call it "iMath's own/proprietary method".
- **Ages 4–14** in all copy, meta, schema and images. Booking and assessment forms still accept up to 18 on purpose (owner didn't ask to change validation).
- Teaching method: soroban → visualisation → tool-free. Kids only: no adult courses, no tutor training.
- "+500 students" and "best academy in the Arab world" are owner-confirmed claims. Never put them in review or rating schema.
- AI training crawlers (GPTBot, Google-Extended, CCBot): **undecided**, so robots.txt currently allows all.

## 3. Status

| Milestone | State |
|---|---|
| M1 indexing (robots/sitemap 404 fix, canonicals, hreflang + x-default, `<html lang dir>`, admin noindex) | ✅ Live |
| M3 performance (hero WebP/AVIF, WOFF2 subset fonts, all public pages SSG + CDN-cached, server components) | ✅ Live. Lab mobile LCP 24.9 s → ~4.8 s |
| M4 on-page (query-first titles from `Seo` messages, JSON-LD @graph, FAQ in HTML, OG cards) | ✅ Live |
| Cache fix for /assessment pages | ✅ Live |
| M5 content: `/program`, `/resources` hub, 3 guides, 4–14 ages, UCMath neutral wording | 🟡 **Committed locally, NOT pushed**, awaiting owner review (`doc/seo/content-review.md`) |
| M2 analytics (GA4 via `@next/third-parties`, wire existing `trackEvent` names as conversions) | ⏳ Waiting for the GA4 Measurement ID from the owner |
| M6 AI search/entity · M7 country/age pages · M8 backlinks · monthly monitoring | ⬜ Not started |

Unpushed local commits (as of this handoff): `ea36a43` ages 4–14, `a7d8bf5` program page + guides, `fc2c5ce` remove UCMAS / neutral UCMath, and the owner's own `d6f1758` (personality assessment). **Ask the owner before pushing.** The live site still says 4–18 and "iMath's own method" until these are pushed.

## 4. Next actions

1. Owner reviews the new content → add "Program" and "Guides/مصادر" links to `Header.tsx` and a Resources column to `Footer.tsx` (now unblocked: the owner committed their Header/Footer edits in `d6f1758`) → push with approval → submit the new URLs in Search Console.
2. Owner open items (in `doc/seo/content-review.md`): named tutor to credit as reviewer; whether families need to buy an abacus (add to the program FAQ); the "father of a high school student" testimonial conflicts with 4–14.
3. When the GA4 ID arrives: M2 (gate on an env var, conversions for booking steps, WhatsApp and assessment completion).
4. When the Keyword Planner CSVs arrive (seeds: `doc/seo/keyword-planner-seeds.txt`, 81 terms, 5 countries): rank clusters K1–K11 in `doc/seo/keyword-research.md`, then the next content batch: how-to-teach-at-home, printable worksheets PDF (linkable asset), child-struggling-with-math, `/about` with named tutors.
5. Owner/Vercel tasks still open: apex `imathmental.com` → www redirect is 307 (should be 308); report the Vercel function region + Convex region (TTFB, T12); confirm the sitemap was submitted in GSC and Bing.
6. Post-deploy checks not yet done: Rich Results Test, Facebook Sharing Debugger / WhatsApp preview, PageSpeed Insights on the live URL.
7. M3 follow-ups (P2): defer the booking stepper's zod/form code; pass only the needed message namespaces to `NextIntlClientProvider`.

## 5. Where things are

| What | Where |
|---|---|
| Plan, audit, KPIs, milestone log | `SEO_MASTER_PLAN.md` |
| Keyword clusters + competitor review | `doc/seo/keyword-research.md` |
| Content review checklist | `doc/seo/content-review.md` |
| Per-page metadata helper (canonical, hreflang, OG) | `src/lib/seo.ts` → `buildPageMetadata()`; `INDEXABLE_PAGES` drives the sitemap |
| JSON-LD builders | `src/lib/structured-data.ts`, `src/components/seo/JsonLd.tsx` |
| Long-form content (typed, AR+EN, `[label](/path)` links) | `src/content/` (`program.ts`, `resources/*.ts`, registry `resources/index.ts`) |
| Article page layout | `src/components/content/ArticleLayout.tsx` |
| Page titles/descriptions (short pages) | `messages/*.json` → `Seo`, `Resources` |
| Share images | `public/og/imath-{ar-v2,en-v3}.jpg`; bump `-vN` whenever an image changes (social networks cache by URL). Rendered from HTML with headless Chrome because `next/og` can't shape Arabic. |

**Adding a guide:** create `src/content/resources/<slug>.ts` (copy an existing one), add it to `RESOURCES` in `index.ts`. The route, sitemap, schema and tests pick it up automatically. Add the path to `PAGES` in `scripts/seo-check.mjs`.

## 6. Validation (run before every commit/deploy)

```bash
npm test                         # unit tests incl. tests/seo.test.ts and tests/content.test.ts
npx eslint src tests scripts     # expect 0 errors (8 old warnings)
NEXT_PUBLIC_SITE_URL=https://www.imathmental.com npm run build
npx next start -p 3123           # then:
node scripts/seo-check.mjs http://localhost:3123 https://www.imathmental.com
node scripts/seo-check.mjs https://www.imathmental.com   # against production after deploy
```

`seo-check.mjs` verifies status codes, `<html lang/dir>`, unique titles ≤ 60 chars, descriptions ≤ 160, self-canonicals, hreflang ar/en/x-default, OG/Twitter tags, JSON-LD validity, FAQ answers visible, no browser-cached HTML, admin noindex, and 404s.

## 7. Working rules learned in this project

- **Commit locally; ask before every push** (pushing = deploying to production).
- The owner sometimes edits files in parallel. Stage only your own paths and never `git add -A` blindly. Check `git status` first.
- Windows + Git Bash:
  - Stop test servers **by port** (`Get-NetTCPConnection -LocalPort 3123`), never `taskkill //IM node.exe` (it kills the owner's dev servers).
  - Python isn't installed; use Node scripts.
  - Git Bash rewrites `/paths` passed as arguments: use `MSYS_NO_PATHCONV=1`.
  - Files are LF with `core.autocrlf=true`; normalise `\r\n` before exact-string edits.
  - In JS `String.replace`, `$\`` in the replacement is special; use split/join for literal replacements.
- The production build fails on purpose without `NEXT_PUBLIC_SITE_URL` when `VERCEL_ENV=production`.
- `pdf.ts` embeds the TTF fonts by family name `SomarRounded`. Keep that family name and the TTFs in `public/font`.
- The PageSpeed Insights anonymous API quota runs out quickly; use local Lighthouse (`npx lighthouse … --form-factor=mobile`) for before/after.
