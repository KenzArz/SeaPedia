import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvatarFallback from '../components/AvatarFallback';
import '../styles/RoleDashboard.css';

const DRIVER_COLOR = 'var(--driver-color)';
const DRIVER_LIGHT = 'var(--driver-light)';

interface DriverLayoutProps {
  children: React.ReactNode;
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const roleStyle = {
    '--rdl-color': DRIVER_COLOR,
    '--rdl-light': DRIVER_LIGHT,
  } as React.CSSProperties;

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="rdl-layout" style={roleStyle}>

      <aside className="rdl-sidebar">
        <div className="rdl-user-block">
          <div className="rdl-user-row">
            <AvatarFallback name={user?.username} size={38} />
            <div>
              <div className="rdl-username">{user?.username}</div>
              <span
                className="rdl-role-badge"
                style={{ background: DRIVER_LIGHT, color: DRIVER_COLOR }}
              >
                Pengemudi
              </span>
            </div>
          </div>
        </div>

        <nav className="rdl-nav">
          <Link
            to="/dashboard/driver"
            className={`rdl-nav-item${isActive('/dashboard/driver') ? ' rdl-nav-item--active' : ''}`}
          >
            <LayoutDashboard size={16} className="rdl-nav-icon" />
            Dashboard
          </Link>
        </nav>

        <div className="rdl-sidebar-footer">
          <div className="rdl-nav-divider" />
          <Link to="/account" className="rdl-nav-item rdl-nav-item--back">
            <ArrowLeft size={14} className="rdl-nav-icon" />
            Kembali ke Akun Saya
          </Link>
          <button className="rdl-nav-item rdl-nav-item--logout" onClick={handleLogout}>
            <LogOut size={16} className="rdl-nav-icon" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="rdl-content">{children}</main>

      <nav className="rdl-bottom-nav" style={roleStyle}>
        <Link to="/dashboard/driver" className={`rdl-bottom-nav-item${isActive('/dashboard/driver') ? ' rdl-bottom-nav-item--active' : ''}`}>
          <LayoutDashboard size={20} /><span>Dasbor</span>
        </Link>
        <Link to="/account" className="rdl-bottom-nav-item">
          <ArrowLeft size={20} /><span>Akun</span>
        </Link>
        <button className="rdl-bottom-nav-item" onClick={handleLogout}>
          <LogOut size={20} /><span>Keluar</span>
        </button>
      </nav>
    </div>
  );
};

export default DriverLayout;
