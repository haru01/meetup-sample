import { ok, err, type Result } from '@shared/result';
import type { AccountId, CommunityId, CommunityMemberId } from '@shared/schemas/common';
import type { CommunityMember } from '../../models/community-member';
import { approveMember } from '../../models/community-member';
import { CommunityMemberRole } from '../../models/schemas/member.schema';
import type { CommunityRepository } from '../../repositories/community.repository';
import type { CommunityMemberRepository } from '../../repositories/community-member.repository';
import type { ApproveMemberError } from '../../errors/meetup-errors';

// ============================================================
// メンバー承認コマンド
// ============================================================

export interface ApproveMemberInput {
  readonly communityId: CommunityId;
  readonly requesterAccountId: AccountId;
  readonly targetMemberId: CommunityMemberId;
}

// ============================================================
// メンバー承認ユースケース
// ============================================================

/**
 * メンバー承認ユースケース
 *
 * OWNER または ADMIN のみがメンバーを承認できる。
 * PENDING → ACTIVE に遷移する。
 */
export class ApproveMemberCommand {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(
    command: ApproveMemberInput
  ): Promise<Result<CommunityMember, ApproveMemberError>> {
    // コミュニティ存在チェック
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      return err({ type: 'CommunityNotFound' });
    }

    // リクエスターのメンバー情報取得
    const requester = await this.communityMemberRepository.findByIds(
      command.communityId,
      command.requesterAccountId
    );

    // OWNER または ADMIN のみ承認可能
    if (
      !requester ||
      (requester.role !== CommunityMemberRole.OWNER && requester.role !== CommunityMemberRole.ADMIN)
    ) {
      return err({ type: 'NotAuthorized' });
    }

    // 対象メンバー取得
    const targetMember = await this.communityMemberRepository.findById(command.targetMemberId);
    if (!targetMember) {
      return err({ type: 'MemberNotFound' });
    }

    // ドメインモデルで承認（PENDING → ACTIVE）
    const approveResult = approveMember(targetMember);
    if (!approveResult.ok) {
      return approveResult;
    }

    // 保存
    await this.communityMemberRepository.save(approveResult.value);

    return ok(approveResult.value);
  }
}
