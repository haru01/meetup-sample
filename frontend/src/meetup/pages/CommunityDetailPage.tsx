import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCommunities } from "../hooks/useCommunities";
import { useMembers } from "../hooks/useMembers";
import { useAuth } from "../../auth/hooks/useAuth";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    community,
    loading: communityLoading,
    error: communityError,
    getCommunity,
  } = useCommunities();
  const {
    members,
    loading: membersLoading,
    error: membersError,
    listMembers,
    joinCommunity,
    leaveCommunity,
    approveMember,
    rejectMember,
  } = useMembers();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      getCommunity(id);
      listMembers(id);
    }
  }, [id, getCommunity, listMembers]);

  if (communityLoading) return <p>読み込み中...</p>;
  if (communityError) return <p className="text-red-600">{communityError}</p>;
  if (!community) return <p>コミュニティが見つかりません</p>;

  const isOwner = members.some(
    (m) => m.accountId === user?.id && m.role === "OWNER",
  );
  const currentMember = members.find((m) => m.accountId === user?.id);

  const handleJoin = async () => {
    if (id && user) {
      const success = await joinCommunity(id, user.id);
      if (success) listMembers(id);
    }
  };

  const handleLeave = async () => {
    if (id && currentMember) {
      const success = await leaveCommunity(id, currentMember.id);
      if (success) listMembers(id);
    }
  };

  const handleApprove = async (memberId: string) => {
    if (id) await approveMember(id, memberId);
  };

  const handleReject = async (memberId: string) => {
    if (id) await rejectMember(id, memberId);
  };

  return (
    <div>
      <Card className="mb-6">
        <h1 className="text-2xl font-bold">{community.name}</h1>
        <p className="mt-2 text-gray-600">{community.description}</p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
            {community.category}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
            {community.visibility === "PUBLIC" ? "公開" : "非公開"}
          </span>
        </div>

        {isAuthenticated && !isOwner && !currentMember && (
          <Button onClick={handleJoin} className="mt-4">
            参加する
          </Button>
        )}
        {isAuthenticated && currentMember && !isOwner && (
          <Button onClick={handleLeave} variant="danger" className="mt-4">
            退会する
          </Button>
        )}
      </Card>

      <h2 className="mb-4 text-xl font-semibold">メンバー一覧</h2>
      {membersLoading && <p>読み込み中...</p>}
      {membersError && <p className="text-red-600">{membersError}</p>}

      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{member.accountId}</p>
              <p className="text-sm text-gray-500">
                {member.role} / {member.status}
              </p>
            </div>
            {isOwner && member.role !== "OWNER" && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleApprove(member.id)}
                >
                  承認
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReject(member.id)}
                >
                  拒否
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
