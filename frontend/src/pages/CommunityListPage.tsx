import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCommunities } from '../hooks/useCommunities'
import { Card } from '../components/Card'
import type { Category } from '../lib/types'

const CATEGORIES: Category[] = ['TECH', 'BUSINESS', 'HOBBY']

const CATEGORY_LABELS: Record<Category, string> = {
  TECH: 'テクノロジー',
  BUSINESS: 'ビジネス',
  HOBBY: '趣味',
}

export const CommunityListPage = () => {
  const { communities, loading, error, fetchCommunities } = useCommunities()
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')

  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities])

  const filtered = categoryFilter
    ? communities.filter((c) => c.category === categoryFilter)
    : communities

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">コミュニティ一覧</h1>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          aria-label="カテゴリフィルター"
        >
          <option value="">すべてのカテゴリ</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">コミュニティが見つかりません</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((community) => (
          <Link key={community.id} to={`/communities/${community.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold">{community.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{community.description}</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {CATEGORY_LABELS[community.category]}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {community.visibility === 'PUBLIC' ? '公開' : '非公開'}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
