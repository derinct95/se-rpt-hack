import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppShell from "./components/layout/AppShell";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { CompareProvider } from "./context/CompareContext";
import CompareView from "./pages/CompareView";
import DashboardPage from "./pages/DashboardPage";
import PracticeReviewPage from "./pages/PracticeReviewPage";
import ProviderDetailPage from "./pages/ProviderDetailPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

interface BackgroundLocationState {
  backgroundLocation?: { pathname: string };
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BackgroundLocationState | null;
  const isOverlayRoute = location.pathname.startsWith("/providers/") || location.pathname === "/compare";
  const backgroundLocation = state?.backgroundLocation || (isOverlayRoute ? { pathname: "/dashboard" } : undefined);

  useEffect(() => {
    if (isOverlayRoute && !state?.backgroundLocation) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: { backgroundLocation: { pathname: "/dashboard" } },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage practiceType="medical" />} />
          <Route path="/dashboard/dental" element={<DashboardPage practiceType="dental" />} />
          <Route path="/practice-review" element={<PracticeReviewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/providers/:id"
            element={
              <ProtectedRoute>
                <ProviderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <CompareView />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CompareProvider>
          <ChatProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ChatProvider>
        </CompareProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
