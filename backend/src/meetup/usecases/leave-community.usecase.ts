import { ok, err, type Result } from '@shared/result';
import type { AccountId, CommunityId, CommunityMemberId } from '@shared/schemas/common';
import { leaveCommunity } from '../models/community-member';
import type { CommunityRepository } from '../repositories/community.repository';
import type { CommunityMemberRepository } from '../repositories/community-member.repository';
import type { LeaveCommunityError } from '../errors/meetup-errors';

// ============================================================
// コミュニティ脱退コマンド
// ============================================================

export interface LeaveCommunityCommand {
  readonly communityId: CommunityId;
  readonly accountId: AccountId;
  /** メンバーID指定で脱退する場合（所有者確認を行う） */
  readonly memberId?: CommunityMemberId;
}

// ============================================================
// コミュニティ脱退ユースケース
// ============================================================

/**
 * コミュニティ脱退ユースケース
 *
 * メンバーをコミュニティから削除する。オーナーは脱退不可。
 * memberId が指定された場合、そのメンバーが accountId の所有であることを確認する。
 */
export class LeaveCommunityUseCase {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(command: LeaveCommunityCommand): Promise<Result<void, LeaveCommunityError>> {
    // コミュニティ存在チェック
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      return err({ type: 'CommunityNotFound' });
    }

    // memberId 指定時: メンバーIDで検索し、accountId の所有確認
    if (command.memberId) {
      const memberById = await this.communityMemberRepository.findById(command.memberId);
      if (!memberById || memberById.accountId !== command.accountId) {
        return err({ type: 'MemberNotFound' });
      }
    }

    // メンバー存在チェック（communityId + accountId）
    const member = await this.communityMemberRepository.findByIds(
      command.communityId,
      command.accountId
    );
    if (!member) {
      return err({ type: 'MemberNotFound' });
    }

    // ドメインモデルで脱退チェック（オーナー不可）
    const leaveResult = leaveCommunity(member);
    if (!leaveResult.ok) {
      return leaveResult;
    }

    // メンバーレコードを削除
    await this.communityMemberRepository.delete(member.id);

    return ok(undefined);
  }
}
