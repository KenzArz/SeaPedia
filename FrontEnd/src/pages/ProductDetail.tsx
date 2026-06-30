import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
	ArrowLeft,
	Store,
	ShieldCheck,
	ShoppingCart,
	Info,
	Package,
	Loader,
	AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import { getProductImage, SEAFOOD_IMAGES } from "../utils/imageHelper";
import "../styles/ProductDetail.css";

interface ProductDetailData {
	_id: string;
	name: string;
	price: number;
	stock: number;
	description: string;
	image?: string;
	isActive: boolean;
	store?: {
		_id: string;
		name: string;
		description?: string;
	};
	owner?: {
		username: string;
	};
	createdAt?: string;
}

export const ProductDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [product, setProduct] = useState<ProductDetailData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!id) return;
		const controller = new AbortController();
		const fetchProduct = async () => {
			try {
				setLoading(true);
				const res = await productService.getProductById(id);
				setProduct(res.data.data);
			} catch (err: any) {
				if (err.name === "AbortError" || err.name === "CanceledError") return;
				if (err.response?.status === 404) setError("not_found");
				else setError("Gagal memuat detail produk.");
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
		return () => controller.abort();
	}, [id]);

	if (loading) {
		return (
			<div className="pdp-page">
				<div className="pdp-inner pdp-loading-state">
					<Loader size={32} className="pdp-spinner" />
					<p>Memuat detail produk...</p>
				</div>
			</div>
		);
	}

	if (error === "not_found" || !product) {
		return (
			<div className="pdp-not-found">
				<Package size={56} className="pdp-nf-icon" />
				<h2>Produk Tidak Ditemukan</h2>
				<p>Maaf, produk yang Anda cari tidak tersedia di pasar SEAPEDIA.</p>
				<Link to="/products" className="btn-pdp-back">
					<ArrowLeft size={16} /> Kembali ke Pasar
				</Link>
			</div>
		);
	}

	if (error) {
		return (
			<div className="pdp-page">
				<div className="pdp-inner">
					<div className="pdp-error-state">
						<AlertCircle size={24} />
						<p>{error}</p>
						<Link to="/products" className="btn-pdp-back">
							<ArrowLeft size={16} /> Kembali
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const stockLevel =
		product.stock > 20 ? "high" : product.stock > 5 ? "medium" : "low";
	const stockColor =
		stockLevel === "high"
			? "#0d9488"
			: stockLevel === "medium"
				? "#d97706"
				: "#e11d48";

	return (
		<div className="pdp-page">
			<div className="pdp-inner">
				<nav className="pdp-breadcrumb">
					<Link to="/" className="breadcrumb-link">
						Beranda
					</Link>
					<span className="breadcrumb-sep">/</span>
					<Link to="/products" className="breadcrumb-link">
						Produk
					</Link>
					<span className="breadcrumb-sep">/</span>
					<span className="breadcrumb-current">{product.name}</span>
				</nav>

				<div className="pdp-grid">
					<div className="pdp-col-image">
						<div className="pdp-img-container">
							<img
								src={getProductImage(product.image, 0)}
								alt={product.name}
								className="pdp-img"
								onError={(e) => {
									(e.target as HTMLImageElement).src = SEAFOOD_IMAGES[0];
								}}
							/>
						</div>

						{product.store && (
							<Link
								to={`/stores/${product.store._id}`}
								className="pdp-store-card pdp-store-card--link"
							>
								<div className="pdp-store-avatar">
									<Store size={20} />
								</div>
								<div className="pdp-store-info">
									<span className="pdp-store-lbl">Dijual oleh</span>
									<h4 className="pdp-store-name">{product.store.name}</h4>
									{product.store.description && (
										<p className="pdp-store-desc-small">
											{product.store.description}
										</p>
									)}
								</div>
							</Link>
						)}
					</div>

					<div className="pdp-col-specs">
						{product.store && (
							<Link
								to={`/stores/${product.store._id}`}
								className="pdp-store-inline-badge"
							>
								<Store size={12} />
								<span>{product.store.name}</span>
							</Link>
						)}

						<h1 className="pdp-title">{product.name}</h1>

						<div className="pdp-price-container">
							<span className="pdp-price-lbl">Harga</span>
							<div className="pdp-price-val">
								{new Intl.NumberFormat("id-ID", {
									style: "currency",
									currency: "IDR",
									maximumFractionDigits: 0,
								}).format(product.price)}
							</div>
						</div>

						<hr className="pdp-divider" />

						<div className="pdp-stock-row">
							<span className="pdp-stock-label">Stok tersedia:</span>
							<span
								className="pdp-stock-val"
								style={{ color: product.stock <= 5 ? "#e11d48" : "#0f172a" }}
							>
								{product.stock === 0 ? "Stok habis" : `${product.stock} unit`}
							</span>
							<span
								className="pdp-stock-dot"
								style={{ backgroundColor: stockColor }}
							/>
						</div>

						<div className="pdp-desc-container">
							<h3>Deskripsi Produk</h3>
							<p>{product.description}</p>
						</div>

						<hr className="pdp-divider" />

						<div className="pdp-purchase-container">
							{!user ? (
								<div className="pdp-guest-notice">
									<p>
										Silakan masuk atau daftar terlebih dahulu untuk melakukan
										transaksi pembelian.
									</p>
									<div className="pdp-guest-buttons">
										<Link to="/login" className="btn-pdp-login">
											Masuk
										</Link>
										<Link to="/register" className="btn-pdp-register">
											Daftar Akun
										</Link>
									</div>
								</div>
							) : user.activeRole === "Buyer" ? (
								<div className="pdp-buyer-action">
									<div className="alert-info-compact">
										<Info size={16} />
										<span>
											Fitur pembelian &amp; keranjang belanja akan aktif pada
											pengerjaan Level 3.
										</span>
									</div>
									<button className="btn-pdp-cart-disabled" disabled>
										<ShoppingCart size={18} /> Tambah ke Keranjang
									</button>
								</div>
							) : (
								<div className="pdp-wrong-role">
									<Info size={18} />
									<div>
										<p>
											Anda saat ini login sebagai{" "}
											<strong>{user.activeRole}</strong>.
										</p>
										<p>
											Hanya pengguna dengan peran aktif{" "}
											<strong>Buyer (Pembeli)</strong> yang dapat membeli
											produk.
										</p>
									</div>
								</div>
							)}
						</div>

						<div className="pdp-trust-seal">
							<ShieldCheck size={16} className="pdp-trust-icon" />
							<span>
								Garansi Kesegaran SEAPEDIA — Uang kembali 100% jika produk tidak
								segar.
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetail;
