import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import WaveBg from "./components/WaveBg";
import "./App.css";

// ── Pages (lazy) ─────────────────────────────────────────────
const LandingPage    = lazy(() => import("./pages/LandingPage"));
const Home           = lazy(() => import("./pages/Home"));
const ProductList    = lazy(() => import("./pages/ProductList"));
const ProductDetail  = lazy(() => import("./pages/ProductDetail"));
const ReviewPage     = lazy(() => import("./pages/ReviewPage"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));

// ── New architecture ─────────────────────────────────────────
const AccountPage    = lazy(() => import("./pages/AccountPage"));
const PersonalProfile = lazy(() => import("./pages/PersonalProfile"));

// Role dashboards (each wrapped with their own layout inside)
const BuyerDashboard  = lazy(() => import("./pages/BuyerDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));

// Layouts (imported eagerly so they wrap lazy page content cleanly)
import BuyerLayout  from "./layouts/BuyerLayout";
import SellerLayout from "./layouts/SellerLayout";
import DriverLayout from "./layouts/DriverLayout";

// Seller sub-pages
const StoreManager   = lazy(() => import("./components/seller/StoreManager"));
const ProductManager = lazy(() => import("./components/seller/ProductManager"));

// ── Page loader ───────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="loading-container">
    <div className="spinner" />
    <p>Memuat halaman...</p>
  </div>
);

// ── Auth guard: any logged-in user ───────────────────────────
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── Role guard: user must own the given role ─────────────────
const RoleGuard: React.FC<{
  requiredRole: string;
  children: React.ReactNode;
}> = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (!user.roles.includes(requiredRole)) {
    return (
      <Navigate
        to="/account"
        replace
        state={{ message: `Kamu belum terdaftar sebagai ${requiredRole}. Daftarkan diri kamu dari halaman Akun Saya.` }}
      />
    );
  }
  return <>{children}</>;
};

// ── Wrapper: ProductManager needs hasStore prop ───────────────
const SellerProductManagerPage: React.FC = () => {
  const [hasStore, setHasStore] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    import("./services/storeService").then(({ storeService }) => {
      storeService.getMyStore()
        .then(() => setHasStore(true))
        .catch(() => setHasStore(false));
    });
  }, []);
  if (hasStore === null) return <PageLoader />;
  return (
    <ProductManager
      hasStore={hasStore}
      onGoToStore={() => window.location.replace('/dashboard/seller/store')}
    />
  );
};

// ── Wrapper: StoreManager needs onStoreLoaded ────────────────
const SellerStorePage: React.FC = () => {
  return <StoreManager onStoreLoaded={() => {}} />;
};

// ─────────────────────────────────────────────────────────────
function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  const isLandingPage = location.pathname === "/";

  return (
    <div className="app-layout" style={{ position: "relative", overflow: "hidden" }}>
      <WaveBg />
      <Navbar />
      <main
        className={`main-content-layout ${isLandingPage ? "" : "with-navbar-padding"}`}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public ─────────────────────────────── */}
            <Route path="/"             element={<LandingPage />} />
            <Route path="/home"         element={<Home />} />
            <Route path="/products"     element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/reviews"      element={<ReviewPage />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />

            {/* ── Account hub ────────────────────────── */}
            <Route
              path="/account"
              element={<AuthGuard><AccountPage /></AuthGuard>}
            />

            {/* ── Buyer dashboard ────────────────────── */}
            <Route
              path="/dashboard/buyer"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Buyer">
                    <BuyerLayout><BuyerDashboard /></BuyerLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/buyer/profile"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Buyer">
                    <BuyerLayout><PersonalProfile /></BuyerLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />

            {/* ── Seller dashboard ───────────────────── */}
            <Route
              path="/dashboard/seller"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Seller">
                    <SellerLayout><SellerDashboard /></SellerLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/seller/store"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Seller">
                    <SellerLayout>
                      <Suspense fallback={<PageLoader />}>
                        <SellerStorePage />
                      </Suspense>
                    </SellerLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/seller/products"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Seller">
                    <SellerLayout>
                      <Suspense fallback={<PageLoader />}>
                        <SellerProductManagerPage />
                      </Suspense>
                    </SellerLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />

            {/* ── Driver dashboard ───────────────────── */}
            <Route
              path="/dashboard/driver"
              element={
                <AuthGuard>
                  <RoleGuard requiredRole="Driver">
                    <DriverLayout><DriverDashboard /></DriverLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />

            {/* ── Legacy redirects ────────────────────── */}
            <Route path="/dashboard"         element={<Navigate to="/account" replace />} />
            <Route path="/seller-dashboard"  element={<Navigate to="/dashboard/seller" replace />} />
            <Route path="/driver-dashboard"  element={<Navigate to="/dashboard/driver" replace />} />
            <Route path="/admin-dashboard"   element={<Navigate to="/account" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
