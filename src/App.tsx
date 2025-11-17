import "react-phone-input-2/lib/style.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Cart from "./Pages/Cart/Cart";
import Layout from "./Layouts/DefaultLayout";
// import About from "./Pages/About";
import Appointment from "./Pages/Appointment";
import Home from "./Pages/Home";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentCancel from "./Pages/PaymentCancel";
import DashboardApp from "./DashboardApp";
import { ReschedulePage } from "./routes/reschedule";
import { isOnOrganizationDomain } from "./utils/organization";

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
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav> */}

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
    </div>
  );
}

export default App;
