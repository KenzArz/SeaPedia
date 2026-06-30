import React, { useState } from "react";
import { Truck, AlertCircle, X } from "lucide-react";
import Button from "./Button";

interface BecomeDriverModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (fullName: string, vehicleNumber: string) => Promise<void>;
}

export const BecomeDriverModal: React.FC<BecomeDriverModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [fullName, setFullName] = useState("");
	const [vehicleNumber, setVehicleNumber] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!fullName.trim()) {
			setError("Nama lengkap wajib diisi.");
			return;
		}
		if (!vehicleNumber.trim()) {
			setError("Nomor kendaraan wajib diisi.");
			return;
		}
		setLoading(true);
		try {
			await onSubmit(fullName.trim(), vehicleNumber.trim());
		} catch (err: any) {
			setError(err.message || "Gagal mendaftar sebagai driver.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div
					className="modal-header-container"
					style={{ position: "relative" }}
				>
					<h2>Daftar Jadi Pengemudi</h2>
					<p className="modal-sub">
						Bergabung sebagai mitra logistik SEAPEDIA untuk mengantar hasil laut
						segar.
					</p>
					<button
						onClick={onClose}
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							color: "var(--text-muted)",
						}}
						aria-label="Close"
					>
						<X size={20} />
					</button>
				</div>

				{error && (
					<div className="alert alert-error">
						<AlertCircle size={16} />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="modal-form">
					<div className="modal-input-group">
						<label className="modal-input-lbl">Nama Lengkap</label>
						<input
							type="text"
							className="modal-input-field"
							placeholder="Masukkan nama sesuai KTP"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					<div className="modal-input-group">
						<label className="modal-input-lbl">Nomor Kendaraan</label>
						<input
							type="text"
							className="modal-input-field"
							placeholder="Contoh: B 1234 CDG"
							value={vehicleNumber}
							onChange={(e) => setVehicleNumber(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					<div className="modal-btn-group">
						<Button
							variant="outline"
							type="button"
							onClick={onClose}
							disabled={loading}
						>
							Batal
						</Button>
						<Button
							variant="primary"
							type="submit"
							disabled={loading}
							style={{ backgroundColor: "var(--driver-color)", border: "none" }}
						>
							<Truck size={16} />
							{loading ? "Memproses..." : "Daftar Sekarang"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BecomeDriverModal;
