# squadcheck-backend — NestJS Backend

## Overview
Real-time gym **consistency and accountability** platform API.
Powers SquadCheck — "Never train alone again."

## Stack
- NestJS 10 + TypeScript
- MongoDB + Mongoose
- Socket.IO (real-time, `/lobby` namespace)
- JWT auth (`@nestjs/jwt`)
- Google Gemini 1.5 Flash (AI squad generation)

## Module Structure
```
src/
  modules/
    auth/          ← LinkedIn OAuth callback + JWT issuance
    users/         ← user profile, onboarding completion
    gyms/          ← gym CRUD + active user queries
    lobby/         ← check-in/check-out, weekday streak engine, familiar faces
    squads/        ← squad formation, AI-powered suggestions, squad streaks
    ai/            ← Gemini 1.5 Flash integration
    notifications/ ← push subscription storage + smart reminder scheduling
    health/        ← GET /health endpoint
  gateway/
    lobby.gateway.ts  ← Socket.IO realtime (namespace /lobby)
  database/schemas/
    user.schema.ts           ← User (streak fields, workoutFocus, checkinHours)
    gym.schema.ts            ← Gym
    squad.schema.ts          ← Squad (squadStreak, lastSessionDate)
    lobby-session.schema.ts  ← LobbySession (workoutFocus, coTrainees)
    push-subscription.schema.ts ← PushSubscription (endpoint, keys, preferredHour)
  common/
    guards/           ← JwtAuthGuard
    decorators/       ← @CurrentUser()
    filters/          ← HttpExceptionFilter
  config/             ← configuration.ts (env → typed config)
  types/              ← shared TypeScript interfaces
```

## Auth Flow
1. Frontend (NextAuth) handles LinkedIn OAuth — gets name, email, avatar
2. Frontend calls `POST /auth/linkedin` with `{ name, email, avatar }`
3. Backend finds-or-creates user, signs JWT (30d expiry), returns `{ token, user }`
4. Frontend stores JWT in Zustand (persisted to localStorage)
5. All API calls use `Authorization: Bearer <token>`
6. Socket.IO connections authenticate via `socket.handshake.auth.token`

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/linkedin | Public | LinkedIn OAuth → backend JWT |
| GET | /auth/me | JWT | Current JWT payload |
| GET | /users/me | JWT | Full user profile |
| PATCH | /users/me/onboarding | JWT | Complete onboarding |
| PATCH | /users/me | JWT | Update role/company/fitnessLevel |
| GET | /gyms | Public | List all gyms |
| GET | /gyms/:id | Public | Single gym |
| GET | /gyms/:id/active-users | JWT | Users currently in gym |
| POST | /gyms | Public | Create gym (dev only) |
| POST | /lobby/join | JWT | Check into gym (also via WS) |
| POST | /lobby/leave | JWT | Leave gym (also via WS) |
| PATCH | /lobby/workout-focus | JWT | Set today's workout focus |
| GET | /lobby/:gymId/users | JWT | Active lobby users |
| GET | /lobby/:gymId/familiar-faces | JWT | Users you frequently train with |
| GET | /squads/:gymId/suggested | JWT | AI-generated squad suggestions |
| GET | /squads/:gymId/active | JWT | Active squads in gym |
| POST | /squads | JWT | Form a new squad (3-5 members) |
| POST | /squads/:id/join | JWT | Join an existing squad |
| POST | /squads/:id/leave | JWT | Leave a squad |
| POST | /notifications/subscribe | JWT | Store push subscription |
| DELETE | /notifications/unsubscribe | JWT | Remove push subscription |
| GET | /notifications/subscription | JWT | Get user's subscription |
| GET | /health | Public | Health check |

## WebSocket Events (namespace `/lobby`)
### Client → Server
- `lobby:join` `{ gymId }` — join gym room + mark online + compute streak
- `lobby:leave` `{ gymId }` — leave gym room + mark offline
- `lobby:workout_focus` `{ gymId, focus }` — set workout focus + broadcast

### Server → Client
- `lobby:user_joined` `{ userId, gymId, userName, userAvatar, workoutFocus, currentStreak }`
- `lobby:user_left` `{ userId, gymId }`
- `lobby:active_users` `{ gymId, users[] }` — full presence list
- `activity:event` `{ type, userId, userName, userAvatar, message, timestamp }` — rich feed events
- `squad:formed` `{ squad }` — new squad created
- `squad:updated` `{ squad }` — squad membership changed

## Activity Event Types
- `check_in` / `check_out`
- `streak_milestone` — 7, 14, 21, 30, 42, 60, 90 day milestones
- `weekend_bonus` — Saturday Discipline / Sunday Session Bonus
- `workout_focus` — user set today's focus
- `squad_formed` / `squad_streak`

## Weekday Streak Engine (LobbyService)
Core rule: **Mon–Fri only**. Weekends NEVER break streaks.

Logic on `joinLobby`:
1. Get today's day (0=Sun…6=Sat). If weekend → skip streak, increment `weekendSessions`.
2. If weekday: find `lastWeekdayCheckinDate`.
   - Same day → already checked in, no change.
   - `lastWeekdayCheckinDate` === previous weekday → streak + 1.
   - Gap > previous weekday → streak resets to 1.
3. Update `longestStreak` if current > previous longest.
4. Set `lastWeekdayCheckinDate = today`.
5. Track `checkinHours[]` (last 20 hours) for smart notification scheduling.

Milestones: 7, 14, 21, 30, 42, 60, 90 days → emits `streak_milestone` activity event.

## Squad Streak Engine (SquadsService)
- On `joinSquad`: `updateSquadStreak(squadId)` is called.
- If today > lastSessionDate by ≤ 1 day (or 3 days on Monday for weekend gap) → streak + 1.
- Else → reset to 1.
- Tracks `totalSessionsTogether` counter.

## Familiar Faces (LobbyService)
- On `leaveLobby`: session gets `coTrainees[]` = other online users in the gym at that time.
- `getFamiliarFaces(userId, gymId)`: aggregates `coTrainees` across user's sessions, returns sorted by overlap count.

## User Schema Key Fields
```
currentStreak       number  // weekday streak (Mon-Fri)
longestStreak       number
lastWeekdayCheckinDate Date
weekendSessions     number
weekendBonuses      string[] // ['Saturday Discipline', 'Sunday Session Bonus']
workoutFocus        string  // Chest|Back|Legs|Shoulders|Cardio|Full Body|Recovery
checkinHours        number[] // last 20 check-in hours for notification timing
streakCount         number  // legacy, mirrors currentStreak
totalCheckins       number
```

## Running Locally
```bash
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run seed          # creates 5 sample gyms
npm run start:dev     # starts on port 3001
```

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| MONGO_URI | Yes | — | MongoDB connection string |
| JWT_SECRET | Yes | — | JWT signing secret |
| GEMINI_API_KEY | Yes* | — | Google AI Studio key (*falls back gracefully) |
| PORT | No | 3001 | Server port |
| FRONTEND_URL | No | http://localhost:3000 | CORS origin |

## Key Patterns
- No global guards — each controller applies `@UseGuards(JwtAuthGuard)` explicitly
- Return raw data — no `{ success, data, message }` wrappers
- `JwtModule` is registered globally in `AppModule`
- `LobbyGateway` lives in `AppModule.providers` — needs `LobbyService` + `JwtService` directly
- Squad expiry: 4 hours from creation via `expiresAt` field
- Streak: computed on `joinLobby` (not leave) — weekday-aware
- AI fallback: if `GEMINI_API_KEY` missing, `AiService` returns hardcoded content
