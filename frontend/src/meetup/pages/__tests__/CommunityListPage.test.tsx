import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CommunityListPage } from "../CommunityListPage";
import {
  AuthContext,
  type AuthContextType,
} from "../../../auth/contexts/AuthContext";

const mockFetchCommunities = vi.fn();
const mockCommunities = [
  {
    id: "1",
    name: "Tech Community",
    description: "Tech desc",
    category: "TECH" as const,
    visibility: "PUBLIC" as const,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    name: "Art Community",
    description: "Art desc",
    category: "HOBBY" as const,
    visibility: "PRIVATE" as const,
    createdAt: "",
    updatedAt: "",
  },
];

vi.mock("../../hooks/useCommunities", () => ({
  useCommunities: () => ({
    communities: mockCommunities,
    loading: false,
    error: null,
    fetchCommunities: mockFetchCommunities,
  }),
}));

const authCtx: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const renderPage = () =>
  render(
    <AuthContext.Provider value={authCtx}>
      <MemoryRouter>
        <CommunityListPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("CommunityListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("コミュニティ一覧をレンダリングする", () => {
    renderPage();
    expect(screen.getByText("Tech Community")).toBeInTheDocument();
    expect(screen.getByText("Art Community")).toBeInTheDocument();
  });

  it("fetchCommunities を呼び出す", () => {
    renderPage();
    expect(mockFetchCommunities).toHaveBeenCalled();
  });

  it("カテゴリでフィルタリングできる", async () => {
    renderPage();
    const select = screen.getByLabelText("カテゴリフィルター");
    await userEvent.selectOptions(select, "TECH");

    await waitFor(() => {
      expect(screen.getByText("Tech Community")).toBeInTheDocument();
      expect(screen.queryByText("Art Community")).not.toBeInTheDocument();
    });
  });

  it("見出しが表示される", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "コミュニティ一覧" }),
    ).toBeInTheDocument();
  });
});
