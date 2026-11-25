#!/usr/bin/env bash
# Step 5: install iMath's runtime env file for the deploy user.
# Usage: sudo bash step5-env.sh /tmp/imath.env
# - Validates the file first. Prints variable NAMES and pass/fail checks only, never values.
# - Checks the Telegram token/chat with read-only API calls (getMe/getChat; no message is sent).
# - Installs to /home/deploy/imath/env/imath.env (owner deploy, mode 600), deletes the upload.
# - Restarts im-web (only) if it is already running, so it picks up the new values. Idempotent.
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
if grep -q $'\r' "$0"; then echo "Script has Windows (CRLF) line endings; run: sed -i 's/\r\$//' $0" >&2; exit 1; fi
SRC="$(realpath "${1:-/nonexistent}" 2>/dev/null || true)"
[[ -s "$SRC" ]] || { echo "Usage: sudo bash $0 /tmp/imath.env" >&2; exit 1; }
cd /

DEST_DIR=/home/deploy/imath/env
DEST=$DEST_DIR/imath.env
NODE=/home/deploy/node/bin/node
[[ -d $DEST_DIR ]] || { echo "$DEST_DIR missing: run step2 first." >&2; exit 1; }

REQUIRED=(NEXT_PUBLIC_CONVEX_URL CONVEX_SERVER_SECRET TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID)
REFUSED=(CONVEX_DEPLOY_KEY CONVEX_DEPLOYMENT CONVEX_SITE_URL JWT_PRIVATE_KEY JWKS ADMIN_EMAIL_ALLOWLIST)

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
OUT=$tmp/imath.env
FAIL=0
declare -A V=()
in_list() { local x="$1"; shift; local i; for i in "$@"; do [[ "$i" == "$x" ]] && return 0; done; return 1; }

echo "==> validating (names only)"
: > "$OUT"
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ -z "${line//[[:space:]]/}" || "$line" =~ ^[[:space:]]*# ]] && continue
  if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then echo "   malformed line (not NAME=value), skipped"; FAIL=1; continue; fi
  key="${line%%=*}"; val="${line#*=}"
  val="${val#\"}"; val="${val%\"}"; val="${val#\'}"; val="${val%\'}"
  val="${val#"${val%%[![:space:]]*}"}"; val="${val%"${val##*[![:space:]]}"}"   # trim
  if in_list "$key" "${REFUSED[@]}"; then echo "   REFUSED (not used by the Next.js app, must not be on the server): $key"; FAIL=1; continue; fi
  if [[ -n "${V[$key]+x}" ]]; then echo "   duplicate: $key"; FAIL=1; continue; fi
  V[$key]="$val"
  if [[ -z "$val" ]]; then echo "   empty: $key"; in_list "$key" "${REQUIRED[@]}" && FAIL=1; continue; fi
  in_list "$key" "${REQUIRED[@]}" || echo "   note: unlisted variable kept: $key"
  printf '%s=%s\n' "$key" "$val" >> "$OUT"
done < "$SRC"
for r in "${REQUIRED[@]}"; do [[ -n "${V[$r]:-}" ]] || { echo "   REQUIRED but missing/empty: $r"; FAIL=1; }; done

check() { if eval "$2"; then echo "   ok    $1"; else echo "   FAIL  $1"; FAIL=1; fi; }
echo "==> format checks"
check "NEXT_PUBLIC_CONVEX_URL looks like https://<name>.convex.cloud" '[[ "${V[NEXT_PUBLIC_CONVEX_URL]:-}" =~ ^https://[a-z0-9-]+\.convex\.cloud/?$ ]]'
SECRET="${V[CONVEX_SERVER_SECRET]:-}"
check "CONVEX_SERVER_SECRET is at least 16 chars, no spaces" '[[ ${#SECRET} -ge 16 && ! "$SECRET" =~ [[:space:]] ]]'
unset SECRET
check "TELEGRAM_BOT_TOKEN looks like <digits>:<token>" '[[ "${V[TELEGRAM_BOT_TOKEN]:-}" =~ ^[0-9]+:[A-Za-z0-9_-]{30,}$ ]]'
check "TELEGRAM_CHAT_ID is a number" '[[ "${V[TELEGRAM_CHAT_ID]:-}" =~ ^-?[0-9]+$ ]]'

echo "==> Telegram (read-only: getMe / getChat, no message sent)"
if [[ "${V[TELEGRAM_BOT_TOKEN]:-}" =~ ^[0-9]+:[A-Za-z0-9_-]{30,}$ && "${V[TELEGRAM_CHAT_ID]:-}" =~ ^-?[0-9]+$ ]]; then
  # Token goes to curl through a config file on stdin, so it never appears in the process list.
  tg() { printf 'url = "https://api.telegram.org/bot%s/%s"\n' "${V[TELEGRAM_BOT_TOKEN]}" "$1" | curl -s --max-time 15 -K - "${@:2}" || true; }
  ME="$(tg getMe)"
  CHAT="$(tg getChat --data-urlencode "chat_id=${V[TELEGRAM_CHAT_ID]}")"
  "$NODE" -e '
    const [me, chat] = process.argv.slice(1).map(s => { try { return JSON.parse(s) } catch { return {} } });
    console.log(me.ok ? "   ok    bot: @" + me.result.username : "   FAIL  getMe: token rejected (" + (me.description || "no answer") + ")");
    console.log(chat.ok ? "   ok    chat: " + chat.result.type + " \"" + (chat.result.title || chat.result.first_name || "") + "\"" : "   FAIL  getChat: bot cannot see this chat (" + (chat.description || "no answer") + ")");
    process.exit(me.ok && chat.ok ? 0 : 1);
  ' "$ME" "$CHAT" || FAIL=1
fi

if [[ $FAIL -ne 0 ]]; then
  echo "Validation failed: nothing installed. The upload is left in place so you can fix it and re-upload." >&2
  exit 1
fi

echo "==> installing"
install -m 600 -o deploy -g deploy "$OUT" "$DEST"
shred -u "$SRC" 2>/dev/null || rm -f "$SRC"

RESTARTED="no (im-web not running yet; the first deploy will load it)"
if sudo -u deploy -H env PATH=/home/deploy/node/bin:/usr/bin:/bin pm2 describe im-web >/dev/null 2>&1; then
  sudo -u deploy -H env PATH=/home/deploy/node/bin:/usr/bin:/bin pm2 restart im-web --update-env >/dev/null
  RESTARTED="yes (im-web only)"
fi

echo
echo "================ SUMMARY ================"
ls -l "$DEST"
echo "variables: $(cut -d= -f1 "$DEST" | tr '\n' ' ')"
echo "convex url sha256 (compare with the deploy log): $(grep '^NEXT_PUBLIC_CONVEX_URL=' "$DEST" | cut -d= -f2- | sed 's#/$##' | tr -d '\n' | sha256sum | cut -c1-12)"
echo "upload removed: $([[ ! -e $SRC ]] && echo yes || echo NO)"
echo "im-web restarted: $RESTARTED"
echo "========================================="
