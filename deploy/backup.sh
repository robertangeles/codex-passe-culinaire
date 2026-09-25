#!/bin/bash
set -euo pipefail
# Called by root systemd service, with configuration from /etc/passe-culinaire.env.
app_active=false
timer_active=false
systemctl is-active --quiet passe-culinaire.service && app_active=true
systemctl is-active --quiet passe-culinaire-jobs.timer && timer_active=true
restore_services() {
  if "$app_active"; then systemctl start passe-culinaire.service; fi
  if "$timer_active"; then systemctl start passe-culinaire-jobs.timer; fi
}
trap restore_services EXIT
trap 'exit 1' INT TERM
systemctl stop passe-culinaire-jobs.timer passe-culinaire-jobs.service passe-culinaire.service
export BACKUP_WRITES_PAUSED=true
cd /srv/passe-culinaire/current
runuser -u passe -- /srv/passe-culinaire/node/bin/node scripts/backup.mjs
