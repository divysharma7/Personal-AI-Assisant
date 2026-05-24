# LAIF Security Audit

> Date: 2026-05-24
> Scope: OWASP-aligned checklist against auth, Alexa, sensitive routes, CORS, rate limiting
> Status: Findings #1-#4 and #6 FIXED on 2026-05-24. Remaining items open.

## Findings Summary

| # | Finding | Severity | File:Line | Recommended Fix |
|---|---------|----------|-----------|-----------------|
| 1 | **Alexa: No cryptographic signature verification** | CRITICAL | `src/app/api/alexa/route.ts:10-37` | Validate the `Signature` header against Amazon's certificate chain using `ask-sdk-core` or manual RSA verification. URL check alone is insufficient — attacker can forge requests with correct URL format. |
| 2 | **Alexa: Validation skipped in development** | HIGH | `src/app/api/alexa/route.ts:44` | `validateAlexaRequest` only runs when `NODE_ENV === 'production'`. Any dev/staging environment accepts forged requests. Remove the guard or use a feature flag. |
| 3 | **Alexa: No Application ID verification** | HIGH | `src/app/api/alexa/route.ts:39-49` | Never checks `body.session.application.applicationId` against expected Skill ID. Any Alexa skill (or forged request) can hit this endpoint. |
| 4 | **Alexa: No userId scoping** | HIGH | `src/lib/alexa/intentHandlers.ts` (all handlers) | Intent handlers (AddTask, CompleteTask, LogHabit, etc.) operate without userId. Any request creates/modifies data for the hardcoded/default user. |
| 5 | **No rate limiting anywhere** | HIGH | Entire codebase | Zero rate limiting on any endpoint. Login brute-force, signup spam, chat API abuse (OpenRouter token burn), and Alexa spam are all unthrottled. |
| 6 | **DELETE routes missing userId filter** | HIGH | `contacts/[id]/route.ts:25`, `memories/[id]/route.ts:45`, `notes/[id]/route.ts:23`, `tasks/[id]/route.ts:128`, `habits/[id]/route.ts:34` | 5 DELETE routes use `findByIdAndDelete(params.id)` without userId filter. Any authenticated user can delete any other user's data by guessing the MongoDB ObjectId. |
| 7 | **MCP GET endpoint exposes tool schema without auth** | MEDIUM | `src/app/api/mcp/route.ts:58-66` | `GET /api/mcp` lists all tool names, descriptions, and parameter schemas to unauthenticated callers. Information disclosure — helps attackers craft valid tool calls. |
| 8 | **JWT cookie: sameSite=lax instead of strict** | MEDIUM | `src/app/api/auth/login/route.ts:44`, `signup/route.ts:46` | `sameSite: 'lax'` allows cookies on top-level GET navigations from external sites. Use `'strict'` unless Google Calendar OAuth redirect requires `'lax'` — verify before changing. |
| 9 | **No CORS configuration** | MEDIUM | `src/middleware.ts` (absent) | No `Access-Control-Allow-Origin` headers set. Next.js defaults to same-origin for API routes, but MCP and Alexa endpoints are designed for cross-origin use. Explicit CORS policy needed. |
| 10 | **No security headers (CSP, X-Frame-Options, HSTS)** | MEDIUM | `next.config.js` or `middleware.ts` (absent) | No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Strict-Transport-Security headers. App is frameable (clickjacking) and has no script source restrictions. |
| 11 | **Signup: weak password policy** | MEDIUM | `src/app/api/auth/signup/route.ts:25-27` | Only checks `password.length < 6`. No complexity requirements (uppercase, number, special char). No breach/dictionary check. |
| 12 | **No token rotation or refresh mechanism** | MEDIUM | `src/lib/auth.ts:7` | JWT has 24h expiry with no refresh token. User must re-login every 24h. No token rotation on sensitive actions (password change, etc.). |
| 13 | **x-api-key treated as JWT** | MEDIUM | `src/middleware.ts:49-52` | `resolveToken` accepts `x-api-key` header and passes it directly to `jwtVerify`. The MCP API key (stored in `User.mcpApiKey`) is a separate credential — if it's not a valid JWT, this silently fails. If it IS a JWT, it bypasses the intended MCP auth flow in `/api/mcp`. |
| 14 | **Chat input sanitization incomplete** | LOW | `src/app/api/chat/route.ts:42-45` | `sanitizeUserMsg` strips `<tool_call>` tags but doesn't sanitize other prompt injection vectors. Mitigated by per-tool arg sanitization but defense-in-depth is missing. |
| 15 | **Hardcoded DEV_USER_ID** | LOW | `src/lib/auth.ts:34` | ObjectId `6a0ace89bbece9a4ac3e81c9` is hardcoded. Safe because gated by NODE_ENV, but if this value leaks (e.g., in client bundle or error message), an attacker knows a valid user ID. |
| 16 | **Logout doesn't invalidate token server-side** | LOW | `src/app/api/auth/logout/route.ts:8` | Logout clears the cookie but the JWT remains valid until expiry. No server-side token revocation list. An attacker with a stolen token can use it for up to 24h after logout. |

## Detail by Area

### 1. Alexa Route (`/api/alexa`)

The route has three layers of validation, **all incomplete**:

- **Certificate URL check** (line 11-25): Only validates the URL format (`https://s3.amazonaws.com/echo.api/...`). Does NOT download the certificate, verify the chain, or validate the RSA signature on the request body. An attacker can send any request with a correctly formatted `signaturecertchainurl` header and pass this check.
- **Timestamp check** (line 28-34): Correctly rejects requests older than 150 seconds. But only runs if `timestamp` is present — omitting it bypasses the check.
- **Application ID check**: Missing entirely. Amazon requires verifying `body.session.application.applicationId` matches your registered Skill ID.

**The Alexa endpoint is effectively unauthenticated.** Any HTTP client can POST intent requests and create tasks, complete tasks, log habits, or get a daily briefing for the default user.

### 2. JWT Auth (`src/lib/auth.ts`)

| Aspect | Status | Notes |
|--------|--------|-------|
| Algorithm | OK | HS256 via jose — no algorithm confusion |
| Secret | OK | From env var, validated at module load |
| Expiry | OK | 24h — reasonable |
| httpOnly | OK | Set on login and signup |
| secure | OK | Conditional on production |
| sameSite | WARN | `'lax'` — should be `'strict'` unless OAuth requires it |
| Refresh | MISSING | No refresh tokens, no rotation |
| Revocation | MISSING | No server-side invalidation on logout |
| Dev fallback | OK | Gated by NODE_ENV === 'development' |

### 3. Sensitive DELETE Routes Missing userId

Five routes delete documents by `_id` alone — no ownership check:

| Route | Model | Risk |
|-------|-------|------|
| `DELETE /api/contacts/[id]` | Contact | Any user deletes any contact |
| `DELETE /api/memories/[id]` | Memory | Any user deletes any memory |
| `DELETE /api/notes/[id]` | Note | Any user deletes any note |
| `DELETE /api/tasks/[id]` | Task | Any user deletes any task |
| `DELETE /api/habits/[id]` | Habit (legacy) | Any user deletes any habit |

Same pattern as the P0-1 Event/Reminder fix — these were missed because they weren't in the original scope.

### 4. CORS

No CORS configuration exists. Next.js API routes default to same-origin, which blocks cross-origin browser requests. However:
- `/api/alexa` needs cross-origin access from Amazon
- `/api/mcp` needs cross-origin access from Claude Desktop
- Both currently work because they're server-to-server (no browser CORS enforcement), but explicit policy should be set.

### 5. Rate Limiting

Zero rate limiting anywhere in the codebase. No middleware, no per-route limits, no login attempt tracking.

**High-risk unthrottled endpoints:**
- `POST /api/auth/login` — brute-force password guessing
- `POST /api/auth/signup` — account spam
- `POST /api/chat` — burns OpenRouter API tokens (cost attack)
- `POST /api/alexa` — intent spam

## Priority Fix Order

```
1. CRITICAL  — Alexa signature verification         ✅ FIXED: route disabled (returns 404)
2. HIGH      — Add userId filter to 5 DELETE routes  ✅ FIXED: contacts, memories, notes, tasks, habits
3. HIGH      — Rate limiting on login/signup/chat    ⏳ OPEN — deploy gate for week 2
4. HIGH      — Alexa App ID + userId scoping         ✅ FIXED: route disabled entirely
5. MEDIUM    — Security headers                      ⏳ OPEN
6. MEDIUM    — sameSite=strict on cookies             ⏳ OPEN
7. MEDIUM    — Explicit CORS policy                  ⏳ OPEN
8. LOW       — Token rotation / refresh              ⏳ OPEN
```

## P0-3 Inventory: UPDATE routes using findByIdAndUpdate without userId

The following routes use `findByIdAndUpdate` with `_id` only — same bug class as the DELETE fixes above. These need `findOneAndUpdate({ _id, userId })` in a future session:

| Route | Operation | Risk |
|-------|-----------|------|
| `api/tasks/[id]/schedule/route.ts:48,80` | Schedule/unschedule task | Any user can schedule any task |
| `api/tasks/[id]/unschedule/route.ts:26` | Unschedule task | Same |
| `api/tasks/[id]/indent/route.ts:54` | Indent task | Any user can nest any task |
| `api/tasks/[id]/outdent/route.ts:58` | Outdent task | Same |
| `api/tasks/[id]/reparent/route.ts:70` | Reparent task | Same |
| `api/tasks/reorder/route.ts:27` | Reorder tasks | Any user can reorder any task |
| `api/pomodoro/[id]/route.ts:12` | Update pomodoro session | Any user can modify any session |
| `api/focus/sessions/[id]/route.ts:122,134,167` | Update focus session + linked task | Any user can modify any session |
| `api/habits/[id]/checkin/route.ts:74` | Check in habit | Any user can check in any habit |
| `api/chat/route.ts:282,455,560` | AI tool updates (updateTask, moveTask, postpone) | Already has userId via getAuthUserId |

**Note**: The `api/chat/route.ts` entries are lower risk because each tool function calls `getAuthUserId()` internally. The user/me and integrations routes update the current user's own document so are also lower risk. The task sub-routes (schedule, indent, outdent, reparent, reorder) and focus/pomodoro are the priority fixes.
