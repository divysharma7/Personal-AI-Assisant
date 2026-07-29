# Life OS Google Calendar inbound sync contract

Status: LOS-402 contract published on 2026-07-29.

## Manual sync

`POST /api/integrations/google/sync`

```json
{
  "accountId": "calendar-account-id"
}
```

The account must belong to the authenticated user and must not be disconnected.

Success:

```json
{
  "ok": true,
  "state": "healthy",
  "alreadyRunning": false,
  "calendarsDiscovered": 4,
  "calendarsSynced": 4,
  "eventsUpserted": 18,
  "eventsDeleted": 2,
  "failures": []
}
```

If another worker owns the account lock, the request succeeds with
`alreadyRunning: true` and `state: syncing`.

A partial provider failure returns `state: delayed` and identifies failed
calendar IDs in `failures`. It does not roll back calendars that completed.

## Inventory discovery

- Google CalendarList pages are fully traversed.
- Inventory upserts by `(accountId, providerCalendarId)`.
- Provider metadata updates never overwrite user active/passive, visibility,
  order, color override, or default-write choices.
- Calendars no longer returned by Google become hidden and stop affecting
  Agenda.
- New primary/selected calendars default to Active. Other calendars default to
  Passive.
- The first writable primary calendar becomes the default write target when the
  user has no current default.

## Event synchronization

Initial sync uses a bounded window:

- 90 days before the sync time.
- 365 days after the sync time.

After the last page, the provider sync token is stored on the calendar.
Incremental sync reuses that token and the same expansion mode without sending
the initial date window.

Cached events upsert by:

`(accountId, providerCalendarId, providerEventId)`

Cancelled provider events are deleted from the local cache. Provider data is
never deleted by inbound sync.

If Google invalidates a sync token, Life OS clears only that calendar's token
and repeats a bounded initial sync. Existing cache rows are updated
idempotently.

## Credentials and locking

- Tokens are decrypted only inside the sync service.
- Google access-token refresh occurs before provider reads.
- A refreshed access token is encrypted before persistence.
- A database account lock prevents overlapping workers across application
  instances and permits stale-lock recovery.
- Authentication failures set `needs_attention` and `reconnectRequired=true`.
- Temporary or partial provider failures set `delayed`.

## Polling

The backend scheduler periodically selects connected accounts that are due and
calls the same locked sync service. Manual and scheduled sync therefore share
identical behavior.

