import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	User,
	ShoppingBag,
	ClipboardList,
	Wallet,
	Store,
	Package,
	Truck,
	LogOut,
	RefreshCw,
	AlertTriangle,
	Shield,
	BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BecomeSellerModal from "../components/BecomeSellerModal";
import BecomeDriverModal from "../components/BecomeDriverModal";
import RoleModal from "../components/RoleModal";
import StoreManager from "../components/seller/StoreManager";
import ProductManager from "../components/seller/ProductManager";
import PersonalProfile from "./PersonalProfile";
import AccountOverview from "../components/AccountOverview";
import AvatarFallback from "../components/AvatarFallback";
import { storeService } from "../services/storeService";
import "../styles/Dashboard.css";

type ViewTab =
	| "akun"
	| "profile"
	| "store"
	| "products"
	| "driver_dash"
	| "dasbor";

interface DriverDetails {
	fullName: string;
	vehicleNumber: string;
	registeredAt?: string;
}

const roleConfig = {
	Admin: {
		color: "var(--admin-color)",
		light: "var(--admin-light)",
		icon: Shield,
		label: "Administrator",
	},
	Buyer: {
		color: "var(--buyer-color)",
		light: "var(--buyer-light)",
		icon: ShoppingBag,
		label: "Pembeli",
	},
	Seller: {
		color: "var(--seller-color)",
		light: "var(--seller-light)",
		icon: Store,
		label: "Penjual",
	},
	Driver: {
		color: "var(--driver-color)",
		light: "var(--driver-light)",
		icon: Truck,
		label: "Kurir",
	},
};

function getDefaultTab(role: string): ViewTab {
	if (role === "Seller") return "store";
	if (role === "Driver") return "driver_dash";
	return "dasbor";
}

function getViewTitle(tab: ViewTab): string {
	const titles: Record<ViewTab, string> = {
		dasbor: "",
		akun: "Akun Saya",
		profile: "",
		store: "",
		products: "",
		driver_dash: "Dashboard Kurir",
	};
	return titles[tab];
}

const DRIVER_CACHE_KEY = "seapedia_driver_details";

export const Dashboard: React.FC = () => {
	const { user, logout, switchRole, addRole } = useAuth();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState<ViewTab>("akun");
	const [hasStore, setHasStore] = useState(false);
	const [storeName, setStoreName] = useState<string | null>(null);
	const [driverDetails, setDriverDetails] = useState<DriverDetails | null>(
		null,
	);
	const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
	const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

	const handleStoreLoaded = useCallback((exists: boolean) => {
		setHasStore(exists);
	}, []);

	useEffect(() => {
		if (user) {
			setActiveTab(getDefaultTab(user.activeRole));
		}
	}, [user?.activeRole]);

	useEffect(() => {
		if (!user || user.activeRole !== "Seller") {
			setStoreName(null);
			return;
		}
		storeService
			.getMyStore()
			.then((store) => setStoreName(store?.name ?? null))
			.catch(() => setStoreName(null));
	}, [user?.activeRole, hasStore]);

	useEffect(() => {
		if (!user?.roles.includes("Driver")) return;
		const cached = localStorage.getItem(DRIVER_CACHE_KEY);
		if (cached) {
			try {
				setDriverDetails(JSON.parse(cached));
			} catch {
				setDriverDetails(null);
			}
		}
	}, [user?.roles]);

	if (!user) {
		return (
			<div className="db-not-auth">
				<AlertTriangle size={52} />
				<h2>Akses Ditolak</h2>
				<p>Silakan masuk untuk mengakses halaman dashboard Anda.</p>
				<Link to="/login">Masuk Sekarang</Link>
			</div>
		);
	}

	const config =
		roleConfig[user.activeRole as keyof typeof roleConfig] || roleConfig.Buyer;
	const roleStyle = {
		"--item-color": config.color,
		"--item-bg": config.light,
	} as React.CSSProperties;

	const handleRoleSwitch = async (role: string) => {
		try {
			await switchRole(role);
			setActiveTab(getDefaultTab(role));
			setIsRoleModalOpen(false);
		} catch (err) {
			console.error(err);
		}
	};

	const handleSellerSubmit = async (name: string) => {
		await addRole("seller", { storeName: name });
		setIsSellerModalOpen(false);
		setActiveTab("store");
	};

	const handleDriverSubmit = async (
		fullName: string,
		vehicleNumber: string,
	) => {
		await addRole("driver", { fullName, vehicleNumber });
		const details: DriverDetails = {
			fullName,
			vehicleNumber,
			registeredAt: new Date().toISOString(),
		};
		localStorage.setItem(DRIVER_CACHE_KEY, JSON.stringify(details));
		setDriverDetails(details);
		setIsDriverModalOpen(false);
		setActiveTab("driver_dash");
	};

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const navBtn = (
		tab: ViewTab,
		label: string,
		icon: React.FC<{ size?: number; className?: string }>,
		disabled = false,
	) => {
		const Icon = icon;
		return (
			<button
				key={tab}
				className={`db-nav-item${activeTab === tab ? " db-nav-item--active" : ""}${disabled ? " db-nav-item--disabled" : ""}`}
				style={roleStyle}
				onClick={() => !disabled && setActiveTab(tab)}
			>
				<Icon size={18} className="db-nav-item-icon" />
				<span>{label}</span>
			</button>
		);
	};

	const renderBuyerNav = () => (
		<>
			{navBtn("dasbor", "Dasbor Terpadu", ShoppingBag)}
			{navBtn("profile", "Profil Saya", User)}
			<div className="db-nav-divider" />
			{user.roles.includes("Seller") ? (
				navBtn("store", "Toko Saya", Store)
			) : (
				<button
					className="db-nav-item db-nav-item--action"
					style={roleStyle}
					onClick={() => setIsSellerModalOpen(true)}
				>
					<Store size={18} className="db-nav-item-icon" />
					<span>Buka Toko</span>
				</button>
			)}
			{user.roles.includes("Driver") ? (
				navBtn("driver_dash", "Dashboard Pengemudi", Truck)
			) : (
				<button
					className="db-nav-item db-nav-item--action"
					style={roleStyle}
					onClick={() => setIsDriverModalOpen(true)}
				>
					<Truck size={18} className="db-nav-item-icon" />
					<span>Daftar Jadi Pengemudi</span>
				</button>
			)}
		</>
	);

	const renderSellerNav = () => (
		<>
			{navBtn("store", "Toko Saya", Store)}
			{navBtn("products", "Produk Saya", Package)}
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<ClipboardList size={18} className="db-nav-item-icon" />
				<span>Pesanan Masuk</span>
			</button>
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<BarChart3 size={18} className="db-nav-item-icon" />
				<span>Pendapatan Toko</span>
			</button>
			<div className="db-nav-divider" />
			<Link to="/products" className="db-nav-item" style={roleStyle}>
				<ShoppingBag size={18} className="db-nav-item-icon" />
				<span>Lihat Katalog</span>
			</Link>
		</>
	);

	const renderDriverNav = () => (
		<>
			{navBtn("driver_dash", "Dashboard Kurir", Truck)}
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<Package size={18} className="db-nav-item-icon" />
				<span>Cari Pekerjaan</span>
			</button>
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<ClipboardList size={18} className="db-nav-item-icon" />
				<span>Riwayat Perjalanan</span>
			</button>
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<Wallet size={18} className="db-nav-item-icon" />
				<span>Pendapatan Kurir</span>
			</button>
		</>
	);

	const renderAdminNav = () => (
		<>
			{navBtn("akun", "Akun Saya", User)}
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<BarChart3 size={18} className="db-nav-item-icon" />
				<span>Monitoring Pasar</span>
			</button>
			<button className="db-nav-item db-nav-item--disabled" style={roleStyle}>
				<Shield size={18} className="db-nav-item-icon" />
				<span>Kontrol Keamanan</span>
			</button>
		</>
	);

	const renderContent = () => {
		switch (activeTab) {
			case "akun":
			case "dasbor":
				return (
					<AccountOverview
						onRoleSwitched={(newRole) => setActiveTab(getDefaultTab(newRole))}
						onOpenSellerModal={() => setIsSellerModalOpen(true)}
						onOpenDriverModal={() => setIsDriverModalOpen(true)}
						onOpenProfile={() => setActiveTab("profile")}
					/>
				);

			case "store":
				return <StoreManager onStoreLoaded={handleStoreLoaded} />;

			case "profile":
				return <PersonalProfile />;

			case "products":
				return (
					<ProductManager
						hasStore={hasStore}
						onGoToStore={() => setActiveTab("store")}
					/>
				);

			case "driver_dash":
				return (
					<div className="db-driver-card">
						<div className="db-driver-header">
							<div className="db-driver-icon">
								<Truck size={28} />
							</div>
							<div>
								<div className="db-driver-name">
									{driverDetails?.fullName ?? user.username}
								</div>
								<span className="db-driver-status">Aktif</span>
							</div>
						</div>
						<div className="db-driver-detail-grid">
							<div className="db-driver-detail-item">
								<div className="db-driver-detail-label">Nama Lengkap</div>
								<div className="db-driver-detail-value">
									{driverDetails?.fullName ?? "—"}
								</div>
							</div>
							<div className="db-driver-detail-item">
								<div className="db-driver-detail-label">Nomor Kendaraan</div>
								<div className="db-driver-detail-value">
									{driverDetails?.vehicleNumber ?? "—"}
								</div>
							</div>
							<div className="db-driver-detail-item">
								<div className="db-driver-detail-label">Status</div>
								<div className="db-driver-detail-value">Aktif</div>
							</div>
							<div className="db-driver-detail-item">
								<div className="db-driver-detail-label">Tanggal Registrasi</div>
								<div className="db-driver-detail-value">
									{driverDetails?.registeredAt
										? new Date(driverDetails.registeredAt).toLocaleDateString(
												"id-ID",
												{
													day: "numeric",
													month: "long",
													year: "numeric",
												},
											)
										: "—"}
								</div>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	const roleNavMap: Record<string, () => React.ReactNode> = {
		Buyer: renderBuyerNav,
		Seller: renderSellerNav,
		Driver: renderDriverNav,
		Admin: renderAdminNav,
	};
	const renderRoleNav = roleNavMap[user.activeRole] ?? renderBuyerNav;

	const mobileTabs: {
		tab: ViewTab;
		label: string;
		icon: React.FC<{ size?: number }>;
	}[] =
		user.activeRole === "Seller"
			? [
					{ tab: "store", label: "Toko", icon: Store },
					{ tab: "products", label: "Produk", icon: Package },
					{ tab: "akun", label: "Akun", icon: User },
				]
			: user.activeRole === "Driver"
				? [
						{ tab: "driver_dash", label: "Kurir", icon: Truck },
						{ tab: "akun", label: "Akun", icon: User },
					]
				: [
						{ tab: "dasbor", label: "Dasbor", icon: ShoppingBag },
						{ tab: "akun", label: "Akun", icon: User },
					];

	return (
		<div className="db-layout">
			<aside className="db-sidebar">
				<div className="db-user-block">
					<div className="db-avatar-row">
						<AvatarFallback
							name={user.username}
							size={42}
							style={{ border: `2px solid ${config.color}40` }}
						/>
						<div>
							<div className="db-user-name">{user.username}</div>
							<span
								className="db-role-badge"
								style={{ backgroundColor: config.light, color: config.color }}
							>
								{config.label}
							</span>
							{user.activeRole === "Seller" && storeName && (
								<div className="db-store-name-row">
									<Store size={12} />
									<span>{storeName}</span>
								</div>
							)}
						</div>
					</div>
					{user.roles.length > 1 && (
						<button
							className="db-switch-role-btn"
							onClick={() => setIsRoleModalOpen(true)}
						>
							<RefreshCw size={12} />
							Ganti Peran
						</button>
					)}
				</div>

				<nav className="db-nav-section">{renderRoleNav()}</nav>

				<div className="db-sidebar-footer">
					<div className="db-nav-divider" />
					<button
						className="db-nav-item db-nav-item--logout"
						onClick={handleLogout}
					>
						<LogOut size={18} className="db-nav-item-icon" />
						<span>Keluar</span>
					</button>
				</div>
			</aside>

			<main className="db-content">
				{getViewTitle(activeTab) && (
					<h1 className="db-content-title">{getViewTitle(activeTab)}</h1>
				)}
				{renderContent()}
			</main>

			<nav className="db-bottom-nav">
				{mobileTabs.map(({ tab, label, icon: Icon }) => (
					<button
						key={tab}
						className={`db-bottom-nav-item${activeTab === tab ? " db-bottom-nav-item--active" : ""}`}
						style={activeTab === tab ? { color: config.color } : {}}
						onClick={() => setActiveTab(tab)}
					>
						<Icon size={22} />
						<span>{label}</span>
					</button>
				))}
				<button className="db-bottom-nav-item" onClick={handleLogout}>
					<LogOut size={22} />
					<span>Keluar</span>
				</button>
			</nav>

			<BecomeSellerModal
				isOpen={isSellerModalOpen}
				onClose={() => setIsSellerModalOpen(false)}
				onSubmit={handleSellerSubmit}
			/>
			<BecomeDriverModal
				isOpen={isDriverModalOpen}
				onClose={() => setIsDriverModalOpen(false)}
				onSubmit={handleDriverSubmit}
			/>
			<RoleModal
				isOpen={isRoleModalOpen}
				onClose={() => setIsRoleModalOpen(false)}
				roles={user.roles}
				currentRole={user.activeRole}
				onSelectRole={handleRoleSwitch}
			/>
		</div>
	);
};

export default Dashboard;
