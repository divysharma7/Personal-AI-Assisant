# Life OS calendar inventory API contract

Status: LOS-301 contract published on 2026-07-29.

These authenticated endpoints replace the account and calendar mocks used by
Settings. They are mounted under both `/api` and `/api/v1`.

## Connected accounts

`GET /api/integrations/google/accounts`

Returns an array matching the account-card UI:

```json
[
  {
    "id": "account-id",
    "email": "person@example.com",
    "displayName": "Person",
    "avatarUrl": "https://example.com/avatar.png",
    "status": "healthy",
    "lastSyncAt": "2026-07-29T05:30:00.000Z",
    "calendars": [
      {
        "id": "calendar-id",
        "name": "Primary",
        "selected": true
      }
    ]
  }
]
```

`status` is `healthy`, `syncing`, `delayed`, or `needs_attention`.
`lastSyncAt` and `avatarUrl` may be `null`.

## Calendar controls

`GET /api/integrations/google/calendars`

```json
[
  {
    "id": "calendar-id",
    "accountId": "account-id",
    "providerCalendarId": "primary",
    "name": "Primary",
    "color": "#4285f4",
    "accountEmail": "person@example.com",
    "accountLabel": "Person",
    "readOnly": false,
    "group": "active",
    "visible": true,
    "order": 0,
    "isDefaultWrite": true
  }
]
```

An active calendar appears in Agenda and affects availability. A passive
calendar is excluded from Agenda and never affects availability.

## Update calendar behavior

`PATCH /api/integrations/google/calendars/:calendarId`

All fields are optional, but at least one must be supplied:

```json
{
  "group": "passive",
  "visible": true,
  "order": 2,
  "color": "#f59e0b",
  "isDefaultWrite": false
}
```

Rules:

- `group: active` sets Agenda inclusion, Calendar visibility, and busy behavior.
- `group: passive` removes Agenda inclusion and busy behavior.
- An active calendar cannot be hidden. Move it to Passive first.
- Only writable calendars on a connected account can be the default.
- Setting a new default clears the previous default for that user atomically.
- Updates are ownership-scoped and return 404 for another user's calendar.

The success response is the updated Calendar control object.

## OAuth persistence

After callback, Google identity and encrypted credentials are upserted by:

`(userId, provider, providerAccountId)`

Reconnecting the same Google identity updates the existing account. Google
profile identity scopes are required so multiple accounts do not collide.
Calendar discovery and event synchronization are LOS-402.

