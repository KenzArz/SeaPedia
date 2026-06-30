import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarFallback from "../components/AvatarFallback";
import "../styles/RoleDashboard.css";

const BUYER_COLOR = "var(--buyer-color)";
const BUYER_LIGHT = "var(--buyer-light)";

interface BuyerLayoutProps {
	children: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	const roleStyle = {
		"--rdl-color": BUYER_COLOR,
		"--rdl-light": BUYER_LIGHT,
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
								style={{ background: BUYER_LIGHT, color: BUYER_COLOR }}
							>
								Pembeli
							</span>
						</div>
					</div>
				</div>

				<nav className="rdl-nav">
					<Link
						to="/dashboard/buyer"
						className={`rdl-nav-item${isActive("/dashboard/buyer") ? " rdl-nav-item--active" : ""}`}
					>
						<LayoutDashboard size={16} className="rdl-nav-icon" />
						Dashboard
					</Link>

					<Link
						to="/dashboard/buyer/profile"
						className={`rdl-nav-item${isActive("/dashboard/buyer/profile") ? " rdl-nav-item--active" : ""}`}
					>
						<User size={16} className="rdl-nav-icon" />
						Profil Saya
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
					to="/dashboard/buyer"
					className={`rdl-bottom-nav-item${isActive("/dashboard/buyer") ? " rdl-bottom-nav-item--active" : ""}`}
				>
					<LayoutDashboard size={20} />
					<span>Dasbor</span>
				</Link>
				<Link
					to="/dashboard/buyer/profile"
					className={`rdl-bottom-nav-item${isActive("/dashboard/buyer/profile") ? " rdl-bottom-nav-item--active" : ""}`}
				>
					<User size={20} />
					<span>Profil</span>
				</Link>
				<Link to="/account" className="rdl-bottom-nav-item">
					<ArrowLeft size={20} />
					<span>Akun</span>
				</Link>
				<button className="rdl-bottom-nav-item" onClick={handleLogout}>
					<LogOut size={20} />
					<span>Keluar</span>
				</button>
			</nav>
		</div>
	);
};

export default BuyerLayout;
