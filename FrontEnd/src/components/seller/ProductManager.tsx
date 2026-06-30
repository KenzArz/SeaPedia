import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Loader, Package, X, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { getProductImage } from '../../utils/imageHelper';
import '../../styles/ProductManager.css';

interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  image: string;
}

const EMPTY_FORM: FormState = { name: '', description: '', price: '', stock: '', image: '' };

const formatRupiah = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  let cls = 'pm-stock-badge--green';
  if (stock === 0) cls = 'pm-stock-badge--red';
  else if (stock <= 10) cls = 'pm-stock-badge--yellow';
  return <span className={`pm-stock-badge ${cls}`}>{stock}</span>;
};

interface ProductManagerProps {
  hasStore: boolean;
  onGoToStore: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ hasStore, onGoToStore }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStore) return;
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productService.getMyProducts();
        setProducts(res.data.data || []);
      } catch (err: any) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        setError('Gagal memuat daftar produk.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [hasStore]);

  const openAddPanel = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowPanel(true);
  };

  const openEditPanel = (product: ProductItem) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image || '',
    });
    setFormErrors({});
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditingProduct(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Nama produk minimal 2 karakter';
    if (!form.description.trim()) errs.description = 'Deskripsi wajib diisi';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Harga tidak boleh kosong atau negatif';
    if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Stok tidak boleh kosong atau negatif';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
    };
    try {
      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct._id, payload);
        const updated = res.data.data;
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p));
      } else {
        const res = await productService.createProduct(payload);
        const newProd = res.data.data;
        setProducts(prev => [newProd, ...prev]);
      }
      closePanel();
    } catch (err: any) {
      setFormErrors({ name: err.response?.data?.message || 'Gagal menyimpan produk' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setDeletingLoading(true);
    try {
      await productService.deleteProduct(id);
      setRemovingId(id);
      setTimeout(() => {
        setProducts(prev => prev.filter(p => p._id !== id));
        setRemovingId(null);
        setDeletingId(null);
      }, 350);
    } catch {
      setError('Gagal menghapus produk. Coba lagi.');
      setDeletingId(null);
    } finally {
      setDeletingLoading(false);
    }
  };

  if (!hasStore) {
    return (
      <div className="pm-no-store">
        <Package size={48} className="pm-no-store-icon" />
        <h3>Buat toko terlebih dahulu</h3>
        <p>Anda harus memiliki toko sebelum bisa menambah produk.</p>
        <button className="pm-go-store-btn" onClick={onGoToStore}>Buat Toko Sekarang</button>
      </div>
    );
  }

  return (
    <div className="pm-root">
      {/* Slide-in panel overlay */}
      {showPanel && <div className="pm-overlay" onClick={closePanel} />}

      {/* Slide-in form panel */}
      <div className={`pm-panel ${showPanel ? 'pm-panel--open' : ''}`}>
        <div className="pm-panel-header">
          <h3>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
          <button className="pm-panel-close" onClick={closePanel}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="pm-panel-form">
          <div className="pm-panel-field">
            <label className="pm-label">Nama Produk <span className="pm-required">*</span></label>
            <input
              className={`pm-input ${formErrors.name ? 'pm-input--error' : ''}`}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nama produk"
              maxLength={200}
              disabled={submitting}
            />
            {formErrors.name && <p className="pm-field-error"><AlertCircle size={12} />{formErrors.name}</p>}
          </div>

          <div className="pm-panel-field">
            <label className="pm-label">Deskripsi <span className="pm-required">*</span></label>
            <textarea
              className={`pm-textarea ${formErrors.description ? 'pm-input--error' : ''}`}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Deskripsi produk"
              rows={3}
              maxLength={2000}
              disabled={submitting}
            />
            {formErrors.description && <p className="pm-field-error"><AlertCircle size={12} />{formErrors.description}</p>}
          </div>

          <div className="pm-panel-field">
            <label className="pm-label">Harga (Rp) <span className="pm-required">*</span></label>
            <input
              className={`pm-input ${formErrors.price ? 'pm-input--error' : ''}`}
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0"
              min={0}
              disabled={submitting}
            />
            {form.price !== '' && !isNaN(Number(form.price)) && (
              <p className="pm-price-preview">{formatRupiah(form.price)}</p>
            )}
            {formErrors.price && <p className="pm-field-error"><AlertCircle size={12} />{formErrors.price}</p>}
          </div>

          <div className="pm-panel-field">
            <label className="pm-label">Stok <span className="pm-required">*</span></label>
            <input
              className={`pm-input ${formErrors.stock ? 'pm-input--error' : ''}`}
              type="number"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              placeholder="0"
              min={0}
              disabled={submitting}
            />
            {formErrors.stock && <p className="pm-field-error"><AlertCircle size={12} />{formErrors.stock}</p>}
          </div>

          <div className="pm-panel-field">
            <label className="pm-label">URL Gambar <span className="pm-optional">(opsional)</span></label>
            <input
              className="pm-input"
              type="text"
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
              disabled={submitting}
            />
            <div className="pm-img-preview">
              <img
                src={getProductImage(form.image || undefined, 0)}
                alt="preview"
                onError={e => { (e.target as HTMLImageElement).src = getProductImage(null, 0); }}
              />
            </div>
          </div>

          <div className="pm-panel-actions">
            <button type="submit" className="pm-btn-save" disabled={submitting}>
              {submitting ? <Loader size={14} className="pm-btn-spinner" /> : <Check size={14} />}
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" className="pm-btn-cancel-panel" onClick={closePanel} disabled={submitting}>
              Batal
            </button>
          </div>
        </form>
      </div>

      {/* Main Content */}
      <div className="pm-header">
        <h2 className="pm-title">Produk Saya</h2>
        <button className="pm-btn-add" onClick={openAddPanel}>
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {error && (
        <div className="pm-error-bar">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {loading ? (
        <div className="pm-loading">
          <Loader size={24} className="pm-spinner" />
          <p>Memuat produk...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="pm-empty">
          <Package size={48} />
          <p>Belum ada produk. Tambah produk pertama Anda!</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, idx) => (
                  <tr
                    key={prod._id}
                    className={`pm-row ${removingId === prod._id ? 'pm-row--removing' : ''}`}
                  >
                    <td>
                      <div className="pm-product-cell">
                        <img
                          src={getProductImage(prod.image, idx)}
                          alt={prod.name}
                          className="pm-thumb"
                          onError={e => { (e.target as HTMLImageElement).src = getProductImage(null, idx); }}
                        />
                        <span className="pm-product-name">{prod.name}</span>
                      </div>
                    </td>
                    <td className="pm-price">{formatRupiah(prod.price)}</td>
                    <td><StockBadge stock={prod.stock} /></td>
                    <td>
                      {deletingId === prod._id ? (
                        <div className="pm-delete-confirm">
                          <span>Hapus produk ini?</span>
                          <button
                            className="pm-btn-confirm-delete"
                            onClick={() => handleDeleteConfirm(prod._id)}
                            disabled={deletingLoading}
                          >
                            {deletingLoading ? <Loader size={12} /> : 'Ya, hapus'}
                          </button>
                          <button className="pm-btn-confirm-cancel" onClick={() => setDeletingId(null)} disabled={deletingLoading}>
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="pm-actions">
                          <button className="pm-btn-edit-row" onClick={() => openEditPanel(prod)}>
                            <Edit2 size={14} /> Edit
                          </button>
                          <button className="pm-btn-delete-row" onClick={() => setDeletingId(prod._id)}>
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="pm-mobile-list">
            {products.map((prod, idx) => (
              <div key={prod._id} className={`pm-mobile-card ${removingId === prod._id ? 'pm-row--removing' : ''}`}>
                <img src={getProductImage(prod.image, idx)} alt={prod.name} className="pm-mobile-img"
                  onError={e => { (e.target as HTMLImageElement).src = getProductImage(null, idx); }} />
                <div className="pm-mobile-info">
                  <p className="pm-mobile-name">{prod.name}</p>
                  <p className="pm-mobile-price">{formatRupiah(prod.price)}</p>
                  <div className="pm-mobile-footer">
                    <StockBadge stock={prod.stock} />
                    <div className="pm-actions">
                      <button className="pm-btn-edit-row" onClick={() => openEditPanel(prod)}><Edit2 size={12} /></button>
                      <button className="pm-btn-delete-row" onClick={() => setDeletingId(prod._id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {deletingId === prod._id && (
                    <div className="pm-delete-confirm pm-delete-confirm--mobile">
                      <span>Hapus produk ini?</span>
                      <button className="pm-btn-confirm-delete" onClick={() => handleDeleteConfirm(prod._id)} disabled={deletingLoading}>Ya, hapus</button>
                      <button className="pm-btn-confirm-cancel" onClick={() => setDeletingId(null)}>Batal</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductManager;
