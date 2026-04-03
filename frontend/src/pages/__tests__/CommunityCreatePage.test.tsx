import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CommunityCreatePage } from '../CommunityCreatePage'
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext'

const mockCreateCommunity = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../hooks/useCommunities', () => ({
  useCommunities: () => ({
    createCommunity: mockCreateCommunity,
    loading: false,
    error: null,
  }),
}))

const authCtx: AuthContextType = {
  user: { id: 'u1', email: 'test@test.com', name: 'Test', createdAt: '' },
  isAuthenticated: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}

const renderPage = () =>
  render(
    <AuthContext.Provider value={authCtx}>
      <MemoryRouter>
        <CommunityCreatePage />
      </MemoryRouter>
    </AuthContext.Provider>
  )

describe('CommunityCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('作成フォームをレンダリングする', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'コミュニティ作成' })).toBeInTheDocument()
    expect(screen.getByLabelText('コミュニティ名')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByLabelText('公開設定')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
  })

  it('未入力でフォーム送信するとエラーを表示する', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: '作成' }))
    expect(screen.getByRole('alert')).toHaveTextContent('名前と説明を入力してください')
  })

  it('正しい入力で createCommunity を呼び出す', async () => {
    mockCreateCommunity.mockResolvedValue({ id: 'new1', name: 'New Community' })
    renderPage()

    await userEvent.type(screen.getByLabelText('コミュニティ名'), 'New Community')
    await userEvent.type(screen.getByLabelText('説明'), 'A new community')
    await userEvent.click(screen.getByRole('button', { name: '作成' }))

    expect(mockCreateCommunity).toHaveBeenCalledWith({
      name: 'New Community',
      description: 'A new community',
      category: 'TECH',
      visibility: 'PUBLIC',
    })
  })

  it('作成成功後にコミュニティ詳細ページに遷移する', async () => {
    mockCreateCommunity.mockResolvedValue({ id: 'new1', name: 'New Community' })
    renderPage()

    await userEvent.type(screen.getByLabelText('コミュニティ名'), 'New Community')
    await userEvent.type(screen.getByLabelText('説明'), 'A new community')
    await userEvent.click(screen.getByRole('button', { name: '作成' }))

    expect(mockNavigate).toHaveBeenCalledWith('/communities/new1')
  })
})
