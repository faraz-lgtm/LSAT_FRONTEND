import "react-phone-input-2/lib/style.css";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./Layouts/DefaultLayout";
import Home from "./Pages/Home";

// Lazy load heavy pages/components
const Cart = lazy(() => import("./Pages/Cart/Cart"));
const Appointment = lazy(() => import("./Pages/Appointment"));
const PaymentSuccess = lazy(() => import("./Pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./Pages/PaymentCancel"));
const DashboardApp = lazy(() => import("./DashboardApp"));

function App() {
  return (
    <div>
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav> */}

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About />} /> */}
          <Route 
            path="/cart" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center h-64">Loading cart...</div>}>
                <Cart />
              </Suspense>
            } 
          />
          <Route 
            path="/Appointment" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center h-64">Loading appointment...</div>}>
                <Appointment />
              </Suspense>
            } 
          />
        </Route>

        <Route 
          path="/payment/success" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
              <PaymentSuccess />
            </Suspense>
          } 
        />
        <Route 
          path="/payment/cancel" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
              <PaymentCancel />
            </Suspense>
          } 
        />
        
        {/* Fallback routes for current backend configuration */}
        <Route 
          path="/success" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
              <PaymentSuccess />
            </Suspense>
          } 
        />
        <Route 
          path="/cancel" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
              <PaymentCancel />
            </Suspense>
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-64">Loading dashboard...</div>}>
              <DashboardApp />
            </Suspense>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
