# Product Requirements Document
## Project Chronos — Unified Calendar & Task Management

| Field | Value |
|---|---|
| **Document Status** | Draft v1.0 |
| **Last Updated** | May 21, 2026 |
| **Owner** | Product Management |
| **Target Release** | Q4 2026 (MVP), Q2 2027 (GA) |

---

## Vision

Chronos is a productivity application that fuses task management and calendar scheduling into a single, drag-and-drop workspace. Users plan, time-block, execute, and reflect in one continuous canvas.

Benchmarked against TickTick. Aims to surpass on: (1) cross-platform parity, (2) two-way external calendar sync, (3) intelligent scheduling assistance.

## Core Principle

A task and a calendar event are the same underlying object. A task gains "calendar presence" when it acquires a start time + duration.

- No date → lives only in lists
- Date but no time → all-day band
- Date + time → block on timeline
- Date + time + duration → sized block

## Target Personas

1. **Priya** (Senior SWE, Bangalore) — "Show me what's left after meetings"
2. **Marcus** (PhD candidate, Berlin) — "Help me impose structure on unstructured time"
3. **Elena** (Solopreneur, SF) — "Bring client commitments and to-do list into one view"

## Success Metrics

- 60% of new users time-block at least 1 task within 7 days
- 50%+ DAU/MAU ratio
- 5% free-to-Premium conversion within 12 months
- <0.1% sync error rate

## Release Plan

| Milestone | Target | Scope |
|---|---|---|
| Alpha | Aug 2026 | Day + Week views, Google sync (read), drag-to-schedule |
| Closed Beta | Oct 2026 | + Month/Year/Agenda, Outlook sync, Pomodoro, habits |
| MVP | Dec 2026 | + Two-way sync, recurrence, reminders, Premium |
| GA v1.0 | Mar 2027 | + Grid/Timeline views, Smart Lists, full polish |
| v2.0 | Q4 2027 | AI scheduling assist, team features |

See full PRD in conversation context for complete functional requirements, technical architecture, and competitive analysis.
