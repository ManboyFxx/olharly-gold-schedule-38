
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
import ProfessionalCalendar from "./pages/ProfessionalCalendar";
import SlugHandler from "./pages/SlugHandler";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <SubscriptionProvider>
                  {/* <OfflineIndicator /> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/booking" element={<PublicBooking />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Calendar />
                    </ProtectedRoute>
                  } />
                  <Route path="/services" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Services />
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Clients />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-booking" element={
                    <ProtectedRoute>
                      <MyBooking />
                    </ProtectedRoute>
                  } />
                  <Route path="/professional-calendar" element={
                    <ProtectedRoute allowedRoles={['professional']}>
                      <ProfessionalCalendar />
                    </ProtectedRoute>
                  } />
                  <Route path="/plans" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Plans />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={['organization_admin']}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  {/* Catch-all route para slugs de profissionais ou 404 */}
                  <Route path="/:slug" element={<SlugHandler />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {/* <PWAInstallPrompt /> */}
                  {/* <Toaster /> */}
                  {/* <Sonner /> */}
                </SubscriptionProvider>
              </OrganizationProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
  );
}

export default App;
