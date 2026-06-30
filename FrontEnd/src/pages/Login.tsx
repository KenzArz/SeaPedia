import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RoleModal from "../components/RoleModal";
import "../styles/Auth.css";

export const Login: React.FC = () => {
	const { login, switchRole } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [loggedInUser, setLoggedInUser] = useState<any>(null);

	const redirectDashboard = (role: string) => {
		if (role === "Seller") navigate("/seller-dashboard");
		else if (role === "Buyer") navigate("/dashboard");
		else if (role === "Driver") navigate("/driver-dashboard");
		else if (role === "Admin") navigate("/admin-dashboard");
		else navigate("/dashboard");
	};

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const userObj = await login(username, password);
			if (userObj.roles && userObj.roles.length > 1) {
				setLoggedInUser(userObj);
				setShowRoleModal(true);
			} else {
				const activeRole =
					userObj.activeRole || (userObj.roles && userObj.roles[0]) || "Buyer";
				redirectDashboard(activeRole);
			}
		} catch (err: any) {
			setError(
				err.message || "Login gagal. Periksa username dan password Anda.",
			);
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-split-grid">
				<div className="auth-side-brand">
					<div className="auth-side-brand-inner">
						<span className="auth-brand-wave">🌊</span>
						<h2 className="auth-side-title">
							Hubungkan Bisnis Anda di SEAPEDIA
						</h2>
						<p className="auth-side-desc">
							Satu platform e-commerce terpadu yang memfasilitasi
							transaksi aman, transparan, dan terpercaya untuk seluruh pelaku
							usaha di Indonesia.
						</p>

						<ul className="auth-brand-benefits">
							<li>
								<ShieldCheck size={18} className="benefit-icon" />
								<span>Pembayaran Terproteksi &amp; Cepat</span>
							</li>
							<li>
								<ShieldCheck size={18} className="benefit-icon" />
								<span>Akses Pasar Seluruh Indonesia</span>
							</li>
							<li>
								<ShieldCheck size={18} className="benefit-icon" />
								<span>3 Peran dalam 1 Akun Terpadu</span>
							</li>
						</ul>
					</div>

					{/* Boat SVG illustration */}
					<div className="auth-side-illustration" aria-hidden="true">
						<svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-boat-svg">
							{/* Ocean waves */}
							<path d="M10,200 C60,182 110,218 160,200 C210,182 260,218 330,200" stroke="rgba(37,99,235,0.35)" strokeWidth="2" className="auth-wave" />
							<path d="M10,215 C70,198 120,232 180,215 C240,198 290,230 330,215" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" className="auth-wave auth-wave-d1" />
							<path d="M10,230 C80,214 135,246 195,230 C255,214 300,244 330,230" stroke="rgba(96,165,250,0.18)" strokeWidth="1.2" className="auth-wave auth-wave-d2" />
							{/* Hull */}
							<path d="M120,195 L220,195 L235,210 L105,210 Z" fill="rgba(30,58,138,0.55)" stroke="rgba(37,99,235,0.5)" strokeWidth="1.2" />
							<rect x="130" y="165" width="80" height="30" rx="3" fill="rgba(37,99,235,0.4)" stroke="rgba(59,130,246,0.45)" strokeWidth="1" />
							<rect x="155" y="145" width="40" height="22" rx="3" fill="rgba(29,78,216,0.45)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
							{/* Windows */}
							<rect x="161" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.6)" />
							<rect x="175" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.6)" />
							<rect x="189" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.35)" />
							{/* Mast & sail */}
							<line x1="175" y1="145" x2="175" y2="90" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5" />
							<path d="M175,92 L210,108 L175,124 Z" fill="rgba(59,130,246,0.25)" stroke="rgba(37,99,235,0.4)" strokeWidth="1" className="auth-sail" />
							<line x1="175" y1="90" x2="175" y2="75" stroke="rgba(37,99,235,0.45)" strokeWidth="1" />
							<circle cx="175" cy="73" r="2.5" fill="rgba(37,99,235,0.8)" className="auth-antenna" />
							{/* Network lines */}
							<line x1="175" y1="73" x2="280" y2="40" stroke="rgba(96,165,250,0.25)" strokeWidth="1" strokeDasharray="4 4" className="auth-net" />
							<line x1="175" y1="73" x2="80" y2="30" stroke="rgba(96,165,250,0.25)" strokeWidth="1" strokeDasharray="4 4" className="auth-net auth-wave-d1" />
							<line x1="175" y1="73" x2="310" y2="100" stroke="rgba(96,165,250,0.18)" strokeWidth="1" strokeDasharray="4 4" className="auth-net auth-wave-d2" />
							{/* Network nodes */}
							<circle cx="280" cy="38" r="5" fill="rgba(37,99,235,0.55)" className="auth-node auth-node-d1" />
							<circle cx="280" cy="38" r="10" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="1" className="auth-ring auth-node-d1" />
							<circle cx="78" cy="28" r="4" fill="rgba(59,130,246,0.55)" className="auth-node auth-node-d2" />
							<circle cx="78" cy="28" r="9" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" className="auth-ring auth-node-d2" />
							<circle cx="312" cy="100" r="4" fill="rgba(14,165,233,0.55)" className="auth-node auth-node-d3" />
							<circle cx="312" cy="100" r="9" fill="none" stroke="rgba(14,165,233,0.3)" strokeWidth="1" className="auth-ring auth-node-d3" />
							{/* Fish */}
							<g transform="translate(42, 60) rotate(-15)" opacity="0.35" className="auth-fish">
								<ellipse cx="0" cy="0" rx="12" ry="6" fill="rgba(59,130,246,0.45)" stroke="rgba(37,99,235,0.5)" strokeWidth="1" />
								<path d="M12,0 L20,-5 L20,5 Z" fill="rgba(59,130,246,0.35)" />
								<circle cx="-6" cy="-1" r="1.5" fill="rgba(37,99,235,0.7)" />
							</g>
							{/* Bubbles */}
							<circle cx="100" cy="170" r="3" fill="rgba(96,165,250,0.2)" className="auth-bubble auth-bubble-1" />
							<circle cx="250" cy="180" r="2" fill="rgba(96,165,250,0.15)" className="auth-bubble auth-bubble-2" />
							<circle cx="60" cy="190" r="2.5" fill="rgba(96,165,250,0.15)" className="auth-bubble auth-bubble-3" />
						</svg>
					</div>

					<div className="auth-side-glow-1" />
					<div className="auth-side-glow-2" />
				</div>

				<div className="auth-side-form">
					<div className="auth-form-inner">
						<header className="auth-form-header">
							<h1 className="auth-form-title">Selamat Datang Kembali</h1>
							<p className="auth-form-subtitle">
								Masukkan detail akun Anda untuk mengakses dashboard.
							</p>
						</header>

						{error && (
							<div className="alert alert-error">
								<AlertCircle size={16} />
								<span>{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className="auth-form">
							<div className="auth-input-group">
								<label className="auth-input-lbl">Username</label>
								<input
									type="text"
									className="auth-input-field"
									placeholder="Username Anda"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									autoComplete="username"
								/>
							</div>

							<div className="auth-input-group">
								<label className="auth-input-lbl">Password</label>
								<div className="auth-input-pw-wrapper">
									<input
										type={showPassword ? "text" : "password"}
										className="auth-input-field auth-input-pw"
										placeholder="Kata Sandi Anda"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										autoComplete="current-password"
									/>
									<button
										type="button"
										className="auth-pw-toggle-btn"
										onClick={() => setShowPassword(!showPassword)}
										aria-label="Toggle password visibility"
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</div>

							<button
								type="submit"
								className="btn-auth-submit"
								disabled={loading}
							>
								<LogIn size={18} />
								{loading ? "Menghubungkan..." : "Masuk Sekarang"}
							</button>
						</form>

						<footer className="auth-form-footer">
							Belum memiliki akun?{" "}
							<Link to="/register" className="auth-footer-link">
								Daftar Akun Baru
							</Link>
						</footer>
					</div>
				</div>
			</div>
			{showRoleModal && loggedInUser && (
				<RoleModal
					isOpen={showRoleModal}
					preventClose={true}
					roles={loggedInUser.roles}
					currentRole={loggedInUser.activeRole}
					onSelectRole={async (role) => {
						try {
							await switchRole(role);
							redirectDashboard(role);
						} catch (err: any) {
							setError(err.message || "Gagal memilih peran");
						}
					}}
				/>
			)}
		</div>
	);
};

export default Login;
