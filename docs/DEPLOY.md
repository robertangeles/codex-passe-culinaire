# Native VPS deployment and recovery

Target: Ubuntu 24.04, Node 22.22.3, pnpm 11.1.3, PostgreSQL 16 and Caddy. One host runs the application, database and local media. Deployment is manual. This runbook has local rehearsal evidence below; it does not claim a live VPS, DNS, publicly trusted certificate or email provider has been configured.

## Before launch

Supply the Git repository/revision, VPS access, domain and DNS access, real founder/product photographs, confirmed public copy, final email provider/recipient and an off-host backup destination. The curated LLM index needs ten genuine published destinations; currently nine exist. Services, events and example journal posts remain drafts. Review placeholder labels and `[TO CONFIRM]` copy before publishing. The user approved the measured JavaScript/LCP exceptions in `QUALITY.md`; other quality requirements remain enforced.

Use a sudo operator account. Keep SSH access open while changing the firewall. Allow TCP 80/443 and the configured SSH port; keep PostgreSQL and Next on loopback. Add domain A records to the VPS IPv4 address and AAAA only if IPv6 actually works. Remove conflicting records. A CDN is optional; initially use DNS-only routing. If later using Cloudflare, turn off its managed “Block AI bots” setting if the intended AI crawlers must access the public site, review robots-related settings, and do not cache HTML/API responses without publication-triggered cache purging. No analytics service is integrated; the Site Settings external-embed flag defaults off.

## Install the host prerequisites

As the sudo operator:

```sh
sudo apt-get update
sudo apt-get install -y git ca-certificates build-essential postgresql-16 postgresql-client-16
sudo systemctl enable --now postgresql
sudo adduser --disabled-password --gecos '' passe
sudo install -d -o passe -g passe -m 0755 /srv/passe-culinaire /srv/passe-culinaire/releases
sudo install -d -o passe -g passe -m 0700 /var/lib/passe-culinaire/media /var/backups/passe-culinaire
sudo -iu passe
```

As `passe`, install nvm from a reviewed tagged checkout, then verify the resolved tools. The pinned Node version is the one used for local verification; review security updates before a later release.

```sh
git clone --branch v0.40.8 --depth 1 https://github.com/nvm-sh/nvm.git .nvm
. .nvm/nvm.sh
nvm install 22.22.3
nvm use 22.22.3
npm install --global pnpm@11.1.3
node --version
pnpm --version
command -v node
ln -s /home/passe/.nvm/versions/node/v22.22.3 /srv/passe-culinaire/node
exit
```

The service uses the explicit `/srv/passe-culinaire/node/bin/node` path, not shell activation. Update that symlink deliberately when upgrading Node and verify the new runtime before restarting. Follow the [nvm installation reference](https://github.com/nvm-sh/nvm#installing-and-updating) for a different account layout.

Install Caddy using its official Debian/Ubuntu package repository. Inspect downloaded repository configuration before installing it. These commands follow [Caddy's package instructions](https://caddyserver.com/docs/install#debian-ubuntu-raspbian).

```sh
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key -o /tmp/caddy-key.asc
sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg /tmp/caddy-key.asc
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt -o /tmp/caddy-stable.list
cat /tmp/caddy-stable.list
sudo install -m 0644 /tmp/caddy-stable.list /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy
sudo systemctl stop caddy
caddy version
```

Local performance verification used Caddy 2.11.4. Verify configuration and repeat the documented quality checks after changing its version. Public domain names enable [automatic HTTPS](https://caddyserver.com/docs/automatic-https); local rehearsal certificates are not production certificates.

## Create separate databases and configuration

As the operator, use the PostgreSQL interactive password command so passwords do not enter shell history. The build account cannot access the production database.

```sh
sudo -u postgres psql
```

```sql
CREATE ROLE passe LOGIN;
\password passe
CREATE DATABASE passe_culinaire OWNER passe;
REVOKE CONNECT ON DATABASE passe_culinaire FROM PUBLIC;
CREATE ROLE passe_build LOGIN;
\password passe_build
CREATE DATABASE passe_culinaire_build OWNER passe_build;
CREATE DATABASE passe_culinaire_test OWNER passe_build;
\q
```

Set strong private values in `/etc/passe-culinaire.env` using `.env.example` as the reference. Make the file root-owned, mode 0600. systemd reads it before switching to the service user. Use simple `KEY=value` entries, quote values containing whitespace, and percent-encode password characters in database URLs. Generate distinct secrets with `openssl rand -hex 32`. Do not print or commit them.

Required production values: `DATABASE_URI` for the `passe` role, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`, HTTPS `NEXT_PUBLIC_SERVER_URL`, both initial admin emails/passwords, `MEDIA_STORAGE=local`, `MEDIA_DIR=/var/lib/passe-culinaire/media`, `PORT=3000`, `TRUST_PROXY=true`, `RUN_JOBS=false`, `BACKUP_DIR=/var/backups/passe-culinaire`, `BACKUP_RETENTION_DAYS=14`, and `RELEASE_ID` set to the revision. Configure SMTP or Resend and `CONTACT_TO_ADDRESS` for delivery. Leave IndexNow blank until a real key is configured. Production does not need `TEST_DATABASE_URI` or quality/build-only variables. Keep embedded `RUN_JOBS` off: the systemd timer is the single worker scheduler.

For administrative migration/seed commands, temporarily grant only `passe` read access through a root-owned group file or use `systemd-run` with the production EnvironmentFile as shown below. Do not copy production secrets into build configuration.

## Build an isolated release

As `passe`, create a new release directory with a checked-out revision. Replace the two values below with the supplied repository and approved commit.

```sh
sudo -iu passe
. .nvm/nvm.sh
REPOSITORY_URL='https://github.com/YOUR-ORG/YOUR-REPOSITORY.git'
RELEASE_ID='APPROVED-COMMIT'
git clone "$REPOSITORY_URL" "/srv/passe-culinaire/releases/$RELEASE_ID"
cd "/srv/passe-culinaire/releases/$RELEASE_ID"
git checkout --detach "$RELEASE_ID"
pnpm install --frozen-lockfile
cp .env.example .env
chmod 600 .env
```

Edit this release's `.env` for the separate `passe_build` role/database and test database, random fixture admin passwords and signing secrets, local release media directory, no mail/IndexNow provider, and `RUN_JOBS=false`. **Set `NEXT_PUBLIC_SERVER_URL` to the real production origin before building** because browser/admin code can embed it. This file contains fixture credentials only. Build-time reads never use the production database.

```sh
pnpm migrate
pnpm seed
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e
pnpm test:performance
```

Quality commands build into `.next-quality` and use the test database; the ordinary production artifact remains `.next`. Use `CADDY_BIN=/usr/bin/caddy` if Caddy is not on this user's PATH. Archive the quality logs. After passing, remove the fixture `.env` from this release, preserving it privately elsewhere only if needed to repeat the build. The server gets its production environment exclusively from systemd. Do not re-run `next build` with production credentials. Next persists generated content, so the service's `ExecStartPost` calls the authenticated broad invalidation endpoint and warms live routes before rollout completes. This uses supported [Next cache invalidation](https://nextjs.org/docs/app/guides/self-hosting), not edits to generated manifests.

## Install services, migrate and start

First installation: as operator, point `current` at the verified release. On updates, follow the backup/maintenance sequence below before switching it.

```sh
sudo ln -s /srv/passe-culinaire/releases/APPROVED-COMMIT /srv/passe-culinaire/current
sudo install -m 0644 /srv/passe-culinaire/current/deploy/systemd/passe-culinaire.* /etc/systemd/system/
sudo install -m 0644 /srv/passe-culinaire/current/deploy/systemd/passe-culinaire-jobs.* /etc/systemd/system/
sudo install -m 0644 /srv/passe-culinaire/current/deploy/systemd/passe-culinaire-backup.* /etc/systemd/system/
sudo systemctl daemon-reload
```

Run migration with the production environment, waiting for its exit status. Only seed the production database on initial setup; repeat seeds preserve existing records but must not become an unattended upgrade step. The seed expects a `.env` file, so create an empty mode-0600 file in the release before running it; existing process environment has priority. Leave that file empty in production.

```sh
sudo -u passe touch /srv/passe-culinaire/current/.env
sudo chmod 600 /srv/passe-culinaire/current/.env
sudo systemd-run --wait --pipe --collect --property=User=passe --property=WorkingDirectory=/srv/passe-culinaire/current --property=EnvironmentFile=/etc/passe-culinaire.env /srv/passe-culinaire/node/bin/node node_modules/payload/bin.js migrate
sudo systemd-run --wait --pipe --collect --property=User=passe --property=WorkingDirectory=/srv/passe-culinaire/current --property=EnvironmentFile=/etc/passe-culinaire.env /srv/passe-culinaire/node/bin/node node_modules/tsx/dist/cli.mjs scripts/seed.ts
```

Stop on any nonzero migration or startup/warm-up exit. Do not enable public traffic or ignore the error. `push:false` remains configured. Seeded placeholders and draft offerings still require editorial review before launch.

Create `/etc/passe-culinaire-caddy.env` (root-owned 0600): `SITE_ADDRESS=YOUR-DOMAIN`, `APP_ROOT=/srv/passe-culinaire/current`, `PORT=3000`, `CADDY_ADMIN=localhost:2019`, `READINESS_DIR=/run/passe-culinaire`. Caddy needs read/traverse access to the release's `public/errors` and `src/fonts`; it never needs the private app environment or media directory. Install the response boundary and service override:

```sh
sudo install -m 0644 /srv/passe-culinaire/current/deploy/Caddyfile /etc/caddy/Caddyfile
sudo mkdir -p /etc/systemd/system/caddy.service.d
sudo install -m 0644 /srv/passe-culinaire/current/deploy/systemd/caddy-override.conf /etc/systemd/system/caddy.service.d/passe.conf
sudo systemctl daemon-reload
sudo systemd-run --wait --pipe --collect --property=EnvironmentFile=/etc/passe-culinaire-caddy.env /usr/bin/caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl enable --now passe-culinaire.service
sudo systemctl enable --now caddy
sudo systemctl status passe-culinaire.service caddy.service --no-pager
sudo systemctl enable --now passe-culinaire-jobs.timer passe-culinaire-backup.timer
```

Caddy remains available while the app is stopped or warming. Its proxy paths require the `/run/passe-culinaire/ready` marker; without it, public pages receive the branded static 503 and API requests receive a short JSON 503. Error CSS and local fonts remain available. systemd removes the marker before starting Next and after stopping it; `warm-release.mjs` creates it only after health, invalidation and live route checks succeed. The service-owned runtime directory is removed on stop. Install the Caddy gate before admitting traffic. Keep its `READINESS_DIR` aligned with the service's `READINESS_FILE`.

Caddy supplies crawler-readable static 404/503 pages, overwrites the trusted client-IP header and preserves private/no-store responses. Never expose Next directly with `TRUST_PROXY=true`. Check `/api/health` returns 200 and only `{"status":"ok"}`; loss of database connectivity returns no-store 503 within the bounded probe deadline. No hostnames, credentials, counts or account data are exposed.

## Daily operation and checks

```sh
sudo systemctl status passe-culinaire.service passe-culinaire-jobs.timer passe-culinaire-backup.timer --no-pager
sudo systemctl list-timers 'passe-culinaire-*' --all
sudo journalctl -u passe-culinaire.service -u passe-culinaire-jobs.service --since '1 hour ago' --no-pager
sudo journalctl -u passe-culinaire-backup.service --since '2 days ago' --no-pager
sudo systemctl show passe-culinaire-backup.service -p Result -p ExecMainStatus
```

The jobs timer runs every ten seconds without an editor browser. A failed HTTP run exits nonzero and remains visible in the journal; inspect Payload's admin job list for retryable/exhausted jobs. Alerting is not connected to an external service: choose an operator/destination and alert on unhealthy HTTP, worker failures, stale successful backups and notification failures before live operation. Check receipt state separately from delivery: an enquiry can be saved while notification failed.

First five minutes: health, home/product/about/journal/contact, uploaded image MIME types, sitemap/children, RSS/JSON Feed, robots and LLM exports. First hour: controlled publication/unpublication reaches HTML and exports within 60 seconds without rebuilding, both admins can sign in, and a real test enquiry reaches the configured recipient or reports failure truthfully. Check logs after a service restart and a controlled host reboot. These VPS/provider checks require the actual target; local tests are not substitutes.

## Nightly backups and restore

The 03:15 Melbourne timer briefly stops the application and publication timer, takes a PostgreSQL custom dump plus a media tar archive, writes SHA-256 checksums and completion/release metadata, then restores the prior service states. All writers must use this app; pause any external database/media writer too. PostgreSQL itself stays running. Request interruption during this maintenance window is expected. A failed dump/archive never produces an accepted completed backup directory. Partial directories after an abrupt host loss are not valid backups.

The backup service runs the wrapper as root only to manage services; dump/archive work runs as `passe`. PostgreSQL 16 tools must be in its PATH. The default retention is 14 days, applied only to recognised completed backup directories after a new success. Choose retention explicitly for production. Local backup and app share a disk failure domain: copy each completed directory to a private, encrypted off-host destination and verify checksums there. Off-host credentials and scheduling are deployment inputs, not configured by this repository.

```sh
sudo systemctl start passe-culinaire-backup.service
sudo systemctl show passe-culinaire-backup.service -p Result -p ExecMainStatus
sudo journalctl -u passe-culinaire-backup.service -n 30 --no-pager
```

A completed manifest proves the files were produced, not that recovery works. Rehearse restoration to a newly created, empty database and new media directory; never aim rehearsal commands at production. With standard libpq `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` set privately and `PGDATABASE` set to that empty database name (not a URL) and `BACKUP` to a trusted completed directory:

```sh
pg_restore --exit-on-error --single-transaction --no-owner --no-acl --dbname="$PGDATABASE" "$BACKUP/database.dump"
mkdir -p "$RESTORED_MEDIA"
tar -xzf "$BACKUP/media.tar.gz" -C "$RESTORED_MEDIA" --no-same-owner
```

Run the restore commands as `passe` into a new directory owned by `passe`, so the application can read the recovered media. Verify every file against `manifest.json` before restoring. Use the matching application revision, point its private environment to the restored database/media, start on a separate loopback port, invalidate/warm the release, and compare known published text and media hashes. Record start/end times, backup timestamp/data age, revision and all exit statuses. Do not automatically down-migrate or overwrite newer production writes. See [PostgreSQL dump/restore guidance](https://www.postgresql.org/docs/16/app-pgdump.html).

## Updating and rollback

1. Build and verify a new isolated release as above. Review migrations for compatibility with the previous app and take an off-host copy of the last successful backup.
2. Stop the jobs timer and app; the readiness gate keeps Caddy serving the static 503 during maintenance. Run a matched backup with writers paused (use the backup service; it preserves the already-stopped state). Record its completed path and previous `current` target.
3. Point `current` to the new verified directory using a temporary symlink plus atomic rename. Update `RELEASE_ID`, run production migrations with `systemd-run --wait` and stop on nonzero exit. Seed only if explicitly needed for a reviewed data change.
4. Start the application; require health, broad invalidation and warm-up success. Inspect key routes against expected live content. The readiness marker opens proxy traffic only after successful warm-up; then start the jobs timer. Repeat the first-five-minute checks.
5. If unhealthy, keep public traffic stopped. If migrations are backward-compatible, switch back to the prior release and verify health/warm-up before admitting traffic. Otherwise restore the verified matching database/media backup into new destinations, point the prior revision at them, and verify before switching. Restoring a snapshot loses subsequent writes: reconcile or explicitly accept them before a production restore. Never run destructive rollback automatically.

A build/backup/migration failure must stop rollout. Shell sequences performing migrations must use `set -e` or explicit status checks; a following successful command must not hide the migration failure. Keep the previous release, database snapshot, media snapshot and private environment until recovery has been tested. Maintenance duration depends on data size; no zero-downtime or numerical recovery promise is made.

## Optional S3 storage switch

Changing `MEDIA_STORAGE` does not copy files. Pause app and workers, back up the database/local media, copy **every original and generated rendition** using the same object keys/filenames, and verify object counts, sizes and sampled/full checksums before changing configuration. Set the bucket, region, optional endpoint/path-style credentials and public HTTPS base URL. Restrict upload credentials; public GET of required objects must work for crawlers. Keep local media until rollback is no longer needed.

Restart, invalidate/warm caches and verify previously uploaded image URLs and every rendition with anonymous GET, correct MIME type and no `/api` dependency. If the chosen storage/CDN changes URLs, update stored references through a reviewed migration or preserve old public routes until references are proven migrated. Roll back the environment and restart if verification fails. The local backup script deliberately refuses S3 mode: provision versioned bucket backups plus matching database snapshots and a provider-specific restore drill before switching. No live S3 copy or provider credentials have been verified here.

## CI and rehearsal evidence

`.github/workflows/quality.yml` runs independent integration, browser and mobile-performance jobs on PRs and main pushes. Ubuntu runners install PostgreSQL 16 natively in a dedicated port-55432 cluster. Random fixture credentials stay in a private runner `.env`; quality reports contain fixture content only and expire after seven days. Actions are pinned to commit IDs. There is no deployment action and no database service container. The existing empty remote configuration means a hosted GitHub Actions run cannot be claimed until a remote is supplied.

Local rehearsal results are recorded in the latest `docs/PLAN.md` checkpoint. Outstanding live checks include system service installation/reboot, DNS/TLS issuance, external email, off-host backup transfer and live S3 migration. Configuration validation and isolated process/restore rehearsals are reported separately from those checks.


Local rehearsal, 26 September 2026: a completed PostgreSQL 16 custom dump and media archive restored to a newly created isolated database and directory. All page identifiers/slugs/titles matched; all 351 media files matched byte for byte. Restore took 714 ms for this small fixture, with backup age 687 ms at completion. This is not a production recovery-time estimate. An intentionally failing SQL migration transaction returned exit 1, rolled back its test table and prevented a subsequent rollout marker. HTTP checks returned health 200/no-store, then 503/no-store in 224 ms from an independent server configured with an unreachable database. Startup invalidation changed cached build HTML to the distinct restored page title; restored media returned 200/image-webp with identical bytes. These checks did not modify the application database.

`actionlint` 1.7.12 accepted the workflow. `systemd-analyze verify` accepted copies of the units with the future deployment Node path substituted by the available local executable; it reported one unrelated pre-existing open-webui unit warning. This validates unit syntax, not service installation or a reboot. The shell wrapper passed `bash -n`. Full evidence is retained locally in `.local/phase7-restore-evidence.json` and `.local/phase7-health-failure.json`.


The final readiness design was rehearsed through real Caddy and Next processes: while the app listened but had no marker, public HTML and API requests returned no-store 503 and error CSS remained 200. Successful warm-up created the marker and opened 200 responses containing restored live content. Removing the marker blocked proxying again; after stopping Next, the branded static 503 and its CSS remained available. Evidence: `.local/phase7-readiness-evidence.json`. Earlier transient-service ordering experiments were superseded by this marker gate so the static fallback is preserved.
