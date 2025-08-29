
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/hooks/useOrganization";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { PWAInstallPrompt } from "@/components/PWA/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/PWA/OfflineIndicator";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Calendar from "./pages/Calendar";
import Services from "./pages/Services";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Plans from "./pages/Plans";
import Reports from "./pages/Reports";
import MyBooking from "./pages/MyBooking";
import PublicBooking from "./pages/PublicBooking";
import SlugHandler from "./pages/SlugHandler";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <SubscriptionProvider>
                <OfflineIndicator />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/booking" element={<PublicBooking />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  } />
                  <Route path="/services" element={
                    <ProtectedRoute>
                      <Services />
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-booking" element={
                    <ProtectedRoute>
                      <MyBooking />
                    </ProtectedRoute>
                  } />
                  <Route path="/plans" element={
                    <ProtectedRoute>
                      <Plans />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  {/* Catch-all route para slugs de profissionais ou 404 */}
                  <Route path="/:slug" element={<SlugHandler />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PWAInstallPrompt />
                <Toaster />
                <Sonner />
              </SubscriptionProvider>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
