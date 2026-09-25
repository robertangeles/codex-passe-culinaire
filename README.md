# Passe Culinaire

The public website and Payload admin use Node 22.12 or newer, pnpm 11.1.3 and native PostgreSQL 16. Copy `.env.example` to a private `.env`, create separate application and test databases, and replace the example credentials and signing values. The test database must be named `passe_culinaire_test` on localhost because `pnpm test` resets its public schema. Never point `TEST_DATABASE_URI` at the application database.

```sh
pnpm install --frozen-lockfile
pnpm migrate
pnpm seed
pnpm dev
```

Open `/` for the public shell and `/admin` for Payload. The seed creates two admins from private environment credentials, 12 labelled image placeholders, four published company pages, and draft services, training entries and journal posts. It preserves existing records and non-empty globals on repeat. The placeholders and draft offerings are editorial starting points, not production claims. Replace or confirm them before publishing. The ten eligible curated `llms.txt` links remain a production content gate.

Changes to Payload fields require a committed migration. Run `pnpm migrate:create <name>` after a schema change, inspect the generated SQL, and run `pnpm migrate` before starting the changed app. Database push mode is disabled. `pnpm test` migrates and seeds only the separate local test database, uses `.local/test-media`, and leaves the application database intact. It requires `psql` in `PATH` and the test database to exist.

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm start
```

Uploads use local `MEDIA_DIR` by default. S3 mode requires bucket, region and a crawler-accessible HTTPS `S3_PUBLIC_BASE_URL`; endpoint and credentials are optional for compatible private configurations. Images accept JPEG, PNG, WebP and AVIF up to 10 MB. Payload and Sharp create AVIF and WebP renditions at 480, 960, 1440 and 2400 pixels; small images are enlarged to produce all eight sizes. Payload normalises orientation; inspect alpha and focal positioning when replacing placeholders. Public files are served at `/media/`, outside the `/api` robots disallow.

Contact submissions are saved before delivery. Set `CONTACT_TO_ADDRESS` and either SMTP variables or `MAIL_PROVIDER=resend` with `RESEND_API_KEY` to enable notification. With no provider, the saved submission is marked failed for manual handling; no message is sent to a console adapter. `REVALIDATE_SECRET` and `NEXT_PUBLIC_SERVER_URL` configure the publication task. The recommended ten-second systemd timer calls the authenticated jobs endpoint using `CRON_SECRET`; keep `RUN_JOBS=false` to avoid a second scheduler. Publication and dependent outputs invalidate after commit without a rebuild. See [editorial operation](docs/EDITORIAL.md), [quality checks and approved performance exceptions](docs/QUALITY.md), and [deployment, backups and recovery](docs/DEPLOY.md). `/api/health` provides a bounded, no-store database check.

The bundled Fraunces, Inter and JetBrains Mono files come from `@fontsource-variable/*` version 5.3.0. Their Open Font Licences are retained in `src/fonts`. Fonts load from the app itself through `next/font/local`.
