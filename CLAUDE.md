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
export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )

    const body = await req.json()
    const parsed = parseBody(SomeSchema, body)
    if (!parsed.success) return NextResponse.json(
      { error: parsed.error }, { status: 400 }
    )

    await connectDB()
    const doc = await Model.create({ ...parsed.data, userId })

    return NextResponse.json(
      { ...doc.toObject(), _id: String(doc._id) },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
```

Five rules:
1. `getAuthUserId()` first, 401 on null — no exceptions for non-public routes
2. `parseBody(Schema, body)` for all POST/PUT/PATCH — no raw `req.json()` into the DB
3. All queries include `{ userId }` or `{ ownerId }` — never `findById(id)` alone
4. `handleApiError(err)` in catch — never `api500` or `apiError`
5. 201 for creates, 400 for validation, 401 for auth, 404 for not found, 500 for server errors

---

## Data Model Invariants

These are fixed. Do not work around them without updating CAPABILITY_PLAN.md first.

1. **Single user** — every document has `userId`. Every query filters by `userId`.
   No exceptions. No admin paths. No cross-user access.
2. **Habits are Tasks** — `isHabit: true` on the Task model is the canonical habit.
   The legacy `Habit` model still exists but is deprecated. Do not add features to it.
3. **Task status has 5 states** — `backlog | todo | in-progress | done | dropped`.
   The TypeScript type in `src/types/index.ts` must match. Do not add custom statuses.
4. **All UI strings in copy.ts** — no hardcoded user-facing strings anywhere else.
5. **All animation tokens in motion.ts** — no inline framer-motion values.
6. **MongoDB only** — no SQL, no Drizzle, no Prisma. 21 collections.

---

## Known Deferred Work

Before starting any session, check `TODO.md` for the current deferred list.
Do not implement items not on the list without a product-capability plan first.

Current deferred (as of 2026-05-25):
- Legacy Habit model migration (~1 day) — use tdd-workflow skill
- Chat tool function tests (~0.5 day)
- Notification pipeline implementation (~1 day)
- Production auth verification (30 min) — must happen before Vercel deploy
- Rate limiting
- Alexa integration with proper signature verification (not before rate limiting)

---

## Security Invariants

Do not ship any of the following without explicit sign-off in SECURITY_AUDIT.md:

- A new public route (no auth) that writes data
- A DELETE/PUT/PATCH route without `{ _id, userId }` ownership check
- A route using `findByIdAndUpdate` or `findByIdAndDelete` (use `findOneAndUpdate`
  with userId filter instead)
- Any use of `eval`, `Function()`, or dynamic `require()`
- Any route that accepts user input and passes it directly to MongoDB queries
  (mass assignment — always use parsed.data from Zod, never spread req.json())

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
