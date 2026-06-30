import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export const Register: React.FC = () => {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await register(username, password);
			navigate("/dashboard");
		} catch (err: any) {
			setError(
				err.message || "Registrasi gagal. Silakan coba username lainnya.",
			);
		} finally {
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
							Ekosistem Multi-Peran Pertama di Indonesia
						</h2>
						<p className="auth-side-desc">
							Dengan sistem terpadu SEAPEDIA, Anda dapat menjadi Pembeli
							sekaligus Penjual dan Kurir dengan hanya menggunakan satu
							kredensial akun yang sama.
						</p>
						<div className="auth-side-stats">
							<div className="side-stat-item">
								<span className="stat-num">3</span>
								<span className="stat-lbl">Pilihan Peran</span>
							</div>
							<div className="side-stat-divider" />
							<div className="side-stat-item">
								<span className="stat-num">1</span>
								<span className="stat-lbl">Akun Tunggal</span>
							</div>
						</div>
					</div>
					<div className="auth-side-glow-1" />
					<div className="auth-side-glow-2" />
				</div>

				<div className="auth-side-form">
					<div className="auth-form-inner auth-form-inner--wide">
						<header className="auth-form-header">
							<h1 className="auth-form-title">Daftar Akun Baru</h1>
							<p className="auth-form-subtitle">
								Buat akun gratis Anda dalam hitungan detik.
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
									placeholder="Buat username unik Anda"
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
										placeholder="Buat sandi minimal 6 karakter"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										autoComplete="new-password"
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
								<UserPlus size={18} />
								{loading ? "Mendaftarkan Akun..." : "Daftar Sekarang"}
							</button>
						</form>

						<footer className="auth-form-footer">
							Sudah memiliki akun?{" "}
							<Link to="/login" className="auth-footer-link">
								Masuk di sini
							</Link>
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
