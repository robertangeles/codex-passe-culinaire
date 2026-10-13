# On-demand advisor workflow

Configured 4 October 2026 at the user's request.

| Role | Model | Responsibility |
| --- | --- | --- |
| Main session | `gpt-6-sol`, high | Own the workflow, tools, implementation, checks and acceptance |
| Decision tool | `jev-1.13.0` | Narrow yes/no classifications via `scripts/jev-decision.mjs` |
| `advisor` | `gpt-6-astra`, high | Reason about a supplied decision brief only when escalation is warranted |
| `executor` | `gpt-6-luna`, high | Optional bounded implementation work |
| `reviewer` | `gpt-6-sol`, high | Independent routine diff review |
| `builder` | `gpt-6-sol`, high | Retained for explicitly delegated foundation work |

The executor consults Astra for consequential unresolved ambiguity, after two materially different failed attempts, or when explicitly requested. It supplies concise evidence and keeps execution responsibility. The advisor is instructed not to call tools or edit files; `sandbox_mode = "read-only"` provides a filesystem fallback, not a technical ban on all tool calls. This is instruction-based Codex orchestration, not an API-level advisor flag or an automatic cost-saving guarantee.

## Setup validation

Validated with installed Codex CLI 0.156.1: all role/config TOML parses, the current model catalog lists Sol/Astra/Luna with high reasoning, and strict configuration diagnostics report zero failures. A fresh app-server `config/read` from this project resolves `gpt-6-sol` / high with `gpt-6-luna` / high as the subagent default. The advisor and reviewer role definitions explicitly pin their respective models. No paid model run or live advisor handoff was used for this configuration check.

## Activate

Start a **new Codex conversation in this project** and ensure the model selector shows **GPT-6 Sol**. An existing conversation or an explicit UI/profile/CLI model selection can retain Astra despite the project default. If starting the CLI, `codex -m gpt-6-sol` explicitly chooses the intended main model. Restart the IDE extension if the new `advisor` role is not discovered.

Codex discovers project roles from `.codex/agents/*.toml`. Older `.codex/builder.toml`, `.codex/executor.toml` and `.codex/reviewer.toml` files are legacy copies, not the active role definitions; they were preserved rather than deleted. Edit the canonical directory only.

## Verify

- `codex debug models` checks the current catalog for the three configured model slugs and supported reasoning effort.
- `codex --strict-config doctor --summary` checks that the installed CLI accepts the configuration. Terminal/update notes do not establish a routing failure.
- Check the main session's model selector and the advisor subagent's recorded model on the first real escalation. Configuration validation alone does not prove an end-to-end model handoff or measured cost savings.

No website source, database content, application test budgets, permissions, plugin settings or credentials are changed by this setup. Existing full implementation verification and independent review requirements remain in AGENTS.md. No full website build is needed for this configuration-only change.

Reference: [Official Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Yes/no decisions

The Jev tool was added on 4 October 2026 after this workflow setup. Sol can call it for narrow semantic classifications, with uncertain or unavailable results returning to Sol. Deterministic checks stay in code and consequential reasoning remains with Sol/Astra. [Configuration, policy and live verification](JEV-DECISIONS.md).
