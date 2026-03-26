# iMath Launch Checklist

## Environment

- Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- Set `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_SITE_URL`, and `CONVEX_DEPLOYMENT`.
- Set `ADMIN_EMAIL_ALLOWLIST` for the CRM dashboard.
- Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for lead alerts.

## Vercel Verification

- Confirm `x-vercel-ip-country` is present in production requests.
- Verify geo-pricing picks the detected country on first visit and honors manual override afterward.
- Check that `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` are reachable.
- Verify localized metadata for `/` and `/en` in the rendered HTML.

## Funnel Smoke Test

1. Visit `/` and confirm Arabic loads in RTL.
2. Visit `/en` and confirm English loads in LTR.
3. Open the booking modal from hero, header, pricing, and final CTA.
4. Submit a lead and confirm success state plus Convex persistence.
5. Confirm the Telegram message arrives, or a failed/skipped delivery is logged in the admin dashboard.
6. Open `/admin`, review the lead, update status, and test WhatsApp/call actions.

## UX and Accessibility

- Test hero, pricing, FAQ, booking modal, and admin dashboard at common mobile widths.
- Tab through the booking modal and confirm focus, keyboard escape, and readable errors.
- Verify the skip link works on landing and admin routes.

## Performance

- Run Lighthouse or PageSpeed Insights against `/` and `/en`.
- Check LCP, CLS, and INP after deployment.
- Replace the temporary hero placeholder with the final optimized image before launch if available.
