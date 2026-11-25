# iMath: moving off Vercel (self-hosting plan)

Status: **approved 2026-11-25; building on branch `self-host`.**

## 1. Decision: VPS (Cloudflare Pages is not possible without behavior changes)

`output: "export"` would need every item below removed. None can be replaced statically without changing
what users see, the URLs, or Convex (all three are off-limits).

| # | Blocker | Where | Static replacement without behavior change? |
|---|---|---|---|
| 1 | **Route handlers** `POST /api/leads` (free-trial booking) and `POST /api/assessments` (personality + level tests) | `src/app/api/*/route.ts` | **No.** They use `CONVEX_SERVER_SECRET` and `TELEGRAM_BOT_TOKEN`, which must never reach the browser. Moving them into Convex HTTP actions = Convex change + new endpoint URLs. |
| 2 | **Middleware** (`src/proxy.ts`): next-intl locale handling (Arabic at `/` unprefixed, `/en/*` English; `/` → `/en` by cookie/Accept-Language; `/ar/*` → unprefixed), admin auth gate (`/admin` → `/admin/login`), `/api/auth` proxy for Convex Auth, geo cookie from the visitor's country | `src/proxy.ts` | **No.** A static `/` can't pick a locale per visitor (a JS redirect is a visible/SEO change), and Convex Auth for Next.js stores the session in httpOnly cookies set by the `/api/auth` proxy: it needs a server. |
| 3 | **Admin pages** read auth cookies at request time (`ConvexAuthNextjsServerProvider`) | `src/app/[locale]/(admin)/layout.tsx` | **No** (same reason as 2). |
| 4 | **Geo pricing / lead country** from `x-vercel-ip-country` + `cookies()` | `src/lib/geo.ts`, `src/proxy.ts` | **No.** Needs a request-time header. |
| 5 | `next/image` optimization (AVIF/WebP, 11 components) | `next.config.ts` | Could be `unoptimized`, but heavier images = visible change. |
| 6 | `headers()` cache rules | `next.config.ts` | Yes (`_headers`), but moot given 1–4. |

Also considered and rejected: **Cloudflare Workers via OpenNext**. Free plan = 10 ms CPU/request and a 3 MB
worker limit; Next 16 Node-runtime middleware + Convex Auth is a poor fit, and hitting limits again is exactly
what took the site down on Vercel.

**Recommendation: the Netcup VPS**, same setup as techworld. Load is small (one Next.js process, ~150–250 MB RAM,
capped at 400 MB), Cloudflare caches static assets in front of it, and it reuses the existing `deploy` user,
Node 22 and PM2.

## 2. What runs where

| Item | Value |
|---|---|
| PM2 app | `im-web`, fork mode, 1 instance, `max_memory_restart: 400M`, `localhost:3300` (loopback only; see 3.8) |
| App dir | `/home/deploy/imath/{releases,env,logs,cache}` + `current` symlink, keep 3 releases |
| Nginx | one new file `/etc/nginx/sites-available/imath` + `/etc/nginx/imath-cloudflare-realip.conf` |
| TLS | Cloudflare Origin Cert → `/etc/ssl/cloudflare/imath.pem` / `imath.key` (new files) |
| CI key | `%USERPROFILE%\.ssh\imath_deploy` (on your PC), public key **appended** to deploy's `authorized_keys` |
| Build | GitHub Actions (ubuntu, Node 22, npm pinned to 11.12.1, the lockfile's npm), never on the server |

Untouched: edusuite (`edusuite-api`:4000, Nginx `edusuite`), techworld (`tw-storefront`/`tw-admin`:3100/3101,
Nginx `techworld-*`, `techworld.pem`), ali's PM2, `nginx.conf`, existing certs, Convex.

## 3. Things that differ from techworld (found in this codebase)

1. **Country header.** The app reads `x-vercel-ip-country` (pricing currency, lead/assessment country, geo cookie).
   Nginx will set `X-Vercel-IP-Country $http_cf_ipcountry` (Cloudflare's country header). No app code change.
   It **overwrites** any value the visitor sends, exactly as Vercel does. Cloudflare's "unknown" value `XX`
   is already ignored by `normalizeCountryCode`; `T1` (Tor) fails its 2-letter check, same as an unknown country.
   Needs Cloudflare **Network → IP Geolocation = On** (default on; I'll list it in the cutover checklist).
2. **Client IP for rate limiting** (`src/lib/server/rate-limit.ts` uses the first `X-Forwarded-For` entry).
   Nginx sets `X-Forwarded-For $remote_addr` (the real IP from `CF-Connecting-IP`) instead of appending,
   so a visitor can't spoof their rate-limit key. Same as Vercel, which also overwrites it.
3. **Image optimizer cache** lives in `.next/cache`; each release links it to the shared
   `/home/deploy/imath/cache` so a deploy doesn't re-encode every image (CPU on a shared 2-vCPU box).
4. **Site URL guard.** `src/lib/site.ts` only checks `NEXT_PUBLIC_SITE_URL` when `VERCEL_ENV=production`.
   CI will fail the build itself if the variable is empty, so canonicals/sitemap/hreflang can't silently
   fall back to localhost. No app code change.
5. **No `packageManager` field**, lockfile v3 written by npm 11.12.1 → CI pins `npm@11.12.1` before `npm ci`.
6. **`convex/_generated` is already committed.** CI never runs `convex deploy` and needs no Convex key.
7. `after()` (Telegram after the assessment response) works in `next start`/standalone. No change.
8. **`HOSTNAME=localhost`, not `127.0.0.1`** (found while testing the standalone build). Arabic pages live at `/` and
   are rewritten by the middleware to `/ar/...`. Next compares the rewrite URL with `http://<HOSTNAME>:<PORT>`;
   with `127.0.0.1` they differ, Next proxies the rewrite as an external URL and **every Arabic page loops with 307**.
   With `localhost` all routes return 200 (tested locally). Still loopback-only; step4 points Nginx at whatever
   address Node resolves `localhost` to (127.0.0.1 or ::1).
9. **Only one Nginx header rule from techworld's lessons:** no `Upgrade`/`Connection "upgrade"` headers.
   (Convex WebSockets go browser → Convex directly, not through Nginx.)

## 4. Code changes (branch `self-host`, small commits, typecheck + tests + build before each)

1. `next.config.ts`: add `output: "standalone"` (no runtime behavior change; same server, same headers).
2. `deploy/ecosystem.config.js`: PM2 `im-web` as above.
3. `deploy/env/imath.env.example`: names only.
4. `deploy/server/step1..5-*.sh`: server scripts (below).
5. `.github/workflows/deploy.yml`: build → tarball → release → `pm2 startOrReload` → smoke test through Nginx with
   `--resolve`. Triggers: push to `main`, plus push to `self-host` **only during setup** (removed before merge),
   and `workflow_dispatch`. Docs and `deploy/server/**` changes don't trigger a deploy.

## 5. Environment variables

**GitHub → Settings → Secrets and variables → Actions**

| Kind | Name | Value / source |
|---|---|---|
| Variable | `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard → **Production** deployment → Settings → URL (`https://<name>.convex.cloud`). Not the dev URL from `.env.local`. |
| Variable | `NEXT_PUBLIC_SITE_URL` | `https://www.imathmental.com` |
| Secret | `VPS_SSH_KEY` | contents of `%USERPROFILE%\.ssh\imath_deploy` (private key) |
| Secret | `VPS_HOST` / `VPS_USER` / `VPS_SSH_PORT` | same as techworld (`deploy`, your host, port) |

**Runtime env file** `/home/deploy/imath/env/imath.env` (template `deploy/env/imath.env.example`, filled at `%USERPROFILE%\.ssh\imath.env`):

| Name | Required | Original source (Vercel hides sensitive values) |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | yes | as above. Also read at runtime by `@convex-dev/auth/nextjs` middleware and the API routes. |
| `CONVEX_SERVER_SECRET` | **optional** | **Not on Vercel** (Project tab). Empty keeps today's behavior: `/api/assessments` → 500, results not saved (child still sees the result). If set: Convex dashboard → Production → Settings → Environment Variables (same value). Owner decides; see §10. |
| `TELEGRAM_BOT_TOKEN` | yes (to match prod) | Telegram @BotFather → /mybots → your bot → API Token. Without it leads still save but no Telegram alert. |
| `TELEGRAM_CHAT_ID` | yes (to match prod) | The chat/group the alerts go to today (same as in your local `.env.local` if that's the same group; otherwise from `https://api.telegram.org/bot<token>/getUpdates`). |

**Not needed** on the server (the Next app doesn't read them): `CONVEX_DEPLOY_KEY`, `CONVEX_DEPLOYMENT`,
`CONVEX_SITE_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `ADMIN_EMAIL_ALLOWLIST`, `JWT_PRIVATE_KEY`, `JWKS`,
`DEFAULT_COUNTRY_CODE`, `DEFAULT_CURRENCY` (Convex-side or unused). Convex's own env stays as is.

## 6. Server steps (scripts committed in `deploy/server/`, run by you with `ssh -t edusuite "sudo bash ..."`)

| Step | Script | Does |
|---|---|---|
| 1 | `step1-check.sh` | Read-only: CPU arch, free RAM/disk, port 3300 free, `deploy` user + Node + PM2 present, no Nginx `server_name` for imathmental.com, status of all existing sites. |
| 2 | `step2-deploy-key.sh` | Appends the imath CI public key to deploy's `authorized_keys` (keeps techworld's), creates `/home/deploy/imath/{releases,env,logs,cache}`. |
| 3 | `step3-origin-cert.sh` | Validates + installs `imath.pem`/`imath.key` (cert must cover `imathmental.com` and `*.imathmental.com`), deletes the upload. |
| 4 | `step4-nginx.sh` | Writes `imath` site + real-IP include; apex→www **301 single hop** (path+query kept, http and https); `nginx -t` then reload (never restart); auto-rollback on failure; before/after status of edusuite.software, api.edusuite.software, www.techworldegypt.com, admin.techworldegypt.com, and ours. |
| 5 | `step5-env.sh` | Validates `imath.env` (prints names only), installs deploy-owned 600, deletes the upload. |

Then: first deploy from GitHub Actions (on `self-host`), smoke test through Nginx on the server.

## 7. Verification before DNS (on the server through Nginx, plus from your PC with a hosts-file override)

- 200 (Arabic unprefixed, English under `/en`): `/`, `/en`, `/program`, `/resources`, every `/resources/<slug>`, `/assessment`,
  `/assessment/personality`, `/assessment/level`, `/privacy`, `/terms`, `/admin/login` (+ the `/en` versions); 404 for unknown paths.
  The deploy workflow smoke-tests most of these automatically.
- `robots.txt`, `sitemap.xml` (URLs on `https://www.imathmental.com`), `manifest.webmanifest`, icons, fonts, `/_next/image` (AVIF/WebP).
- Apex: `https://imathmental.com/en?x=1` → one 301 → `https://www.imathmental.com/en?x=1`; `http://` too.
- Cache headers for `/font/*` and images match `next.config.ts`.
- After DNS: booking form → lead in admin + Telegram alert with the right country; one personality + one level test;
  admin login + dashboard; prices show the right currency for your country.

## 8. DNS cutover (you, last; I'll give exact values after step 1 shows the VPS IP)

Today (screenshot): `imathmental.com` and `www` are both `CNAME → 31d703a4526a2fcc.vercel-dns-017.com`, DNS only, TTL 10 min;
two `_vercel` TXT records (verification). No MX. Change ONLY the two CNAMEs; leave both `_vercel` TXT records:

1. Cloudflare SSL/TLS → **Full (strict)** for the imathmental.com zone (other zones like edusuite/techworld are unaffected).
   Also SSL/TLS → Edge Certificates: Universal certificate **Active** (covers imathmental.com + *.imathmental.com).
2. Apex: Cloudflare can't change a record's type, so **delete** the `imathmental.com` CNAME and **add**
   `A  imathmental.com → 62.83.16.12`, Proxied (orange), TTL Auto.
3. `www`: **edit** the CNAME: content `imathmental.com`, Proxied (orange), TTL Auto.
4. Network → IP Geolocation **On**.

5. SSL/TLS → Edge Certificates → **Always Use HTTPS: Off** keeps `http://imathmental.com` a single 301 hop
   (Nginx redirects plain-http visitors itself using Cloudflare's `X-Forwarded-Proto`). If you leave it On,
   everything still works, but `http://` apex is two hops (Cloudflare → https, then Nginx → www).

### Geo check (country for pricing)

- Dashboard: imathmental.com → **Network** → **IP Geolocation** must be **On**. (If your dashboard shows it under
  Rules → Settings / Managed Transforms instead, the toggle there is the same setting.)
- Header echo, no app change: the app sets its `imath-country-detected` cookie only from `X-Vercel-IP-Country`,
  which Nginx fills from Cloudflare's `CF-IPCountry` (only for requests that come from Cloudflare or the server itself).
  Every deploy sends `CF-IPCountry: EG` through Nginx and fails unless the cookie comes back as `EG`.
- After cutover: `deploy/server/check-geo.sh` (read-only) repeats the echo test (EG, sa, none, XX) and counts the
  country codes Nginx actually received from Cloudflare (`cc=` in `/var/log/nginx/imath.access.log`).
  From your PC: `https://www.imathmental.com/cdn-cgi/trace` shows `loc=` (Cloudflare's view), and DevTools →
  Application → Cookies shows `imath-country-detected` = your country (the app's view).

Rollback: put the two records back as in the screenshot (Vercel is paused until Dec 24 anyway).
After it's stable: disconnect the Vercel project's Git integration so a Dec 24 unpause doesn't redeploy there.

## 9. Order of work after your OK

1. Branch `self-host`: config + PM2 + env template + scripts + workflow (I do; commits only, no push without asking).
2. You: generate CI key (PowerShell command I give), GitHub variables/secrets, origin cert, fill `imath.env`.
3. You: run steps 1–5 (I give the exact PowerShell).
4. Push `self-host` (with your OK) → first deploy → smoke test.
5. Verification (§7), then DNS (§8), then final checks, then merge to `main` with your OK (removing the `self-host` trigger).

## 10. Findings from the Vercel env + Cloudflare DNS screenshots (2026-11-25)

- **All Vercel values are revealable** (eye icon; none are marked Sensitive). Copy `NEXT_PUBLIC_CONVEX_URL`,
  `NEXT_PUBLIC_SITE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` straight from Vercel: those are exactly what production runs.
  Don't click "Needs Attention" → mark Sensitive before copying.
- **`CONVEX_SERVER_SECRET` is not in the Project tab.** `/api/assessments` needs it, so unless it is in the **Shared** tab,
  assessment results have not been saved in production since 2026-10-16 (the client hides the failure). Booking (`/api/leads`)
  doesn't use it. Matching Vercel = leave it empty; fixing it is a behavior change the owner must approve.
- **`CONVEX_DEPLOY_KEY` on Vercel** suggests the Vercel Build Command may be `npx convex deploy --cmd ...`. If so:
  (a) the bundle used the deploy key's production URL, so compare it with Vercel's `NEXT_PUBLIC_CONVEX_URL`;
  (b) Convex functions were deployed on every push. CI never deploys Convex, so after the move run `npx convex deploy`
  yourself when `convex/` changes.
- Not needed on the VPS: `JWT_PRIVATE_KEY`, `CONVEX_DEPLOYMENT`, `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_CONVEX_SITE_URL`,
  `DEFAULT_COUNTRY_CODE`, `DEFAULT_CURRENCY`, `ADMIN_EMAIL_ALLOWLIST` (the Next app never reads them; Convex has its own copies).

## 11. Step 1 result (2026-11-25)

x86_64, Ubuntu 24.04.5, 2.5 GB RAM free, 107 GB disk free, IPv4 62.83.16.12, port 3300 free, Nginx 1.24 OK,
no existing imathmental config. Node resolves `localhost` to `::1`, so the app listens on `[::1]:3300` and step4 proxies there.
Baseline: edusuite.software 200, api.edusuite.software 404, www/admin.techworldegypt.com 307.
Note: `pm2-deploy` is enabled but inactive (deploy's PM2 was started outside systemd); it resurrects the saved list on reboot. Not changed.

## 12. Steps 2–5 done (2026-11-25)

- Step 2: imath-ci key `SHA256:l+fvTsYC1aELj+5JRsjFmjxhnvfT4XEH1hSw71hJE9k` added; techworld key kept.
- Step 3: `imath.pem`/`imath.key` installed (imathmental.com + *.imathmental.com, expires 2041-11-21).
- Step 4: Nginx `imath` live, upstream `[::1]:3300`; edusuite/techworld unchanged; apex 301 single hop with path + query.
- Step 5: env installed (`NEXT_PUBLIC_CONVEX_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`; bot @imath_leads_bot →
  supergroup "إشعارات iMath"). Convex URL sha256 `949c12012dd9`.
- Owner decisions: `CONVEX_SERVER_SECRET` stays empty for the migration (not on Vercel; fix assessments after cutover as a
  separate step). Vercel Build Command is the default `next build`, so Vercel never deployed Convex: no workflow change.
