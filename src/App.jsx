import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OnboardingFlow = lazy(() => import("./pages/Onboarding"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentErrorPage = lazy(() => import('./pages/PaymentErrorPage'));
const PaymentWarningPage = lazy(() => import('./pages/PaymentWarningPage'));
const GoogleCallbackPage = lazy(() => import('./pages/GoogleCallbackPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-2 border-[#6300ff]/30 border-t-[#6300ff] rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/enterprise" element={<EnterprisePage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/error" element={<PaymentErrorPage />} />
              <Route path="/payment/warning" element={<PaymentWarningPage />} />
              <Route path="/auth/google-callback" element={<GoogleCallbackPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              <Route path="*" element={<h1>hey, this page dont exist :b</h1>} />
            </Routes>
          </Suspense>
        </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
