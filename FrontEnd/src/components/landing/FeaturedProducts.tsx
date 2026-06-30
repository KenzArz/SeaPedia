import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, Loader } from 'lucide-react';
import { productService } from '../../services/productService';
import { getProductImage, SEAFOOD_IMAGES } from '../../utils/imageHelper';
import "../../styles/FeaturedProducts.css";

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
}

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await productService.getAllProducts({ limit: 8 });
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
    return () => controller.abort();
  }, []);

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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader className="animate-spin" size={24} style={{ color: '#4F46E5' }} />
          </div>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Belum ada produk tersedia</p>
        ) : (
          <div className="fp-grid">
            {products.map((prod, idx) => (
              <Link to={`/products/${prod._id}`} key={prod._id} className="fp-card-link">
                <article className="fp-card">
                  <div className="fp-card-img-wrap">
                    <img
                      src={getProductImage(prod.image, idx)}
                      alt={prod.name}
                      className="fp-card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          SEAFOOD_IMAGES[idx % SEAFOOD_IMAGES.length];
                      }}
                    />
                  </div>
                  <div className="fp-card-body">
                    {prod.store && (
                      <p className="fp-card-store">
                        <Store size={11} />
                        {prod.store.name}
                      </p>
                    )}
                    <h3 className="fp-card-name">{prod.name}</h3>
                    <div className="fp-card-footer">
                      <span className="fp-card-price">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0
                        }).format(prod.price)}
                      </span>
                      <span className={`fp-stock-dot fp-stock-${
                        prod.stock > 20 ? 'high' : prod.stock > 5 ? 'med' : 'low'
                      }`} title={`Stok: ${prod.stock} unit`} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
