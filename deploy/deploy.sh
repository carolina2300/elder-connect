#!/usr/bin/env bash
#
# ElderCare Connect — deploy script
#
# Builds and deploys the backend jar and/or the frontend build to the VPS.
#
#   ./deploy.sh                  # deploy both (same as --all)
#   ./deploy.sh --all            # deploy both
#   ./deploy.sh --backend        # backend only
#   ./deploy.sh --frontend       # frontend only
#   ./deploy.sh --backend --frontend   # both (flags compose)
#
# Connection config is read from ./deploy.env (gitignored). See deploy.env.example.

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend/eldercare"
FRONTEND_DIR="$REPO_ROOT/frontend"
CONFIG_FILE="$SCRIPT_DIR/deploy.env"

# Remote layout
REMOTE_JAR_DIR="/var/app/eldercare"
REMOTE_JAR="$REMOTE_JAR_DIR/eldercare.jar"
REMOTE_JAR_BAK="$REMOTE_JAR_DIR/eldercare.jar.bak"
REMOTE_WEB_DIR="/var/www/cuidadosenior.pt/html"
SERVICE_NAME="eldercare"
HEALTH_URL="http://localhost:8080/actuator/health"
HEALTH_RETRIES=30          # ~30 * 2s = 60s max wait
HEALTH_SLEEP=2

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------
log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m  ✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m  !\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Arg parsing
# ---------------------------------------------------------------------------
DO_BACKEND=false
DO_FRONTEND=false

for arg in "$@"; do
  case "$arg" in
    --all)       DO_BACKEND=true; DO_FRONTEND=true ;;
    --backend)   DO_BACKEND=true ;;
    --frontend)  DO_FRONTEND=true ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed '1d'
      exit 0 ;;
    *) die "Unknown argument: $arg (use --all, --backend, --frontend, --help)" ;;
  esac
done

# No flags => deploy both
if ! $DO_BACKEND && ! $DO_FRONTEND; then
  DO_BACKEND=true
  DO_FRONTEND=true
fi

# ---------------------------------------------------------------------------
# Config + dependency checks
# ---------------------------------------------------------------------------
[ -f "$CONFIG_FILE" ] || die "Missing $CONFIG_FILE — copy deploy.env.example and fill it in."
# shellcheck disable=SC1090
source "$CONFIG_FILE"

: "${HOST:?HOST not set in deploy.env}"
: "${SSH_USER:?SSH_USER not set in deploy.env}"
: "${SSH_KEY:?SSH_KEY not set in deploy.env}"
: "${SSH_PASSWORD:?SSH_PASSWORD not set in deploy.env}"

SSH_KEY="${SSH_KEY/#\~/$HOME}"   # expand leading ~
[ -f "$SSH_KEY" ] || die "SSH key not found: $SSH_KEY"

command -v sshpass >/dev/null || die "sshpass not installed. macOS: brew install hudochenkov/sshpass/sshpass"
$DO_BACKEND  && { [ -x "$BACKEND_DIR/mvnw" ] || die "mvnw not found/executable in $BACKEND_DIR"; }
$DO_FRONTEND && { command -v npm >/dev/null || die "npm not installed"; }
command -v rsync >/dev/null || die "rsync not installed"

# ---------------------------------------------------------------------------
# SSH / SCP / RSYNC wrappers (key + password auth)
# ---------------------------------------------------------------------------
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=publickey,password)
REMOTE="$SSH_USER@$HOST"

rsh()  { sshpass -p "$SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$REMOTE" "$@"; }
rcp()  { sshpass -p "$SSH_PASSWORD" scp "${SSH_OPTS[@]}" "$@"; }
rsy()  { sshpass -p "$SSH_PASSWORD" rsync -az --delete \
           -e "ssh ${SSH_OPTS[*]}" "$@"; }

# Run a command on the VPS as root, feeding the sudo password on stdin.
rsudo() { rsh "sudo -S -p '' bash -c $(printf '%q' "$*")" <<<"$SSH_PASSWORD"; }

# ---------------------------------------------------------------------------
# Remote staging dir (writable by ubuntu, cleaned on exit)
# ---------------------------------------------------------------------------
REMOTE_STAGE=""
cleanup() {
  [ -n "$REMOTE_STAGE" ] && rsh "rm -rf $(printf '%q' "$REMOTE_STAGE")" 2>/dev/null || true
}
trap cleanup EXIT

setup_stage() {
  [ -n "$REMOTE_STAGE" ] && return
  log "Preparing remote staging dir"
  REMOTE_STAGE="$(rsh 'mktemp -d "$HOME/.eldercare-deploy.XXXXXX"')"
  [ -n "$REMOTE_STAGE" ] || die "Could not create remote staging dir"
  ok "Staging at $REMOTE_STAGE"
}

# ---------------------------------------------------------------------------
# Backend
# ---------------------------------------------------------------------------
deploy_backend() {
  log "Backend: building (mvnw clean package, tests run)"
  ( cd "$BACKEND_DIR" && ./mvnw clean package )

  local jar
  jar="$(ls -1t "$BACKEND_DIR"/target/eldercare-*.jar 2>/dev/null | grep -v -- '-sources\|-javadoc' | head -n1 || true)"
  [ -n "$jar" ] || die "Built jar not found in $BACKEND_DIR/target"
  ok "Built $(basename "$jar")"

  setup_stage
  log "Backend: uploading jar"
  rcp "$jar" "$REMOTE:$REMOTE_STAGE/eldercare.jar"
  ok "Uploaded"

  log "Backend: swapping jar + restarting service"
  rsudo "
    set -e
    mkdir -p $REMOTE_JAR_DIR
    if [ -f $REMOTE_JAR ]; then cp -f $REMOTE_JAR $REMOTE_JAR_BAK; fi
    systemctl stop $SERVICE_NAME || true
    cp -f $REMOTE_STAGE/eldercare.jar $REMOTE_JAR
    systemctl start $SERVICE_NAME
  "
  ok "Service restarted"

  log "Backend: health check ($HEALTH_URL)"
  local i
  for ((i=1; i<=HEALTH_RETRIES; i++)); do
    if rsh "curl -fsS $HEALTH_URL" 2>/dev/null | grep -q '"status":"UP"'; then
      ok "Backend healthy"
      return 0
    fi
    sleep "$HEALTH_SLEEP"
  done

  warn "Backend did NOT become healthy after $((HEALTH_RETRIES*HEALTH_SLEEP))s — rolling back"
  rsudo "
    set -e
    if [ -f $REMOTE_JAR_BAK ]; then
      cp -f $REMOTE_JAR_BAK $REMOTE_JAR
      systemctl restart $SERVICE_NAME
    fi
  "
  die "Backend deploy failed; rolled back to previous jar. Check: journalctl -u $SERVICE_NAME"
}

# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------
deploy_frontend() {
  log "Frontend: building (npm run build)"
  ( cd "$FRONTEND_DIR" && npm run build )
  [ -d "$FRONTEND_DIR/dist" ] || die "Build did not produce $FRONTEND_DIR/dist"
  ok "Built dist/"

  setup_stage
  log "Frontend: uploading build"
  rsh "rm -rf $(printf '%q' "$REMOTE_STAGE/dist") && mkdir -p $(printf '%q' "$REMOTE_STAGE/dist")"
  rsy "$FRONTEND_DIR/dist/" "$REMOTE:$REMOTE_STAGE/dist/"
  ok "Uploaded"

  log "Frontend: replacing web root"
  rsudo "
    set -e
    mkdir -p $REMOTE_WEB_DIR
    rm -rf ${REMOTE_WEB_DIR:?}/*
    cp -r $REMOTE_STAGE/dist/. $REMOTE_WEB_DIR/
  "
  ok "Frontend deployed to $REMOTE_WEB_DIR"
}

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
log "Target: $REMOTE  | backend=$DO_BACKEND frontend=$DO_FRONTEND"
$DO_BACKEND  && deploy_backend
$DO_FRONTEND && deploy_frontend
ok "Done."
