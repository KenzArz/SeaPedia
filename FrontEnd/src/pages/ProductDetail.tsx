import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, ShoppingCart, Info, Package } from 'lucide-react';
import { dummyProducts } from './ProductList';
import { useAuth } from '../context/AuthContext';
import { getProductImage, SEAFOOD_IMAGES } from '../utils/imageHelper';
import "../styles/ProductDetail.css";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const product = dummyProducts.find(p => p.id === id);

  if (!product) {
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

  const stockLevel = product.stock > 20 ? 'high' : product.stock > 5 ? 'medium' : 'low';
  const stockLevelLabel = { high: 'Stok Melimpah', medium: 'Stok Terbatas', low: 'Stok Menipis' }[stockLevel];

  const dummyIndex = dummyProducts.indexOf(product);

  return (
    <div className="pdp-page">
      <div className="pdp-inner">
        <nav className="pdp-breadcrumb">
          <Link to="/" className="breadcrumb-link">Beranda</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/products" className="breadcrumb-link">Produk</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="pdp-col-image">
            <div className="pdp-img-container">
              <img
                src={getProductImage(product.image, dummyIndex)}
                alt={product.name}
                className="pdp-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = SEAFOOD_IMAGES[dummyIndex % SEAFOOD_IMAGES.length];
                }}
              />
              <span className="pdp-category-overlay">{product.category}</span>
            </div>
            <div className="pdp-store-card">
              <div className="pdp-store-avatar">
                <Store size={20} />
              </div>
              <div className="pdp-store-info">
                <span className="pdp-store-lbl">Penjual Terpercaya</span>
                <h4 className="pdp-store-name">{product.storeName}</h4>
              </div>
            </div>
          </div>

          <div className="pdp-col-specs">
            <span className="pdp-category-lbl">{product.category}</span>
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-price-container">
              <span className="pdp-price-lbl">Harga Per Kilogram</span>
              <div className="pdp-price-val">
                Rp {product.price.toLocaleString('id-ID')}
                <span className="pdp-price-unit">/kg</span>
              </div>
            </div>

            <div className="pdp-stock-indicator-row">
              <span className={`pdp-stock-dot pdp-stock-dot--${stockLevel}`} />
              <span className="pdp-stock-text">{stockLevelLabel} ({product.stock} kg)</span>
            </div>

            <div className="pdp-desc-container">
              <h3>Deskripsi Produk</h3>
              <p>{product.description}</p>
            </div>

            <div className="pdp-purchase-container">
              {!user ? (
                <div className="pdp-guest-notice">
                  <p>Silakan masuk atau daftar terlebih dahulu untuk melakukan transaksi pembelian.</p>
                  <div className="pdp-guest-buttons">
                    <Link to="/login" className="btn-pdp-login">Masuk</Link>
                    <Link to="/register" className="btn-pdp-register">Daftar Akun</Link>
                  </div>
                </div>
              ) : user.activeRole === 'Buyer' ? (
                <div className="pdp-buyer-action">
                  <div className="alert-info-compact">
                    <Info size={16} />
                    <span>Fitur pembelian & keranjang belanja akan aktif pada pengerjaan Level 3.</span>
                  </div>
                  <button className="btn-pdp-cart-disabled" disabled>
                    <ShoppingCart size={18} /> Tambah ke Keranjang
                  </button>
                </div>
              ) : (
                <div className="pdp-wrong-role">
                  <Info size={18} />
                  <div>
                    <p>Anda saat ini login sebagai <strong>{user.activeRole}</strong>.</p>
                    <p>Hanya pengguna dengan peran aktif <strong>Buyer (Pembeli)</strong> yang dapat membeli produk.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pdp-trust-seal">
              <ShieldCheck size={16} className="pdp-trust-icon" />
              <span>Garansi Kesegaran SEAPEDIA — Uang kembali 100% jika produk tidak segar.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
