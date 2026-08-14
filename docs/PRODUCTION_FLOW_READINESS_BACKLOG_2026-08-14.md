# Life OS production-flow readiness backlog

Date: 2026-08-14  
Status: Proposed execution baseline  
Scope: Expected user flows, frontend/API/data contracts, release safety, and test gates  
Supersedes: treating a successful frontend build as proof that a user journey works

## 1. Executive decision

Life OS is visually implemented, but the production product is not yet proven as
an end-to-end system. The remaining work is not one class of frontend defect. It
is a set of cross-layer contract gaps:

1. **Security and deployment safety** — a tracked production environment file
   contains production-looking secrets.
2. **Identity and first-run state** — authentication exists, but onboarding
   completion, consent, personalization, and cross-device persistence are not a
   defined backend contract.
3. **Core execution loop** — Tasks and Focus have implementations, but Focus has
   unresolved production schema drift and neither is protected by a real browser
   plus PostgreSQL release test.
4. **Daily-loop persistence** — Morning Plan and Evening Shutdown call an API
   that does not exist; Shutdown is not atomic.
5. **External/optional capabilities** — Google OAuth initiation and Chat do not
   match their backend contracts. Placeholder capabilities must be completed or
   hidden, not presented as working.
6. **Quality and operations** — current tests validate components and mocked
   routes, but not migrations, browser cookies, CORS, deployed redirects, or the
   complete new-user journey.

The immediate release target should remain narrow:

> A new user can sign up, finish or skip onboarding, create a default task,
> complete one Focus session, refresh without losing state, log out, and log
> back in without an unexpected 4xx/5xx.

Morning Plan, Shutdown, Google Calendar, and Chat should enter the release only
after their own exit gates pass.

## 2. MECE model

The audit uses six mutually exclusive domains. Every requirement belongs to one
domain only; dependencies may cross domains.

| Domain | Question | Included | Not included |
| --- | --- | --- | --- |
| A. Release safety | Can we deploy without exposing or corrupting production? | Secrets, migrations, rollback, environment isolation | User-facing behavior |
| B. Identity lifecycle | Can a person enter, retain, and leave a session/account? | Signup, login, onboarding, consent, logout, expiry | Task or calendar behavior |
| C. Core daily work | Can the user capture and execute work? | Tasks, Focus, persistence, retry safety | Morning/evening rituals |
| D. Daily loop | Can the user plan and close a day consistently? | Plan state, Shutdown, atomic decisions | Generic task CRUD |
| E. Integrations/capabilities | Do optional promises have complete contracts? | Google, Chat, collaboration, MCP, stubs | Core auth and task flows |
| F. Quality/operations | Can failure be detected before and after release? | Test pyramid, CI, staging smoke, observability | Feature implementation |

## 3. Expected-flow gap map

| Flow | Expected outcome | Current evidence | Gap/status | Release decision |
| --- | --- | --- | --- | --- |
| Signup | Account is created and browser session is established | Signup route sets an HttpOnly cookie | Local code exists; production cookie path is unproven | P0 staging proof |
| Onboarding | Choices and completion persist, optional Google path works | Name-only `PUT /api/auth/me` now exists | Priorities are local-only; consent/opt-in are discarded; completion state is absent | P0 core fix; Google may be skipped |
| Returning login | Deep link is restored and refresh retains session | `RequireAuth` probes `/api/auth/me` | No successful full-browser returning-user test | P0 test gate |
| Default task | `priority: "none"` creates a task persisted as `null` | Backend normalization is now committed | Regression and real-DB proof are missing | P0 verification |
| Morning Plan | State saves and survives refresh/device change | Frontend calls `/api/rituals` | No backend route or model; writes fail | Exclude until RITUAL-001 |
| Focus | Start, recover, complete, and record exactly once | Focus APIs and corrective migration exist | Live schema not verified; repair omits a known column widening | P0 migration + browser proof |
| Shutdown | All decisions apply once or none apply | Client updates tasks then saves ritual | Missing ritual API; best-effort rollback can leave partial state | Exclude until RITUAL-002 |
| Google connect | Connect button reaches Google and returns to Settings | Backend `/auth` returns `{url}` | UI navigates to the JSON endpoint as though it redirects | Exclude or fix before exposure |
| Chat | Message is answered and history loads | UI sends message history and parses NDJSON | Backend expects one `message`, returns JSON, and sessions response shape differs | Hide or implement contract |
| AI Brief | Dashboard does not call a dead endpoint | Widget and call were removed | Implemented locally; verify deployed bundle | Closed after deploy proof |
| Data export/delete | Export downloads; deletion reauthenticates and clears session | Frontend and backend implementations exist | No production journey/ownership regression | P1 test |
| Collaboration/MCP | Visible controls perform a supported capability | Partial backend contracts exist | Collaborators cannot consume lists; MCP key cannot authenticate | Hide/defer or complete |

## 4. Definition of ready and done

A ticket is **Ready** only when it has one behavior owner, one contract owner,
dependencies, test layer, and rollback strategy.

A ticket is **Done** only when:

- acceptance criteria pass with literal command/test output;
- frontend and backend contracts use the same method, URL, request, response,
  status, and error schema;
- user-owned data is scoped by authenticated `userId`;
- loading, empty, success, validation, authentication, and server-error behavior
  are defined where relevant;
- a retry cannot duplicate or partially apply a command;
- the required test layer passes;
- documentation is updated; and
- deployment-required tickets also pass an HTTPS staging smoke test.

“Code merged,” “typecheck passed,” and “the UI renders” are not deployment
acceptance criteria by themselves.

## 5. Execution-ready tickets

### Domain A — Release safety

#### SEC-001 — Contain and rotate tracked production secrets

**Type:** Security incident  
**Priority:** P0 — stop-ship  
**Owner:** Release/Security  
**Estimate:** 5 points  
**Status:** Open; do not commit or push `laif-api/.env.production`  
**Depends on:** Platform-owner access

**Requirement:** No production credential may exist in tracked files or usable
Git history. Runtime secrets must come from the hosting platform.

**Scope:**

- Rotate database credentials, JWT secret, Google client secret, and Google
  token-encryption key.
- Move values into Prisma Compute/platform secret storage.
- Untrack `.env.production`, ignore environment variants, and keep only a
  redacted `.env.example`.
- Assess repository distribution and purge secret-bearing history where
  required.
- Add secret scanning as a required check.

**Acceptance criteria:**

- [ ] Old credentials no longer authenticate.
- [ ] `git ls-files` returns no production environment file.
- [ ] A repository secret scan finds no live value.
- [ ] Backend boots in staging using injected variables only.
- [ ] Rotation and rollback evidence is stored outside source control.

**Test/evidence:** Secret scan, platform configuration check, staging boot. Do
not place secret values in test output, tickets, or chat.

---

#### DB-001 — Make the Focus corrective migration schema-complete

**Type:** Database/release  
**Priority:** P0  
**Owner:** Backend/DB  
**Estimate:** 5 points  
**Status:** Implemented and verified locally on isolated PostgreSQL; production
snapshot/deploy remains.
**Depends on:** SEC-001 for safe production access

**Requirement:** Applying migrations to both an empty database and the known
drifted schema must produce the exact Prisma Focus schema.

**Scope:**

- Add the missing guarded widening of
  `focus_sessions.post_session_note` from `VARCHAR(200)` to `VARCHAR(2000)`.
- Verify all Focus enums, columns, defaults, indexes, checks, unique constraints,
  and foreign keys—not merely table existence.
- Handle an existing partially materialized table; `CREATE TABLE IF NOT EXISTS`
  alone is not a schema repair.
- Capture pre/post schema snapshots and an empty-database migration run.

**Acceptance criteria:**

- [ ] Live-schema-to-`schema.prisma` diff is empty.
- [x] Clean, drifted, intentionally partial, and recorded-as-applied drift
  fixtures all converge locally.
- [x] A 2,000-character post-session note persists locally.
- [ ] Focus dashboard/settings/records/active-session reads return 200.
- [ ] Session start and completion persist exactly one session/record.

**Test/evidence:** Real PostgreSQL migration integration; authenticated staging
smoke. Playwright alone is insufficient for this ticket.

---

#### REL-001 — Establish an explicit deployment and rollback gate

**Type:** Release engineering  
**Priority:** P0  
**Owner:** Release  
**Estimate:** 3 points  
**Status:** Open  
**Depends on:** SEC-001, DB-001, QA-001

**Requirement:** A release cannot be promoted unless migration, core journey,
health, error-rate, and rollback checks are recorded against the same version.

**Acceptance criteria:**

- [ ] Runbook identifies frontend commit, backend commit, migration set, and
  environment.
- [ ] `/health` and `/ready` pass before browser smoke begins.
- [ ] Rollback does not reverse destructive schema migrations.
- [ ] Post-deploy smoke and 15-minute error observation pass.
- [ ] Failed gates stop promotion and name the rollback owner.

### Domain B — Identity lifecycle

#### ONB-001 — Define and persist onboarding state

**Type:** Full-stack story  
**Priority:** P0  
**Owner:** Product + Backend + Frontend  
**Estimate:** 5 points  
**Status:** Partially implemented  
**Depends on:** Product decision on consent and marketing data

**Requirement:** Completing onboarding must be one authenticated, user-scoped
operation whose persisted fields match the promises shown in the UI.

**Contract decision:** Persist `onboardingCompletedAt`, selected priorities,
terms version/timestamp, and email preference, or remove each control/copy that
is not a real product field. Do not silently discard values.

**Acceptance criteria:**

- [ ] An unauthenticated visitor cannot complete onboarding.
- [ ] A newly created account always enters onboarding even when signup began
  from a protected deep link; that intended destination is used only after
  onboarding completes.
- [ ] A returning user who logs in still returns directly to the intended deep
  link.
- [ ] Completion survives refresh, logout/login, and a second browser.
- [ ] Existing completed users are not repeatedly routed through onboarding.
- [ ] The name already collected during signup is pre-populated or the duplicate
  name step is removed.
- [ ] Terms labels link to real Terms and Privacy documents and store versioned
  acceptance if acceptance is required.
- [ ] Email opt-in is persisted only with explicit consent and can be changed.
- [ ] The skip-Google path always lands on a usable first-success screen.
- [ ] User B cannot modify User A's state.

**Test/evidence:** Supertest contract/ownership tests plus the Playwright
new-user journey.

---

#### AUTH-001 — Prove the production browser session lifecycle

**Type:** Full-stack/release story  
**Priority:** P0  
**Owner:** Full stack  
**Estimate:** 3 points  
**Status:** Unverified  
**Depends on:** QA-001, staging HTTPS origins

**Requirement:** Signup/login must set a usable cross-origin session; refresh,
credentialed writes, expiry, and logout must behave deterministically.

**Acceptance criteria:**

- [ ] Signup and login responses set the intended `HttpOnly`, `Secure`,
  `SameSite=None`, path `/` cookie in staging.
- [ ] Exact frontend origin passes credentialed CORS and CSRF checks.
- [ ] An unlisted origin cannot perform a cookie-authenticated write.
- [ ] Refresh retains authentication; logout clears it.
- [ ] Expired/missing credentials produce a clean 401 and Login redirect that
  preserves the original protected destination.

**Test/evidence:** Supertest CORS/CSRF cases plus deployed Playwright smoke.

---

#### AUTH-002 — Harden token and logout policy

**Type:** Security hardening  
**Priority:** P1  
**Owner:** Backend/Security  
**Estimate:** 3 points  
**Status:** Open  
**Depends on:** AUTH-001

**Requirement:** Choose cookie-only browser auth or a documented separate API
token flow. Do not return browser bearer tokens without a defined consumer.

**Acceptance criteria:**

- [ ] Production startup rejects a weak JWT secret.
- [ ] Browser auth responses do not unnecessarily expose the token body.
- [ ] Logout/revocation semantics and maximum exposure window are documented.
- [ ] Tests cover logout cookie clearing and stale/revoked credentials.

---

#### AUTH-003 — Provide a safe account-recovery path

**Type:** Identity capability  
**Priority:** P1 before public launch  
**Owner:** Product + Backend + Frontend  
**Estimate:** 8 points  
**Status:** Missing

**Requirement:** A user whose password is lost must have a defined recovery
path. If self-service recovery is intentionally out of scope, launch criteria
must explicitly name the administrator-assisted process and its controls.

**Acceptance criteria if implemented:**

- [ ] Forgot-password responses do not reveal whether an account exists.
- [ ] Reset tokens are single-use, expiring, stored safely, and rate-limited.
- [ ] Successful reset invalidates the token and follows the documented session
  policy.
- [ ] Login exposes the recovery entry point.
- [ ] API/browser tests cover unknown account, expired/reused token, and success.

### Domain C — Core daily work

#### TASK-001 — Lock the no-priority task contract

**Type:** Regression story  
**Priority:** P0  
**Owner:** Full stack  
**Estimate:** 3 points  
**Status:** Implemented locally; not release-proven  
**Depends on:** QA-001

**Requirement:** Every task creator may omit priority or send the UI sentinel
`"none"`; the database stores `null` and the API returns the documented wire
representation consistently.

**Acceptance criteria:**

- [ ] Global composer and Task Workspace quick-add return 201 by default.
- [ ] `"none"`, omitted, and `null` inputs follow the documented mapping.
- [ ] Low/medium/high remain unchanged.
- [ ] Create, clear priority, reload, complete, and delete all round-trip.
- [ ] Validation failure rolls back optimistic UI without a ghost task.

**Test/evidence:** Zod/Supertest cases, frontend hook test, real-DB integration,
and one Playwright round-trip.

---

#### TASK-002 — Make browser task creation retry-safe

**Type:** Reliability story  
**Priority:** P1  
**Owner:** Full stack  
**Estimate:** 3 points  
**Status:** Open; backend capability exists but browser does not use it  
**Depends on:** TASK-001

**Requirement:** A browser retry after response loss must not create a duplicate
task.

**Acceptance criteria:**

- [ ] Each user action creates one stable `clientCommandId` retained across
  retries.
- [ ] Replaying a command returns the original task.
- [ ] Two distinct user actions create two tasks.

---

#### FOCUS-001 — Prove Focus start, recovery, and exactly-once completion

**Type:** Full-stack story  
**Priority:** P0  
**Owner:** Full stack  
**Estimate:** 5 points  
**Status:** Blocked by DB-001  
**Depends on:** DB-001, QA-001

**Requirement:** A Pomo or Stopwatch session must survive reload and complete
into one durable record without duplicate totals.

**Acceptance criteria:**

- [ ] Start returns 201 and exactly one active session exists per user.
- [ ] Pause/resume and browser reload recover the same session and target.
- [ ] Completion is idempotent and creates one Focus record.
- [ ] Dashboard/statistics reflect the record after reload.
- [ ] Invalid or other-user targets are rejected without disclosure.
- [ ] Settings persist and timer expiry uses the saved test duration.

**Test/evidence:** Real PostgreSQL integration plus Playwright critical journey.

---

#### FOCUS-002 — Make session start retry-safe and validate state transitions

**Type:** Reliability story  
**Priority:** P1  
**Owner:** Backend  
**Estimate:** 5 points  
**Status:** Open  
**Depends on:** FOCUS-001

**Requirement:** Lost responses and concurrent tabs must not replace a newly
created session or permit invalid transition sequences.

**Acceptance criteria:**

- [ ] Session start accepts a command ID unique per user.
- [ ] Retrying start returns the original session/start time.
- [ ] Pause only applies to running, resume only to paused, and extend requires
  a bounded positive duration.
- [ ] Concurrent starts preserve the one-active-session invariant.

---

#### VAL-001 — Validate temporal and bounded inputs before Prisma

**Type:** API hardening  
**Priority:** P1  
**Owner:** Backend  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** Invalid task, schedule, reminder, Pomodoro, and Focus dates or
limits must return a field-level 422 rather than a database-driven 500.

**Acceptance criteria:**

- [ ] All timestamps are valid ISO instants where required.
- [ ] Scheduled end is not earlier than start.
- [ ] Time zone semantics and query limits are documented and bounded.
- [ ] Invalid dates never reach Prisma.

---

#### MUT-001 — Make optimistic mutations truthful on HTTP failure

**Type:** Frontend/API reliability  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** Every frontend mutation must reject a non-2xx response through
one API error contract so optimistic state can roll back. Task and Habit delete
currently do not inspect `response.ok`, allowing 401/404/500 to look successful.

**Acceptance criteria:**

- [ ] Task/Habit create, update, check-in, and delete reject every non-2xx.
- [ ] Optimistic state rolls back for 401, 409, 422, and 500 without ghost data.
- [ ] 401 enters the common session-recovery path.
- [ ] Recoverable failures show an actionable message and safe retry.
- [ ] Contract tests force each failure class.

---

#### FOCUS-003 — Distinguish Focus failure from an empty day

**Type:** Resilience/UX story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 3 points  
**Status:** Open

**Requirement:** A failed Focus dashboard, settings, records, or statistics
request must never render as zero sessions or empty history.

**Acceptance criteria:**

- [ ] Loading, legitimate empty, and server-error states are distinct.
- [ ] Error state has Retry and retains any recoverable active-session context.
- [ ] A 500 cannot display a misleading zero total.
- [ ] Browser test covers 500, retry, success, and active-session refresh.

### Domain D — Daily loop

#### RITUAL-001 — Implement persistent Morning Plan and Shutdown state

**Type:** Full-stack capability  
**Priority:** P0 if Plan/Shutdown stay visible; otherwise hide both  
**Owner:** Backend + Frontend  
**Estimate:** 8 points  
**Status:** Missing backend capability

**Requirement:** Provide a user/date-unique ritual model and authenticated,
validated read/upsert contract. Reads and writes must not silently disagree
about local fallback behavior.

**Acceptance criteria:**

- [ ] `GET /api/rituals?date=YYYY-MM-DD` returns that user's state or a defined
  empty representation.
- [ ] Save/upsert is idempotent and date-unique.
- [ ] State survives reload and another device.
- [ ] Invalid dates/decisions return 422.
- [ ] User B cannot read or write User A's ritual.
- [ ] If deferred, routes and navigation for Plan/Shutdown are hidden together.

**Test/evidence:** Supertest ownership, real-DB uniqueness, and Playwright save/
reload journey.

---

#### RITUAL-002 — Make Close the Day atomic

**Type:** Transaction/reliability story  
**Priority:** P0 if Shutdown stays visible  
**Owner:** Backend + Frontend  
**Estimate:** 8 points  
**Status:** Open  
**Depends on:** RITUAL-001

**Requirement:** Task decisions and `shutdownCompleted` must commit as one
server-side command, not a series of client writes followed by best-effort
rollback.

**Acceptance criteria:**

- [ ] One authenticated close-day command validates all decisions first.
- [ ] One database transaction applies all decisions and ritual completion.
- [ ] Any failure leaves every task and ritual unchanged.
- [ ] A command ID makes retry after response loss exactly-once.
- [ ] Concurrent close requests converge on one outcome.

### Domain E — Integrations and optional capabilities

#### OAUTH-001 — Align Google OAuth initiation and callback ownership

**Type:** Full-stack integration  
**Priority:** P0 if Google is offered during onboarding; otherwise P1  
**Owner:** Full stack/Integrations  
**Estimate:** 5 points  
**Status:** Contract mismatch

**Requirement:** Choose one initiation contract:

- API returns `{url}` and the frontend fetches it before navigating; or
- API responds with a redirect and the frontend navigates directly.

Callback ownership must likewise be singular: Google returns to the backend,
which exchanges tokens and redirects to the frontend, or to a frontend callback
that explicitly calls a JSON backend. Do not keep both models.

**Acceptance criteria:**

- [ ] Onboarding and Settings use the same initiation helper.
- [ ] Clicking Connect reaches the Google consent URL, not a JSON document.
- [ ] Reconnect uses the configured API origin, not a frontend-relative `/api`
  path.
- [ ] State is single-use, user-bound, expiring, and replay-safe.
- [ ] Success, cancellation, denial, expired state, and provider failure return
  to Settings with explicit non-destructive status.
- [ ] Connected account appears and sync status is observable.
- [ ] Backend redirect uses the Settings query key the frontend actually reads
  (`section`, not a parallel `tab` contract).
- [ ] The unused/conflicting frontend callback is removed unless the selected
  architecture explicitly owns the provider callback there.

**Test/evidence:** Provider-mocked integration on PR; one manual/synthetic
staging OAuth check. Do not make live Google consent a per-PR dependency.

---

#### CHAT-001 — Implement one Chat contract or hide Chat

**Type:** Product decision + full-stack contract  
**Priority:** P1; P0 only if Chat is in the release promise  
**Owner:** Product + Full stack  
**Estimate:** 2 points to hide, 8+ to implement  
**Status:** Broken contract

**Requirement:** The current frontend sends a `messages` history and parses
newline-delimited chunks, while the backend expects one `message`, returns JSON,
and exposes a different sessions-list shape. Select and document one contract.

**Acceptance criteria if implemented:**

- [ ] Request/response and streaming media type are documented and shared.
- [ ] Sessions list shape agrees (`array` or `{sessions}`, not both).
- [ ] Appending a turn retains all earlier turns after refresh; the backend does
  not replace full history with only the newest pair.
- [ ] History persistence is ordered, user-scoped, and retry-safe.
- [ ] Missing AI provider returns an explicit unavailable state, not a fake 200.
- [ ] Loading, cancellation, rate-limit, provider error, and retry are visible.

**Acceptance criteria if deferred:**

- [ ] Chat is removed from navigation, onboarding promises, and route preload.
- [ ] Placeholder endpoint returns 501/503 or is not mounted.

---

#### CAP-001 — Quarantine incomplete collaboration, MCP, and public stubs

**Type:** Product/security decision  
**Priority:** P1  
**Owner:** Product + Security + Backend  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** An incomplete capability must not appear production-ready.

**Acceptance criteria:**

- [ ] Collaboration either gains tested owner/collaborator ACLs and invitation
  lifecycle or is removed from the release UI.
- [ ] MCP either gains hashed/scoped/rotatable API-key authentication and a real
  endpoint or is hidden.
- [ ] Alexa/posthook/public placeholders are disabled until signature and replay
  protection exist.
- [ ] Unreleased endpoints return 501/503, not a success status with error text.

---

#### SET-001 — Classify account-synced, device-local, and unsupported settings

**Type:** Product-contract cleanup  
**Priority:** P2  
**Owner:** Product + Full stack  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** Settings copy must not imply account persistence where the
value is local-only or not saved. This includes onboarding priorities, theme,
timezone, and placeholder collaboration controls.

**Acceptance criteria:**

- [ ] Every setting is labeled/documented as account-synced or device-local.
- [ ] Account-synced values survive a fresh browser context.
- [ ] User timezone is editable/persisted and used for Agenda/Focus day bounds,
  or is explicitly device-derived with a documented change rule.
- [ ] Unsupported settings are removed from primary navigation.
- [ ] Direct third-party browser calls such as weather have an explicit privacy,
  CORS, timeout, and unavailable-state decision.

### Domain F — Quality and operations

#### QA-001 — Build a hermetic full-stack test environment

**Type:** Test infrastructure  
**Priority:** P0  
**Owner:** QA/Platform  
**Estimate:** 8 points  
**Status:** Open

**Requirement:** Full-stack tests must run against a built frontend, real local
API, and ephemeral PostgreSQL database, and must refuse to target a hosted or
production environment.

**Scope:**

- Add `.env.e2e` with allowlisted local/ephemeral hosts and no `DEV_USER_ID`.
- Start PostgreSQL, run every migration from zero, seed only canonical fixtures,
  start API, wait for `/ready`, and start the built frontend preview.
- Create unique per-worker users and reusable authenticated `storageState` for
  non-auth specs.
- Dispose the per-run database/schema; never clean production data.
- Pin/install the Playwright browser binary.

**Acceptance criteria:**

- [ ] Test startup aborts before mutation if API or DB host is not allowlisted.
- [ ] No test depends on execution order or a manually running service.
- [ ] Migrations run from empty on every CI job.
- [ ] Frontend/API logs and Playwright traces are retained on failure.

---

#### QA-002 — Reclassify and de-flake the existing Playwright suite

**Type:** Test-quality story  
**Priority:** P0  
**Owner:** QA/Frontend  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** Browser tests must be labeled as `component/browser-mocked`,
`full-stack`, or `deployment`; a passing assertion must prove the named
behavior.

**Acceptance criteria:**

- [ ] Conditional `if visible`, `.catch(() => false)`, `>= 0`, and placeholder
  assertions are removed or explicitly skipped by capability flag.
- [ ] Fixed sleeps and blanket `networkidle` are replaced with response or
  web-first state synchronization.
- [ ] The nonexistent `/updates` case and other 404-as-success cases are removed.
- [ ] Protected-route tests authenticate or deliberately mock `/api/auth/me`.
- [ ] Each spec has deterministic data and role/label/test-id locators.

---

#### QA-101 — Add the critical new-user Playwright journey

**Type:** Release acceptance test  
**Priority:** P0  
**Owner:** QA/Full stack  
**Estimate:** 5 points  
**Status:** Open  
**Depends on:** QA-001, ONB-001, TASK-001, FOCUS-001

**Scenario:**

1. Sign up a unique user through the UI and assert the response/session.
2. Complete onboarding using the no-Google path.
3. Refresh `/today` and remain authenticated.
4. Create a task using default no-priority behavior and verify after reload.
5. Run a short test Pomo, complete it, and verify exactly one durable record.
6. Log out; protected access redirects to Login.
7. Log back in and verify the task/Focus history remains.

**Acceptance criteria:**

- [ ] No unexpected 404, 401, 422, or 5xx occurs.
- [ ] Every mutation is asserted at both response and persisted UI level.
- [ ] Console/page errors fail the test.

---

#### QA-102 — Add real-PostgreSQL contract coverage

**Type:** Integration-test story  
**Priority:** P0  
**Owner:** Backend/QA  
**Estimate:** 5 points  
**Status:** Open  
**Depends on:** QA-001

**Requirement:** Detect schema/migration drift below the browser layer.

**Acceptance criteria:**

- [ ] Test job runs migrations from empty and validates the resulting schema.
- [ ] It covers signup/profile write, task `none -> null`, Focus start/complete/
  idempotency, and ritual uniqueness when implemented.
- [ ] At least one drifted Focus fixture proves the corrective path.
- [ ] Prisma is not mocked in this job.

---

#### QA-201 — Install sustainable CI and deployment gates

**Type:** CI/operations  
**Priority:** P1  
**Owner:** Platform/QA  
**Estimate:** 5 points  
**Status:** Open; no checked-in workflow currently exists  
**Depends on:** QA-001, QA-002, QA-101, QA-102

**Required PR gates:**

- frontend lint, typecheck, unit tests, and production build;
- backend typecheck, Prisma validate, unit/Supertest tests;
- real-PostgreSQL migration/integration job; and
- critical desktop Chromium full-stack Playwright tests.

**Nightly:** Wider browser-mocked suite, critical Firefox/WebKit, and one mobile
viewport. Do not run every UI assertion across every viewport on every PR.

**Acceptance criteria:**

- [ ] Required checks block merge.
- [ ] Playwright version/browser is pinned and installed in CI.
- [ ] Retries are visible; flaky retries fail or quarantine the test with an
  owner and deadline.
- [ ] JUnit/HTML report, traces, screenshots, and server logs are uploaded.
- [ ] Post-deploy HTTPS staging smoke covers cookie/CORS/CSRF and core journey.

---

#### OPS-001 — Standardize API failure and proxy behavior

**Type:** Operational hardening  
**Priority:** P1  
**Owner:** Backend/Platform  
**Estimate:** 5 points  
**Status:** Open

**Requirement:** Production proxy, rate-limit, 404, validation, conflict, and
internal-error behavior must be predictable and observable.

**Acceptance criteria:**

- [ ] Trusted proxy hops are configured explicitly and tested against spoofing.
- [ ] Two real client IPs receive independent limits behind the proxy.
- [ ] Unknown API routes return the standard JSON 404 envelope.
- [ ] Prisma uniqueness/FK/value failures map to stable 409/422 responses.
- [ ] Error envelopes include a request ID but no secret/user content.

## 6. Sprint plan

### Sprint 0 — Containment and honest test foundation (2–3 days)

**Goal:** Make further execution safe and make false-green tests impossible.

| Ticket | Points | Parallel lane |
| --- | ---: | --- |
| SEC-001 | 5 | Release/Security |
| DB-001 | 5 | Backend/DB after safe access |
| QA-001 | 8 | QA/Platform |
| QA-002 | 5 | QA/Frontend |
| REL-001 | 3 | Release |

**Exit gate:** No tracked usable secrets; ephemeral-DB harness works; Focus
migration converges; no production/hosted API can be mutated by local E2E.

### Sprint 1 — Core first-success journey (5 working days)

**Goal:** Prove signup through one completed Focus session.

| Ticket | Points | Parallel lane |
| --- | ---: | --- |
| ONB-001 | 5 | Full stack |
| AUTH-001 | 3 | Full stack/staging |
| TASK-001 | 3 | Full stack |
| FOCUS-001 | 5 | Full stack |
| MUT-001 | 5 | Frontend |
| FOCUS-003 | 3 | Frontend |
| QA-101 | 5 | QA after contracts land |
| QA-102 | 5 | Backend/QA |

**Exit gate:** Critical new-user journey passes locally against real PostgreSQL
and in HTTPS staging; production network has no unexpected core-flow 4xx/5xx.

### Sprint 2 — Complete or narrow the product promise (5 working days)

**Goal:** Make each visible non-core surface real or deliberately unavailable.

| Ticket | Points | Parallel lane |
| --- | ---: | --- |
| RITUAL-001 | 8 | Backend + frontend |
| RITUAL-002 | 8 | Backend + frontend; follows RITUAL-001 |
| OAUTH-001 | 5 | Integrations |
| CHAT-001 | 2 or 8+ | Product decision, then implementation/hide |
| CAP-001 | 5 | Product/Security |

**Exit gate:** Morning/Shutdown, Google, Chat, collaboration, and MCP are each
either end-to-end usable with tests or absent from the release UI and promises.

### Sprint 3 — Reliability and sustainable release gates (5 working days)

**Goal:** Make correct behavior resilient to retries, malformed input, proxying,
and future changes.

| Ticket | Points | Parallel lane |
| --- | ---: | --- |
| TASK-002 | 3 | Full stack |
| FOCUS-002 | 5 | Backend |
| VAL-001 | 5 | Backend |
| AUTH-002 | 3 | Backend/Security |
| AUTH-003 | 8 | Identity, if required for public launch |
| OPS-001 | 5 | Backend/Platform |
| QA-201 | 5 | QA/Platform |
| SET-001 | 5 | Product/full stack |

**Exit gate:** Required CI checks block regressions; retry and failure cases are
deterministic; post-deploy smoke is part of the release runbook.

## 7. Playwright decision

**Yes, Playwright is required**, but only for risks that need a real browser.
It should not replace backend or migration tests.

| Risk | Correct primary layer |
| --- | --- |
| Validation mapping, ownership, status/error schema | Supertest/API tests |
| Migration correctness, constraints, transactions | Real PostgreSQL integration |
| Hook state and optimistic rollback | Vitest + MSW/component |
| Cookie storage, CORS, CSRF, redirects, refresh recovery | Playwright full-stack/staging |
| Visual/responsive interaction | Browser-mocked Playwright |
| Google provider consent | Provider-mocked integration + small staging check |

### PR Playwright scope

Run a compact `@critical` desktop Chromium set:

1. New-user core journey (QA-101).
2. Returning-user deep-link/login/logout journey.
3. Task no-priority round-trip and optimistic-error recovery.
4. Focus reload/recovery/exactly-once completion.
5. Ritual save/close-day journey when those surfaces ship.

### Staging-only scope

- HTTPS cross-origin cookie attributes and credentialed requests.
- Allowed/disallowed Origin behavior for writes.
- Google OAuth success/cancel/reconnect using a test account.
- No unexpected 404/5xx on release surfaces.

### Existing-suite correction

The current Playwright configuration starts only Vite, has no standard npm E2E
script or checked-in CI gate, and expands roughly 200 cases across three
projects. Many tests use sleeps or conditional assertions. It is useful as a UI
inventory, but it is not evidence that the full stack works. Keep the broad UI
suite nightly; make the small hermetic full-stack suite the PR release gate.

## 8. Ownership and execution rules

- One ticket owns one failure class. Adjacent findings become separate tickets.
- No two agents edit the same contract/schema file concurrently.
- Contract owner publishes method/path/request/response/error examples before UI
  and backend implementation diverge.
- Database changes require migration tests before deployment.
- Product decides “implement or hide” before engineering expands optional
  placeholders.
- The human release owner holds commits/deployments until literal frontend,
  backend, migration, Playwright, and staging outputs are reviewed.

## 9. Release scorecard

The release is ready only when every row is green:

| Gate | Required proof |
| --- | --- |
| Secrets | Rotation complete; secret scan clean |
| Schema | Empty + drifted migration tests; live diff empty |
| Auth | HTTPS staging signup/login/refresh/logout/CORS/CSRF |
| Onboarding | Persisted completion and skip-Google path |
| Task | Default task create/reload/complete/delete |
| Focus | Start/reload/complete/exactly-one record |
| Optional surfaces | Each complete and tested, or hidden |
| CI | Required checks block merge and retain artifacts |
| Deployment | Versioned smoke evidence and rollback owner |
