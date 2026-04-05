import { ok, err, type Result } from '@shared/result';
import type { AccountId, CommunityId, CommunityMemberId } from '@shared/schemas/common';
import type { CommunityMember } from '../../models/community-member';
import { joinCommunity } from '../../models/community-member';
import type { CommunityRepository } from '../../repositories/community.repository';
import type { CommunityMemberRepository } from '../../repositories/community-member.repository';
import type { JoinCommunityError } from '../../errors/community-errors';

// ============================================================
// コミュニティ参加コマンド
// ============================================================

export interface JoinCommunityInput {
  readonly communityId: CommunityId;
  readonly accountId: AccountId;
  readonly memberId: CommunityMemberId;
}

// ============================================================
// コミュニティ参加ユースケース
// ============================================================

/**
 * コミュニティ参加ユースケース
 *
 * PUBLIC → ACTIVE、PRIVATE → PENDING でメンバーを追加する。
 */
export class JoinCommunityCommand {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(
    command: JoinCommunityInput
  ): Promise<Result<CommunityMember, JoinCommunityError>> {
    // コミュニティ存在チェック
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      return err({ type: 'CommunityNotFound' });
    }

    // 既存メンバーチェック
    const existingMember = await this.communityMemberRepository.findByIds(
      command.communityId,
      command.accountId
    );
    if (existingMember) {
      return err({ type: 'AlreadyMember' });
    }

    // ドメインモデルでメンバー生成
    const memberResult = joinCommunity({
      community,
      accountId: command.accountId,
      memberId: command.memberId,
    });

    if (!memberResult.ok) return memberResult;
    const member = memberResult.value;

    // リポジトリに保存
    await this.communityMemberRepository.save(member);

    return ok(member);
  }
}
