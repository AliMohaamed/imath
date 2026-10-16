# iMath SEO Master Plan

**Status:** Phase 1–3 deliverable (research, audit, strategy). No code has been changed yet.
**Date:** 2026-10-16
**Scope:** The iMath marketing site (`src/app/[locale]/(marketing)`), shared layouts, metadata routes, assets, and off-site brand/authority work. The admin area is in scope only to keep it out of the index.

Evidence labels used throughout:

- **[CONFIRMED]**: reproduced against a local production build (`next build && next start`, `NEXT_PUBLIC_SITE_URL=https://imath.example`) or read directly in the code.
- **[LIKELY]**: strong signal in the code, but it needs production or Search Console data to confirm.
- **[NEEDS DATA]**: can't be judged without access we don't have yet (GSC, analytics, keyword tool, live domain).

---

## 0. Executive summary

The site is a single bilingual landing page (Arabic by default at `/`, English at `/en`), plus an assessment hub with two interactive tests and the legal pages. The technical base (Next.js 16 App Router, next-intl, server-rendered HTML) suits SEO well. However, the audit found several **critical defects that block or misdirect indexing right now**:

1. **`/robots.txt` and `/sitemap.xml` return 404 [CONFIRMED].** The proxy matcher sends them through the next-intl middleware, which rewrites them to `/ar/robots.txt` and `/ar/sitemap.xml`. Search engines currently see neither file.
2. **Privacy and Terms canonicalize to the homepage and reuse the homepage title and description [CONFIRMED].** Both are client components with no `generateMetadata`, so they inherit the layout's `canonical: "/"`.
3. **`<html>` has no `lang` or `dir` [CONFIRMED].** Both are set on an inner `<div>`. Search engines (Bing in particular) and assistive technology read language from `<html lang>`.
4. **FAQ structured data describes content that isn't in the HTML [CONFIRMED].** Answers are rendered only for the open accordion item (`activeIdx === idx && …`), so the FAQPage JSON-LD has no visible counterpart.
5. **The LCP hero image is a 3.85 MB PNG served with `unoptimized` and `priority` [CONFIRMED].** This is the single largest Core Web Vitals risk.
6. **Every page is dynamic with `Cache-Control: private, no-store` [CONFIRMED],** because the marketing layout reads `cookies()` for geo pricing. No page can be cached at the CDN edge, which increases TTFB everywhere.
7. **No analytics is installed [CONFIRMED].** `trackEvent` pushes to `window.dataLayer`, but no GTM or GA4 script exists, so there is no baseline to measure SEO against.
8. **Topical footprint is close to zero.** There is one landing page and no educational or informational content, so there is nothing to rank for beyond brand and a few head terms. This is the biggest long-term growth gap.

Fixing items 1–7 is a few days of focused work (Milestones 1–3). Item 8 is the long-term program (Milestones 5–7).

---

## 1. Project understanding (Phase 1)

| Area | Finding |
|---|---|
| Business | Online 1:1 mental math tutoring ("UCMath" methodology) for ages 4–18. Conversions: free trial booking (stepper → `/api/leads` → Convex + Telegram) and WhatsApp. |
| Markets | Egypt (default pricing country `EG`), plus SA, KW, AE, QA in `areaServed`. Geo pricing comes from the `x-vercel-ip-country` cookie. |
| Languages | Arabic (default, unprefixed `/`) and English (`/en`), via next-intl with `localePrefix: "as-needed"`. |
| Stack | Next.js 16.2 (App Router, React Compiler, Turbopack), React 19, Tailwind 4, next-intl 4, Convex, deployed on Vercel. |
| Indexable routes | `/`, `/assessment`, `/assessment/level`, `/assessment/personality`, `/privacy`, `/terms`, each also under `/en`. That's 12 URLs. |
| Non-indexable | `/admin*` (auth-gated), `/api/*`. |
| Production domain | **`https://www.imathmental.com`** (live, served by Vercel). The apex redirects to www with a **307 (temporary)**; http → https is 308. |
| Current visibility | **[NEEDS DATA: GSC]** The site is live, but robots.txt and the sitemap both 404 in production (verified 2026-10-16). Web searches for "iMath mental math", "imath.edu.eg" and Arabic category terms returned no iMath results. The name "iMath" collides with several unrelated entities (an EU Erasmus+ project, a practice app). Either the site is pre-launch, or it isn't indexed yet. |

### 1.1 Rendered-output check (local production build)

| URL | Status | `<title>` | Canonical | Notes |
|---|---|---|---|---|
| `/` | 200 | iMath \| أكاديمية حساب ذهني 1:1 أونلاين للأطفال | `/` | 200 KB HTML, 2 JSON-LD blocks |
| `/en` | 200 | iMath \| 1:1 Mental Math and UCMath for Ages 4-18 | `/en` | |
| `/ar` | 307 → `/` | | | Correct |
| `/privacy` | 200 | **homepage title** | **`/` (wrong)** | |
| `/en/terms` | 200 | **homepage title** | **`/en` (wrong)** | |
| `/assessment` | 200 | اكتشف مستوى طفلك مجانًا \| iMath | self | OK |
| `/en/assessment/level` | 200 | Discover your mental math level \| iMath | self | OK |
| `/nonexistent` | 404 | | | Correct status |
| `/robots.txt` | **404** | | | Critical |
| `/sitemap.xml` | **404** | | | Critical |
| `/en/admin/login` | 200 | homepage EN title | | **No `noindex`** |

Other observations:

- HTML `<link rel="alternate" hreflang>` contains only `ar` and `en`, with no `x-default`. Meanwhile next-intl's middleware sends an HTTP `Link:` header with `ar`, `en` **and** `x-default` for every page. That means two hreflang sources that disagree, and on Privacy/Terms they point at different URLs.
- The `?utm_source=x` canonical correctly strips the parameter.
- `og:image` is the 512×512 logo, paired with `twitter:card=summary_large_image`, so share previews will crop badly.

---

## 2. Skill evaluation (Find Skills)

I used the `find-skills` skill (`npx skills find …`) across seven queries (seo, seo audit, nextjs seo, geo ai search, hreflang, schema markup, keyword research), then read the SKILL.md files of the strongest candidates. Install counts below come from skills.sh as of 2026-10-16.

### 2.1 Selected (already installed in `~/.claude/skills`, verified)

| Skill | Source | Installs | Why |
|---|---|---|---|
| **seo-audit** | coreyhaines31/marketingskills | 229K | The most-installed SEO skill. Has a strong evidence-first framework and an international SEO reference that covers the `as-needed` Next.js pitfalls. Used as the backbone of this audit. |
| **schema** | coreyhaines31/marketingskills | 73K | JSON-LD for Organization/Course/FAQ/Breadcrumb, with guideline caveats. |
| **site-architecture** | coreyhaines31/marketingskills | 118K | URL hierarchy, navigation, and internal linking for the new content hub. |
| **seo-hreflang** | agricidaniel/claude-seo | 6.4K | Narrow, does one thing well: validates hreflang and x-default in HTML, headers, and sitemap. |
| **core-web-vitals** | addyosmani/web-quality-skills | — | LCP/INP/CLS diagnosis from field and lab data. Covers performance better than any "SEO" skill. |

### 2.2 Recommended to add (install when the milestone needs it)

| Skill | Install | Milestone | Why |
|---|---|---|---|
| **ai-seo** | `npx skills add coreyhaines31/marketingskills --skill ai-seo` | M6 | 144K installs, v2.9, same author family as our core skills, so no conflicting advice. It covers AEO/GEO, agent readiness, answer accuracy, and AI attribution. It is the best-maintained GEO skill. |
| **content-strategy** | `npx skills add coreyhaines31/marketingskills --skill content-strategy` | M5 | 158K installs. Pillar/cluster planning for the resource hub. |
| **programmatic-seo** | `npx skills add coreyhaines31/marketingskills --skill programmatic-seo` | M7 (evaluation only) | 145K installs. Its "unique value per page / avoid doorway pages" rules are what we need to judge country and age pages. |
| **competitors** | `npx skills add coreyhaines31/marketingskills --skill competitors` | M5 | 74K installs. Structured competitor and alternative-page research. |

### 2.3 Rejected or deferred (with reasons)

| Skill(s) | Reason |
|---|---|
| `aaron-he-zhu/seo-geo-claude-skills` (keyword-research, competitor-analysis, content-gap-analysis, schema-markup-generator, on-page-seo-auditor, technical-seo-checker, meta-tags-optimizer, internal-linking-optimizer, backlink-analyzer, rank-tracker, alert-manager, entity-optimizer, etc.) | **The repo is now a signpost.** Fetching `research/keyword-research/SKILL.md` returns "this skill has moved". The standalone copies are frozen at v9.9.12, and active development moved to `aaron-he-zhu/aaron-marketing-skills`. Installing from the URLs in the original list would give us unmaintained copies. Most of these also duplicate seo-audit and schema. If we later need its backlink or rank-tracking workflows, install from the new bundle. |
| `addyosmani/web-quality-skills --skill seo`, `davila7 seo-optimizer`, `sickn33 seo-fundamentals`, `calm-north diagnose-seo`, `agricidaniel seo-technical / seo-page / seo-content / seo-plan` | Overlap with seo-audit, which is more complete and better maintained. |
| `resciencelab/opc-skills seo-geo` (52K) | Its per-platform sections ("ChatGPT does X, Perplexity does Y") make ranking claims that aren't evidence-based. Our instruction #10 rules that out. ai-seo covers the same ground more carefully. |
| `laguagu nextjs-seo` (2.3K) | The SKILL.md path no longer resolves on `main`, and the Next.js-specific details are covered by seo-audit's i18n reference plus the Next.js docs. |
| `jezweb seo-local-business`, `calm-north rank-local` | iMath is an online service with no storefront. Local-pack SEO only matters if a Google Business Profile with a real address exists (see open questions). seo-audit has a `local-seo.md` reference if needed. |
| `ecommerce-seo-audit`, `migrate-site`, `recover-content`, `seo-review` (33-js-concepts) | Don't apply here: no e-commerce, no migration, no traffic loss, and seo-review is tied to another project. |
| Keyword, backlink, and rank tools that need paid APIs (Ahrefs, Semrush, DataForSEO) | No credentials are available. These skills can't produce real numbers without them, so keyword volumes stay **[NEEDS DATA]** until we connect Google Keyword Planner or Search Console (free). |

---

## 3. Full audit findings (Phase 2)

Priority: **P0** = blocks or misdirects indexing · **P1** = high impact · **P2** = medium · **P3** = polish.
Effort: S < 2h · M ≤ 1 day · L > 1 day.

### 3.1 Crawlability & indexation

| ID | Issue | Evidence | Impact | Fix | Pri | Effort |
|---|---|---|---|---|---|---|
| T1 | `/robots.txt` and `/sitemap.xml` return 404 | `curl` → 404 text/html. `src/proxy.ts` matcher doesn't exclude `robots.txt`, `sitemap.xml`, or `.xml`/`.txt`, so next-intl rewrites them to `/ar/...` | Crawlers find no sitemap and no robots rules | Add `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `icon.png`, and `.*\.(?:xml\|txt)` to the matcher's negative lookahead | **P0** | S |
| T2 | Privacy and Terms canonicalize to the homepage with the homepage title and description | Rendered `<link rel=canonical href="https://imath.example">` on `/privacy` | Pages get folded into the homepage. Duplicate title signals. | Split each into a server `page.tsx` with `generateMetadata` (title, description, self-canonical, alternates) plus the existing client body | **P0** | S |
| T3 | Layout-level `alternates.canonical` is inherited by any page that forgets to override it | `src/app/[locale]/layout.tsx` sets `canonical: path` (home) | Every future page carries this risk | Remove canonical and languages from the layout. Add a `buildPageMetadata(locale, path, copy)` helper in `src/lib/site.ts` that every page must use. | P1 | S |
| T4 | `SITE_URL` falls back to `VERCEL_URL` (preview host) or `http://localhost:3000` | `src/lib/site.ts` | Canonicals and hreflang could point to preview domains if the env var is missing | Require `NEXT_PUBLIC_SITE_URL` in production (throw at build time when `VERCEL_ENV==="production"` and it's unset). Use `VERCEL_PROJECT_PRODUCTION_URL` before `VERCEL_URL`. | P1 | S |
| T5 | Admin login has no `noindex` and uses the homepage title | Rendered `/en/admin/login` | Login page may get indexed (robots `Disallow` doesn't prevent indexing of linked URLs) | `robots: { index: false, follow: false }` in the `(admin)` layout metadata. Keep the robots.txt disallow. | P1 | S |
| T6 | `robots.ts` uses a non-standard `host` directive and lists no AI crawler policy | `src/app/robots.ts` | Minor (Google ignores `host`) | Drop `host`. Keep `Allow: /`. Decide the AI crawler policy explicitly (see G2). Also disallow `/ar/admin`. | P3 | S |
| T7 | Sitemap `lastModified = new Date()` on every request; `priority` and `changeFrequency` are ignored by Google | `src/app/sitemap.ts` | `lastmod` that never stays fixed trains Google to ignore it | Use real per-page dates (a constant map, or the git date at build time). Drop priority and changefreq. Add `/privacy` and `/terms`. Add `x-default`. | P2 | S |
| T8 | All pages are dynamic and uncacheable (`Cache-Control: private, no-store`) | Build output shows `ƒ` for every route. `cookies()` in `(marketing)/layout.tsx`. | Higher TTFB, and no edge caching for crawlers or users | See P3 (performance). Move the geo-cookie read client-side or behind a Suspense boundary so marketing pages can be static or ISR. | P1 | M |
| T9 | The root `not-found.tsx` is a client component that renders its own `<html lang="ar">` | `src/app/not-found.tsx` | Fine for status codes. Only cosmetic or a11y. | Keep it, but render it server-side. Low priority. | P3 | S |
| T11 | Apex `imathmental.com` → www uses **307 Temporary** [CONFIRMED live] | `curl` | A temporary redirect consolidates signals more slowly | Vercel → Domains: set the apex redirect to **308 Permanent** | P1 | S |
| T12 | Homepage TTFB 2.3 s cold (0.4 s warm); function runs in `iad1` (US East) for MENA users [CONFIRMED live] | `curl` timing, `X-Vercel-Id: fra1::iad1` | Slow first byte for crawlers and users | Static rendering (T8/P3) removes most of it. Also set the Vercel function region close to the Convex deployment and the users (e.g. `fra1`) after checking the Convex region. | P1 | S |
| T10 | **[NEEDS DATA]** Index coverage, crawl stats, and manual actions | Needs GSC | | Verify the domain property in GSC and Bing Webmaster Tools | P0 (setup) | S |

### 3.2 International SEO (Arabic / English)

| ID | Issue | Evidence | Fix | Pri | Effort |
|---|---|---|---|---|---|
| I1 | `<html>` lacks `lang`/`dir`; they sit on a `<div>` | Rendered `<html>` has no attributes. `src/app/layout.tsx` + `[locale]/layout.tsx`. | Move `<html lang={locale} dir={dir}>` and `<body>` into `[locale]/layout.tsx` (the next-intl recommended pattern), and make the root layout pass-through. Add `generateStaticParams` for locales. | **P0** | M |
| I2 | Conflicting hreflang sources: HTML (`ar`, `en`) vs middleware `Link:` header (`ar`, `en`, `x-default`) | `curl -I /` | Pick one source and make the others agree. Recommendation: keep next-intl's header (it's correct per-path) **and** add `x-default` to the HTML and sitemap so all three match. Alternatively, set `alternateLinks: false` in routing and own hreflang in HTML and sitemap only. | P1 | S |
| I3 | No `x-default` in HTML or sitemap | Rendered HTML | `x-default` → Arabic root (`/`), which is the default locale | P1 | S |
| I4 | `og:locale` without `og:locale:alternate` | Rendered OG tags | Add `alternateLocale` (`en_US` ↔ `ar_EG`). Consider `ar_AR` vs `ar_EG`: content serves all of MENA, so `ar_AR` is the neutral choice. | P3 | S |
| I5 | Locale detection redirects `/` to `/en` for English `Accept-Language` users (next-intl default) | next-intl behavior | Googlebot sends no Accept-Language, so it gets Arabic. That's acceptable. Keep it, but make sure the language switcher is a crawlable `<a>` link, which it is. | OK | — |
| I6 | Language targeting only (`ar`, `en`); no region variants | Design decision | **Keep language-only hreflang.** Content doesn't differ per country, so `ar-EG`/`ar-SA` variants would be duplicate pages. Revisit only if we build genuinely different country pages (M7). | OK | — |
| I7 | Translation quality and dialect | `messages/ar.json` is Modern Standard Arabic with some Egyptian phrasing | Keep MSA for MENA-wide reach. Review key pages with a native editor. Use Egyptian colloquial terms only where search data shows they matter (e.g. "حصص" vs "دروس"). | P2 | M |

### 3.3 On-page

| ID | Issue | Evidence | Fix | Pri |
|---|---|---|---|---|
| O1 | Homepage titles lead with the brand, not the query | `iMath \| أكاديمية حساب ذهني…` | Lead with the query, put the brand last. AR: `دروس حساب ذهني أونلاين للأطفال 1:1 \| iMath`. EN: `Online Mental Math Classes for Kids (1:1) \| iMath`. Validate wording with GSC queries once data exists. | P1 |
| O2 | `meta keywords` is emitted | `keywords` in `site.ts` | Ignored by Google, and it hands our keyword list to competitors. Remove it. | P3 |
| O3 | Hero H1 contains a `<highlight>` rich tag. It renders fine, but the H1 content is a slogan. | `Marketing.hero.title` | Keep the slogan, but make sure "الحساب الذهني" and "أونلاين" appear in the H1 or the first paragraph | P2 |
| O4 | Hero `alt="iMath Student"` is the same in both locales | `Hero.tsx` | Localized, descriptive alt via messages | P2 |
| O5 | Decorative assessment icons use `alt=""`, which is correct | | No change | OK |
| O6 | Assessment pages have multiple `<h1>` across conditional states | Only one renders at a time | Verify that only one H1 is in the DOM per state. No change expected. | P3 |
| O7 | Legal pages show "© 2024", and Terms is "Last updated: March 2024" | `privacy/terms page.tsx`, messages | Generate the year dynamically. Review the Terms date. These are trust signals. | P3 |
| O8 | Internal linking: header and footer link to `/#sections`, `/assessment`, privacy, and terms. The assessment hub isn't linked contextually from FAQ or answers. | `Header.tsx`, `Footer.tsx` | Add contextual links once content exists (M5). Add breadcrumbs on deep pages. | P2 |
| O9 | Social proof claims ("+500 طالب", "افضل أكاديمية … في الوطن العربي") | `messages/ar.json` | Owner confirms both. To make them credible to users and AI systems, show supporting evidence next to the claim (student count, competition results, parent reviews on Google or Facebook). Never mark them up as review or rating schema. Also fix the typo "افضل" → "أفضل". | P3 |

### 3.4 Structured data

| ID | Issue | Fix | Pri |
|---|---|---|---|
| S1 | The FAQPage JSON-LD answers aren't in the HTML (accordion renders only the open item) | Render all answers in the DOM (`<details>/<summary>` or `hidden` + CSS) so the markup matches visible content. Note: since 2023 Google shows FAQ rich results only for authoritative government and health sites, so the value is machine understanding (and AI answers), not SERP stars. | **P1** |
| S2 | `EducationalOrganization` has no `logo`, `sameAs`, `@id`, `alternateName`, or `contactPoint`, and `telephone` lacks the `+` | Build one `@id`-linked graph: `Organization`/`EducationalOrganization` (`@id: SITE_URL#org`, logo, sameAs Instagram/Facebook, contactPoint with `+201144146194`, `availableLanguage`, `areaServed` as `Country` objects) + `WebSite` (`@id #website`, `inLanguage`, publisher → org) + `WebPage` per page. | P1 |
| S3 | No `Course` / `Service` markup for the program | Add a `Course` for the UCMath program (`provider` → org, `inLanguage` [ar, en], `hasCourseInstance` with `courseMode: "online"`, `offers` only if prices are stable and visible on the page). Validate in the Rich Results Test. | P2 |
| S4 | No `BreadcrumbList` on `/assessment/*`, legal pages, or future content | Add with the content hub | P2 |
| S5 | Do **not** add `AggregateRating`/`Review` for our own testimonials | Self-serving reviews are ineligible and against guidelines | Guardrail |
| S6 | JSON-LD is serialized without escaping `<` | `JSON.stringify` inside `dangerouslySetInnerHTML` | Escape `<` as `<` (Next.js recommendation) | P2 |

### 3.5 Performance & Core Web Vitals

| ID | Issue | Evidence | Fix | Pri | Effort |
|---|---|---|---|---|---|
| P1 | LCP image `hero_image1.png` is 3.85 MB, `unoptimized` | `Hero.tsx`, `public/images` | Remove `unoptimized` (or pre-export a ~1200 px WebP/AVIF under 150 KB). Keep `priority` and `sizes`. Delete the unused `hero.png` (3.2 MB) and `hero_image.png` (1.1 MB) after confirming no references. | **P0** | S |
| P2 | Six TTF weights (~900 KB total), no WOFF2, no preload, no subsetting | `globals.css`, `public/font` | Convert to WOFF2 and subset to Arabic + Latin. Ship 3–4 weights. Use `next/font/local` (self-hosted, preloaded, size-adjusted fallback to cut CLS). | P1 | M |
| P3 | Fully dynamic rendering (see T8) | | Make marketing pages static per locale (`generateStaticParams` + `setRequestLocale`). Read geo cookies on the client (GeoPricingProvider already exists) or render prices in a small dynamic island. Check whether the `ConvexAuthNextjsServerProvider` at locale level forces dynamic rendering, and if so, scope it to `(admin)`. | P1 | M–L |
| P4 | Homepage HTML is 200 KB (RSC payload + 12 client sections) | `curl` size | Convert presentational sections (`SocialProofBar`, `MentalMathSection`, `HowItWorks`, `Testimonials` parts) to server components where they don't need state. Lazy-load the booking stepper below the fold. | P2 | M |
| P5 | `animate-in fade-in zoom-in duration-1000` on the hero image container | `Hero.tsx` | Opacity-from-0 animations on the LCP element delay LCP. Remove the animation from the LCP element. | P1 | S |
| P6 | **[NEEDS DATA]** Field CWV (CrUX), mobile Lighthouse | Needs the live URL | Baseline with PageSpeed Insights (mobile + desktop) for `/`, `/en`, and `/assessment` before M3. Re-measure after. | P1 | S |

### 3.6 Content, keywords, topical authority

| ID | Finding | Pri |
|---|---|---|
| C1 | One commercial page per language; zero informational content. No page can rank for "what is mental math", "benefits of mental math for children", "mental math vs abacus", "multiplication tricks", and so on. | P1 (long-term) |
| C2 | The brand name "iMath" is ambiguous (unrelated EU project, apps). Entity disambiguation is needed: consistent name ("iMath Academy" / "أكاديمية iMath"), `alternateName`, `sameAs`, and the same NAP everywhere. | P1 |
| C3 | **"UCMath" is iMath's own proprietary method (confirmed by the owner).** Treat it as a second brand entity: a dedicated `/program` page explaining UCMath, consistent spelling ("UCMath" / "يو سي ماث"), and `Course` schema naming it. Don't target the unrelated UCMAS brand terms. UCMAS is well known in the region, so the program page should say plainly that UCMath is iMath's own method, so that users and AI answers don't confuse the two. | P1 |
| C4 | No author or tutor pages, no credentials page. E-E-A-T for a children's education service relies on visible people, qualifications, and methodology. | P1 |
| C5 | Assessments are strong, unique, linkable assets (free level test, personality test). They are under-promoted as content, with no explanatory copy around the tool, so the pages are thin for search. | P2 |
| C6 | **[NEEDS DATA]** Keyword volumes and difficulty for AR/EN, by country (EG, SA, AE, KW, QA). No paid tool access. Use Google Keyword Planner (free with an Ads account) + GSC + Google autocomplete/People Also Ask. | P1 |

### 3.7 Authority & backlinks

| ID | Finding | Pri |
|---|---|---|
| A1 | **[NEEDS DATA]** Backlink profile. No Ahrefs/Semrush access. GSC "Links" report is free once verified. Expect near-zero links if the domain is new. | P1 |
| A2 | Contact email is a Gmail address. A domain email (`hello@<domain>`) is a cheap trust and entity signal. | P2 |
| A3 | Social profiles exist (Instagram, Facebook `iMathMental`). They should link back to the site and use the identical name and description. | P2 |

### 3.8 GEO / AEO (AI search)

| ID | Finding | Pri |
|---|---|---|
| G1 | AI systems retrieve and cite pages that clearly answer questions. We currently have only 7 FAQ items, and their answers aren't even in the HTML (S1). | P1 |
| G2 | robots.txt is 404 (T1), so crawl policy is implicitly "allow all". Decide on an explicit policy: allow search and retrieval bots (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, ClaudeBot/Claude-SearchBot). Training bots (GPTBot, Google-Extended, CCBot) are a business choice; recommend allow, for brand visibility. | P2 |
| G3 | `llms.txt`: no evidence that major engines use it for ranking or citation. Optional, cheap, and harmless. Implement only as a low-priority experiment and don't count it as an SEO win. | P3 |
| G4 | Entity consistency (C2) plus third-party mentions (directories, parenting media, school partners) are what AI answers draw on for "best online mental math academy" queries. That makes this off-site work. | P1 |

### 3.9 Analytics & monitoring

| ID | Finding | Pri |
|---|---|---|
| M1 | No analytics script. `trackEvent` pushes to a `dataLayer` that nothing reads. | **P0** |
| M2 | No GSC / Bing Webmaster verification. | **P0** |
| M3 | No automated SEO regression tests (the existing `tests/` cover assessments only). | P1 |

---

## 4. Strategy (Phase 3)

### 4.1 Positioning and keyword strategy

Audience: **parents** (not children), Arabic-first across Egypt and the GCC, with an English-speaking expat and international-school segment.

Keyword clusters (**hypotheses: volumes must be validated in M5 with Keyword Planner and GSC before writing**):

| Cluster | Intent | Example AR queries | Example EN queries | Target page |
|---|---|---|---|---|
| Core service | Commercial | حساب ذهني للأطفال، كورس حساب ذهني أونلاين، دروس حساب ذهني اونلاين، أكاديمية حساب ذهني | online mental math classes for kids, mental math tutor online, 1:1 math tutoring Egypt/Dubai | `/` and `/en` |
| Program/method | Commercial-investigational | منهج الحساب الذهني، مستويات الحساب الذهني، الحساب الذهني بالأباكوس أو بدون | mental math program levels, mental math vs abacus | `/program` (new) |
| Age-based | Commercial | حساب ذهني لعمر 5 سنوات، للأطفال من 6 سنوات | mental math for 5 year olds, for teens | Age sections (new; see M7 test) |
| Education / problem | Informational | ما هو الحساب الذهني، فوائد الحساب الذهني للأطفال، هل الحساب الذهني مفيد، كيف أعلم طفلي الحساب الذهني، طفلي ضعيف في الرياضيات | what is mental math, benefits of mental math for kids, how to improve child's math skills | `/resources/*` hub |
| Tools / practice | Informational, linkable | تمارين حساب ذهني، اختبار حساب ذهني للأطفال، جدول الضرب بطريقة سهلة | mental math test for kids, mental math practice | `/assessment/*` + free practice tool |
| Brand | Navigational | آي ماث، iMath حساب ذهني | iMath academy | `/`, `/about` |

Rules: one primary query per URL, no cannibalization (the homepage owns "حساب ذهني للأطفال أونلاين"; articles own informational queries and link to the homepage or trial).

### 4.2 Target site architecture

```
/                        (AR home: commercial)            /en
/program                 Method, levels, outcomes          /en/program
/pricing                 Plans per country (visible)       /en/pricing      [optional: only if it becomes its own page]
/about                   Story, team, tutors, credentials  /en/about
/assessment              Hub (exists)                       /en/assessment
  /level  /personality   (exist; add explanatory copy)
/resources               Hub of guides                      /en/resources
  /what-is-mental-math
  /mental-math-benefits-for-kids
  /mental-math-vs-abacus
  /how-to-teach-mental-math-at-home
  /mental-math-tricks-for-kids
  …
/faq                     Expanded FAQ (optional; keep homepage FAQ short)
/privacy  /terms
```

- Keep `as-needed` prefixes. Changing URL structure isn't worth it, and it's correct with hreflang plus `x-default`.
- English slugs in both locales (`/resources/what-is-mental-math` and `/en/resources/what-is-mental-math`). Arabic slugs are optional; ASCII is simpler to share and maintain.
- Every new page: self-canonical, hreflang pair (only if both languages exist; otherwise none), breadcrumb, and a link to the trial or assessment.
- Content storage: MDX or typed TS content files in-repo (no CMS dependency). Decide in M5.

### 4.3 Internal linking

- Header: add "البرنامج / Program" and "مصادر / Resources" once those exist.
- Footer: a "Resources" column with the 4–6 best guides.
- Every article → homepage trial CTA + `/assessment` + 2–3 sibling articles.
- Homepage FAQ answers → relevant guide (one link each, descriptive anchor).
- Assessment result pages → relevant guides (e.g. "how to improve speed").

### 4.4 Authority plan (sustainable, no paid links)

1. **Foundational profiles:** Google Business Profile (only if eligible; online-only businesses need a real service area or address), Bing Places, Facebook and Instagram with matching NAP and link.
2. **Directories that parents use:** Egyptian and Gulf education directories, tutoring marketplaces (myprivatetutor.ae and similar), school-parent communities.
3. **Linkable assets:** the free level test plus a printable "mental math practice sheets by level" pack (AR/EN), and an annual "how fast do kids calculate" data piece built from anonymized assessment aggregates. That data is unique, which journalists and bloggers cite.
4. **Partnerships:** international schools and nurseries (guest workshops → links from school sites), parenting bloggers and Instagram creators (review with disclosure).
5. **PR:** competition results (mental math competitions get covered in Egyptian media, e.g. El Watan reported Egyptian children winning an international mental arithmetic contest), student milestones, founder interviews.

### 4.5 AI-search strategy (evidence-based)

What we will do (each item is also good traditional SEO):

- Render all Q&A content as HTML. Answer the question in the first 1–2 sentences, then expand.
- One `@id`-linked Organization entity, identical name, description, and `sameAs` everywhere.
- Allow retrieval and search crawlers in robots.txt.
- Third-party mentions (directories, media, partner schools), since assistants rely heavily on them.
- Track AI referrals (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`) in GA4, and run a monthly manual prompt check (fixed prompt set, AR + EN, logged in a sheet).

What we won't claim: that `llms.txt`, specific schema types, or wording guarantee AI citations.

---

## 5. Implementation roadmap (Phase 4) with acceptance criteria

Each milestone ends with `npm run lint && npm test && npm run build`, a local `next start` crawl check, and a commit. Each milestone must pass before the next one starts.

### M0: Access and baseline (owner: business; ~1 day, no code)
- [x] Production domain: `https://www.imathmental.com`. Set `NEXT_PUBLIC_SITE_URL=https://www.imathmental.com` in Vercel Production.
- [ ] Vercel → Domains: change the apex redirect from 307 to 308 (T11).
- [ ] Verify the domain property in Google Search Console and Bing Webmaster Tools (DNS TXT).
- [ ] Create GA4 (or GTM) and get the measurement ID.
- [ ] Record the baseline: PageSpeed Insights (mobile and desktop) for `/`, `/en`, `/assessment`; `site:` query count; GSC coverage (if live).
- **Acceptance:** domain known, GSC verified, PSI baseline saved in `doc/seo/baseline-YYYY-MM-DD.md`.

### M1: Critical indexing fixes (P0) — ✅ implemented and validated locally 2026-10-16 (pending deploy)

Validation: `npm test` (65 pass, including the new `tests/seo.test.ts`); `npm run build` OK; `node scripts/seo-check.mjs http://localhost:3123 https://www.imathmental.com` passes for all 12 URLs plus robots, sitemap, admin, and 404. The same script against the live site fails on 53 checks (the pre-fix baseline). Browser check: AR renders RTL, the AR→EN client-side switch updates `<html lang/dir>` and the title, and there are no console errors.
Decision: `alternateLinks: false` in next-intl routing, so hreflang has two sources (HTML `<head>` and the sitemap), both built from `getLocaleAlternates()`.

- [ ] T1: exclude `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, and `.xml/.txt` from the proxy matcher.
- [ ] I1: `<html lang dir>` in `[locale]/layout.tsx`; root layout becomes pass-through; `generateStaticParams` for locales.
- [ ] T2/T3: `buildPageMetadata()` helper; Privacy and Terms get server `generateMetadata`; remove canonical inheritance from the layout.
- [ ] T4: production guard for `NEXT_PUBLIC_SITE_URL`.
- [ ] T5: `noindex` for `(admin)`.
- [ ] I2/I3: `x-default` in HTML and sitemap, consistent with the middleware `Link` header.
- **Acceptance:**
  - `curl -I /robots.txt` → 200 `text/plain`; `/sitemap.xml` → 200 `application/xml`.
  - Each of the 12 public URLs has a unique `<title>`, a self-referencing canonical, and hreflang `ar` + `en` + `x-default` that match the `Link` header.
  - `<html lang="ar" dir="rtl">` on AR pages, `<html lang="en" dir="ltr">` on EN pages.
  - `/en/admin/login` has `<meta name="robots" content="noindex, nofollow">`.
  - No visual or functional regression in booking, assessment, language switching, or admin login.

### M2: Analytics and monitoring foundation — 0.5 day
- [ ] Add GA4 via `@next/third-parties/google` (official Next.js package, lazy-loaded) or a GTM snippet, gated on an env var and loaded after consent if required.
- [ ] Wire the existing `trackEvent` names (booking steps, WhatsApp clicks, assessment completion) as GA4 conversions.
- [ ] Submit the sitemap in GSC and Bing.
- [ ] Add `tests/seo.test.ts`: unit tests for `buildPageMetadata`, sitemap output (all URLs absolute, hreflang reciprocal, x-default present), robots rules.
- **Acceptance:** events visible in GA4 DebugView; GSC shows the sitemap as "Success"; `npm test` covers SEO helpers.

### M3: Performance and Core Web Vitals — ✅ implemented and validated locally 2026-10-16 (pending deploy)

Lab results, local Lighthouse 13.5, mobile (simulated slow 4G, 4× CPU), homepage, median of runs. PageSpeed API quota was exhausted, so re-measure with PSI after deploy.

| Metric | Before (M1 build) | After |
|---|---|---|
| Performance score | 51–69 | 80–83 (one 70 outlier) |
| LCP | 24.9 s | 4.6–5.0 s |
| FCP | 3.0–3.2 s | 1.5–1.7 s |
| CLS | 0 | 0 |
| Page weight | 4.5 MB | 611 KB |
| JS transferred | 309 KB / 17 scripts | 279 KB / 16 scripts |
| Rendering | all pages dynamic, `no-store` | all 12 public pages SSG, `s-maxage` (CDN-cacheable) |
| Lighthouse SEO / a11y | — | 100 / 90 |

Done:
- Hero: 3.85 MB PNG → 1200 px WebP (105 KB source; 32 KB AVIF served at mobile width); `unoptimized` removed; correct 1:1 dimensions; `fetchPriority="high"`; no opacity animation on LCP elements. Unused hero PNGs deleted.
- Fonts: 6 TTF (~900 KB) → 4 subset WOFF2 (157 KB); 400 and 800 preloaded; immutable caching. TTFs kept because the PDF report embeds them.
- Static rendering: Convex auth providers scoped to `(admin)`; geo pricing read client-side via `useSyncExternalStore` (verified SA → SAR with an injected `x-vercel-ip-country`); `setRequestLocale` + `generateStaticParams`; next-intl `requestLocale` config; proxy only checks auth on admin routes.
- 5 static sections converted to server components (Hero, HowItWorks, MentalMathSection, SocialProofBar, Testimonials).
- `<main>` entrance animation made transform-only (opacity 0 made the hero ineligible as LCP).
- Tried and rejected: `experimental.inlineCss` doubled HTML to 496 KB with no LCP gain.

Remaining lab LCP (~4.8 s simulated) is JS/hydration-bound. Follow-ups (P2), to be decided against field data after deploy:
- [ ] Defer the booking stepper's form code (zod is the largest chunk, 61 KB, 82% unused at load) until it scrolls into view.
- [ ] Pass only the needed message namespaces to `NextIntlClientProvider` (all ~27 KB are serialized into every page).
- [ ] Set the Vercel function region next to the Convex deployment (T12).
- [ ] 3 `font-semibold` uses now render at 700 (SemiBold face dropped); restore it if the difference is noticeable.

- [ ] P1: optimized hero (WebP/AVIF, no `unoptimized`); remove unused hero PNGs.
- [ ] P5: no entrance animation on the LCP element.
- [ ] P2: `next/font/local` WOFF2 subset, ≤4 weights.
- [ ] P3/T8: static rendering of marketing pages; geo pricing as a client or dynamic island; scope the Convex auth provider to admin if it forces dynamic rendering.
- [ ] P4: server-component conversion of static sections; defer the booking stepper JS.
- **Acceptance:** build output shows `●`/`○` (SSG) for marketing routes; homepage `Cache-Control` is cacheable; Lighthouse mobile performance ≥ 90 on `/` and `/en` (lab); LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms in lab; hero transfer < 200 KB; geo pricing still correct for EG/SA/AE/KW/QA (manual cookie test); booking flow works.

### M4: On-page and structured data — 1–2 days
- [ ] O1: query-first titles and descriptions (AR/EN) for all pages, ≤ 60 chars for titles and ≤ 155 for descriptions.
- [ ] O2: remove `keywords`. O4: localized hero alt. O7: dynamic © year.
- [ ] S1: FAQ answers present in the DOM.
- [ ] S2: `@graph` with Organization + WebSite + WebPage. S3: Course (after verifying price visibility). S4: BreadcrumbList on deep pages. S6: escaped JSON-LD.
- [ ] A dedicated 1200×630 OG image per locale (static PNG, or `opengraph-image.tsx` via `next/og`), plus `og:locale:alternate`.
- [ ] Explicit robots.txt bot policy (G2).
- **Acceptance:** Rich Results Test and the Schema.org validator report zero errors for `/`, `/en`, `/assessment`; FAQ answer text found in the raw HTML via `curl`; OG previews correct in the Facebook Sharing Debugger and the WhatsApp preview.

### M5: Content foundation (E-E-A-T + hub) — 2–3 weeks
- [ ] Install `content-strategy` and `competitors` skills.
- [ ] Validate keyword clusters (Keyword Planner per country + GSC queries + PAA). Output: `doc/seo/keyword-map.md` (one primary query per URL).
- [ ] Competitor SERP review for the top 10 queries per language (who ranks, content type, depth, gaps).
- [ ] Build `/about` (team, tutor qualifications, methodology) and `/program` (levels, outcomes, session format).
- [ ] Build the `/resources` hub and the first 6 cornerstone articles per language (written or reviewed by a qualified tutor; author byline with credentials; `Article` schema with author `Person`).
- [ ] Add explanatory copy (what it measures, how to use results) to `/assessment/level` and `/assessment/personality` without hurting the test UX.
- **Acceptance:** each new page has a unique primary query, title/H1/URL alignment, ≥ 3 internal links in and out, is in the sitemap with a correct lastmod, and passes the M1 checks; the content is substantively helpful (not translated boilerplate), and the AR version is native-edited.

### M6: AI search and entity — 1 week, then ongoing
- [ ] Install the `ai-seo` skill and run its agent-readiness and answer-accuracy checks.
- [ ] Unify the entity: name, description, logo, and `sameAs` across the site, Instagram, Facebook, directories, and GBP (if eligible).
- [ ] Optional `llms.txt` (labelled experiment).
- [ ] GA4 channel group for AI referrers; monthly prompt-check log (`doc/seo/ai-visibility-log.md`).
- **Acceptance:** entity data identical across properties (checklist); AI referral segment live; first prompt-check baseline recorded.

### M7: Scale experiments (only after M5 shows traction) — evaluate first
- [ ] Install `programmatic-seo`. Evaluate:
  - **Country pages** (Egypt, Saudi Arabia, UAE, Kuwait, Qatar): justified only with genuinely local content (local currency pricing, time-zone schedules, local school curriculum alignment, local testimonials). That makes 5 hand-written pages, not a template.
  - **Age-group pages:** justified if the curriculum genuinely differs by age band.
  - **Practice-sheet / times-table tool pages:** high AR search demand is likely; must be a useful interactive tool, not doorway pages.
- **Acceptance:** a written go/no-go per experiment with demand data. Launch at most 1 experiment at a time and measure for 8 weeks before expanding.

### M8: Authority building — ongoing from M5
- Monthly targets: 2–4 relevant mentions or links (directories, partner schools, parenting media); 1 linkable asset per quarter.
- No link buying, PBNs, or reciprocal link schemes.

---

## 6. Testing & validation (Phase 5)

Per milestone:

| Check | Tool / command |
|---|---|
| Build, lint, unit tests | `npm run lint && npm test && npm run build` |
| Status codes, titles, canonicals, hreflang, robots meta for all public URLs | Scripted `curl` crawl against `next start` (to be added as `scripts/seo-check.mjs`, no new dependency) |
| Hreflang reciprocity, x-default, HTML vs header vs sitemap agreement | `seo-hreflang` skill + crawl script |
| Structured data | Google Rich Results Test, validator.schema.org |
| robots.txt / sitemap | `curl`, GSC robots.txt report, GSC sitemap status |
| Rendering | GSC URL Inspection "View crawled page" (post-deploy) |
| Performance | Lighthouse (mobile), PageSpeed Insights before/after, CrUX once traffic allows |
| Mobile / a11y | Lighthouse a11y ≥ 95, manual RTL check on iOS Safari and Android Chrome |
| Functional regression | Manual: booking stepper end-to-end, WhatsApp links, AR/EN switch on every page, geo-price override, both assessments incl. PDF report, admin login |
| Social previews | Facebook Sharing Debugger, WhatsApp link preview |

---

## 7. KPIs and monitoring (Phase 6)

No absolute targets are promised. Targets are relative to the M0 baseline and get revisited quarterly.

| KPI | Source | Cadence | Direction |
|---|---|---|---|
| Indexed pages vs submitted | GSC Pages | Weekly (first month), then monthly | 100% of intended URLs indexed |
| Non-brand impressions and clicks (AR, EN separately) | GSC Performance (filter excludes "imath/آي ماث") | Monthly | Up quarter over quarter |
| Queries in positions 4–20 | GSC | Monthly | Feed the "rankings push" workflow (seo-audit `rankings-push.md`) |
| Organic trial bookings and WhatsApp clicks | GA4 conversions, organic channel | Monthly | Up |
| Core Web Vitals (field) | GSC CWV / CrUX | Monthly | All "Good" |
| Referring domains | GSC Links | Monthly | Up, relevant only |
| AI referrals and prompt-check mentions | GA4 AI segment + manual log | Monthly | Tracked, no target |
| Technical errors (404s, canonical conflicts, hreflang errors) | GSC + `seo-check` script in CI | Each deploy / weekly | Zero |

Recurring process:

- **Each deploy:** `scripts/seo-check.mjs` + unit tests (fail the build on missing canonical/title/hreflang).
- **Monthly (1 hr):** GSC review, striking-distance list, content refresh queue, AI prompt check, link outreach log.
- **Quarterly (half day):** competitor SERP re-check, keyword map update, content gap review, KPI review, plan update in this file.
- **Annually:** full re-audit with seo-audit.

---

## 8. Open questions (needed from the business)

1. ~~Production domain~~ → `https://www.imathmental.com` (live).
2. ~~GSC / GA4 / Bing access~~ → the owner has full access and will set them up.
3. ~~"UCMath"~~ → iMath's proprietary method.
4. ~~Claims~~ → the owner confirms "+500 students" and "best academy". Still open: are the testimonials real, and are they used with permission?
5. **Physical address / service area:** is there one that qualifies for a Google Business Profile?
6. **Tutors:** can we publish names, photos, and qualifications (E-E-A-T)?
7. **Content capacity:** who writes or reviews Arabic and English articles (ideally a tutor)?
8. **Known competitors** you lose students to (online and local centers per country)?
9. **AI training crawlers:** allow or block (GPTBot, Google-Extended, CCBot)?

---

## 9. Changelog

| Date | Change |
|---|---|
| 2026-10-16 | Initial plan: discovery, skill evaluation, audit, strategy, roadmap (no code changes). |
| 2026-10-16 | Owner answers: domain, access, UCMath ownership, claims. Live checks confirm T1/T2/I1 in production; added T11 (307 apex) and T12 (TTFB/region). |
