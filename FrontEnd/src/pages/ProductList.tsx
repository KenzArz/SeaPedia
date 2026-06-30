import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";
import { getProductImage, SEAFOOD_IMAGES } from "../utils/imageHelper";
import "../styles/ProductList.css";
import "../styles/ProductListV2.css";

interface ApiProduct {
	_id: string;
	name: string;
	price: number;
	stock: number;
	description: string;
	image?: string;
	store?: {
		_id: string;
		name: string;
		description?: string;
	};
	owner?: {
		username: string;
	};
}

interface PaginationInfo {
	total: number;
	page: number;
	totalPages: number;
}

const SkeletonCard = () => (
	<div className="plp-skeleton-card">
		<div className="skeleton plp-skel-img" />
		<div className="plp-skel-body">
			<div className="skeleton plp-skel-line plp-skel-line--short" />
			<div className="skeleton plp-skel-line" />
			<div className="skeleton plp-skel-line plp-skel-line--medium" />
			<div className="skeleton plp-skel-price" />
		</div>
	</div>
);

export const ProductList: React.FC = () => {
	const { user } = useAuth();
	const [products, setProducts] = useState<ApiProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationInfo>({
		total: 0,
		page: 1,
		totalPages: 1,
	});

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 400);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch]);

	useEffect(() => {
		const controller = new AbortController();

		const fetchProducts = async () => {
			try {
				setLoading(true);
				setError("");
				const res = await productService.getAllProducts({
					search: debouncedSearch || undefined,
					page,
					limit: 12,
				});
				setProducts(res.data.data || []);
				setPagination(
					res.data.pagination || { total: 0, page: 1, totalPages: 1 },
				);
			} catch (err: any) {
				if (err.name === "AbortError" || err.name === "CanceledError") return;
				setError("Gagal memuat produk. Silakan coba lagi.");
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
		return () => controller.abort();
	}, [debouncedSearch, page]);

	const handlePrev = () => setPage((p) => Math.max(1, p - 1));
	const handleNext = () =>
		setPage((p) => Math.min(pagination.totalPages, p + 1));

	return (
		<div className="plp-page">
			<header className="plp-header">
				<h1 className="plp-title">Katalog Produk</h1>
				<p className="plp-subtitle">
					Temukan produk terbaik dari ribuan toko terpercaya di seluruh Indonesia.
				</p>
			</header>

			<section className="plp-filters-bar">
				<div className="plp-search-box">
					<Search size={18} className="plp-search-icon" />
					<input
						type="text"
						className="plp-search-input"
						placeholder="Cari nama produk..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</section>

			{error && <div className="plp-error">{error}</div>}

			{loading ? (
				<div className="plp-grid">
					{Array.from({ length: 8 }).map((_, i) => (
						<SkeletonCard key={i} />
					))}
				</div>
			) : products.length === 0 ? (
				<div className="plp-empty">
					<svg
						width="64"
						height="64"
						viewBox="0 0 64 64"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ marginBottom: 16 }}
					>
						<rect width="64" height="64" rx="16" fill="#EEF2FF" />
						<path
							d="M16 22H48L44 44H20L16 22Z"
							fill="#C7D2FE"
							stroke="#4F46E5"
							strokeWidth="1.5"
						/>
						<path
							d="M12 22H52"
							stroke="#4F46E5"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<path
							d="M28 22V18C28 16.9 28.9 16 30 16H34C35.1 16 36 16.9 36 18V22"
							stroke="#4F46E5"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</svg>
					<h3>Belum ada produk tersedia</h3>
					<p>
						{search
							? `Tidak ada produk dengan kata kunci "${search}".`
							: "Produk akan segera hadir."}
					</p>
				</div>
			) : (
				<>
					<div className="plp-grid">
						{products.map((prod, idx) => (
							<article key={prod._id} className="plp-item-card">
								<div className="plp-item-img-wrap">
									<img
										src={getProductImage(prod.image, idx)}
										alt={prod.name}
										className="plp-item-img"
										onError={(e) => {
											(e.target as HTMLImageElement).src =
												SEAFOOD_IMAGES[idx % SEAFOOD_IMAGES.length];
										}}
									/>
									{prod.stock <= 10 && prod.stock > 0 && (
										<span className="plp-stock-warning">Stok {prod.stock}</span>
									)}
									{prod.stock === 0 && (
										<span className="plp-stock-out">Habis</span>
									)}
								</div>
								<div className="plp-item-body">
									{prod.store && (
										<Link
											to={`/stores/${prod.store._id}`}
											className="plp-item-store"
											onClick={(e) => e.stopPropagation()}
										>
											<Store size={12} />
											<span>{prod.store.name}</span>
										</Link>
									)}
									<h3 className="plp-item-name">{prod.name}</h3>
									<p className="plp-item-price">
										{new Intl.NumberFormat("id-ID", {
											style: "currency",
											currency: "IDR",
											maximumFractionDigits: 0,
										}).format(prod.price)}
									</p>
									<Link to={`/products/${prod._id}`} className="plp-btn-detail">
										Lihat Detail
									</Link>
								</div>
							</article>
						))}
					</div>

					{pagination.totalPages > 1 && (
						<div className="plp-pagination">
							<button
								className="plp-page-btn"
								onClick={handlePrev}
								disabled={page <= 1}
							>
								<ChevronLeft size={16} /> Sebelumnya
							</button>
							<span className="plp-page-info">
								Halaman <strong>{page}</strong> dari{" "}
								<strong>{pagination.totalPages}</strong>
								<span className="plp-page-total">
									{" "}
									({pagination.total} produk)
								</span>
							</span>
							<button
								className="plp-page-btn"
								onClick={handleNext}
								disabled={page >= pagination.totalPages}
							>
								Berikutnya <ChevronRight size={16} />
							</button>
						</div>
					)}
				</>
			)}

			{!user && (
				<section className="plp-guest-cta">
					<div className="plp-guest-cta-inner">
						<h3>Ingin melakukan transaksi langsung?</h3>
						<p>
							Daftarkan akun gratis di SEAPEDIA untuk memulai belanja, mengelola
							toko, atau bekerja sebagai driver.
						</p>
						<div className="plp-guest-cta-buttons">
							<Link to="/register" className="btn-plp-guest-primary">
								Buat Akun Sekarang
							</Link>
							<Link to="/login" className="btn-plp-guest-secondary">
								Masuk
							</Link>
						</div>
					</div>
				</section>
			)}
		</div>
	);
};

export default ProductList;
