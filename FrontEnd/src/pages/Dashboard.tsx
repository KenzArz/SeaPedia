import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Store, Truck, Shield,
  Wallet, ClipboardList, MapPin, Package, Tag, BarChart3,
  ChevronRight, RefreshCw, LogOut, Home, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import "../styles/Dashboard.css";

const roleConfig = {
  Admin: { color: 'var(--admin-color)', light: 'var(--admin-light)', icon: Shield, label: 'Administrator' },
  Buyer: { color: 'var(--buyer-color)', light: 'var(--buyer-light)', icon: ShoppingBag, label: 'Pembeli (Buyer)' },
  Seller: { color: 'var(--seller-color)', light: 'var(--seller-light)', icon: Store, label: 'Penjual (Seller)' },
  Driver: { color: 'var(--driver-color)', light: 'var(--driver-light)', icon: Truck, label: 'Kurir (Driver)' },
};

interface ShellItem {
  icon: React.FC<any>;
  title: string;
  desc: string;
  badge: string;
}

const dashboardItems: Record<string, ShellItem[]> = {
  Buyer: [
    { icon: Wallet, title: 'Wallet & Saldo', desc: 'Lihat saldo dompet, lakukan top-up, dan riwayat transaksi', badge: 'Level 3' },
    { icon: ShoppingBag, title: 'Keranjang Belanja', desc: 'Kelola item yang ingin Anda beli dari satu toko', badge: 'Level 3' },
    { icon: ClipboardList, title: 'Riwayat Pesanan', desc: 'Pantau status semua pesanan yang pernah Anda buat', badge: 'Level 3' },
    { icon: MapPin, title: 'Alamat Pengiriman', desc: 'Simpan dan kelola alamat tujuan pengiriman Anda', badge: 'Level 3' },
  ],
  Seller: [
    { icon: Store, title: 'Kelola Toko', desc: 'Buat nama toko unik dan kelola profil lapak Anda', badge: 'Level 2' },
    { icon: Package, title: 'Manajemen Produk', desc: 'Tambah, edit, dan hapus produk di katalog toko Anda', badge: 'Level 2' },
    { icon: ClipboardList, title: 'Pesanan Masuk', desc: 'Lihat dan proses pesanan pembeli di toko Anda', badge: 'Level 4' },
    { icon: Wallet, title: 'Pendapatan Toko', desc: 'Monitor pendapatan dan laporan keuangan toko Anda', badge: 'Level 4' },
  ],
  Driver: [
    { icon: Truck, title: 'Cari Pekerjaan', desc: 'Temukan dan klaim pesanan pengiriman yang tersedia', badge: 'Level 5' },
    { icon: MapPin, title: 'Rute Pengiriman', desc: 'Navigasi dan konfirmasi pengantaran produk bahari', badge: 'Level 5' },
    { icon: Wallet, title: 'Pendapatan Driver', desc: 'Pantau penghasilan per ritase pengiriman', badge: 'Level 5' },
    { icon: ClipboardList, title: 'Riwayat Perjalanan', desc: 'Lihat semua pekerjaan pengiriman yang pernah Anda selesaikan', badge: 'Level 5' },
  ],
  Admin: [
    { icon: BarChart3, title: 'Monitoring Pasar', desc: 'Pantau seluruh transaksi dan aktivitas marketplace', badge: 'Level 6' },
    { icon: Tag, title: 'Manajemen Diskon', desc: 'Kelola voucher dan promo belanja platform', badge: 'Level 6' },
    { icon: AlertTriangle, title: 'Penanganan Keterlambatan', desc: 'Tindak lanjuti pesanan yang melewati SLA pengiriman', badge: 'Level 6' },
    { icon: Shield, title: 'Kontrol Keamanan', desc: 'Audit akses dan keamanan API platform', badge: 'Level 7' },
  ],
};

export const Dashboard: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');

  if (!user) {
    return (
      <div className="dash-not-auth">
        <AlertTriangle size={52} />
        <h2>Akses Ditolak</h2>
        <p>Silakan masuk untuk mengakses halaman dashboard Anda.</p>
        <Link to="/login" className="btn-dash-auth-redirect">Masuk Sekarang</Link>
      </div>
    );
  }

  const config = roleConfig[user.activeRole as keyof typeof roleConfig] || roleConfig.Buyer;
  const RoleIcon = config.icon;
  const items = dashboardItems[user.activeRole] || dashboardItems.Buyer;

  const handleRoleSwitch = async (role: string) => {
    try {
      await switchRole(role);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-inner">
          <Link to="/" className="dash-brand">🌊 SEAPEDIA</Link>

          <div className="dash-user-block">
            <div 
              className="dash-user-avatar" 
              style={{
                backgroundColor: config.light,
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
                border: `1.5px solid ${config.color}20`
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="dash-user-info">
              <span className="dash-username">{user.username}</span>
              <span className="dash-role-badge" style={{ backgroundColor: config.light, color: config.color }}>
                {config.label}
              </span>
            </div>
          </div>

          <nav className="dash-nav">
            <button
              className={`dash-nav-item ${activeNav === 'dashboard' ? 'dash-nav-item--active' : ''}`}
              onClick={() => setActiveNav('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <Link to="/" className="dash-nav-item">
              <Home size={18} />
              <span>Beranda</span>
            </Link>
            <Link to="/products" className="dash-nav-item">
              <Package size={18} />
              <span>Produk</span>
            </Link>
          </nav>

          {user.roles.length > 1 && (
            <div className="dash-role-switcher">
              <p className="dash-switcher-label">Ganti Peran Aktif</p>
              {user.roles.map(role => {
                const rc = roleConfig[role as keyof typeof roleConfig];
                if (!rc) return null;
                const Ic = rc.icon;
                return (
                  <button
                    key={role}
                    className={`dash-role-switch-btn ${user.activeRole === role ? 'dash-role-switch-btn--active' : ''}`}
                    style={user.activeRole === role
                      ? { backgroundColor: rc.light, color: rc.color, borderColor: rc.color }
                      : {}
                    }
                    onClick={() => handleRoleSwitch(role)}
                  >
                    <Ic size={15} />
                    <span>{rc.label}</span>
                    {user.activeRole === role && <span className="dash-active-dot" style={{ backgroundColor: rc.color }} />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="dash-sidebar-footer">
            <button className="dash-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <h1 className="dash-topbar-title">Dashboard</h1>
            <span className="dash-topbar-sub">Selamat datang kembali, {user.username}!</span>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-active-role-pill" style={{ backgroundColor: config.light, color: config.color }}>
              <RoleIcon size={14} />
              <span>{config.label}</span>
            </div>
            {user.roles.length > 1 && (
              <button
                className="dash-topbar-switch-btn"
                onClick={() => handleRoleSwitch(
                  user.roles[(user.roles.indexOf(user.activeRole) + 1) % user.roles.length]
                )}
              >
                <RefreshCw size={14} />
                <span>Ganti Peran</span>
              </button>
            )}
          </div>
        </div>

        <div
          className="dash-welcome-banner"
          style={{ background: `linear-gradient(135deg, ${config.light} 0%, var(--bg-card) 100%)`, borderColor: `${config.color}25` }}
        >
          <div className="dash-welcome-icon" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
            <RoleIcon size={26} />
          </div>
          <div className="dash-welcome-text">
            <h2>Dashboard Peran: <span style={{ color: config.color }}>{config.label}</span></h2>
            <p>Fitur di bawah ini telah dikonfigurasi untuk akun Anda dan akan aktif sesuai timeline rilis fitur SEAPEDIA.</p>
          </div>
        </div>

        <div className="dash-shell-grid">
          {items.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div key={idx} className="dash-shell-card">
                <div className="dash-shell-card-icon" style={{ backgroundColor: config.light, color: config.color }}>
                  <ItemIcon size={20} />
                </div>
                <div className="dash-shell-card-content">
                  <div className="dash-shell-card-header">
                    <h4 className="dash-shell-card-title">{item.title}</h4>
                    <span className="dash-level-badge">{item.badge}</span>
                  </div>
                  <p className="dash-shell-card-desc">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="dash-shell-chevron" />
              </div>
            );
          })}
        </div>

        <div className="dash-financial-row">
          <Card title="Ringkasan Keuangan Platform" className="dash-financial-card">
            <div className="dash-fin-items">
              <div className="dash-fin-item">
                <span className="dash-fin-label"><ShoppingBag size={13} /> Saldo Pembeli</span>
                <span className="dash-fin-val">Rp 0</span>
              </div>
              <div className="dash-fin-item">
                <span className="dash-fin-label"><Store size={13} /> Pendapatan Toko</span>
                <span className="dash-fin-val">Rp 0</span>
              </div>
              <div className="dash-fin-item">
                <span className="dash-fin-label"><Truck size={13} /> Pendapatan Kurir</span>
                <span className="dash-fin-val">Rp 0</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <nav className="dash-bottom-nav">
        <button
          className={`dash-bottom-nav-item ${activeNav === 'dashboard' ? 'dash-bottom-nav-item--active' : ''}`}
          style={activeNav === 'dashboard' ? { color: config.color } : {}}
          onClick={() => setActiveNav('dashboard')}
        >
          <LayoutDashboard size={22} />
          <span>Dashboard</span>
        </button>
        <Link to="/products" className="dash-bottom-nav-item">
          <Package size={22} />
          <span>Produk</span>
        </Link>
        <Link to="/" className="dash-bottom-nav-item">
          <Home size={22} />
          <span>Beranda</span>
        </Link>
        <button className="dash-bottom-nav-item" onClick={handleLogout}>
          <LogOut size={22} />
          <span>Keluar</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
