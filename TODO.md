# LAIF deferred work

Updated July 29, 2026.

## High priority

1. Add Zod validation to every remaining write route.
2. Add focused integration tests for the 14 AI chat tool functions.
3. Implement or explicitly remove the notification delivery product; reminder
   delivery is not currently a complete end-to-end feature.
4. Run an authenticated production browser journey for signup/login, task CRUD,
   habit check-in, and logout after every deployment affecting auth or CORS.

## Performance

1. Split the approximately 940 KB main frontend bundle into route/vendor chunks.
2. Measure initial-load JavaScript and the slowest production interactions
   before choosing further optimizations.

## Code quality

Resolve the remaining React hook warnings:

- focus audio cleanup captures a mutable ref
- Profile settings recreates `now` for a memo dependency
- Today callback omits `stableNow`
- Calendar task editor callback omits `reminders`

## Product decisions

1. Decide whether the legacy `KanbanSection` API should be retired in favor of
   workflow columns.
2. Decide whether push-subscription storage remains useful without a delivery
   service.
