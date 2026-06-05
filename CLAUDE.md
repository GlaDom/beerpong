# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack beer pong tournament management app — Angular 19 frontend + Go 1.22 backend, authenticated via Auth0, backed by PostgreSQL (Supabase in production, Docker locally).

---

## Commands

### Frontend (`app/ngBeerpong/`)

```bash
npm run start       # Dev server at https://skbeerpong.com:4200 (HTTPS required for Auth0)
npm run build       # Production build → dist/ng-beerpong
npm run watch       # Dev build with watch mode
npm run test        # Unit tests via Karma/Jasmine
```

> **Important**: The dev server uses `skbeerpong.com` (not `localhost`) because Auth0 requires a verified hostname for implicit consent skip. Add `127.0.0.1 skbeerpong.com` to `/etc/hosts`. Self-signed certs are included (`server.crt`/`server.key`).

### Backend (`go/`)

```bash
go run ./cmd/...            # Run the Go server (port 8082)
go test ./pkg/...           # Run all Go tests
go test ./pkg/repo/...      # Run repo-layer tests only
```

Or via Docker:

```bash
docker-compose up           # Starts PostgreSQL (5433), pgAdmin (5051), Go backend (8082)
```

---

## Architecture

### Monorepo Layout

```
beerpong/
├── app/ngBeerpong/          # Angular 19 frontend
├── go/                      # Go backend
├── docker-compose.yaml      # Dev infrastructure
└── beerpong.sql             # Database schema
```

### Frontend Structure (`app/ngBeerpong/src/app/`)

All components are **standalone** (no NgModules). Routes are lazy-loaded in `app.routes.ts`.

**Pages** (route-level components):
- `landing-page/` — public entry point / login trigger
- `home/` — authenticated dashboard
- `admin-space/` — admin tournament controls
- `gameplan/` — tournament bracket view
- `oauth/callback/`, `oauth/logout/` — Auth0 flow handlers

All non-public routes are protected by `AuthGuardService`.

**State Management** — NgRx store split into two slices:
- `store/beerpong/` — tournament data (groups, teams, matches, bracket stages)
- `store/user/` — Auth0 user profile

Key actions follow the pattern: `loadGame`, `createGame`, `finishGame`, `updateMatch`, `updateMatchesRoundOfSixteen`, `updateQuaterFinals`, `updateSemiFinals`, `updateFinal`.

**Services**:
- `configuration.service.ts` — all HTTP calls to the Go backend
- `auth/auth.service.ts` — Auth0 wrapper
- `interceptors/auth-header.interceptor.ts` — attaches JWT to every API request

**UI**: PrimeNG (Aura theme, dark-mode aware) + Tailwind CSS for layout/utilities.

### Backend Structure (`go/`)

```
go/
├── cmd/
│   ├── main.go             # Gin router setup, middleware registration, route declarations
│   ├── configuration.go    # Config struct
│   └── config.json         # Auth0 + database credentials (not committed with real secrets)
├── internal/handler/
│   └── beerpong-game.go    # HTTP handlers for all endpoints
├── pkg/
│   ├── models/             # Domain types: Tournament, Group, Team, Match, Referee
│   ├── repo/               # GORM database layer (game-repo.go + tests)
│   ├── usecase/            # Business logic: round-robin generation, KO bracket building
│   └── requestvalidation/  # Auth0 JWT middleware
└── docs/                   # Generated Swagger docs
```

**REST API** (all under `/api/v1`, all require Auth0 JWT):

| Method | Path | Purpose |
|--------|------|---------|
| POST/GET | `/tournament` | Create or fetch current tournament |
| GET | `/tournament/last` | Fetch last tournament |
| PUT | `/tournament/:id` | Finish a tournament |
| PUT | `/tournament/matches` | Update group-stage match results |
| PUT | `/tournament/matches/round-of-sixteen/:id` | Update R16 bracket |
| PUT | `/tournament/matches/quaterfinals/:id` | Update QF bracket |
| PUT | `/tournament/matches/semifinals/:id` | Update SF bracket |
| PUT | `/tournament/matches/final/:id` | Update final |
| PUT | `/tournament/teams` | Update team standings |

**Database**: PostgreSQL via GORM. Production uses Supabase; local dev uses Docker Compose (`db` service on port 5433).

### Domain Models (`pkg/models/models.go`)

Entity hierarchy:

```
Tournament (root)
├── Groups[]   (FK: TournamentID)
│   └── Teams[]  (FK: GroupID, TournamentID)
├── Matches[]  (FK: TournamentID)
└── Referee[]  (FK: TournamentID)
```

Key Tournament flags:
- `GotKoStage bool` — whether a KO phase is generated
- `NumberOfQualifiedTeams int` — teams advancing per group
- `IncludeThirdPlaceMatch bool`
- `GameTime time.Duration` — match duration in minutes
- `UserSub string` — Auth0 subject (owner)

Team ranking fields: `Points`, `CupsHit`, `CupsGet`, `CupDifference` (Hit−Get).  
Sorting: primary by `Points` descending, tiebreaker by `CupDifference` descending (`models.Teams.Less()`).

Match `Type` values: `"regular"` (group stage), `"roundOfSixteen"`, `"quaterFinal"`, `"semiFinal"`, `"final"`.  
KO matches use placeholder names (`"1ter Gruppe A"`, `"Gewinner Match X"`) until real results are entered.

### Round-Robin Algorithm (`pkg/usecase/round-robin.go`)

**Input**: group's `[]Team`, `matchDuration`, `groupNumber`, `startTime`  
**Output**: `[]Match` with sequential IDs and consecutive scheduled times (no gaps)

Two-phase approach:
1. **`generateAllMatches()`** — O(n²) nested loop produces all n·(n−1)/2 pairings.
2. **`optimizeMatchOrder()`** — greedy pass that picks the next match maximising rest:
   - Score = `(minPause × 10) + balanceBonus`
   - `minPause` = smallest pause of the two teams since their last appearance
   - `balanceBonus` = +1 when both teams' pauses differ by ≤ 1 (rewards equal rest)
   - Selected match is removed from the remaining pool; repeat until empty.

Times are sequential: `EndTime[i]` becomes `StartTime[i+1]`.

### KO Bracket Algorithm (`pkg/usecase/ko-round-generator.go`)

**Input**: `tournamentId`, `[]Group`, `teamsPerGroup`, `includeThirdPlace`, `gameDuration`, `startTime`  
**Output**: `[]Match` for all KO rounds

Steps:
1. **`determineQualificationSlots()`** — fills slots position-first across alphabetically sorted groups (all winners first, then all runners-up, etc.).
2. **`adjustToNextPowerOfTwo()`** — rounds participant count *down* to nearest power of 2 (e.g. 6→4, 5→4). Teams beyond that count do not advance.
3. **`createSeeding()`** — standard 1-vs-last bracket: seed 1 plays seed N, seed 2 plays seed N−1, etc. Produces placeholder names like `"1ter Gruppe A"`.
4. **`generateAllKOMatches()`** — recursive: each round pairs adjacent slots; next round uses `"Gewinner Match X"` placeholders; recurses until 2 teams remain (final).
5. **Third-place match** (optional): losers of both semis, named `"Verlierer Halbfinale 1"` vs `"Verlierer Halbfinale 2"`.

Round names by bracket size: 2→`final`, 4→`semiFinal`, 8→`quaterFinal`, 16→`roundOfSixteen`, 32→`roundOfThirtyTwo`.

All matches within the same KO round share the same `StartTime` (parallel play assumed).  
Placeholder replacement happens later via `UpdateKOMatchWithResult()` as prior rounds complete.

### Tournament Creation Data Flow

```
POST /api/v1/tournament
  └─ CreateGame handler
       ├─ For each group → RoundRobin.GenerateOptimalRoundRobinTournament()
       ├─ If GotKoStage → KoRoundGenerator.GenerateKOMatches()
       │    └─ KO startTime = last group match's EndTime
       └─ repo.CreateTournament() — single DB transaction
            ├─ INSERT tournament
            ├─ INSERT groups (without Teams to avoid FK constraint)
            ├─ INSERT teams per group
            └─ INSERT all matches (group + KO)
```

Team stats are **incremental**: `PUT /tournament/teams` adds `PointsToAdd`/`CupsHitted`/`CupsGot` to current DB values via `general.GetUpdatedTeam()`. Never replace; always accumulate.

### Known Incomplete Areas

- KO round update endpoints (`round-of-sixteen`, `quaterfinals`, `semifinals`, `final`) currently return 200 with nil — handlers are not yet implemented.
- `general.CalculateMatchesForKORound()` exists but only partially fills `HomeTeam`; `AwayTeam` is left unchanged.

### Authentication Flow

1. Public landing page → user clicks login → Auth0 redirect
2. Auth0 redirects to `/callback` → `CallbackComponent` handles the token
3. All API calls attach the Bearer token via `AuthHeaderInterceptor`
4. Go backend validates the JWT using Auth0's JWKS endpoint

### Tournament Lifecycle

1. **Configuration** (`gameconfiguration` page) — define teams, groups
2. **Group stage** (`gameplan` page) — play round-robin matches, record scores
3. **KO rounds** — system generates bracket from group results (R16 → QF → SF → Final)
4. **Admin space** — admin can edit scores, manage tournament state

The `usecase/` layer contains the algorithms: `round-robin.go` for group scheduling, `ko-round-generator.go` for bracket generation.
