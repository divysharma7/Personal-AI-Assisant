# Focus corrective migration verification

Date: 2026-08-14  
Ticket: DB-001  
Production database touched: No  
Status: Local implementation and isolated PostgreSQL verification complete;
production snapshot/deploy verification pending

## Changes

- Added the missing `focus_sessions.post_session_note VARCHAR(2000)` repair.
- Added column-by-column repair for partially materialized `focus_records` and
  `focus_settings` tables.
- Reasserted required primary keys, ownership foreign keys, and Focus indexes.
- Verified existing enum labels instead of silently accepting incompatible
  same-named enum types.
- Reasserted the one-active-session-per-user partial unique index.
- Added a checksum-safe compatibility bridge for the historical calendar-index
  rename that prevented a fresh migration chain from provisioning.
- Preserved the contents/checksums of previously applied historical migrations.
- Normalized both legacy calendar-index names in the new corrective migration.

## Automated verifier

Run from `laif-api` with an explicit local PostgreSQL administrator URL:

```powershell
$env:FOCUS_VERIFY_ADMIN_URL='postgresql://...@localhost:PORT/template1'
npm.cmd run verify:focus-migration
```

The verifier refuses every non-local database host. It creates unique
`codex_focus_*` schemas, runs the checks, and drops only those generated schemas
afterward.

It validates four independent cases:

1. **Clean** — `prisma migrate deploy` from an empty schema.
2. **Drifted** — historical chain without the `20260808` Focus DDL, followed by
   the repair.
3. **Partial** — compatible enum types and empty partial Focus tables/columns,
   followed by the repair.
4. **Recorded drift** — `20260808` and `20260809` remain recorded as applied,
   their expected Focus objects are removed, and normal `prisma migrate deploy`
   discovers the older bridge plus the new repair.

Every case asserts:

- exact Focus enum labels;
- required Focus columns and varchar widths;
- primary keys and ownership foreign keys;
- canonical indexes and the active-session unique predicate;
- empty Prisma schema diff; and
- successful round-trip of a 2,000-character post-session note.

## Literal local result

```text
clean Focus migration verification passed.
drifted Focus migration verification passed.
partial Focus migration verification passed.
recorded Focus migration verification passed.
```

## Production deployment gate

Do not deploy until SEC-001 credential rotation permits safe access. Then:

- capture a read-only pre-deploy schema snapshot;
- run the verifier against a sanitized production clone if available;
- run `prisma migrate deploy` once against production;
- capture the post-deploy schema and confirm the Prisma diff is empty;
- persist a 2,000-character note with a non-user test fixture or transaction;
- smoke authenticated Focus dashboard/settings/records/active-session routes;
- start and complete one Focus session and confirm exactly one record; and
- observe API error rate before closing the release gate.

If a partially existing table contains rows but lacks a required non-null
column whose value cannot be inferred, the migration intentionally fails rather
than inventing user data. Resolve that case from a sanitized snapshot with an
explicit backfill plan.
