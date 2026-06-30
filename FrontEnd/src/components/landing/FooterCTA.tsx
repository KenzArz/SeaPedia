import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import "../../styles/FooterCTA.css";

export const FooterCTA: React.FC = () => {
  return (
    <section className="footer-cta-section">
      <div className="footer-cta-inner">
        <div className="footer-cta-card">

          <div className="footer-cta-body">

            <div className="footer-cta-content">
              <div className="footer-cta-badge">
                <Users size={13} />
                <span>Bergabung Sekarang</span>
              </div>

              <h2 className="footer-cta-heading">
                Siap Bergabung dengan<br />Ribuan Penjual &amp; Pembeli?
              </h2>
              <p className="footer-cta-desc">
                Daftarkan akun SEAPEDIA Anda secara gratis sekarang. Mulai berbelanja produk pilihan,
                buka toko online Anda sendiri, atau bekerja sebagai mitra kurir terpercaya.
              </p>

              <div className="footer-cta-actions">
                <Link to="/register" className="btn-cta-primary">
                  Daftar Gratis Sekarang <ArrowRight size={16} />
                </Link>
                <Link to="/products" className="btn-cta-secondary">
                  Lihat Produk Pasar
                </Link>
              </div>

              <div className="footer-cta-stats">
                <div className="cta-stat">
                  <span className="cta-stat-num">2.4K+</span>
                  <span className="cta-stat-lbl">Penjual</span>
                </div>
                <div className="cta-stat-divider" />
                <div className="cta-stat">
                  <span className="cta-stat-num">18K+</span>
                  <span className="cta-stat-lbl">Transaksi</span>
                </div>
                <div className="cta-stat-divider" />
                <div className="cta-stat">
                  <span className="cta-stat-num">340+</span>
                  <span className="cta-stat-lbl">Kota</span>
                </div>
              </div>
            </div>

            <div className="footer-cta-illustration" aria-hidden="true">
              <svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="cta-maritime-svg">
                <path d="M10,200 C60,182 110,218 160,200 C210,182 260,218 330,200" stroke="rgba(37,99,235,0.35)" strokeWidth="2" className="cta-ocean-wave" />
                <path d="M10,215 C70,198 120,232 180,215 C240,198 290,230 330,215" stroke="rgba(59,130,246,0.25)" strokeWidth="1.5" className="cta-ocean-wave cta-wave-d1" />
                <path d="M10,230 C80,214 135,246 195,230 C255,214 300,244 330,230" stroke="rgba(96,165,250,0.18)" strokeWidth="1.2" className="cta-ocean-wave cta-wave-d2" />

                <path d="M120,195 L220,195 L235,210 L105,210 Z" fill="rgba(30,58,138,0.55)" stroke="rgba(37,99,235,0.5)" strokeWidth="1.2" />
                <rect x="130" y="165" width="80" height="30" rx="3" fill="rgba(37,99,235,0.4)" stroke="rgba(59,130,246,0.45)" strokeWidth="1" />
                <rect x="155" y="145" width="40" height="22" rx="3" fill="rgba(29,78,216,0.45)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
                <rect x="161" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.6)" />
                <rect x="175" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.6)" />
                <rect x="189" y="150" width="9" height="7" rx="1.5" fill="rgba(147,197,253,0.35)" />
                <line x1="175" y1="145" x2="175" y2="90" stroke="rgba(37,99,235,0.5)" strokeWidth="1.5" />
                <path d="M175,92 L210,108 L175,124 Z" fill="rgba(59,130,246,0.25)" stroke="rgba(37,99,235,0.4)" strokeWidth="1" className="cta-sail" />
                <line x1="175" y1="90" x2="175" y2="75" stroke="rgba(37,99,235,0.45)" strokeWidth="1" />
                <circle cx="175" cy="73" r="2.5" fill="rgba(37,99,235,0.8)" className="cta-antenna-dot" />

                <line x1="175" y1="73" x2="280" y2="40" stroke="rgba(96,165,250,0.25)" strokeWidth="1" strokeDasharray="4 4" className="cta-net-line" />
                <line x1="175" y1="73" x2="80" y2="30" stroke="rgba(96,165,250,0.25)" strokeWidth="1" strokeDasharray="4 4" className="cta-net-line cta-wave-d1" />
                <line x1="175" y1="73" x2="310" y2="100" stroke="rgba(96,165,250,0.18)" strokeWidth="1" strokeDasharray="4 4" className="cta-net-line cta-wave-d2" />

                <circle cx="280" cy="38" r="5" fill="rgba(37,99,235,0.55)" className="network-node pulse-node-1" />
                <circle cx="280" cy="38" r="10" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="1" className="network-node-ring ring-1" />

                <circle cx="78" cy="28" r="4" fill="rgba(59,130,246,0.55)" className="network-node pulse-node-2" />
                <circle cx="78" cy="28" r="9" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1" className="network-node-ring ring-2" />

                <circle cx="312" cy="100" r="4" fill="rgba(14,165,233,0.55)" className="network-node pulse-node-3" />
                <circle cx="312" cy="100" r="9" fill="none" stroke="rgba(14,165,233,0.3)" strokeWidth="1" className="network-node-ring ring-3" />

                <g transform="translate(30, 230) scale(0.7)" opacity="0.3" stroke="rgba(37,99,235,0.9)" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="18" cy="8" r="6" fill="none" />
                  <line x1="18" y1="14" x2="18" y2="38" />
                  <path d="M8,30 C8,38 28,38 28,30" fill="none" />
                  <line x1="12" y1="8" x2="24" y2="8" />
                </g>

                <g transform="translate(42, 60) rotate(-15)" opacity="0.35" className="cta-fish">
                  <ellipse cx="0" cy="0" rx="12" ry="6" fill="rgba(59,130,246,0.45)" stroke="rgba(37,99,235,0.5)" strokeWidth="1" />
                  <path d="M12,0 L20,-5 L20,5 Z" fill="rgba(59,130,246,0.35)" />
                  <circle cx="-6" cy="-1" r="1.5" fill="rgba(37,99,235,0.7)" />
                </g>

                <circle cx="100" cy="170" r="3" fill="rgba(96,165,250,0.2)" className="cta-bubble cta-bubble-1" />
                <circle cx="250" cy="180" r="2" fill="rgba(96,165,250,0.15)" className="cta-bubble cta-bubble-2" />
                <circle cx="60" cy="190" r="2.5" fill="rgba(96,165,250,0.15)" className="cta-bubble cta-bubble-3" />
              </svg>
            </div>
          </div>
        </div>

        <footer className="footer-bar">
          <div className="footer-bar-inner">
            <div className="footer-brand">
              <span className="footer-logo">🌊 SEAPEDIA</span>
              <span className="footer-tagline">Platform E-Commerce Terpadu — COMPFEST 18 Academy</span>
            </div>
            <div className="footer-links">
              <Link to="/" className="footer-link">Beranda</Link>
              <Link to="/products" className="footer-link">Produk</Link>
              <Link to="/login" className="footer-link">Masuk</Link>
              <Link to="/register" className="footer-link">Daftar</Link>
            </div>
            <p className="footer-copy">&copy; {new Date().getFullYear()} SEAPEDIA. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default FooterCTA;
