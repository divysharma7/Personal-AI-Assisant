# Life OS Agenda API contract

Status: LOS-202 contract published on 2026-07-29.

This is the integration contract between the Life OS Agenda frontend and the
PostgreSQL backend. The frontend may remove `generateMockAgenda` after consuming
this endpoint.

## Read one day

`GET /api/calendar/agenda?date=YYYY-MM-DD&timeZone=Area/City`

Authentication is required through the existing cookie or bearer token.

### Query parameters

| Field | Required | Description |
| --- | --- | --- |
| `date` | Yes | Valid Gregorian calendar date in `YYYY-MM-DD` form |
| `timeZone` | No | Valid IANA time zone; defaults to the user's saved time zone |

The requested day is interpreted in `timeZone`, not UTC. Items that intersect
the local day are returned, including items that begin on a previous day or end
on the next day.

### Success response

```json
{
  "date": "2026-07-29",
  "timeZone": "Asia/Calcutta",
  "generatedAt": "2026-07-29T06:00:00.000Z",
  "sync": {
    "state": "healthy",
    "lastSuccessfulAt": "2026-07-29T05:58:00.000Z"
  },
  "items": [
    {
      "id": "task-id",
      "kind": "task",
      "title": "Write API contract",
      "start": "2026-07-29T04:30:00.000Z",
      "end": "2026-07-29T05:00:00.000Z",
      "allDay": false,
      "completed": false,
      "source": {
        "type": "lifeos"
      },
      "availability": "busy",
      "color": "#6366f1",
      "actions": ["complete", "focus", "reschedule"]
    }
  ],
  "unscheduledPriorities": [
    {
      "id": "task-id",
      "title": "Review deployment",
      "priority": "high",
      "estimatedMinutes": 60,
      "dueDate": "2026-07-30"
    }
  ]
}
```

### Item contract

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Life OS resource ID used by item actions |
| `kind` | enum | `task`, `habit`, `external_event`, or `focus_session` |
| `title` | string | User-facing title or provider-safe busy label |
| `start` | ISO string or null | UTC instant; render in the selected local zone |
| `end` | ISO string or null | UTC instant; exclusive for all-day provider events |
| `allDay` | boolean | Must not be converted into a timed UTC block |
| `completed` | boolean | Task status, habit check-in, or completed Focus state |
| `source` | object | Always has `type`; external events also include calendar source fields |
| `availability` | enum | `busy` or `free` |
| `color` | string | Presentation hint; never the only kind/source indicator |
| `actions` | string[] | Server-authorized actions that the client may display |

External-event source:

```json
{
  "type": "google",
  "accountId": null,
  "calendarId": "primary",
  "displayName": "Primary"
}
```

`accountId` remains `null` for legacy user-level Google connections. LOS-301
will populate it from the owned calendar-account model without changing this
response shape.

### Sync state

`sync.state` is one of:

- `healthy`
- `delayed`
- `needs_attention`
- `not_connected`

LOS-301/LOS-402 will make this account-aware. Until then, the endpoint reports
the latest legacy external-event sync timestamp and connection flag.

### Ordering

The backend order is deterministic:

1. All-day items.
2. Start time.
3. End time.
4. Kind.
5. ID.

The frontend may split this ordered array into all-day, earlier, and upcoming
presentation groups without changing the contract.

### Errors

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid date or time-zone input |
| 401 | `UNAUTHORIZED` or legacy unauthorized body | Missing or invalid session |
| 404 | `NOT_FOUND` | Authenticated user no longer exists |
| 500 | `INTERNAL_ERROR` | Unexpected server failure |

## Active/passive transition

The stable rule is:

- Active calendars appear in Agenda and are busy.
- Passive calendars do not appear in Agenda and are free.

The current PostgreSQL foundation does not yet have owned account/calendar
inventory rows. Until LOS-301 lands, existing external events are treated as
active for backward compatibility. LOS-301 adds the filtering relation; it must
not change this endpoint's public JSON shape.

## Frontend replacement notes

- Replace `generateMockAgenda(selectedDate)` with a query using `selectedDate`
  and `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Keep the current `AgendaResponse`, `AgendaItem`, and `UnscheduledTask` shapes;
  they match this contract.
- Do not convert returned ISO timestamps into local, zone-less strings.
- Refetch this query after task schedule, unschedule, complete, habit check-in,
  Focus completion, calendar group change, or successful provider sync.
- Keep the current cached-data error state while a refetch is failing.

