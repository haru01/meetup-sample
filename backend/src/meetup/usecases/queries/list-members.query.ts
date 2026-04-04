import { ok, err, type Result } from '@shared/result';
import type { CommunityId } from '@shared/schemas/common';
import type { CommunityMember } from '../../models/community-member';
import type { CommunityRepository } from '../../repositories/community.repository';
import type { CommunityMemberRepository } from '../../repositories/community-member.repository';
import type { ListMembersError } from '../../errors/meetup-errors';

// ============================================================
// メンバー一覧取得コマンド
// ============================================================

export interface ListMembersInput {
  readonly communityId: CommunityId;
  readonly limit: number;
  readonly offset: number;
}

export type ListMembersResult = {
  readonly members: CommunityMember[];
  readonly total: number;
};

// ============================================================
// メンバー一覧取得ユースケース
// ============================================================

/**
 * メンバー一覧取得ユースケース
 *
 * コミュニティのメンバー一覧をページネーションで返す。
 */
export class ListMembersQuery {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(command: ListMembersInput): Promise<Result<ListMembersResult, ListMembersError>> {
    // コミュニティ存在チェック
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      return err({ type: 'CommunityNotFound' });
    }

    const { members, total } = await this.communityMemberRepository.findByCommunityId(
      command.communityId,
      { limit: command.limit, offset: command.offset }
    );

    return ok({ members, total });
  }
}
