## Executor-led workflow with an on-demand advisor

The main session is the executor, configured as `gpt-6-sol` with high reasoning. It owns the plan, architecture decisions, tool loop, implementation, integration, verification and acceptance. It carries routine work through to completion itself. Model routing is configured in `.codex/config.toml` and the canonical roles in `.codex/agents/`.

For narrow yes/no semantic decisions, use the Jev decision tool: `node scripts/jev-decision.mjs`, with JSON supplied on stdin as documented in `docs/JEV-DECISIONS.md`. Prefer deterministic code for exact checks. Batch related questions about the same state when useful. Send only the minimal relevant, non-sensitive evidence to TypeSafe; never send credentials, private customer records or the whole conversation. The tool returns yes/no/review plus the probability of yes. Review results and errors return to the Sol executor, not automatically to Astra. Do not use Jev to grant permission, override safety/access controls, approve deployments or replace required tests and independent reviews. It is a classification tool, not a replacement agent model.

Use `advisor` (`gpt-6-astra`, high reasoning) only when:

- A consequential architecture, product/design or security/data-integrity decision remains ambiguous after inspecting the relevant evidence.
- Two materially different, evidence-based attempts have failed to resolve the same problem.
- The user explicitly requests frontier-model advice.

These instructions authorise on-demand delegation to the advisor without another permission question. Do not consult it for routine edits, status updates, every tool result or every diff. Give it a compact decision brief: question, constraints, relevant excerpts, options and failed attempts/results. It returns reasoning and verification steps only, with no tool calls or edits. The executor collects missing evidence, applies the recommendation when justified, and continues the task. Reuse an existing advisor for the same unresolved decision; call again only with materially new evidence. If unavailable, report that limitation and continue safe independent work without silently changing models or claiming advice occurred.

Implementation subagents remain available for independent, bounded work when delegation is useful:

- `executor` (Luna): one specified component, route or test, with acceptance criteria, an explicit file list and commands to run. The Sol parent normally implements multi-step foundation work itself.
- `builder` (Sol): retained for an explicitly delegated foundation task; do not routinely spawn another Sol for work the Sol parent can complete.
- `reviewer` (Sol): independent read-only diff review. Astra is not the routine reviewer.

Keep on the parent: AGENTS.md changes, .codex changes, plan changes and any task whose file list overlaps a running subagent. Never run two agents on overlapping files. Tell implementation agents they share the workspace and must preserve others' changes. No subagent changes the plan.

After an implementation subagent returns, the parent reads the full diff, runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, then requests the independent Sol reviewer. A fix-first verdict requires correction and re-review. A short advisor consultation is not an implementation handoff and does not itself trigger another full test suite. Existing phase acceptance and browser/performance gates remain in force; do not weaken checks to reduce cost.

This project configuration applies to newly started sessions unless a UI/profile/CLI model override takes precedence. It does not change the model of an already-running conversation. See `docs/ADVISOR-WORKFLOW.md` for activation and verification.

## Installed project tools

- gstack's Codex skills are in `.agents/skills/`. Use `$gstack` to select a workflow, `$review` for review, and `$qa` for browser QA. Runtime assets are under `.agents/skills/gstack/`.
- context-mode and Ponytail are enabled for this project through `.codex/config.toml` and the `passe-culinaire-tools` marketplace.
- When context-mode MCP tools are available, use `ctx_batch_execute`, `ctx_execute_file`, and `ctx_search` for large outputs and analysis. Use `ctx_fetch_and_index` for indexing web content; use gstack for interactive browser QA. Read `.tools/context-mode/configs/codex/AGENTS.md` for the full routing guidance when using context-mode. If its tools are unavailable, use the available host tools.
- Use `$ponytail:ponytail` for the simplest correct implementation and `$ponytail:ponytail-review` to check for unnecessary complexity. Existing project delegation and verification requirements still apply.
- Installation details and verification are recorded in `AI-TOOLS.md`.

- ADHD is installed at `.agents/skills/adhd/`. Invoke `$adhd` for divergent brainstorming; use its pre-flight gate and respect the available agent concurrency limit. The parent still owns architecture, integration, and acceptance.

## Application commands

Use pnpm and Node 22 LTS or newer. Phase 1 establishes the install/dev/check/build scripts; Phase 2 supplies the full seed script. Do not describe a future command as already verified.

| Task | Command |
|---|---|
| Install | `pnpm install` (use `pnpm install --frozen-lockfile` for reproducible CI once the lockfile exists) |
| Development | `pnpm dev` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit/integration tests | `pnpm test` |
| Build | `pnpm build` |
| Production server | `pnpm start` |
| Seed | `pnpm seed` |
| Browser smoke tests | `pnpm test:e2e` (established with browser coverage) |

At the end of every phase run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, show actual output, and report built/skipped/assumed items. Failure is not acceptance. Do not weaken checks to pass.

## Application layout

- `src/app/`: separate public and Payload App Router groups and server endpoints.
- `src/payload/`: collection, global, block, access and hook definitions.
- `src/components/`: public blocks and shared interface elements.
- `src/lib/`: typed public content projections, renderers, SEO and serializers.
- `src/styles/globals.css`: Tailwind entry, exact brand tokens and global styles.
- `src/fonts/`: self-hosted Fraunces, Inter and JetBrains Mono plus licences.
- `src/migrations/`: committed database migrations; never push mode.
- `scripts/`: seed and operational helpers; preserve existing tool scripts.
- `tests/`: Vitest and Playwright coverage.
- `docs/PLAN.md`: approved plan and review record, parent-owned.
- `docs/designs/`: approved design, sketch and review evidence.
- `docs/DEPLOY.md`: plain Node VPS deployment and recovery instructions.
- The supported Payload integration determines the exact config/generated file locations after installed docs/types are checked.

## Design tokens

Preserve these exact brand values in this file and globals.css. Use accessible semantic aliases for their roles; not every foreground/background combination passes contrast.

```css
--font-display: "Fraunces"; /* variable, opsz + wght, self-hosted */
--font-body: "Inter"; /* variable, self-hosted */
--font-mono: "JetBrains Mono"; /* self-hosted, code and captions */

--color-bone: #F4F1EA;
--color-ink: #1A1A18;
--color-moss: #4A5A3F;
--color-clay: #B8674B;
--color-ash: #8A8A82;
--color-charcoal: #141412;
--color-linen: #E8E4DA;

--step--1: clamp(0.83rem, 0.8rem + 0.2vw, 0.95rem);
--step-0: clamp(1.05rem, 1rem + 0.3vw, 1.2rem);
--step-1: clamp(1.3rem, 1.2rem + 0.6vw, 1.7rem);
--step-2: clamp(1.7rem, 1.4rem + 1.4vw, 2.6rem);
--step-3: clamp(2.3rem, 1.6rem + 3vw, 4.2rem);
--step-4: clamp(3rem, 1.5rem + 6.5vw, 7.5rem);
```

- Prose maximum measure: 62ch. Body line height: 1.55. Display line height: 1.05.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144 px.
- Radius: zero except 2 px on form inputs.
- Rules: 1 px ash at 30% opacity.
- Editorial 12-column grid, generous whitespace, full-bleed or quiet text hero; no shadow cards, gradient buttons, parallax, autoplay video or looping motion.
- Kitchen-story exception: on 28 September 2026 the user approved the 128-second Remotion film and instructed homepage integration. The homepage may use this one finite, muted film that starts when visible, with pause/replay, offscreen and hidden-tab pause, and an initially paused reduced-motion or data-saving state. Defer video transfer until visible or explicitly played. No looping. This authorises application integration; deployment still follows the deployment workflow.
- Reveal motion: 200–300 ms opacity/transform, respecting prefers-reduced-motion.
- C4 charcoal default (approved 26 September 2026); explicit light and system preferences plus manual localStorage control.
- Approved signature details: the selected reinforced P/C monogram, lowercase light-weight Fraunces wordmark and Southern Hemisphere seasonal hero. No weather readout.
- Keep ash/clay off small light-theme text and moss off dark-theme text/focus where contrast fails. WCAG 2.2 AA, semantic landmarks, one h1, skip link and visible focus are required.
- Mobile targets: Lighthouse Performance, Accessibility, Best Practices and SEO >=95; LCP <2.0s on the documented throttled 4G profile; home JavaScript <120kB gzipped. On 26 September 2026 the user approved retaining the stack with exceptions for the measured 158kB home JavaScript and up-to-2.48s median LCP. Regression ceilings are <160kB and <=2.6s (small measurement tolerance); category scores remain >=95. QUALITY_STRICT_BUDGETS=true restores the original targets.

## Content and public behaviour

- Australian English. Chef to chef, kitchen nouns before technology nouns. The home priority is chefs and owners understanding Passe Culinaire and exploring CulinAIre Kitchen.
- CulinAIre Kitchen is the first offer, not the entire company. Retain company identity, training, advisory and publishing scope.
- Use supplied founder facts only. Unknown facts stay [TO CONFIRM] until confirmed; no invented claims in public structured data. Real testimonials only; seed none.
- Banned public copy: leverage, unlock, revolutionise, seamless, cutting-edge, powered by AI, AI-driven, smart, intelligent, next-generation, transform your business. No em dashes, exclamation marks or emoji in public copy.
- Explain AI with a concrete, verified kitchen example; never invent product capability or savings claims.
- Admin labels use Journal, Training and Publish. Empty states/errors are short and calm.
- Every public content route is server-rendered or statically generated with its text in HTML. Preview and private responses must never enter shared public caches.
- Public Payload Local API calls must respect access controls and publication rules. Public author projections exclude authentication/private fields.
- noIndex content is excluded from sitemap, feeds and LLM exports; sitemap-only exclusion affects sitemap only.
- Keep public media crawler-accessible while preserving the required /api robots disallow. The exact ten-link llms.txt requirement remains a production content gate.
- Changes become public within 60 seconds without a rebuild; prove commit/invalidation ordering and dependent-output freshness.
- Commit migrations; no schema push mode. Use private environment configuration for admin credentials. Never commit working secrets.
- Preserve all existing project tools and unrelated user work.

## Never rules

- Never render public content client-side only.
- Never call a third-party font, script, or analytics host from the client without a config flag defaulting to off.
- Never use any. Never disable a lint rule to pass a check.
- Never add a package without stating why in the commit message.
- Never write marketing copy in the seed data. Plain sentences only.
- Never use em dashes in seed copy or UI text.
- Never add Docker, docker-compose, or snap-based instructions.

## Approved execution and verification

The user approved the build plan with defaults and the reviewed office-hours design and sketch. Those approvals stand. The CEO review is complete; implementation and engineering/diff review gates remain. Follow the seven phases and keep commits small with imperative messages. Keep this file updated when a rule changes.

All initial services, events and sample posts are drafts. Do not publish fictitious offerings to populate the site. The current design preserves truthful empty states and the company-to-product path. Detailed requirements and acceptance criteria are in docs/PLAN.md and the original supplied brief.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
