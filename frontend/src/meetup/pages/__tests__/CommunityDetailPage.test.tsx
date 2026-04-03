import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CommunityDetailPage } from "../CommunityDetailPage";
import {
  AuthContext,
  type AuthContextType,
} from "../../../auth/contexts/AuthContext";

const mockGetCommunity = vi.fn();
const mockListMembers = vi.fn();
const mockJoinCommunity = vi.fn();
const mockLeaveCommunity = vi.fn();
const mockApproveMember = vi.fn();
const mockRejectMember = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useParams: () => ({ id: "c1" }) };
});

vi.mock("../../hooks/useCommunities", () => ({
  useCommunities: () => ({
    community: {
      id: "c1",
      name: "Test Community",
      description: "Test description",
      category: "TECH",
      visibility: "PUBLIC",
      createdAt: "",
      updatedAt: "",
    },
    loading: false,
    error: null,
    getCommunity: mockGetCommunity,
  }),
}));

vi.mock("../../hooks/useMembers", () => ({
  useMembers: () => ({
    members: [
      {
        id: "m1",
        communityId: "c1",
        accountId: "owner1",
        role: "OWNER",
        status: "ACTIVE",
        createdAt: "",
      },
      {
        id: "m2",
        communityId: "c1",
        accountId: "user1",
        role: "MEMBER",
        status: "ACTIVE",
        createdAt: "",
      },
    ],
    loading: false,
    error: null,
    listMembers: mockListMembers,
    joinCommunity: mockJoinCommunity,
    leaveCommunity: mockLeaveCommunity,
    approveMember: mockApproveMember,
    rejectMember: mockRejectMember,
  }),
}));

const createAuthContext = (
  overrides: Partial<AuthContextType> = {},
): AuthContextType => ({
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  ...overrides,
});

describe("CommunityDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("コミュニティ詳細をレンダリングする", () => {
    render(
      <AuthContext.Provider value={createAuthContext()}>
        <MemoryRouter>
          <CommunityDetailPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText("Test Community")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("メンバー一覧を表示する", () => {
    render(
      <AuthContext.Provider value={createAuthContext()}>
        <MemoryRouter>
          <CommunityDetailPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText("メンバー一覧")).toBeInTheDocument();
    expect(screen.getByText("owner1")).toBeInTheDocument();
    expect(screen.getByText("user1")).toBeInTheDocument();
  });

  it("オーナーには承認・拒否ボタンが表示される", () => {
    render(
      <AuthContext.Provider
        value={createAuthContext({
          user: {
            id: "owner1",
            email: "owner@test.com",
            name: "Owner",
            createdAt: "",
          },
          isAuthenticated: true,
        })}
      >
        <MemoryRouter>
          <CommunityDetailPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText("承認")).toBeInTheDocument();
    expect(screen.getByText("拒否")).toBeInTheDocument();
  });

  it("未参加ユーザーには参加ボタンが表示される", () => {
    render(
      <AuthContext.Provider
        value={createAuthContext({
          user: {
            id: "newuser",
            email: "new@test.com",
            name: "New",
            createdAt: "",
          },
          isAuthenticated: true,
        })}
      >
        <MemoryRouter>
          <CommunityDetailPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText("参加する")).toBeInTheDocument();
  });
});
