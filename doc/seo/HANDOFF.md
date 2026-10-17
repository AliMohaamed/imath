# SEO Project Handoff

**Read this first in any new session.** Snapshot as of 2026-10-16. The full plan, audit and roadmap live in `SEO_MASTER_PLAN.md` (root). This file covers current state and how to work.

## 1. Project in one paragraph

iMath (https://www.imathmental.com, Vercel) is an online academy teaching **1:1 mental math to students aged 4–18** (abacus/soroban first, then mental visualisation, then tool-free). Markets: Egypt plus Saudi Arabia, UAE, Kuwait and Qatar. Arabic is the default locale at `/`, English is at `/en` (next-intl, `localePrefix: "as-needed"`). Stack: Next.js 16 App Router, React 19, Tailwind 4, next-intl 4, Convex (admin, leads, assessments). Conversions: free trial booking (homepage stepper) and WhatsApp.

## 2. Owner decisions (fixed, don't revisit)

- **UCMAS must never be mentioned anywhere on the website.** iMath has no affiliation with it. Don't target UCMAS keywords or write comparison content.
- **UCMath** = the name of the structured mental math program students follow. Describe it neutrally ("the UCMath method/program"). **Never** call it "iMath's own/proprietary method".
- **Ages 4–18** in all copy, meta, schema and images (owner, 2026-10-17; this reverses a short-lived 4–14 decision). Forms accept up to 18.
- Level length varies by student (about 1–3 months). Sessions are 60 minutes. Families buy the abacus themselves (not mentioned on the site).
- No named tutor/reviewer: articles are written and reviewed with Claude Code; the byline is "By the iMath team" / "بقلم فريق iMath". Pricing copy never promises a number of completed levels. "Certified/accredited" wording stays (the owner confirms a genuine accreditation).
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
| M5 content: `/program`, `/resources` hub, 3 guides, header/footer links, 4–18 ages, UCMath neutral wording | 🟡 **Committed locally, NOT pushed**, awaiting owner review (`doc/seo/content-review.md`) |
| M2 analytics (GA4 via `@next/third-parties`, wire existing `trackEvent` names as conversions) | ⏳ Waiting for the GA4 Measurement ID from the owner |
| M6 AI search/entity · M7 country/age pages · M8 backlinks · monthly monitoring | ⬜ Not started |

Unpushed local commits: run `git log --oneline origin/main..HEAD`. **Ask the owner before pushing.** The live site still says "iMath's own method" until these are pushed.

## 4. Next actions

1. Push with approval → submit the new URLs in Search Console. (Header/footer links are done.)
2. Owner content review: all items answered (2026-10-17); see `doc/seo/content-review.md`.
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
| Share images | `public/og/imath-{ar-v3,en-v4}.jpg`; source `scripts/og-card.html` (render steps in its header comment, JPEG via `sharp`). Bump `-vN` whenever an image changes (social networks cache by URL). |

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
