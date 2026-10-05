---
target: Parent Stories section
total_score: 17
max_score: 28
na_heuristics: 7,9,10
p0_count: 1
p1_count: 2
timestamp: 2026-10-05T14-09-46Z
slug: src-components-marketing-testimonials-tsx
---
# Critique: Parent Stories (Testimonials.tsx)
Method: dual-agent. Score 17/28 (Acceptable; 7, 9, 10 n/a).
Heuristics: 1=2 (no slide count/announce), 2=2 (all avatars same letter, AR quote bidi), 3=3, 4=2 (h2 scale, detached arrows), 5=3 (diagonal scroll flips), 6=3, 8=2 (sparse, generic decoration).
Specificity: generic SaaS carousel; nothing about mental math, UCMath, Arab-world parents.
Detector: CLI clean; browser 6 findings in section: line-length x5 (quote ~90ch at :156), all-caps-body x1 (role caption :166).
## Priority issues
- [P0] Avatars use name.charAt(0) -> all "M" (EN) / "أ" (AR) from honorific (:162). Fix: initial key or strip honorific.
- [P1] Credibility: hardcoded 5 stars, "30% in 2 months", "Actual feedback" with no source/city/age. Fix: method-specific outcomes, location, child age, drop stars.
- [P1] 4/5 stories hidden in carousel; no carousel semantics/live region; 12px dots; no reduced-motion. Fix: grid on desktop + scroll-snap on mobile.
- [P2] AR ASCII quotes misplaced by bidi (:157); role 10px slate-400 uppercase tracking fails contrast and breaks Arabic joining (:166). Quote measure ~90ch.
- [P2] Arrows detached from centered card; h2 text-4xl on mobile vs text-2xl siblings; sticky booking bar covers dots on mobile; no CTA bridge to pricing.
## Minor
EN/AR copy drift (surnames, Omar/Khalid); dead .testimonials-swiper CSS; font-black vs 800 max weight; touchStart 0 bug (:83); cursor-grab without drag.
