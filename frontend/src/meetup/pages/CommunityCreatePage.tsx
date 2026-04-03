import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCommunities } from "../hooks/useCommunities";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import type { Category, Visibility } from "../types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "TECH", label: "テクノロジー" },
  { value: "BUSINESS", label: "ビジネス" },
  { value: "HOBBY", label: "趣味" },
];

export const CommunityCreatePage = () => {
  const navigate = useNavigate();
  const { createCommunity, loading, error } = useCommunities();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("TECH");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name || !description) {
      setValidationError("名前と説明を入力してください");
      return;
    }

    const community = await createCommunity({
      name,
      description,
      category,
      visibility,
    });
    if (community) {
      navigate(`/communities/${community.id}`);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <h1 className="mb-6 text-2xl font-bold">コミュニティ作成</h1>
        {displayError && (
          <div
            className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600"
            role="alert"
          >
            {displayError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            label="コミュニティ名"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              カテゴリ
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label
              htmlFor="visibility"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              公開設定
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="PUBLIC">公開</option>
              <option value="PRIVATE">非公開</option>
            </select>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            作成
          </Button>
        </form>
      </Card>
    </div>
  );
};
