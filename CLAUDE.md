# LAIF — Claude Code Directives

> Last updated: 2026-05-25
> These rules apply to every session, every agent, every edit.

---

## Non-Negotiable Rules

### 1. Verify before reporting complete
Every session must end with:
```bash
npx tsc --noEmit
npm test
```
Do not report "done" until both pass. Do not summarize work without
running these two commands first. A passing summary with a broken
build is worse than silence.

### 2. One session, one bug class
Each Claude Code session has exactly one scope:
- Auth fixes OR
- Data isolation fixes OR  
- Zod validation for one entity OR
- E2E coverage OR
- Security audit

Do not expand scope mid-session. If you discover adjacent work,
document it in TODO.md and stop. Do not fix it in the same session.

### 3. No parallel agents on overlapping files
Never run multiple agents that could edit the same file simultaneously.
The cost is inconsistent state that takes longer to untangle than the
work saved. Sequential single-agent sessions only.

### 4. Demand literal output, not summaries
When verifying work, run the commands and paste the output.
Do not infer success from the absence of error messages.
Do not trust an agent's account of its own work without tsc + test evidence.

### 5. GateGuard friction is information
If GateGuard blocks an edit, that friction is the system working.
Do not disable GateGuard (ECC_GATEGUARD=off) to speed up a session.
High friction = scope is too large = stop and narrow the session.

### 6. Hold commits yourself
Agents do not commit. The human commits after verifying tsc + tests pass.
Every commit gets a tag. Format:
```
git commit -m "scope(area): what changed

- bullet list of specific changes
- files changed with reasons
- what was intentionally NOT changed and why"

git tag descriptive-tag-name
git push origin main --tags
```

---

## House Style — API Routes

Every non-public route must follow this pattern exactly:

```typescript
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseBody(CreateThingSchema, req.body)
    if (!parsed.success) throw new ValidationError(parsed.error)

    const thing = await getPrisma().thing.create({
      data: { ...parsed.data, userId: req.userId! },
    })

    res.status(201).json(serializeThing(thing))
  } catch (err) {
    next(err)
  }
})
```

Five rules:
1. Authentication middleware supplies `req.userId`; no private route bypasses it
2. `parseBody(Schema, req.body)` for every POST/PUT/PATCH
3. Every Prisma read/update/delete scopes by `userId` or `ownerId`
4. Pass errors to the shared Express error handler with `next(err)`
5. 201 for creates, 400 for validation, 401 for auth, 404 for not found, 500 for server errors

---

## Data Model Invariants

These are fixed. Do not work around them without updating CAPABILITY_PLAN.md first.

1. **Strict ownership** — every user-owned PostgreSQL row has `userId` or
   `ownerId`. Every Prisma query and mutation enforces that ownership.
2. **Habits are Tasks** — `isHabit: true` on `Task` is the only habit model.
3. **Task status has 5 API states** — `backlog | todo | in-progress | done |
   dropped`. Prisma maps `in_progress` to the existing `in-progress` wire value.
4. **All UI strings in copy.ts** — no hardcoded user-facing strings anywhere else.
5. **All animation tokens in motion.ts** — no inline framer-motion values.
6. **PostgreSQL only** — Prisma ORM and Prisma Postgres are the sole persistence
   layer. Do not add MongoDB, Mongoose, or a second database.

---

## Known Deferred Work

Before starting any session, check `TODO.md` for the current deferred list.
Do not implement items not on the list without a product-capability plan first.

Current deferred (as of 2026-05-25):
- Chat tool function tests (~0.5 day)
- Notification pipeline implementation (~1 day)
- Rate limiting
- Alexa integration with proper signature verification (not before rate limiting)

---

## Security Invariants

Do not ship any of the following without explicit sign-off in SECURITY_AUDIT.md:

- A new public route (no auth) that writes data
- A DELETE/PUT/PATCH route without an ownership condition in its Prisma query
- Any use of `eval`, `Function()`, or dynamic `require()`
- Any route that passes unvalidated request data directly to Prisma
  (always write parsed Zod fields; never spread `req.body`)

---

## Skill Invocation

When a session starts, name the skill explicitly in the first prompt.
Require the artifact the skill produces — not just the skill name.

| Task | Skill | Required artifact |
|------|-------|-------------------|
| New feature planning | product-capability | CAPABILITY_PLAN.md update |
| Before writing code | search-first | Research summary before first edit |
| Any new route or model | tdd-workflow | Failing tests before implementation |
| After any schema change | verification-loop | tsc + test + manual smoke test |
| Before any deploy | security-review | SECURITY_AUDIT.md updated |
| Navigation or UI changes | e2e-testing | Playwright spec covering the route |
| New API routes | api-design | Routes follow house style above |

---

## What Went Wrong in the Original Sprint

This codebase was built in a 2-day sprint with ~50 parallel agents and ~30K lines
changed. The result was a working app with significant technical debt:

- Schema fields added reactively (userId, workflowId, sectionId added after bugs)
- Task model grew to 50+ fields organically — many unused
- Auth middleware was disabled (hardcoded DEV_USER_ID)
- Dead code: labels system, umbrellas, legacy models never cleaned up
- No data isolation on Event/Reminder models (any user could see any event)
- No Zod validation on 87% of write routes

The foundation audit (May 2026) cleaned this. The rules above exist to prevent
recurrence. The single root cause: agents were given implementation scope without
a capability plan. Features were built before the data model was understood.

**The fix is not slower agents. It is: capability plan first, then implementation.**

---

## Contacts

- Architecture decisions: update CAPABILITY_PLAN.md before implementing
- Security findings: update SECURITY_AUDIT.md before and after fixing
- Deferred work: update TODO.md, don't leave it in Slack or memory
- API changes: follow the house style above, update API_AUDIT.md if pattern changes
