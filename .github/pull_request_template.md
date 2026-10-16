## Change

Describe the user-facing change and any migration or content impact.

## Checks

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` passed locally
- [ ] Required GitHub integration and browser jobs passed
- [ ] Local `pnpm test:performance` passed for a release, with the result recorded below
- [ ] The diff and deployment risk were reviewed before merge

Check results and exceptions:

## Release

For production changes, deploy the exact merged `main` commit to Render Production and check `/api/health` and the changed pages. Keep production deployment manual.
