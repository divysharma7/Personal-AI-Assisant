# Skill Audit Roadmap

Status of all 15 skills audited/applied to LAIF.

## Completed ✅

| # | Skill | Status | What was done |
|---|-------|--------|---------------|
| 1 | `design-system` | ✅ Done | Visual audit (78/100), color/spacing/typography consistency |
| 2 | `frontend-design-direction` | ✅ Done | Product-specific design judgment across all screens |
| 3 | `frontend-patterns` | ✅ Done | React patterns audit — memo, unstable refs, redundant state |
| 4 | `make-interfaces-feel-better` | ✅ Done | Hit areas, tabular-nums, transition:all, concentric radius, aria-labels |
| 5 | `motion-foundations` | ✅ Done | Token compliance, spring compliance, useReducedMotion on 5 components |
| 6 | `motion-advanced` | ✅ Done | DragOverlay springs, exit<enter timing, stagger audit |
| 7 | `click-path-audit` | ✅ Done | 5 bugs found and fixed (reminders stripped, habit edit duplicate, etc.) |
| 8 | `error-handling` | ✅ Done | AppError hierarchy, Result pattern, handleApiError, getUserMessage |
| 9 | `tdd-workflow` | ✅ Done | 238 unit tests, regression tests for all 5 bugs found |
| 10 | `e2e-testing` | ✅ Done | 43 Playwright scenarios (inbox, settings, workflows, navigation) |
| 11 | `motion-ui` | ✅ Done (via motion-foundations + motion-advanced) | Combined into the motion audit pass |
| 12 | `motion-patterns` | ✅ Done (via motion-foundations) | Patterns checked during motion audit |
| 13 | `coding-standards` | ✅ Done (via simplify skill) | Code reuse, quality, efficiency audit |
| 14 | `accessibility` | ✅ Done (via make-interfaces-feel-better) | Hit areas, aria-labels, focus states, touch targets |

## Saved for Future Sessions

| # | Skill | Priority | What it would do |
|---|-------|----------|-----------------|
| 15 | `liquid-glass-design` | Low | iOS 26 glass effects — not applicable to web app |
| 16 | `nextjs-turbopack` | Medium | Optimize dev startup, Turbopack config, bundle analysis |
| 17 | `api-design` | Medium | REST conventions audit, pagination, rate limiting, versioning |
| 18 | `architecture-decision-records` | Low | Create docs/adr/ with key decisions from this session |
| 19 | `codebase-onboarding` | Low | Generate onboarding guide for new developers |
| 20 | `code-tour` | Low | Create .tours/ walkthroughs for key flows |
| 21 | `regex-vs-llm` | Low | Not applicable — no structured text parsing in this app |
| 22 | `agent-eval` | Low | Compare coding agents — not applicable to app code |
| 23 | `ai-regression-testing` | Medium | Sandbox-mode API testing, AI blind spot detection |
