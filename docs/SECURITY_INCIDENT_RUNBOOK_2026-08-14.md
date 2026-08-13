# Production credential exposure runbook

Date opened: 2026-08-14  
Severity: P0 / stop-ship  
Scope: Tracked `laif-api/.env.production` and any credential ever stored in it

## Safety rules

- Never paste a credential into this document, a ticket, chat, command output,
  screenshot, commit message, or test artifact.
- Do not delete the developer's local environment file during containment.
- Rotation comes before declaring containment complete.
- Coordinate any Git-history rewrite with every repository consumer because it
  changes commit IDs and requires fresh clones or careful rebases.

## Phase 1 — Repository containment

- [x] Add ignore rules for `.env*` files with explicit redacted-template
  exceptions.
- [x] Add a scanner that reports only file/rule names, never matched values.
- [x] Remove `.env.production` from Git tracking while keeping the local file.
- [x] Run `npm run security:secrets` and retain only pass/fail output.
- [x] Ensure the current change set stages only deletion of the tracked file,
  never the preserved local contents.

## Phase 2 — Credential rotation (platform owner)

Rotate each credential independently and record only the provider change ID and
timestamp in the incident system:

- [ ] Production database credential/connection string.
- [ ] JWT signing secret.
- [ ] Google OAuth client secret.
- [ ] Google token-encryption key.
- [ ] Any other credential discovered by provider audit or secret scanning.

For every rotation:

- [ ] Put the replacement directly into the deployment platform secret store.
- [ ] Redeploy/restart the affected service.
- [ ] Verify health/readiness and one authenticated smoke request.
- [ ] Prove the previous credential no longer works without recording it.
- [ ] Check logs for authentication failures or unusual access around exposure.

Rotating the Google token-encryption key can make already-encrypted provider
tokens unreadable. Define either a controlled re-encryption procedure using the
old key in a secure one-time job or require users to reconnect Google. Do not
discard the old key until that decision is executed.

## Phase 3 — History and distribution assessment

- [ ] Identify every remote, fork, clone, CI cache, artifact, and backup that may
  contain the secret-bearing commit.
- [ ] Decide with the repository owner whether rotation alone is sufficient or
  whether history must be rewritten.
- [ ] If rewriting, use an approved history-filtering tool, force-push during a
  maintenance window, invalidate old build caches, and notify all consumers.
- [ ] Re-scan the rewritten full history and default branch.

## Phase 4 — Prevention gate

- [ ] Run `npm run security:secrets` in the required backend PR workflow.
- [ ] Add a maintained full-history scanner such as Gitleaks in CI when network
  and CI configuration are available.
- [ ] Protect the default branch so the scan cannot be skipped.
- [ ] Review deployment access and least-privilege ownership quarterly.

## Closure evidence

The incident may close only when the release owner has:

- a clean repository and history scan;
- provider-side proof that old credentials are invalid;
- a successful secret-store-only staging/production boot;
- successful `/health`, `/ready`, login, and one credentialed write smoke; and
- an owner and due date for any accepted residual risk.
