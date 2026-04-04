# AGENTS.md

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

## Coding Conventions

@docs/conventions/coding.md

## Testing

@docs/conventions/testing.md

## Quality Gates

- `d test` — Backend + frontend tests
- `d bash -c "cd backend && npm run review"` — Layer deps, circular deps, complexity, type check, coverage (80%+)
- `d bash -c "cd backend && npm run lint"` / `d bash -c "cd frontend && npm run lint"`

## Security

- 認証ミドルウェア: `requireAuth`（認証必須）と `optionalAuth`（認証任意）を適切に使い分ける
- 入力検証: Zod スキーマ + express-openapi-validator で全 API エンドポイントを検証
- Prisma の raw query は使用禁止（SQL インジェクション防止）
- エラーレスポンスにスタックトレースを含めない
- 機密ファイル（.env, credentials, *.pem, *.key）を読み書きしない

## Gotchas

- Prisma schema is multi-file under `backend/prisma/schema/` (requires `prismaSchemaFolder` preview feature)
- Path aliases (`@/`) resolved via `tsx` only (not with `node` directly)
- ESM project (`"type": "module"`) — `tsx` handles import resolution
- Frontend Vite proxy forwards `/auth`, `/communities`, `/health` to backend on port 3000
- `app.ts` uses side-effect imports for OpenAPI registration (`import './auth/controllers/auth-openapi'`)
- Auth middleware exports `requireAuth` and `optionalAuth` — use `optionalAuth` for endpoints accessible without login

## Subagent Guidelines

品質ゲートやコードレビューにサブエージェントを活用する。

### code-reviewer

変更差分に対するコードレビュー。DDD パターン準拠、Result 型、Branded Types、Schema-derived types、UseCase orchestration only、関数/ファイル行数制限、`any` 禁止、named exports をチェック。

### security-reviewer

OWASP Top 10 観点のレビュー。認証/認可、入力検証、SQL インジェクション、XSS、機密情報露出、CORS/CSRF をチェック。

### test-analyzer

テスト品質確認。カバレッジ 80%+、日本語テスト命名、受入基準との 1:1 対応、テスト分離、モック適切性、エッジケースをチェック。

### codebase-explorer

アーキテクチャ調査、既存パターン発見、影響範囲分析。メインコンテキスト保護のため調査を委譲。

## Context Management

- タスク間で `/clear` を実行し、コンテキストをリセットする
- 調査はサブエージェントに委譲し、メインコンテキストを保護する
- コンパクション時は変更ファイル一覧とテストコマンドを保持する
