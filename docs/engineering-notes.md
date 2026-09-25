# Implementation evidence

These notes record installed-interface evidence. They do not mark any phase complete.

## Publication transaction boundary

Payload 3.90.2 collections/operations/create.js runs afterChange and afterOperation before commitTransaction (lines 388, 403 and 421). updateByID.js also runs afterOperation before commit (lines 213 and 226). Calling a remote invalidation endpoint directly in these hooks can race the commit.

queues/localAPI.js queue accepts req and passes it to payload.db.create or payload.create (lines 158–172). The same request can therefore persist a publication task in the content transaction. The task becomes visible to another transaction only after commit. Verify this with a real PostgreSQL integration test; source inspection alone is not acceptance.

Use Payload's existing job system for the publication task, rather than inventing a second queue. The task must invalidate paths using committed current state and old/new slugs; it must not write a cached document snapshot from its input. An older task must never restore an older public revision. IndexNow is a separate failure-tolerant side effect.

The worker cadence, retry behavior and cache semantics must together demonstrate the approved 60-second publication requirement. A once-per-minute worker alone leaves no headroom. Keep the required scheduled-publish worker and publication invalidation job coordinated. Runtime verification remains pending.

## Development environment

A private PostgreSQL 16.15 cluster is running under .local/postgres at 127.0.0.1:55432. Existing system PostgreSQL was not modified. The local .env contains random development credentials and has mode 0600. Both paths are ignored.

## Agent roles

Current standalone Codex agent TOML files require name, description and developer_instructions. Project roles are under .codex/agents. The official source is https://learn.chatgpt.com/docs/agent-configuration/subagents. The installed CLI has no models subcommand; the active host tool catalog confirms the assigned model names.

## JavaScript budget probe

The accepted Phase 1 snapshot (75dcd11) was copied to /tmp/passe-webpack-probe-m4v_yoy9. The supported installed CLI flag --webpack built successfully. The copied code references shared installed dependencies read-only; no app-source changes were made. pnpm exec attempted dependency reconciliation in the copied project and aborted before module removal, so the actual probe used node node_modules/next/dist/bin/next build --webpack directly.

Identical gzip measurement of linked external scripts: Turbopack 134360 modern-browser bytes; webpack 132304 modern-browser bytes. Both exclude the HTML's verified nomodule legacy bundle (39373 bytes). Webpack alone does not meet 120 kB. Build output said compiled with warnings without providing a detailed warning in the captured output. No bundler switch was adopted.

D6 asks the user whether to retain the fixed stack with a 160 kB ceiling or retain 120 kB and investigate a different public rendering stack. It remains pending; all current requirements remain in force.

## Public read failure status

Next's normal component error boundary is not proof of a 503. The installed catchError API is a React boundary; only supported response-level handling can establish the approved status and no-store headers. Keep an explicit production-mode failure test when implementing public CMS routes. Do not invent a Server Component response-status API.

An isolated production probe on 2026-09-25 added a force-dynamic page with an awaited failing lookup and a route error.tsx. Next 16.3.6 returned HTTP 500 with private/no-cache/no-store for browser, Googlebot and GPTBot user agents. The calm error.tsx message was absent from all three initial HTML responses. This confirms that an error boundary alone satisfies neither the 503 status nor the JavaScript-disabled error-copy contract.

The probe used a separate temporary copy and port 3017, then stopped its server. No main application source or database was changed. The approved Caddy boundary can intercept upstream failures using reverse_proxy handle_response; its actual configuration, friendly body and no-store status remain to be implemented and verified before frontend acceptance. Merely replacing a status code without supplying the readable failure body is insufficient. Streaming a successful response before required reads finish must also be excluded or tested explicitly.

## Crash recovery checkpoint

After the editor/machine restart, the project source and local database persisted; the original subagent sessions did not. The parent restarted only .local/postgres and assigned a replacement Sol builder to finish the existing Phase 2 task. No accepted phase was restarted.

Read-only recovery counts: application users 2, media 12, pages 4, posts 3, services 3, events 2. Application migrations include 20260925_065737. The isolated test database was behind by that migration and contained old test fixtures; the builder owns making its setup repeatable. The application database must be preserved.

Phase 2 remains unaccepted: builder handback, parent full-diff review, the four-command check suite and independent review are still required. Phase 1 remains accepted. D6 remains unresolved; neither the fixed framework nor the 120 kB JavaScript ceiling has been changed.
