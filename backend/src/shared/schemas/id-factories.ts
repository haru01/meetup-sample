import { randomUUID } from 'node:crypto';
import type { AccountId, CommunityId, CommunityMemberId } from './common.js';

// ============================================================
// AccountId Factories
// ============================================================

/**
 * AccountIdを生成する
 *
 * @param id 指定した場合はその文字列をAccountIdとして使用する。省略時はランダムUUIDを生成する。
 * @returns AccountId
 */
export function createAccountId(id?: string): AccountId {
  return (id ?? randomUUID()) as AccountId;
}

// ============================================================
// CommunityId Factories
// ============================================================

/**
 * CommunityIdを生成する
 *
 * @param id 指定した場合はその文字列をCommunityIdとして使用する。省略時はランダムUUIDを生成する。
 * @returns CommunityId
 */
export function createCommunityId(id?: string): CommunityId {
  return (id ?? randomUUID()) as CommunityId;
}

// ============================================================
// CommunityMemberId Factories
// ============================================================

/**
 * CommunityMemberIdを生成する
 *
 * @param id 指定した場合はその文字列をCommunityMemberIdとして使用する。省略時はランダムUUIDを生成する。
 * @returns CommunityMemberId
 */
export function createCommunityMemberId(id?: string): CommunityMemberId {
  return (id ?? randomUUID()) as CommunityMemberId;
}
