import React from 'react';
import { ShoppingBag, Store, Compass, CheckCircle } from 'lucide-react';
import "../../styles/HowItWorks.css";

const roles = [
  {
    id: 'buyer',
    icon: ShoppingBag,
    label: 'Pembeli',
    tagline: 'Belanja dari ribuan toko terpercaya',
    steps: ['Temukan produk pilihan', 'Bayar aman via wallet', 'Terima & nikmati'],
    accent: 'var(--buyer-color)',
    accentLight: 'var(--buyer-light)',
    imgSrc:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=340&fit=crop&auto=format',
  },
  {
    id: 'seller',
    icon: Store,
    label: 'Penjual',
    tagline: 'Pasarkan produk tanpa ribet',
    steps: ['Buka toko online gratis', 'Atur stok & harga', 'Terima pesanan & bayar'],
    accent: 'var(--seller-color)',
    accentLight: 'var(--seller-light)',
    imgSrc:
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=480&h=340&fit=crop&auto=format',
  },
  {
    id: 'driver',
    icon: Compass,
    label: 'Kurir',
    tagline: 'Penghasilan fleksibel per ritase',
    steps: ['Pilih pesanan tersedia', 'Antar ke pembeli', 'Terima komisi instan'],
    accent: 'var(--driver-color)',
    accentLight: 'var(--driver-light)',
    imgSrc:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&h=340&fit=crop&auto=format',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="hiw-section">
      <div className="hiw-inner">
        <div className="section-label anim-fade-up">Cara Kerja</div>
        <h2 className="section-heading anim-fade-up-d1">
          Satu Platform,<br />Tiga Peran Berbeda
        </h2>
        <p className="section-desc anim-fade-up-d2">
          SEAPEDIA dirancang untuk semua pelaku transaksi digital. Pilih peran Anda —
          atau aktifkan ketiganya sekaligus.
        </p>

        <div className="hiw-cards">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <div key={role.id} className={`hiw-card anim-fade-up-d${i + 2}`}>
                <div className="hiw-card-img-wrap">
                  <img
                    src={role.imgSrc}
                    alt={role.label}
                    className="hiw-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = role.imgFallback;
                    }}
                  />
                  <div
                    className="hiw-card-img-overlay"
                    style={{ background: `${role.accent}22` }}
                  />
                </div>

                <div className="hiw-card-body">
                  <div
                    className="hiw-icon-wrap"
                    style={{ background: role.accentLight, color: role.accent }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="hiw-card-title">{role.label}</h3>
                  <p className="hiw-card-tagline">{role.tagline}</p>

                  <ul className="hiw-steps">
                    {role.steps.map((step, si) => (
                      <li key={si} className="hiw-step">
                        <CheckCircle size={15} style={{ color: role.accent, flexShrink: 0 }} />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
