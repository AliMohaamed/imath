#!/usr/bin/env bash
# Step 1 (READ-ONLY): check the VPS is ready for iMath. Changes nothing.
# Usage: sudo bash step1-check.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "Run with sudo." >&2; exit 1; }
if grep -q $'\r' "$0"; then echo "Script has Windows (CRLF) line endings; run: sed -i 's/\r\$//' $0" >&2; exit 1; fi
cd /

DEPLOY_USER=deploy
HOME_DIR=/home/$DEPLOY_USER
NODE_DIR=$HOME_DIR/node
PM2=$NODE_DIR/bin/pm2
PORT=3300
WARN=0
warn() { echo "   WARNING: $*"; WARN=1; }
as_deploy() { sudo -u "$DEPLOY_USER" -H env PATH="$NODE_DIR/bin:/usr/bin:/bin" "$@"; }
probe() { curl -sk -o /dev/null -w '%{http_code}' --max-time 10 --resolve "$1:443:127.0.0.1" "https://$1/" || true; }

echo "==> system"
ARCH="$(uname -m)"
echo "   arch: $ARCH"; [[ "$ARCH" == x86_64 ]] || warn "not x86_64: the CI build (linux-x64 sharp/Node) would not run here"
echo "   os:   $(. /etc/os-release && echo "$PRETTY_NAME")"
free -m | awk 'NR==2{printf "   RAM:  %s MB total, %s MB available\n",$2,$7; if ($7<700) print "   WARNING: under 700 MB available"}'
df -h /home | awk 'NR==2{printf "   disk /home: %s free of %s\n",$4,$2}'
echo "   public IPv4 (source address): $(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<NF;i++) if($i=="src"){print $(i+1); exit}}')"

echo "==> port $PORT"
echo "   Node resolves localhost to: $("$NODE_DIR/bin/node" -e "require('dns').lookup('localhost',(e,a)=>console.log(e?'ERROR':a))" 2>/dev/null || echo '(node missing)')  (want 127.0.0.1 or ::1)"
if ss -ltnH "sport = :$PORT" | grep -q .; then warn "port $PORT is already in use:"; ss -ltnp "sport = :$PORT"; else echo "   free (OK)"; fi

echo "==> deploy user"
if id "$DEPLOY_USER" &>/dev/null; then
  echo "   $(id "$DEPLOY_USER")"
  [[ -x "$NODE_DIR/bin/node" ]] && echo "   node: $("$NODE_DIR/bin/node" -v)" || warn "no Node in $NODE_DIR"
  [[ -x "$PM2" ]] && echo "   pm2:  $(as_deploy "$PM2" -v)" || warn "no PM2 at $PM2"
  echo "   pm2 service: $(systemctl is-enabled pm2-deploy 2>/dev/null || true) / $(systemctl is-active pm2-deploy 2>/dev/null || true)"
  echo "   deploy's PM2 apps:"; as_deploy "$PM2" jlist 2>/dev/null | "$NODE_DIR/bin/node" -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const a of JSON.parse(s||"[]"))console.log("     "+a.name+"  "+a.pm2_env.status+"  pid "+a.pid)})' || warn "could not list deploy's PM2"
  echo "   authorized_keys lines: $(wc -l < "$HOME_DIR/.ssh/authorized_keys" 2>/dev/null || echo 0)"
  [[ -e "$HOME_DIR/imath" ]] && echo "   $HOME_DIR/imath exists already" || echo "   $HOME_DIR/imath not created yet (step2 does it)"
else
  warn "user $DEPLOY_USER does not exist (expected from the techworld setup)"
fi

echo "==> nginx"
echo "   $(nginx -v 2>&1)"
nginx -t >/dev/null 2>&1 && echo "   nginx -t: OK" || warn "nginx -t fails BEFORE any change"
HITS="$(grep -rlE 'imathmental' /etc/nginx 2>/dev/null || true)"
[[ -z "$HITS" ]] && echo "   no existing config mentions imathmental (OK)" || { warn "existing config mentions imathmental:"; echo "$HITS"; }
nginx -V 2>&1 | grep -q -- '--without-http_geo_module' && warn "geo module missing" || echo "   geo/map/realip modules: available"
nginx -V 2>&1 | grep -q -- 'http_realip_module' || warn "realip module not listed in nginx -V"
echo "   enabled sites:"; ls -1 /etc/nginx/sites-enabled/ | sed 's/^/     /'
echo "   certs in /etc/ssl/cloudflare:"; ls -1 /etc/ssl/cloudflare/ 2>/dev/null | sed 's/^/     /' || true

echo
echo "================ SUMMARY ================"
for h in edusuite.software api.edusuite.software www.techworldegypt.com admin.techworldegypt.com www.imathmental.com; do
  printf '  %-28s %s\n' "$h" "$(probe "$h")"
done
echo "  (www.imathmental.com is expected to fail/000 or hit the default site until step4)"
[[ $WARN -eq 0 ]] && echo "RESULT: ready, no warnings" || echo "RESULT: see WARNINGS above, send me the output"
echo "nothing was changed"
echo "========================================="
