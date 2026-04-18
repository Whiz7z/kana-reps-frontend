import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ColorModeProvider } from "@/context/ColorModeContext";
import { AuthProvider } from "@/context/AuthContext";
import { RequireAdmin, RequireAuth } from "@/components/RequireAuth";
import { Layout } from "@/pages/Layout";
import { Home } from "@/pages/Home";
import { Menu } from "@/pages/Menu";
import { Custom } from "@/pages/Custom";
import { Words } from "@/pages/Words";
import { Practice } from "@/pages/Practice";
import { Profile } from "@/pages/Profile";
import { Admin } from "@/pages/Admin";

export default function App() {
  return (
    <ColorModeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/custom" element={<Custom />} />
              <Route path="/words" element={<Words />} />
              <Route path="/practice" element={<Practice />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </ColorModeProvider>
  );
}
