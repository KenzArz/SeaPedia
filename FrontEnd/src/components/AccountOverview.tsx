import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	ShoppingBag,
	Store,
	Truck,
	UserCog,
	Loader,
	Package,
	ArrowRight,
	ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarFallback from "./AvatarFallback";
import Toast, { type ToastType } from "./Toast";
import { productService } from "../services/productService";
import { getProductImage } from "../utils/imageHelper";

const ROLE_META: Record<
	string,
	{
		label: string;
		dashLabel: string;
		icon: React.FC<{ size?: number }>;
		color: string;
		light: string;
		subtext: string;
	}
> = {
	Buyer: {
		label: "Pembeli",
		dashLabel: "Dasbor Pembeli",
		icon: ShoppingBag,
		color: "var(--buyer-color)",
		light: "var(--buyer-light)",
		subtext: "Jelajahi produk dan kelola profil kamu",
	},
	Seller: {
		label: "Penjual",
		dashLabel: "Dasbor Penjual",
		icon: Store,
		color: "var(--seller-color)",
		light: "var(--seller-light)",
		subtext: "Kelola toko dan produkmu",
	},
	Driver: {
		label: "Pengemudi",
		dashLabel: "Dasbor Pengemudi",
		icon: Truck,
		color: "var(--driver-color)",
		light: "var(--driver-light)",
		subtext: "Lihat dashboard pengemudi kamu",
	},
};

const DASHBOARD_ROLES = ["Buyer", "Seller", "Driver"] as const;

function formatJoinDate(iso?: string | null): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function formatRupiah(val: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(val);
}

interface ProductPreview {
	_id: string;
	name: string;
	price: number;
	image?: string;
	store?: { _id: string; name: string };
}

interface AccountOverviewProps {
	onRoleSwitched?: (newRole: string) => void;
	onOpenSellerModal?: () => void;
	onOpenDriverModal?: () => void;
	onOpenProfile?: () => void;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({
	onRoleSwitched,
	onOpenSellerModal,
	onOpenDriverModal,
	onOpenProfile,
}) => {
	const { user, switchRole } = useAuth();

	const [switchingRole, setSwitchingRole] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		message: string;
		type: ToastType;
	} | null>(null);

	const [productCount, setProductCount] = useState<number | null>(null);

	const [latestProducts, setLatestProducts] = useState<ProductPreview[]>([]);
	const [productsLoading, setProductsLoading] = useState(true);

	useEffect(() => {
		if (!user?.roles.includes("Seller")) return;
		productService
			.getMyProducts()
			.then((res) => {
				const products = res.data.data ?? [];
				setProductCount(products.length);
			})
			.catch(() => setProductCount(null));
	}, [user?.roles]);

	useEffect(() => {
		setProductsLoading(true);
		productService
			.getAllProducts({ limit: 5, page: 1 })
			.then((res) => {
				setLatestProducts(res.data.data ?? []);
			})
			.catch(() => setLatestProducts([]))
			.finally(() => setProductsLoading(false));
	}, []);

	if (!user) return null;

	const activeConfig = ROLE_META[user.activeRole] ?? ROLE_META.Buyer;
	const joinDate = formatJoinDate(user.createdAt);

	const handleSwitch = async (role: string) => {
		if (role === user.activeRole) return;
		setSwitchingRole(role);
		try {
			await switchRole(role);
			const label = ROLE_META[role]?.label ?? role;
			setToast({
				message: `Berhasil beralih ke peran ${label}`,
				type: "success",
			});
			onRoleSwitched?.(role);
		} catch (err: any) {
			setToast({
				message: err?.message ?? "Gagal beralih peran",
				type: "error",
			});
		} finally {
			setSwitchingRole(null);
		}
	};

	return (
		<div className="ao-root">
			<div className="ao-header">
				<AvatarFallback name={user.username} size={64} />
				<div className="ao-header-text">
					<div className="ao-username">{user.username}</div>
					<span
						className="ao-active-badge"
						style={{
							background: activeConfig.light,
							color: activeConfig.color,
						}}
					>
						{activeConfig.label}
					</span>
					{joinDate && (
						<div className="ao-join-date">Bergabung sejak {joinDate}</div>
					)}
				</div>
			</div>

			<div className="ao-section">
				<div className="ao-section-head">
					<h3 className="ao-section-title">Akun Saya</h3>
					<p className="ao-section-sub">
						Status peran yang kamu miliki di SEAPEDIA
					</p>
				</div>

				<div className="ao-role-cards">
					{DASHBOARD_ROLES.map((role) => {
						const meta = ROLE_META[role];
						const Icon = meta.icon;
						const isRegistered = user.roles.includes(role);

						return (
							<div
								key={role}
								className={`ao-role-card ${isRegistered ? "ao-role-card--registered" : "ao-role-card--unregistered"}`}
								style={
									isRegistered
										? ({
												"--rc-color": meta.color,
												"--rc-light": meta.light,
											} as React.CSSProperties)
										: undefined
								}
							>
								<div
									className="ao-role-card-icon"
									style={
										isRegistered
											? { background: meta.light, color: meta.color }
											: { background: "#f3f4f6", color: "#9ca3af" }
									}
								>
									<Icon size={22} />
								</div>

								<div className="ao-role-card-body">
									<span className="ao-role-card-name">{meta.label}</span>
									{isRegistered ? (
										<span className="ao-badge-registered">Aktif</span>
									) : (
										<span className="ao-badge-unregistered">
											Belum Terdaftar
										</span>
									)}
								</div>

								{!isRegistered && role === "Seller" && (
									<button
										className="ao-role-card-cta"
										onClick={onOpenSellerModal}
									>
										Buka Toko
									</button>
								)}
								{!isRegistered && role === "Driver" && (
									<button
										className="ao-role-card-cta"
										onClick={onOpenDriverModal}
									>
										Daftar
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="ao-section">
				<div className="ao-section-head">
					<h3 className="ao-section-title">Dasbor Peran Anda</h3>
					<p className="ao-section-sub">
						Pilih dashboard yang ingin kamu lihat
					</p>
				</div>

				<div className="ao-dash-cards">
					{DASHBOARD_ROLES.map((role) => {
						const meta = ROLE_META[role];
						const Icon = meta.icon;
						const isRegistered = user.roles.includes(role);
						const isActive = user.activeRole === role;
						const isLoading = switchingRole === role;

						return (
							<div
								key={role}
								className={`ao-dash-card ${isActive ? "ao-dash-card--active" : ""} ${!isRegistered ? "ao-dash-card--locked" : ""}`}
							>
								<div className="ao-dash-card-radio">
									<div
										className={`ao-radio-dot ${isActive ? "ao-radio-dot--filled" : ""}`}
									/>
								</div>

								<div
									className="ao-dash-card-icon"
									style={
										isRegistered
											? { background: meta.light, color: meta.color }
											: { background: "#f3f4f6", color: "#9ca3af" }
									}
								>
									<Icon size={20} />
								</div>

								<div className="ao-dash-card-content">
									<span className="ao-dash-card-title">{meta.dashLabel}</span>

									{isRegistered ? (
										<>
											{role === "Seller" && productCount !== null && (
												<span className="ao-dash-card-meta">
													<Package size={11} />
													{productCount} produk aktif
												</span>
											)}
											{role !== "Seller" && (
												<span className="ao-dash-card-sub">{meta.subtext}</span>
											)}
											{role === "Seller" && productCount === null && (
												<span className="ao-dash-card-sub">{meta.subtext}</span>
											)}
										</>
									) : (
										<span className="ao-dash-card-sub ao-dash-card-sub--muted">
											Belum terdaftar sebagai {meta.label.toLowerCase()}
										</span>
									)}
								</div>

								<div className="ao-dash-card-action">
									{isRegistered ? (
										isActive ? (
											<span className="ao-badge-active-sm">Sedang Aktif</span>
										) : (
											<button
												className="ao-btn-switch-dash"
												onClick={() => handleSwitch(role)}
												disabled={!!switchingRole}
											>
												{isLoading ? (
													<>
														<Loader size={12} className="ao-spinner" />{" "}
														Beralih...
													</>
												) : (
													"Gunakan Peran Ini"
												)}
											</button>
										)
									) : role === "Seller" ? (
										<button
											className="ao-btn-register-role"
											onClick={onOpenSellerModal}
										>
											Buka Toko Sekarang
										</button>
									) : (
										<button
											className="ao-btn-register-role"
											onClick={onOpenDriverModal}
										>
											Daftar Sekarang
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="ao-section">
				<h3 className="ao-section-title">Aksi Cepat</h3>
				<div className="ao-quick-actions">
					<button className="ao-quick-btn" onClick={onOpenProfile}>
						<UserCog size={15} />
						Ubah Profil
					</button>
					{!user.roles.includes("Seller") && (
						<button className="ao-quick-btn" onClick={onOpenSellerModal}>
							<Store size={15} />
							Buka Toko
						</button>
					)}
					{!user.roles.includes("Driver") && (
						<button className="ao-quick-btn" onClick={onOpenDriverModal}>
							<Truck size={15} />
							Daftar Jadi Pengemudi
						</button>
					)}
				</div>
			</div>

			<div className="ao-section">
				<div className="ao-section-head">
					<h3 className="ao-section-title">Produk Terbaru</h3>
					<p className="ao-section-sub">
						Jelajahi produk yang baru ditambahkan di SEAPEDIA
					</p>
				</div>

				{productsLoading ? (
					<div className="ao-products-skeleton">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="ao-product-skel" />
						))}
					</div>
				) : latestProducts.length === 0 ? (
					<p className="ao-products-empty">Belum ada produk tersedia.</p>
				) : (
					<div className="ao-products-grid">
						{latestProducts.map((prod, idx) => (
							<Link
								key={prod._id}
								to={`/products/${prod._id}`}
								className="ao-product-card"
							>
								<img
									src={getProductImage(prod.image, idx)}
									alt={prod.name}
									className="ao-product-img"
									onError={(e) => {
										(e.target as HTMLImageElement).src = getProductImage(
											null,
											idx,
										);
									}}
								/>
								<div className="ao-product-body">
									{prod.store && (
										<span className="ao-product-store">{prod.store.name}</span>
									)}
									<span className="ao-product-name">{prod.name}</span>
									<span className="ao-product-price">
										{formatRupiah(prod.price)}
									</span>
									<span className="ao-product-cta">
										Lihat Detail <ExternalLink size={11} />
									</span>
								</div>
							</Link>
						))}
					</div>
				)}

				<Link to="/products" className="ao-btn-see-all">
					Lihat Semua Produk <ArrowRight size={15} />
				</Link>
			</div>

			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	);
};

export default AccountOverview;
