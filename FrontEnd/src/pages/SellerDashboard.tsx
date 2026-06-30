import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  ArrowRight,
  Store,
  Package,
  Calendar,
} from "lucide-react";
import ComingSoonSlot from "../components/ComingSoonSlot";
import { productService } from "../services/productService";
import { storeService } from "../services/storeService";
import { getProductImage } from "../utils/imageHelper";

interface StoreInfo {
  _id?: string;
  name: string;
  description?: string;
  businessType?: string;
  storePhoto?: string;
  createdAt?: string;
  productCount?: number;
}
interface ProductItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}
function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SellerDashboard: React.FC = () => {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeLoaded, setStoreLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      storeService
        .getMyStore()
        .then((store) => {
          setStore(store ?? null);
          setStoreLoaded(true);
        })
        .catch(() => {
          setStore(null);
          setStoreLoaded(true);
        }),
      productService
        .getMyProducts()
        .then((res) => {
          setProducts(res.data.data ?? []);
        })
        .catch(() => setProducts([])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
        Memuat data toko...
      </div>
    );
  }

  if (storeLoaded && !store) {
    return (
      <>
        <h1 className="rdl-page-title">Dashboard Penjual</h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            marginBottom: 20,
          }}
        >
          Kamu perlu membuat toko terlebih dahulu sebelum bisa mengelola produk.
        </p>
        <Link to="/dashboard/seller/store" className="rdl-btn-action">
          Buat Toko Sekarang <ArrowRight size={14} />
        </Link>
      </>
    );
  }

  const recentProducts = products.slice(0, 5);

  return (
    <>
      <h1 className="rdl-page-title">Dashboard Penjual</h1>
      <p className="rdl-page-sub">Ringkasan aktivitas toko {store?.name}</p>

      <div className="rdl-section">
        <div className="rdl-section-title">Ringkasan Toko</div>
        <div className="rdl-stats-row">
          <div className="rdl-stat-box">
            <span className="rdl-stat-label">
              <Store
                size={13}
                style={{
                  display: "inline",
                  marginRight: 5,
                  verticalAlign: "middle",
                  opacity: 0.6,
                }}
              />
              Nama Toko
            </span>
            <span className="rdl-stat-value">{store?.name ?? "—"}</span>
          </div>
          <div className="rdl-stat-box">
            <span className="rdl-stat-label">
              <Package
                size={13}
                style={{
                  display: "inline",
                  marginRight: 5,
                  verticalAlign: "middle",
                  opacity: 0.6,
                }}
              />
              Produk Aktif
            </span>
            <span className="rdl-stat-value">{products.length}</span>
          </div>
          <div className="rdl-stat-box">
            <span className="rdl-stat-label">
              <Calendar
                size={13}
                style={{
                  display: "inline",
                  marginRight: 5,
                  verticalAlign: "middle",
                  opacity: 0.6,
                }}
              />
              Bergabung Sejak
            </span>
            <span className="rdl-stat-value" style={{ fontSize: 14 }}>
              {formatDate(store?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="rdl-section">
        <div className="rdl-section-title">Pendapatan Toko</div>
        <ComingSoonSlot
          icon={<BarChart3 size={20} />}
          title="Laporan Pendapatan"
          description="Laporan pendapatan akan tersedia setelah fitur checkout aktif"
        />
      </div>

      <div className="rdl-section">
        <div className="rdl-section-title">Pesanan Masuk</div>
        <ComingSoonSlot
          icon={<ClipboardList size={20} />}
          title="Pesanan dari Pembeli"
          description="Pesanan dari pembeli akan muncul di sini setelah fitur checkout tersedia"
        />
      </div>

      <div className="rdl-section">
        <div className="rdl-section-title">5 Produk Terakhir Ditambahkan</div>

        {recentProducts.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            Belum ada produk. Tambah produk pertama dari halaman Produk Saya.
          </p>
        ) : (
          <div className="rdl-product-list">
            {recentProducts.map((prod, idx) => {
              const stockClass =
                prod.stock === 0
                  ? "rdl-stock-badge--empty"
                  : prod.stock <= 10
                    ? "rdl-stock-badge--low"
                    : "rdl-stock-badge--ok";
              return (
                <div key={prod._id} className="rdl-product-row">
                  <img
                    src={getProductImage(prod.image, idx)}
                    alt={prod.name}
                    className="rdl-product-thumb"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getProductImage(
                        null,
                        idx,
                      );
                    }}
                  />
                  <div className="rdl-product-row-info">
                    <div className="rdl-product-row-name">{prod.name}</div>
                    <div className="rdl-product-row-meta">
                      {formatRupiah(prod.price)}
                    </div>
                  </div>
                  <span className={`rdl-stock-badge ${stockClass}`}>
                    {prod.stock === 0 ? "Habis" : `Stok: ${prod.stock}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/dashboard/seller/products" className="rdl-btn-action">
          Kelola Semua Produk <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
};

export default SellerDashboard;
