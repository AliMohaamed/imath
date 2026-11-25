#!/usr/bin/env bash
# Step 2: let iMath's GitHub Actions log in as the EXISTING `deploy` user, and create iMath's directories.
# - Appends the imath CI public key to deploy's authorized_keys (existing keys, e.g. techworld's, are kept).
# - Creates /home/deploy/imath/{releases,env,logs,cache}.
# Does not create users, install Node/PM2, or touch techworld/edusuite. Idempotent.
# Usage: sudo bash step2-deploy-key.sh /tmp/imath_deploy.pub
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
if grep -q $'\r' "$0"; then echo "Script has Windows (CRLF) line endings; run: sed -i 's/\r\$//' $0" >&2; exit 1; fi
PUBKEY_FILE="$(realpath "${1:-/nonexistent}" 2>/dev/null || true)"
[[ -n "$PUBKEY_FILE" && -s "$PUBKEY_FILE" ]] || { echo "Usage: sudo bash $0 /path/to/imath_deploy.pub" >&2; exit 1; }
cd /

DEPLOY_USER=deploy
HOME_DIR=/home/$DEPLOY_USER
APP=$HOME_DIR/imath
AK=$HOME_DIR/.ssh/authorized_keys
id "$DEPLOY_USER" &>/dev/null || { echo "User $DEPLOY_USER missing (it comes from the techworld setup). Stop." >&2; exit 1; }
[[ -x $HOME_DIR/node/bin/node && -x $HOME_DIR/node/bin/pm2 ]] || { echo "deploy's Node/PM2 missing. Stop." >&2; exit 1; }

PUBKEY="$(head -n1 "$PUBKEY_FILE" | tr -d '\r')"
[[ "$PUBKEY" == ssh-ed25519\ * ]] || { echo "Not an ed25519 public key (did you upload the .pub file?)." >&2; exit 1; }
FP="$(ssh-keygen -l -f <(echo "$PUBKEY") | awk '{print $2}')"

echo "==> 1. authorized_keys (append only)"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$HOME_DIR/.ssh"
touch "$AK"
BEFORE="$(wc -l < "$AK")"
if grep -qxF "$PUBKEY" "$AK"; then echo "   key already present"; else
  cp -a "$AK" "/root/deploy-authorized_keys.bak.$(date +%Y%m%d%H%M%S)"
  [[ -s "$AK" && -n "$(tail -c1 "$AK")" ]] && echo >> "$AK"   # make sure we start on a new line
  echo "$PUBKEY" >> "$AK"
  echo "   added"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "$AK"; chmod 600 "$AK"

echo "==> 2. app directories"
sudo -u "$DEPLOY_USER" mkdir -p "$APP/releases" "$APP/env" "$APP/logs" "$APP/cache"
chmod 700 "$APP/env"

echo "==> 3. removing the uploaded .pub"
rm -f "$PUBKEY_FILE"

echo
echo "================ SUMMARY ================"
echo "imath key fingerprint: $FP   (compare with the one printed on your PC)"
echo "authorized_keys lines: $BEFORE -> $(wc -l < "$AK")  (previous keys kept)"
echo "keys present:"; ssh-keygen -l -f "$AK" | awk '{print "   "$2"  "$3}'
echo "dirs:"; ls -ld "$APP" "$APP"/*
echo "password login: $(passwd -S "$DEPLOY_USER" | awk '{print ($2=="L"||$2=="NP")?"disabled (OK)":"ENABLED (BAD)"}')"
echo "========================================="
