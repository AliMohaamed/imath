#!/usr/bin/env bash
# Step 4: Nginx for www.imathmental.com (proxied to the app on localhost:3300) + apex -> www 301.
# Writes NEW files only:
#   /etc/nginx/sites-available/imath  (+ symlink in sites-enabled)
#   /etc/nginx/imath-cloudflare-realip.conf
# Never edits nginx.conf, edusuite or techworld files. `nginx -t` before a graceful reload (never restart);
# restores the previous state automatically if the test fails. Idempotent.
# Requires step3 (certificate).
# Usage: sudo bash step4-nginx.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
if grep -q $'\r' "$0"; then echo "Script has Windows (CRLF) line endings; run: sed -i 's/\r\$//' $0" >&2; exit 1; fi
cd /

SITE=/etc/nginx/sites-available/imath
LINK=/etc/nginx/sites-enabled/imath
REALIP=/etc/nginx/imath-cloudflare-realip.conf
CERT=/etc/ssl/cloudflare/imath.pem
KEY=/etc/ssl/cloudflare/imath.key
PORT=3300
NODE=/home/deploy/node/bin/node
[[ -s $CERT && -s $KEY ]] || { echo "Run step3 first: $CERT / $KEY missing." >&2; exit 1; }
# The app listens on "localhost" (see deploy/ecosystem.config.js); use the address Node resolves it to.
LOOPBACK="$("$NODE" -e "require('dns').lookup('localhost',(e,a)=>{if(e)process.exit(1);console.log(a)})")"
case "$LOOPBACK" in
  127.0.0.1) UPSTREAM="127.0.0.1:$PORT" ;;
  ::1) UPSTREAM="[::1]:$PORT" ;;
  *) echo "localhost resolves to '$LOOPBACK' (not loopback). Stop." >&2; exit 1 ;;
esac
echo "==> app upstream: $UPSTREAM"
if ! nginx -t 2>/dev/null; then echo "nginx -t already failing BEFORE our change. Aborting." >&2; nginx -t; exit 1; fi
OTHERS="$(grep -rlE 'imathmental' /etc/nginx --exclude="$(basename "$SITE")" --exclude="$(basename "$REALIP")" 2>/dev/null || true)"
if [[ -n "$OTHERS" ]]; then
  echo "Another Nginx file already mentions imathmental (nothing changed):" >&2
  echo "$OTHERS" >&2
  exit 1
fi

# Cloudflare edge ranges (https://www.cloudflare.com/ips/)
CF_RANGES=(
  173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18
  190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13
  104.24.0.0/14 172.64.0.0/13 131.0.72.0/22
  2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32
)

probe() {  # host scheme path -> "code location"
  local port=443; [[ "$2" == http ]] && port=80
  curl -sk -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 15 --resolve "$1:$port:127.0.0.1" "$2://$1$3" || true
}
snapshot() {
  echo "  edusuite.software                    $(probe edusuite.software https /)"
  echo "  api.edusuite.software                $(probe api.edusuite.software https /)"
  echo "  www.techworldegypt.com/en            $(probe www.techworldegypt.com https /en)"
  echo "  admin.techworldegypt.com/en          $(probe admin.techworldegypt.com https /en)"
  echo "  https www.imathmental.com/           $(probe www.imathmental.com https /)"
  echo "  https imathmental.com/en?x=1         $(probe imathmental.com https '/en?x=1')"
  echo "  http  imathmental.com/en?x=1         $(probe imathmental.com http '/en?x=1')"
  echo "  http  www.imathmental.com/en         $(probe www.imathmental.com http /en)"
}
echo "==> BEFORE"
BEFORE="$(snapshot)"; echo "$BEFORE"

STAMP="$(date +%Y%m%d%H%M%S)"
HAD_SITE=0; HAD_REALIP=0; HAD_LINK=0
[[ -e $SITE ]] && { HAD_SITE=1; cp -a "$SITE" "/root/imath.nginx.bak.$STAMP"; }
[[ -e $REALIP ]] && { HAD_REALIP=1; cp -a "$REALIP" "/root/imath-cloudflare-realip.conf.bak.$STAMP"; }
[[ -L $LINK ]] && HAD_LINK=1

restore() {
  if [[ $HAD_SITE == 1 ]]; then cp -a "/root/imath.nginx.bak.$STAMP" "$SITE"; else rm -f "$SITE"; fi
  if [[ $HAD_REALIP == 1 ]]; then cp -a "/root/imath-cloudflare-realip.conf.bak.$STAMP" "$REALIP"; else rm -f "$REALIP"; fi
  [[ $HAD_LINK == 1 ]] || rm -f "$LINK"
}

echo "==> writing $REALIP"
{
  echo "# Managed by deploy/server/step4-nginx.sh. Included only inside the imath server blocks."
  for r in "${CF_RANGES[@]}"; do echo "set_real_ip_from $r;"; done
  echo "real_ip_header CF-Connecting-IP;"
} > "$REALIP"

echo "==> writing $SITE"
{
cat <<'CONF'
# Managed by deploy/server/step4-nginx.sh (www.imathmental.com is canonical).
# The geo/map/log_format below are http-level (sites-enabled is included inside http {}); all names are imath_-prefixed.

# Requests that really come from Cloudflare (or from the server itself, for smoke tests).
geo $realip_remote_addr $imath_from_cf {
    default 0;
    127.0.0.1 1;
    ::1 1;
CONF
for r in "${CF_RANGES[@]}"; do echo "    $r 1;"; done
cat <<CONF
}

# Visitor country for the app, from Cloudflare's CF-IPCountry. Passed as X-Vercel-IP-Country so the app's
# geo pricing works unchanged. Overwrites anything the client sends; empty unless the request came via Cloudflare.
map "\$imath_from_cf:\$http_cf_ipcountry" \$imath_country {
    default "";
    "~^1:(?<imath_cc>[A-Za-z0-9]{2})\$" \$imath_cc;
}

log_format imath_main '\$remote_addr - [\$time_local] "\$request" \$status \$body_bytes_sent '
                      '"\$http_referer" "\$http_user_agent" cc=\$imath_country rt=\$request_time';

server {
    listen 80;
    listen [::]:80;
    server_name imathmental.com www.imathmental.com;
    return 301 https://www.imathmental.com\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name imathmental.com;

    ssl_certificate     $CERT;
    ssl_certificate_key $KEY;
    ssl_protocols TLSv1.2 TLSv1.3;

    include $REALIP;
    access_log /var/log/nginx/imath.access.log imath_main;
    error_log  /var/log/nginx/imath.error.log;

    # Single hop, path and query kept.
    return 301 https://www.imathmental.com\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.imathmental.com;

    ssl_certificate     $CERT;
    ssl_certificate_key $KEY;
    ssl_protocols TLSv1.2 TLSv1.3;

    include $REALIP;
    access_log /var/log/nginx/imath.access.log imath_main;
    error_log  /var/log/nginx/imath.error.log;

    client_max_body_size 5m;

    # Cloudflare talks to us over HTTPS even when the visitor used plain http (if "Always Use HTTPS" is off).
    if (\$http_x_forwarded_proto = "http") {
        return 301 https://www.imathmental.com\$request_uri;
    }

    location / {
        proxy_pass http://$UPSTREAM;
        proxy_http_version 1.1;
        # NOTE: no Upgrade/Connection "upgrade" headers (broke techworld admin; Convex WebSockets don't pass here).
        proxy_set_header Host                \$host;
        proxy_set_header X-Real-IP           \$remote_addr;
        proxy_set_header X-Forwarded-For     \$remote_addr;
        proxy_set_header X-Forwarded-Proto   \$scheme;
        proxy_set_header X-Forwarded-Host    \$host;
        proxy_set_header X-Vercel-IP-Country \$imath_country;
        # Convex Auth cookies + Next.js Link headers can exceed the 4k/8k default -> 502 "too big header".
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
        proxy_busy_buffers_size 32k;
        proxy_read_timeout 60s;
    }
}
CONF
} > "$SITE"

ln -sfn "$SITE" "$LINK"

echo "==> nginx -t"
if nginx -t; then
  systemctl reload nginx   # graceful reload, never restart
  echo "reloaded"
else
  echo "TEST FAILED: restoring the previous state, nothing reloaded." >&2
  restore
  nginx -t
  exit 1
fi

sleep 2   # reload is asynchronous
echo
echo "================ SUMMARY ================"
echo "BEFORE:"; echo "$BEFORE"
echo "AFTER:";  snapshot
echo "expected after: edusuite + techworld lines identical to BEFORE;"
echo "  www.imathmental.com/ -> 502 until the first deploy (200 after);"
echo "  every imathmental.com line and http www -> '301 https://www.imathmental.com/...' with the path/query kept."
echo "upgrade headers in our file: $(grep -ciE 'proxy_set_header[[:space:]]+(upgrade|connection)' "$SITE" || true) (want 0)"
echo "rollback: sudo rm $LINK && sudo nginx -t && sudo systemctl reload nginx"
echo "========================================="
