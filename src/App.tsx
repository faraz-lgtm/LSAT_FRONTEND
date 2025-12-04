import "react-phone-input-2/lib/style.css";
import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./Layouts/DefaultLayout";
import DashboardApp from "./DashboardApp";
import { ReschedulePage } from "./routes/reschedule";
import { isOnOrganizationDomain } from "./utils/organization";

// Code splitting: Lazy load pages to reduce initial bundle size
const Cart = lazy(() => import("./Pages/Cart/Cart"));
const Appointment = lazy(() => import("./Pages/Appointment"));
const Home = lazy(() => import("./Pages/Home"));
const PaymentSuccess = lazy(() => import("./Pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./Pages/PaymentCancel"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./Pages/TermsOfService"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Component to handle domain/slug-based routing
function DomainOrSlugHome() {
  // If slug is provided, show Home page (backend will handle organization context via slug)
  // The slug will be available in the URL and can be used by the backend
  return <Home />;
}

// Component to handle root redirect
function RootRedirect() {
  // If we're on an organization's actual domain (e.g., betterlsat.com), show home directly
  if (isOnOrganizationDomain()) {
    // On actual domain, show home page directly (backend will detect organization from domain)
    return <Home />;
  }
  
  // On generic environment (localhost/prod), redirect to default slug
  // Default to 'betterlsat' if not configured
  const defaultSlug = import.meta.env.VITE_DEFAULT_SLUG || 'betterlsat';
  
  // Redirect to slug-based route (e.g., /betterlsat)
  return <Navigate to={`/${defaultSlug}`} replace />;
}

// Component to handle free purchase route
function FreePurchaseRedirect() {
  // If we're on an organization's actual domain (e.g., betterlsat.com), show appointment directly
  if (isOnOrganizationDomain()) {
    return <Appointment />;
  }

  // On generic environment (localhost/prod), redirect to default slug version of the route
  const defaultSlug = import.meta.env.VITE_DEFAULT_SLUG || 'betterlsat';
  return <Navigate to={`/${defaultSlug}/free_purchase`} replace />;
}

function App() {
  return (
    <div>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Specific routes first to avoid matching domain pattern */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/reschedule" element={<ReschedulePage />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
          <Route path="/dashboard/*" element={<DashboardApp />} />
          
          {/* Organization routes - slug-based for generic envs, domain-based for actual domains */}
          <Route element={<Layout />}>
            {/* Non-slug customer routes */}
            <Route path="/privacy_policy" element={<PrivacyPolicy />} />
            <Route path="/terms_of_service" element={<TermsOfService />} />
            {/* Slug-based routes - matches paths like /betterlsat/cart, /betterlsat/Appointment */}
            <Route path="/:slug/cart" element={<Cart />} />
            <Route path="/:slug/Appointment" element={<Appointment />} />
            <Route path="/:slug/free_purchase" element={<Appointment />} />
            <Route path="/free_purchase" element={<FreePurchaseRedirect />} />
            {/* Slug route - matches paths like /betterlsat (for generic local/prod envs) */}
            <Route path="/:slug" element={<DomainOrSlugHome />} />
            {/* Root - shows home if on actual domain, redirects to slug if on generic env */}
            <Route path="/" element={<RootRedirect />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
