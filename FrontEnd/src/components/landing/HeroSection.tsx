import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import "../../styles/HeroSection.css";

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-grid-bg" aria-hidden />

      <div className="hero-inner">
        <div className="hero-text-col">
          <div className="hero-eyebrow anim-fade-up">
            <span className="hero-eyebrow-dot" />
            <span>Platform Bahari #1 Indonesia — COMPFEST 18</span>
          </div>

          <h1 className="hero-headline anim-fade-up-d1">
            Pasar Laut yang&nbsp;
            <span className="hero-headline-accent">Jujur</span>
            &nbsp;&amp;&nbsp;
            <span className="hero-headline-accent">Segar</span>
          </h1>

          <p className="hero-body anim-fade-up-d2">
            SEAPEDIA menghubungkan nelayan, pembeli, dan kurir dalam satu ekosistem digital yang
            transparan — dari tambak langsung ke meja makan Anda.
          </p>

          <div className="hero-actions anim-fade-up-d3">
            <Link to="/register" className="btn-hero-primary">
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn-hero-secondary">
              Jelajahi Produk
            </Link>
          </div>

          <div className="hero-trust anim-fade-up-d4">
            <span className="trust-chip"><ShieldCheck size={14} /> Garansi Segar</span>
            <span className="trust-chip"><Zap size={14} /> Pengiriman Eksprès</span>
            <span className="trust-chip"><Users size={14} /> 3 Peran Dalam 1</span>
          </div>
        </div>

        <div className="hero-visual-col anim-fade anim-fade-up-d2">
          <div className="hero-img-card">
            <img
              src="https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&h=700&fit=crop&auto=format"
              alt="Produk ikan segar SEAPEDIA"
              className="hero-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&h=700&fit=crop&auto=format';
              }}
            />
            <div className="hero-badge hero-badge-tl">
              <span className="badge-num">500+</span>
              <span className="badge-label">Produk Aktif</span>
            </div>
            <div className="hero-badge hero-badge-br">
              <span className="badge-num">98%</span>
              <span className="badge-label">Kepuasan Pembeli</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
