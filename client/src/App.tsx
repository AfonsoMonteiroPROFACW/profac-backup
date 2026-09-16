import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/page-transition";
import { CookieBanner } from "@/components/cookie-banner";
import { lazy, Suspense } from "react";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { MobileNav } from "@/components/mobile-nav";
import { useAnalytics } from "@/hooks/useAnalytics";

const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SupportPage = lazy(() => import("@/pages/support"));
const AboutPage = lazy(() => import("@/pages/about"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const TermsPage = lazy(() => import("@/pages/terms"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const AdminPanel = lazy(() => import("@/pages/admin"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminDownloads = lazy(() => import("@/pages/admin-downloads"));
const AdminTickets = lazy(() => import("@/pages/admin-tickets"));
const AdminEmail = lazy(() => import("@/pages/admin-email"));
const AdminFtp = lazy(() => import("@/pages/admin-ftp"));
const AdminComments = lazy(() => import("@/pages/admin-comments"));
const AdminSecurityBadges = lazy(() => import("@/pages/admin-security-badges"));
const AdminInvitations = lazy(() => import("@/pages/admin-invitations"));
const AdminAnalytics = lazy(() => import("@/pages/admin-analytics"));

function LazyLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(210,79%,46%)]"></div>
    </div>
  );
}

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      {children}
    </Suspense>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LazyLoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      <Component />
    </Suspense>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <LazyLoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  if (!isAdmin) {
    return <NotFound />;
  }
  
  return (
    <Suspense fallback={<LazyLoadingFallback />}>
      {children}
    </Suspense>
  );
}

function Router() {
  const [location] = useLocation();
  useAnalytics();
  
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Switch location={location} key={`route-${location}`}>
          <Route path="/">
            <PageTransition>
              <Home />
            </PageTransition>
          </Route>
          <Route path="/auth">
            <PageTransition>
              <AuthPage />
            </PageTransition>
          </Route>
          <Route path="/forgot-password">
            <PageTransition>
              <LazyRoute><ForgotPassword /></LazyRoute>
            </PageTransition>
          </Route>
          <Route path="/dashboard">
            <PageTransition>
              <ProtectedRoute component={Dashboard} />
            </PageTransition>
          </Route>
          <Route path="/support">
            <PageTransition>
              <ProtectedRoute component={SupportPage} />
            </PageTransition>
          </Route>
          <Route path="/about">
            <PageTransition>
              <LazyRoute><AboutPage /></LazyRoute>
            </PageTransition>
          </Route>
          <Route path="/privacy">
            <PageTransition>
              <LazyRoute><PrivacyPage /></LazyRoute>
            </PageTransition>
          </Route>
          <Route path="/terms">
            <PageTransition>
              <LazyRoute><TermsPage /></LazyRoute>
            </PageTransition>
          </Route>
          <Route path="/contact">
            <PageTransition>
              <LazyRoute><ContactPage /></LazyRoute>
            </PageTransition>
          </Route>
          <Route path="/admin">
            <PageTransition>
              <AdminRoute><AdminPanel /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/users">
            <PageTransition>
              <AdminRoute><AdminUsers /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/downloads">
            <PageTransition>
              <AdminRoute><AdminDownloads /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/tickets">
            <PageTransition>
              <AdminRoute><AdminTickets /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/email">
            <PageTransition>
              <AdminRoute><AdminEmail /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/ftp">
            <PageTransition>
              <AdminRoute><AdminFtp /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/comments">
            <PageTransition>
              <AdminRoute><AdminComments /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/security-badges">
            <PageTransition>
              <AdminRoute><AdminSecurityBadges /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/invitations">
            <PageTransition>
              <AdminRoute><AdminInvitations /></AdminRoute>
            </PageTransition>
          </Route>
          <Route path="/admin/analytics">
            <PageTransition>
              <AdminRoute><AdminAnalytics /></AdminRoute>
            </PageTransition>
          </Route>
          <Route>
            <PageTransition>
              <NotFound />
            </PageTransition>
          </Route>
        </Switch>
      </AnimatePresence>
      <MobileNav />
      <CookieBanner />
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="profac-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
