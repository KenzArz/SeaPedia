import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Package, ArrowRight } from "lucide-react";
import ComingSoonSlot from "../components/ComingSoonSlot";
import { productService } from "../services/productService";
import { getProductImage } from "../utils/imageHelper";

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

const BuyerDashboard: React.FC = () => {
	const [products, setProducts] = useState<ProductPreview[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		productService
			.getAllProducts({ limit: 5, page: 1 })
			.then((res) => setProducts(res.data.data ?? []))
			.catch(() => setProducts([]))
			.finally(() => setLoading(false));
	}, []);

	return (
		<>
			<h1 className="rdl-page-title">Dashboard Pembeli</h1>
			<p className="rdl-page-sub">Selamat datang di dasbor pembelimu</p>

			<div className="rdl-section">
				<div className="rdl-section-title">Ringkasan Pembeli</div>

				<ComingSoonSlot
					icon={<Wallet size={20} />}
					title="Saldo Wallet"
					description="Fitur wallet dan saldo akan tersedia di update mendatang"
				/>
			</div>

			<div className="rdl-section">
				<div className="rdl-section-title">Pesanan Saya</div>

				<ComingSoonSlot
					icon={<Package size={20} />}
					title="Riwayat Pesanan"
					description="Riwayat pesananmu akan muncul di sini setelah fitur checkout tersedia"
				/>
			</div>

			<div className="rdl-section">
				<div className="rdl-section-title">Produk Terbaru</div>
				<p
					style={{
						fontSize: 12.5,
						color: "var(--text-muted)",
						marginBottom: 14,
					}}
				>
					Jelajahi produk yang baru ditambahkan di SEAPEDIA
				</p>

				{loading ? (
					<div className="rdl-product-grid">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								style={{
									height: 160,
									borderRadius: 10,
									background:
										"linear-gradient(90deg,var(--bg-surface) 25%,var(--border) 50%,var(--bg-surface) 75%)",
									backgroundSize: "200% 100%",
									animation: "shimmer 1.4s ease-in-out infinite",
								}}
							/>
						))}
					</div>
				) : products.length === 0 ? (
					<p
						style={{
							fontSize: 13,
							color: "var(--text-muted)",
							fontStyle: "italic",
						}}
					>
						Belum ada produk tersedia.
					</p>
				) : (
					<div className="rdl-product-grid">
						{products.map((prod, idx) => (
							<Link
								key={prod._id}
								to={`/products/${prod._id}`}
								className="rdl-product-card"
							>
								<img
									src={getProductImage(prod.image, idx)}
									alt={prod.name}
									className="rdl-product-img"
									onError={(e) => {
										(e.target as HTMLImageElement).src = getProductImage(
											null,
											idx,
										);
									}}
								/>
								<div className="rdl-product-body">
									{prod.store && (
										<span className="rdl-product-store">{prod.store.name}</span>
									)}
									<span className="rdl-product-name">{prod.name}</span>
									<span className="rdl-product-price">
										{formatRupiah(prod.price)}
									</span>
								</div>
							</Link>
						))}
					</div>
				)}

				<Link to="/products" className="rdl-btn-see-all">
					Lihat Semua Produk <ArrowRight size={14} />
				</Link>
			</div>
		</>
	);
};

export default BuyerDashboard;
