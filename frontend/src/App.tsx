import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/contexts/AuthContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./auth/pages/LoginPage";
import { RegisterPage } from "./auth/pages/RegisterPage";
import { CommunityListPage } from "./meetup/pages/CommunityListPage";
import { CommunityDetailPage } from "./meetup/pages/CommunityDetailPage";
import { CommunityCreatePage } from "./meetup/pages/CommunityCreatePage";
import { MyCommunitiesPage } from "./meetup/pages/MyCommunitiesPage";

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
  );
}
