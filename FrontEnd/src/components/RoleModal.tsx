import React from 'react';
import { Shield, ShoppingBag, Store, Truck } from 'lucide-react';
import Button from './Button';

interface RoleModalProps {
  isOpen: boolean;
  onClose?: () => void;
  roles: string[];
  currentRole: string;
  onSelectRole: (role: string) => void;
  preventClose?: boolean;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  roles,
  currentRole,
  onSelectRole,
  preventClose = false
}) => {
  if (!isOpen) return null;

  const roleMeta = {
    Admin: {
      label: 'Admin',
      description: 'Pantau pasar, kelola promo, dan tindak lanjuti keterlambatan.',
      icon: Shield,
      color: 'role-admin'
    },
    Buyer: {
      label: 'Pembeli (Buyer)',
      description: 'Temukan produk unik, isi saldo dompet, dan mulailah checkout.',
      icon: ShoppingBag,
      color: 'role-buyer'
    },
    Seller: {
      label: 'Penjual (Seller)',
      description: 'Buka toko unik Anda, tambahkan produk menarik, dan proses pesanan.',
      icon: Store,
      color: 'role-seller'
    },
    Driver: {
      label: 'Kurir (Driver)',
      description: 'Cari pekerjaan pengiriman, selesaikan antar barang, dan raih pendapatan.',
      icon: Truck,
      color: 'role-driver'
    }
  };

  const handleBackdropClick = () => {
    if (!preventClose && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          <h2>Pilih Peran Aktif Anda</h2>
          <p className="modal-sub">
            Silakan pilih peran yang ingin Anda gunakan untuk sesi belanja atau manajemen saat ini.
          </p>
        </div>

        <div className="role-options-grid">
          {roles.map((role) => {
            const meta = roleMeta[role as keyof typeof roleMeta] || {
              label: role,
              description: 'Kelola aktivitas Anda dengan peran ini.',
              icon: ShoppingBag,
              color: 'role-buyer'
            };
            const IconComponent = meta.icon;
            const isActive = currentRole === role;

            return (
              <div
                key={role}
                className={`role-option-card ${meta.color} ${isActive ? 'active-role-card' : ''}`}
                onClick={() => onSelectRole(role)}
              >
                <div className="role-icon-wrapper">
                  <IconComponent size={28} />
                </div>
                <div className="role-text-wrapper">
                  <h4>{meta.label}</h4>
                  <p>{meta.description}</p>
                </div>
                {isActive && <span className="active-badge">Aktif</span>}
              </div>
            );
          })}
        </div>

        {!preventClose && onClose && (
          <div className="modal-footer">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleModal;
