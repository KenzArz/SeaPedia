import React from "react";
import { Truck, History } from "lucide-react";
import ComingSoonSlot from "../components/ComingSoonSlot";
import { useAuth } from "../context/AuthContext";

const DriverDashboard: React.FC = () => {
	const { user } = useAuth();

	return (
		<>
			<h1 className="rdl-page-title">Dashboard Pengemudi</h1>
			<p className="rdl-page-sub">
				Selamat datang sebagai pengemudi SEAPEDIA, {user?.username}
			</p>

			<div className="rdl-section">
				<div className="rdl-section-title">Pekerjaan Aktif</div>
				<ComingSoonSlot
					icon={<Truck size={20} />}
					title="Belum Ada Pekerjaan Aktif"
					description="Fitur pencarian dan penerimaan job pengiriman akan tersedia di update mendatang"
				/>
			</div>

			<div className="rdl-section">
				<div className="rdl-section-title">
					Riwayat Pekerjaan &amp; Pendapatan
				</div>
				<ComingSoonSlot
					icon={<History size={20} />}
					title="Riwayat Pengiriman"
					description="Riwayat pengiriman dan pendapatanmu akan muncul di sini"
				/>
			</div>
		</>
	);
};

export default DriverDashboard;
