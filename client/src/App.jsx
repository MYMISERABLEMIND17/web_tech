import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import AppShell from "./components/AppShell";
import RouteTransition from "./components/RouteTransition";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Network from "./pages/Network";

// 🔥 Layout wrapper (WITH CHAT)
function AppLayout({ children }) {
  return (
    <AppShell variant="app">
      <Navbar />

      <main className="py-5">
        <RouteTransition>{children}</RouteTransition>
      </main>

      {/* Floating Chat Box */}
      <div className="fixed bottom-4 right-4 w-80 z-50">
        <ChatBox />
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes (hero-only 3D) */}
          <Route
            path="/login"
            element={
              <AppShell variant="auth">
                <RouteTransition>
                  <Login />
                </RouteTransition>
              </AppShell>
            }
          />
          <Route
            path="/register"
            element={
              <AppShell variant="auth">
                <RouteTransition>
                  <Register />
                </RouteTransition>
              </AppShell>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Feed />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Network />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}