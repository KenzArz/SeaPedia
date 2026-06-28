import { db } from '../db.js';

export const verifyProductOwner = async (req, res, next) => {
  try {
    const product = await db.Product.findById(req.params.id);

    if (!product || product.isActive === false) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const ownerId = product.owner._id || product.owner;
    // Bandingkan owner produk dengan user yang sedang login
    if (ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Kamu bukan pemilik produk ini.'
      });
    }

    // Simpan produk di req agar controller tidak perlu query ulang
    req.product = product;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
