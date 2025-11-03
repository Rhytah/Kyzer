# Secret Scanning & Local Hooks

This project includes a lightweight secret scanner to help prevent accidental commits of sensitive values (Supabase keys, JWTs, private keys, etc.). The scanner runs on CI (GitHub Actions) and can be enabled locally as a pre-commit hook.

Why this exists
- Prevent accidental leakage of secrets into the git history.
- Ensure service-role keys are only used server-side and not bundled into the frontend.

Files added
- `scripts/check-secrets.cjs` - CommonJS secret scanner. Scans staged files by default.
- `.githooks/pre-commit` - A pre-commit hook that runs the scanner on staged files. Not active by default.
- `.github/workflows/secret-scan.yml` - CI workflow that runs the scanner on PRs and pushes.

How to enable local pre-commit hooks
1. Run the npm helper (or run the git command directly):

```bash
npm run enable-git-hooks
```

This sets `core.hooksPath` to `.githooks` in your local repository so the `pre-commit` hook runs.

2. Verify the hook is enabled:

```bash
git config core.hooksPath
# should print: .githooks
```

3. The hook runs `node scripts/check-secrets.cjs --staged` before each commit. If it finds likely secrets it will abort the commit and print the offending files and snippets.

Notes on false positives and server-side exceptions
- The scanner is conservative: it only scans a limited set of file extensions and excludes `docs/`, `public/`, and `node_modules/` to reduce noise.
- Server-side code (under `supabase/functions/`, `supabase/edge/`, `server/`) is allowed to reference `SUPABASE_SERVICE_ROLE_KEY` but only if it accesses it via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` or `process.env['SUPABASE_SERVICE_ROLE_KEY']`. Hardcoded values or unusual access patterns will still be flagged.

CI Integration
- The GitHub Actions workflow `secret-scan.yml` runs `node scripts/check-secrets.cjs` on PRs and pushes to `main`.

If you need the scanner to be stricter or looser, edit `scripts/check-secrets.cjs` and update the allowed file paths/regexes.

Security reminder
- Do NOT commit any real secrets to the repository. Use environment variables in your hosting provider (Vercel, Netlify, GitHub Actions secrets, Supabase secrets).
- If a secret has ever been committed, rotate it and consider purging it from git history.
