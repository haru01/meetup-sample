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

# Arbitrary command (catch-all: d <command> runs inside container)
d bash -c "cd backend && npm run lint"             # ESLint check
d bash -c "cd backend && npm run lint:fix"         # ESLint auto-fix
d bash -c "cd backend && npm run test:coverage"    # Tests with coverage (80% threshold)
d bash -c "cd backend && npm run review"           # Layer deps, circular deps, complexity, type check, coverage
d bash -c "cd backend && npm run format"           # Prettier format
d bash -c "cd backend && npm run format:check"     # Prettier check
d bash -c "cd backend && npm run db:migrate"       # Prisma migrate dev
d bash -c "cd frontend && npm run lint"            # ESLint check
d bash -c "cd frontend && npm run build"           # Production build

# Run a single test file
d bash -c "cd backend && npx vitest run src/auth/usecases/__tests__/register.usecase.test.ts"
d bash -c "cd frontend && npx vitest run src/auth/pages/__tests__/LoginPage.test.tsx"

# Worktrees
git worktree add ../meetup-sample-feature -b feature
./scripts/docker-worktree.sh meetup-sample-feature install
./scripts/docker-worktree.sh meetup-sample-feature test
./scripts/docker-worktree.sh meetup-sample-feature shell
git worktree remove ../meetup-sample-feature   # Cleanup worktree
git branch -d feature                          # Delete branch (if merged)
```

## General Rules

- 削除・リファクタリングを依頼された場合、指定されたファイル/ディレクトリのみを対象とする。関連ファイルや参照の削除は明示的に依頼されない限り行わない
- docker compose を直接使わず、必ず `./scripts/docker-dev.sh` ラッパー経由でコマンドを実行する
- シェルスクリプトは macOS/zsh 互換にする。GNU 固有フラグ (`grep -P`)、bash 固有機能 (連想配列)、`set -euo pipefail`（source されるスクリプト内）は使用禁止。POSIX 互換または zsh 互換の代替を使う

## Git Conventions

- コミットメッセージは日本語で記述し、Conventional Commits prefix を使用する
- `/commit` スキルまたは `japanese-commit` スキルの形式に従う

## Architecture

Monorepo with npm workspaces: `backend/`, `frontend/`, `e2e/`

### Backend

DDD bounded contexts with layered structure: `controllers/` -> `usecases/` -> `models/`, `repositories/`, `services/`

- `backend/src/auth/` — Authentication context (registration, login, JWT)
- `backend/src/meetup/` — Meetup context (community CRUD, membership management)
- `backend/src/shared/` — Shared kernel (Result type, Branded Types, Event Bus, middleware, OpenAPI registry)
- `backend/src/infrastructure/` — Prisma client, test helpers

### Frontend

React 19 + Vite + Tailwind CSS + React Router — auth/meetup コンテキスト分離構成

- `frontend/src/auth/` — Authentication context (pages, hooks, contexts)
- `frontend/src/meetup/` — Meetup context (pages, components, hooks, utils)
- `frontend/src/components/` — Shared UI components (Button, Input, Card, ErrorAlert, Layout)
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
- Pure function tests: `__tests__/*.test.ts` (e.g., `meetup/utils/__tests__/label-utils.test.ts`)
- Hook tests: `__tests__/*.test.ts` using `renderHook` with mocked API client
- Page tests are not used — component tests + pure function tests + E2E でカバー
- JSDOM environment, `@testing-library/jest-dom/vitest` setup
- Mock `apiClient` and `token` modules with `vi.mock`

### E2E
- Playwright tests in `e2e/tests/*.spec.ts`
- `webServer` config auto-starts backend (port 3000) and frontend (port 5173)

### Test naming
- テストの describe/it は日本語で記述する
- **Acceptance criteria mapping**: Each issue acceptance criterion maps 1:1 to a test name

## Quality Gates

Before completing any implementation (run from project root, `alias d="./scripts/docker-dev.sh"`):

- `d test` — Backend + frontend tests
- `d bash -c "cd backend && npm run test:coverage"` — Tests with coverage >= 80%
- `d bash -c "cd backend && npm run lint"` — No lint errors
- `d bash -c "cd backend && npm run review"` — No critical issues (layer deps, circular deps, complexity, type check, coverage)
- `d bash -c "cd frontend && npm test"` — All frontend tests pass
- `d bash -c "cd frontend && npm run lint"` — No lint errors

## Gotchas

- Prisma schema is multi-file under `backend/prisma/schema/` (requires `prismaSchemaFolder` preview feature)
- Path aliases (`@/`) resolved via `tsx` only (not with `node` directly)
- ESM project (`"type": "module"`) — `tsx` handles import resolution
- Frontend Vite proxy forwards `/auth`, `/communities`, `/health` to backend on port 3000
- `app.ts` uses side-effect imports for OpenAPI registration (`import './auth/controllers/auth-openapi'`)
- Auth middleware exports `requireAuth` and `optionalAuth` — use `optionalAuth` for endpoints accessible without login
