# M5 Keyword & Competitor Research (draft)

**Status:** research draft, 2026-10-16. Search **volumes are not yet known**. Clusters below come from Google Autocomplete (by country: EG, SA, AE, KW, QA), "People also ask" style query patterns, and a manual competitor review. They will be prioritised once the Keyword Planner export (seed list: `doc/seo/keyword-planner-seeds.txt`) arrives.

Evidence labels: **[AC]** seen in Google Autocomplete for that market · **[SERP]** seen in search results · **[HYP]** hypothesis, needs volume data.

---

## 1. Key findings

1. **The bare term "حساب ذهني" is polluted by school-curriculum searches** [AC]. Across SA, KW, AE and QA, autocomplete for "حساب ذهني" is dominated by "سنة ثالثة / الثلاثي الثالث / سنة رابعة". These are Maghreb (Algeria/Tunisia) primary-school curriculum queries for exercises, not parents looking for a course. **Don't target the bare term.** Target it with qualifiers: للأطفال، كورس، دورة، أونلاين، تعليم، فوائد، ما هو.
2. **Abacus / soroban is a large adjacent demand cluster** [AC]: اباكوس، اباكوس اون لاين، عداد الحساب الذهني، سوروبان للاطفال، تعليم الحساب الذهني على العداد; EN "abacus classes online", "abacus classes dubai / kuwait / qatar". The homepage hero shows children holding abacuses. **Whether iMath teaches with an abacus decides whether we can honestly target this cluster** (open question Q1).
3. **Parents ask evaluative questions that nobody answers well in Arabic** [AC][SERP]: هل الحساب الذهني مفيد للاطفال؟ هل يزيد الذكاء؟ هل له أضرار؟ ما هو الحساب الذهني؟ فوائده للدماغ؟ The Arabic results we saw are thin or outdated (e.g. a 2017 Almentor course page, generic marketplace listings). **This is the clearest content gap and the best fit for AEO/AI answers.**
4. **"هل الحساب الذهني هو اليوسي ماس"** [AC]: parents conflate the category with the UCMAS brand. A neutral explainer ("mental math as a skill vs branded programs, and where UCMath fits") is legitimate and useful. We must not use UCMAS as a keyword target on commercial pages or imply affiliation.
5. **Printable practice demand** [AC]: "تمارين حساب ذهني pdf", "مستوى أول pdf", "سوروبان pdf", "mental math worksheets". This is a natural linkable asset and lead magnet (graded worksheets by level, AR/EN), and it pairs with the existing level test.
6. **Age-specific demand** [AC]: "الحساب الذهني للأطفال 5 سنوات", "لاطفال الروضة", "abacus classes for 5 year old". Supports age-band sections (M7) if the curriculum genuinely differs by age.
7. **Gulf English market uses country landing pages** [SERP]: ReLearn Education (`/online/abacus-classes-in-saudi-arabia`, `/…-united-arab-emirates`), Cliffpoint Abacus (`/kw`), Kiya Learning (`/abacus-class-in-united-arab-emirates`). Competitors win "abacus classes in <country>" with per-country pages. That's evidence for the M7 country-page experiment, which must carry real local differences (currency prices, time zones, local testimonials) to avoid doorway pages.
8. **Adjacent clusters to decide on, not assume** [AC]: "كورس حساب ذهني للكبار / للمعلمين", "كورس اعداد مدرب حساب ذهني" (adult and teacher-training demand), and "جدول الضرب" (huge, but school-practice intent). Target only if iMath offers or wants these (open questions Q2–Q3).
9. **Local-branch searches** ("يوسي ماس الشيخ زايد / فيصل / المهندسين") show in-person center demand in Cairo/Giza. iMath is online-only, so the angle is "online 1:1, no commute". Don't create location pages for cities where iMath has no presence.

---

## 2. Keyword clusters → target pages (hypotheses until volumes arrive)

| # | Cluster | Intent | Representative queries (AR / EN) | Target URL | Status |
|---|---|---|---|---|---|
| K1 | Online mental math course for kids | Commercial | كورس حساب ذهني للاطفال، دورة حساب ذهني للاطفال، حساب ذهني اون لاين، دروس حساب ذهني / mental math classes for kids online, online mental math tutor | `/` (AR), `/en` | Exists, optimised in M4 |
| K2 | The UCMath program & levels | Commercial-investigational | مستويات الحساب الذهني، برنامج الحساب الذهني، الحساب الذهني المستوى الاول / mental math program for kids | `/program` | **New** |
| K3 | What is mental math | Informational | ما هو الحساب الذهني (للأطفال)، تعريف الحساب الذهني / what is mental math (for kids) | `/resources/what-is-mental-math` | **New (cornerstone)** |
| K4 | Benefits and risks | Informational / evaluative | فوائد الحساب الذهني للأطفال / للدماغ، هل الحساب الذهني مفيد؟ يزيد الذكاء؟ له أضرار؟ / benefits of mental math for kids | `/resources/mental-math-benefits-for-kids` | **New (cornerstone)** |
| K5 | Mental math vs abacus vs branded programs | Informational / comparison | الحساب الذهني بالعداد، سوروبان، هل الحساب الذهني هو اليوسي ماس / abacus vs mental math | `/resources/mental-math-vs-abacus` | **New**; framing depends on Q1 |
| K6 | How to start at home | Informational | تعليم الحساب الذهني للمبتدئين / من الصفر / بالاصابع / للاطفال المبتدئين / mental math tricks for kids | `/resources/how-to-teach-mental-math-at-home` | **New** |
| K7 | Age-specific | Commercial / informational | الحساب الذهني للأطفال 5 سنوات، لاطفال الروضة / mental math for 5 year olds | Section on `/program`, or a guide | [HYP] |
| K8 | Practice & tools | Informational, linkable | تمارين حساب ذهني (pdf)، اختبار حساب ذهني، العاب حساب ذهني / mental math worksheets, mental math test for kids | `/assessment/level` (exists) + `/resources/mental-math-worksheets` | **New asset** |
| K9 | Struggling child | Problem-aware | طفلي ضعيف في الرياضيات، تقوية الطفل في الرياضيات / online math classes for kids | `/resources/child-struggling-with-math` | **New** |
| K10 | Country (EN, Gulf) | Commercial, local | abacus/mental math classes in dubai / kuwait / qatar / saudi arabia | M7 country pages | Experiment, after M5 |
| K11 | Abacus classes online | Commercial | اباكوس اون لاين، عداد الحساب الذهني للاطفال / abacus classes online for kids | `/` or `/program` | **Only if Q1 = yes** |
| — | Excluded | — | حساب ذهني سنة X / الثلاثي (school curriculum); يوسي ماس + branch names (competitor brand); ابيكس (unrelated drug names) | — | Don't target |

Cannibalisation rule: `/` owns the commercial "course/classes for kids online" terms. `/program` owns "program/levels/method". Guides own informational queries and link to `/` (trial) and `/assessment/level` (free test).

---

## 3. Competitor review

Classification by how parents meet them in search. Claims below come from the competitors' own pages and are unverified.

| Competitor | Market / language | Model | What they rank with | Gap / our angle |
|---|---|---|---|---|
| **UCMAS Egypt** (and franchise centers) | EG, Gulf / AR | In-person centers, abacus, competitions | Brand + branch-location searches | Online 1:1 from home, flexible times, bilingual |
| **Edumeter Egypt** (Alberto Coto method) | EG / AR | Online course for ages 4–15, olympiad prep | Course page for "دورة الحساب الذهني" | 1:1 rather than group; own method; free level test |
| **Almentor** "كورس الحساب الذهني للأطفال" | MENA / AR | Self-paced video, 12 lessons (last updated 2017) | Strong domain authority | Live tutor, current content, progress tracking |
| **Moalimy, TeacherPrivate** | EG, Gulf / AR | Tutor marketplaces | Listing pages for "مدرس حساب ذهني" | Structured program and academy accountability vs individual tutors |
| **Smart Vision Academy, Ajial Academy, Ta3lem Ma3i, sorobanlearn** | MENA / AR | Online soroban courses, some TOT | Course pages, soroban terms | Depends on Q1 |
| **Mastermind Abacus** | UAE / EN | Centers + online, since 2005, small batches | City pages (Dubai, Abu Dhabi) | 1:1, Arabic-speaking tutors |
| **Kiya Learning** | Gulf / EN | Live 1:1 online abacus, ages 4–15 | Country pages | Closest model match. Our differentiators: Arabic/English, own UCMath method, free assessments |
| **ReLearn Education, Cliffpoint Abacus** | SA, UAE, KW / EN | Online group classes (often taught from India) | Per-country landing pages | Arab-region tutors and time zones, Arabic support |
| **YouTube channels, m3aarf, edumefree** | AR | Free videos and courses | Video results and free-course intent | Our guides can embed or answer the same questions with a path to a tutor |

Takeaways:
- **Arabic informational SERPs are weak** (old, thin, or marketplace pages). Quality, tutor-reviewed Arabic guides have the best odds of ranking and of being cited in AI answers.
- **English Gulf SERPs are dominated by abacus providers with country pages.** Competing there needs Q1 resolved, plus genuinely local pages (M7).
- **Nobody we saw offers a free online level test.** The assessments are a real differentiator. Promote them in every guide.

---

## 4. Proposed first content batch (after volume validation)

Tutor-reviewed AR first, then EN, each with author byline, `Article` schema, ≥ 3 internal links, and a CTA to the free test and trial:

1. `/program`: UCMath, levels, session format, outcomes, ages (K2, K7)
2. `/about`: team, tutor qualifications, story (E-E-A-T; needs owner input)
3. `/resources/what-is-mental-math` (K3)
4. `/resources/mental-math-benefits-for-kids`: benefits, honest limits, "does it increase intelligence?" with evidence (K4)
5. `/resources/mental-math-vs-abacus`: incl. the "is mental math the same as UCMAS?" question, neutrally (K5)
6. `/resources/how-to-teach-mental-math-at-home` (K6)
7. `/resources/mental-math-worksheets`: printable PDFs by level (K8, linkable asset)
8. `/resources/child-struggling-with-math` (K9)

---

## 5. Open questions for the owner

- **Q1:** Does iMath teach with an abacus/soroban (as the hero image suggests), purely without tools, or both? This decides K5's framing and whether K11 (abacus) is a target.
- **Q2:** Do you offer (or want to offer) courses for adults or teacher training ("اعداد مدرب")? There's visible demand.
- **Q3:** Are printable worksheets by level something your tutors can produce? (The best link-earning asset.)
- **Q4:** Which competitors do you actually lose students to?

## 6. Keyword Planner export instructions

1. Google Ads → Tools → **Keyword Planner** → **Get search volume and forecasts**.
2. Paste all lines of `doc/seo/keyword-planner-seeds.txt` (81 terms).
3. Locations: **Egypt, Saudi Arabia, United Arab Emirates, Kuwait, Qatar**. Language: **All languages**. Network: Google. Date range: **last 12 months**.
4. Download **Historical metrics** as CSV. To also get the per-country split: run once per country (5 downloads), or add the "Location" breakdown if offered.
5. Optionally also run **Discover new keywords** with 3 seeds (`حساب ذهني للاطفال`, `كورس حساب ذهني`, `mental math classes for kids`) and export. This surfaces terms we haven't seen.

Sources: Google Autocomplete (suggestqueries, hl/gl per market, 2026-10-16); search results for "كورس حساب ذهني للاطفال اونلاين مصر", "online abacus mental math classes for kids Saudi Arabia UAE Kuwait", "أكاديمية حساب ذهني أونلاين … سوروبان"; competitor pages: almentor.net, edumeteregypt.com, moalimy.com, teacherprivate.com, smv-academy.com, ajial.online, mastermindabacus.com, kiyalearning.com, relearneducation.com, cliffpointabacus.com.
