# Passe Culinaire: Render launch checklist

Status checked 12 October 2026. This is a launch plan, not a record of a live deployment. The intended public address is `https://passeculinaire.com`; GoDaddy holds the domain. Keep DNS pointed at the current destination until the Render service passes the checks below.

## Already confirmed

- [x] The **Passe Culinaire** Render project exists (confirmed by Rob). A [Render project](https://render.com/docs/projects) groups resources; the web service and database still need to be confirmed or created inside its production environment.
- [x] Render MCP is installed in Codex and OAuth sign-in completed.
- [x] The private [GitHub repository](https://github.com/robertangeles/codex-passe-culinaire) is linked as this checkout's `origin`. GitHub access is confirmed.
- [x] One Resend notification reached Rob's inbox from the local contact workflow. Keep Alex off the notification list for now.
- [x] The app has a `/api/health` database check, committed migrations, and a Payload seed script.

## 1. Release the source

- [x] Review and commit the approved site changes and both founder portraits. The release commit is `e9349ba`; local tool files and design studies remain outside the release.
- [x] Reconcile the unrelated Git histories. Merge commit `6d0c561` preserves GitHub's initial commit and the application's history, retaining the project's full README.
- [ ] Push `release/render` to GitHub, review it in a draft pull request, then connect the intended branch to Render. [Render can build from a linked Git provider](https://render.com/docs/web-services).
- [x] Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` against the project's separate test database before the release. All four passed on 12 October 2026; 63 test files and 359 tests passed. Never run `pnpm test` against production; its setup resets the test schema.
- [ ] Pin Node 22 for Render (for example, `NODE_VERSION=22.22.3`); the current `package.json` range has no upper bound, so Render can select a newer major version. [Render Node version rules](https://render.com/docs/node-version).

## 2. Set up Render resources

- [ ] Create or confirm a **Node web service** and **Render Postgres** in the project's production environment, in the same region. This is a server-rendered Next/Payload application, not a static site. Set the health check path to `/api/health`. The service must listen on Render's `PORT` and `0.0.0.0`. [Web service setup](https://render.com/docs/web-services).
- [ ] Choose production compute and database plans before accepting recurring charges. Free web services sleep when idle, and Free Postgres expires after 30 days and has no backups; these are unsuitable for the live company site. [Free plan limits](https://render.com/docs/free).
- [ ] Choose persistent media storage. The app supports `MEDIA_STORAGE=s3` and `MEDIA_STORAGE=local`. Prefer the existing S3 integration if a public HTTPS media URL and private bucket credentials are ready. Otherwise attach a paid persistent disk and set `MEDIA_DIR` to its mount path. Without either, Payload uploads vanish on a restart or deploy. A disk prevents zero-downtime deploys and single-service horizontal scaling. [Render disk behaviour](https://render.com/docs/disks).
- [ ] Use `pnpm install --frozen-lockfile && pnpm build` as the build command and `pnpm start` as the start command, after a clean Render build rehearsal. Set `NODE_VERSION` and all build-time environment values before that rehearsal. [Render build/start stages](https://render.com/docs/deploys).

## 3. Adapt the VPS-specific code and operating plan

- [ ] Make the first-run seed work from Render environment variables without requiring a local `.env` file. `scripts/seed.ts` currently calls `process.loadEnvFile('.env')`, while `.env` is Git-ignored.
- [ ] Rework the contact rate-limit peer IP for Render's proxy. It currently trusts a header written by Caddy; on Render, missing that header makes all visitors share one five-enquiries-per-hour limit. Verify Render's forwarded-header behaviour before trusting a replacement. [Render's client-IP guidance](https://render.com/articles/how-render-handles-ddos-attacks).
- [ ] Decide how publication jobs run every ten seconds or otherwise prove the required **under-60-second** content freshness on Render. The current systemd timer belongs to the VPS design. Render cron jobs use minute-based schedules; a one-minute tick may exceed this app's freshness gate. Keep exactly one active scheduler and test publication/unpublication. [Render cron jobs](https://render.com/docs/cronjobs).
- [ ] Rehearse migration/seed/build ordering against a clean Render database. Use committed migrations (`push: false`); do not assume a fresh database has tables during `next build`. A paid web service can run `pnpm migrate` in a pre-deploy command. Seed once on initial setup, not on every deploy. [Pre-deploy commands](https://render.com/docs/deploys).
- [ ] Replace VPS-only backup, Caddy, systemd and readiness steps in `docs/DEPLOY.md` with a Render runbook before launch. Arrange database and media restore tests, monitoring and rollback. [Render Postgres backups](https://render.com/docs/postgresql-backups).

## 4. Enter private production settings in Render

- [ ] Set `DATABASE_URI` to the Render Postgres **internal** connection string, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`, and `NEXT_PUBLIC_SERVER_URL=https://passeculinaire.com`. Generate production secrets separately from local `.env`. [Internal database connections](https://render.com/tutorials/postgres-on-render/connection-strings).
- [ ] Set the initial Rob and Alex admin emails/passwords for the one-time seed. Do not commit these values.
- [ ] Set `MAIL_PROVIDER=resend`, a production `RESEND_API_KEY`, the verified `MAIL_FROM_ADDRESS`, and `CONTACT_TO_ADDRESS` with **Rob's address only** for the first live test. The local `.env` does not automatically configure Render. Add Alex only when requested.
- [ ] Set the selected media variables. For S3: `MEDIA_STORAGE=s3`, bucket, region, access credentials and crawler-accessible HTTPS `S3_PUBLIC_BASE_URL`. For disk: `MEDIA_STORAGE=local` and absolute `MEDIA_DIR` at the disk mount.
- [ ] Set the final proxy/jobs values only after their Render adaptations are tested. Do not copy the VPS `TRUST_PROXY=true` or systemd settings blindly. [Render environment variables](https://render.com/docs/configure-environment-variables).

## 5. Bring up and inspect the Render URL first

- [ ] Run migrations, seed the clean database once, and transfer the approved **published** Home, About, Services, CulinAIre Kitchen and Contact content plus all required media. The current local database contains design updates beyond the baseline seed. Do not migrate local test submissions or publish draft services, events or journal fixtures.
- [ ] Check `/api/health`, the homepage, navigation, founder photos, film, product, Services, About, Contact, admin sign-in, sitemap, robots, feeds and public media at the temporary `onrender.com` URL.
- [ ] Send **one** labelled contact test to Rob and confirm both the Payload delivery status and inbox receipt. Do not send Alex test mail yet.
- [ ] Verify a publish/unpublish reaches HTML and dependent exports within 60 seconds; check backups/restore and the agreed performance/accessibility gates. Resolve the documented ten-link LLM index content gate before public launch.

## 6. Move the GoDaddy domain only after the service is ready

- [ ] Confirm `passeculinaire.com` uses GoDaddy nameservers. If it uses another DNS host, edit records there instead. Export or capture the existing DNS zone, especially email MX, SPF, DKIM and DMARC records. [GoDaddy DNS management](https://www.godaddy.com/en-uk/help/manage-dns-records-680).
- [ ] Add `passeculinaire.com` as the custom domain on the **Render web service**; Render also adds `www` and redirects it to the root. [Render custom domains](https://render.com/docs/custom-domains).
- [ ] At the active DNS host, point the root `@` A record to Render's documented `216.24.57.1`, and `www` CNAME to this service's actual `*.onrender.com` hostname. Remove conflicting web A/AAAA/forwarding records only after checking what they currently serve. Keep mail and Resend verification records. [Render DNS records](https://render.com/docs/configure-other-dns).
- [ ] Verify the domain in Render, allow TLS issuance, and confirm HTTPS, the `www` redirect, the contact form, public images, sitemap and canonical URLs from outside the development machine. Render manages the certificate. [Custom-domain verification](https://render.com/docs/custom-domains).

**First next step:** push `release/render`, review the draft pull request, and settle the database/media choice and VPS-specific adaptations before connecting the production service or changing DNS.
