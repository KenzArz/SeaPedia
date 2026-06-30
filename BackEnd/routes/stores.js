import express from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const handleErrors = (err, res) => {
  console.error(err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'name';
    const message = field === 'owner' 
      ? 'Akun Anda sudah terdaftar memiliki toko.' 
      : 'Nama toko tersebut sudah digunakan. Silakan pilih nama lain.';
    return res.status(409).json({
      success: false,
      message
    });
  }
  if (err.message && (err.message.includes('Nama toko sudah digunakan') || err.message.includes('Kamu sudah memiliki toko'))) {
    return res.status(409).json({
      success: false,
      message: err.message
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: err.message
  });
};

router.post('/', authMiddleware, requireRole('Seller'), async (req, res) => {
  const { name, description, businessType, storePhoto } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama toko wajib diisi' });
  }

  try {
    const existingStore = await db.Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(409).json({ success: false, message: 'Kamu sudah memiliki toko' });
    }

    const nameTaken = await db.Store.findOne({ name: name.trim() });
    if (nameTaken) {
      return res.status(409).json({ success: false, message: 'Nama toko sudah digunakan' });
    }

    const newStore = await db.Store.create({
      name: name.trim(),
      description:  description   ? description.trim()   : '',
      businessType: businessType  ? businessType.trim()  : '',
      storePhoto:   storePhoto    ? storePhoto           : '',
      owner: req.user.id
    });

    return res.status(201).json({ success: true, message: 'Toko berhasil dibuat', data: newStore });
  } catch (err) {
    return handleErrors(err, res);
  }
});

router.get('/my-store', authMiddleware, requireRole('Seller'), async (req, res) => {
  try {
    const store = await db.Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Kamu belum memiliki toko'
      });
    }

    const productCount = await db.Product.countDocuments({
      store: store._id || store.id,
      isActive: true
    });

    // Normalise: .lean() in db.js always returns a plain object now
    const plain = store;

    return res.status(200).json({
      success: true,
      message: 'Informasi toko berhasil diambil',
      data: {
        _id:          plain._id,
        name:         plain.name         ?? '',
        description:  plain.description  ?? '',
        businessType: plain.businessType ?? '',
        storePhoto:   plain.storePhoto   ?? '',
        createdAt:    plain.createdAt,
        productCount,
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi toko',
      error: err.message
    });
  }
});

router.put('/my-store', authMiddleware, requireRole('Seller'), async (req, res) => {
  const { name, description, businessType, storePhoto } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama toko wajib diisi' });
  }

  // Validate storePhoto format if provided
  if (storePhoto !== undefined && storePhoto !== '') {
    const isDataUri = typeof storePhoto === 'string' && storePhoto.startsWith('data:image/');
    const isHttpUrl = typeof storePhoto === 'string' && (storePhoto.startsWith('http://') || storePhoto.startsWith('https://'));
    if (!isDataUri && !isHttpUrl) {
      return res.status(400).json({ success: false, message: 'Format foto toko tidak valid' });
    }
    if (storePhoto.length > 7 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Ukuran foto terlalu besar (maks 5 MB)' });
    }
  }

  try {
    const store = await db.Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
    }

    // Only check name uniqueness if the name actually changed
    if (name.trim() !== store.name) {
      const nameTaken = await db.Store.findOne({ name: name.trim() });
      if (nameTaken) {
        return res.status(409).json({ success: false, message: 'Nama toko sudah digunakan' });
      }
    }

    // Build update patch — only overwrite fields that were explicitly sent
    const patch = {
      name: name.trim(),
      // Keep existing value if not sent; empty string clears it explicitly
      description:  description  !== undefined ? description.trim()  : (store.description  ?? ''),
      businessType: businessType !== undefined ? businessType.trim() : (store.businessType ?? ''),
    };
    if (storePhoto !== undefined) {
      patch.storePhoto = storePhoto;
    }

    const updatedStore = await db.Store.findOneAndUpdate(
      { owner: req.user.id },
      patch,
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
    }

    const plain = typeof updatedStore.toObject === 'function' ? updatedStore.toObject() : updatedStore;
    const productCount = await db.Product.countDocuments({
      store: plain._id || plain.id,
      isActive: true
    });

    return res.status(200).json({
      success: true,
      message: 'Toko berhasil diperbarui',
      data: {
        _id:          plain._id,
        name:         plain.name         ?? '',
        description:  plain.description  ?? '',
        businessType: plain.businessType ?? '',
        storePhoto:   plain.storePhoto   ?? '',
        createdAt:    plain.createdAt,
        productCount,
      }
    });
  } catch (err) {
    return handleErrors(err, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const store = await db.Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan'
      });
    }

    const productCount = await db.Product.countDocuments({ store: store._id || store.id, isActive: true });

    return res.status(200).json({
      success: true,
      message: 'Informasi toko berhasil diambil',
      data: {
        ...store,
        productCount
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi toko',
      error: err.message
    });
  }
});

export default router;
