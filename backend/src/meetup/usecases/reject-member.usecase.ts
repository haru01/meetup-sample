import { ok, err, type Result } from '@shared/result';
import type { AccountId, CommunityId, CommunityMemberId } from '@shared/schemas/common';
import { CommunityMemberRole } from '../models/schemas/member.schema';
import type { CommunityRepository } from '../repositories/community.repository';
import type { CommunityMemberRepository } from '../repositories/community-member.repository';
import type { RejectMemberError } from '../errors/meetup-errors';

// ============================================================
// メンバー拒否コマンド
// ============================================================

export interface RejectMemberCommand {
  readonly communityId: CommunityId;
  readonly requesterAccountId: AccountId;
  readonly targetMemberId: CommunityMemberId;
}

// ============================================================
// メンバー拒否ユースケース
// ============================================================

/**
 * メンバー拒否ユースケース
 *
 * OWNER または ADMIN のみがメンバーを拒否できる。
 * メンバーレコードを削除する。
 */
export class RejectMemberUseCase {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(command: RejectMemberCommand): Promise<Result<void, RejectMemberError>> {
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

    // OWNER または ADMIN のみ拒否可能
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

    // メンバーレコードを削除
    await this.communityMemberRepository.delete(targetMember.id);

    return ok(undefined);
  }
}
