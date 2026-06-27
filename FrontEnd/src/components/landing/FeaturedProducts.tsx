import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';
import { dummyProducts } from '../../pages/ProductList';
import { SEAFOOD_IMAGES } from '../../utils/imageHelper';
import "../../styles/FeaturedProducts.css";

const categories = ['Semua', 'Ikan Segar', 'Udang & Kepiting', 'Kerang & Moluska'];

export const FeaturedProducts: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const filtered = activeCategory === 'Semua'
    ? dummyProducts.slice(0, 8)
    : dummyProducts.filter(p => p.category === activeCategory).slice(0, 8);

  return (
    <section className="fp-section">
      <div className="fp-inner">
        {/* Header */}
        <div className="fp-header">
          <div>
            <div className="section-label anim-fade-up">Produk Unggulan</div>
            <h2 className="section-heading anim-fade-up-d1">Segar Langsung dari&nbsp;<br />Sumber Terpercaya</h2>
          </div>
          <Link to="/products" className="btn-fp-all anim-fade-up-d1">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        <div className="fp-pills anim-fade-up-d2">
          {categories.map(cat => (
            <button
              key={cat}
              className={`fp-pill ${activeCategory === cat ? 'fp-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="fp-grid">
          {filtered.map((prod, idx) => (
            <Link to={`/products/${prod.id}`} key={prod.id} className="fp-card-link">
              <article className="fp-card">
                <div className="fp-card-img-wrap">
                  <img
                    src={prod.image || SEAFOOD_IMAGES[idx % SEAFOOD_IMAGES.length]}
                    alt={prod.name}
                    className="fp-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        SEAFOOD_IMAGES[idx % SEAFOOD_IMAGES.length];
                    }}
                  />
                  <span className="fp-card-cat">{prod.category}</span>
                </div>
                <div className="fp-card-body">
                  <p className="fp-card-store">
                    <Store size={11} />
                    {prod.storeName}
                  </p>
                  <h3 className="fp-card-name">{prod.name}</h3>
                  <div className="fp-card-footer">
                    <span className="fp-card-price">
                      Rp {prod.price.toLocaleString('id-ID')}
                      <span className="fp-card-unit">/kg</span>
                    </span>
                    <span className={`fp-stock-dot fp-stock-${
                      prod.stock > 20 ? 'high' : prod.stock > 5 ? 'med' : 'low'
                    }`} title={`Stok: ${prod.stock}kg`} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
