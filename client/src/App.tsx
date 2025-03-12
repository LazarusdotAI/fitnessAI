import { Route, Switch } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./providers/auth-provider";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect } from "react";
import { useAuth } from "./hooks/use-auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user } = useAuth();

  // Attempt to restore session on app load
  useEffect(() => {
    if (!user) {
      fetch('/api/user', {
        credentials: 'include'
      }).catch(() => {
        // Ignore errors during session check
      });
    }
  }, [user]);

  return (
    <Switch>
      {/* Make auth page the default landing page */}
      <Route path="/" component={AuthPage} />
      
      {/* Protected dashboard route */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
