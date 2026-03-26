# iMath MVP Tasks & Milestones

## Planning Notes

- Scope is based on `iMath_PRD.md`.
- This plan is optimized for the MVP described in the PRD, not a full academy platform.
- Priority is conversion-first: landing page, booking flow, admin lead management, notifications, then polish and launch readiness.

## Milestone 1: Product Foundation, i18n & Technical Setup

**Goal:** Establish the project structure, bilingual foundations, and core technical setup before feature work begins.

### Tasks

- [X] Initialize the Next.js 16 App Router project structure with route groups for the marketing site and admin dashboard.
- [X] Define the rendering strategy per route and component boundary:
  - Server Components by default
  - Client Components only where interactivity is required
  - SSR / static rendering choices for landing and admin surfaces
- [X] Configure Tailwind CSS v4 and `shadcn/ui` with a reusable design system.
- [X] Define the i18n architecture for localized routing, translation dictionaries, language switching, and locale-aware metadata in the App Router.
- [X] Define global design tokens for the light-only brand palette:
  - Violet / blue-purple primary
  - Orange CTA color
  - Yellow accent
  - White backgrounds and neutral text scales
- [X] Set up bilingual internationalization with Arabic as the default language and English as the secondary language.
- [X] Support RTL for Arabic and LTR for English across layouts, typography, forms, and components.
- [X] Set up root `layout.tsx`, locale-aware nested layouts, and shared metadata generation.
- [X] Configure shared layout primitives, typography styles, buttons, cards, accordions, tables, dialogs, and form controls.
- [X] Set up Convex project structure, environment variables, and local development workflow.
- [X] Define the initial data model for leads, lead statuses, pricing data, country/currency mappings, and admin users.
- [X] Add baseline analytics/event tracking requirements for CTA clicks, modal opens, form submissions, and WhatsApp clicks.
- [X] Prepare environment variable placeholders for Telegram bot integration and admin auth secrets (no external geolocation API required due to Vercel Edge detection).
- [X] Configure local fonts using next/font/local to load the custom SomarRounded.ttf font for zero layout shift (CLS).
- [X] Implement Convex Auth for secure, free Admin authentication.

### Done Criteria

- [X] App boots successfully in local development.
- [X] Arabic is the default language and renders correctly in RTL.
- [X] Shared UI tokens and core components are available for reuse.
- [X] Convex is connected and ready for feature implementation.

## Milestone 2: Landing Page Experience

**Goal:** Build the high-converting, mobile-first landing page that acts as the main acquisition funnel.

### Tasks

- [X] Create the landing page as an App Router route with section-based navigation and smooth scrolling.
- [X] Build the hero section with a strong parent-focused headline, trust-building subcopy, and primary CTAs.
- [X] Add the benefits/outcomes section covering focus, speed, confidence, and academic excellence.
- [X] Build the "Why iMath" value proposition section emphasizing:
  - 1:1 personalized sessions
  - Certified tutors
  - Parent trust and professionalism
- [X] Create the "How it Works" 3-step journey:
  - Book a trial
  - Attend the assessment
  - Start the customized journey
- [X] Add a testimonials section with clean, text-based parent reviews.
- [X] Build the pricing section shell that can later render geo-personalized plans.
- [X] Add an FAQ accordion addressing common objections and questions.
- [X] Build a simple footer with contact details, copyright, and essential links.
- [X] Add a persistent mobile WhatsApp CTA that stays visible without blocking important UI.
- [X] Ensure CTA placement is repeated strategically across the page for conversion.
- [X] Use Next.js primitives appropriately:
  - `next/image` for optimized images
  - `next/font` for controlled font loading
  - route metadata for SEO and social sharing
- [X] Make sure above-the-fold content is optimized for fast initial render in Arabic-first mobile conditions.

### Done Criteria

- [X] The full landing page is responsive and optimized for mobile-first browsing.
- [X] Both Arabic and English content render cleanly without layout issues.
- [X] CTAs are visible in hero, mid-page, pricing, and final conversion points.

## Milestone 3: Booking Modal & Lead Capture Flow

**Goal:** Convert traffic into qualified trial requests through a frictionless modal-based booking experience.

### Tasks

- [ ] Implement a reusable booking modal as a focused Client Component triggered by all "Book Free Trial" CTAs.
- [ ] Create the lead capture form with the following fields:
  - Parent name
  - Student name
  - Student age dropdown
  - Phone number with country code selector
  - Optional email
  - Previous experience radio buttons
  - Auto-detected timezone
  - Preferred time slots
- [ ] Add form validation for required fields, invalid inputs, and mobile-friendly error states.
- [ ] Auto-detect timezone on the client and allow fallback handling when detection fails.
- [ ] Save submitted leads to Convex with a default status of `New Request` using a secure server-side mutation flow.
- [ ] Show success confirmation after submission with the next-step expectation clearly explained.
- [ ] Capture submission metadata including locale, country (from Vercel headers), currency context, and submission timestamp.
- [ ] Add event tracking for modal open, modal close, form start, validation failure, and successful submission.
- [ ] Implement form spam protection (Rate Limiting via Convex) to prevent fake submissions.

### Done Criteria

- [ ] Every booking CTA opens the same consistent modal experience.
- [ ] Valid submissions are stored in Convex with all expected lead fields.
- [ ] Users receive a clear success state without leaving the page.

## Milestone 4: Dynamic Pricing & Geo-Pricing Logic

**Goal:** Personalize package pricing by location while preserving trust and giving users a manual override.

### Tasks

- [ ] Implement Vercel Edge-based geolocation detection using request headers (e.g., `x-vercel-ip-country`) via Next.js middleware.
- [ ] Create a middleware layer to extract country code and inject it into the app (cookies, headers, or request context).
- [ ] Cache detected country in cookies to avoid repeated header parsing on subsequent requests.
- [ ] Implement fallback country logic (default to Egypt) when Vercel headers are missing or undefined.
- [ ] Support the required pricing countries and currencies:
  - Egypt / EGP
  - Saudi Arabia / SAR
  - Kuwait / KWD
  - UAE / AED
  - Qatar / QAR
- [ ] Create a pricing configuration model for 1, 3, 6, and 12 month packages.
- [ ] Display package inclusions consistently for every pricing card:
  - 8 sessions per month
  - 2 sessions per week
  - 60 minutes per session
  - 1:1 focus
- [ ] Add a manual country override dropdown to handle incorrect Vercel geo-detection (e.g., VPN usage).
- [ ] Build a fallback behavior for unsupported or undetected countries.
- [ ] Make sure pricing updates instantly when users change the override selection.
- [ ] Persist selected country/currency context into the booking submission payload.
- [ ] Keep pricing logic centralized so both landing page rendering and form submission use the same country/currency rules.
- [ ] Explicitly ensure no payment gateways (Stripe/Paymob) will be integrated in this MVP. Subscriptions are handled entirely off-platform.

### Done Criteria

- [ ] Pricing auto-detects correctly for supported regions.
- [ ] Manual override works without page refresh.
- [ ] Users always see a valid pricing state, even when detection fails.

## Milestone 5: Admin Dashboard & CRM Lite

**Goal:** Give the team a secure internal dashboard to review and manage incoming trial requests.

### Tasks

- [ ] Implement secure admin authentication and protected admin routes.
- [ ] Build the admin dashboard as a protected App Router area with its own layout and navigation shell.
- [ ] Create a centralized leads table showing all submitted trial requests.
- [ ] Display core lead data in the table and detail view:
  - Parent and student names
  - Contact details
  - Age
  - Previous experience
  - Preferred slots
  - Timezone
  - Country / pricing context
  - Submission date
  - Current status
- [ ] Implement the lead status pipeline:
  - New Request
  - Trial Scheduled
  - Trial Completed
  - Subscribed
  - Did Not Subscribe
- [ ] Allow admins to update lead status from the table and/or detail panel.
- [ ] Add filtering and sorting by status, submission date, country, and subscription outcome.
- [ ] Support real-time lead updates using Convex so new requests appear without refreshing.
- [ ] Add in-app notification UI for newly submitted leads.
- [ ] Use Server Components for data-heavy dashboard screens where possible, with Client Components only for interactive table controls and status updates.
- [ ] Protect admin routes using the integrated Convex Auth.
- [ ] Create "Dynamic WhatsApp Action Buttons" in the lead detail view to auto-generate pre-filled messages to parents.

### Done Criteria

- [ ] Admin routes are protected from unauthenticated access.
- [ ] New leads appear in the dashboard in near real time.
- [ ] Admins can move leads through the full PRD-defined pipeline.

## Milestone 6: Notifications & Operational Integrations

**Goal:** Ensure new leads are surfaced immediately to the team for fast follow-up.

### Tasks

- [ ] Integrate Telegram bot notifications for successful new lead submissions.
- [ ] Format Telegram messages with the most important lead details for quick action.
- [ ] Add retry/error handling for Telegram delivery failures.
- [ ] Surface in-app notifications inside the dashboard when a new lead arrives.
- [ ] Log notification delivery status for debugging and auditability.
- [ ] Verify the operational workflow supports manual tutor assignment outside the platform.

### Done Criteria

- [ ] Each successful lead submission triggers a Telegram notification.
- [ ] Admin users also receive an in-app notification signal in the dashboard.
- [ ] Notification failures are visible and debuggable.

## Milestone 7: Content, QA, Performance, and Launch Readiness

**Goal:** Finish the MVP to production quality with strong usability, performance, and trust signals.

### Tasks

- [ ] Finalize Arabic and English marketing copy in the approved professional tone.
- [ ] Review all Arabic content for clean "White Arabic" phrasing with no country-specific slang.
- [ ] Verify trust signals are prominent above the fold and across the funnel.
- [ ] Test all landing page sections and modal flows on common mobile breakpoints.
- [ ] Test RTL and LTR layout behavior across all user-facing and admin interfaces.
- [ ] Validate form accessibility, touch targets, keyboard behavior, and readable error messaging.
- [ ] Run performance optimization work for:
  - LCP under 1.5 seconds
  - CLS under 0.1
  - strong responsiveness / INP
  - 90+ PageSpeed scores on mobile and desktop
- [ ] Optimize images, fonts, bundles, and above-the-fold rendering.
- [ ] Add SEO fundamentals for the landing page, including metadata, structured content hierarchy, and share previews.
- [ ] Verify production behavior on Vercel, including middleware geolocation, localized metadata, and environment variable wiring.
- [ ] Validate the full end-to-end funnel:
  - Visit page
  - View pricing
  - Open booking modal
  - Submit lead
  - Receive Telegram alert
  - View and update lead in dashboard
- [ ] Prepare production deployment configuration and environment variables.
- [ ] Complete pre-launch smoke testing and sign-off.

### Done Criteria

- [ ] Core Web Vitals targets are met or are within an acceptable launch threshold.
- [ ] The entire lead flow works end to end in production-like conditions.
- [ ] Arabic-first mobile experience feels polished, fast, and trustworthy.

## Suggested Execution Order

1. Milestone 1: Product Foundation & Technical Setup
2. Milestone 2: Landing Page Experience
3. Milestone 3: Booking Modal & Lead Capture Flow
4. Milestone 4: Dynamic Pricing & Geo-Pricing Logic
5. Milestone 5: Admin Dashboard & CRM Lite
6. Milestone 6: Notifications & Operational Integrations
7. Milestone 7: Content, QA, Performance, and Launch Readiness

## MVP Acceptance Checklist

- [ ] Parents can browse a bilingual, mobile-first landing page with strong trust signals.
- [ ] Visitors can open a modal and submit a free trial request without leaving the page.
- [ ] Pricing adjusts based on detected country and supports manual override.
- [ ] Leads are stored centrally and visible to admins in real time.
- [ ] Admins can update leads through the defined lifecycle statuses.
- [ ] Telegram and in-app notifications alert the team immediately after submission.
- [ ] The site meets the PRD's light-mode, performance, and professionalism requirements.
