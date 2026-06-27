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

const Home = lazy(() => import("./pages/Home"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const PageLoader: React.FC = () => (
	<div className="loading-container">
		<div className="spinner" />
		<p>Memuat halaman...</p>
	</div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, loading } = useAuth();
	if (loading) {
		return <PageLoader />;
	}
	if (!user)
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	return <>{children}</>;
};

function AppContent() {
	const { loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <PageLoader />;
	}

	const isLandingPage = location.pathname === "/";

	return (
		<div
			className="app-layout"
			style={{ position: "relative", overflow: "hidden" }}>
			<WaveBg />
			<Navbar />
			<main
				className={`main-content-layout ${isLandingPage ? "" : "with-navbar-padding"}`}
				style={{ position: "relative", zIndex: 1 }}>
				<Suspense fallback={<PageLoader />}>
					<Routes>
						<Route
							path="/"
							element={<LandingPage />}
						/>
						<Route
							path="/home"
							element={<Home />}
						/>
						<Route
							path="/products"
							element={<ProductList />}
						/>
						<Route
							path="/products/:id"
							element={<ProductDetail />}
						/>
						<Route
							path="/reviews"
							element={<ReviewPage />}
						/>
						<Route
							path="/login"
							element={<Login />}
						/>
						<Route
							path="/register"
							element={<Register />}
						/>
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="*"
							element={
								<Navigate
									to="/"
									replace
								/>
							}
						/>
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
