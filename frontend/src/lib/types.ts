// --- Union types ---

export type Category = 'TECH' | 'BUSINESS' | 'HOBBY'

export type Visibility = 'PUBLIC' | 'PRIVATE'

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'

export type MemberStatus = 'PENDING' | 'ACTIVE'

// --- Domain entities ---

export type Account = {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: string
}

export type Community = {
  readonly id: string
  readonly name: string
  readonly description: string | null
  readonly category: Category
  readonly visibility: Visibility
  readonly createdAt: string
  readonly updatedAt: string
}

export type CommunityMember = {
  readonly id: string
  readonly communityId: string
  readonly accountId: string
  readonly role: Role
  readonly status: MemberStatus
  readonly createdAt: string
}

// --- API Error ---

export type ApiError = {
  readonly type: string
  readonly message: string
}

// --- Auth request/response types ---

export type RegisterRequest = {
  email: string
  password: string
  name: string
}

export type RegisterResponse = {
  account: Account
  token: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  account: Account
  token: string
}

// --- Community request/response types ---

export type CreateCommunityRequest = {
  name: string
  description: string
  category: Category
  visibility: Visibility
}

export type UpdateCommunityRequest = {
  name?: string
  description?: string
  category?: Category
  visibility?: Visibility
}

export type ListCommunitiesResponse = {
  communities: Community[]
}

export type CommunityResponse = {
  community: Community
}

// --- Member request/response types ---

export type JoinCommunityRequest = {
  accountId: string
}

export type UpdateMemberRoleRequest = {
  role: Role
}

export type BanMemberRequest = {
  reason?: string
}

export type ListMembersResponse = {
  members: CommunityMember[]
}

export type MemberResponse = {
  member: CommunityMember
}
