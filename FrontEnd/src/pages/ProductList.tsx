import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProductImage, SEAFOOD_IMAGES } from '../utils/imageHelper';
import "../styles/ProductList.css";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  storeName: string;
  image: string;
  category: string;
}

export const dummyProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Ikan Salmon Segar Premium (Fillet)',
    price: 185000,
    stock: 25,
    description: 'Fillet Salmon Segar kualitas sashimi, dikemas higienis dengan ice pack untuk menjaga kesegaran selama pengiriman.',
    storeName: 'Prima Seafood Indah',
    image: '',
    category: 'Ikan Segar'
  },
  {
    id: 'prod-2',
    name: 'Udang Windu Super (Tiger Prawn)',
    price: 120000,
    stock: 40,
    description: 'Udang windu segar ukuran besar (isi 15-20 ekor per kg). Ditangkap langsung dari tambak ramah lingkungan.',
    storeName: 'Nelayan Sejahtera Lestari',
    image: '',
    category: 'Udang & Kepiting'
  },
  {
    id: 'prod-3',
    name: 'Lobster Bambu Hidup (Live)',
    price: 350000,
    stock: 12,
    description: 'Lobster bambu laut hidup hasil tangkapan nelayan tradisional di pantai selatan Jawa.',
    storeName: 'Samudra Jaya Bahari',
    image: '',
    category: 'Udang & Kepiting'
  },
  {
    id: 'prod-4',
    name: 'Daging Kerang Dara Kupas Segar',
    price: 65000,
    stock: 50,
    description: 'Kerang dara segar kupas siap masak, dicuci bersih dan dibekukan dengan teknologi IQF untuk mengunci kesegaran.',
    storeName: 'Toko Bahari Subur',
    image: '',
    category: 'Kerang & Moluska'
  },
  {
    id: 'prod-5',
    name: 'Cumi-Cumi Telur Segar (Squid)',
    price: 95000,
    stock: 30,
    description: 'Cumi segar sero dengan telur di dalamnya. Sangat gurih dan empuk, tanpa pengawet.',
    storeName: 'Nelayan Sejahtera Lestari',
    image: '',
    category: 'Kerang & Moluska'
  },
  {
    id: 'prod-6',
    name: 'Kepiting Bakau Jantan Super',
    price: 210000,
    stock: 15,
    description: 'Kepiting bakau hidup berkualitas ekspor dari perairan Kalimantan. Daging padat dan manis.',
    storeName: 'Samudra Jaya Bahari',
    image: '',
    category: 'Udang & Kepiting'
  }
];

const categories = ['Semua', 'Ikan Segar', 'Udang & Kepiting', 'Kerang & Moluska'];

export const ProductList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredProducts = dummyProducts.filter(prod => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="plp-page">
      <header className="plp-header">
        <h1 className="plp-title">Pasar Produk Bahari</h1>
        <p className="plp-subtitle">
          Temukan produk hasil laut segar terbaik langsung dari nelayan & distributor terpercaya.
        </p>
      </header>

      <section className="plp-filters-bar">
        <div className="plp-search-box">
          <Search size={18} className="plp-search-icon" />
          <input
            type="text"
            className="plp-search-input"
            placeholder="Cari produk atau nama toko..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="plp-pills-list">
          {categories.map(cat => (
            <button
              key={cat}
              className={`plp-category-pill ${selectedCategory === cat ? 'plp-category-pill--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <div className="plp-empty">
          <SlidersHorizontal size={40} className="plp-empty-icon" />
          <h3>Tidak Ada Produk</h3>
          <p>Silakan gunakan filter atau kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="plp-grid">
          {filteredProducts.map((prod, idx) => (
            <Link to={`/products/${prod.id}`} key={prod.id} className="plp-item-link">
              <article className="plp-item-card">
                <div className="plp-item-img-wrap">
                  <img
                    src={getProductImage(prod.image, idx)}
                    alt={prod.name}
                    className="plp-item-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SEAFOOD_IMAGES[idx % SEAFOOD_IMAGES.length];
                    }}
                  />
                  <span className="plp-item-cat-badge">{prod.category}</span>
                  <div className="plp-item-stock-tag">
                    <span className={`stock-indicator ${prod.stock > 20 ? 'stock-high' : prod.stock > 5 ? 'stock-med' : 'stock-low'}`}></span>
                    <span>{prod.stock} kg</span>
                  </div>
                </div>
                <div className="plp-item-body">
                  <div className="plp-item-store">
                    <Store size={12} />
                    <span>{prod.storeName}</span>
                  </div>
                  <h3 className="plp-item-name">{prod.name}</h3>
                  <div className="plp-item-price-row">
                    <span className="plp-item-price">
                      Rp {prod.price.toLocaleString('id-ID')}
                      <span className="plp-item-price-unit">/kg</span>
                    </span>
                    <span className="plp-item-btn-arrow">Beli →</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {!user && (
        <section className="plp-guest-cta">
          <div className="plp-guest-cta-inner">
            <h3>Ingin melakukan transaksi langsung?</h3>
            <p>Daftarkan akun gratis di SEAPEDIA untuk memulai belanja, mengelola toko, atau bekerja sebagai driver.</p>
            <div className="plp-guest-cta-buttons">
              <Link to="/register" className="btn-plp-guest-primary">Buat Akun Sekarang</Link>
              <Link to="/login" className="btn-plp-guest-secondary">Masuk</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductList;
