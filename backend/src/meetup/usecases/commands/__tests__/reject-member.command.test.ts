import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RejectMemberCommand } from '../reject-member.command';
import type { CommunityRepository } from '../../../repositories/community.repository';
import type { CommunityMemberRepository } from '../../../repositories/community-member.repository';
import type { Community } from '../../../models/community';
import type { CommunityMember } from '../../../models/community-member';
import { createCommunityId } from '@shared/schemas/id-factories';
import { createCommunityMemberId } from '@shared/schemas/id-factories';
import { createAccountId } from '@shared/schemas/id-factories';

// ============================================================
// テスト用フィクスチャ
// ============================================================

const community: Community = {
  id: createCommunityId('community-1'),
  name: 'テストコミュニティ',
  description: null,
  category: 'TECH',
  visibility: 'PRIVATE',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const ownerAccountId = createAccountId('owner-account-1');
const targetMemberId = createCommunityMemberId('target-member-1');

const ownerMember: CommunityMember = {
  id: createCommunityMemberId('owner-member-1'),
  communityId: community.id,
  accountId: ownerAccountId,
  role: 'OWNER',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const adminMember: CommunityMember = {
  id: createCommunityMemberId('admin-member-1'),
  communityId: community.id,
  accountId: createAccountId('admin-account-1'),
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const pendingMember: CommunityMember = {
  id: targetMemberId,
  communityId: community.id,
  accountId: createAccountId('pending-account-1'),
  role: 'MEMBER',
  status: 'PENDING',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const regularMember: CommunityMember = {
  id: createCommunityMemberId('regular-member-1'),
  communityId: community.id,
  accountId: createAccountId('regular-account-1'),
  role: 'MEMBER',
  status: 'ACTIVE',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const makeCommunityRepository = (): CommunityRepository => ({
  findById: vi.fn().mockResolvedValue(community),
  findByName: vi.fn().mockResolvedValue(null),
  save: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue({ communities: [], total: 0 }),
  countByOwnerAccountId: vi.fn().mockResolvedValue(0),
});

const makeMemberRepository = (): CommunityMemberRepository => ({
  findByIds: vi.fn().mockResolvedValue(ownerMember),
  findById: vi.fn().mockResolvedValue(pendingMember),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  findByCommunityId: vi.fn().mockResolvedValue({ members: [], total: 0 }),
});

// ============================================================
// テスト
// ============================================================

describe('RejectMemberCommand', () => {
  let communityRepo: CommunityRepository;
  let memberRepo: CommunityMemberRepository;
  let useCase: RejectMemberCommand;

  beforeEach(() => {
    communityRepo = makeCommunityRepository();
    memberRepo = makeMemberRepository();
    useCase = new RejectMemberCommand(communityRepo, memberRepo);
  });

  describe('正常系', () => {
    it('OWNERがPENDINGメンバーを拒否するとメンバーレコードを削除する', async () => {
      const result = await useCase.execute({
        communityId: community.id,
        requesterAccountId: ownerAccountId,
        targetMemberId,
      });

      expect(result.ok).toBe(true);
      expect(memberRepo.delete).toHaveBeenCalledWith(targetMemberId);
    });

    it('ADMINがPENDINGメンバーを拒否できる', async () => {
      vi.mocked(memberRepo.findByIds).mockResolvedValue(adminMember);

      const result = await useCase.execute({
        communityId: community.id,
        requesterAccountId: adminMember.accountId,
        targetMemberId,
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('異常系', () => {
    it('コミュニティが存在しない場合はCommunityNotFoundエラーを返す', async () => {
      vi.mocked(communityRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute({
        communityId: createCommunityId('non-existent'),
        requesterAccountId: ownerAccountId,
        targetMemberId,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('CommunityNotFound');
      }
    });

    it('リクエスターがメンバーでない場合はNotAuthorizedエラーを返す', async () => {
      vi.mocked(memberRepo.findByIds).mockResolvedValue(null);

      const result = await useCase.execute({
        communityId: community.id,
        requesterAccountId: createAccountId('non-member'),
        targetMemberId,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NotAuthorized');
      }
    });

    it('MEMBERロールはNotAuthorizedエラーを返す', async () => {
      vi.mocked(memberRepo.findByIds).mockResolvedValue(regularMember);

      const result = await useCase.execute({
        communityId: community.id,
        requesterAccountId: regularMember.accountId,
        targetMemberId,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NotAuthorized');
      }
    });

    it('対象メンバーが存在しない場合はMemberNotFoundエラーを返す', async () => {
      vi.mocked(memberRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute({
        communityId: community.id,
        requesterAccountId: ownerAccountId,
        targetMemberId: createCommunityMemberId('non-existent'),
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('MemberNotFound');
      }
    });
  });
});
