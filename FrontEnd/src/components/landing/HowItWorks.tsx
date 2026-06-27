import React from 'react';
import { ShoppingBag, Store, Compass, CheckCircle } from 'lucide-react';
import "../../styles/HowItWorks.css";

const roles = [
  {
    id: 'buyer',
    icon: ShoppingBag,
    label: 'Pembeli',
    tagline: 'Belanja langsung dari nelayan',
    steps: ['Temukan produk segar', 'Bayar aman via wallet', 'Terima & nikmati'],
    accent: 'var(--buyer-color)',
    accentLight: 'var(--buyer-light)',
    imgSrc:
      'https://images.unsplash.com/photo-1559737632-154df6a9c2b4?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=480&h=340&fit=crop&auto=format',
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
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1553618551-fba689030290?w=480&h=340&fit=crop&auto=format',
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
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=480&h=340&fit=crop&auto=format',
    imgFallback:
      'https://images.unsplash.com/photo-1534177616072-ef7b14649b7b?w=480&h=340&fit=crop&auto=format',
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
          SEAPEDIA dirancang untuk semua aktor dalam rantai pasok bahari. Pilih peran Anda —
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
