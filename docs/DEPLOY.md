# Passe Culinaire production deployment

The website runs in Render's existing **Passe Culinaire / Production** environment in Singapore. This is the only website environment. The previous Ubuntu and Caddy procedure is preserved in [DEPLOY-VPS.md](DEPLOY-VPS.md) as historical rehearsal evidence; it is not the current release procedure.

| Resource | Render ID | Configuration |
| --- | --- | --- |
| Web service `cc-passe-culinaire` | `srv-db6a4kbbc2fs73bcsr80` | Node Starter, one instance, `/api/health` |
| Database `Passe Culinaire DB - PROD` | `dpg-db69mc8473hc73dmb5eg-a` | PostgreSQL 16, Basic 256 MB, Singapore |
| Media disk | Attached to the web service | 1 GB at `/opt/render/project/src/media` |

The temporary site URL is <https://cc-passe-culinaire.onrender.com>. GoDaddy DNS still points elsewhere. The service currently deploys the `release/render` branch with automatic deploys off while the draft PR and launch gates are reviewed. The release branch is not a second Render environment.

## Release and settings

1. Review the release PR and its integration, browser and performance checks. Never run `pnpm test` with the production database URI; the test setup resets its own schema.
2. In the web service Settings, keep the build command `pnpm install --frozen-lockfile && pnpm build`, pre-deploy command `pnpm migrate`, start command `env RUN_JOBS=true pnpm start`, and health path `/api/health`. `.node-version` pins Node 22.22.3. The service environment has `RUN_JOBS=false`, so only the running web instance starts Payload's ten-second job worker. Do not add a second scheduler.
3. Keep `DATABASE_URI` on this database's **internal** Render connection string. Required private settings are `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, `MAIL_FROM_ADDRESS`, and `CONTACT_TO_ADDRESS`. The media settings are `MEDIA_STORAGE=local` and `MEDIA_DIR=/opt/render/project/src/media`; `TRUST_PROXY=render`. The initial notification recipient is Rob only. Keep secrets in Render, not Git. The vetted database snapshot already contains the two admin accounts; do not run `pnpm seed` on this database.
4. Trigger a reviewed deployment with `render deploys create srv-db6a4kbbc2fs73bcsr80 --confirm --output json`, then inspect `render deploys list srv-db6a4kbbc2fs73bcsr80 --output json` and `render logs --resources srv-db6a4kbbc2fs73bcsr80 --limit 100 --output text`. Confirm a successful build, migration and live status. A disk-backed deploy briefly stops the previous instance before the replacement starts.
5. Check the temporary URL: health, Home, Services, Training, CulinAIre Kitchen, Journal, About, Contact, founder photos, film, admin login, media, robots, sitemap, feeds and LLM exports. Send at most one clearly labelled contact test to Rob during a release check; remove or mark it handled in the CMS after verification. Confirm both database delivery status and inbox receipt.

As observed on 12 October 2026, Render CLI v2.20.0 accepted `services update` command flags without changing the nested build/start settings. Verify the stored values after any CLI update; use the service Settings page if they remain unchanged. Its deployment logs confirmed Node 22.22.3 from `.node-version` during the real build.

## Media, backups and recovery

Media writes belong on the attached disk. Files under other runtime paths are ephemeral. The disk is unavailable during build and pre-deploy, so never put media migration in those commands. Use the service's SSH address and SFTP/SCP for a private transfer; verify Render Singapore's published SSH host fingerprint first. A 135-file media archive was transferred and checksum-checked on 12 October 2026. The temporary archive was removed after extraction.

Render provides point-in-time recovery for paid Postgres and daily snapshots for the disk. Database recovery creates a **new** instance; verify its content before changing `DATABASE_URI` and redeploying. Disk snapshots restore the whole disk and discard later writes. These two recovery points are separate, so compare database media records with recovered files before reopening uploads. See [Render Postgres recovery](https://render.com/docs/postgresql-backups) and [disk snapshots](https://render.com/docs/disks). Download separate logical database and media exports to a private off-platform location for longer retention; that destination and a paired restore rehearsal still need to be arranged. Never restore a dump over the live populated database.

For a bad code deployment, use Render's deploy history to redeploy the prior known-good commit only after checking migration compatibility. Check `/api/health`, HTML and media before considering recovery complete. Do not automatically reverse a database migration or overwrite newer content. For a database or disk incident, preserve the current resources, create recovery targets and validate them in isolation first.

## Domain cutover

Do not change GoDaddy DNS until the Render URL passes launch checks, including the ten-genuine-link `llms.txt` gate and contact inbox receipt. Capture the full DNS zone first, especially MX, SPF, DKIM and DMARC. Add `passeculinaire.com` to this Render web service. When ready, change only the web records: root `@` A to Render's documented `216.24.57.1` and `www` CNAME to `cc-passe-culinaire.onrender.com`; remove conflicting web A/AAAA/forwarding records after reviewing them. Preserve email and Resend records. Verify the domain and TLS in Render. Then change `NEXT_PUBLIC_SERVER_URL` to `https://passeculinaire.com`, rebuild and recheck canonical URLs, sitemap, forms and images. See [Render custom domains](https://render.com/docs/custom-domains) and [DNS configuration](https://render.com/docs/configure-other-dns).
