import React, { useState } from "react";
import { Store, AlertCircle, X } from "lucide-react";
import Button from "./Button";

interface BecomeSellerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (storeName: string) => Promise<void>;
}

export const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [storeName, setStoreName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!storeName.trim() || storeName.trim().length < 3) {
			setError("Nama toko minimal harus 3 karakter.");
			return;
		}
		setLoading(true);
		try {
			await onSubmit(storeName.trim());
		} catch (err: any) {
			setError(err.message || "Gagal membuka toko. Coba nama toko lainnya.");
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
					<h2>Buka Toko Baru</h2>
					<p className="modal-sub">
						Mulai menjual hasil laut segar Anda langsung di SEAPEDIA.
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
						<label className="modal-input-lbl">Nama Toko</label>
						<input
							type="text"
							className="modal-input-field"
							placeholder="Masukkan nama unik toko Anda"
							value={storeName}
							onChange={(e) => setStoreName(e.target.value)}
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
							style={{ backgroundColor: "var(--seller-color)", border: "none" }}
						>
							<Store size={16} />
							{loading ? "Memproses..." : "Buka Toko Sekarang"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BecomeSellerModal;
