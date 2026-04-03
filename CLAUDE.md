# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Meetup community management full-stack application (Express.js + Prisma + SQLite + React + TypeScript)

## Commands

All commands run inside the Docker container. Helper scripts derive all paths dynamically from their location.

```bash
# Alias for running commands inside the container
alias d="./scripts/docker-dev.sh"

# Setup
d up                     # Build + start container
d install                # npm install + prisma + db:push + playwright browsers

# Development
d dev                    # Start backend + frontend dev servers
d shell                  # Enter container shell

# Testing
d test                   # Run backend + frontend tests
d e2e                    # Run Playwright E2E tests

# Cleanup
d down                   # Stop + remove container (named volumes preserved)
docker compose down -v   # Stop + remove container + named volumes (full clean)

# Inside container shell (d shell)
cd backend && npm run test:coverage    # Run tests with coverage (80% threshold)
cd backend && npm run lint             # ESLint check
cd backend && npm run lint:fix         # ESLint auto-fix
cd backend && npm run format           # Prettier format
cd backend && npm run format:check     # Prettier check
cd backend && npm run db:migrate       # Prisma migrate dev
cd frontend && npm run lint            # ESLint check
cd frontend && npm run build           # Production build

# Run a single test file (inside container shell)
cd backend && npx vitest run src/auth/usecases/__tests__/register.usecase.test.ts
cd frontend && npx vitest run src/pages/__tests__/LoginPage.test.tsx

# Worktrees
git worktree add ../meetup-sample-feature -b feature
./scripts/docker-worktree.sh meetup-sample-feature install
./scripts/docker-worktree.sh meetup-sample-feature test
./scripts/docker-worktree.sh meetup-sample-feature shell
git worktree remove ../meetup-sample-feature   # Cleanup worktree
git branch -d feature                          # Delete branch (if merged)
```

## Architecture

Monorepo with npm workspaces: `backend/`, `frontend/`, `e2e/`

### Backend

DDD bounded contexts with layered structure: `controllers/` -> `usecases/` -> `models/`, `repositories/`, `services/`

- `backend/src/auth/` — Authentication context (registration, login, JWT)
- `backend/src/meetup/` — Meetup context (community CRUD, membership management)
- `backend/src/shared/` — Shared kernel (Result type, Branded Types, Event Bus, middleware, OpenAPI registry)
- `backend/src/infrastructure/` — Prisma client, test helpers

### Frontend

React 19 + Vite + Tailwind CSS + React Router

- `frontend/src/pages/` — Route page components
- `frontend/src/components/` — Reusable UI components (Button, Input, Card, Layout)
- `frontend/src/hooks/` — Custom hooks (useAuth, useCommunities, useMembers)
- `frontend/src/contexts/` — React Context (AuthContext)
- `frontend/src/lib/` — API client, token management, shared types

### E2E

Playwright tests covering full user flows (auth, community, member). Config starts both backend and frontend via `webServer`.

## Core Patterns

- **Result<T, E>** — Return type for all domain functions and UseCases. Never throw exceptions (`@shared/result.ts`)
- **Branded Types** — Type-safe IDs (`CommunityId`, `AccountId`) in `shared/schemas/common.ts`. Factories in `shared/schemas/id-factories.ts`
- **Discriminated Union Errors** — `{ type: 'NotFound' }` format. Each context defines errors in `errors/` dir, controllers map them to HTTP via `*-error-mappings.ts`
- **Readonly Interface** — Entities defined as readonly interfaces, not classes
- **Schema-derived types** — Use `z.infer<typeof Schema>` types from `models/schemas/` instead of inline literal unions (`'PUBLIC' | 'PRIVATE'`). Use schema constants (`CommunityMemberRole.OWNER`) instead of hardcoded string literals
- **OpenAPI-driven validation** — Zod schemas registered via `*-openapi.ts` (side-effect imports in `app.ts`), validated by `express-openapi-validator`. Import domain schemas and add `.openapi({ description, example })` only — never duplicate constraints (min/max/nullable) in OpenAPI definitions
- **Event Bus** — In-memory `InMemoryEventBus<TEvent>` for cross-context side effects

## Path Aliases (Backend only)

Defined in tsconfig.json, resolved via `tsx` at runtime and `resolve.alias` in vitest:

- `@/*` -> `src/*`
- `@shared/*` -> `src/shared/*`
- `@auth/*` -> `src/auth/*`
- `@meetup/*` -> `src/meetup/*`

## Coding Conventions

- File names: `kebab-case` with role suffix (`.usecase.ts`, `.repository.ts`, `.schema.ts`, `.controller.ts`, `.e2e.test.ts`)
- Functions: max 50 lines, files: max 400 lines (hard limit 800)
- `any` type is forbidden, use named exports (no default exports)
- Factory functions (`create*()`) and transition functions return `Result<T, E>`
- **UseCases are orchestration only** — domain logic belongs in `models/`
- Forbidden in UseCases: `new Date()`, direct ID generation, spread syntax for aggregate partial updates
- Zod schemas: domain constraints in `models/schemas/*.schema.ts`, controllers add `.openapi()` metadata only. No inline literal unions — use schema-inferred types and constants everywhere

## Testing

### Backend
- Unit tests: `__tests__/*.test.ts` alongside target module, mock repositories/services
- E2E tests: `__tests__/*.e2e.test.ts` using supertest + isolated SQLite per test suite
- `createTestPrismaClient()` from `infrastructure/test-helper.ts` creates temp DB with `prisma db push`
- `clearMeetupTables(prisma)` / `clearAuthTables(prisma)` for cleanup between tests
- `createApp(testPrismaClient)` — app factory accepts PrismaClient for test isolation
- Coverage threshold: 80% minimum

### Frontend
- Component tests: `__tests__/*.test.tsx` using Vitest + React Testing Library
- Hook tests: `__tests__/*.test.ts` using `renderHook` with mocked API client
- JSDOM environment, `@testing-library/jest-dom/vitest` setup
- Mock `apiClient` and `token` modules with `vi.mock`

### E2E
- Playwright tests in `e2e/tests/*.spec.ts`
- `webServer` config auto-starts backend (port 3000) and frontend (port 5173)

### Test naming
- テストの describe/it は日本語で記述する
- **Acceptance criteria mapping**: Each issue acceptance criterion maps 1:1 to a test name

## Quality Gates

Before completing any implementation (run inside container shell):

- `cd backend && npm run test:coverage` — All tests pass with coverage >= 80%
- `cd backend && npm run lint` — No lint errors
- `cd backend && npm run review` — No critical issues (layer dependencies, circular deps, complexity, type check, coverage)
- `cd frontend && npm test` — All frontend tests pass
- `cd frontend && npm run lint` — No lint errors

## Gotchas

- Prisma schema is multi-file under `backend/prisma/schema/` (requires `prismaSchemaFolder` preview feature)
- Path aliases (`@/`) resolved via `tsx` only (not with `node` directly)
- ESM project (`"type": "module"`) — `tsx` handles import resolution
- Frontend Vite proxy forwards `/auth`, `/communities`, `/health` to backend on port 3000
- `app.ts` uses side-effect imports for OpenAPI registration (`import './auth/controllers/auth-openapi'`)
- Auth middleware exports `requireAuth` and `optionalAuth` — use `optionalAuth` for endpoints accessible without login
