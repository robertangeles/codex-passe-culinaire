# Passe Culinaire

Phase 1 establishes the public shell and embedded Payload admin. Content collections and seed data follow in Phase 2.

Use Node 22.12 or newer, pnpm 11.1.3, and a native PostgreSQL 16 server. Create a local application database and a database user with schema creation rights. Copy `.env.example` to `.env`, then set `DATABASE_URI` and a unique `PAYLOAD_SECRET`. Keep `.env` private. The database URL can point at a separate database for integration tests.

```sh
pnpm install --frozen-lockfile
pnpm migrate
pnpm dev
```

Open `http://localhost:3000/` for the public shell and `http://localhost:3000/admin` for Payload. The local admin can bootstrap its first user through Payload's setup screen. In production, provision credentials privately. Database push mode is disabled, so run `pnpm migrate:create <name>` when changing the schema, commit the generated migration, and run `pnpm migrate` before starting the changed app.

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm start
```

The bundled Fraunces, Inter and JetBrains Mono files come from `@fontsource-variable/*` version 5.3.0. Their Open Font Licences are retained in `src/fonts`. Fonts load from the app itself through `next/font/local`.
