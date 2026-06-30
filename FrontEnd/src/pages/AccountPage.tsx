import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingBag, Store, Truck, Loader, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarFallback from "../components/AvatarFallback";
import BecomeSellerModal from "../components/BecomeSellerModal";
import BecomeDriverModal from "../components/BecomeDriverModal";
import Toast, { type ToastType } from "../components/Toast";
import "../styles/AccountPage.css";

function formatJoinDate(iso?: string | null): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

const ROLE_META = {
	Buyer: { label: "Pembeli", Icon: ShoppingBag, route: "/dashboard/buyer" },
	Seller: { label: "Penjual", Icon: Store, route: "/dashboard/seller" },
	Driver: { label: "Pengemudi", Icon: Truck, route: "/dashboard/driver" },
} as const;

type RoleKey = keyof typeof ROLE_META;
const ALL_ROLES: RoleKey[] = ["Buyer", "Seller", "Driver"];

const AccountPage: React.FC = () => {
	const { user, switchRole, addRole } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [switching, setSwitching] = useState<string | null>(null);
	const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
	const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: ToastType;
	} | null>(null);

	const redirectMsg = (location.state as any)?.message as string | undefined;

	if (!user) return null;

	const joinDate = formatJoinDate(user.createdAt);

	const handleSwitch = async (role: RoleKey) => {
		if (switching) return;
		setSwitching(role);
		try {
			await switchRole(role);
			navigate(ROLE_META[role].route, { replace: true });
		} catch (err: any) {
			setToast({
				message: err?.message ?? "Gagal beralih peran",
				type: "error",
			});
			setSwitching(null);
		}
	};

	const handleSellerSubmit = async (storeName: string) => {
		await addRole("seller", { storeName });
		setIsSellerModalOpen(false);
		setToast({
			message: "Toko berhasil dibuat! Beralih ke dasbor Penjual...",
			type: "success",
		});
		setTimeout(() => navigate("/dashboard/seller"), 1200);
	};

	const handleDriverSubmit = async (
		fullName: string,
		vehicleNumber: string,
	) => {
		await addRole("driver", { fullName, vehicleNumber });
		setIsDriverModalOpen(false);
		setToast({
			message: "Berhasil terdaftar sebagai Pengemudi!",
			type: "success",
		});
		setTimeout(() => navigate("/dashboard/driver"), 1200);
	};

	return (
		<div className="ac-page">
			<div className="ac-page-header">
				<div className="ac-user-row">
					<AvatarFallback name={user.username} size={52} />
					<div className="ac-user-info">
						<h1 className="ac-username">{user.username}</h1>
						{joinDate && (
							<p className="ac-joindate">Bergabung sejak {joinDate}</p>
						)}
					</div>
					<Link to="/dashboard/buyer/profile" className="ac-profile-link">
						<UserCog size={14} />
						Ubah Profil
					</Link>
				</div>
				{redirectMsg && <div className="ac-redirect-notice">{redirectMsg}</div>}
			</div>

			<div>
				<h2 className="ac-section-title">Akun Saya</h2>
				<p className="ac-section-sub">Kelola peranmu di SEAPEDIA</p>

				<div className="ac-role-grid">
					{ALL_ROLES.map((role) => {
						const { label, Icon, route } = ROLE_META[role];
						const isOwned = user.roles.includes(role);
						const isActive = user.activeRole === role;
						const isLoading = switching === role;

						if (isActive)
							return (
								<div key={role} className="ac-card ac-card--active">
									<div className="ac-card-icon ac-card-icon--active">
										<Icon size={24} />
									</div>
									<div className="ac-card-body">
										<span className="ac-card-name">{label}</span>
										<span className="ac-badge ac-badge--using">
											Sedang Digunakan
										</span>
									</div>
									<button
										className="ac-btn ac-btn--primary"
										onClick={() => navigate(route)}
									>
										Buka Dashboard
									</button>
								</div>
							);

						if (isOwned)
							return (
								<div key={role} className="ac-card ac-card--owned">
									<div className="ac-card-icon ac-card-icon--owned">
										<Icon size={24} />
									</div>
									<div className="ac-card-body">
										<span className="ac-card-name">{label}</span>
										<span className="ac-badge ac-badge--owned">Dimiliki</span>
									</div>
									<button
										className="ac-btn ac-btn--outline"
										onClick={() => handleSwitch(role)}
										disabled={!!switching}
									>
										{isLoading ? (
											<>
												<Loader size={13} className="ac-spinner" /> Beralih...
											</>
										) : (
											"Gunakan Peran Ini"
										)}
									</button>
								</div>
							);

						return (
							<div key={role} className="ac-card ac-card--unregistered">
								<div className="ac-card-icon ac-card-icon--unregistered">
									<Icon size={24} />
								</div>
								<div className="ac-card-body">
									<span className="ac-card-name">{label}</span>
									<span className="ac-badge ac-badge--none">
										Belum terdaftar
									</span>
								</div>
								<button
									className="ac-btn ac-btn--ghost"
									onClick={() =>
										role === "Seller"
											? setIsSellerModalOpen(true)
											: setIsDriverModalOpen(true)
									}
									disabled={!!switching}
								>
									Daftar Sebagai {label}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="ac-boat-wrap" aria-hidden="true">
				<svg
					viewBox="0 0 340 300"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="ac-boat-svg"
				>
					<path
						d="M10,200 C60,182 110,218 160,200 C210,182 260,218 330,200"
						stroke="rgba(37,99,235,0.35)"
						strokeWidth="2"
						className="ac-ocean-wave"
					/>
					<path
						d="M10,215 C70,198 120,232 180,215 C240,198 290,230 330,215"
						stroke="rgba(59,130,246,0.25)"
						strokeWidth="1.5"
						className="ac-ocean-wave ac-wave-d1"
					/>
					<path
						d="M10,230 C80,214 135,246 195,230 C255,214 300,244 330,230"
						stroke="rgba(96,165,250,0.18)"
						strokeWidth="1.2"
						className="ac-ocean-wave ac-wave-d2"
					/>

					<path
						d="M120,195 L220,195 L235,210 L105,210 Z"
						fill="rgba(30,58,138,0.55)"
						stroke="rgba(37,99,235,0.5)"
						strokeWidth="1.2"
					/>
					<rect
						x="130"
						y="165"
						width="80"
						height="30"
						rx="3"
						fill="rgba(37,99,235,0.4)"
						stroke="rgba(59,130,246,0.45)"
						strokeWidth="1"
					/>
					<rect
						x="155"
						y="145"
						width="40"
						height="22"
						rx="3"
						fill="rgba(29,78,216,0.45)"
						stroke="rgba(96,165,250,0.5)"
						strokeWidth="1"
					/>
					<rect
						x="161"
						y="150"
						width="9"
						height="7"
						rx="1.5"
						fill="rgba(147,197,253,0.6)"
					/>
					<rect
						x="175"
						y="150"
						width="9"
						height="7"
						rx="1.5"
						fill="rgba(147,197,253,0.6)"
					/>
					<rect
						x="189"
						y="150"
						width="9"
						height="7"
						rx="1.5"
						fill="rgba(147,197,253,0.35)"
					/>
					<line
						x1="175"
						y1="145"
						x2="175"
						y2="90"
						stroke="rgba(37,99,235,0.5)"
						strokeWidth="1.5"
					/>
					<path
						d="M175,92 L210,108 L175,124 Z"
						fill="rgba(59,130,246,0.25)"
						stroke="rgba(37,99,235,0.4)"
						strokeWidth="1"
						className="ac-sail"
					/>
					<line
						x1="175"
						y1="90"
						x2="175"
						y2="75"
						stroke="rgba(37,99,235,0.45)"
						strokeWidth="1"
					/>
					<circle
						cx="175"
						cy="73"
						r="2.5"
						fill="rgba(37,99,235,0.8)"
						className="ac-antenna-dot"
					/>
					<line
						x1="175"
						y1="73"
						x2="280"
						y2="40"
						stroke="rgba(96,165,250,0.25)"
						strokeWidth="1"
						strokeDasharray="4 4"
						className="ac-net-line"
					/>
					<line
						x1="175"
						y1="73"
						x2="80"
						y2="30"
						stroke="rgba(96,165,250,0.25)"
						strokeWidth="1"
						strokeDasharray="4 4"
						className="ac-net-line ac-wave-d1"
					/>
					<line
						x1="175"
						y1="73"
						x2="310"
						y2="100"
						stroke="rgba(96,165,250,0.18)"
						strokeWidth="1"
						strokeDasharray="4 4"
						className="ac-net-line ac-wave-d2"
					/>
					<circle
						cx="280"
						cy="38"
						r="5"
						fill="rgba(37,99,235,0.55)"
						className="ac-network-node ac-node-d1"
					/>
					<circle
						cx="280"
						cy="38"
						r="10"
						fill="none"
						stroke="rgba(37,99,235,0.3)"
						strokeWidth="1"
						className="ac-network-ring ac-ring-d1"
					/>
					<circle
						cx="78"
						cy="28"
						r="4"
						fill="rgba(59,130,246,0.55)"
						className="ac-network-node ac-node-d2"
					/>
					<circle
						cx="78"
						cy="28"
						r="9"
						fill="none"
						stroke="rgba(59,130,246,0.3)"
						strokeWidth="1"
						className="ac-network-ring ac-ring-d2"
					/>
					<circle
						cx="312"
						cy="100"
						r="4"
						fill="rgba(14,165,233,0.55)"
						className="ac-network-node ac-node-d3"
					/>
					<circle
						cx="312"
						cy="100"
						r="9"
						fill="none"
						stroke="rgba(14,165,233,0.3)"
						strokeWidth="1"
						className="ac-network-ring ac-ring-d3"
					/>
					<g
						transform="translate(30, 230) scale(0.7)"
						opacity="0.3"
						stroke="rgba(37,99,235,0.9)"
						strokeWidth="1.8"
						strokeLinecap="round"
					>
						<circle cx="18" cy="8" r="6" fill="none" />
						<line x1="18" y1="14" x2="18" y2="38" />
						<path d="M8,30 C8,38 28,38 28,30" fill="none" />
						<line x1="12" y1="8" x2="24" y2="8" />
					</g>
					<g
						transform="translate(42, 60) rotate(-15)"
						opacity="0.35"
						className="ac-fish"
					>
						<ellipse
							cx="0"
							cy="0"
							rx="12"
							ry="6"
							fill="rgba(59,130,246,0.45)"
							stroke="rgba(37,99,235,0.5)"
							strokeWidth="1"
						/>
						<path d="M12,0 L20,-5 L20,5 Z" fill="rgba(59,130,246,0.35)" />
						<circle cx="-6" cy="-1" r="1.5" fill="rgba(37,99,235,0.7)" />
					</g>
					<circle
						cx="100"
						cy="170"
						r="3"
						fill="rgba(96,165,250,0.2)"
						className="ac-bubble ac-bubble-1"
					/>
					<circle
						cx="250"
						cy="180"
						r="2"
						fill="rgba(96,165,250,0.15)"
						className="ac-bubble ac-bubble-2"
					/>
					<circle
						cx="60"
						cy="190"
						r="2.5"
						fill="rgba(96,165,250,0.15)"
						className="ac-bubble ac-bubble-3"
					/>
				</svg>
			</div>
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

export default AccountPage;
