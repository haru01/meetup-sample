# Meetup Sample Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack TypeScript meetup (community management) sample app for Copilot CLI demo, following order_skills_sample DDD patterns.

**Architecture:** DDD bounded contexts (auth, meetup) with layered structure (Controller → UseCase → Repository). Shared kernel provides Result type, Branded Types, Event Bus, OpenAPI validation. Frontend is React 19 + Vite + Tailwind CSS with React Router.

**Tech Stack:** Node.js 20+, TypeScript 5.7+, Express.js, Prisma (SQLite), Zod, express-openapi-validator, React 19, Vite, Tailwind CSS, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-03-meetup-sample-design.md`

**Reference project:** `~/src/order_skills_sample/` — copy patterns from here, adapting for meetup domain.

---

## Phase 0: Project Scaffolding & Shared Kernel

### Task 1: Initialize monorepo structure and backend project

**Files:**
- Create: `package.json` (root)
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/eslint.config.js`
- Create: `backend/.prettierrc`
- Create: `CLAUDE.md`
- Create: `README.md`
- Create: `.gitignore`
- Create: `backend/.env.example`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/eiji/src/ai-driven-sample/copilot-cli
git init
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "copilot-cli-meetup-sample",
  "private": true,
  "workspaces": ["backend", "frontend", "e2e"]
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
*.db
*.db-journal
.env
.env.*
coverage/
```

- [ ] **Step 4: Create backend/package.json**

Copy dependency structure from `~/src/order_skills_sample/backend/package.json`, adjusting:
- name: `"meetup-backend"`
- Remove ordering/shipping-specific deps
- Keep: express, prisma, zod, zod-to-openapi, express-openapi-validator, bcrypt, jsonwebtoken, swagger-ui-express
- Keep devDeps: vitest, supertest, tsx, typescript, eslint, prettier, @vitest/coverage-v8
- Scripts: dev, build, test, test:coverage, lint, lint:fix, format, db:migrate, db:push

- [ ] **Step 5: Create backend/tsconfig.json**

Copy from reference, with path aliases:
- `@/*` → `src/*`
- `@shared/*` → `src/shared/*`
- `@auth/*` → `src/auth/*`
- `@meetup/*` → `src/meetup/*`

- [ ] **Step 6: Create backend/vitest.config.ts**

Copy from reference project. Configure path aliases to match tsconfig.

- [ ] **Step 7: Create backend/eslint.config.js and .prettierrc**

Copy from reference: `~/src/order_skills_sample/backend/eslint.config.js` and `~/src/order_skills_sample/backend/.prettierrc`

- [ ] **Step 8: Create CLAUDE.md**

Write project-specific development guide covering:
- Commands (npm install, npm test, etc.)
- Architecture overview (auth + meetup contexts)
- Core patterns (Result, Branded Types, Discriminated Union Errors)
- Coding conventions (kebab-case files, 50-line functions, no any, etc.)
- Test policy (80%+ coverage, __tests__/ directories)
- Reference to spec doc

- [ ] **Step 9: Run npm install**

```bash
cd backend && npm install
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: initialize monorepo with backend project scaffolding"
```

---

### Task 2: Shared kernel — Result type

**Files:**
- Create: `backend/src/shared/result.ts`
- Create: `backend/src/shared/__tests__/result.test.ts`

- [ ] **Step 1: Write tests for Result type**

Test: ok(), err(), isOk(), isErr(), map(), mapErr(), flatMap(), unwrapOr()

Reference: `~/src/order_skills_sample/backend/src/shared/result.ts`

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && npx vitest run src/shared/__tests__/result.test.ts
```

- [ ] **Step 3: Implement Result type**

Copy from reference: `~/src/order_skills_sample/backend/src/shared/result.ts`

Exports: `Ok<T>`, `Err<E>`, `Result<T,E>`, `ok()`, `err()`, `isOk()`, `isErr()`, `map()`, `mapErr()`, `flatMap()`, `unwrapOr()`

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add backend/src/shared/result.ts backend/src/shared/__tests__/result.test.ts
git commit -m "feat: add Result<T,E> type with functional combinators"
```

---

### Task 3: Shared kernel — Branded Types & ID factories

**Files:**
- Create: `backend/src/shared/schemas/common.ts`
- Create: `backend/src/shared/schemas/id-factories.ts`
- Create: `backend/src/shared/__tests__/branded-types.test.ts`

- [ ] **Step 1: Write tests for Branded Types**

Test: createAccountId(), createCommunityId(), createCommunityMemberId() generate valid UUIDs, accept custom IDs.

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement Branded Types**

Reference: `~/src/order_skills_sample/backend/src/shared/schemas/common.ts` and `id-factories.ts`

Types: `AccountId`, `CommunityId`, `CommunityMemberId`
Factories: `createAccountId()`, `createCommunityId()`, `createCommunityMemberId()`

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add backend/src/shared/schemas/ backend/src/shared/__tests__/branded-types.test.ts
git commit -m "feat: add Branded Types and ID factory functions"
```

---

### Task 4: Shared kernel — Event Bus

**Files:**
- Create: `backend/src/shared/event-bus.ts`
- Create: `backend/src/shared/__tests__/event-bus.test.ts`

- [ ] **Step 1: Write tests**

Test: subscribe/publish, multiple subscribers, async handlers, unsubscribe.

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement Event Bus**

Reference: `~/src/order_skills_sample/backend/src/shared/event-bus.ts`

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add in-memory domain event bus"
```

---

### Task 5: Shared kernel — Errors, ErrorResponse, OpenAPI registry

**Files:**
- Create: `backend/src/shared/errors.ts`
- Create: `backend/src/shared/controllers/error-response.ts`
- Create: `backend/src/shared/openapi/registry.ts`

- [ ] **Step 1: Implement shared error types**

Reference: `~/src/order_skills_sample/backend/src/shared/errors.ts`

- [ ] **Step 2: Implement ErrorResponse type**

Reference: `~/src/order_skills_sample/backend/src/shared/controllers/error-response.ts`

- [ ] **Step 3: Implement OpenAPI registry**

Reference: `~/src/order_skills_sample/backend/src/shared/openapi/registry.ts`

Using `@asteasolutions/zod-to-openapi`'s `OpenAPIRegistry` and `OpenApiGeneratorV3`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add shared errors, ErrorResponse, and OpenAPI registry"
```

---

### Task 6: Shared kernel — Middleware (auth, error handler, OpenAPI validator)

**Files:**
- Create: `backend/src/shared/middleware/auth.middleware.ts`
- Create: `backend/src/shared/middleware/error-handler.middleware.ts`
- Create: `backend/src/shared/middleware/openapi-validator.middleware.ts`
- Create: `backend/src/shared/__tests__/middleware.test.ts`

- [ ] **Step 1: Write tests for error handler middleware**

Test: maps OpenAPI validation errors to 400/422, unknown errors to 500.

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement error handler middleware**

Reference: `~/src/order_skills_sample/backend/src/shared/middleware/error-handler.middleware.ts`

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Write tests for auth middleware**

Test: valid token extracts accountId, expired token returns 401, missing token returns 401, optional auth (no token = proceed without user).

> **Note:** Auth middleware uses `jsonwebtoken` directly to verify JWT tokens (not via TokenService). TokenService (Task 10) is used only by usecases for token generation. The middleware receives the JWT secret via config/env.

- [ ] **Step 6: Run tests — verify fail**

- [ ] **Step 7: Implement auth middleware**

JWT verification middleware. Extracts `accountId` from token, attaches to `req`. Supports optional auth mode.

- [ ] **Step 8: Run tests — verify pass**

- [ ] **Step 9: Implement OpenAPI validator middleware**

Reference: `~/src/order_skills_sample/backend/src/shared/middleware/openapi-validator.middleware.ts`

Uses `express-openapi-validator` with the generated OpenAPI spec.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add auth, error handler, and OpenAPI validator middleware"
```

---

### Task 7: Prisma setup and database schema

**Files:**
- Create: `backend/prisma/schema/base.prisma`
- Create: `backend/prisma/schema/auth.prisma`
- Create: `backend/prisma/schema/meetup.prisma`
- Create: `backend/src/infrastructure/prisma.ts`

- [ ] **Step 1: Create base.prisma**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

> **Note:** Multi-file Prisma schema requires `prismaSchemaFolder` preview feature. Also ensure `backend/package.json` has `"prisma": { "schema": "prisma/schema" }`.

- [ ] **Step 2: Create auth.prisma**

```prisma
model Account {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  members      CommunityMember[]
}
```

- [ ] **Step 3: Create meetup.prisma**

```prisma
enum CommunityCategory {
  TECH
  BUSINESS
  HOBBY
}

enum CommunityVisibility {
  PUBLIC
  PRIVATE
}

enum CommunityMemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum CommunityMemberStatus {
  PENDING
  ACTIVE
}

model Community {
  id          String              @id @default(uuid())
  name        String              @unique
  description String?
  category    CommunityCategory
  visibility  CommunityVisibility
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  members     CommunityMember[]
}

model CommunityMember {
  id          String                @id @default(uuid())
  communityId String
  accountId   String
  role        CommunityMemberRole
  status      CommunityMemberStatus
  createdAt   DateTime              @default(now())

  community   Community @relation(fields: [communityId], references: [id])
  account     Account   @relation(fields: [accountId], references: [id])

  @@unique([communityId, accountId])
  @@index([accountId])
}
```

- [ ] **Step 4: Create infrastructure/prisma.ts**

Reference: `~/src/order_skills_sample/backend/src/infrastructure/prisma.ts`

Singleton PrismaClient export.

- [ ] **Step 5: Create .env with DATABASE_URL**

```
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 6: Run Prisma migration**

```bash
cd backend && npx prisma migrate dev --name init
```

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add Prisma schema for auth and meetup contexts"
```

---

### Task 8: Express app skeleton

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/index.ts`

- [ ] **Step 1: Create app.ts**

Reference: `~/src/order_skills_sample/backend/src/app.ts`

Express app setup with:
- JSON body parser
- OpenAPI validation middleware
- Error handler middleware
- Swagger UI at `/docs`
- **Placeholder route comments** for auth, community, member routes (will be wired in Tasks 13, 19, 20 as controllers are created)

> **Important:** Do NOT import controllers that don't exist yet. Use comments like `// TODO: mount auth routes (Task 13)` as placeholders.

- [ ] **Step 2: Create index.ts**

Start server on port 3000 (or PORT env).

- [ ] **Step 3: Verify server starts**

```bash
cd backend && npx tsx src/index.ts &
# verify it starts without errors, then kill it
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add Express app skeleton with middleware stack"
```

---

## Phase 1: Auth Context

### Task 9: Auth — Account model and domain logic

**Files:**
- Create: `backend/src/auth/models/account.ts`
- Create: `backend/src/auth/models/schemas/account.schema.ts`
- Create: `backend/src/auth/models/__tests__/account.test.ts`
- Create: `backend/src/auth/errors/auth-errors.ts`

- [ ] **Step 1: Write tests for createAccount factory**

Test: successful creation with valid data, validation failures.

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Define auth error types**

```typescript
export type RegisterAccountError =
  | { type: 'DuplicateEmail'; email: string }

export type LoginError =
  | { type: 'InvalidCredentials' }
```

- [ ] **Step 4: Implement Account model**

Readonly interface: `id: AccountId`, `name`, `email`, `passwordHash`, `createdAt`.
Factory function: `createAccount()` returns `Result<Account, never>`.
Zod schema for validation.

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add Account model with factory function and error types"
```

---

### Task 10: Auth — Services (PasswordHasher, TokenService)

**Files:**
- Create: `backend/src/auth/services/password-hasher.ts`
- Create: `backend/src/auth/services/bcrypt-password-hasher.ts`
- Create: `backend/src/auth/services/token-service.ts`
- Create: `backend/src/auth/services/jwt-token-service.ts`
- Create: `backend/src/auth/services/__tests__/services.test.ts`

- [ ] **Step 1: Write tests**

Test: hash/verify password, generate/verify JWT token.

Reference: `~/src/order_skills_sample/backend/src/identity/services/`

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement PasswordHasher interface + BcryptPasswordHasher**

- [ ] **Step 4: Implement TokenService interface + JwtTokenService**

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add PasswordHasher and TokenService with bcrypt/JWT implementations"
```

---

### Task 11: Auth — Repository

**Files:**
- Create: `backend/src/auth/repositories/account.repository.ts`
- Create: `backend/src/auth/repositories/prisma-account.repository.ts`

- [ ] **Step 1: Define AccountRepository interface**

Methods: `findByEmail(email)`, `save(account)`, `findById(id)`

- [ ] **Step 2: Implement PrismaAccountRepository**

Reference: `~/src/order_skills_sample/backend/src/identity/repositories/`

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add AccountRepository interface and Prisma implementation"
```

---

### Task 12: Auth — Register and Login UseCases

**Files:**
- Create: `backend/src/auth/usecases/register.usecase.ts`
- Create: `backend/src/auth/usecases/login.usecase.ts`
- Create: `backend/src/auth/usecases/__tests__/register.usecase.test.ts`
- Create: `backend/src/auth/usecases/__tests__/login.usecase.test.ts`

- [ ] **Step 1: Write tests for register usecase**

Test: successful registration, duplicate email error.

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement register usecase**

- Validate input via Zod schema
- Check duplicate email
- Hash password via PasswordHasher
- Create Account via factory
- Save via repository
- Return Result<Account, RegisterAccountError>

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Write tests for login usecase**

Test: successful login returns JWT, invalid email, invalid password.

- [ ] **Step 6: Run test — verify fail**

- [ ] **Step 7: Implement login usecase**

- Find account by email
- Verify password via PasswordHasher
- Generate JWT via TokenService
- Return Result<{ token: string }, LoginError>

- [ ] **Step 8: Run tests — verify pass**

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add register and login usecases"
```

---

### Task 13: Auth — Controller with OpenAPI

**Files:**
- Create: `backend/src/auth/controllers/auth.controller.ts`
- Create: `backend/src/auth/controllers/auth-openapi.ts`
- Create: `backend/src/auth/controllers/auth-error-mappings.ts`
- Create: `backend/src/auth/controllers/__tests__/auth.e2e.test.ts`

- [ ] **Step 1: Write E2E tests**

Test: POST /auth/register (success, duplicate email), POST /auth/login (success, invalid credentials).

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement auth-openapi.ts**

Register OpenAPI schemas for register/login request/response using zod-to-openapi.

- [ ] **Step 4: Implement auth-error-mappings.ts**

Map RegisterAccountError and LoginError to HTTP status codes.

- [ ] **Step 5: Implement auth.controller.ts**

Express Router with POST /auth/register and POST /auth/login.
Wire up usecases, error mappings.

- [ ] **Step 6: Wire auth routes into app.ts**

- [ ] **Step 7: Run E2E tests — verify pass**

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add auth controller with OpenAPI registration and E2E tests"
```

---

## Phase 2: Meetup Context

### Task 14: Meetup — Community model and domain logic

**Files:**
- Create: `backend/src/meetup/models/community.ts`
- Create: `backend/src/meetup/models/schemas/community.schema.ts`
- Create: `backend/src/meetup/models/__tests__/community.test.ts`

- [ ] **Step 1: Write tests for createCommunity factory**

Test: successful creation, OWNER member auto-created with ACTIVE status.

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement Community model**

Readonly interface with id, name, description, category, visibility, createdAt, updatedAt, members.
Factory: `createCommunity()` returns `Result<{ community: Community; ownerMember: CommunityMember }, never>`.

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Community model with factory function"
```

---

### Task 15: Meetup — CommunityMember model and domain logic

**Files:**
- Create: `backend/src/meetup/models/community-member.ts`
- Create: `backend/src/meetup/models/schemas/member.schema.ts`
- Create: `backend/src/meetup/models/__tests__/community-member.test.ts`
- Create: `backend/src/meetup/errors/meetup-errors.ts`

- [ ] **Step 1: Write tests for joinCommunity**

Test: PUBLIC join → ACTIVE, PRIVATE join → PENDING, duplicate join error, already member error.

- [ ] **Step 2: Write tests for leaveCommunity**

Test: successful leave, OWNER cannot leave error.

- [ ] **Step 3: Run tests — verify fail**

- [ ] **Step 4: Define meetup error types**

```typescript
export type CreateCommunityError =
  | { type: 'DuplicateCommunityName'; name: string }
  | { type: 'TooManyCommunities' }

export type JoinCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'AlreadyMember' }

export type LeaveCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'OwnerCannotLeave' }

export type ApproveMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' }
  | { type: 'MemberAlreadyActive' }

export type RejectMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' }

export type GetCommunityError =
  | { type: 'CommunityNotFound' }

export type ListMembersError =
  | { type: 'CommunityNotFound' }

export type ListCommunitiesError = never  // エラーなし

// Domain event type
export type CommunityCreatedEvent = {
  type: 'CommunityCreated'
  communityId: CommunityId
  accountId: AccountId
  name: string
  occurredAt: Date
}
```

- [ ] **Step 5: Implement CommunityMember model**

Functions: `joinCommunity()`, `leaveCommunity()`, `approveMember()`, `rejectMember()`.
Each returns appropriate Result type.

- [ ] **Step 6: Run tests — verify pass**

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add CommunityMember model with join/leave/approve/reject logic"
```

---

### Task 16: Meetup — Repositories

**Files:**
- Create: `backend/src/meetup/repositories/community.repository.ts`
- Create: `backend/src/meetup/repositories/prisma-community.repository.ts`
- Create: `backend/src/meetup/repositories/community-member.repository.ts`
- Create: `backend/src/meetup/repositories/prisma-community-member.repository.ts`

- [ ] **Step 1: Define CommunityRepository interface**

Methods: `findById(id)`, `findByName(name)`, `save(community)`, `findAll(options: { category?, limit, offset })`, `countByOwnerAccountId(accountId)`

- [ ] **Step 2: Implement PrismaCommunityRepository**

- [ ] **Step 3: Define CommunityMemberRepository interface**

Methods: `findByIds(communityId, accountId)`, `save(member)`, `delete(id)`, `findByCommunityId(communityId, options)`, `findById(id)`

- [ ] **Step 4: Implement PrismaCommunityMemberRepository**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add community and member repository interfaces and Prisma implementations"
```

---

### Task 17: Meetup — Community UseCases (create, get, list)

**Files:**
- Create: `backend/src/meetup/usecases/create-community.usecase.ts`
- Create: `backend/src/meetup/usecases/get-community.usecase.ts`
- Create: `backend/src/meetup/usecases/list-communities.usecase.ts`
- Create: `backend/src/meetup/usecases/__tests__/create-community.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/get-community.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/list-communities.usecase.test.ts`

- [ ] **Step 1: Write tests for create-community usecase**

Test: success (community created + owner member), duplicate name, too many communities (>10).

- [ ] **Step 2: Run test — verify fail**

- [ ] **Step 3: Implement create-community usecase**

Publish `CommunityCreatedEvent` via Event Bus after successful creation (no handler needed yet — future extension point).

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Write tests for get-community usecase**

Test: success (PUBLIC), PRIVATE visible to members, PRIVATE returns CommunityNotFound for non-members.

> **Note:** `getCommunity()` takes optional `requestingAccountId?: AccountId`. For PRIVATE communities, checks if the account is a member. Uses optional auth middleware at the controller level.

- [ ] **Step 6: Implement get-community usecase**

- [ ] **Step 7: Write tests for list-communities usecase**

Test: returns PUBLIC only, category filter, pagination.

- [ ] **Step 8: Implement list-communities usecase**

- [ ] **Step 9: Run all tests — verify pass**

- [ ] **Step 10: Commit**

```bash
git commit -m "feat: add create, get, list community usecases"
```

---

### Task 18: Meetup — Member UseCases (join, leave, approve, reject, list)

**Files:**
- Create: `backend/src/meetup/usecases/join-community.usecase.ts`
- Create: `backend/src/meetup/usecases/leave-community.usecase.ts`
- Create: `backend/src/meetup/usecases/approve-member.usecase.ts`
- Create: `backend/src/meetup/usecases/reject-member.usecase.ts`
- Create: `backend/src/meetup/usecases/list-members.usecase.ts`
- Create: `backend/src/meetup/usecases/__tests__/join-community.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/leave-community.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/approve-member.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/reject-member.usecase.test.ts`
- Create: `backend/src/meetup/usecases/__tests__/list-members.usecase.test.ts`

- [ ] **Step 1: Write tests for join-community**

Test: PUBLIC → ACTIVE, PRIVATE → PENDING, already member, community not found.

- [ ] **Step 2: Implement join-community usecase**

- [ ] **Step 3: Write tests for leave-community**

Test: success, owner cannot leave, not a member.

- [ ] **Step 4: Implement leave-community usecase**

- [ ] **Step 5: Write tests for approve-member**

Test: success (PENDING → ACTIVE), not authorized (not OWNER/ADMIN), already active, member not found.

- [ ] **Step 6: Implement approve-member usecase**

- [ ] **Step 7: Write tests for reject-member**

Test: success (member record deleted), not authorized, member not found.

- [ ] **Step 8: Implement reject-member usecase**

- [ ] **Step 9: Write tests for list-members**

Test: returns ACTIVE members with pagination, community not found.

- [ ] **Step 10: Implement list-members usecase**

- [ ] **Step 11: Run all tests — verify pass**

- [ ] **Step 12: Commit**

```bash
git commit -m "feat: add join, leave, approve, reject, list member usecases"
```

---

### Task 19: Meetup — Community Controller with OpenAPI

**Files:**
- Create: `backend/src/meetup/controllers/community.controller.ts`
- Create: `backend/src/meetup/controllers/community-openapi.ts`
- Create: `backend/src/meetup/controllers/community-error-mappings.ts`
- Create: `backend/src/meetup/controllers/__tests__/community.e2e.test.ts`

- [ ] **Step 1: Write E2E tests**

Test: POST /communities (success, 201), GET /communities (list with filter), GET /communities/:id (success, 404), GET /communities?member=me (my communities, requires auth).

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement community-openapi.ts**

Register schemas: CreateCommunityRequest, CommunityResponse, CommunityListResponse with pagination query params.

- [ ] **Step 4: Implement community-error-mappings.ts**

- [ ] **Step 5: Implement community.controller.ts**

Routes: POST /communities, GET /communities (supports `?category=TECH&limit=20&offset=0&member=me`), GET /communities/:id

> **MyCommunitiesPage support:** `GET /communities?member=me` with auth required. The `list-communities.usecase.ts` accepts optional `memberAccountId` parameter. When provided, returns communities where the user is an ACTIVE member instead of PUBLIC communities.

- [ ] **Step 6: Wire routes into app.ts**

- [ ] **Step 7: Run E2E tests — verify pass**

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add community controller with OpenAPI and E2E tests"
```

---

### Task 20: Meetup — Member Controller with OpenAPI

**Files:**
- Create: `backend/src/meetup/controllers/member.controller.ts`
- Create: `backend/src/meetup/controllers/member-openapi.ts`
- Create: `backend/src/meetup/controllers/member-error-mappings.ts`
- Create: `backend/src/meetup/controllers/__tests__/member.e2e.test.ts`

- [ ] **Step 1: Write E2E tests**

Test:
- POST /communities/:id/members (join, 201)
- DELETE /communities/:id/members/me (leave, 204)
- GET /communities/:id/members (list)
- PATCH /communities/:id/members/:memberId/approve (approve, 200)
- PATCH /communities/:id/members/:memberId/reject (reject, 204)
- Error cases: not found, not authorized, already member

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement member-openapi.ts**

- [ ] **Step 4: Implement member-error-mappings.ts**

- [ ] **Step 5: Implement member.controller.ts**

- [ ] **Step 6: Wire routes into app.ts**

- [ ] **Step 7: Run E2E tests — verify pass**

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add member controller with OpenAPI and E2E tests"
```

---

### Task 21: Seed data

**Files:**
- Create: `backend/prisma/seed.ts`

- [ ] **Step 1: Implement seed script**

Create:
- 3 accounts: alice/bob/charlie (with hashed passwords)
- 3 communities: TypeScript勉強会(TECH/PUBLIC), スタートアップ交流会(BUSINESS/PUBLIC), 読書サークル(HOBBY/PRIVATE)
- Memberships: alice=OWNER of all 3, bob=MEMBER of first 2, charlie=MEMBER of first

- [ ] **Step 2: Add seed config to package.json**

```json
"prisma": {
  "schema": "prisma/schema",
  "seed": "npx tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add seed data with sample accounts and communities"
```

---

### Task 22: Backend quality gates

- [ ] **Step 1: Run full test suite with coverage**

```bash
cd backend && npm run test:coverage
```

Verify 80%+ coverage.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Fix any issues**

- [ ] **Step 4: Commit fixes if needed**

```bash
git commit -m "fix: resolve lint and coverage issues"
```

---

## Phase 3: Frontend

### Task 23: Initialize frontend project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`

- [ ] **Step 1: Create frontend via Vite template**

```bash
cd /Users/eiji/src/ai-driven-sample/copilot-cli
npm create vite@latest frontend -- --template react-ts
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Tailwind**

Add Tailwind to vite.config.ts and index.css.

- [ ] **Step 4: Configure Vite proxy**

```typescript
// vite.config.ts
server: {
  proxy: {
    '/auth': { target: 'http://localhost:3000', changeOrigin: true },
    '/communities': { target: 'http://localhost:3000', changeOrigin: true },
  }
}
```

- [ ] **Step 5: Configure vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    globals: true,
  },
})
```

- [ ] **Step 6: Create test-setup.ts**

```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 7: Configure ESLint for frontend**

Vite template generates eslint.config.js. Verify it includes react-hooks and react-refresh plugins. Add `"test": "vitest run"` and `"lint": "eslint src"` scripts to package.json if not present.

- [ ] **Step 8: Setup App.tsx with React Router**

Basic router setup with placeholder routes.

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: initialize frontend with React, Vite, Tailwind, React Router"
```

---

### Task 24: Frontend — API client and types

**Files:**
- Create: `frontend/src/lib/api-client.ts`
- Create: `frontend/src/lib/token.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/__tests__/api-client.test.ts`
- Create: `frontend/src/lib/__tests__/token.test.ts`

- [ ] **Step 1: Write tests for token utilities**

Test: getToken/setToken/removeToken using localStorage.

- [ ] **Step 2: Implement token.ts**

```typescript
const TOKEN_KEY = 'auth_token'
export function getToken(): string | null
export function setToken(token: string): void
export function removeToken(): void
```

- [ ] **Step 3: Write tests for API client**

Test: adds auth header when token exists, omits when not, handles JSON responses, handles error responses.

- [ ] **Step 4: Implement api-client.ts**

Fetch wrapper with JWT auth header injection, JSON parsing, error handling.

- [ ] **Step 5: Define types.ts**

TypeScript interfaces matching backend API: Account, Community, CommunityMember, API request/response types, pagination.

- [ ] **Step 6: Run tests — verify pass**

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add API client, token utilities, and shared types"
```

---

### Task 25: Frontend — AuthContext and auth hooks

**Files:**
- Create: `frontend/src/contexts/AuthContext.tsx`
- Create: `frontend/src/hooks/useAuth.ts`
- Create: `frontend/src/hooks/__tests__/useAuth.test.ts`

- [ ] **Step 1: Write tests for useAuth hook**

Test: login sets token and user, logout clears state, register + auto-login.

- [ ] **Step 2: Implement AuthContext.tsx**

React Context + Provider. Stores current user + token. On mount, checks localStorage for existing token.

- [ ] **Step 3: Implement useAuth.ts**

Hook consuming AuthContext: `login()`, `register()`, `logout()`, `user`, `isAuthenticated`.

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add AuthContext and useAuth hook"
```

---

### Task 26: Frontend — Auth pages (Login, Register)

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/pages/__tests__/LoginPage.test.tsx`
- Create: `frontend/src/pages/__tests__/RegisterPage.test.tsx`

- [ ] **Step 1: Write component tests for LoginPage**

Test: renders form, shows validation errors, calls login on submit, redirects on success.

- [ ] **Step 2: Implement LoginPage.tsx**

Form with email + password. Uses useAuth().login(). Redirects to / on success.

- [ ] **Step 3: Write component tests for RegisterPage**

Test: renders form, validation, calls register on submit.

- [ ] **Step 4: Implement RegisterPage.tsx**

Form with name + email + password. Uses useAuth().register(). Redirects to / on success.

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add Login and Register pages"
```

---

### Task 27: Frontend — Community hooks

**Files:**
- Create: `frontend/src/hooks/useCommunities.ts`
- Create: `frontend/src/hooks/useMembers.ts`
- Create: `frontend/src/hooks/__tests__/useCommunities.test.ts`
- Create: `frontend/src/hooks/__tests__/useMembers.test.ts`

- [ ] **Step 1: Write tests for useCommunities**

Test: fetchCommunities with filters, createCommunity, getCommunity.

- [ ] **Step 2: Implement useCommunities.ts**

- [ ] **Step 3: Write tests for useMembers**

Test: joinCommunity, leaveCommunity, listMembers, approveMember, rejectMember.

- [ ] **Step 4: Implement useMembers.ts**

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add useCommunities and useMembers hooks"
```

---

### Task 28: Frontend — Common UI components

**Files:**
- Create: `frontend/src/components/Button.tsx`
- Create: `frontend/src/components/Input.tsx`
- Create: `frontend/src/components/Card.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/__tests__/Button.test.tsx`
- Create: `frontend/src/components/__tests__/Input.test.tsx`
- Create: `frontend/src/components/__tests__/Card.test.tsx`

- [ ] **Step 1: Write component tests**

Test: Button renders, handles click, shows loading state. Input renders, handles change. Card renders children.

- [ ] **Step 2: Implement components with Tailwind CSS**

- [ ] **Step 3: Implement Layout.tsx**

Header with nav (logo, links, login/logout), main content area.

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add common UI components (Button, Input, Card, Layout)"
```

---

### Task 29: Frontend — Community pages

**Files:**
- Create: `frontend/src/pages/CommunityListPage.tsx`
- Create: `frontend/src/pages/CommunityDetailPage.tsx`
- Create: `frontend/src/pages/CommunityCreatePage.tsx`
- Create: `frontend/src/pages/MyCommunitiesPage.tsx`
- Create: `frontend/src/pages/__tests__/CommunityListPage.test.tsx`
- Create: `frontend/src/pages/__tests__/CommunityDetailPage.test.tsx`
- Create: `frontend/src/pages/__tests__/CommunityCreatePage.test.tsx`

- [ ] **Step 1: Write tests for CommunityListPage**

Test: renders community cards, category filter works, pagination.

- [ ] **Step 2: Implement CommunityListPage.tsx**

Fetch and display communities with category filter dropdown and pagination. Each community shown as a Card.

- [ ] **Step 3: Write tests for CommunityDetailPage**

Test: shows community info, member list, join/leave button based on auth state.

- [ ] **Step 4: Implement CommunityDetailPage.tsx**

Show community details + member list. Join/leave button. OWNER/ADMIN see pending members with approve/reject.

- [ ] **Step 5: Write tests for CommunityCreatePage**

Test: form renders, validation, submit calls createCommunity, redirect on success.

- [ ] **Step 6: Implement CommunityCreatePage.tsx**

Form: name, description, category (select), visibility (radio). Submit creates community.

- [ ] **Step 7: Write tests for MyCommunitiesPage**

Test: renders user's communities, shows empty state when not a member of any.

- [ ] **Step 8: Implement MyCommunitiesPage.tsx**

Fetch communities via `GET /communities?member=me`. Requires authenticated user.

- [ ] **Step 9: Wire all routes in App.tsx**

```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/" element={<CommunityListPage />} />
  <Route path="/communities/new" element={<CommunityCreatePage />} />
  <Route path="/communities/:id" element={<CommunityDetailPage />} />
  <Route path="/my-communities" element={<MyCommunitiesPage />} />
</Routes>
```

- [ ] **Step 10: Run all tests — verify pass**

- [ ] **Step 11: Commit**

```bash
git commit -m "feat: add community pages (list, detail, create, my-communities)"
```

---

## Phase 4: E2E Tests & Integration

### Task 30: Playwright E2E setup and tests

**Files:**
- Create: `e2e/package.json`
- Create: `e2e/playwright.config.ts`
- Create: `e2e/tests/auth.spec.ts`
- Create: `e2e/tests/community.spec.ts`
- Create: `e2e/tests/member.spec.ts`

- [ ] **Step 1: Initialize E2E project**

```bash
mkdir -p e2e
cd e2e
npm init -y
npm install -D @playwright/test
npx playwright install
```

- [ ] **Step 2: Configure playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  webServer: [
    {
      command: 'cd ../backend && npm run dev',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: 'cd ../frontend && npm run dev',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
  use: {
    baseURL: 'http://localhost:5173',
  },
})
```

- [ ] **Step 3: Write auth E2E tests**

Test: register new account → login → verify auth state persists.

- [ ] **Step 4: Write community E2E tests**

Test: login → create community → verify in list → view detail.

- [ ] **Step 5: Write member E2E tests**

Test: user A creates community → user B joins → user A sees member → (PRIVATE) user A approves.

- [ ] **Step 6: Run E2E tests**

```bash
cd e2e && npx playwright test
```

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add Playwright E2E tests for auth, community, and member flows"
```

---

### Task 31: Final quality gates and cleanup

- [ ] **Step 1: Run backend test coverage**

```bash
cd backend && npm run test:coverage
```

Verify 80%+.

- [ ] **Step 2: Run frontend tests**

```bash
cd frontend && npm test
```

- [ ] **Step 3: Run E2E tests**

```bash
cd e2e && npx playwright test
```

- [ ] **Step 4: Run lint on both projects**

```bash
cd backend && npm run lint
cd ../frontend && npm run lint
```

- [ ] **Step 5: Fix any issues**

- [ ] **Step 6: Final commit**

```bash
git commit -m "chore: final quality gate pass — all tests green, lint clean"
```

---

## AgentTeams Execution Strategy

Tasks can be parallelized using AgentTeams as follows:

### Sequential (must complete in order):
- **Lead**: Phase 0 (Tasks 1-8) — Foundation must be done first

### Parallel Wave 1 (after Phase 0):
- **Teammate A (Backend Auth)**: Tasks 9-13
- **Teammate B (Backend Meetup)**: Tasks 14-16 (models/repos can start in parallel)
  - Tasks 17-20 depend on auth middleware (Task 6, already done) and auth controller (Task 13) for E2E test helpers

### Parallel Wave 2 (after backend auth + meetup core):
- **Teammate C (Frontend)**: Tasks 23-29
- **Teammate B (Backend)**: Tasks 21-22 (seed + quality gates)

### Integration & QA (after backend + frontend functional):
- **Teammate D (QA/Integration)**: Tasks 30-31 + integration testing
  - Start backend (`npm run dev`) and frontend (`npm run dev`)
  - Run Playwright E2E tests
  - Manually verify full user flows: register → login → create community → join → approve
  - Check API responses match OpenAPI spec (Swagger UI at /docs)
  - Report issues back to relevant teammates for fixing
  - Verify seed data loads correctly and demo is functional
  - Final quality gates: coverage 80%+, lint clean, all E2E green
