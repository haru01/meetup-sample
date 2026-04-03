# ミートアップサイト (Meetup) - Issue一覧

ミートアップサイトのAPIストーリー一覧。

## ユーザージャーニー

### 1. アカウント登録〜ログイン

1. **新規登録** — ユーザーはメールアドレス・パスワード・表示名で**アカウントを作成**する
2. **ログイン** — メールアドレスとパスワードで**JWTトークンを取得**する

> **Note**: メール認証・プロフィール設定は本プロジェクトではスコープ外（最小限の認証のみ実装）

### 2. コミュニティの運営（オーナー視点）

1. **コミュニティ作成** — オーナーがテーマ・カテゴリ・公開設定（PUBLIC/PRIVATE）を決めて**コミュニティを立ち上げる**
2. **参加申請の管理**（PRIVATEの場合） — 届いた参加申請を**承認 or 拒否**する

> **Note**: イベント管理（作成・公開・キャンセル等）はフェーズ3以降で対応予定

### 3. コミュニティへの参加（メンバー視点）

1. **コミュニティ検索** — カテゴリで**興味のあるコミュニティを探す**
2. **参加** — PUBLICなら即参加、PRIVATEなら承認待ち（`PENDING` → `ACTIVE`）
3. **脱退** — コミュニティから**脱退**する（オーナーは脱退不可）

> **Note**: イベント参加・キャンセル待ち等はフェーズ3-4以降で対応予定

### 4. 発見と通知

> **Note**: 横断検索・AIレコメンド・通知はフェーズ5-6で対応予定（スコープ外）

---

## DONEの定義

Issueが「完了」となるための条件:

- [x] 受け入れ条件がすべて満たされている
- [x] UseCaseのユニットテストが通過する
- [x] E2Eテストが通過する
- [x] カバレッジ80%以上、lint通過

---

## Phase 1: 登録・認証（最小限実装）

### MTP-001: ユーザー登録API

**概要**
ユーザーがメールアドレスとパスワードで新規アカウントを作成できるAPIを実装する。

**受け入れ条件**

- [x] メールアドレス、パスワード、表示名で登録できる
- [ ] ~~パスワードは8文字以上、英字・数字の混在が必須~~ (簡略化: バリデーション省略)
- [x] 登録済みメールアドレスは `DuplicateEmail` エラーを返す
- [ ] ~~登録直後のアカウント状態は `UNVERIFIED` である~~ (簡略化: 即時ACTIVEとして扱う)

---

### MTP-002: メール認証API

> **スコープ外**: 最小限の認証のため省略

---

### MTP-003: ログインAPI

**概要**
ユーザーがメールアドレスとパスワードでJWTアクセストークンを取得できるAPIを実装する。

**受け入れ条件**

- [x] メールアドレスとパスワードが正しければJWTトークンを返す
- [x] 存在しないメールアドレスまたは誤ったパスワードは `InvalidCredentials` エラーを返す
- [ ] ~~`UNVERIFIED` 状態のアカウントはログイン不可~~ (メール認証なし)
- [ ] ~~`SUSPENDED` 状態のアカウントはログイン不可~~ (サスペンド機能なし)

---

### MTP-004: プロフィール登録・更新API

> **スコープ外**: 最小限の認証のため省略

---

## Phase 2: コミュニティ管理

### MTP-005: コミュニティ作成API

**概要**
ユーザーが特定のテーマに基づくコミュニティを作成できるAPIを実装する。

**受け入れ条件**

- [x] 名前、説明（最大1000文字）、カテゴリ、公開設定（PUBLIC / PRIVATE）でコミュニティを作成できる
- [x] 作成者は自動的にオーナーとなる
- [x] 名前は1〜100文字、同一名のコミュニティは作成不可 (`DuplicateCommunityName` エラー)
- [x] 1ユーザーあたり作成できるコミュニティは最大10件

---

### MTP-006: コミュニティ参加・脱退API

**概要**
ユーザーがコミュニティに参加・脱退できるAPIを実装する。

**受け入れ条件**

- [x] コミュニティIDを指定して参加できる
- [x] `PRIVATE` コミュニティへの参加は承認待ち状態 (`PENDING`) になる
- [x] `PUBLIC` コミュニティへの参加は即時承認 (`ACTIVE`) になる
- [x] オーナーは脱退不可 (`OwnerCannotLeave` エラー)
- [x] 参加済みコミュニティへの再参加は `AlreadyMember` エラーを返す

---

### MTP-007: コミュニティ参加承認・拒否API（オーナー・管理者）

**概要**
コミュニティのオーナーまたは管理者がPRIVATEコミュニティへの参加申請を承認・拒否できるAPIを実装する。

**受け入れ条件**

- [x] オーナーまたは管理者のみ操作可能、それ以外は `NotAuthorized` エラー
- [x] 承認後のメンバーステータスは `ACTIVE` になる
- [x] 拒否後の申請は削除される
- [x] 存在しないメンバーIDは `MemberNotFound` エラーを返す

---

### MTP-008: コミュニティ詳細取得API

**概要**
ユーザーがコミュニティの詳細情報を取得できるAPIを実装する。

**受け入れ条件**

- [x] コミュニティID、名前、説明、カテゴリ、公開設定、作成日時が返される
- [x] `PRIVATE` コミュニティの詳細はメンバーのみ取得可能（非メンバーには `CommunityNotFound`）
- [x] 存在しないコミュニティIDは `CommunityNotFound` エラーを返す

---

### MTP-009: コミュニティ一覧・検索API

**概要**
ユーザーがカテゴリでコミュニティを検索できるAPIを実装する。

**受け入れ条件**

- [ ] ~~キーワードで名前・説明を全文検索できる~~ (簡略化: キーワード検索は未実装)
- [x] カテゴリでフィルタリングできる
- [x] `PUBLIC` コミュニティのみ返す（非ログインユーザーも可）
- [x] ページネーション対応（limit/offsetパラメータ）
- [x] 検索結果が0件の場合は空配列を返す
- [x] `?member=me` で自分が参加中のコミュニティを取得できる（認証必要）

---

## Phase 3: イベント管理

> **スコープ外**: フェーズ2までの実装に絞っている

### MTP-010: イベント作成API

- [ ] タイトル、説明、開催日時、終了日時、開催形式、定員でイベントを作成できる
- [ ] 開始日時は現在時刻より未来でなければならない
- [ ] 作成直後のイベント状態は `DRAFT` である

### MTP-011: イベント公開API

- [ ] `DRAFT` → `PUBLISHED` 遷移
- [ ] 公開時に `EventPublishedEvent` 発行

### MTP-012: イベント更新API

- [ ] `DRAFT` / `PUBLISHED` のみ更新可能

### MTP-013: イベントキャンセルAPI

- [ ] `PUBLISHED` → `CANCELLED` 遷移

### MTP-014: イベント詳細取得API

- [ ] イベント詳細情報の取得

### MTP-015: イベント一覧取得API

- [ ] コミュニティのイベント一覧取得

---

## Phase 4: イベント参加申込

> **スコープ外**

### MTP-016: イベント参加申込API

- [ ] イベントへの参加申込

### MTP-017: イベント参加キャンセルAPI

- [ ] 参加キャンセル（開始1時間前まで）

### MTP-018: キャンセル待ち登録API

- [ ] 定員満員時のキャンセル待ち

### MTP-019: イベント参加者一覧取得API

- [ ] 主催者向け参加者一覧

---

## Phase 5: 検索・レコメンド

> **スコープ外**

### MTP-020: イベント横断検索API

- [ ] キーワード・条件でサイト横断検索

### MTP-021: AIイベントレコメンドAPI

- [ ] AI によるイベントスコアリング・レコメンド

### MTP-022: AIコミュニティレコメンドAPI

- [ ] AI によるコミュニティスコアリング・レコメンド

---

## Phase 6: 通知

> **スコープ外**

### MTP-023: 通知一覧取得API

- [ ] ユーザー宛通知一覧

### MTP-024: 通知既読API

- [ ] 通知の既読処理

---

## エラー型定義（実装済み）

```typescript
// src/auth/errors/auth-errors.ts
export type RegisterAccountError =
  | { type: 'DuplicateEmail'; email: string };

export type LoginError =
  | { type: 'InvalidCredentials' };

// src/meetup/errors/meetup-errors.ts
export type CreateCommunityError =
  | { type: 'DuplicateCommunityName'; name: string }
  | { type: 'TooManyCommunities' };

export type JoinCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'AlreadyMember' };

export type LeaveCommunityError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'OwnerCannotLeave' };

export type ApproveMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' }
  | { type: 'MemberAlreadyActive' };

export type RejectMemberError =
  | { type: 'CommunityNotFound' }
  | { type: 'MemberNotFound' }
  | { type: 'NotAuthorized' };

export type GetCommunityError =
  | { type: 'CommunityNotFound' };

export type ListMembersError =
  | { type: 'CommunityNotFound' };

export type ListCommunitiesError = never;
```

---

## ステータス遷移

### コミュニティメンバーステータス

```text
PENDING → ACTIVE（承認）
        ↘ （拒否 → レコード削除 → 再申請可能）
```

> **Note**: OWNER は脱退不可

---

## 依存関係

```text
Phase 1（登録・認証）  ← 最小限実装済み
  └─ Phase 2（コミュニティ管理）  ← 実装済み
       └─ Phase 3（イベント管理）  ← 未実装
            └─ Phase 4（イベント参加申込）  ← 未実装
  └─ Phase 5（検索・レコメンド）  ← 未実装
  └─ Phase 6（通知）  ← 未実装
```

---

## 実装ステータスまとめ

| Phase | Issue | Status |
|-------|-------|--------|
| 1 | MTP-001 ユーザー登録 | :white_check_mark: 実装済み（簡略版） |
| 1 | MTP-002 メール認証 | :no_entry: スコープ外 |
| 1 | MTP-003 ログイン | :white_check_mark: 実装済み（簡略版） |
| 1 | MTP-004 プロフィール | :no_entry: スコープ外 |
| 2 | MTP-005 コミュニティ作成 | :white_check_mark: 実装済み |
| 2 | MTP-006 参加・脱退 | :white_check_mark: 実装済み |
| 2 | MTP-007 承認・拒否 | :white_check_mark: 実装済み |
| 2 | MTP-008 詳細取得 | :white_check_mark: 実装済み |
| 2 | MTP-009 一覧・検索 | :white_check_mark: 実装済み（キーワード検索除く） |
| 3 | MTP-010〜015 イベント管理 | :black_square_button: 未実装 |
| 4 | MTP-016〜019 イベント参加 | :black_square_button: 未実装 |
| 5 | MTP-020〜022 検索・AI | :black_square_button: 未実装 |
| 6 | MTP-023〜024 通知 | :black_square_button: 未実装 |
