import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	Store,
	Package,
	LogOut,
	ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarFallback from "../components/AvatarFallback";
import "../styles/RoleDashboard.css";

const SELLER_COLOR = "var(--seller-color)";
const SELLER_LIGHT = "var(--seller-light)";

interface SellerLayoutProps {
	children: React.ReactNode;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const roleStyle = {
		"--rdl-color": SELLER_COLOR,
		"--rdl-light": SELLER_LIGHT,
	} as React.CSSProperties;

	const isActive = (path: string) => location.pathname === path;
	const handleLogout = () => {
		logout();
		navigate("/");
	};

	return (
		<div className="rdl-layout" style={roleStyle}>
			<aside className="rdl-sidebar">
				<div className="rdl-user-block">
					<div className="rdl-user-row">
						<AvatarFallback name={user?.username} size={38} />
						<div>
							<div className="rdl-username">{user?.username}</div>
							<span
								className="rdl-role-badge"
								style={{ background: SELLER_LIGHT, color: SELLER_COLOR }}
							>
								Penjual
							</span>
						</div>
					</div>
				</div>

				<nav className="rdl-nav">
					<Link
						to="/dashboard/seller"
						className={`rdl-nav-item${isActive("/dashboard/seller") ? " rdl-nav-item--active" : ""}`}
					>
						<LayoutDashboard size={16} className="rdl-nav-icon" />
						Dashboard
					</Link>
					<Link
						to="/dashboard/seller/store"
						className={`rdl-nav-item${isActive("/dashboard/seller/store") ? " rdl-nav-item--active" : ""}`}
					>
						<Store size={16} className="rdl-nav-icon" />
						Toko Saya
					</Link>
					<Link
						to="/dashboard/seller/products"
						className={`rdl-nav-item${isActive("/dashboard/seller/products") ? " rdl-nav-item--active" : ""}`}
					>
						<Package size={16} className="rdl-nav-icon" />
						Produk Saya
					</Link>
				</nav>

				<div className="rdl-sidebar-footer">
					<div className="rdl-nav-divider" />
					<Link to="/account" className="rdl-nav-item rdl-nav-item--back">
						<ArrowLeft size={14} className="rdl-nav-icon" />
						Kembali ke Akun Saya
					</Link>
					<button
						className="rdl-nav-item rdl-nav-item--logout"
						onClick={handleLogout}
					>
						<LogOut size={16} className="rdl-nav-icon" />
						Keluar
					</button>
				</div>
			</aside>

			<main className="rdl-content">{children}</main>

			<nav className="rdl-bottom-nav" style={roleStyle}>
				<Link
					to="/dashboard/seller"
					className={`rdl-bottom-nav-item${isActive("/dashboard/seller") ? " rdl-bottom-nav-item--active" : ""}`}
				>
					<LayoutDashboard size={20} />
					<span>Dasbor</span>
				</Link>
				<Link
					to="/dashboard/seller/store"
					className={`rdl-bottom-nav-item${isActive("/dashboard/seller/store") ? " rdl-bottom-nav-item--active" : ""}`}
				>
					<Store size={20} />
					<span>Toko</span>
				</Link>
				<Link
					to="/dashboard/seller/products"
					className={`rdl-bottom-nav-item${isActive("/dashboard/seller/products") ? " rdl-bottom-nav-item--active" : ""}`}
				>
					<Package size={20} />
					<span>Produk</span>
				</Link>
				<button className="rdl-bottom-nav-item" onClick={handleLogout}>
					<LogOut size={20} />
					<span>Keluar</span>
				</button>
			</nav>
		</div>
	);
};

export default SellerLayout;
