import type { PrismaClient } from '@prisma/client';
import { PrismaCommunityRepository } from './repositories/prisma-community.repository';
import { PrismaCommunityMemberRepository } from './repositories/prisma-community-member.repository';
import { InMemoryEventBus } from '@shared/event-bus';
import { CreateCommunityUseCase } from './usecases/create-community.usecase';
import { GetCommunityUseCase } from './usecases/get-community.usecase';
import { ListCommunitiesUseCase } from './usecases/list-communities.usecase';
import { JoinCommunityUseCase } from './usecases/join-community.usecase';
import { LeaveCommunityUseCase } from './usecases/leave-community.usecase';
import { ListMembersUseCase } from './usecases/list-members.usecase';
import { ApproveMemberUseCase } from './usecases/approve-member.usecase';
import { RejectMemberUseCase } from './usecases/reject-member.usecase';
import type { CommunityCreatedEvent } from './errors/meetup-errors';

// ============================================================
// Meetup コンテキスト 依存性構成
// ============================================================

export interface CommunityDependencies {
  readonly createCommunityUseCase: CreateCommunityUseCase;
  readonly getCommunityUseCase: GetCommunityUseCase;
  readonly listCommunitiesUseCase: ListCommunitiesUseCase;
}

export interface MemberDependencies {
  readonly joinCommunityUseCase: JoinCommunityUseCase;
  readonly leaveCommunityUseCase: LeaveCommunityUseCase;
  readonly listMembersUseCase: ListMembersUseCase;
  readonly approveMemberUseCase: ApproveMemberUseCase;
  readonly rejectMemberUseCase: RejectMemberUseCase;
}

/**
 * Meetup コンテキストの依存性を構成する（Composition Root）
 */
export function createMeetupDependencies(prisma: PrismaClient): {
  community: CommunityDependencies;
  member: MemberDependencies;
} {
  const communityRepository = new PrismaCommunityRepository(prisma);
  const communityMemberRepository = new PrismaCommunityMemberRepository(prisma);
  const eventBus = new InMemoryEventBus<CommunityCreatedEvent>();

  return {
    community: {
      createCommunityUseCase: new CreateCommunityUseCase(
        communityRepository,
        communityMemberRepository,
        eventBus
      ),
      getCommunityUseCase: new GetCommunityUseCase(communityRepository, communityMemberRepository),
      listCommunitiesUseCase: new ListCommunitiesUseCase(communityRepository),
    },
    member: {
      joinCommunityUseCase: new JoinCommunityUseCase(communityRepository, communityMemberRepository),
      leaveCommunityUseCase: new LeaveCommunityUseCase(
        communityRepository,
        communityMemberRepository
      ),
      listMembersUseCase: new ListMembersUseCase(communityRepository, communityMemberRepository),
      approveMemberUseCase: new ApproveMemberUseCase(
        communityRepository,
        communityMemberRepository
      ),
      rejectMemberUseCase: new RejectMemberUseCase(communityRepository, communityMemberRepository),
    },
  };
}
