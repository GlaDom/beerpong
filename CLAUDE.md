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
