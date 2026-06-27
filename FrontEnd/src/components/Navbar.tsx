import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, RefreshCw, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import RoleModal from "./RoleModal";
import "../styles/Navbar.css";

const roleColors: Record<string, string> = {
	Admin: "var(--admin-color)",
	Buyer: "var(--buyer-color)",
	Seller: "var(--seller-color)",
	Driver: "var(--driver-color)",
};

export const Navbar: React.FC = () => {
	const { user, logout, switchRole } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const lastScrollTop = useRef(0);

	useEffect(() => {
		const handleScroll = (e: Event) => {
			if (isMobileOpen) return;

			const target = e.target;
			let scrollTop = 0;
			if (target === document || target === window) {
				scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			} else if (target instanceof HTMLElement) {
				scrollTop = target.scrollTop;
			}

			const currentScrollTop = scrollTop;
			const delta = currentScrollTop - lastScrollTop.current;
			const threshold = 10;

			if (Math.abs(delta) > threshold) {
				if (delta > 0 && currentScrollTop > 80) {
					setIsVisible(false);
				} else {
					setIsVisible(true);
				}
				lastScrollTop.current = currentScrollTop;
			}
		};

		window.addEventListener("scroll", handleScroll, true);
		return () => {
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [isMobileOpen]);

	useEffect(() => {
		setIsVisible(true);
		lastScrollTop.current = 0;
	}, [location.pathname, location.hash]);

	const handleLogout = () => {
		logout();
		navigate("/");
		setIsMobileOpen(false);
	};

	const isActive = (path: string) => location.pathname === path;

	const accentColor = user
		? roleColors[user.activeRole] || "var(--primary)"
		: "var(--primary)";

	return (
		<>
			<nav className={`site-navbar ${!isVisible ? "navbar-hidden" : ""}`}>
				<div className="navbar-inner">
					<Link
						to="/"
						className="navbar-brand">
						<span className="navbar-wave">🌊</span>
						<span className="navbar-brand-text">SEAPEDIA</span>
					</Link>

					<div className="navbar-desktop-links">
						<Link
							to="/#hero"
							className={`navbar-link ${isActive("/") || location.hash === "#hero" ? "navbar-link-active" : ""}`}>
							Beranda
						</Link>
						<Link
							to="/products"
							className={`navbar-link ${isActive("/products") ? "navbar-link-active" : ""}`}>
							Produk
						</Link>
						<Link
							to="/reviews"
							className={`navbar-link ${isActive("/reviews") ? "navbar-link-active" : ""}`}>
							Ulasan
						</Link>
						{user && (
							<Link
								to="/dashboard"
								className={`navbar-link ${isActive("/dashboard") ? "navbar-link-active" : ""}`}>
								Dashboard
							</Link>
						)}
					</div>

					<div className="navbar-desktop-auth">
						{user ? (
							<>
								<div
									className="navbar-role-chip"
									style={{
										color: accentColor,
										backgroundColor: accentColor + "15",
										borderColor: accentColor + "30",
									}}>
									{user.activeRole}
								</div>

								{user.roles.length > 1 && (
									<button
										className="navbar-switch-btn"
										onClick={() => setIsRoleModalOpen(true)}>
										<RefreshCw size={14} />
										<span>Ganti Peran</span>
									</button>
								)}

								<div className="navbar-user-badge">
									<User size={15} />
									<span>{user.username}</span>
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={handleLogout}
									className="navbar-logout-btn">
									<LogOut size={14} />
									Keluar
								</Button>
							</>
						) : (
							<div className="navbar-auth-btns">
								<Link to="/login">
									<Button
										variant="text"
										size="sm">
										Masuk
									</Button>
								</Link>
								<Link to="/register">
									<Button size="sm">Daftar</Button>
								</Link>
							</div>
						)}
					</div>

					<button
						className="navbar-mobile-toggle"
						onClick={() => setIsMobileOpen(!isMobileOpen)}
						aria-label="Toggle navigation menu">
						{isMobileOpen ? <X size={22} /> : <Menu size={22} />}
					</button>
				</div>

				{isMobileOpen && (
					<div className="navbar-mobile-drawer">
						<Link
							to="/#hero"
							className="mobile-link"
							onClick={() => setIsMobileOpen(false)}>
							Beranda
						</Link>
						<Link
							to="/products"
							className="mobile-link"
							onClick={() => setIsMobileOpen(false)}>
							<Package size={16} /> Produk
						</Link>
						<Link
							to="/reviews"
							className="mobile-link"
							onClick={() => setIsMobileOpen(false)}>
							Ulasan
						</Link>
						{user ? (
							<>
								<Link
									to="/dashboard"
									className="mobile-link"
									onClick={() => setIsMobileOpen(false)}>
									Dashboard
								</Link>
								<div className="mobile-user-section">
									<div className="mobile-user-info">
										<User size={16} />
										<span>{user.username}</span>
										<div
											className="navbar-role-chip"
											style={{
												color: accentColor,
												backgroundColor: accentColor + "15",
												borderColor: accentColor + "30",
											}}>
											{user.activeRole}
										</div>
									</div>
									{user.roles.length > 1 && (
										<button
											className="mobile-link mobile-switch-role-btn"
											onClick={() => {
												setIsRoleModalOpen(true);
												setIsMobileOpen(false);
											}}>
											<RefreshCw size={14} /> Ganti Peran Aktif
										</button>
									)}
									<button
										className="mobile-logout-btn"
										onClick={handleLogout}>
										<LogOut size={15} /> Keluar
									</button>
								</div>
							</>
						) : (
							<div className="mobile-auth-section">
								<Link
									to="/login"
									onClick={() => setIsMobileOpen(false)}>
									<Button
										variant="outline"
										className="w-full">
										Masuk
									</Button>
								</Link>
								<Link
									to="/register"
									onClick={() => setIsMobileOpen(false)}>
									<Button className="w-full">Daftar Akun</Button>
								</Link>
							</div>
						)}
					</div>
				)}
			</nav>

			{user && (
				<RoleModal
					isOpen={isRoleModalOpen}
					onClose={() => setIsRoleModalOpen(false)}
					roles={user.roles}
					currentRole={user.activeRole}
					onSelectRole={async (role) => {
						try {
							await switchRole(role);
							navigate("/dashboard");
						} catch (err) {
							console.error(err);
						}
						setIsRoleModalOpen(false);
					}}
				/>
			)}
		</>
	);
};

export default Navbar;
