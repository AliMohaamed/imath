#!/usr/bin/env bash
# Step 3: install the Cloudflare Origin Certificate for imathmental.com as NEW files
# (/etc/ssl/cloudflare/imath.pem + imath.key). Existing certs (origin.pem, techworld.*) are not touched.
# Usage: sudo bash step3-origin-cert.sh /tmp/imath_origin.pem /tmp/imath_origin.key
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
if grep -q $'\r' "$0"; then echo "Script has Windows (CRLF) line endings; run: sed -i 's/\r\$//' $0" >&2; exit 1; fi
CERT_SRC="$(realpath "${1:-/nonexistent}" 2>/dev/null || true)"
KEY_SRC="$(realpath "${2:-/nonexistent}" 2>/dev/null || true)"
[[ -s "$CERT_SRC" && -s "$KEY_SRC" ]] || { echo "Usage: sudo bash $0 cert.pem key.key" >&2; exit 1; }
cd /
DIR=/etc/ssl/cloudflare
CERT=$DIR/imath.pem
KEY=$DIR/imath.key

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
tr -d '\r' < "$CERT_SRC" > "$tmp/c.pem"
tr -d '\r' < "$KEY_SRC" > "$tmp/k.key"

echo "==> validating"
openssl x509 -in "$tmp/c.pem" -noout >/dev/null || { echo "not a valid certificate" >&2; exit 1; }
openssl pkey -in "$tmp/k.key" -noout >/dev/null || { echo "not a valid private key" >&2; exit 1; }
[[ "$(openssl x509 -in "$tmp/c.pem" -pubkey -noout)" == "$(openssl pkey -in "$tmp/k.key" -pubout)" ]] \
  || { echo "certificate and key do NOT match" >&2; exit 1; }
SAN="$(openssl x509 -in "$tmp/c.pem" -noout -ext subjectAltName 2>/dev/null || true)"
echo "$SAN" | grep -qE 'DNS:imathmental\.com(,|$)' || { echo "cert lacks imathmental.com" >&2; exit 1; }
echo "$SAN" | grep -qF '*.imathmental.com' || { echo "cert lacks *.imathmental.com (needed for www)" >&2; exit 1; }
openssl x509 -in "$tmp/c.pem" -noout -checkend 2592000 >/dev/null || { echo "cert expires within 30 days" >&2; exit 1; }

echo "==> installing (new files only)"
install -d -m 755 "$DIR"
install -m 644 -o root -g root "$tmp/c.pem" "$CERT"
install -m 600 -o root -g root "$tmp/k.key" "$KEY"

echo "==> removing the uploaded copies"
shred -u "$KEY_SRC" 2>/dev/null || rm -f "$KEY_SRC"
rm -f "$CERT_SRC"

echo
echo "================ SUMMARY ================"
openssl x509 -in "$CERT" -noout -subject -issuer -enddate
echo "$SAN" | tail -n +2
ls -l "$DIR"
echo "uploaded copies removed: $([[ ! -e $CERT_SRC && ! -e $KEY_SRC ]] && echo yes || echo NO)"
echo "other certificates were not modified"
echo "========================================="
