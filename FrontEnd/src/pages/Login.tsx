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
							Hubungkan Bisnis Bahari Anda di SEAPEDIA
						</h2>
						<p className="auth-side-desc">
							Satu platform maritime commerce terpadu yang memfasilitasi
							transaksi aman, transparan, dan terpercaya untuk seluruh pelaku
							usaha kelautan Indonesia.
						</p>

						<ul className="auth-brand-benefits">
							<li>
								<ShieldCheck size={18} className="benefit-icon" />
								<span>Pembayaran Terproteksi & Cepat</span>
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
