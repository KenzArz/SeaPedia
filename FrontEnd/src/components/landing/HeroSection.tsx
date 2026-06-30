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
            <span>Platform E-Commerce #1 Indonesia — COMPFEST 18</span>
          </div>

          <h1 className="hero-headline anim-fade-up-d1">
            Belanja yang&nbsp;
            <span className="hero-headline-accent">Mudah</span>
            &nbsp;&amp;&nbsp;
            <span className="hero-headline-accent">Terpercaya</span>
          </h1>

          <p className="hero-body anim-fade-up-d2">
            SEAPEDIA menghubungkan penjual, pembeli, dan kurir dalam satu ekosistem digital yang
            transparan — temukan produk terbaik dari ribuan toko terpercaya.
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
            <span className="trust-chip"><ShieldCheck size={14} /> Transaksi Aman</span>
            <span className="trust-chip"><Zap size={14} /> Pengiriman Cepat</span>
            <span className="trust-chip"><Users size={14} /> 3 Peran Dalam 1</span>
          </div>
        </div>

        <div className="hero-visual-col anim-fade anim-fade-up-d2">
          <div className="hero-img-card">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=700&fit=crop&auto=format"
              alt="Belanja online mudah di SEAPEDIA"
              className="hero-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=700&fit=crop&auto=format';
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
