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
