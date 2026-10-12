# Passe Culinaire: Render launch checklist

Status checked 12 October 2026. This is a launch plan, not a record of a live deployment. The intended public address is `https://passeculinaire.com`; GoDaddy holds the domain. Keep DNS pointed at the current destination until the Render service passes the checks below.

## Already confirmed

- [x] The **Passe Culinaire** Render project exists (confirmed by Rob). A [Render project](https://render.com/docs/projects) groups resources; the web service and database still need to be confirmed or created inside its production environment.
- [x] Render CLI access is confirmed. The existing **Passe Culinaire / Production** environment holds `cc-culinaire-kitchen` and `Culinaire Kitchen DB - DEV` / `Culinaire Kitchen DB - PROD`. The website will follow the same naming pattern: `cc-passe-culinaire` and `Passe Culinaire DB - PROD` in this environment. Do not create another project or environment; leave CulinAIre resources untouched.
- [x] Render MCP is installed in Codex and OAuth sign-in completed.
- [x] The private [GitHub repository](https://github.com/robertangeles/codex-passe-culinaire) is linked as this checkout's `origin`. GitHub access is confirmed.
- [x] One Resend notification reached Rob's inbox from the local contact workflow. Keep Alex off the notification list for now.
- [x] The app has a `/api/health` database check, committed migrations, and a Payload seed script.

## 1. Release the source

- [x] Review and commit the approved site changes and both founder portraits. The release commit is `e9349ba`; local tool files and design studies remain outside the release.
- [x] Reconcile the unrelated Git histories. Merge commit `6d0c561` preserves GitHub's initial commit and the application's history, retaining the project's full README.
- [x] Push `release/render` to GitHub and open [draft pull request #1](https://github.com/robertangeles/codex-passe-culinaire/pull/1) against `main`.
- [ ] Review the draft pull request and its CI gates, then connect the intended Git branch to Render. [Render can build from a linked Git provider](https://render.com/docs/web-services).
- [x] Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` against the project's separate test database before the release. All four passed on 12 October 2026; 63 test files and 360 tests passed. Never run `pnpm test` against production; its setup resets the test schema.
- [x] The latest GitHub run for commit `4727aa1` passed integration, browser and mobile performance at the unchanged 95 category threshold; all 21 Lighthouse measurements also passed locally on 12 October. Three earlier GitHub performance attempts fell below 95 on different pages (About, CulinAIre Kitchen, then Services and Journal). Watch this runner variability on subsequent release checks.
- [x] Pin Node 22 for Render with `.node-version` (`22.22.3`) and an upper bound in `package.json`. Do not override it with a different `NODE_VERSION` service setting. [Render Node version rules](https://render.com/docs/node-version).

## 2. Set up Render resources

- [x] Confirm Render management access in the active session through the Render CLI.
- [x] Create `Passe Culinaire DB - PROD` (PostgreSQL 16, Basic 256 MB, 1 GB database storage) in the existing **Passe Culinaire / Production** environment, in Singapore. Its ID is `dpg-db69mc8473hc73dmb5eg-a`. The user approved the Starter web service, Basic database and separate 1 GB media disk at approximately $13.25/month on 12 October 2026.
- [ ] Create `cc-passe-culinaire` (Node, Starter) in the same environment. This is a server-rendered Next/Payload application, not a static site. Set the health check path to `/api/health`. The service must listen on Render's `PORT` and `0.0.0.0`. Render rejected the valid private GitHub repository URL because its GitHub App cannot fetch the repository yet; grant that repository access before retrying. [Web service setup](https://render.com/docs/web-services), [private repository access](https://render.com/docs/git-provider).
- [ ] Attach a 1 GB persistent disk for website media after approval of the recurring charge. No S3 bucket is configured for this site and Render Objects is unavailable in this workspace. Set `MEDIA_DIR` to the disk mount path. Without persistent storage, Payload uploads vanish on a restart or deploy. A disk is available only at runtime, so media transfer cannot run in a build or pre-deploy command; it also prevents zero-downtime deploys and single-service horizontal scaling. [Render disk behaviour](https://render.com/docs/disks).
- [ ] Use `pnpm install --frozen-lockfile && pnpm build` as the build command and `env RUN_JOBS=true pnpm start` as the start command on a paid single-instance web service, after a clean Render build rehearsal. Keep `RUN_JOBS=false` in the service environment so build and pre-deploy commands do not start the worker. [Render build/start stages](https://render.com/docs/deploys).

## 3. Adapt the VPS-specific code and operating plan

- [x] Make the first-run seed work from Render environment variables without requiring a local `.env` file.
- [x] Support Render's edge-written `CF-Connecting-IP` header for the contact rate limit when `TRUST_PROXY=render`. Continue to use the Caddy-written header only for `TRUST_PROXY=true`; never use a client-supplied `X-Forwarded-For` value. [Render's client-IP guidance](https://render.com/articles/host-pocketbase-on-render).
- [ ] On a paid, single-instance web service, enable the existing ten-second Payload `autoRun` only in the start command. Do not also configure Render cron or the VPS systemd timer. Verify scheduled publish/unpublish and dependent HTML/exports within **60 seconds** at the Render URL. [Payload job runner guidance](https://payloadcms.com/docs/jobs-queue/schedules).
- [x] Rehearse first-run ordering locally. `pnpm build` against an empty PostgreSQL schema failed because the `footer` table did not exist; all committed migrations then applied to a separate empty rehearsal database, and `pnpm build` succeeded before seeding. On Render, restore the vetted database snapshot **before** the first web build; it contains the committed migration history and approved content. Retain `pnpm migrate` in the paid web service's pre-deploy command for subsequent releases. Do not use schema push mode. [Pre-deploy commands](https://render.com/docs/deploys).
- [ ] Replace VPS-only backup, Caddy, systemd and readiness steps in `docs/DEPLOY.md` with a Render runbook before launch. Arrange database and media restore tests, monitoring and rollback. [Render Postgres backups](https://render.com/docs/postgresql-backups).

## 4. Enter private production settings in Render

- [ ] Set `DATABASE_URI` to the Render Postgres **internal** connection string, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`, and `NEXT_PUBLIC_SERVER_URL` to the temporary Render URL for the first QA pass. Change the public origin to `https://passeculinaire.com` and rebuild at domain cutover. Generate production secrets separately from local `.env`. [Internal database connections](https://render.com/tutorials/postgres-on-render/connection-strings).
- [ ] Verify both restored admin accounts can sign in. The vetted snapshot already contains the accounts; do not run the one-time seed or store admin passwords in Render settings.
- [ ] Set `MAIL_PROVIDER=resend`, a production `RESEND_API_KEY`, the verified `MAIL_FROM_ADDRESS`, and `CONTACT_TO_ADDRESS` with **Rob's address only** for the first live test. The local `.env` does not automatically configure Render. Add Alex only when requested.
- [ ] Set the selected media variables. For S3: `MEDIA_STORAGE=s3`, bucket, region, access credentials and crawler-accessible HTTPS `S3_PUBLIC_BASE_URL`. For disk: `MEDIA_STORAGE=local` and absolute `MEDIA_DIR` at the disk mount.
- [ ] Set `TRUST_PROXY=render` and `RUN_JOBS=false` in the Render environment, with `RUN_JOBS=true` only in the web start command, then verify both live. Do not copy the VPS `TRUST_PROXY=true` or systemd settings. [Render environment variables](https://render.com/docs/configure-environment-variables).

## 5. Bring up and inspect the Render URL first

- [x] Rehearse approved public content in the isolated local test database. After applying the existing guarded design updates and founder portraits, all four page digests, site globals, header, footer, founder public profiles and media filenames matched the approved local site. The rehearsal has no contact submissions or sessions; 37 generated publication jobs were removed from that rehearsal only. This does not transfer data to Render.
- [x] Prepare and rehearse a private PostgreSQL 16 content snapshot and media archive in `.local/render-release/`. The restored snapshot matched all 11 checked content tables: four pages, 15 media records, two users and the existing draft posts, services and events. Eight private/workflow tables restored empty, including the one labelled local test enquiry and five login sessions. All 135 media files referenced by the records exist in the 2.7 MB archive. These private files are ignored by Git and have not been sent to Render.
- [ ] Restore the approved site snapshot to the new **empty** Render Postgres database before its first web build, then transfer the media archive to the attached disk after the service starts. The snapshot already includes migrations, accounts and approved published content; do not run `pnpm seed` over it. Do not publish draft services, events or journal fixtures. Refresh and recheck the snapshot if local content changes before transfer. The guarded local design-update scripts must not run on Render.
- [ ] Restore through the web service's private-network connection if this machine's direct external PostgreSQL connection remains unavailable. Direct `psql` and Render CLI `psql` both closed during SSL setup, even with a temporary single-host IP rule. That rule was removed; the database's external allow list is empty. Never broaden it to the whole internet. A bootstrap service can expose an SSH tunnel to the internal database before its first real Next build. [Render SSH access](https://render.com/docs/ssh).
- [ ] Check `/api/health`, the homepage, navigation, founder photos, film, product, Services, About, Contact, admin sign-in, sitemap, robots, feeds and public media at the temporary `onrender.com` URL.
- [ ] Send **one** labelled contact test to Rob and confirm both the Payload delivery status and inbox receipt. Do not send Alex test mail yet.
- [ ] Verify a publish/unpublish reaches HTML and dependent exports within 60 seconds; check backups/restore and the agreed performance/accessibility gates. Resolve the documented ten-link LLM index content gate before public launch.

## 6. Move the GoDaddy domain only after the service is ready

- [x] Public DNS currently uses GoDaddy nameservers (`ns19.domaincontrol.com`, `ns20.domaincontrol.com`). The root has A records `3.33.130.190` and `15.197.148.33`; `www` is a CNAME to the root. Google MX records are present. These are observations from 12 October 2026, not a complete zone export.
- [ ] Export or capture the full DNS zone immediately before cutover, especially email MX, SPF, DKIM and DMARC records. [GoDaddy DNS management](https://www.godaddy.com/en-uk/help/manage-dns-records-680).
- [ ] Add `passeculinaire.com` as the custom domain on the **Render web service**; Render also adds `www` and redirects it to the root. [Render custom domains](https://render.com/docs/custom-domains).
- [ ] At the active DNS host, point the root `@` A record to Render's documented `216.24.57.1`, and `www` CNAME to this service's actual `*.onrender.com` hostname. Remove conflicting web A/AAAA/forwarding records only after checking what they currently serve. Keep mail and Resend verification records. [Render DNS records](https://render.com/docs/configure-other-dns).
- [ ] Verify the domain in Render, allow TLS issuance, and confirm HTTPS, the `www` redirect, the contact form, public images, sitemap and canonical URLs from outside the development machine. Render manages the certificate. [Custom-domain verification](https://render.com/docs/custom-domains).

**First next step:** give Render's GitHub App access to the private repository, create `cc-passe-culinaire` in the existing Production environment, attach its approved disk, restore the checked snapshot through the private network, and test the Render URL. Keep GoDaddy DNS unchanged until the Render URL passes launch checks.
