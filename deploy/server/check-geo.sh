#!/usr/bin/env bash
# READ-ONLY: is the visitor country reaching the app? Changes nothing. Run any time (best after the DNS cutover).
# 1. Header echo through Nginx: a request carrying CF-IPCountry must come back with the app's
#    imath-country-detected cookie (the app sets it only from X-Vercel-IP-Country, which Nginx fills from CF-IPCountry).
# 2. Real traffic: country codes Nginx received from Cloudflare in the last 2000 requests (access log cc= field).
# Usage: sudo bash check-geo.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
cd /
LOG=/var/log/nginx/imath.access.log
COOKIE=imath-country-detected

cookie_for() {  # extra curl args -> value of the country cookie, or "(none)"
  local v
  v="$(curl -sk -o /dev/null -D - --max-time 15 --resolve www.imathmental.com:443:127.0.0.1 "$@" https://www.imathmental.com/ \
      | tr -d '\r' | grep -i "^set-cookie: $COOKIE=" | sed -E "s/^[^=]*=([^;]*).*/\1/" | head -n1 || true)"
  echo "${v:-(none)}"
}

echo "==> 1. header echo through Nginx -> app"
EG="$(cookie_for -H 'CF-IPCountry: EG')"
SA="$(cookie_for -H 'CF-IPCountry: sa')"
NONE="$(cookie_for)"
XX="$(cookie_for -H 'CF-IPCountry: XX')"
echo "   CF-IPCountry: EG  -> cookie $EG   (want EG)"
echo "   CF-IPCountry: sa  -> cookie $SA   (want SA)"
echo "   no header         -> cookie $NONE   (want (none))"
echo "   CF-IPCountry: XX  -> cookie $XX   (want (none): unknown country, same as Vercel)"
ECHO_OK=no; [[ $EG == EG && $SA == SA && $NONE == "(none)" && $XX == "(none)" ]] && ECHO_OK=yes

echo "==> 2. real traffic (last 2000 requests in $LOG)"
if [[ -s $LOG ]]; then
  tail -n 2000 "$LOG" | grep -v ' "curl/' | grep -oE 'cc=[^ ]*' | sort | uniq -c | sort -rn | head -n 15 | sed 's/^/   /'
  TOTAL="$(tail -n 2000 "$LOG" | grep -v ' "curl/' | grep -c 'cc=' || true)"
  EMPTY="$(tail -n 2000 "$LOG" | grep -v ' "curl/' | grep -cE 'cc=( |$)' || true)"
  echo "   requests: $TOTAL, without a country: $EMPTY"
else
  echo "   no traffic logged yet (normal before the DNS cutover)"
  TOTAL=0; EMPTY=0
fi

echo
echo "================ SUMMARY ================"
echo "app receives the country header: $ECHO_OK"
if [[ ${TOTAL:-0} -gt 0 ]]; then
  if [[ $EMPTY -eq $TOTAL ]]; then
    echo "real traffic: NO country on any request -> check Cloudflare IP Geolocation, and that DNS records are Proxied (orange)"
  else
    echo "real traffic: country codes arriving from Cloudflare (OK). A few empty ones are normal before cutover / from bots hitting the IP directly."
  fi
fi
echo "nothing was changed"
echo "========================================="
