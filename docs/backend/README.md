# Excurion Backend — Supabase + Netlify

The Virtual Classroom runs a **Supabase-first** backend: managed PostgreSQL,
Auth, Realtime, Storage — with Netlify Functions only for server-side logic
that must not run in the browser.

No Express/Node server exists. No Socket.IO, Prisma, or Redis.

---

## Setup

### 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Install the CLI and link it:

```bash
npm i -D supabase
supabase login
supabase link --project-ref <project-ref>
```

### 2. Apply migrations

```bash
supabase db push
```

or reset locally with seed data:

```bash
supabase db reset   # requires local Docker stack
```

Seed users (after `db reset`):

| email                | password     | role    |
| -------------------- | ------------ | ------- |
| teacher@excurion.dev | password123  | teacher |
| student@excurion.dev | password123  | student |

### 3. Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable                    | Scope    | Where        |
| --------------------------- | -------- | ------------ |
| `VITE_SUPABASE_URL`         | client   | `.env`       |
| `VITE_SUPABASE_ANON_KEY`    | client   | `.env`       |
| `VITE_TLDRAW_LICENSE_KEY`   | client   | `.env`       |
| `SUPABASE_SERVICE_ROLE_KEY` | server   | Netlify env  |

**Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend — it sits only
in Netlify's environment and is read by Netlify Functions.

When `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are missing, the app
automatically falls back to its built-in mock services, so the UI stays
functional while developing without a backend.

---

## Database schema

Migrations: `supabase/migrations/` (numbered, immutable once applied).

| Table                    | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `profiles`               | App profile linked 1:1 to `auth.users`; role here  |
| `rooms`                  | Core collaboration unit (a "class meeting")        |
| `meetings`               | Scheduled sessions of a room (future scheduling)   |
| `meeting_settings`       | Per-room collaboration configuration (1:1 room)    |
| `participants`           | Durable membership + media/last-read state         |
| `messages`               | Persistent chat history (keyset paginated)         |
| `whiteboard_snapshots`   | Durable canvas state per room (1:1 room)           |
| `notifications`          | In-app inbox                                       |

Design notes:

- All PKs are UUIDs; FK relationships via `auth.users`/`profiles`.
- Soft delete (`deleted_at`) on `rooms`.
- `refresh_tokens` is intentionally **not** reimplemented — Supabase Auth
  manages its own token rotation.
- No `sessions` table: presence is ephemeral (Realtime Presence), membership
  is `participants`.

---

## Row Level Security

RLS is enabled on every table (migration `010_rls.sql`). The frontend is
never the enforcement point.

| Operation                     | Rule                                              |
| ----------------------------- | ------------------------------------------------- |
| Read any profile              | any authenticated user                            |
| Update profile                | self only; **role changes rejected** (trigger)    |
| Create room                   | any authenticated user (becomes host)             |
| Read room                     | host, member, or public/unlisted                  |
| Update/delete room            | host only                                         |
| Join room                     | via `join_room(code)` RPC — validates code, open status, privacy, capacity |
| Update participant            | self (media state) or host (roster management)    |
| Messages (read/send)          | active room members only                          |
| Edit message                  | author only; delete: author or host               |
| Whiteboard                    | active room members (persist via RPC)             |
| Notifications                 | owner only (inserts via RPC / server functions)   |
| Storage `avatars`             | public read, owner writes own                     |
| Storage `room-files`/`whiteboard-exports` | active room members (path = `{roomId}/...`) |

Key RPCs (`011_rpc.sql`):

- `create_room(...)` — generates a unique code server-side, inserts host
  participant + default settings atomically.
- `join_room(code)` — the only join path (code lookup, status/privacy/capacity checks).
- `leave_room(room_id)`, `end_room(room_id)`, `promote_host(...)` — host-gated.
- `save_whiteboard_snapshot(...)` — serialized snapshot upsert with version bump.

Recording rule: role changes happen only through an admin/server-side path;
clients simply cannot alter their own `role`.

---

## Authentication

Supabase Auth handles sign-up, sign-in, session persistence/refresh, token
rotation, password hashing, and reset:

- `login` / `register` → `signInWithPassword` / `signUp`
- profile auto-created by the `handle_new_user` trigger
- `hydrate()` restores Supabase sessions (see `src/store/useUserStore.ts`)
- password reset → `resetPasswordForEmail` → `/reset-password` redirect
- application role lives in `profiles.role`, never trusted from the client
  (guarded by the `assert_role_not_changed` trigger)

Recommended (Supabase dashboard): enable email confirmations for production.

---

## Realtime architecture

Channels are scoped per room; RLS applies to all `postgres_changes`
subscriptions (participants only receive rows from their rooms).

| Channel                    | Mechanism            | Payload / purpose                              |
| -------------------------- | -------------------- | ---------------------------------------------- |
| `room:{roomId}:chat`       | postgres_changes     | new chat messages (INSERT)                     |
| `room:{roomId}:presence`   | presence             | online participants, media state, raised hand  |
| `room:{roomId}:whiteboard` | broadcast            | `snapshot` events (high-frequency draw ops; self-excluded) |
| `notifications:{userId}`   | postgres_changes     | new inbox notifications                        |

Authorization expectations: every channel requires the caller to be an
active participant of `{roomId}` (enforced by RLS on the underlying tables).
Ephemeral state (typing, cursors, drawing strokes) is broadcast — never
written per-event to PostgreSQL. Durable whiteboard state is debounced into
`whiteboard_snapshots` via RPC.

---

## Storage architecture

| Bucket                | Visibility | Path convention         | Owner rule                 |
| --------------------- | ---------- | ----------------------- | -------------------------- |
| `avatars`             | public     | `{userId}/avatar-*`     | owner writes only          |
| `room-files`          | private    | `{roomId}/...`          | room members (future)      |
| `whiteboard-exports`  | private    | `{roomId}/...`          | room members (future)      |

Large files never live in PostgreSQL.

---

## Netlify Functions

Serverless functions in `netlify/functions/`, wired via `netlify.toml`
(build `npm run build`, publish `dist`, functions dir). They read
`SUPABASE_SERVICE_ROLE_KEY` from Netlify's environment and log structured
JSON to Netlify's function logs.

| Function                 | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `send-notification`      | Server-side notification insert for a target user (validated)  |
| `process-meeting-action` | Host-gated actions: `promote-host`, `remove-participant`       |

Docs: OpenAPI-compatible spec in [docs/backend/functions.openapi.yaml](functions.openapi.yaml).

Cors/OPTIONS are preconfigured in `netlify.toml` headers. Rate limiting for
sensitive endpoints: use Netlify's built-in rate limiting on deployed
functions or Supabase Auth protections — no Redis.

---

## Frontend integration (service layer)

Every feature imports from `src/api/index.ts`. Each module declares one
interface with two implementations:

- `{name}.api.ts` — **mock** (fallback, no backend configured)
- `{name}.supabase.ts` — **real** Supabase implementation

The concrete export switches at module load:

```ts
export const meetingApi: MeetingApi = isSupabaseConfigured()
  ? supabaseMeetingApi
  : mockMeetingApi
```

The UI never knows which one it gets; component code is untouched.

| Contract              | Real implementation source                         |
| --------------------- | -------------------------------------------------- |
| `authApi`             | Supabase Auth + `profiles`                         |
| `meetingApi`          | `rooms` + `participants` + RPCs                    |
| `chatApi`             | `messages` (+ pagination)                          |
| `whiteboardApi`       | snapshots + Realtime Broadcast sync adapter        |
| `notificationApi`     | `notifications` + `profiles.notification_preferences` |
| `profileApi`          | `profiles` + Storage `avatars`                     |

---

## Logging

- Functions log structured JSON (`{ level, event, ... }`) — no passwords,
  tokens, or keys.
- Client errors surface as friendly messages via the existing error UI;
  details are never stack-traced to users.

## Testing checklist (RLS)

- [ ] User A cannot read/update user B's profile
- [ ] Student cannot promote/punish — host-only RPCs reject
- [ ] Non-member cannot read private room, message history, or whiteboard
- [ ] Users cannot edit others' messages
- [ ] `join_room` rejects unknown code / closed / private / full rooms
- [ ] Deleting a room cascades to participants/messages/snapshots
- [ ] Role change via client update fails (trigger)

## Future readiness

Breakout rooms, assignments, scheduling, billing, analytics, email/push
notifications, and recordings map onto: `meetings` sessions, `notifications`
kinds, `room-files` bucket, and new function actions — no schema rewrites.