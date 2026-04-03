# Meetup Sample Project Design Spec

## Overview

GitHub Copilot CLI のデモ用サンプルアプリ。meetup（コミュニティ管理）に特化したフルスタック TypeScript プロジェクト。order_skills_sample の DDD パターンをフル踏襲しつつ、スコープをフェーズ2（コミュニティ作成・参照 + メンバー管理）に絞る。

> **スコープ外**: コミュニティの更新（PUT/PATCH）・削除（DELETE）はフェーズ2の対象外。フェーズ3以降で対応予定。

## Goals

- Copilot CLI の機能デモに適したサンプルプロジェクトを提供する
- DDD、Result型、Branded Types 等の実践的パターンの学習教材としても機能する
- Claude Code でガンガン作っていくスタイルで開発する

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Runtime | Node.js 20+ / TypeScript 5.7+ |
| Backend Framework | Express.js |
| ORM | Prisma |
| Database | SQLite |
| Validation | Zod + express-openapi-validator |
| API Docs | OpenAPI 3.0 (zod-to-openapi) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Frontend Framework | React 19 + TypeScript |
| Frontend Build | Vite |
| Frontend Styling | Tailwind CSS |
| Testing | Vitest + supertest (backend) / Vitest + React Testing Library (frontend) / Playwright (E2E) |

## Project Structure

```
copilot-cli/
├── backend/
│   ├── src/
│   │   ├── auth/               # 認証コンテキスト（最小限）
│   │   │   ├── controllers/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth-openapi.ts
│   │   │   │   └── auth-error-mappings.ts
│   │   │   ├── usecases/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── register.usecase.ts
│   │   │   │   └── login.usecase.ts
│   │   │   ├── models/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── schemas/
│   │   │   │   └── account.ts
│   │   │   ├── repositories/
│   │   │   │   ├── account.repository.ts
│   │   │   │   └── prisma-account.repository.ts
│   │   │   ├── services/
│   │   │   │   ├── password-hasher.ts         # PasswordHasher インターフェース
│   │   │   │   ├── bcrypt-password-hasher.ts  # bcrypt 実装
│   │   │   │   ├── token-service.ts           # TokenService インターフェース
│   │   │   │   └── jwt-token-service.ts       # JWT 実装
│   │   │   └── errors/
│   │   │       └── auth-errors.ts
│   │   ├── meetup/             # コミュニティ管理コンテキスト
│   │   │   ├── controllers/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── community.controller.ts
│   │   │   │   ├── community-openapi.ts
│   │   │   │   ├── community-error-mappings.ts
│   │   │   │   ├── member.controller.ts
│   │   │   │   ├── member-openapi.ts
│   │   │   │   └── member-error-mappings.ts
│   │   │   ├── usecases/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── create-community.usecase.ts
│   │   │   │   ├── get-community.usecase.ts
│   │   │   │   ├── list-communities.usecase.ts
│   │   │   │   ├── join-community.usecase.ts
│   │   │   │   ├── leave-community.usecase.ts
│   │   │   │   ├── approve-member.usecase.ts
│   │   │   │   ├── reject-member.usecase.ts
│   │   │   │   └── list-members.usecase.ts
│   │   │   ├── models/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── schemas/
│   │   │   │   ├── community.ts
│   │   │   │   └── community-member.ts
│   │   │   ├── repositories/
│   │   │   │   ├── community.repository.ts
│   │   │   │   ├── prisma-community.repository.ts
│   │   │   │   ├── community-member.repository.ts
│   │   │   │   └── prisma-community-member.repository.ts
│   │   │   └── errors/
│   │   │       └── meetup-errors.ts
│   │   ├── shared/             # 共有カーネル
│   │   │   ├── result.ts           # Result<T, E> 型
│   │   │   ├── event-bus.ts        # ドメインイベントバス
│   │   │   ├── errors.ts           # 共通エラー型
│   │   │   ├── schemas/
│   │   │   │   ├── common.ts       # Branded Types 定義
│   │   │   │   └── id-factories.ts # ID ファクトリ関数
│   │   │   ├── controllers/
│   │   │   │   └── error-response.ts # ErrorResponse 型
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   └── openapi-validator.middleware.ts
│   │   │   └── openapi/
│   │   │       └── registry.ts
│   │   ├── infrastructure/
│   │   │   └── prisma.ts       # Prisma クライアント設定
│   │   └── app.ts              # Express アプリ設定
│   ├── prisma/
│   │   ├── schema/
│   │   │   ├── base.prisma     # generator & datasource
│   │   │   ├── auth.prisma     # Account モデル
│   │   │   └── meetup.prisma   # Community, CommunityMember モデル
│   │   └── seed.ts             # デモ用シードデータ
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/         # 共通 UI コンポーネント
│   │   │   ├── __tests__/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/              # ページコンポーネント
│   │   │   ├── __tests__/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── CommunityListPage.tsx
│   │   │   ├── CommunityDetailPage.tsx
│   │   │   ├── CommunityCreatePage.tsx
│   │   │   └── MyCommunitiesPage.tsx
│   │   ├── contexts/           # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/              # カスタムフック
│   │   │   ├── __tests__/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCommunities.ts
│   │   │   └── useMembers.ts
│   │   ├── lib/                # ユーティリティ・API クライアント
│   │   │   ├── __tests__/
│   │   │   ├── api-client.ts
│   │   │   ├── token.ts
│   │   │   └── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tailwind.config.js
├── e2e/                        # Playwright E2E テスト
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── community.spec.ts
│   │   └── member.spec.ts
│   └── playwright.config.ts
├── CLAUDE.md                   # 開発ガイドライン
└── README.md
```

## Architecture Patterns (order_skills_sample 踏襲)

### Result<T, E> 型

例外を投げずに関数型でエラーハンドリングする。

```typescript
type Result<T, E> = Ok<T> | Err<E>

function ok<T>(value: T): Ok<T>
function err<E>(error: E): Err<E>
```

### Branded Types

異なる ID 型の混同を型レベルで防止する。`shared/schemas/common.ts` で定義し、`shared/schemas/id-factories.ts` でファクトリ関数を提供する（order_skills_sample の配置に準拠）。

```typescript
// shared/schemas/common.ts
type CommunityId = string & { readonly __brand: 'CommunityId' }
type AccountId = string & { readonly __brand: 'AccountId' }
type CommunityMemberId = string & { readonly __brand: 'CommunityMemberId' }

// shared/schemas/id-factories.ts
function createCommunityId(id?: string): CommunityId
function createAccountId(id?: string): AccountId
```

### Discriminated Union Errors

構造化されたエラー型で網羅的なエラーハンドリングを強制する。

```typescript
// auth-errors.ts
type RegisterAccountError =
  | { type: 'DuplicateEmail'; email: string }

type LoginError =
  | { type: 'InvalidCredentials' }

// meetup-errors.ts
type CreateCommunityError =
  | { type: 'DuplicateCommunityName'; name: string }
  | { type: 'TooManyCommunities' }

type JoinCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'AlreadyMember' }

type LeaveCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'OwnerCannotLeave' }

type ApproveMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' }
  | { type: 'MemberAlreadyActive' }

type RejectMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' }

type ListMembersError =
  | { type: 'CommunityNotFound' }

type GetCommunityError =
  | { type: 'CommunityNotFound' }

type ListCommunitiesError = never  // エラーなし
```

### OpenAPI 駆動バリデーション

Zod スキーマから OpenAPI 定義を生成し、express-openapi-validator でリクエスト/レスポンスを自動検証する。

### ドメインイベント

コンテキスト間の疎結合な連携。インメモリ Event Bus で非同期サイドエフェクトを処理する。

```typescript
type CommunityCreatedEvent = {
  type: 'CommunityCreated'
  communityId: CommunityId
  accountId: AccountId
  name: string
  occurredAt: Date
}
```

> 現時点では `CommunityCreatedEvent` のハンドラは未実装（将来の通知機能等のための拡張ポイント）。イベント発行の仕組みだけ用意する。

### 層構造

```
Controller (HTTP) → UseCase (ビジネスロジック) → Repository (永続化)
                                                   Services (外部依存の抽象化)
```

- Controller: HTTP リクエスト/レスポンスの変換、OpenAPI 登録
- UseCase: ビジネスルールの実行、Result 型を返す
- Repository: インターフェース定義 + Prisma 実装
- Services: PasswordHasher, TokenService 等の外部依存をインターフェースで抽象化

## Data Models

### Account (auth)

| Field | Type | Constraints |
|-------|------|------------|
| id | AccountId (UUID) | PK |
| name | string | 1-100文字 |
| email | string | unique, email形式 |
| passwordHash | string | bcrypt ハッシュ |
| createdAt | DateTime | |

### Community (meetup)

| Field | Type | Constraints |
|-------|------|------------|
| id | CommunityId (UUID) | PK |
| name | string | unique, 1-100文字 |
| description | string? | max 1000文字 |
| category | enum | TECH / BUSINESS / HOBBY |
| visibility | enum | PUBLIC / PRIVATE |
| createdAt | DateTime | |
| updatedAt | DateTime | |

> `createdBy` フィールドは持たない。作成者は CommunityMember テーブルの OWNER ロールから導出する。`countByOwnerAccountId` リポジトリメソッドは CommunityMember(role=OWNER) を検索する。

### CommunityMember (meetup)

| Field | Type | Constraints |
|-------|------|------------|
| id | CommunityMemberId (UUID) | PK |
| communityId | CommunityId | FK → Community |
| accountId | AccountId | FK → Account |
| role | enum | OWNER / ADMIN / MEMBER |
| status | enum | PENDING / ACTIVE |
| createdAt | DateTime | |

- @@unique([communityId, accountId])
- @@index([accountId])

> **却下時の挙動**: メンバーが却下された場合、CommunityMember レコードを物理削除する。`REJECTED` ステータスは持たない。これにより、却下後の再申請が可能になる。PENDING 状態での重複参加申請は `AlreadyMember` エラーとする。

## API Endpoints

### Auth

| Method | Path | Description |
|--------|------|------------|
| POST | /auth/register | アカウント登録 |
| POST | /auth/login | ログイン（JWT 発行） |

### Community

| Method | Path | Description | Auth |
|--------|------|------------|------|
| POST | /communities | コミュニティ作成 | Required |
| GET | /communities | コミュニティ一覧 | Not Required |
| GET | /communities/:id | コミュニティ詳細 | Not Required |

> **認証不要エンドポイントの挙動**:
> - `GET /communities`: PUBLIC コミュニティのみ返す。認証済みの場合も同様（PRIVATE は一覧に含めない）。
> - `GET /communities/:id`: PUBLIC コミュニティは誰でも閲覧可。PRIVATE コミュニティはメンバーのみ閲覧可（非メンバーには 404）。

> **ページネーション**: `GET /communities` は `?category=TECH&limit=20&offset=0` のクエリパラメータをサポート。デフォルト limit=20, max limit=100。

### Member

| Method | Path | Description | Auth |
|--------|------|------------|------|
| POST | /communities/:id/members | コミュニティ参加 | Required |
| DELETE | /communities/:id/members/me | コミュニティ脱退 | Required |
| GET | /communities/:id/members | メンバー一覧 | Required (メンバーのみ) |
| PATCH | /communities/:id/members/:memberId/approve | 参加承認 | Required (OWNER/ADMIN) |
| PATCH | /communities/:id/members/:memberId/reject | 参加却下 | Required (OWNER/ADMIN) |

> **メンバー一覧**: `?limit=20&offset=0` でページネーション。ACTIVE メンバーのみ返す（PENDING は OWNER/ADMIN 向けに別途検討可能だがフェーズ2では対象外）。

> **approve/reject**: RPC スタイルのアクションエンドポイント。REST 純粋主義ではないが、意図が明確でデモ向きの設計として採用。

## Business Rules

### Community

- コミュニティ名は 1-100 文字、ユニーク
- description は最大 1000 文字（任意）
- 1 ユーザーあたり最大 10 コミュニティ作成可能（CommunityMember の OWNER ロールで集計）
- 作成者は自動的に OWNER ロールで ACTIVE メンバーになる

### Member

- PUBLIC コミュニティ: 参加即 ACTIVE
- PRIVATE コミュニティ: 参加時 PENDING → OWNER/ADMIN が承認で ACTIVE
- OWNER は脱退不可（コミュニティの孤立防止）
- 同一コミュニティへの重複参加不可（PENDING 状態含む）
- 却下されたメンバーはレコード削除 → 再申請可能

## Frontend Architecture

### 状態管理

- **AuthContext**: React Context + Provider パターンで認証状態を管理
- **JWT トークン**: localStorage に保存。`lib/token.ts` で get/set/remove を提供
- **API クライアント**: `lib/api-client.ts` で fetch ベースのクライアントを実装。AuthContext から JWT を取得し Authorization ヘッダーに自動付与

### Pages

| Page | Path | Description |
|------|------|------------|
| ログイン | /login | email + password |
| 登録 | /register | name + email + password |
| コミュニティ一覧 | / | カテゴリフィルタ + ページネーション付き |
| コミュニティ詳細 | /communities/:id | メンバー一覧、参加/脱退ボタン |
| コミュニティ作成 | /communities/new | フォーム |
| マイコミュニティ | /my-communities | 自分が参加中のコミュニティ |

## Frontend Testing Strategy

- **コンポーネントテスト**: Vitest + React Testing Library でユーザー操作・表示を検証
- **関数テスト**: カスタムフック、API クライアント、ユーティリティのユニットテスト
- **E2E テスト**: Playwright でユーザーフロー全体を検証（ログイン→コミュニティ作成→参加等）

## Backend Testing Strategy

- **ドメインユニットテスト**: モデルのファクトリ関数、ビジネスルールの検証
- **UseCase テスト**: ビジネスロジックの検証（リポジトリをモック）
- **E2E テスト**: supertest で API エンドポイントを検証（インメモリ SQLite）
- カバレッジ目標: 80%+

## Seed Data

`prisma/seed.ts` でデモ用データを投入する：

- テストアカウント 3 件（alice, bob, charlie）
- コミュニティ 3 件（TypeScript勉強会[TECH/PUBLIC], スタートアップ交流会[BUSINESS/PUBLIC], 読書サークル[HOBBY/PRIVATE]）
- メンバーシップ数件（各コミュニティに OWNER + MEMBER）

## Quality Gates

- TypeScript strict mode（型チェック）
- ESLint（コード品質）
- Prettier（フォーマット）
- Vitest カバレッジ 80%+
- 循環依存チェック
