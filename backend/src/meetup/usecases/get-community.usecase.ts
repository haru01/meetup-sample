import { ok, err, type Result } from '@shared/result';
import type { AccountId, CommunityId } from '@shared/schemas/common';
import type { Community } from '../models/community';
import type { CommunityRepository } from '../repositories/community.repository';
import type { CommunityMemberRepository } from '../repositories/community-member.repository';
import type { GetCommunityError } from '../errors/meetup-errors';

// ============================================================
// コミュニティ取得コマンド
// ============================================================

export interface GetCommunityCommand {
  readonly communityId: CommunityId;
  readonly requestingAccountId?: AccountId;
}

// ============================================================
// コミュニティ取得ユースケース
// ============================================================

/**
 * コミュニティ取得ユースケース
 *
 * PUBLIC は誰でも閲覧可能。PRIVATE はメンバーのみ閲覧可能。
 */
export class GetCommunityUseCase {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly communityMemberRepository: CommunityMemberRepository
  ) {}

  async execute(command: GetCommunityCommand): Promise<Result<Community, GetCommunityError>> {
    const community = await this.communityRepository.findById(command.communityId);
    if (!community) {
      return err({ type: 'CommunityNotFound' });
    }

    // PUBLIC は誰でも閲覧可能
    if (community.visibility === 'PUBLIC') {
      return ok(community);
    }

    // PRIVATE はメンバーのみ閲覧可能
    if (!command.requestingAccountId) {
      return err({ type: 'CommunityNotFound' });
    }

    const member = await this.communityMemberRepository.findByIds(
      community.id,
      command.requestingAccountId
    );

    if (!member) {
      return err({ type: 'CommunityNotFound' });
    }

    return ok(community);
  }
}
