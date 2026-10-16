# iMath Free Assessments — Implementation Plan

> Status: **Final v3, all decisions resolved, ready for implementation** · Date: 2026-10-05 · Owner: Ali Mohamed
> Scope: "Discover Your Child's Level for Free" — a Personality Assessment and a Mental Math Level Assessment, with resumable progress, a personalised result page, a downloadable branded PDF report (personality only), and lead capture into Convex + Telegram.

---

## 0. How to use this document

1. Read sections 1–3 (goals, recommendations, decisions needed).
2. Answer the **Open decisions** in §3 — they change what gets built.
3. Review the question bank (§6.3) and the level design (§7) for wording and pedagogy. These are the parts most worth a teacher's eye.
4. Once approved, implementation follows the phases in §13, each with its own acceptance criteria.

---

## 1. Goals and success criteria

| Goal | Measure |
|---|---|
| Generate qualified leads (parents with contact info + child insight) | % of visitors who finish an assessment; % who then book a free trial |
| Give parents something genuinely useful | Result is computed from their answers (no generic text), and the PDF is worth keeping/sharing |
| Place children at the right starting level | Level result matches the teacher's placement in the first trial session (track agreement rate) |
| Work for kids on phones | Level test fully usable on a 360px screen, no keyboard required |
| Never lose progress | Leaving and returning offers **Continue / Start again** |

Non-goals (v1): accounts/logins, emailing the PDF automatically (see §3 D5), admin analytics charts.

---

## 2. Recommendations (improvements over the original brief)

These are my suggested changes. Each is reversible; flagged ones need your decision in §3.

### Personality Assessment
1. **Measure four dimensions with three questions each (12 total).** Each dimension keeps one "anchor" tie-breaker, so an exact tie never forces a coin-flip result. *(Launched with 5 per dimension / 20 total; cut to 12 on 2026-10-16 because 20 felt too long for parents. See §6.3.)*
2. **Use a 4-point answer scale** ("Always like A · Usually A · Usually B · Always like B") instead of a single checkbox. Same speed for the parent (one tap), but it captures *how strongly* the trait shows, which lets the report say "clearly" vs "slightly" and makes results noticeably more accurate.
3. **Ask about observable behaviour, not interpretations.** Parents answer "what does your child *do*" far more reliably than "what does your child *prefer*". All questions were rewritten this way and anchored to situations a parent actually sees (birthday parties, a cancelled outing, a messy bag).
4. **Fix overlapping questions.** In the original, "LEGO: follows instructions vs. modifies" and "follows instructions exactly vs. modifies them" measure the same thing, and both are really about structure (J/P), not imagination (S/N). The new bank separates them cleanly.
5. **Randomise which side each trait appears on**, so parents who always tick the first option don't skew results.
6. **Interleave dimensions** (question order rotates E/I → S/N → J/P → T/F) so parents don't spot the pattern and answer "consistently" instead of honestly.
7. **Show percentages per dimension** in the report (e.g. "70% reflective / 30% outgoing") — honest, visual, and explains *why* the child got their profile.
8. **Use four "Math Superpower" profiles (temperaments) + per-dimension detail**, not 16 rigid types. See §6.4. This produces 16 distinct reports while keeping every sentence high quality and reviewable.
9. **Add a "Child is: Boy / Girl" field** ✅ (D1 approved). Arabic needs gender agreement ("يحب" vs "تحب"); without it the Arabic report reads wrong for half the children.
10. **Add a clear disclaimer**: a parent-reported snapshot of learning style, not a psychological diagnosis. Protects the brand and is accurate.

### Level Assessment
11. **Make it adaptive.** Every child starts at an age-appropriate level and moves up/down after each mini-round. A 5-year-old never sees 3-digit sums; a 12-year-old isn't bored by counting dots. Typically 9–12 questions, ~4–6 minutes.
12. **Generate questions randomly from rules**, not a fixed list, so retakes and siblings get different questions and answers can't be shared.
13. **Include the signature interactive part: "Flash Numbers"** (numbers flash on screen one at a time; the child adds them in their head). It's the core of real mental-math training, kids love it, and it measures working memory + speed — something a written quiz can't.
14. **On-screen number pad**, big buttons, friendly mascot feedback, no red X marks, no "wrong answer" shown — just "Great job!" or "Nice try!".
15. **Measure speed as well as accuracy**, and report both (level + "speed stars").
16. ~~Printable certificate~~ — dropped (D6: not wanted). The level result stays on screen with a share-to-WhatsApp option.
17. **No external tool needed.** Building it in-house keeps the brand, the data, and the funnel to "Book a free trial" on our site.

### Both
18. **Capture the lead at the info step**, not only at the end ✅ (D4 approved). Many parents abandon mid-way; we still get their contact and can follow up on WhatsApp.
19. **Single hub page** `/assessment` with both assessments, linked from the header and a new section on the home page.
20. **Result page always ends with a strong CTA**: "Book a free trial — we'll tailor the first session to [Name]'s profile/level", which also pre-fills the booking form.

---

## 3. Decisions

| # | Question | Decision |
|---|---|---|
| D1 | Boy/Girl field on the personality info step | ✅ **Yes** |
| D2 | Profile theme | ✅ **Math Superpowers** (§6.4): Precision, Speed, Visualisation, Logic |
| D3 | Illustrations | ✅ Free Microsoft Fluent 3D emoji (MIT licence) for v1; commission custom iMath art later |
| D4 | Save contact details as soon as the info step is completed | ✅ **Yes** (status `started`) |
| D5 | Auto-send the PDF by email/WhatsApp | ✅ Not in v1 (download only) |
| D6 | Certificate for the level test | ✅ **No certificate** |
| D7 | Level names | ✅ **Friendly names now**; add a "Recommended start: UCMath Level X" line when the UCMath level list is provided (§7.2) |
| D8 | Level test fields | ✅ Child's name, age, parent phone |
| D9 | PDF page size | ✅ **A4 portrait, designed mobile-first** (rationale §6.7) |
| — | Digits | ✅ Western digits `0 1 2 3` in both languages |

### D7 explained
- **Option A — our own scale.** Six friendly names written for this test ("Number Explorer → Mental Math Champion"). Easy for children to understand, but they don't match the level names your teachers use in class.
- **Option B — official UCMath levels.** The result says, for example, "Start at UCMath Level 2". Parents hear the same name later in class, and teachers can trust the placement. This only works if the test difficulty is mapped to the real curriculum, so I need the UCMath level list and what each level covers.
- **Recommendation: both.** Show the friendly name to the child, plus one line for the parent: "Recommended starting point: UCMath Level X". Until you send the curriculum list, we ship Option A and add the UCMath line afterwards. The engine already stores a numeric level, so this is a content-only change.

---

## 4. User flows

### 4.1 Hub — `/assessment` (AR) and `/en/assessment`
- Title: **"Discover your child's level — free"** / «اكتشف مستوى طفلك مجانًا»
- Two cards:
  - **Personality Assessment** — "Do you want to know how your child thinks?" · ~5 min · for parents · CTA "Start Personality Assessment"
  - **Mental Math Level Assessment** — "Solve fun mental-math puzzles and find your level!" · ~5 min · for the child · CTA "Start Level Test"
- If either has saved progress, its card shows a small "In progress" badge.

### 4.2 Personality — `/assessment/personality`
```
Intro ──► Info (parent + child) ──► 12 questions (1 per screen) ──► Submitting ──► Result page ──► Download PDF
   ▲                                     │
   └── Resume dialog on return ◄─────────┘ (state saved after every answer)
```
- **Intro**: "Do you want to know how your child thinks?" + description + "Start Personality Assessment".
- **Info step** (all required): Parent/Guardian name · Parent/Guardian email · Parent/Guardian WhatsApp (country code + number) · Student name · Student date of birth · Boy/Girl (D1). Button **Next →**.
- **Questions**: one per screen, statement A on top, statement B below, 4-point scale in between; tapping an answer auto-advances after 250ms. Back button always available. Progress bar "7 / 12".
- **Submit** on last question → result.
- **Result page** (§6.6) + **"Download the full personality report for [Name]"** button.

### 4.3 Level — `/assessment/level`
```
Intro ──► Info (name, age, phone) ──► How-to (practice question, not scored) ──► Adaptive rounds ──► Result
```
- Child-facing copy, large type, mascot.
- Practice question first ("Let's warm up! 2 + 1 = ?") so the child learns the number pad; it is not scored.

### 4.4 Resume behaviour (both assessments)
- State is saved to `localStorage` after every change (keys `imath.assessment.personality.v1`, `imath.assessment.level.v1`).
- On opening the page, if saved state exists **and** is mid-way (info started or ≥1 answer) **and** is < 30 days old, show a modal:
  > **You have a submission in progress. Would you like to continue?**
  > [ **Continue** ] [ Start again ]
- **Continue** restores the exact step/question. For the level test, the current question is re-shown fresh (timer restarts, flash replays).
- **Start again** clears saved state (and keeps nothing).
- If saved state is a **finished result**, the page shows that result again with a "Take it again" button (so a parent who closes the tab can still download the report).
- All storage access is wrapped in try/catch; private browsing simply means no resume.
- The version suffix (`v1`) lets us change the question bank later without restoring incompatible answers.

---

## 5. Architecture

### 5.1 Stack (existing)
Next.js 16 App Router · next-intl (ar default, en) · Tailwind v4 · Convex · react-hook-form + zod · lucide-react · SomarRounded font.

### 5.2 New dependencies
| Package | Why |
|---|---|
| `html-to-image` | Renders report pages with the real browser engine → Arabic shaping, RTL and our font are perfect (libraries like `@react-pdf` break Arabic ligatures). |
| `jspdf` | Assembles the rendered pages into a multi-page A4 PDF, client-side. No server cost, works on Vercel. |

Alternative considered: server-side Puppeteer — selectable text, but heavy on Vercel (Chromium layer, cold starts). Can be swapped in later behind the same "Download" button if selectable text becomes important.

### 5.3 Files
```
src/lib/assessment/
  common.ts                 # shared types, zod schemas, personalize() helper, age-from-DOB
  personality/questions.ts  # 12-item bank (ar/en), dimension + pole mapping
  personality/scoring.ts    # pure scoring → PersonalityResult (used client AND server)
  personality/profiles.ts   # 4 superpower profiles + 8 pole descriptions (ar/en, gendered)
  level/levels.ts           # 6 level definitions (names, can-do, next skills)
  level/generator.ts        # seeded question generators per level
  level/engine.ts           # adaptive state machine + scoring (pure, unit-testable)
  storage.ts                # versioned localStorage save/load/clear with expiry
  pdf.ts                    # html-to-image + jsPDF export helper

src/components/assessment/
  AssessmentHub.tsx
  ResumeDialog.tsx
  PhoneField.tsx, ProgressBar.tsx
  personality/PersonalityAssessment.tsx   # state machine: intro → info → questions → result
  personality/QuestionCard.tsx            # A/B + 4-point scale
  personality/PersonalityResult.tsx       # on-screen result
  personality/PersonalityReport.tsx       # hidden A4 pages for the PDF
  level/LevelAssessment.tsx
  level/NumberPad.tsx, DotsQuestion.tsx, FlashQuestion.tsx, Timer.tsx
  level/LevelResult.tsx

src/app/[locale]/(marketing)/assessment/page.tsx
src/app/[locale]/(marketing)/assessment/personality/page.tsx
src/app/[locale]/(marketing)/assessment/level/page.tsx
src/app/api/assessments/route.ts          # start + complete, validation, Telegram

convex/assessments.ts                      # start, complete mutations; admin list query
convex/schema.ts                           # + assessmentSubmissions table
messages/{ar,en}.json                      # + "Assessment" namespace (UI chrome only)
public/assessment/*.png                    # superpower icons + decorative art
```
Question/profile *content* lives in TypeScript (structured, typed, gendered); only UI chrome goes into `messages/*.json`.

### 5.4 Small fixes needed elsewhere
- Header/Footer section links use `#why-imath` etc. — on sub-pages they must become `/#why-imath`. Add an "Free assessment" nav link.
- `BookingCtaButton` scrolls to `#booking-stepper`, which only exists on the home page — on assessment pages the CTA must navigate to `/#booking-stepper` (with prefill, §9).
- Add new routes to `sitemap.ts`.

---

## 6. Personality Assessment — detailed design

### 6.1 Model
Four dimensions, each a spectrum between two poles (based on the well-known Jungian/MBTI preference model, adapted for parent-report on children):

| Code | Dimension | Pole A | Pole B |
|---|---|---|---|
| EI | Energy | **E** Outgoing — recharges with people | **I** Reflective — recharges with quiet |
| SN | Information | **S** Practical — details, facts, hands-on | **N** Imaginative — patterns, ideas, "what if" |
| TF | Decisions | **T** Logical — fairness, reasons, results | **F** Caring — feelings, harmony, encouragement |
| JP | Structure | **J** Planner — order, routine, finishing | **P** Explorer — flexible, spontaneous, adapting |

### 6.2 Answer scale and scoring
- Each question shows statement **A** and statement **B**, and four choices: `Always A (−2)`, `Usually A (−1)`, `Usually B (+1)`, `Always B (+2)`.
- Each item records which pole A and B represent (sides are randomised in the bank, §6.3).
- Per dimension: `raw = Σ(points toward pole B)` over 3 items → range −6…+6.
- Percent toward second pole: `pct = round(50 + raw / 6 × 50)` (0–100). Displayed as two percentages.
- Winning pole: sign of `raw`. **Tie (raw = 0)** → sign of the dimension's *anchor* item (the most discriminating question, marked ★). The report then says "shows both sides almost equally".
- Strength label: `|raw| ≥ 4` → *clearly*; `2–3` → *moderately*; `≤ 1` → *slightly / balanced* (60% / 30% of the maximum, as in `scoring.ts`).
- Type code = 4 letters (e.g. ISFJ). Superpower = temperament (§6.4).
- Scoring is a pure function in `scoring.ts`, run on the client for instant results and **re-run on the server** from the raw answers before saving (so stored results can't be tampered with).

### 6.3 Question bank (12 items)

**Current bank (2026-10-16): 12 items, 3 per dimension.** Each kept item covers a *different* facet of its dimension, so no two questions measure the same thing. Items about learning and correction were preferred because they also tell the tutor how to teach the child. Presentation order (original number in brackets):

| # | Dim | Question (orig. #) | Facet |
|---|---|---|---|
| 1 | EI | Party where they know no one (1) | Approaching new people |
| 2 | SN | New toy or game (10) | Play: use as intended vs. invent |
| 3 | JP | Homework or a task (3) | Deadlines |
| 4 | TF | Disagreement with a friend (4) | Values: fairness vs. harmony |
| 5 | EI | News or a new idea (13) | Thinking out loud vs. thinking first |
| 6 | SN | Learning something new (6) | Learning style: example-first vs. why-first |
| 7 | JP ★ | Plans change suddenly (7) | Coping with change |
| 8 | TF ★ | What motivates them (8) | Motivation |
| 9 | EI ★ | After a long, busy day (9) | Recharging (the core of the dimension) |
| 10 | SN ★ | Questions they ask most (18) | "How / what" vs. "why / what if" |
| 11 | JP | Room, bag or desk (16) | Order |
| 12 | TF | Corrected or told "no" (15) | Reacting to correction |

Removed, and why: **2** (story recall) and **14** (retelling the day) both test narrative recall, which Q10 and Q18 already cover · **5** (free afternoon) repeats Q9's "alone vs. with people" · **17** (class participation) mixes shyness with introversion · **11** (classmate's mistake) and **19** (team choice) repeat Q4's fairness-vs-harmony · **12** (order of tasks) repeats Q3 · **20** (rule changes) overlaps with the imaginative side of SN.

Balance: one anchor per dimension; the side showing each pole is split 1–2 or 2–1; no dimension appears twice in a row.

The original 20-item bank is kept below for reference.


Notation: `[pole]` shows what each option measures — not shown to parents. ★ = anchor (tie-breaker). Arabic uses the generic «طفلك» because the parent is the reader; Arabic report text (not questions) is gendered.

**1. EI** — At a party or gathering where your child doesn't know anyone, they usually…
- A `[I]` Watch quietly first and join in only once they feel comfortable.
- B `[E]` Walk up to other kids and start playing or chatting within minutes.
> في حفلة أو تجمّع لا يعرف فيه طفلك أحدًا، عادةً ما…
> أ) يراقب بهدوء أولًا ولا يندمج إلا بعد أن يشعر بالراحة. · ب) يتوجّه إلى الأطفال ويبدأ اللعب أو الحديث خلال دقائق.

**2. SN** — When your child watches a movie or hears a story, what do they talk about afterwards?
- A `[S]` What exactly happened — names, places, and specific scenes.
- B `[N]` What it meant, what might happen next, or how they'd change the ending.
> بعد أن يشاهد طفلك فيلمًا أو يسمع قصة، عن ماذا يتحدث؟
> أ) عمّا حدث بالضبط: الأسماء والأماكن والمشاهد. · ب) عن معناها، أو ماذا قد يحدث بعدها، أو كيف كان سيغيّر النهاية.

**3. JP** — When your child has homework or a task to finish, they usually…
- A `[P]` Put it off and work in a burst when time is running out.
- B `[J]` Start early and like having it done ahead of time.
> عندما يكون لدى طفلك واجب أو مهمة، عادةً ما…
> أ) يؤجّلها وينجزها دفعة واحدة عندما يقترب الوقت. · ب) يبدأ مبكرًا ويحب أن ينتهي منها قبل الموعد.

**4. TF** — When your child has a disagreement with a friend, what matters most to them?
- A `[T]` Who is right and what is fair — they want the rules respected.
- B `[F]` That nobody is upset — they try to calm things down and make up.
> عندما يختلف طفلك مع صديق، ما الأهم بالنسبة له؟
> أ) مَن على حق وما هو العدل — يريد احترام القواعد. · ب) ألّا يزعل أحد — يحاول تهدئة الموقف والصلح.

**5. EI** — Given a free afternoon, your child would rather…
- A `[E]` Be with lots of people — friends over, a park, a busy activity.
- B `[I]` Do something on their own or with one person — drawing, reading, building.
> لو كان لدى طفلك وقت فراغ، فهو يفضّل…
> أ) أن يكون مع أشخاص كثيرين: أصدقاء، حديقة، نشاط جماعي. · ب) أن ينشغل بشيء وحده أو مع شخص واحد: رسم، قراءة، تركيب.

**6. SN** — When learning something new, your child learns best when…
- A `[N]` They discover the idea themselves and understand *why* it works.
- B `[S]` They're shown a clear example and then practise it step by step.
> عند تعلّم شيء جديد، يتعلّم طفلك أفضل عندما…
> أ) يكتشف الفكرة بنفسه ويفهم لماذا تعمل. · ب) يُعرض عليه مثال واضح ثم يتدرّب عليه خطوة بخطوة.

**7. JP ★** — When plans change suddenly (an outing is cancelled, a visitor arrives), your child…
- A `[J]` Gets uneasy and wants to know exactly what the new plan is.
- B `[P]` Adapts quickly — and may even enjoy the surprise.
> عندما تتغيّر الخطط فجأة (إلغاء نزهة أو قدوم ضيف)، طفلك…
> أ) يشعر بعدم الارتياح ويريد أن يعرف الخطة الجديدة بالضبط. · ب) يتأقلم بسرعة، وقد يستمتع بالمفاجأة أيضًا.

**8. TF ★** — What motivates your child most to keep trying?
- A `[F]` Warm praise, encouragement, and feeling that you're proud of them.
- B `[T]` A real challenge, a clear goal, and seeing their own results improve.
> ما الذي يحفّز طفلك أكثر على الاستمرار؟
> أ) المديح الدافئ والتشجيع والإحساس بأنك فخور به. · ب) التحدي الحقيقي والهدف الواضح ورؤية نتائجه تتحسّن.

**9. EI ★** — After a long, busy day with many people (school trip, family event), your child…
- A `[I]` Needs quiet time alone to recharge.
- B `[E]` Is still full of energy and wants more company or to talk about everything.
> بعد يوم طويل مليء بالناس (رحلة مدرسية أو مناسبة عائلية)، طفلك…
> أ) يحتاج وقتًا هادئًا وحده ليستعيد طاقته. · ب) ما زال مليئًا بالطاقة ويريد المزيد من الصحبة أو الحديث عن كل شيء.

**10. SN** — With a new toy or game, your child usually…
- A `[S]` Uses it the way it's meant to be used and gets really good at it.
- B `[N]` Invents new ways to use it or makes up their own game with it.
> مع لعبة جديدة، طفلك عادةً…
> أ) يستخدمها بالطريقة المقصودة ويتقنها جيدًا. · ب) يخترع طرقًا جديدة لاستخدامها أو يؤلّف لعبته الخاصة بها.

**11. TF** — When a classmate makes a mistake, your child tends to…
- A `[T]` Point it out directly so it gets corrected.
- B `[F]` Be gentle about it so the classmate isn't embarrassed.
> عندما يخطئ زميل، يميل طفلك إلى…
> أ) أن ينبّهه مباشرة ليتم تصحيح الخطأ. · ب) أن يتعامل بلطف حتى لا يُحرَج زميله.

**12. JP** — When your child has several things to do, they prefer to…
- A `[P]` Pick whatever they feel like first and switch between them.
- B `[J]` Do them in a clear order — first, second, third.
> عندما يكون لدى طفلك عدة أشياء ليفعلها، يفضّل أن…
> أ) يبدأ بما يحب ويتنقّل بينها. · ب) ينجزها بترتيب واضح: الأول ثم الثاني ثم الثالث.

**13. EI** — When your child has news or a new idea, they usually…
- A `[E]` Share it right away, often thinking out loud as they talk.
- B `[I]` Think it over first, then share it with one or two people.
> عندما يكون لدى طفلك خبر أو فكرة جديدة، عادةً ما…
> أ) يشاركها فورًا، وغالبًا يفكّر بصوت عالٍ أثناء الحديث. · ب) يفكّر فيها أولًا ثم يشاركها مع شخص أو اثنين.

**14. SN** — When your child tells you about their day, they…
- A `[N]` Jump between ideas and connect them to other things.
- B `[S]` Describe what happened in order, with clear details.
> عندما يحكي لك طفلك عن يومه، فهو…
> أ) يقفز بين الأفكار ويربطها بأشياء أخرى. · ب) يصف ما حدث بالترتيب وبتفاصيل واضحة.

**15. TF** — When your child is corrected or told "no", they usually…
- A `[F]` Take it to heart and feel hurt, even if it was said kindly.
- B `[T]` Want to know the reason, and may argue their point logically.
> عندما يُصحَّح طفلك أو يُقال له "لا"، عادةً ما…
> أ) يتأثر ويشعر بالضيق حتى لو قيلت بلطف. · ب) يريد معرفة السبب، وقد يناقش وجهة نظره بالمنطق.

**16. JP** — Your child's room, bag, or desk is usually…
- A `[J]` Organised — things have their places and they notice when something is moved.
- B `[P]` A bit messy — but they somehow know where things are.
> غرفة طفلك أو حقيبته أو مكتبه عادةً…
> أ) منظّمة: لكل شيء مكانه ويلاحظ إذا تحرّك شيء. · ب) غير مرتّبة قليلًا، لكنه يعرف أين أشياؤه بطريقة ما.

**17. EI** — In class, a club, or a group activity, your child…
- A `[I]` Prefers listening and joins in mainly when asked.
- B `[E]` Raises their hand often and enjoys being noticed.
> في الفصل أو النادي أو النشاط الجماعي، طفلك…
> أ) يفضّل الاستماع ويشارك غالبًا عندما يُطلب منه. · ب) يرفع يده كثيرًا ويستمتع بأن يكون محط الانتباه.

**18. SN ★** — The questions your child asks most are…
- A `[S]` "How do I do it?" and "What is this?"
- B `[N]` "Why?" and "What if…?"
> أكثر الأسئلة التي يطرحها طفلك هي…
> أ) "كيف أفعلها؟" و"ما هذا؟" · ب) "لماذا؟" و"ماذا لو…؟"

**19. TF** — When choosing teams or making a group decision, your child cares most that…
- A `[T]` The choice is the smartest one to win or get it right.
- B `[F]` Everyone is included and nobody feels left out.
> عند اختيار الفرق أو اتخاذ قرار جماعي، أكثر ما يهمّ طفلك…
> أ) أن يكون الاختيار هو الأذكى للفوز أو لإنجاز المهمة بشكل صحيح. · ب) أن يشارك الجميع ولا يشعر أحد بأنه مستبعد.

**20. JP** — When playing a game with rules, your child…
- A `[P]` Likes to suggest changes to the rules to make it more fun.
- B `[J]` Likes to play exactly by the rules, and reminds others to.
> عند لعب لعبة لها قواعد، طفلك…
> أ) يحب اقتراح تغييرات على القواعد لجعلها ممتعة أكثر. · ب) يحب اللعب بالقواعد تمامًا ويذكّر الآخرين بها.

Note: the first draft marked two Energy items (1 and 9) as anchors. Q9 (recharging after a busy day) is the anchor, because it is the clearest test of reflective vs. outgoing; Q1 is a normal item.

Balance check (original 20-item bank): each dimension has 5 items; pole-A/pole-B side is split 2–3 or 3–2 per dimension; each dimension has exactly one anchor.

### 6.4 Result types: "Math Superpowers" (D2, approved)

**Idea:** every child already has one natural thinking strength. Mental math is built on four core skills: **precision, speed, visualisation and logic**. Each personality type lines up naturally with one of them. The result tells the parent: *"[Name]'s Math Superpower is Precision. iMath helps strengthen it and build the other three."*

Why this fits better than animals:
- It ties straight to what iMath teaches, so the report leads naturally into the trial lesson instead of being a generic personality quiz.
- It sets us apart. The animal concept is the reference competitor's (ThinkTree) signature, so we'd look like a copy.
- Children like being told they have a "superpower", and parents see an educational result rather than a label.
- The four skills are the same ones the Level Assessment measures (accuracy, speed, flash/visual memory, number sense), so the two tests feel like one system and each one leads into the other.

| Superpower | Combo | Name (EN · AR) | Essence | Icon |
|---|---|---|---|---|
| 🎯 Precision | **S + J** | The Precision Master · «سيّد الدقّة» | Careful, organised, reliable; loves clear steps and getting it exactly right | Direct hit |
| ⚡ Speed | **S + P** | The Speed Racer · «بطل السرعة» | Quick, hands-on, energetic; learns by doing and loves a race | High voltage |
| 🎨 Visualisation | **N + F** | The Creative Visualiser · «المبدع الخيالي» | Imaginative, kind, sees pictures in their head (the mental abacus); thrives on encouragement | Artist palette |
| 🔍 Logic | **N + T** | The Pattern Detective · «محقّق الأنماط» | Curious, logical, asks "why", spots patterns and shortcuts | Magnifying glass |

The underlying model is the same as with animals: temperament = S/N plus J/P (for S types) or T/F (for N types). Only the naming and the content change.

Each superpower also has an **Outgoing (E) / Reflective (I)** sub-title, e.g. "The Quiet Precision Master" vs. "The Team Precision Master". That gives 8 named variants, and the per-dimension sections make all 16 combinations read differently.

Why four profiles instead of 16: four clearly different profiles can each be written, reviewed and translated to a high standard. The dimension sections add the rest of the detail, driven directly by the scores.

### 6.5 Report content per profile (written in both languages, gendered for Arabic)
For each **superpower**:
- Overview paragraph (about 70 words) using the child's name.
- 3 key traits (title + one line), 3 strengths, 3 challenges (framed kindly, as growth areas).
- **"Your superpower in mental math"**: how this strength shows up when solving (e.g. Precision: rarely makes careless errors; Speed: fast recall; Visualisation: holds the abacus image in mind; Logic: finds shortcuts).
- **"The powers we'll build next"**: the other three skills, in order from weakest to strongest according to the scores, with how iMath trains each one (e.g. Precision Master → speed through timed flash drills; Speed Racer → accuracy through checking habits; Creative Visualiser → confidence with mistakes; Pattern Detective → patience with practice).
- 3 **parent tips** for home.
- How they learn best at iMath (how our tutor will adapt the session).
- Closing encouraging sentence (✨ line).

For each **pole** (8): a short description + 3 bullets "what this looks like", with intensity wording from §6.2.

All copy is original. The reference PDF (ThinkTree "Beaver eBook") is used for **layout inspiration only**; its text, concept and illustrations are not reused.

### 6.6 On-screen result page
1. Hero: superpower icon, **"[Name]'s Math Superpower: Precision"**, profile name (e.g. "The Precision Master"), sub-title, 4-letter code (small).
2. "We think [Name] is…" overview.
3. Four spectrum bars with percentages.
4. Strengths / Challenges / Superpower in mental math / Powers to build next (cards).
5. ✨ closing line.
6. **Download the full personality report for "[Name]"** (primary button).
7. CTA: "Book a free trial — we'll tailor it to [Name]'s profile", "Now test [Name]'s mental math level" (links to the level test with the name prefilled), and WhatsApp share.
8. Disclaimer (small).

### 6.7 PDF report (A4 portrait, ~7 pages, iMath brand)

**Why A4 portrait (D9):**
- Most parents will open it on a phone (WhatsApp, Gmail), and some will print it or show it to a teacher. A4 portrait is the only size that works for both: phones fit it to screen width, and every printer in Egypt and the Gulf uses A4. A phone-shaped booklet like the reference prints with large margins or gets cropped.
- We get the phone-friendly feel from the **design**, not the page size: a single column, body text of at least 14pt, headings at 28pt or more, one idea per page and no small tables. Read at phone width, each page looks like a series of large cards.
- One file for both uses, standard PDF readers, and nothing to maintain twice.

Visual language borrowed from the reference: bold colour blocks, tilted "tape" labels, hand-drawn brush/paper shapes and big friendly type. It's re-coloured to **iMath violet `#7c3aed`, orange `#f97316` and yellow `#facc15`** and set in SomarRounded. The iMath logo appears on the cover and in every page footer.

| Page | Content |
|---|---|
| 1 Cover | Gradient background, large superpower art, "PRECISION MASTER" + code, "[Name]'s personality report", iMath logo |
| 2 We think [Name] is… | Tagline, overview, 3 key-trait sticky notes |
| 3 How [Name] thinks | 4 spectrum bars + short pole explanations |
| 4 Superpower & strengths | Large coloured card: superpower in mental math + 3 strengths |
| 5 Challenges | Coloured card with 3 growth areas |
| 6 Powers to build next + parent tips | Two cards |
| 7 Next step | Closing line, "Book a free trial" + QR code to site/WhatsApp, contact info, disclaimer |

Technical: pages are React components rendered off-screen at 794×1123 px. They're captured with `html-to-image` at 2× pixel ratio (JPEG quality about 0.92, keeping the file around 2–4 MB) and added as `jsPDF` A4 pages. Fonts and images are same-origin, so they embed correctly. File name: `iMath-Personality-[Name].pdf`. The report defaults to the page language (AR page → Arabic report, EN page → English). A "Report language: العربية | English" switch under the download button lets parents pick the other one, without changing the site language.

---

## 7. Level Assessment — detailed design

### 7.1 Principles
Short (≤ 6 min), adaptive, child-friendly, measures **accuracy + speed + working memory**, no reading-heavy questions.

### 7.2 Levels (iMath placement scale — confirm vs UCMath, D7)

| Lvl | Name (EN / AR) | Skills tested | Question types |
|---|---|---|---|
| 1 | Number Explorer · مستكشف الأرقام | Recognise quantities ≤ 10, add within 10 | Count the dots (no counting time — dots shown 2s), `3 + 4` |
| 2 | Quick Adder · الجامع السريع | Add/subtract within 20, bonds of 10 | `13 − 5`, `7 + ? = 10` |
| 3 | Two-Digit Starter · بطل العددين | 2-digit ± 1-digit, bonds of 100 by tens | `47 + 8`, `60 + ? = 100`, Flash: 3 single digits (1.5s each) |
| 4 | Mental Builder · البنّاء الذهني | 2-digit ± 2-digit with carrying, doubles/halves | `58 + 27`, `half of 84`, Flash: 4 single digits incl. minus (1.2s) |
| 5 | Speed Calculator · الحاسب السريع | Times tables, 2-digit × 1-digit, mixed chains | `7 × 8`, `23 × 4`, Flash: 4 two-digit numbers (1.5s) |
| 6 | Mental Math Champion · بطل الحساب الذهني | 3-digit ±, 2-digit × 2-digit easy, long chains | `356 + 278`, `25 × 12`, Flash: 5 two-digit numbers incl. minus (1.2s) |

Result 0 = "Ready to Start · جاهز للبداية" (didn't pass level 1 — framed positively).

### 7.3 Adaptive algorithm
```
startLevel = age 4–5 → 1 · age 6–7 → 2 · age 8+ → 3
each round = 3 questions of the current level (one of each type for that level)
round passed  = ≥ 2 correct within the time limit

if passed:  highestPassed = level; if level == 6 → stop; else level + 1
if failed:  if a lower level was already passed or level == 1 → stop
            else level − 1
placement = highestPassed (0 if none)
```
Max 6 rounds (18 questions), typical 3–4 rounds (9–12 questions). The order guarantees we find the ceiling from either direction.

### 7.4 Question generation
- Seeded random generator (seed saved in state, so resume shows the same questions).
- Rules per type avoid trivial/duplicate items (no `+0`, no repeated operands, answers never negative, subtraction results ≥ 0, carrying forced where the level requires it).
- Flash chains: running total never goes below zero; numbers never repeat consecutively.

### 7.5 Timing and speed
- Time limit per question by level (L1 20s … L6 30s; flash: 15s after last number). Shown as a slim, calm bar — not a ticking clock.
- Timeout = incorrect, with "Time's up — no problem!" and auto-advance.
- **Speed stars** (1–3) from median time of correct answers at the placement level vs. target times per level.

### 7.6 Interaction details
- On-screen number pad (0–9, ⌫, ✓), large tap targets (≥ 56px), also physical keyboard.
- Numbers always shown in Western digits (`0 1 2 3`) in both languages, including dates and percentages in the Arabic UI and PDF (✅ decided).
- Feedback after each answer: mascot + "Great job!" / "Nice try!" (correct answer not revealed).
- Between rounds: "Level up! 🚀" animation when passing.
- Flash question: "Get ready… 3, 2, 1" → numbers flash in large type → number pad appears.

### 7.7 Result page
- Big badge: **"[Name] is at Level 3 — Two-Digit Starter"**, speed stars, accuracy %.
- Level ladder graphic (1→6) with the child's position.
- "What [Name] can already do" (3 bullets) and "What's next" (3 bullets).
- Recommendation: "At iMath, [Name] would start at …", CTA **Book a free trial** (prefilled), WhatsApp.
- Share result to WhatsApp (text message with the level and a link to iMath).

---

## 8. Data model & API

### 8.1 Convex table `assessmentSubmissions`
```ts
assessmentSubmissions: defineTable({
  type: v.union(v.literal("personality"), v.literal("level")),
  status: v.union(v.literal("started"), v.literal("completed")),
  clientToken: v.string(),          // random 128-bit, only the creating browser knows it
  locale: v.string(),
  country: v.optional(v.string()),
  parentName: v.optional(v.string()),
  parentEmail: v.optional(v.string()),
  phoneNumber: v.string(),
  studentName: v.string(),
  studentDob: v.optional(v.string()),
  studentAge: v.number(),
  gender: v.optional(v.string()),
  // personality
  answers: v.optional(v.array(v.number())),  // 12 values in {-2,-1,1,2}
  typeCode: v.optional(v.string()),          // e.g. "ISFJ"
  profile: v.optional(v.string()),           // precision | speed | visualisation | logic
  dimensionScores: v.optional(v.object({ EI: v.number(), SN: v.number(), TF: v.number(), JP: v.number() })),
  // level
  placementLevel: v.optional(v.number()),
  accuracy: v.optional(v.number()),
  speedStars: v.optional(v.number()),
  rounds: v.optional(v.array(v.object({ level: v.number(), correct: v.number(), total: v.number(), medianMs: v.number() }))),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_started_at", ["startedAt"])
  .index("by_type_and_started_at", ["type", "startedAt"])
```
Rate limiting reuses `leadSubmissionRateLimits` with key prefix `assessment:` (max 5 starts / 30 min per IP+UA hash).

### 8.2 Convex functions (`convex/assessments.ts`)
- `start` (mutation) — rate-limit, insert `started`, return id.
- `complete` (mutation) — requires matching `clientToken`, only `started → completed`, writes results.
- `list` (query, admin-only via `requireAdmin`) — newest 200, for a later admin tab.

### 8.3 API route `POST /api/assessments`
Body is a zod discriminated union on `action`:
- `{ action: "start", type, info, locale, clientToken }` → `{ ok, submissionId }`
- `{ action: "complete", submissionId, clientToken, type, answers | levelResult }`
  - Personality: server **recomputes** the result from `answers` with the shared `scoring.ts`.
  - Level: stores the client summary (values range-checked).
- Sends a **Telegram** message on completion (same bot as leads), e.g.
  `🧠 Personality test completed — Sara (7) — Creative Visualiser (ENFP) — +20 10… — parent: …`
  `🔢 Level test completed — Omar (9) — Level 3 (2★, 78%) — +966 …`
- Network/Convex failures **never block** the child from seeing results; the client retries `complete` once and otherwise moves on.

---

## 9. Integration with the existing site
- Header: add "Free assessment" link (`/assessment`); fix section anchors to `/#…`.
- Home page: new compact `AssessmentPromo` section after `HowItWorks` with the two cards.
- Booking prefill: result-page CTA navigates to `/#booking-stepper?from=assessment` and stores `{ studentName, studentAge, phone }` in `sessionStorage`; `BookingStepperSection` reads it once to prefill and sets `previousExperience` from the level (0–1 → none, 2–4 → some, 5–6 → advanced).
- Sitemap + metadata (title/description/OG) for the three new pages, both locales.

---

## 10. i18n, RTL, accessibility
- All UI chrome in `messages/{ar,en}.json` under `Assessment`; content in typed TS with `{ar, en}`.
- RTL handled by the existing `dir` wrapper; spectrum bars and progress flip correctly; number pad keeps 0–9 layout in both directions.
- Keyboard: scale options are a radio group (arrow keys), number pad accepts typing, Enter submits.
- Focus moves to the question heading on every step; `aria-live` announces feedback.
- Colour contrast AA; motion reduced under `prefers-reduced-motion`.
- Touch targets ≥ 44px (≥ 56px in the level test).

---

## 11. Privacy & content safety
- Info step shows: "We use these details to send your child's results and contact you about a free trial." + link to the privacy policy (update the policy to mention assessments).
- Data stored: contact info, answers, results. No data in the PDF URL, nothing in query strings.
- Disclaimer on result and PDF: "This is an educational snapshot based on a parent's answers, not a psychological or clinical assessment."
- Fluent Emoji assets: MIT licence — add `public/assessment/LICENSE-fluent-emoji.txt`.

---

## 12. Analytics events (existing `trackEvent`)
`assessment_view` · `assessment_start` · `assessment_info_completed` · `assessment_question_answered` (index) · `assessment_resume_shown` · `assessment_resume_continue` / `_restart` · `assessment_completed` (type, result) · `assessment_pdf_downloaded` · `assessment_cta_booking` · `level_round_result` (level, correct). Gives a full drop-off funnel per question.

---

## 13. Implementation phases & acceptance criteria

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| **P1 Foundations** ✅ | `common.ts`, `storage.ts`, Convex table + functions, `/api/assessments`, i18n namespace, hub page, header link | Hub renders in AR/EN; `start`/`complete` work end-to-end; rate limit returns 429; bad token rejected |
| **P2 Personality flow** ✅ | Info step, question bank, QuestionCard, scoring, resume dialog | All 20 questions render in both languages; leaving at Q7 and returning shows Continue/Start again and restores Q7; scoring unit cases pass (§14) |
| **P3 Personality result + content** ✅ | 4 profiles, 8 pole texts (ar/en, gendered), result page, `buildReport()` shared with the PDF | Every one of 16 type codes produces a coherent report; Arabic gender agreement correct for boy & girl |
| **P4 PDF report** ✅ | 7-page branded PDF | Downloads on Chrome/Safari/Android; Arabic shaped correctly; logo on every page; < 5 MB |
| **P5 Level engine** ✅ | Generators, adaptive engine, timer, number pad, dots, flash | Engine unit cases pass; generated questions satisfy constraints over 10k samples; works at 360px |
| **P6 Level result** ✅ | Result page, WhatsApp share, booking prefill | Correct placement for scripted runs; CTA prefills booking |
| **P7 Integration & polish** ✅ | Home promo, booking prefill, sitemap/metadata, Telegram messages, analytics, privacy text | Lint + build pass; full manual QA checklist (§14) passes in both locales |

---

## 14. Testing plan
- **Scoring unit checks** (pure functions): all-A answers → expected type; all-B → opposite; ties resolved by anchor; percentages correct; server and client produce identical results.
- **Level engine checks**: scripted answer sequences → expected placement (e.g. pass L3, fail L4 → 3; fail L3, pass L2 → 2; fail L1 → 0; pass to L6 → 6). Property test of generators (no negatives, carry when required, no duplicates).
- **Manual QA matrix**: AR/EN × mobile/desktop × Chrome/Safari: resume dialog, back navigation, refresh mid-question, private window (no storage), offline at submit, PDF download, RTL layout, keyboard-only.
- **Content review**: an iMath teacher reviews all Arabic copy and level difficulty before launch; pilot with 10–20 real families and compare level result to the trial-session teacher's placement.

---

## 15. Future improvements (v2+)
- Email/WhatsApp delivery of the PDF (Resend / WhatsApp Business API).
- Admin "Assessments" tab with filters and CSV export.
- Commissioned iMath illustrations for each superpower (e.g. one mascot in four costumes).
- Server-rendered PDF with selectable text.
- Re-test every 3 months to show progress ("Level 2 → Level 4").
- Calibrate level thresholds and personality anchors using collected data.
