import type { PrismaClient } from '@prisma/client';
import type { RequestHandler } from 'express';
import { PrismaCommunityRepository } from './repositories/prisma-community.repository';
import { PrismaCommunityMemberRepository } from './repositories/prisma-community-member.repository';
import { PrismaEventRepository } from './repositories/prisma-event.repository';
import { InMemoryEventBus } from '@shared/event-bus';
import { CreateCommunityCommand } from './usecases/commands/create-community.command';
import { JoinCommunityCommand } from './usecases/commands/join-community.command';
import { LeaveCommunityCommand } from './usecases/commands/leave-community.command';
import { ApproveMemberCommand } from './usecases/commands/approve-member.command';
import { RejectMemberCommand } from './usecases/commands/reject-member.command';
import { CreateEventCommand } from './usecases/commands/create-event.command';
import { GetCommunityQuery } from './usecases/queries/get-community.query';
import { ListCommunitiesQuery } from './usecases/queries/list-communities.query';
import { ListMembersQuery } from './usecases/queries/list-members.query';
import { ListMembersReadQuery } from './usecases/queries/list-members-read.query';
import { CommunityMemberRole } from './models/schemas/member.schema';
import { createRequireCommunityRole } from '@shared/middleware/community-role.middleware';
import type { CommunityCreatedEvent } from './errors/community-errors';

// ============================================================
// Community コンテキスト 依存性構成
// ============================================================

export interface CommunityDependencies {
  readonly createCommunityCommand: CreateCommunityCommand;
  readonly getCommunityQuery: GetCommunityQuery;
  readonly listCommunitiesQuery: ListCommunitiesQuery;
}

export interface EventDependencies {
  readonly createEventCommand: CreateEventCommand;
  readonly requireCommunityRole: RequestHandler;
}

export interface MemberDependencies {
  readonly joinCommunityCommand: JoinCommunityCommand;
  readonly leaveCommunityCommand: LeaveCommunityCommand;
  readonly listMembersQuery: ListMembersQuery;
  readonly approveMemberCommand: ApproveMemberCommand;
  readonly rejectMemberCommand: RejectMemberCommand;
  readonly listMembersReadQuery: ListMembersReadQuery;
}

/**
 * Community コンテキストの依存性を構成する（Composition Root）
 */
export function createCommunityDependencies(prisma: PrismaClient): {
  community: CommunityDependencies;
  member: MemberDependencies;
  event: EventDependencies;
} {
  const communityRepository = new PrismaCommunityRepository(prisma);
  const communityMemberRepository = new PrismaCommunityMemberRepository(prisma);
  const eventBus = new InMemoryEventBus<CommunityCreatedEvent>();

  return {
    community: {
      createCommunityCommand: new CreateCommunityCommand(
        communityRepository,
        communityMemberRepository,
        eventBus
      ),
      getCommunityQuery: new GetCommunityQuery(communityRepository, communityMemberRepository),
      listCommunitiesQuery: new ListCommunitiesQuery(communityRepository),
    },
    member: {
      joinCommunityCommand: new JoinCommunityCommand(
        communityRepository,
        communityMemberRepository
      ),
      leaveCommunityCommand: new LeaveCommunityCommand(
        communityRepository,
        communityMemberRepository
      ),
      listMembersQuery: new ListMembersQuery(communityRepository, communityMemberRepository),
      approveMemberCommand: new ApproveMemberCommand(
        communityRepository,
        communityMemberRepository
      ),
      rejectMemberCommand: new RejectMemberCommand(communityRepository, communityMemberRepository),
      listMembersReadQuery: new ListMembersReadQuery(prisma),
    },
    event: {
      createEventCommand: new CreateEventCommand(
        communityRepository,
        new PrismaEventRepository(prisma)
      ),
      requireCommunityRole: createRequireCommunityRole(
        communityMemberRepository,
        CommunityMemberRole.OWNER,
        CommunityMemberRole.ADMIN
      ),
    },
  };
}
