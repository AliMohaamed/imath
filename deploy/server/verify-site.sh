#!/usr/bin/env bash
# READ-ONLY: full pre-cutover check of www.imathmental.com through Nginx on this server (127.0.0.1 via --resolve),
# so it works while DNS still points to Vercel. Changes nothing.
# Checks: every sitemap URL, key pages, 404, apex/http redirects, robots/sitemap/manifest/icons,
# _next/static + fonts + optimized images (and their cache headers), the geo header echo, other sites unchanged.
# Usage: sudo bash verify-site.sh
set -uo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
cd /
H=www.imathmental.com
B=https://$H
C=(-sk --max-time 20 --resolve "$H:443:127.0.0.1" --resolve "imathmental.com:443:127.0.0.1" --resolve "$H:80:127.0.0.1" --resolve "imathmental.com:80:127.0.0.1")
FAIL=0
expect() {  # label want got
  if [[ "$3" == "$2" ]]; then echo "  ok    $1 -> $3"; else echo "  FAIL  $1 -> $3 (want $2)"; FAIL=1; fi
}
code() { curl "${C[@]}" -o /dev/null -w '%{http_code}' "$@" || true; }
redir() { curl "${C[@]}" -o /dev/null -w '%{http_code} %{redirect_url}' "$@" || true; }

echo "==> sitemap"
SITEMAP="$(curl "${C[@]}" "$B/sitemap.xml" || true)"
mapfile -t URLS < <(echo "$SITEMAP" | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g')
echo "  ${#URLS[@]} URLs"
[[ ${#URLS[@]} -gt 0 ]] || { echo "  FAIL  sitemap empty"; FAIL=1; }
BAD_HOST=0
for u in "${URLS[@]}"; do
  [[ "$u" == https://www.imathmental.com* ]] || BAD_HOST=1
  c="$(code "$u")"; [[ "$c" == 200 ]] || { echo "  FAIL  $u -> $c"; FAIL=1; }
done
[[ $BAD_HOST == 0 ]] && echo "  ok    all sitemap URLs on https://www.imathmental.com" || { echo "  FAIL  sitemap has URLs on another host"; FAIL=1; }
echo "  sitemap pages checked (only failures are listed)"

echo "==> pages and files"
for p in / /en /program /en/program /resources /en/resources /assessment /assessment/personality /assessment/level \
         /en/assessment/personality /en/assessment/level /privacy /en/privacy /terms /en/terms /admin/login /en/admin/login \
         /robots.txt /sitemap.xml /manifest.webmanifest /icon.png /logo.png; do
  expect "$p" 200 "$(code "$B$p")"
done
expect "unknown page" 404 "$(code "$B/this-page-does-not-exist")"
expect "/ar (Arabic has no prefix)" "307 $B/" "$(redir "$B/ar")"
expect "/admin (not logged in)" "307 $B/ar/admin/login" "$(redir "$B/admin")"
expect "/ with Accept-Language en" "307 $B/en" "$(redir -H 'Accept-Language: en-US' "$B/")"
expect "https apex + query" "301 $B/program?utm_source=x" "$(redir 'https://imathmental.com/program?utm_source=x')"
expect "http apex + query" "301 $B/program?utm_source=x" "$(redir 'http://imathmental.com/program?utm_source=x')"
expect "http www" "301 $B/en" "$(redir 'http://www.imathmental.com/en')"
expect "visitor http via Cloudflare" "301 $B/en" "$(redir -H 'X-Forwarded-Proto: http' "$B/en")"
grep -q 'rel="canonical" href="https://www.imathmental.com' <(curl "${C[@]}" "$B/en/program") \
  && echo "  ok    canonical uses https://www.imathmental.com" || { echo "  FAIL  canonical"; FAIL=1; }

echo "==> assets"
HTML="$(curl "${C[@]}" "$B/" ; curl "${C[@]}" "$B/en/program")"
mapfile -t STATIC < <(echo "$HTML" | grep -oE '/_next/static/[^"?]+\.(css|js)' | sort -u | head -n 8)
for s in "${STATIC[@]}"; do expect "static ${s:0:60}" 200 "$(code "$B$s")"; done
[[ ${#STATIC[@]} -gt 0 ]] && echo "  static cache: $(curl "${C[@]}" -I "$B${STATIC[0]}" | tr -d '\r' | grep -i '^cache-control' )"
CSS="$(for s in "${STATIC[@]}"; do [[ "$s" == *.css ]] && curl "${C[@]}" "$B$s"; done)"
FONT="$(printf '%s\n%s' "$HTML" "$CSS" | grep -oE '/font/[^")'"'"']+\.woff2' | head -n1)"
[[ -n "$FONT" ]] && { expect "font $FONT" 200 "$(code "$B$FONT")"; echo "  font cache:   $(curl "${C[@]}" -I "$B$FONT" | tr -d '\r' | grep -i '^cache-control')"; }
mapfile -t IMGS < <(echo "$HTML" | grep -oE '/_next/image\?url=[^" ]+' | sed 's/&amp;/\&/g' | sort -u | head -n 8)
for i in "${IMGS[@]}"; do
  r="$(curl "${C[@]}" -o /dev/null -H 'Accept: image/avif,image/webp,*/*' -w '%{http_code} %{content_type}' "$B$i" || true)"
  [[ "$r" == 200\ image/* ]] && echo "  ok    image ${i:0:70} -> $r" || { echo "  FAIL  image $i -> $r"; FAIL=1; }
done
echo "  optimized images checked: ${#IMGS[@]}"
PIMG="$(echo "$HTML" | grep -oE '/(images|og|assessment)/[^"?]+\.(png|jpe?g|webp|svg)' | head -n1)"
[[ -n "$PIMG" ]] && echo "  image cache:  $PIMG $(curl "${C[@]}" -I "$B$PIMG" | tr -d '\r' | grep -i '^cache-control')"

echo "==> geo echo (app sets its cookie only from the country header)"
geo() { curl "${C[@]}" -o /dev/null -D - "$@" "$B/" | tr -d '\r' | grep -i '^set-cookie: imath-country-detected=' | sed -E 's/^[^=]*=([^;]*).*/\1/' | head -n1; }
expect "CF-IPCountry EG" EG "$(geo -H 'CF-IPCountry: EG')"
expect "no header" "" "$(geo)"

echo "==> API routes reachable (GET is not allowed; 405 means the route is there)"
expect "GET /api/leads" 405 "$(code "$B/api/leads")"
expect "GET /api/assessments" 405 "$(code "$B/api/assessments")"

echo "==> app"
sudo -u deploy -H env PATH=/home/deploy/node/bin:/usr/bin:/bin pm2 describe im-web 2>/dev/null | grep -E '│ (status|restarts|uptime|script path|exec cwd)' | sed 's/^/  /'
echo "  memory: $(ps -o rss= -p "$(sudo -u deploy -H env PATH=/home/deploy/node/bin:/usr/bin:/bin pm2 pid im-web 2>/dev/null)" 2>/dev/null | awk '{printf "%d MB", $1/1024}')"
echo "  recent app errors: $(tail -n 200 /home/deploy/imath/logs/im-web.err.log 2>/dev/null | grep -c . ) lines in the last 200 of im-web.err.log"

echo
echo "================ SUMMARY ================"
probe() { curl -sk -o /dev/null -w '%{http_code}' --max-time 10 --resolve "$1:443:127.0.0.1" "https://$1$2" || true; }
echo "other sites: edusuite.software $(probe edusuite.software /), api.edusuite.software $(probe api.edusuite.software /), www.techworldegypt.com/en $(probe www.techworldegypt.com /en), admin.techworldegypt.com/en $(probe admin.techworldegypt.com /en)"
echo "  (want 200, 404, 200, 200 as in step4)"
[[ $FAIL == 0 ]] && echo "RESULT: all checks passed" || echo "RESULT: FAILURES above, send me the output"
echo "nothing was changed"
echo "========================================="
