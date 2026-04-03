import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CommunityListPage } from './pages/CommunityListPage'
import { CommunityDetailPage } from './pages/CommunityDetailPage'
import { CommunityCreatePage } from './pages/CommunityCreatePage'
import { MyCommunitiesPage } from './pages/MyCommunitiesPage'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<CommunityListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/communities/new" element={<CommunityCreatePage />} />
            <Route path="/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/my-communities" element={<MyCommunitiesPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
