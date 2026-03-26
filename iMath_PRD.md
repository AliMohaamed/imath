# Product Requirements Document (PRD): iMath MVP (Master Document)

## Part 1: Product Overview & Brand Identity

### 1.1 Product Vision & Core Value

**iMath** is a specialized online academy offering premium 1:1 mental math sessions for children. The primary objective of this MVP is to launch a high-converting, robust landing page and a custom booking system that seamlessly guides parents to book a free trial session.

### 1.2 Target Audience

- **Primary User:** Parents (Decision-makers). The platform is designed specifically for parents, not the children.
- **Geographic Focus:** MENA Region (specifically Egypt, Saudi Arabia, Kuwait, UAE, and Qatar).

### 1.3 Brand Identity & Tone of Voice

- **Brand Vibe:** Academic, highly professional, trustworthy, and authoritative. The platform must instill strict confidence in parents that their children are in expert hands.
- **Tone of Voice (Copywriting):** Professional yet accessible.
  - **Language:** Bilingual (Arabic & English).
  - **Default Language:** Arabic.
  - **Arabic Dialect:** "White Arabic" (Modern Standard Arabic simplified) - clear, formal, and universally understood across all targeted Arab countries without localized slang.
- **Color Palette (Derived from Logo):**
  - **Primary:** Violet/Blue-Purple (Academic, intelligent, trustworthy).
  - **Secondary/Action:** Orange (Energetic, clear for CTAs).
  - **Accent:** Yellow (Optimistic, used sparingly for highlights).
  - **Background:** Clean White (Light Mode exclusively).

## Part 2: UI/UX & Performance Standards

### 2.1 User Interface (UI) Guidelines

- **Design Philosophy:** Clean, minimalist, and parent-focused.
- **Theme:** Strictly **Light Mode (White Mode)** to maintain a formal, educational, and clear aesthetic.
- **Animations:** No playful, childish, or distracting micro-interactions (e.g., no bouncing numbers). Animations should be limited to subtle, professional transitions (e.g., smooth scroll, fade-ins for sections, button hover states).

### 2.2 User Experience (UX) Strategy

- **Mobile-First Design (Mandatory):** Since the primary acquisition channel is social media advertising, the mobile experience is the absolute priority. Touch targets, font sizes, and form fields must be perfectly optimized for mobile screens.
- **Frictionless Conversion:** The booking form must be easily accessible and simple to navigate.
- **Trust Signals:** Highlighting certifications and the 1:1 nature clearly in the viewport to build immediate trust.

### 2.3 Performance & Core Web Vitals

Performance is a critical success factor for SEO and ad conversion rates. The platform must adhere to the following strict standards:

- **Largest Contentful Paint (LCP):** < 1.5 seconds (Fast loading of the hero section).
- **Cumulative Layout Shift (CLS):** < 0.1 (No unexpected jumping of elements, especially critical for mobile forms).
- **First Input Delay (FID) / INP:** Highly responsive; immediate reaction to button clicks.
- **Google PageSpeed Insights Target:** 90+ on Mobile and Desktop.

## Part 3: Landing Page & User Journey

### 3.1 Page Structure (Section by Section)

The landing page will be a Single Page Application (SPA) designed to act as a sales funnel:

- **Hero Section:** High-impact, clear headline focusing on unlocking the child's potential.
  - Primary Call-to-Action (CTA): "احجز جلسة تجريبية مجانية" (Book a Free Trial Session).
- **Benefits / Outcomes:** 3-4 bullet points highlighting results (Focus, Speed, Confidence, Academic Excellence).
- **Why iMath (Value Proposition):** Highlighting the core competitive advantage: **1:1 Personalized Sessions**. Emphasizing that tutors are certified.
- **How it Works (3 Simple Steps):** 1. Book a Trial -> 2. Attend the Assessment -> 3. Start the Customized Journey.
- **Testimonials (Social Proof):** Clean, text-based reviews from parents.
- **Dynamic Pricing:** Clear display of packages based on the user's location.
- **FAQs:** Accordion style addressing common objections.
- **Footer:** Simple links, copyright, and contact info.

### 3.2 CTA Behavior & Navigation

- **Dual Call-to-Action Strategy:** The page will feature two primary CTAs:
  - "Book a Free Trial" (احجز جلسة تجريبية مجانية).
  - "Contact via WhatsApp" (تواصل معنا عبر الواتساب).
- **Frictionless Booking Modal:** Clicking any "Book Trial" CTA will open a clean **Pop-up Modal** instead of redirecting to a new page.
- **Mobile Sticky CTA:** A persistent **WhatsApp button** anchored to the bottom corner of the screen on mobile devices.

## Part 4: Custom Booking System & Geo-Pricing

### 4.1 Data Collection Form (The Modal)

- Parent's Name (Required).
- Student's Name (Required).
- Student's Age (Required - Dropdown).
- Phone Number (Required - Includes a visual Country Code selector).
- Email Address (Optional).
- Previous Experience (Required - Radio buttons).
- Timezone (Auto-detected).
- Preferred Time Slots (Required).

### 4.2 Dynamic Pricing Engine (Geo-Pricing)

- **Vercel Edge-Based Detection:**
  The system detects the user's country using Vercel's request headers (e.g., `x-vercel-ip-country`) at the Edge level.
  This removes the need for any third-party IP geolocation APIs and ensures faster performance and better reliability.
- **Currencies Supported:** EGP, SAR, KWD, AED, QAR.
- **Packages Displayed:** 1 Month, 3 Months, 6 Months, 12 Months.
- **Package Inclusions:** "8 Sessions/Month, 2 Sessions/Week, 60 Mins/Session, 1:1 Focus".
- **Payment Flow:** **Off-Platform (Manual).** Handled via WhatsApp after a successful trial.

## Part 5: Admin Dashboard & Lead Management

### 5.1 Dashboard Functionality (CRM Lite)

The dashboard will serve as a lightweight CRM to manage trial requests.

- **Secure Login:** Authenticated access for admin users.
- **Centralized Lead View:** A data table displaying all incoming trial requests with their submitted details.
- **Tutor Assignment Strategy (Off-Platform):** The system will _not_ manage tutor schedules. The admin will view the lead, contact available tutors externally (via WhatsApp), and then update the lead's status internally.

### 5.2 Lead Status Pipeline

Admins can move leads through the following simplified pipeline:

- **New Request (طلب جديد):** Default state upon form submission.
- **Trial Scheduled (تم تحديد موعد):** Admin has successfully assigned a tutor and confirmed the date/link with the parent.
- **Trial Completed (تمت الجلسة):** The trial session has taken place.
- **Subscribed (اشترك):** The parent successfully paid and subscribed.
- **Did Not Subscribe (لم يشترك):** The parent declined or stopped responding.

### 5.3 Notifications System

Triggered immediately upon successful form submission:

- **Telegram Bot:** Instant message to the admin group with lead details (Free & highly effective).
- **In-App Notification:** A UI alert inside the custom dashboard.

## Part 6: Technical Architecture & Tech Stack

### 6.1 Frontend Architecture

- **Framework:** **Next.js 16** (App Router). Chosen for exceptional SSR/SSG capabilities, ensuring top-tier SEO and fast initial page loads.
- **Styling:** **Tailwind CSS v4** paired with **shadcn/ui**. Ensures a highly customizable, lightweight, and strictly consistent design system.
- **Internationalization (i18n):** Configured from day one to support Arabic (default, RTL) and English (LTR).

### 6.2 Backend & Database Architecture

- **Backend/DB Service:** **Convex**.
  - Chosen for its seamless integration with Next.js and out-of-the-box **real-time** capabilities.
  - Allows the admin dashboard to update instantly when a new lead submits the form without manual refreshing.
  - Handles server mutations securely.

### 6.3 Third-Party Integrations

- **Vercel Edge Functions / Middleware:**
  Used to extract user geolocation data (country code) from request headers and inject it into the app for dynamic pricing and localization.
- **Telegram API:** For routing lead notifications to the admin Telegram group.